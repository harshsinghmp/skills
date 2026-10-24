# vector-search — Embeddings, ANN index choice, payload filters, hybrid FTS+vector, RAG chunks.

Default stack: Qdrant as the dedicated vector store (named for user's stack), with `pgvector` as the in-Postgres fallback when you already live in Postgres and volume is modest. Defaults: HNSW index, cosine for normalized embeddings, payload filters applied as prefilter scalar conditions, exact search (`SearchParams.exact = true`) for upfront recall verification. Tool-independent — the mechanisms are the same in any vector engine; names differ only in syntax.

## Intake

- Corpus + query intent: dense embeddings (semantic) only, or hybrid (semantic + keyword/FTS)?
- Volume and recall target: index type, and whether recalls are verified on a labeled sample.
- Filter needs: per-user/tenant scoping, knobs that must narrow results BEFORE similarity.

## Deliverable

A search-index plan: embedding source and chunking rule, ANN index type with a recall check, payload filter schema, and hybrid scoring (RRF or weighted sum) — plus the round-trip SQL/query that returns top-k with filters and scores.

## Procedure

1. Choose storage — dedicate or embed:
   - Dedicated store (Default-stack Qdrant): collection per namespace; own scaling, payload filters, hybrid out of the box. Reaches for this when semantic search is a core feature at scale.
   - In-Postgres (`pgvector`): fine under a few million rows, keeps one engine; route here when you already own Postgres. Deeper pgvector basics live in `operate`.
2. Pick the ANN index from workload, not fashion:
   - **HNSW** (default): fast queries, higher build cost, good under high query load; multiprobe (= `ef_search`) tunes recall vs speed.
   - **IVF**: lower recall per accuracy spent but cheaper builds; train on a representative sample before load, aim `nlist ≈ 4×sqrt(n)` buckets.
   - Verify recall on a labeled set (for pgvector: `SET hnsw.exact_search = on` / `ivfflat.probes`) before shipping — an ANN index is an approximation; know its real error rate.
3. Store vectors and metadata separately — payload lives beside the vector, indexed independently:
   - Embedding: fixed-dim, normalized (cosine) float array.
   - Payload fields you filter on get their own scalar index (Qdrant payload index; Postgres btree/GIN on metadata jsonb). Never filter on an unindexed payload field in a hot path.
   - Filters apply as a **prefilter** (scalar first, then ANN), not by post-filtering a global ANN result — post-filtering silently loses top matches per tenant.
   - Quantization memory trade-off matrix:
     - **Scalar Quantization (SQ)** (default for RAM saving): 4x RAM reduction, ~99% recall retention, fast on-the-fly dequantization.
     - **Product Quantization (PQ)**: up to 16x RAM reduction; best for massive 10M+ collections where slight recall drops (~92–95%) are acceptable.
     - **Binary Quantization (BQ)**: up to 32x RAM reduction with oversampling (`oversampling: 2.0–3.0`) for fast binary Hamming distance lookups on compliant embeddings (e.g. OpenAI large / Cohere).
4. Atomic model migration & alias swap protocol (zero-downtime re-embedding):
   - Always route application traffic to an abstract alias (`collection_alias`), never raw collection names.
   - Create new collection with new embedding dimension/distance: `new_collection_v2`.
   - Ingest & build index in background: stream vectors into `new_collection_v2` without impacting live queries.
   - Atomic swap: execute `update_collection_aliases` (drop alias from v1, add to v2 in a single atomic transaction).
   - Delete old `collection_v1` only after verifying query health on v2.
5. Nail down hybrid search when keyword precision + semantic recall both matter (product search, support docs):
   - Run FTS/keyword + vector search as two recall paths and merge.
   - **RRF** (default): `score = Σ 1/(k + rank_i)` with `k ≈ 60` — rank-based, no score-normalization tuning.
   - Or weighted sum when scores are comparable; normalize both to [0,1] first. Tune weights on a labeled eval set, not vibes.
   - FTS pipeline: `to_tsvector`/`config` per language, `ts_rank`/`plainto_tsquery`; index with GIN (`operate`/`index` covers the btree side).
5. Chunk for RAG deliberately — chunking beats model choice at small corpus sizes:
   - Chunk by semantic boundary (headers, markdown blocks) not fixed character counts; 256–512 tokens is a sane default for embedding retrieval.
   - Overlap 10–20% at boundaries so context isn't split mid-meaning.
   - Keep chunk source + sequence metadata in the payload (document_id, chunk_index, section) so results can be stitched and cited.
6. Run and verify:
   - Confirm prefilter is applied before ANN (look at the filter-bypass / exact counts).
   - Sample recall on a labeled query set; widen HNSW `ef_search` (or Qdrant `search_params.hnsw_ef`) only where measured recall drops.

## Quality gate

- [ ] Index type justified from workload + volume, with a measured recall number — not assumed.
- [ ] Filters are prefilters backed by payload/scalar indexes; no post-filtering of ANN results.
- [ ] Hybrid path states the merge rule (RRF or weighted) and how weights were tuned.
- [ ] Chunk rule named (boundary-based, overlap, token budget) and metadata carried for stitching.
- [ ] Exact vs ANN path exists for upfront verification (SearchParams.exact / hnsw.exact_search).

## Routing

- Embedding generation/model selection (which embedder) → link out to vector provider docs; this mode owns the index + retrieval shape only.
- Pure in-Postgres basics → `operate` (pgvector HNSW starter).
- Application wiring (endpoint, cache) → `webdev`; deploying a vector cluster → `devops`.
- Dim/model change → re-embed + rebuild index (note the write cost, mirror `index`'s CONCURRENTLY discipline).

## Sources

- Qdrant docs: filters, payload indexing, hybrid search, HNSW/IVF parameters.
- Postgres docs + Supabase guides: pgvector indexing, hybrid full-text + vector search.
- When a cited source conflicts with a default above, the source wins — record the override and why.