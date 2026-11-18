import type { Scenario } from '../core/model';
import { request, work } from './ops';

/**
 * No deadlock. P3 needs only R3, so the chain P1 → P2 → P3 has an end.
 * P3 finishes, then P2 gets R3, then P1 gets R2.
 */
export const safeSequential: Scenario = {
  id: 'safe-sequential',
  title: 'Safe execution',
  resources: [
    { id: 'R1', label: 'File', instances: 1, order: 1 },
    { id: 'R2', label: 'Printer', instances: 1, order: 2 },
    { id: 'R3', label: 'Scanner', instances: 1, order: 3 },
  ],
  processes: [
    { id: 'P1', label: 'P1', priority: 3, restartCost: 2, script: [request('R1'), work, request('R2'), work] },
    { id: 'P2', label: 'P2', priority: 2, restartCost: 2, script: [request('R2'), work, request('R3'), work] },
    { id: 'P3', label: 'P3', priority: 1, restartCost: 1, script: [request('R3'), work, work] },
  ],
};
