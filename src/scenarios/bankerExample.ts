import type { Scenario } from '../core/model';
import { request, work } from './ops';

/**
 * Banker's Algorithm with one resource type that has 12 instances.
 * Maximum claims: P0 = 10, P1 = 4, P2 = 9.
 * Without avoidance, P2 gets one more block too early and the system deadlocks.
 * With Banker's, the OS sees that this request makes the state unsafe and makes P2 wait.
 */
export const bankerExample: Scenario = {
  id: 'banker-example',
  title: "Banker's Algorithm",
  resources: [{ id: 'R1', label: 'Memory blocks', instances: 12, order: 1 }],
  processes: [
    { id: 'P0', label: 'P0', priority: 3, restartCost: 3, script: [request('R1', 5), work, request('R1', 5), work] },
    { id: 'P1', label: 'P1', priority: 2, restartCost: 1, script: [request('R1', 2), work, request('R1', 2), work] },
    {
      id: 'P2',
      label: 'P2',
      priority: 1,
      restartCost: 2,
      script: [request('R1', 2), work, request('R1', 1), work, request('R1', 6), work],
    },
  ],
};
