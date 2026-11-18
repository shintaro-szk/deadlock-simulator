import type { Op, Policy, ProcessId, ResourceId, ResourceSpec, SimState, Vector, WaitReason } from './model';
import { evaluateRequest, type BankerState } from './banker';
import { add, at, availableOf, isZero, lessOrEqual, row, subtract } from './vector';

/* ------------------------------------------------------------------ */
/* Script transforms                                                   */
/* ------------------------------------------------------------------ */

/** The highest number of instances that the script holds at one time, per resource. This is the maximum claim. */
export function peakClaim(resourceIds: readonly ResourceId[], script: readonly Op[]): Vector {
  let held: Vector = {};
  const peak: Record<ResourceId, number> = {};
  for (const id of resourceIds) peak[id] = 0;
  for (const op of script) {
    if (op.kind === 'request') held = add(resourceIds, held, op.items);
    if (op.kind === 'release') held = clampAtZero(resourceIds, subtract(resourceIds, held, op.items));
    for (const id of resourceIds) peak[id] = Math.max(peak[id], at(held, id));
  }
  return peak;
}

function clampAtZero(ids: readonly ResourceId[], v: Vector): Vector {
  const out: Record<ResourceId, number> = {};
  for (const id of ids) out[id] = Math.max(0, at(v, id));
  return out;
}

/** PDF (Eliminate Hold and Wait, eliminate wait): "A process requests all its resources before it starts." */
function allAtOnce(ids: readonly ResourceId[], script: readonly Op[]): Op[] {
  const claim = peakClaim(ids, script);
  const work = script.filter((op) => op.kind === 'work');
  return isZero(ids, claim) ? work : [{ kind: 'request', items: claim }, ...work];
}

/**
 * PDF (Eliminate Hold and Wait, eliminate hold): "The process has to release all resources it is
 * currently holding before making a new request."
 * The process then asks for the old and the new resources together.
 */
function releaseBeforeRequest(ids: readonly ResourceId[], script: readonly Op[]): Op[] {
  const out: Op[] = [];
  let held: Vector = {};
  for (const op of script) {
    if (op.kind === 'request' && !isZero(ids, held)) {
      out.push({ kind: 'release', items: held });
      const bundle = add(ids, held, op.items);
      out.push({ kind: 'request', items: bundle });
      held = bundle;
      continue;
    }
    if (op.kind === 'request') held = add(ids, held, op.items);
    if (op.kind === 'release') held = clampAtZero(ids, subtract(ids, held, op.items));
    out.push(op);
  }
  return out;
}

/**
 * PDF (Eliminate Circular Wait): "Assign each resource a strict order or unique number, and processes
 * can request resources only in increasing order."
 * Between two releases, the requests keep their positions, but they ask in increasing order.
 */
function resourceOrdering(resources: readonly ResourceSpec[], script: readonly Op[]): Op[] {
  const orderOf = new Map(resources.map((r) => [r.id, r.order]));
  const rank = (items: Vector) =>
    Math.min(...Object.keys(items).filter((id) => items[id] > 0).map((id) => orderOf.get(id) ?? Number.MAX_SAFE_INTEGER));

  const out = [...script];
  let segment: number[] = [];
  const flush = () => {
    const sorted = segment.map((i) => out[i]).sort((a, b) => rank(itemsOf(a)) - rank(itemsOf(b)));
    segment.forEach((index, k) => {
      out[index] = sorted[k];
    });
    segment = [];
  };
  script.forEach((op, i) => {
    if (op.kind === 'request') segment.push(i);
    if (op.kind === 'release') flush();
  });
  flush();
  return out;
}

function itemsOf(op: Op): Vector {
  return op.kind === 'work' ? {} : op.items;
}

/** Rewrite a script so that it obeys the policy. Policies that act at grant time return the script as it is. */
export function transformScript(policy: Policy, resources: readonly ResourceSpec[], script: readonly Op[]): Op[] {
  const ids = resources.map((r) => r.id);
  switch (policy) {
    case 'all-at-once':
      return allAtOnce(ids, script);
    case 'release-before-request':
      return releaseBeforeRequest(ids, script);
    case 'resource-ordering':
      return resourceOrdering(resources, script);
    case 'none':
    case 'mutual-exclusion':
    case 'no-preemption':
    case 'banker':
      return [...script];
  }
}

/* ------------------------------------------------------------------ */
/* Grant rules                                                         */
/* ------------------------------------------------------------------ */

export type GrantDecision =
  | { readonly kind: 'grant' }
  | { readonly kind: 'wait'; readonly reason: WaitReason }
  /** No-preemption policy: release everything and wait. */
  | { readonly kind: 'restart' };

/**
 * Free instances that a request can use.
 * PDF (Eliminate Mutual Exclusion): shareable resources never block, so they count as unlimited.
 */
export function effectiveAvailable(state: SimState): Vector {
  const available = availableOf(state);
  if (state.policy !== 'mutual-exclusion') return available;
  const out: Record<ResourceId, number> = { ...available };
  for (const r of state.resources) if (r.shareable) out[r.id] = Number.POSITIVE_INFINITY;
  return out;
}

export function toBankerState(state: SimState): BankerState {
  return {
    resources: state.resources,
    processes: state.processes,
    allocation: state.allocation,
    max: state.claims,
    available: availableOf(state),
  };
}

/** Decide what happens when a process asks for `items`. */
export function decideRequest(state: SimState, processId: ProcessId, items: Vector): GrantDecision {
  const ids = state.resources.map((r) => r.id);
  const held = row(state.allocation, processId);

  if (state.policy === 'resource-ordering' && breaksOrder(state.resources, held, items)) {
    return { kind: 'wait', reason: 'order' };
  }

  const free = lessOrEqual(ids, items, effectiveAvailable(state));

  if (state.policy === 'banker') {
    const verdict = evaluateRequest(toBankerState(state), processId, items);
    if (verdict.outcome === 'granted') return { kind: 'grant' };
    if (verdict.outcome === 'unsafe') return { kind: 'wait', reason: 'unsafe' };
    // 'exceeds-claim' cannot happen because the claim is the peak of the script. Wait to stay safe.
    return { kind: 'wait', reason: verdict.outcome === 'must-wait' ? 'unavailable' : 'unsafe' };
  }

  if (free) return { kind: 'grant' };
  if (state.policy === 'no-preemption' && !isZero(ids, held)) return { kind: 'restart' };
  return { kind: 'wait', reason: 'unavailable' };
}

/** True when the request asks for a resource with a lower order number than one that the process holds. */
function breaksOrder(resources: readonly ResourceSpec[], held: Vector, items: Vector): boolean {
  const heldOrders = resources.filter((r) => at(held, r.id) > 0).map((r) => r.order);
  if (heldOrders.length === 0) return false;
  const highest = Math.max(...heldOrders);
  return resources.some((r) => at(items, r.id) > 0 && at(held, r.id) === 0 && r.order < highest);
}
