import type {
  AllocationSnapshot,
  LogEntry,
  Matrix,
  Policy,
  ProcessId,
  Scenario,
  SimOutcome,
  SimState,
  Vector,
} from './model';
import { analyzeState } from './detection';
import { decideRequest, peakClaim, transformScript } from './policies';
import { add, at, isZero, row, subtract } from './vector';

/** The log keeps this many entries. Older entries drop off. */
const LOG_LIMIT = 300;

/* ------------------------------------------------------------------ */
/* Construction                                                        */
/* ------------------------------------------------------------------ */

const perProcess = <T,>(ids: readonly ProcessId[], value: T): Record<ProcessId, T> =>
  Object.fromEntries(ids.map((id) => [id, value]));

/** Make the start state for a scenario. The policy rewrites the scripts first. */
export function createSim(scenario: Scenario, policy: Policy): SimState {
  const resourceIds = scenario.resources.map((r) => r.id);
  const processes = scenario.processes.map((p) => ({ ...p, script: transformScript(policy, scenario.resources, p.script) }));
  const ids = processes.map((p) => p.id);

  return {
    scenarioId: scenario.id,
    policy,
    resources: scenario.resources,
    processes,
    claims: Object.fromEntries(processes.map((p) => [p.id, peakClaim(resourceIds, p.script)])),
    allocation: {},
    request: {},
    pc: perProcess(ids, 0),
    status: perProcess(ids, 'ready' as const),
    parked: perProcess(ids, false),
    executed: perProcess(ids, 0),
    victimCount: perProcess(ids, 0),
    checkpoint: perProcess(ids, 0),
    turn: 0,
    step: 0,
    log: [],
    outcome: 'running',
  };
}

/* ------------------------------------------------------------------ */
/* Snapshot for the algorithms                                         */
/* ------------------------------------------------------------------ */

/**
 * Give the detection algorithms a view of the state.
 * Under the mutual-exclusion policy, shareable resources hold as many instances as the processes use,
 * so they never look exhausted.
 */
export function toSnapshot(state: SimState): AllocationSnapshot {
  if (state.policy !== 'mutual-exclusion') return state;
  const resources = state.resources.map((r) => {
    if (!r.shareable) return r;
    const used = state.processes.reduce((sum, p) => sum + at(row(state.allocation, p.id), r.id), 0);
    return { ...r, instances: Math.max(r.instances, used) };
  });
  return { ...state, resources };
}

/* ------------------------------------------------------------------ */
/* Pure update helpers                                                 */
/* ------------------------------------------------------------------ */

const ids = (state: SimState) => state.resources.map((r) => r.id);

function setRow(matrix: Matrix, processId: ProcessId, vector: Vector): Matrix {
  return { ...matrix, [processId]: vector };
}

function appendLog(state: SimState, entry: LogEntry): readonly LogEntry[] {
  const log = [...state.log, entry];
  return log.length > LOG_LIMIT ? log.slice(log.length - LOG_LIMIT) : log;
}

/** Give back every instance that the process holds. */
export function releaseAll(state: SimState, processId: ProcessId): SimState {
  return { ...state, allocation: setRow(state.allocation, processId, {}) };
}

/** Add `items` to the allocation of the process and clear its request. */
export function grant(state: SimState, processId: ProcessId, items: Vector): SimState {
  return {
    ...state,
    allocation: setRow(state.allocation, processId, add(ids(state), row(state.allocation, processId), items)),
    request: setRow(state.request, processId, {}),
  };
}

/** Find the outcome: complete, deadlocked, or still running. */
export function evaluateOutcome(state: SimState): SimOutcome {
  const done = state.processes.every((p) => state.status[p.id] === 'finished' || state.status[p.id] === 'terminated');
  if (done) return 'complete';
  return analyzeState(toSnapshot(state)).isDeadlocked ? 'deadlocked' : 'running';
}

/* ------------------------------------------------------------------ */
/* Step                                                                */
/* ------------------------------------------------------------------ */

/**
 * Run one action. Processes take turns (round robin).
 * A waiting process acts only when its request can now be granted.
 * The step does nothing when the outcome is not 'running'.
 */
export function step(state: SimState): SimState {
  if (state.outcome !== 'running') return state;
  const count = state.processes.length;

  for (let k = 0; k < count; k += 1) {
    const index = (state.turn + k) % count;
    const next = act(state, state.processes[index].id);
    if (next) {
      const advanced: SimState = { ...next, turn: index + 1, step: state.step + 1 };
      return { ...advanced, outcome: evaluateOutcome(advanced) };
    }
  }

  // No process can act. This is a deadlock, or a state that the policy blocks.
  return { ...state, outcome: analyzeState(toSnapshot(state)).isDeadlocked ? 'deadlocked' : 'stalled' };
}

