#!/usr/bin/env bun
/**
 * cognitive-graph.ts: Bi-Directional Cognitive Knowledge Graph & Temporal Triples Engine
 *
 * Implements GRP-001 through GRP-004:
 *   - GRP-001: SPO Triples Extraction (Subject-Predicate-Object semantic parsing)
 *   - GRP-002: Temporal Validity & Supersession Traversal (skips expired or superseded edges)
 *   - GRP-003: Sub-10ms Graph Traversal (bi-directional in-memory adjacency list index)
 *   - GRP-004: Context Vault Fencing (strict tenant boundary isolation)
 *
 * Usage:
 *   bun cognitive-graph.ts --query "auth" [--tenant <id>] [--depth 2] [--json]
 *   bun cognitive-graph.ts --ingest <triples.json> [--tenant <id>] [--json]
 *   bun cognitive-graph.ts --supersede <old-id> --with <new-id> [--json]
 */

import fs from "node:fs";
import { parseArgs } from "node:util";

// =========================================================================
// Interfaces & Types
// =========================================================================

export interface GraphTriple {
  id: string;
  subject: string;
  predicate: string; // e.g. "DEPENDS_ON", "SUPERSEDES", "MIGRATED_TO", "STORES", "CONFIGURES"
  object: string;
  confidence: number; // 0.0 - 1.0
  tenantId: string;
  createdAt: string;
  validUntil?: string;
  supersededBy?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphStore {
  version: number;
  triples: GraphTriple[];
}

export interface TraversalNode {
  name: string;
  depth: number;
  tenantId: string;
}

export interface TraversalEdge {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  isSuperseded: boolean;
}

export interface GraphQueryResult {
  queryEntity: string;
  tenantId: string;
  traversalDepth: number;
  reachableNodes: TraversalNode[];
  edges: TraversalEdge[];
  executionTimeMs: number;
  isFenced: boolean;
  summary: string;
}

// =========================================================================
// GRP-001 & GRP-003: Cognitive Knowledge Graph Index & Traversal
// =========================================================================

export class CognitiveGraphEngine {
  private triples: Map<string, GraphTriple> = new Map();
  private forwardIndex: Map<string, Set<string>> = new Map(); // subject -> Set of triple ids
  private reverseIndex: Map<string, Set<string>> = new Map(); // object -> Set of triple ids

  constructor(initialTriples: GraphTriple[] = []) {
    for (const t of initialTriples) {
      this.addTriple(t);
    }
  }

  public addTriple(triple: GraphTriple): void {
    this.triples.set(triple.id, triple);

    // Index forward
    const subKey = `${triple.tenantId}::${triple.subject.toLowerCase()}`;
    if (!this.forwardIndex.has(subKey)) {
      this.forwardIndex.set(subKey, new Set());
    }
    this.forwardIndex.get(subKey)?.add(triple.id);

    // Index reverse
    const objKey = `${triple.tenantId}::${triple.object.toLowerCase()}`;
    if (!this.reverseIndex.has(objKey)) {
      this.reverseIndex.set(objKey, new Set());
    }
    this.reverseIndex.get(objKey)?.add(triple.id);
  }

  // GRP-002: Mark triple superseded
  public supersedeTriple(oldId: string, newId: string): boolean {
    const triple = this.triples.get(oldId);
    if (!triple) return false;
    triple.supersededBy = newId;
    return true;
  }

