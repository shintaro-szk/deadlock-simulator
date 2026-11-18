import { describe, expect, it } from 'vitest';
import { analyzeState, detectDeadlock } from './detection';
import {
  cycleWithoutDeadlock,
  empty,
  noCycle,
  pdfMultiInstance,
  threeProcessCycle,
  twoProcessCycle,
} from './__fixtures__/snapshots';

describe('detectDeadlock', () => {
  it('reports every process in a single-instance circular wait', () => {
    expect(detectDeadlock(twoProcessCycle).deadlocked).toEqual(['P1', 'P2']);
    expect(detectDeadlock(threeProcessCycle).deadlocked).toEqual(['P1', 'P2', 'P3']);
  });

  it('follows the PDF multiple-instance example: P2 finishes first, then P1', () => {
    const result = detectDeadlock(pdfMultiInstance);
    expect(result.deadlocked).toEqual([]);
    expect(result.finishOrder).toEqual(['P2', 'P1']);

    const [first, second, third] = result.trace;
    expect(first).toMatchObject({ pass: 1, process: 'P1', canFinish: false, work: { R1: 1 } });
    expect(second).toMatchObject({ pass: 1, process: 'P2', canFinish: true, workAfter: { R1: 2 } });
    expect(third).toMatchObject({ pass: 2, process: 'P1', canFinish: true, workAfter: { R1: 3 } });
  });

  it('skips processes that hold nothing', () => {
    expect(detectDeadlock(noCycle)).toMatchObject({ deadlocked: [], skipped: ['P2'] });
  });

  it('handles an empty system', () => {
    expect(detectDeadlock(empty).deadlocked).toEqual([]);
  });
});

describe('analyzeState', () => {
  it('marks a single-instance cycle as deadlock', () => {
    const a = analyzeState(threeProcessCycle);
    expect(a.isDeadlocked).toBe(true);
    expect(a.cycle).toEqual(['P1', 'R2', 'P2', 'R3', 'P3', 'R1']);
    expect(a.cycleIsSingleInstance).toBe(true);
  });

  it('finds a cycle with multiple instances but no deadlock (necessary, not sufficient)', () => {
    const a = analyzeState(cycleWithoutDeadlock);
    expect(a.cycle).toEqual(['P1', 'R1', 'P3', 'R2']);
    expect(a.cycleIsSingleInstance).toBe(false);
    expect(a.isDeadlocked).toBe(false);
  });

  it('reports no cycle and no deadlock for a safe state', () => {
    const a = analyzeState(noCycle);
    expect(a.cycle).toBeNull();
    expect(a.isDeadlocked).toBe(false);
  });
});
