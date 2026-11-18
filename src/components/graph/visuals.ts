import type { AllocationSnapshot, ProcessId, SimState } from '../../core/model';
import { isZero, row } from '../../core/vector';

/** How a process node looks. */
export type ProcessVisual = 'ready' | 'waiting' | 'deadlocked' | 'finished' | 'terminated';

/** Visual state of each process in a running simulation. */
export function simVisuals(state: SimState, deadlocked: readonly ProcessId[]): Record<ProcessId, ProcessVisual> {
  const stuck = new Set(deadlocked);
  const out: Record<ProcessId, ProcessVisual> = {};
  for (const p of state.processes) {
    const status = state.status[p.id];
    out[p.id] = stuck.has(p.id) ? 'deadlocked' : status === 'terminated' ? 'terminated' : status === 'finished' ? 'finished' : status === 'waiting' ? 'waiting' : 'ready';
  }
  return out;
}

/** Visual state of each process in a fixed snapshot: a process with a request waits. */
export function snapshotVisuals(snapshot: AllocationSnapshot, deadlocked: readonly ProcessId[]): Record<ProcessId, ProcessVisual> {
  const ids = snapshot.resources.map((r) => r.id);
  const stuck = new Set(deadlocked);
  const out: Record<ProcessId, ProcessVisual> = {};
  for (const p of snapshot.processes) {
    out[p.id] = stuck.has(p.id) ? 'deadlocked' : isZero(ids, row(snapshot.request, p.id)) ? 'ready' : 'waiting';
  }
  return out;
}
