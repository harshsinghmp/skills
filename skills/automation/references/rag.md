# rag — RAG: retrieval + grounded generation with citations and evaluation.

## Intake

- Corpus: sources, formats, update frequency
- Query types the system must answer
- Retrieval stack (vector store, embedding model, chunking)
- Accuracy bar and citation requirements
- Default stack: schedule/ingest orchestration via self-hosted n8n where it fits (or current platform).

## Deliverable

A RAG pipeline: ingestion + chunking, embeddings in a vector store, hybrid retrieval, a grounded generation prompt with citations, and a retrieval/generation evaluation harness.

## Procedure

1. Ingest and normalize sources; strip boilerplate; keep source metadata for citations.
2. Chunk with overlap sized to the content and query type; store metadata per chunk.
3. Embed and index in a vector store; add keyword/hybrid search for exact terms.
4. Retrieve top-k with re-ranking; pass only relevant context to the model.
5. Prompt for grounded answers with citations; refuse when context is insufficient.
6. Evaluate retrieval recall/precision and generation faithfulness on a question set.
7. Automate re-ingestion so the index stays fresh.

## Quality gate

- [ ] Corpus normalized with citation metadata.
- [ ] Chunking sized to content/query type.
- [ ] Hybrid retrieval (vector + keyword) where exact terms matter.
- [ ] Answers cite sources and refuse when ungrounded.
- [ ] Retrieval and generation evaluated separately.
- [ ] Re-ingestion automated for freshness.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
