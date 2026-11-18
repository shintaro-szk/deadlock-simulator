import { describe, expect, it } from 'vitest';
import type { Policy, Scenario } from './model';
import { createSim, run, step } from './engine';
import { analyzeState } from './detection';
import { circularWait } from '../scenarios/circularWait';
import { safeSequential } from '../scenarios/safeSequential';
import { printerScanner } from '../scenarios/printerScanner';
import { bankerExample } from '../scenarios/bankerExample';

const finalOf = (scenario: Scenario, policy: Policy) => run(createSim(scenario, policy));

describe('engine without deadlock handling', () => {
  it('runs the circular wait into deadlock, with a cycle through all three processes', () => {
    const final = finalOf(circularWait, 'none');
    expect(final.outcome).toBe('deadlocked');
    expect(final.step).toBe(10);
    const analysis = analyzeState(final);
    expect(analysis.deadlocked).toEqual(['P1', 'P2', 'P3']);
    expect(analysis.cycleIsSingleInstance).toBe(true);
  });

  it('finishes the safe scenario', () => {
    const final = finalOf(safeSequential, 'none');
    expect(final.outcome).toBe('complete');
    expect(Object.values(final.status)).toEqual(['finished', 'finished', 'finished']);
    expect(final.allocation).toEqual({ P1: {}, P2: {}, P3: {} });
  });

  it('deadlocks the printer and scanner example', () => {
    expect(finalOf(printerScanner, 'none').outcome).toBe('deadlocked');
  });

  it('deadlocks the Banker scenario when no avoidance is used', () => {
    expect(finalOf(bankerExample, 'none').outcome).toBe('deadlocked');
  });

  it('records a request edge when a process must wait', () => {
    let state = createSim(printerScanner, 'none');
    for (let i = 0; i < 5; i += 1) state = step(state);
    expect(state.status.P1).toBe('waiting');
    expect(state.request.P1).toEqual({ R2: 1 });
    expect(state.log[state.log.length - 1]).toMatchObject({ process: 'P1', kind: 'wait', reason: 'unavailable' });
  });

  it('does nothing after the run has ended', () => {
    const final = finalOf(circularWait, 'none');
    expect(step(final)).toBe(final);
  });

  it('does not change the previous state (pure update)', () => {
    const start = createSim(circularWait, 'none');
    const snapshot = JSON.stringify(start);
    step(start);
    expect(JSON.stringify(start)).toBe(snapshot);
  });
});

describe('prevention and avoidance stop the circular wait', () => {
  const policies: Policy[] = ['mutual-exclusion', 'all-at-once', 'release-before-request', 'no-preemption', 'resource-ordering', 'banker'];

  it.each(policies)('%s: every process finishes', (policy) => {
    const final = finalOf(circularWait, policy);
    expect(final.outcome).toBe('complete');
    expect(Object.values(final.status).every((s) => s === 'finished')).toBe(true);
  });

  it('resource ordering stops the printer and scanner deadlock', () => {
    expect(finalOf(printerScanner, 'resource-ordering').outcome).toBe('complete');
  });

  it('mutual exclusion does not help when no resource is shareable', () => {
    expect(finalOf(printerScanner, 'mutual-exclusion').outcome).toBe('deadlocked');
  });

  it("Banker's denies the unsafe request and the system finishes", () => {
    const final = finalOf(bankerExample, 'banker');
    expect(final.outcome).toBe('complete');
    expect(final.log.some((e) => e.kind === 'wait' && e.reason === 'unsafe')).toBe(true);
  });

  it('no preemption restarts a process, which shows the starvation risk', () => {
    const final = finalOf(circularWait, 'no-preemption');
    expect(final.log.some((e) => e.kind === 'restart')).toBe(true);
    expect(Object.values(final.victimCount).some((n) => n > 0)).toBe(true);
  });
});
