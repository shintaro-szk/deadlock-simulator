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

export type AvoidanceView = 'check' | 'live';

export const avoidanceViews: readonly { readonly value: AvoidanceView; readonly label: string }[] = [
  { value: 'check', label: 'Check a request' },
  { value: 'live', label: 'Live run' },
];

export type LivePolicy = 'none' | 'banker';

export const livePolicies: readonly { readonly value: LivePolicy; readonly label: string }[] = [
  { value: 'none', label: 'No avoidance' },
  { value: 'banker', label: "Banker's Algorithm" },
];

export const livePolicyNote: Record<LivePolicy, string> = {
  none: 'The OS grants every request that is free. P2 gets one more block too early, and the system deadlocks.',
  banker: "The OS checks each request first. When P2 asks for one more block, the result is unsafe, so P2 waits. Every process finishes.",
};

export const verdictTitle = {
  granted: 'Safe → granted',
  unsafe: 'Unsafe → denied for now',
  'must-wait': 'Not free → the process must wait',
  'exceeds-claim': 'Error → more than the declared need',
} as const;

export type DetectionView = 'single' | 'multiple';

export const detectionViews: readonly { readonly value: DetectionView; readonly label: string }[] = [
  { value: 'single', label: 'Single instance (RAG, WFG)' },
  { value: 'multiple', label: 'Multiple instances (tables)' },
];

export type DetectionMode = 'periodic' | 'on-demand';

export const detectionModes: readonly { readonly value: DetectionMode; readonly label: string }[] = [
  { value: 'periodic', label: 'Periodic (every 2 steps)' },
  { value: 'on-demand', label: 'On demand' },
];

export type MatrixExample = 'pdf' | 'deadlock';

export const matrixExamples: readonly { readonly value: MatrixExample; readonly label: string }[] = [
  { value: 'pdf', label: 'PDF example' },
  { value: 'deadlock', label: 'Deadlocked system' },
];

export type RecoveryMethod = 'terminate-one' | 'terminate-all' | 'rollback' | 'preempt';

export const recoveryMethods: readonly { readonly value: RecoveryMethod; readonly label: string }[] = [
  { value: 'terminate-one', label: 'Kill one at a time' },
  { value: 'terminate-all', label: 'Kill all' },
  { value: 'rollback', label: 'Rollback' },
  { value: 'preempt', label: 'Preempt resources' },
];

export const recoveryNote: Record<RecoveryMethod, string> = {
  'terminate-one': 'Kill the selected victim. If the cycle still exists, kill the next one, until the cycle breaks.',
  'terminate-all': 'Kill every process in the cycle at once. The deadlock ends, but all their work is lost.',
  rollback: 'Send the victim back to its last checkpoint, where it held nothing. It releases its resources and runs again from there.',
  preempt: 'Take the resources from the victim and give them to the waiting processes now. The victim restarts. If the same process is the victim again and again, it starves.',
};

export const criterionChoices: readonly { readonly value: 'priority' | 'execution-time' | 'resource-usage' | 'restart-cost'; readonly label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'execution-time', label: 'Execution time' },
  { value: 'resource-usage', label: 'Resource usage' },
  { value: 'restart-cost', label: 'Restart cost' },
];

export const criterionRule = {
  priority: 'Lowest priority',
  'execution-time': 'Fewest steps run (least work lost)',
  'resource-usage': 'Holds the most instances',
  'restart-cost': 'Cheapest to restart',
} as const;
