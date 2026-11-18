import type { ProcessId, ResourceId, Vector } from './model';
import { add, lessOrEqual } from './vector';

/** One check of one process during a reduction pass. */
export interface ReductionCheck {
  readonly pass: number;
  readonly process: ProcessId;
  /** What the process still needs: Request (detection) or Need (Banker's). */
  readonly demand: Vector;
  /** Free instances before the check. */
  readonly work: Vector;
  readonly canFinish: boolean;
  /** Free instances after the process finishes and releases its allocation. */
  readonly workAfter: Vector | null;
}

export interface ReductionResult {
  /** Processes in the order that they can finish. */
  readonly order: readonly ProcessId[];
  /** Processes that can never finish. */
  readonly stuck: readonly ProcessId[];
  readonly trace: readonly ReductionCheck[];
}

export interface ReductionInput {
  readonly resourceIds: readonly ResourceId[];
  readonly processIds: readonly ProcessId[];
  readonly start: Vector;
  readonly demandOf: (id: ProcessId) => Vector;
  readonly allocationOf: (id: ProcessId) => Vector;
  /** Processes that count as finished before the first pass. */
  readonly preFinished?: readonly ProcessId[];
}

/**
 * The shared core of the Banker's safety algorithm and the multiple-instance detection algorithm.
 * PDF steps:
 * 1. Start with the Available resources.
 * 2. Find a process that can finish with what is available.
 * 3. Mark it as finished and add its allocated resources back to Available.
 * 4. Repeat until all processes finish, or no process can finish.
 * Each pass scans the processes in input order and continues the scan after a finish.
 */
export function reduce(input: ReductionInput): ReductionResult {
  const { resourceIds: ids, processIds, demandOf, allocationOf } = input;
  const finished = new Set<ProcessId>(input.preFinished ?? []);
  const order: ProcessId[] = [];
  const trace: ReductionCheck[] = [];
  let work = input.start;

  for (let pass = 1; finished.size < processIds.length; pass += 1) {
    let progressed = false;
    for (const id of processIds) {
      if (finished.has(id)) continue;
      const demand = demandOf(id);
      const canFinish = lessOrEqual(ids, demand, work);
      const before = work;
      if (canFinish) {
        work = add(ids, work, allocationOf(id));
        finished.add(id);
        order.push(id);
        progressed = true;
      }
      trace.push({ pass, process: id, demand, work: before, canFinish, workAfter: canFinish ? work : null });
    }
    if (!progressed) break;
  }

  const stuck = processIds.filter((id) => !finished.has(id));
  return { order, stuck, trace };
}
