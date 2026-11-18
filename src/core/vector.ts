import type { AllocationSnapshot, Matrix, ProcessId, ResourceId, Vector } from './model';

/** Read one entry. A missing entry is 0. */
export function at(vector: Vector | undefined, resourceId: ResourceId): number {
  return vector?.[resourceId] ?? 0;
}

/** Read one row of a matrix. A missing row is an empty vector. */
export function row(matrix: Matrix, processId: ProcessId): Vector {
  return matrix[processId] ?? {};
}

export function add(ids: readonly ResourceId[], a: Vector, b: Vector): Vector {
  const out: Record<ResourceId, number> = {};
  for (const id of ids) out[id] = at(a, id) + at(b, id);
  return out;
}

export function subtract(ids: readonly ResourceId[], a: Vector, b: Vector): Vector {
  const out: Record<ResourceId, number> = {};
  for (const id of ids) out[id] = at(a, id) - at(b, id);
  return out;
}

/** True when every entry of a is less than or equal to the same entry of b. */
export function lessOrEqual(ids: readonly ResourceId[], a: Vector, b: Vector): boolean {
  return ids.every((id) => at(a, id) <= at(b, id));
}

export function isZero(ids: readonly ResourceId[], v: Vector): boolean {
  return ids.every((id) => at(v, id) === 0);
}

export function resourceIds(snapshot: Pick<AllocationSnapshot, 'resources'>): ResourceId[] {
  return snapshot.resources.map((r) => r.id);
}

/** Available = total instances - instances that all processes hold. */
export function availableOf(snapshot: Pick<AllocationSnapshot, 'resources' | 'processes' | 'allocation'>): Vector {
  const out: Record<ResourceId, number> = {};
  for (const resource of snapshot.resources) {
    let held = 0;
    for (const process of snapshot.processes) held += at(row(snapshot.allocation, process.id), resource.id);
    out[resource.id] = resource.instances - held;
  }
  return out;
}
