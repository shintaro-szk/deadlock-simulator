import type { Scenario } from '../core/model';
import { request, work } from './ops';

/**
 * PDF (Eliminate Circular Wait): "Printer = 1, Scanner = 2. If a process holds 1, it can request 2,
 * but it can't go backward to request 1 again."
 * Without the rule, P2 asks for the Scanner first and the two processes deadlock.
 */
export const printerScanner: Scenario = {
  id: 'printer-scanner',
  title: 'Printer and scanner',
  resources: [
    { id: 'R1', label: 'Printer', instances: 1, order: 1 },
    { id: 'R2', label: 'Scanner', instances: 1, order: 2 },
  ],
  processes: [
    { id: 'P1', label: 'P1', priority: 2, restartCost: 1, script: [request('R1'), work, request('R2'), work] },
    { id: 'P2', label: 'P2', priority: 1, restartCost: 1, script: [request('R2'), work, request('R1'), work] },
  ],
};