  // GRP-002, GRP-003, GRP-004: Fenced, Temporal Traversal
  public traverse(entity: string, tenantId: string, maxDepth = 2, includeSuperseded = false): GraphQueryResult {
    const startTime = performance.now();
    const normalizedEntity = entity.toLowerCase();

    const visitedNodes = new Set<string>();
    const reachableNodes: TraversalNode[] = [];
    const collectedEdges: TraversalEdge[] = [];
    const queue: Array<{ name: string; depth: number }> = [{ name: normalizedEntity, depth: 0 }];

    visitedNodes.add(normalizedEntity);
    reachableNodes.push({ name: entity, depth: 0, tenantId });
    const visitedEdgeIds = new Set<string>();

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const { name, depth } = item;
      if (depth >= maxDepth) continue;

      const subKey = `${tenantId}::${name}`;
      const objKey = `${tenantId}::${name}`;

      const connectedTripleIds = new Set<string>([
        ...(this.forwardIndex.get(subKey) || []),
        ...(this.reverseIndex.get(objKey) || []),
      ]);

      for (const tId of connectedTripleIds) {
        const triple = this.triples.get(tId);
        if (!triple) continue;
        if (visitedEdgeIds.has(triple.id)) continue;

        // GRP-004: Strict tenant fencing
        if (triple.tenantId !== tenantId) continue;

        // GRP-002: Temporal validity & supersession check
        const isExpired = triple.validUntil ? new Date(triple.validUntil) < new Date() : false;
        const isSuperseded = Boolean(triple.supersededBy) || isExpired;

        if (isSuperseded && !includeSuperseded) {
          continue;
        }

        visitedEdgeIds.add(triple.id);
        collectedEdges.push({
          id: triple.id,
          subject: triple.subject,
          predicate: triple.predicate,
          object: triple.object,
          isSuperseded,
        });

        const neighbor =
          triple.subject.toLowerCase() === name ? triple.object.toLowerCase() : triple.subject.toLowerCase();
        const displayNeighbor = triple.subject.toLowerCase() === name ? triple.object : triple.subject;

        if (!visitedNodes.has(neighbor)) {
          visitedNodes.add(neighbor);
          reachableNodes.push({ name: displayNeighbor, depth: depth + 1, tenantId });
          queue.push({ name: neighbor, depth: depth + 1 });
        }
      }
    }

    const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

    const summary = `Found ${reachableNodes.length} reachable node(s) and ${collectedEdges.length} active edge(s) for '${entity}' at depth ${maxDepth} (tenant: ${tenantId}) in ${executionTimeMs}ms.`;

    return {
      queryEntity: entity,
      tenantId,
      traversalDepth: maxDepth,
      reachableNodes,
      edges: collectedEdges,
      executionTimeMs,
      isFenced: true,
      summary,
    };
  }

  public getAllTriples(): GraphTriple[] {
    return Array.from(this.triples.values());
  }
}

// =========================================================================
// GRP-001: Natural Language / Markdown Triples Parser
// =========================================================================

