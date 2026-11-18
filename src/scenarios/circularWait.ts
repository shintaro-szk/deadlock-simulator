import type { Scenario } from '../core/model';
import { request, work } from './ops';

/**
 * PDF (Circular Wait): "A waits for B, B waits for C, C waits for A."
 * Each process holds one resource and then asks for the resource that the next process holds.
 * R1 is a read-only file, so it is shareable. The eliminate-mutual-exclusion policy uses this.
 * Priority and restart cost differ, so each recovery criterion can select a different victim.
 */
export const circularWait: Scenario = {
  id: 'circular-wait',
  title: 'Circular wait',
  resources: [
    { id: 'R1', label: 'File', instances: 1, order: 1, shareable: true },
    { id: 'R2', label: 'Printer', instances: 1, order: 2 },
    { id: 'R3', label: 'Scanner', instances: 1, order: 3 },
  ],
  processes: [
    { id: 'P1', label: 'P1', priority: 3, restartCost: 3, script: [work, request('R1'), work, request('R2'), work] },
    { id: 'P2', label: 'P2', priority: 1, restartCost: 2, script: [request('R2'), work, request('R3'), work] },
    { id: 'P3', label: 'P3', priority: 2, restartCost: 1, script: [request('R3'), work, request('R1'), work] },
  ],
};