/** Run steps until the outcome is not 'running', or until `maxSteps`. */
export function run(state: SimState, maxSteps = 500): SimState {
  let current = state;
  for (let i = 0; i < maxSteps && current.outcome === 'running'; i += 1) current = step(current);
  return current;
}

/** Let one process act. Returns null when the process cannot act now. */
function act(state: SimState, processId: ProcessId): SimState | null {
  const status = state.status[processId];
  if (status === 'finished' || status === 'terminated') return null;
  if (status === 'waiting') return retry(state, processId);
  return execute(state, processId);
}

function bump(state: SimState, processId: ProcessId): Pick<SimState, 'executed'> {
  return { executed: { ...state.executed, [processId]: state.executed[processId] + 1 } };
}

/** A waiting process tries its request again. */
function retry(state: SimState, processId: ProcessId): SimState | null {
  const items = row(state.request, processId);
  const decision = decideRequest(state, processId, items);
  if (decision.kind !== 'grant') return null;

  const entryStep = state.step + 1;
  const ready = { ...state.status, [processId]: 'ready' as const };

  if (state.parked[processId]) {
    // No-preemption: the resources are free again, so the process starts its requests again.
    return {
      ...state,
      ...bump(state, processId),
      request: setRow(state.request, processId, {}),
      status: ready,
      parked: { ...state.parked, [processId]: false },
      log: appendLog(state, { step: entryStep, process: processId, kind: 'resume' }),
    };
  }

  const granted = grant(state, processId, items);
  return {
    ...granted,
    ...bump(state, processId),
    status: ready,
    pc: { ...state.pc, [processId]: state.pc[processId] + 1 },
    log: appendLog(state, { step: entryStep, process: processId, kind: 'acquire', items }),
  };
}

/** A ready process runs its next op. */
function execute(state: SimState, processId: ProcessId): SimState {
  const process = state.processes.find((p) => p.id === processId);
  if (!process) throw new Error(`Unknown process "${processId}".`);

  const resourceIds = ids(state);
  const pc = state.pc[processId];
  const held = row(state.allocation, processId);
  const entryStep = state.step + 1;

  // Save a checkpoint at each point where the process holds nothing.
  const base: SimState = {
    ...state,
    ...bump(state, processId),
    checkpoint: isZero(resourceIds, held) ? { ...state.checkpoint, [processId]: pc } : state.checkpoint,
  };
  const advance = { ...state.pc, [processId]: pc + 1 };

  const op = process.script[pc];
  if (!op) {
    const released = releaseAll(base, processId);
    return {
      ...released,
      status: { ...state.status, [processId]: 'finished' },
      log: appendLog(state, { step: entryStep, process: processId, kind: 'finish' }),
    };
  }

  if (op.kind === 'work') {
    return { ...base, pc: advance, log: appendLog(state, { step: entryStep, process: processId, kind: 'work' }) };
  }

  if (op.kind === 'release') {
    const items = clampToHeld(resourceIds, held, op.items);
    return {
      ...base,
      allocation: setRow(state.allocation, processId, subtract(resourceIds, held, items)),
      pc: advance,
      log: appendLog(state, { step: entryStep, process: processId, kind: 'release', items }),
    };
  }

  const decision = decideRequest(state, processId, op.items);

  if (decision.kind === 'grant') {
    return {
      ...grant(base, processId, op.items),
      pc: advance,
      log: appendLog(state, { step: entryStep, process: processId, kind: 'acquire', items: op.items }),
    };
  }

  if (decision.kind === 'restart') {
    // PDF (Eliminate No Preemption): "it must release all currently held resources and wait until
    // all required resources are free."
    const released = releaseAll(base, processId);
    return {
      ...released,
      request: setRow(state.request, processId, op.items),
      pc: { ...state.pc, [processId]: base.checkpoint[processId] },
      status: { ...state.status, [processId]: 'waiting' },
      parked: { ...state.parked, [processId]: true },
      victimCount: { ...state.victimCount, [processId]: state.victimCount[processId] + 1 },
      log: appendLog(state, { step: entryStep, process: processId, kind: 'restart', items: held }),
    };
  }

  return {
    ...base,
    request: setRow(state.request, processId, op.items),
    status: { ...state.status, [processId]: 'waiting' },
    log: appendLog(state, { step: entryStep, process: processId, kind: 'wait', items: op.items, reason: decision.reason }),
  };
}

function clampToHeld(resourceIds: readonly string[], held: Vector, items: Vector): Vector {
  const out: Record<string, number> = {};
  for (const id of resourceIds) out[id] = Math.min(at(held, id), at(items, id));
  return out;
}
