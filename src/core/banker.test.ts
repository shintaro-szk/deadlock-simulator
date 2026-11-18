import { describe, expect, it } from 'vitest';
import { checkSafety, evaluateRequest, needOf, type BankerState } from './banker';
import { textbookBanker, unsafeBanker } from './__fixtures__/snapshots';

describe('checkSafety', () => {
  it('finds the safe sequence for the textbook state', () => {
    const result = checkSafety(textbookBanker);
    expect(result.safe).toBe(true);
    expect(result.sequence).toEqual(['P1', 'P3', 'P4', 'P0', 'P2']);
    expect(result.stuck).toEqual([]);
  });

  it('records each check with Need and Work', () => {
    const [first, second] = checkSafety(textbookBanker).trace;
    expect(first).toMatchObject({ process: 'P0', canFinish: false, demand: { A: 7, B: 4, C: 3 }, work: { A: 3, B: 3, C: 2 } });
    expect(second).toMatchObject({ process: 'P1', canFinish: true, workAfter: { A: 5, B: 3, C: 2 } });
  });

  it('reports an unsafe state and the processes that cannot finish', () => {
    const result = checkSafety(unsafeBanker);
    expect(result.safe).toBe(false);
    expect(result.stuck).toEqual(['P1', 'P2']);
  });

  it('computes Need = Max - Allocation', () => {
    expect(needOf(textbookBanker, 'P2')).toEqual({ A: 6, B: 0, C: 0 });
  });
});

describe('evaluateRequest', () => {
  it('grants a request that keeps the system safe', () => {
    const verdict = evaluateRequest(textbookBanker, 'P1', { A: 1, B: 0, C: 2 });
    expect(verdict.outcome).toBe('granted');
    if (verdict.outcome !== 'granted') return;
    expect(verdict.after.available).toEqual({ A: 2, B: 3, C: 0 });
    expect(verdict.after.allocation.P1).toEqual({ A: 3, B: 0, C: 2 });
    expect(textbookBanker.available).toEqual({ A: 3, B: 3, C: 2 });
  });

  it('denies a request that leads to an unsafe state', () => {
    const afterP1 = evaluateRequest(textbookBanker, 'P1', { A: 1, B: 0, C: 2 });
    if (afterP1.outcome !== 'granted') throw new Error('setup failed');
    const verdict = evaluateRequest(afterP1.after, 'P0', { A: 0, B: 2, C: 0 });
    expect(verdict.outcome).toBe('unsafe');
  });

  it('makes the process wait when the instances are not free', () => {
    const afterP1 = evaluateRequest(textbookBanker, 'P1', { A: 1, B: 0, C: 2 });
    if (afterP1.outcome !== 'granted') throw new Error('setup failed');
    expect(evaluateRequest(afterP1.after, 'P4', { A: 3, B: 3, C: 0 }).outcome).toBe('must-wait');
  });

  it('rejects a request above the declared maximum claim', () => {
    expect(evaluateRequest(textbookBanker, 'P3', { A: 1, B: 0, C: 0 }).outcome).toBe('exceeds-claim');
  });

  it('old regression case: a request above Available is not granted', () => {
    const state: BankerState = {
      ...unsafeBanker,
      processes: unsafeBanker.processes.slice(0, 1),
      allocation: { P1: unsafeBanker.allocation.P1 },
      max: { P1: unsafeBanker.max.P1 },
    };
    expect(evaluateRequest(state, 'P1', { A: 3, B: 0, C: 0 }).outcome).toBe('must-wait');
  });
});
