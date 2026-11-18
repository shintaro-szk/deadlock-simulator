import { edgeId } from './rag';

interface DirectedEdge {
  readonly from: string;
  readonly to: string;
}

/**
 * Find one directed cycle with depth-first search.
 * The result lists the nodes in path order. The last node points back to the first node.
 * Example (PDF): P1 → R1 → P2 → R2 → P1 gives ['P1', 'R1', 'P2', 'R2'].
 * The result is null when the graph has no cycle.
 * The search visits nodes and edges in input order, so the result is deterministic.
 */
export function findCycle(nodeIds: readonly string[], edges: readonly DirectedEdge[]): string[] | null {
  const next = new Map<string, string[]>();
  for (const id of nodeIds) next.set(id, []);
  for (const e of edges) {
    const list = next.get(e.from);
    if (list) list.push(e.to);
    else next.set(e.from, [e.to]);
  }

  const done = new Set<string>();
  const path: string[] = [];
  const onPath = new Set<string>();

  const visit = (node: string): string[] | null => {
    path.push(node);
    onPath.add(node);
    for (const target of next.get(node) ?? []) {
      if (onPath.has(target)) return path.slice(path.indexOf(target));
      if (done.has(target)) continue;
      const found = visit(target);
      if (found) return found;
    }
    path.pop();
    onPath.delete(node);
    done.add(node);
    return null;
  };

  for (const start of nodeIds) {
    if (done.has(start)) continue;
    const found = visit(start);
    if (found) return found;
  }
  return null;
}

/** The ids of the edges that close the cycle, including the edge from the last node back to the first. */
export function cycleEdgeIds(cycle: readonly string[]): string[] {
  return cycle.map((node, i) => edgeId(node, cycle[(i + 1) % cycle.length]));
}
