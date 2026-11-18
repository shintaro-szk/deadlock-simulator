import type { Op, ResourceId } from '../core/model';

/** Ask for `count` instances of one resource. */
export const request = (resource: ResourceId, count = 1): Op => ({ kind: 'request', items: { [resource]: count } });

/** Give back `count` instances of one resource. */
export const release = (resource: ResourceId, count = 1): Op => ({ kind: 'release', items: { [resource]: count } });

/** Use the held resources for one step. */
export const work: Op = { kind: 'work' };
