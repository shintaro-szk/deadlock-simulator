import { describe, expect, it } from 'vitest';
import { cycleEdgeIds, findCycle } from './cycle';
import { buildRag, buildWaitFor } from './rag';
import { noCycle, threeProcessCycle, twoProcessCycle } from './__fixtures__/snapshots';

const ragCycle = (s: Parameters<typeof buildRag>[0]) => {
  const g = buildRag(s);
  return findCycle(g.nodes.map((n) => n.id), g.edges);
};

describe('findCycle', () => {
  it('returns the PDF cycle P1 → R1 → P2 → R2 in path order', () => {
    expect(ragCycle(twoProcessCycle)).toEqual(['P1', 'R1', 'P2', 'R2']);
  });

  it('returns only the nodes on the cycle, not the path that leads to it', () => {
    const cycle = findCycle(['A', 'B', 'C', 'D'], [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' },
      { from: 'D', to: 'B' },
    ]);
    expect(cycle).toEqual(['B', 'C', 'D']);
  });

  it('returns null when there is no cycle', () => {
    expect(ragCycle(noCycle)).toBeNull();
    expect(findCycle([], [])).toBeNull();
  });

  it('gives the closing edges, including the edge back to the start', () => {
    expect(cycleEdgeIds(['P1', 'R1', 'P2', 'R2'])).toEqual(['P1->R1', 'R1->P2', 'P2->R2', 'R2->P1']);
  });
});

describe('buildRag', () => {
  it('makes request edges P → R and assignment edges R → P', () => {
    const { edges } = buildRag(twoProcessCycle);
    expect(edges.filter((e) => e.kind === 'request').map((e) => e.id).sort()).toEqual(['P1->R1', 'P2->R2']);
    expect(edges.filter((e) => e.kind === 'assignment').map((e) => e.id).sort()).toEqual(['R1->P2', 'R2->P1']);
  });
});

describe('buildWaitFor', () => {
  it('removes resource nodes and gives the PDF cycle P1 → P2 → P3 → P1', () => {
    const wfg = buildWaitFor(threeProcessCycle);
    expect(wfg.nodes.every((n) => n.kind === 'process')).toBe(true);
    expect(wfg.edges.map((e) => e.id)).toEqual(['P1->P2', 'P2->P3', 'P3->P1']);
    expect(wfg.edges[0].via).toEqual(['R2']);
    expect(findCycle(wfg.nodes.map((n) => n.id), wfg.edges)).toEqual(['P1', 'P2', 'P3']);
  });

  it('has no edge when the requested resource is free', () => {
    expect(buildWaitFor(noCycle).edges).toEqual([]);
  });
});
