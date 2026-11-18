/**
 * Test fixtures for the core algorithms. Most cases come from the Deadlocks PDF.
 * Business logic must not import this file.
 */
import type { AllocationSnapshot, ProcessSpec, ResourceSpec } from '../model';
import type { BankerState } from '../banker';

const processes = (...ids: string[]): ProcessSpec[] =>
  ids.map((id, i) => ({ id, label: id, priority: ids.length - i }));

const resources = (...specs: Array<[id: string, instances: number]>): ResourceSpec[] =>
  specs.map(([id, instances], i) => ({ id, label: id, instances, order: i + 1 }));

/** PDF (Detection, RAG): P1 → R1 → P2 → R2 → P1 forms a cycle → deadlock. */
export const twoProcessCycle: AllocationSnapshot = {
  processes: processes('P1', 'P2'),
  resources: resources(['R1', 1], ['R2', 1]),
  allocation: { P2: { R1: 1 }, P1: { R2: 1 } },
  request: { P1: { R1: 1 }, P2: { R2: 1 } },
};

/** PDF (Circular Wait): A waits for B, B waits for C, C waits for A. WFG: P1 → P2 → P3 → P1. */
export const threeProcessCycle: AllocationSnapshot = {
  processes: processes('P1', 'P2', 'P3'),
  resources: resources(['R1', 1], ['R2', 1], ['R3', 1]),
  allocation: { P1: { R1: 1 }, P2: { R2: 1 }, P3: { R3: 1 } },
  request: { P1: { R2: 1 }, P2: { R3: 1 }, P3: { R1: 1 } },
};

/** Old regression case: P1 holds R1, P2 waits for the free R2. No deadlock. */
export const noCycle: AllocationSnapshot = {
  processes: processes('P1', 'P2'),
  resources: resources(['R1', 1], ['R2', 1]),
  allocation: { P1: { R1: 1 } },
  request: { P2: { R2: 1 } },
};

export const empty: AllocationSnapshot = { processes: [], resources: [], allocation: {}, request: {} };

/** The app shows these two PDF examples, so they live in src/scenarios. */
export { multiInstanceDetection as pdfMultiInstance, cycleNoDeadlock as cycleWithoutDeadlock } from '../../scenarios/snapshots';

/** Textbook Banker's example (Silberschatz et al., listed in the PDF references). Safe state. The app shows it too. */
export { bankerTable as textbookBanker } from '../../scenarios/bankerTable';

/** Old regression case: an unsafe state. P1 and P2 both need more than is available. */
export const unsafeBanker: BankerState = {
  processes: processes('P1', 'P2'),
  resources: resources(['A', 7], ['B', 5], ['C', 3]),
  allocation: { P1: { A: 0, B: 1, C: 0 }, P2: { A: 2, B: 0, C: 0 } },
  max: { P1: { A: 7, B: 5, C: 3 }, P2: { A: 3, B: 2, C: 2 } },
  available: { A: 2, B: 3, C: 0 },
};