export function extractTriplesFromText(text: string, tenantId = "default-tenant"): GraphTriple[] {
  const triples: GraphTriple[] = [];
  const lines = text.split("\n");

  // Recognize patterns:
  // 1. [EntityA] -[PREDICATE]-> [EntityB]
  // 2. EntityA relies on / depends on / uses / connects to EntityB
  // 3. Structured markdown bullet: - (Subject) [PREDICATE] (Object)
  const bracketRegex = /\[([^\]]+)\]\s*-+\[([^\]]+)\]->\s*\[([^\]]+)\]/i;
  const parenRegex = /\(([^)]+)\)\s*-\[([^\]]+)\]->\s*\(([^)]+)\)/i;
  const naturalRegex = /([A-Za-z0-9_-]+)\s+(depends on|relies on|uses|migrated to|supersedes)\s+([A-Za-z0-9_-]+)/i;

  let index = 1;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let match = bracketRegex.exec(trimmed);
    if (match) {
      triples.push({
        id: `TRP-${tenantId.toUpperCase()}-${Date.now().toString(36)}-${index++}`,
        subject: match[1].trim(),
        predicate: match[2].trim().toUpperCase(),
        object: match[3].trim(),
        confidence: 0.95,
        tenantId,
        createdAt: new Date().toISOString(),
      });
      continue;
    }

    match = parenRegex.exec(trimmed);
    if (match) {
      triples.push({
        id: `TRP-${tenantId.toUpperCase()}-${Date.now().toString(36)}-${index++}`,
        subject: match[1].trim(),
        predicate: match[2].trim().toUpperCase(),
        object: match[3].trim(),
        confidence: 0.95,
        tenantId,
        createdAt: new Date().toISOString(),
      });
      continue;
    }

    match = naturalRegex.exec(trimmed);
    if (match) {
      const pred = match[2].toUpperCase().replace(/\s+/g, "_");
      triples.push({
        id: `TRP-${tenantId.toUpperCase()}-${Date.now().toString(36)}-${index++}`,
        subject: match[1].trim(),
        predicate: pred,
        object: match[3].trim(),
        confidence: 0.85,
        tenantId,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return triples;
}

// =========================================================================
// Standalone CLI Runner
// =========================================================================

export async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      query: { type: "string" },
      tenant: { type: "string" },
      depth: { type: "string" },
      ingest: { type: "string" },
      supersede: { type: "string" },
      with: { type: "string" },
      store: { type: "string" },
      json: { type: "boolean" },
    },
    strict: false,
  });

  const storePath = values.store || ".agents/artifacts/cognitive-graph.json";
  let existingTriples: GraphTriple[] = [];

  if (fs.existsSync(storePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(storePath, "utf8"));
      existingTriples = raw.triples || [];
    } catch {
      existingTriples = [];
    }
  }

  const engine = new CognitiveGraphEngine(existingTriples);
  const tenant = values.tenant || "default-tenant";

  if (values.ingest) {
    if (!fs.existsSync(values.ingest)) {
      console.error(`Error: Ingest file '${values.ingest}' not found.`);
      process.exit(1);
    }
    const content = fs.readFileSync(values.ingest, "utf8");
    let newTriples: GraphTriple[] = [];

    if (values.ingest.endsWith(".json")) {
      const parsed = JSON.parse(content);
      newTriples = Array.isArray(parsed) ? parsed : parsed.triples || [];
    } else {
      newTriples = extractTriplesFromText(content, tenant);
    }

    for (const t of newTriples) {
      t.tenantId = t.tenantId || tenant;
      engine.addTriple(t);
    }

    fs.writeFileSync(storePath, JSON.stringify({ version: 1, triples: engine.getAllTriples() }, null, 2), "utf8");
    console.log(`✅ Ingested ${newTriples.length} triples into '${storePath}' (tenant: ${tenant}).`);
    return;
  }

  if (values.supersede) {
    if (!values.with) {
      console.error("Error: --with <new-id> is required for --supersede.");
      process.exit(1);
    }
    const success = engine.supersedeTriple(values.supersede, values.with);
    if (success) {
      fs.writeFileSync(storePath, JSON.stringify({ version: 1, triples: engine.getAllTriples() }, null, 2), "utf8");
      console.log(`✅ Marked triple '${values.supersede}' superseded by '${values.with}'.`);
    } else {
      console.error(`Error: Triple '${values.supersede}' not found.`);
      process.exit(1);
    }
    return;
  }

  if (values.query) {
    const depth = values.depth ? Number.parseInt(values.depth, 10) : 2;
    const result = engine.traverse(values.query, tenant, depth);

    if (values.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`\n🧠 Cognitive Graph Traversal: [${values.query}]`);
      console.log(`Tenant: ${result.tenantId} | Depth: ${result.traversalDepth} | Time: ${result.executionTimeMs}ms\n`);
      console.log("Nodes:");
      for (const n of result.reachableNodes) {
        console.log(`  - (${n.depth}) ${n.name}`);
      }
      console.log("\nEdges:");
      for (const e of result.edges) {
        console.log(`  - [${e.subject}] --(${e.predicate})--> [${e.object}] ${e.isSuperseded ? "(SUPERSEDED)" : ""}`);
      }
      console.log(`\n${result.summary}`);
    }
    return;
  }

  console.log("Usage: bun cognitive-graph.ts [--query <entity> | --ingest <file> | --supersede <id>] [options]");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("CognitiveGraphEngine Fatal:", err);
    process.exit(1);
  });
}
