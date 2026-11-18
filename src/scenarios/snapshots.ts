import type { AllocationSnapshot } from '../core/model';

/**
 * PDF (Detection in Multiple-instance Resources):
 * "P1 needs 2 more, but only 1 is free → can't finish. P2 can finish with what's free → releases
 * resources. After P2 finishes, P1 now has enough → system is safe."
 */
export const multiInstanceDetection: AllocationSnapshot = {
  processes: [
    { id: 'P1', label: 'P1', priority: 2 },
    { id: 'P2', label: 'P2', priority: 1 },
  ],
  resources: [{ id: 'R1', label: 'Memory blocks', instances: 3, order: 1 }],
  allocation: { P1: { R1: 1 }, P2: { R1: 1 } },
  request: { P1: { R1: 2 }, P2: { R1: 1 } },
};

/**
 * PDF (Characterization): "For multiple-instance resources, a cycle is necessary but not sufficient."
 * The RAG has the cycle P1 → R1 → P3 → R2 → P1. P2 and P4 can finish and free one instance each,
 * so there is no deadlock.
 */
export const cycleNoDeadlock: AllocationSnapshot = {
  processes: [
    { id: 'P1', label: 'P1', priority: 4 },
    { id: 'P2', label: 'P2', priority: 3 },
    { id: 'P3', label: 'P3', priority: 2 },
    { id: 'P4', label: 'P4', priority: 1 },
  ],
  resources: [
    { id: 'R1', label: 'CPU cores', instances: 2, order: 1 },
    { id: 'R2', label: 'Memory blocks', instances: 2, order: 2 },
  ],
  allocation: { P1: { R2: 1 }, P2: { R1: 1 }, P3: { R1: 1 }, P4: { R2: 1 } },
  request: { P1: { R1: 1 }, P3: { R2: 1 } },
};
