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
