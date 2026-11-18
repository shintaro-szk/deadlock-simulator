/**
 * State model for the deadlock algorithms.
 *
 * The allocation and request matrices are the source of truth.
 * The Resource Allocation Graph, the Wait-for Graph, and the Available vector come from them.
 */

export type ProcessId = string;
export type ResourceId = string;

/** Instance count per resource type. A missing key means 0. */
export type Vector = Readonly<Record<ResourceId, number>>;

/** One vector per process. A missing row means all 0. */
export type Matrix = Readonly<Record<ProcessId, Vector>>;

export interface ResourceSpec {
  readonly id: ResourceId;
  readonly label: string;
  /** Total number of identical instances. 1 means a single-instance resource. */
  readonly instances: number;
  /** Global order number for the resource-ordering prevention rule (PDF: Printer = 1, Scanner = 2). */
  readonly order: number;
  /**
   * PDF: "sharable resources like read-only files can be accessed by multiple processes at the same time."
   * Only the eliminate-mutual-exclusion policy uses this flag.
   */
  readonly shareable?: boolean;
}

export interface ProcessSpec {
  readonly id: ProcessId;
  readonly label: string;
  /** Higher number means more important. Recovery uses it to select a victim. */
  readonly priority: number;
}

/** A point-in-time view of who holds what and who waits for what. */
export interface AllocationSnapshot {
  readonly resources: readonly ResourceSpec[];
  readonly processes: readonly ProcessSpec[];
  /** Instances that each process holds now. */
  readonly allocation: Matrix;
  /** Instances that each process waits for now (outstanding requests). */
  readonly request: Matrix;
}

/* ------------------------------------------------------------------ */
/* Simulation                                                          */
/* ------------------------------------------------------------------ */

/**
 * One instruction in a process script.
 * - request: ask for all `items` at the same time (atomic).
 * - release: give back `items`.
 * - work: use the held resources for one step.
 * When the script ends, the process finishes and releases everything it holds.
 */
export type Op =
  | { readonly kind: 'request'; readonly items: Vector }
  | { readonly kind: 'release'; readonly items: Vector }
  | { readonly kind: 'work' };

export interface SimProcessSpec extends ProcessSpec {
  readonly script: readonly Op[];
  /** Cost to restart the process. Recovery uses it to select a victim. */
  readonly restartCost: number;
}

export interface Scenario {
  readonly id: string;
  readonly title: string;
  readonly resources: readonly ResourceSpec[];
  readonly processes: readonly SimProcessSpec[];
}

/**
 * How the system handles deadlock.
 * - none: no handling. Deadlock can occur.
 * - mutual-exclusion: shareable resources do not block (prevention).
 * - all-at-once: request all resources before start (prevention, eliminate wait).
 * - release-before-request: release all held resources before a new request (prevention, eliminate hold).
 * - no-preemption: if a request is not free, release everything and wait (prevention).
 * - resource-ordering: request resources only in increasing order (prevention, eliminate circular wait).
 * - banker: grant a request only when the result is safe (avoidance).
 */
export type Policy =
  | 'none'
  | 'mutual-exclusion'
  | 'all-at-once'
  | 'release-before-request'
  | 'no-preemption'
  | 'resource-ordering'
  | 'banker';

export type ProcessStatus = 'ready' | 'waiting' | 'finished' | 'terminated';

export type WaitReason = 'unavailable' | 'unsafe' | 'order';

export type LogEntry =
  | { readonly step: number; readonly process: ProcessId; readonly kind: 'acquire' | 'release'; readonly items: Vector }
  | { readonly step: number; readonly process: ProcessId; readonly kind: 'wait'; readonly items: Vector; readonly reason: WaitReason }
  | { readonly step: number; readonly process: ProcessId; readonly kind: 'restart'; readonly items: Vector }
  | { readonly step: number; readonly process: ProcessId; readonly kind: 'work' | 'finish' | 'resume' }
  | { readonly step: number; readonly process: ProcessId; readonly kind: 'terminate' | 'rollback' | 'preempt'; readonly items: Vector };

export type SimOutcome = 'running' | 'complete' | 'deadlocked' | 'stalled';

export interface SimState {
  readonly scenarioId: string;
  readonly policy: Policy;
  readonly resources: readonly ResourceSpec[];
  /** Processes with scripts after the policy transform. */
  readonly processes: readonly SimProcessSpec[];
  /** Maximum claim of each process (peak holding in its script). Banker's uses it. */
  readonly claims: Matrix;
  readonly allocation: Matrix;
  /** Outstanding requests. A request edge in the RAG. */
  readonly request: Matrix;
  /** Index of the next op in each script. */
  readonly pc: Readonly<Record<ProcessId, number>>;
  readonly status: Readonly<Record<ProcessId, ProcessStatus>>;
  /**
   * True when a process released everything under the no-preemption policy.
   * It resumes when its request is free, but it does not take the resources yet.
   */
  readonly parked: Readonly<Record<ProcessId, boolean>>;
  /** Steps that each process has run (execution time). */
  readonly executed: Readonly<Record<ProcessId, number>>;
  /** Times that each process lost its resources (restart, rollback, preemption). Shows starvation risk. */
  readonly victimCount: Readonly<Record<ProcessId, number>>;
  /** Last script position where the process held nothing. Rollback returns here. */
  readonly checkpoint: Readonly<Record<ProcessId, number>>;
  /** Index of the process that gets the next turn (round robin). */
  readonly turn: number;
  readonly step: number;
  readonly log: readonly LogEntry[];
  readonly outcome: SimOutcome;
}
