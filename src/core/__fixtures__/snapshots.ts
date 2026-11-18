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

/**
 * PDF (Detection in Multiple-instance Resources):
 * "P1 needs 2 more, but only 1 is free → can't finish. P2 can finish with what's free → releases resources.
 * After P2 finishes, P1 now has enough → system is safe."
 */
export const pdfMultiInstance: AllocationSnapshot = {
  processes: processes('P1', 'P2'),
  resources: resources(['R1', 3]),
  allocation: { P1: { R1: 1 }, P2: { R1: 1 } },
  request: { P1: { R1: 2 }, P2: { R1: 1 } },
};

/**
 * PDF (Characterization): with multiple instances, a cycle is necessary but not sufficient.
 * Cycle P1 → R1 → P3 → R2 → P1, but P2 and P4 can finish and free the instances.
 */
export const cycleWithoutDeadlock: AllocationSnapshot = {
  processes: processes('P1', 'P2', 'P3', 'P4'),
  resources: resources(['R1', 2], ['R2', 2]),
  allocation: { P1: { R2: 1 }, P2: { R1: 1 }, P3: { R1: 1 }, P4: { R2: 1 } },
  request: { P1: { R1: 1 }, P3: { R2: 1 } },
};

/** Textbook Banker's example (Silberschatz et al., listed in the PDF references). Safe state. */
export const textbookBanker: BankerState = {
  processes: processes('P0', 'P1', 'P2', 'P3', 'P4'),
  resources: resources(['A', 10], ['B', 5], ['C', 7]),
  allocation: {
    P0: { A: 0, B: 1, C: 0 },
    P1: { A: 2, B: 0, C: 0 },
    P2: { A: 3, B: 0, C: 2 },
    P3: { A: 2, B: 1, C: 1 },
    P4: { A: 0, B: 0, C: 2 },
  },
  max: {
    P0: { A: 7, B: 5, C: 3 },
    P1: { A: 3, B: 2, C: 2 },
    P2: { A: 9, B: 0, C: 2 },
    P3: { A: 2, B: 2, C: 2 },
    P4: { A: 4, B: 3, C: 3 },
  },
  available: { A: 3, B: 3, C: 2 },
};

/** Old regression case: an unsafe state. P1 and P2 both need more than is available. */
export const unsafeBanker: BankerState = {
  processes: processes('P1', 'P2'),
  resources: resources(['A', 7], ['B', 5], ['C', 3]),
  allocation: { P1: { A: 0, B: 1, C: 0 }, P2: { A: 2, B: 0, C: 0 } },
  max: { P1: { A: 7, B: 5, C: 3 }, P2: { A: 3, B: 2, C: 2 } },
  available: { A: 2, B: 3, C: 0 },
};
