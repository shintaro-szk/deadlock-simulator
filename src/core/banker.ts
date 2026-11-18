import type { Matrix, ProcessId, ProcessSpec, ResourceSpec, Vector } from './model';
import { reduce, type ReductionCheck } from './reduction';
import { add, lessOrEqual, row, subtract } from './vector';

/**
 * Input for the Banker's Algorithm.
 * PDF: "the OS needs to know the maximum possible resource needs of each process."
 */
export interface BankerState {
  readonly resources: readonly ResourceSpec[];
  readonly processes: readonly ProcessSpec[];
  readonly allocation: Matrix;
  /** Maximum claim of each process. */
  readonly max: Matrix;
  readonly available: Vector;
}

export interface SafetyResult {
  readonly safe: boolean;
  /** A safe sequence. It is complete only when `safe` is true. */
  readonly sequence: readonly ProcessId[];
  /** Processes that cannot finish. Empty when `safe` is true. */
  readonly stuck: readonly ProcessId[];
  readonly trace: readonly ReductionCheck[];
}

const ids = (state: BankerState) => state.resources.map((r) => r.id);

/** Need = Max - Allocation. */
export function needOf(state: BankerState, processId: ProcessId): Vector {
  return subtract(ids(state), row(state.max, processId), row(state.allocation, processId));
}

/** Safety algorithm. The state is safe when every process can finish in some order. */
export function checkSafety(state: BankerState): SafetyResult {
  const result = reduce({
    resourceIds: ids(state),
    processIds: state.processes.map((p) => p.id),
    start: state.available,
    demandOf: (id) => needOf(state, id),
    allocationOf: (id) => row(state.allocation, id),
  });
  return { safe: result.stuck.length === 0, sequence: result.order, stuck: result.stuck, trace: result.trace };
}

/**
 * PDF: "If I give this resource, will the system remain safe?"
 * - exceeds-claim: the request is more than the declared Need. This is an error.
 * - must-wait: the instances are not free now.
 * - unsafe: the system can give the instances, but the result is unsafe. The OS denies the request for now.
 * - granted: the result is safe. `after` is the new state.
 */
export type RequestVerdict =
  | { readonly outcome: 'exceeds-claim' }
  | { readonly outcome: 'must-wait' }
  | { readonly outcome: 'unsafe'; readonly safety: SafetyResult }
  | { readonly outcome: 'granted'; readonly safety: SafetyResult; readonly after: BankerState };

export function evaluateRequest(state: BankerState, processId: ProcessId, request: Vector): RequestVerdict {
  const resourceIds = ids(state);
  if (!lessOrEqual(resourceIds, request, needOf(state, processId))) return { outcome: 'exceeds-claim' };
  if (!lessOrEqual(resourceIds, request, state.available)) return { outcome: 'must-wait' };

  const after: BankerState = {
    ...state,
    available: subtract(resourceIds, state.available, request),
    allocation: { ...state.allocation, [processId]: add(resourceIds, row(state.allocation, processId), request) },
  };
  const safety = checkSafety(after);
  return safety.safe ? { outcome: 'granted', safety, after } : { outcome: 'unsafe', safety };
}
