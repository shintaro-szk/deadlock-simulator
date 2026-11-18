import { describe, expect, it } from 'vitest';
import { peakClaim, transformScript } from './policies';
import { request, release, work } from '../scenarios/ops';
import { circularWait } from '../scenarios/circularWait';

const ids = circularWait.resources.map((r) => r.id);
const p3 = circularWait.processes[2].script; // request R3, work, request R1, work

describe('peakClaim', () => {
  it('returns the most instances held at one time', () => {
    expect(peakClaim(['R1'], [request('R1', 2), release('R1', 1), request('R1', 3)])).toEqual({ R1: 4 });
  });
});

describe('transformScript', () => {
  it('resource ordering: P3 asks for R1 before R3', () => {
    expect(transformScript('resource-ordering', circularWait.resources, p3)).toEqual([request('R1'), work, request('R3'), work]);
  });

  it('resource ordering: a release starts a new group', () => {
    const script = [request('R3'), release('R3'), request('R1')];
    expect(transformScript('resource-ordering', circularWait.resources, script)).toEqual(script);
  });

  it('all at once: one request for the whole claim, then the work', () => {
    expect(transformScript('all-at-once', circularWait.resources, p3)).toEqual([
      { kind: 'request', items: { R1: 1, R2: 0, R3: 1 } },
      work,
      work,
    ]);
  });

  it('release before request: give back R3, then ask for R3 and R1 together', () => {
    expect(transformScript('release-before-request', circularWait.resources, p3)).toEqual([
      request('R3'),
      work,
      { kind: 'release', items: { R1: 0, R2: 0, R3: 1 } },
      { kind: 'request', items: { R1: 1, R2: 0, R3: 1 } },
      work,
    ]);
  });

  it('other policies keep the script', () => {
    expect(transformScript('banker', circularWait.resources, p3)).toEqual(p3);
    expect(ids).toEqual(['R1', 'R2', 'R3']);
  });
});
