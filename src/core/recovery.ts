import type { ProcessId, SimState } from './model';
import { analyzeState } from './detection';
import { evaluateOutcome, grant, releaseAll, toSnapshot } from './engine';
import { decideRequest } from './policies';
import { row } from './vector';

/**
 * PDF (Killing the Process): "The selection is based on: 1. Priority, 2. Execution time,
 * 3. Resource usage, 4. Restart cost."
 * - priority: the process with the lowest priority.
 * - execution-time: the process that ran the fewest steps (least work lost).
 * - resource-usage: the process that holds the most instances (frees the most).
 * - restart-cost: the process that is cheapest to restart.
 * Ties go to the process that comes first in the list.
 */
export type VictimCriterion = 'priority' | 'execution-time' | 'resource-usage' | 'restart-cost';

export interface RecoveryResult {
  readonly state: SimState;
  /** Processes that recovery acted on, in order. */
  readonly victims: readonly ProcessId[];
}

/** Processes in the deadlock. Recovery selects victims from this list. */
export function deadlockedProcesses(state: SimState): readonly ProcessId[] {
  return analyzeState(toSnapshot(state)).deadlocked;
}

function heldInstances(state: SimState, processId: ProcessId): number {
  return Object.values(row(state.allocation, processId)).reduce((sum, n) => sum + n, 0);
}

/** Select one victim from the candidates. */
export function selectVictim(state: SimState, candidates: readonly ProcessId[], criterion: VictimCriterion): ProcessId {
  if (candidates.length === 0) throw new Error('No deadlocked process to select.');
  const specOf = (id: ProcessId) => {
    const spec = state.processes.find((p) => p.id === id);
    if (!spec) throw new Error(`Unknown process "${id}".`);
    return spec;
  };
  // A lower score means a better victim.
  const score = (id: ProcessId): number => {
    switch (criterion) {
      case 'priority':
        return specOf(id).priority;
      case 'execution-time':
        return state.executed[id];
      case 'resource-usage':
        return -heldInstances(state, id);
      case 'restart-cost':
        return specOf(id).restartCost;
    }
  };
  return candidates.reduce((best, id) => (score(id) < score(best) ? id : best));
}

function finish(state: SimState, victims: readonly ProcessId[]): RecoveryResult {
  const last = victims[victims.length - 1];
  const turn = state.processes.findIndex((p) => p.id === last) + 1;
  const next = { ...state, turn };
  return { state: { ...next, outcome: evaluateOutcome(next) }, victims };
}

/** Free the process, clear its request, and send it back to its checkpoint. */
function sendToCheckpoint(state: SimState, processId: ProcessId): SimState {
  const released = releaseAll(state, processId);
  return {
    ...released,
    request: { ...state.request, [processId]: {} },
    pc: { ...state.pc, [processId]: state.checkpoint[processId] },
    status: { ...state.status, [processId]: 'ready' },
    parked: { ...state.parked, [processId]: false },
    victimCount: { ...state.victimCount, [processId]: state.victimCount[processId] + 1 },
  };
}

/**
 * PDF: "Abort one or more processes in the deadlock cycle either all at once or one at a time until
 * the deadlock cycle breaks."
 */
export function terminate(
  state: SimState,
  options: { readonly criterion: VictimCriterion; readonly mode: 'one-at-a-time' | 'all' },
): RecoveryResult {
  let current = state;
  const victims: ProcessId[] = [];
  let candidates = deadlockedProcesses(current);

  while (candidates.length > 0) {
    const batch = options.mode === 'all' ? candidates : [selectVictim(current, candidates, options.criterion)];
    for (const victim of batch) {
      const held = row(current.allocation, victim);
      const released = releaseAll(current, victim);
      current = {
        ...released,
        request: { ...current.request, [victim]: {} },
        status: { ...current.status, [victim]: 'terminated' },
        log: [...current.log, { step: current.step, process: victim, kind: 'terminate', items: held }],
      };
      victims.push(victim);
    }
    candidates = deadlockedProcesses(current);
  }
  return finish(current, victims);
}

/**
 * PDF: "Rollback deadlocked processes to a previously saved state where the deadlock condition did
 * not exist. It requires checkpointing to periodically save the state of processes."
 * The engine saves a checkpoint each time a process holds nothing.
 */
export function rollback(state: SimState, criterion: VictimCriterion): RecoveryResult {
  const candidates = deadlockedProcesses(state);
  if (candidates.length === 0) return { state, victims: [] };
  const victim = selectVictim(state, candidates, criterion);
  const held = row(state.allocation, victim);
  const next = sendToCheckpoint(state, victim);
  return finish({ ...next, log: [...state.log, { step: state.step, process: victim, kind: 'rollback', items: held }] }, [victim]);
}

/**
 * PDF: "Resources are preempted from the processes involved in the deadlock, and preempted resources
 * are allocated to other processes." The victim restarts from its checkpoint.
 * The same victim can lose its resources again and again. `victimCount` shows this starvation risk.
 */
export function preempt(state: SimState, criterion: VictimCriterion): RecoveryResult {
  const candidates = deadlockedProcesses(state);
  if (candidates.length === 0) return { state, victims: [] };
  const victim = selectVictim(state, candidates, criterion);
  const held = row(state.allocation, victim);
  let current = sendToCheckpoint(state, victim);
  current = { ...current, log: [...current.log, { step: state.step, process: victim, kind: 'preempt', items: held }] };

  // Give the freed instances to the waiting processes now.
  for (const p of current.processes) {
    if (p.id === victim || current.status[p.id] !== 'waiting' || current.parked[p.id]) continue;
    const items = row(current.request, p.id);
    if (decideRequest(current, p.id, items).kind !== 'grant') continue;
    current = {
      ...grant(current, p.id, items),
      status: { ...current.status, [p.id]: 'ready' },
      pc: { ...current.pc, [p.id]: current.pc[p.id] + 1 },
      log: [...current.log, { step: current.step, process: p.id, kind: 'acquire', items }],
    };
  }
  return finish(current, [victim]);
}
