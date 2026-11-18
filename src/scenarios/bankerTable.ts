import type { BankerState } from '../core/banker';

const p = (id: string, priority: number) => ({ id, label: id, priority });

/**
 * The Banker's Algorithm example from Operating System Concepts (Silberschatz, Galvin, and Gagne),
 * which the PDF lists as a reference. Five processes, three resource types (A = 10, B = 5, C = 7).
 * Try these requests in order: P1 asks (1, 0, 2) → granted. P4 asks (3, 3, 0) → must wait.
 * P0 asks (0, 2, 0) → unsafe, denied.
 */
export const bankerTable: BankerState = {
  processes: [p('P0', 5), p('P1', 4), p('P2', 3), p('P3', 2), p('P4', 1)],
  resources: [
    { id: 'A', label: 'A', instances: 10, order: 1 },
    { id: 'B', label: 'B', instances: 5, order: 2 },
    { id: 'C', label: 'C', instances: 7, order: 3 },
  ],
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

/** Ready-made requests for the example above, in the order that shows each verdict. */
export const bankerPresets: readonly { readonly process: string; readonly request: Readonly<Record<string, number>> }[] = [
  { process: 'P1', request: { A: 1, B: 0, C: 2 } },
  { process: 'P4', request: { A: 3, B: 3, C: 0 } },
  { process: 'P0', request: { A: 0, B: 2, C: 0 } },
];
