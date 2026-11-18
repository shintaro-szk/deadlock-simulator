/** Text for the chapter demos. Each note explains what the selected option does in the simulation. */
import type { Policy } from '../core/model';

export type ConditionChoice = 'all' | 'mutual-exclusion' | 'hold-and-wait' | 'no-preemption' | 'circular-wait';

export const conditionNames: Record<Exclude<ConditionChoice, 'all'>, string> = {
  'mutual-exclusion': 'Mutual exclusion',
  'hold-and-wait': 'Hold and wait',
  'no-preemption': 'No preemption',
  'circular-wait': 'Circular wait',
};

export const conditionChoices: readonly { readonly value: ConditionChoice; readonly label: string }[] = [
  { value: 'all', label: 'Keep all four' },
  { value: 'mutual-exclusion', label: 'Break mutual exclusion' },
  { value: 'hold-and-wait', label: 'Break hold and wait' },
  { value: 'no-preemption', label: 'Break no preemption' },
  { value: 'circular-wait', label: 'Break circular wait' },
];

/** The prevention policy that breaks each condition. */
export const conditionPolicy: Record<ConditionChoice, Policy> = {
  all: 'none',
  'mutual-exclusion': 'mutual-exclusion',
  'hold-and-wait': 'all-at-once',
  'no-preemption': 'no-preemption',
  'circular-wait': 'resource-ordering',
};

export const conditionNote: Record<ConditionChoice, string> = {
  all: 'All four conditions hold. Run the simulation: the processes reach a circular wait.',
  'mutual-exclusion': 'R1 is a read-only file, so processes can share it. P3 gets R1 without waiting, and the chain breaks.',
  'hold-and-wait': 'Each process requests all its resources before it starts. No process holds one resource while it waits for another.',
  'no-preemption': 'When a request is not free, the process releases everything it holds and waits. The other processes can then continue.',
  'circular-wait': 'Each process requests resources in increasing order: R1, then R2, then R3. P3 asks for R1 before R3, so no closed chain can form.',
};

export type PreventionPolicy = Exclude<Policy, 'banker'>;

export const preventionChoices: readonly { readonly value: PreventionPolicy; readonly label: string }[] = [
  { value: 'none', label: 'No prevention' },
  { value: 'mutual-exclusion', label: 'Mutual exclusion' },
  { value: 'all-at-once', label: 'Eliminate wait' },
  { value: 'release-before-request', label: 'Eliminate hold' },
  { value: 'no-preemption', label: 'No preemption' },
  { value: 'resource-ordering', label: 'Resource ordering' },
];

export const preventionNote: Record<PreventionPolicy, string> = {
  none: 'No prevention. The processes can deadlock.',
  'mutual-exclusion':
    'Only shareable resources stop blocking. In the circular wait, R1 is a read-only file. In the printer and scanner example nothing is shareable, so deadlock still occurs.',
  'all-at-once':
    'Each script starts with one request for every resource that the process will need. Downside: the process holds resources that it does not use yet (low resource utilization).',
  'release-before-request':
    'Before a new request, the process releases what it holds and asks for everything again. Downside: a process can wait for its full set again and again (starvation).',
  'no-preemption':
    'If a request is not free, the process releases everything and starts its requests again. The Lost column counts how often this happens.',
  'resource-ordering':
    'The requests are reordered so that each process asks in increasing order. In the printer and scanner example: Printer = 1, Scanner = 2.',
};

export type ScenarioChoice = 'circular-wait' | 'printer-scanner';

export const scenarioChoices: readonly { readonly value: ScenarioChoice; readonly label: string }[] = [
  { value: 'circular-wait', label: 'Circular wait (3 processes)' },
  { value: 'printer-scanner', label: 'Printer and scanner' },
];

export type RagChoice = 'single' | 'multiple';

export const ragChoices: readonly { readonly value: RagChoice; readonly label: string }[] = [
  { value: 'single', label: 'Single instance' },
  { value: 'multiple', label: 'Multiple instances' },
];
