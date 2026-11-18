import type { AllocationSnapshot, ProcessId, ResourceId } from './model';
import { at, row } from './vector';

export type RagNodeKind = 'process' | 'resource';

export interface RagNode {
  readonly id: string;
  readonly kind: RagNodeKind;
  readonly label: string;
}

/**
 * PDF: "Request edge = directed edge Pi → Rj. Assignment edge = directed edge Rj → Pi."
 * `count` is the number of instances on the edge.
 */
export interface RagEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly kind: 'request' | 'assignment';
  readonly count: number;
}

export interface Graph<N, E> {
  readonly nodes: readonly N[];
  readonly edges: readonly E[];
}

/** PDF: "Arrow from Pi → Pj: Pi is waiting for a resource held by Pj." */
export interface WaitForEdge {
  readonly id: string;
  readonly from: ProcessId;
  readonly to: ProcessId;
  /** The resources that cause this wait. */
  readonly via: readonly ResourceId[];
}

export function edgeId(from: string, to: string): string {
  return `${from}->${to}`;
}

/** Build the Resource Allocation Graph. V = P ∪ R. E = request edges ∪ assignment edges. */
export function buildRag(snapshot: AllocationSnapshot): Graph<RagNode, RagEdge> {
  const nodes: RagNode[] = [
    ...snapshot.processes.map((p) => ({ id: p.id, kind: 'process' as const, label: p.label })),
    ...snapshot.resources.map((r) => ({ id: r.id, kind: 'resource' as const, label: r.label })),
  ];

  const edges: RagEdge[] = [];
  for (const process of snapshot.processes) {
    for (const resource of snapshot.resources) {
      const requested = at(row(snapshot.request, process.id), resource.id);
      if (requested > 0) {
        edges.push({ id: edgeId(process.id, resource.id), from: process.id, to: resource.id, kind: 'request', count: requested });
      }
    }
  }
  for (const resource of snapshot.resources) {
    for (const process of snapshot.processes) {
      const held = at(row(snapshot.allocation, process.id), resource.id);
      if (held > 0) {
        edges.push({ id: edgeId(resource.id, process.id), from: resource.id, to: process.id, kind: 'assignment', count: held });
      }
    }
  }
  return { nodes, edges };
}

/**
 * Build the Wait-for Graph: the RAG without resource nodes.
 * Pi → Pj when Pi requests a resource that Pj holds.
 * The PDF defines the WFG for single-instance resources. With multiple instances, an edge
 * only means "Pi may wait for Pj".
 */
export function buildWaitFor(snapshot: AllocationSnapshot): Graph<RagNode, WaitForEdge> {
  const nodes: RagNode[] = snapshot.processes.map((p) => ({ id: p.id, kind: 'process' as const, label: p.label }));
  const vias = new Map<string, { from: ProcessId; to: ProcessId; via: ResourceId[] }>();

  for (const waiter of snapshot.processes) {
    for (const resource of snapshot.resources) {
      if (at(row(snapshot.request, waiter.id), resource.id) === 0) continue;
      for (const holder of snapshot.processes) {
        if (holder.id === waiter.id) continue;
        if (at(row(snapshot.allocation, holder.id), resource.id) === 0) continue;
        const id = edgeId(waiter.id, holder.id);
        const entry = vias.get(id) ?? { from: waiter.id, to: holder.id, via: [] };
        entry.via.push(resource.id);
        vias.set(id, entry);
      }
    }
  }

  const edges: WaitForEdge[] = [...vias.entries()].map(([id, e]) => ({ id, ...e }));
  return { nodes, edges };
}
