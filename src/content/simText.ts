/** Text for the step log, the status line, and process states. */
import type { LogEntry, Policy, ProcessStatus, ResourceSpec, SimOutcome, Vector } from '../core/model';

export type Tone = 'neutral' | 'muted' | 'signal' | 'ok' | 'wait';

/** Write a vector as "R1, R2 ×2". Empty vectors give "nothing". */
export function formatItems(items: Vector, resources: readonly ResourceSpec[]): string {
  const parts = resources
    .filter((r) => (items[r.id] ?? 0) > 0)
    .map((r) => {
      const n = items[r.id] ?? 0;
      return n > 1 ? `${r.id} ×${n}` : r.id;
    });
  return parts.length > 0 ? parts.join(', ') : 'nothing';
}

const waitReason = {
  unavailable: 'not free',
  unsafe: 'unsafe, denied for now',
  order: 'breaks resource order',
} as const;

export interface LogLine {
  readonly text: string;
  readonly tone: Tone;
}

export function describeLogEntry(entry: LogEntry, resources: readonly ResourceSpec[]): LogLine {
  switch (entry.kind) {
    case 'acquire':
      return { text: `gets ${formatItems(entry.items, resources)}`, tone: 'neutral' };
    case 'release':
      return { text: `releases ${formatItems(entry.items, resources)}`, tone: 'muted' };
    case 'wait':
      return { text: `waits for ${formatItems(entry.items, resources)} (${waitReason[entry.reason]})`, tone: entry.reason === 'unsafe' ? 'signal' : 'wait' };
    case 'restart':
      return { text: `cannot get its request, releases ${formatItems(entry.items, resources)}`, tone: 'wait' };
    case 'resume':
      return { text: 'resources are free again, starts its requests again', tone: 'muted' };
    case 'work':
      return { text: 'works', tone: 'muted' };
    case 'finish':
      return { text: 'finishes and releases everything', tone: 'ok' };
    case 'terminate':
      return { text: `is killed, frees ${formatItems(entry.items, resources)}`, tone: 'signal' };
    case 'rollback':
      return { text: `rolls back to its checkpoint, frees ${formatItems(entry.items, resources)}`, tone: 'signal' };
    case 'preempt':
      return { text: `loses ${formatItems(entry.items, resources)} (preempted)`, tone: 'signal' };
  }
}

export const outcomeText: Record<SimOutcome, { readonly label: string; readonly tone: Tone }> = {
  running: { label: 'Running', tone: 'neutral' },
  complete: { label: 'All processes finished', tone: 'ok' },
  deadlocked: { label: 'Deadlock', tone: 'signal' },
  stalled: { label: 'No process can continue', tone: 'wait' },
};

export const statusText: Record<ProcessStatus, string> = {
  ready: 'ready',
  waiting: 'waiting',
  finished: 'finished',
  terminated: 'killed',
};

export const policyText: Record<Policy, string> = {
  none: 'No handling',
  'mutual-exclusion': 'Eliminate mutual exclusion',
  'all-at-once': 'Eliminate wait (request all first)',
  'release-before-request': 'Eliminate hold (release before request)',
  'no-preemption': 'Eliminate no preemption',
  'resource-ordering': 'Eliminate circular wait (resource order)',
  banker: "Banker's Algorithm",
};
