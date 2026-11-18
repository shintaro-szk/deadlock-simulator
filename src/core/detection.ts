import type { AllocationSnapshot, ProcessId } from './model';
import { buildRag, buildWaitFor, type Graph, type RagEdge, type RagNode, type WaitForEdge } from './rag';
import { findCycle } from './cycle';
import { reduce, type ReductionCheck } from './reduction';
import { availableOf, isZero, resourceIds, row } from './vector';

export interface DetectionResult {
  /** Processes that can never finish. Empty means no deadlock. */
  readonly deadlocked: readonly ProcessId[];
  /** Processes in the order that the algorithm lets them finish. */
  readonly finishOrder: readonly ProcessId[];
  /** Processes that hold nothing. They cannot be part of a deadlock, so the algorithm skips them. */
  readonly skipped: readonly ProcessId[];
  readonly trace: readonly ReductionCheck[];
}

/**
 * Multiple-instance detection (PDF: Available, Allocation, Request).
 * A process can finish when its Request is less than or equal to Work.
 * A process that holds nothing starts as finished, because no other process waits for it.
 */
export function detectDeadlock(snapshot: AllocationSnapshot): DetectionResult {
  const ids = resourceIds(snapshot);
  const processIds = snapshot.processes.map((p) => p.id);
  const skipped = processIds.filter((id) => isZero(ids, row(snapshot.allocation, id)));

  const result = reduce({
    resourceIds: ids,
    processIds,
    start: availableOf(snapshot),
    demandOf: (id) => row(snapshot.request, id),
    allocationOf: (id) => row(snapshot.allocation, id),
    preFinished: skipped,
  });

  return { deadlocked: result.stuck, finishOrder: result.order, skipped, trace: result.trace };
}

export interface StateAnalysis {
  readonly isDeadlocked: boolean;
  readonly deadlocked: readonly ProcessId[];
  readonly rag: Graph<RagNode, RagEdge>;
  readonly waitFor: Graph<RagNode, WaitForEdge>;
  /** One cycle in the RAG, in path order, or null. */
  readonly cycle: readonly string[] | null;
  /**
   * True when every resource on the cycle has one instance.
   * PDF: with single instances, a cycle implies deadlock.
   * With multiple instances, a cycle is necessary but not sufficient.
   */
  readonly cycleIsSingleInstance: boolean;
  readonly detection: DetectionResult;
}

/** Run detection and build both graphs for one snapshot. */
export function analyzeState(snapshot: AllocationSnapshot): StateAnalysis {
  const rag = buildRag(snapshot);
  const waitFor = buildWaitFor(snapshot);
  const detection = detectDeadlock(snapshot);
  const cycle = findCycle(rag.nodes.map((n) => n.id), rag.edges);

  const instancesById = new Map(snapshot.resources.map((r) => [r.id, r.instances]));
  const cycleIsSingleInstance =
    cycle !== null && cycle.every((id) => !instancesById.has(id) || instancesById.get(id) === 1);

  return {
    isDeadlocked: detection.deadlocked.length > 0,
    deadlocked: detection.deadlocked,
    rag,
    waitFor,
    cycle,
    cycleIsSingleInstance,
    detection,
  };
}
