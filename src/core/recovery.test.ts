import { describe, expect, it } from 'vitest';
import { createSim, run } from './engine';
import { deadlockedProcesses, preempt, rollback, selectVictim, terminate, type VictimCriterion } from './recovery';
import { circularWait } from '../scenarios/circularWait';

// P1: priority 3, restart cost 3. P2: priority 1, restart cost 2. P3: priority 2, restart cost 1.
// P1 runs one extra step, so it has the longest execution time.
const deadlocked = run(createSim(circularWait, 'none'));

describe('selectVictim', () => {
  it.each<[VictimCriterion, string]>([
    ['priority', 'P2'],
    ['execution-time', 'P2'],
    ['resource-usage', 'P1'],
    ['restart-cost', 'P3'],
  ])('%s selects %s', (criterion, expected) => {
    expect(deadlocked.outcome).toBe('deadlocked');
    expect(selectVictim(deadlocked, deadlockedProcesses(deadlocked), criterion)).toBe(expected);
  });
});

describe('terminate', () => {
  it('one at a time: kills one victim, which breaks the cycle', () => {
    const { state, victims } = terminate(deadlocked, { criterion: 'priority', mode: 'one-at-a-time' });
    expect(victims).toEqual(['P2']);
    expect(state.status.P2).toBe('terminated');
    expect(state.outcome).toBe('running');
    const final = run(state);
    expect(final.outcome).toBe('complete');
    expect(final.status).toEqual({ P1: 'finished', P2: 'terminated', P3: 'finished' });
  });

  it('all at once: kills every deadlocked process', () => {
    const { state, victims } = terminate(deadlocked, { criterion: 'priority', mode: 'all' });
    expect(victims).toEqual(['P1', 'P2', 'P3']);
    expect(state.outcome).toBe('complete');
  });
});

describe('rollback', () => {
  it('sends the victim to its checkpoint and the system finishes', () => {
    const { state, victims } = rollback(deadlocked, 'restart-cost');
    expect(victims).toEqual(['P3']);
    expect(state.pc.P3).toBe(0);
    expect(state.allocation.P3).toEqual({});
    expect(state.victimCount.P3).toBe(1);
    expect(run(state).outcome).toBe('complete');
  });
});

describe('preempt', () => {
  it('gives the freed resource to a waiting process at once', () => {
    const { state, victims } = preempt(deadlocked, 'priority');
    expect(victims).toEqual(['P2']);
    // P2 held R2. P1 waited for R2, so P1 gets it now.
    expect(state.allocation.P1).toMatchObject({ R2: 1 });
    expect(state.status.P1).toBe('ready');
    expect(run(state).outcome).toBe('complete');
  });

  it('counts each time a process loses its resources (starvation risk)', () => {
    const first = preempt(deadlocked, 'priority').state;
    expect(first.victimCount.P2).toBe(1);
  });

  it('does nothing when there is no deadlock', () => {
    const fresh = createSim(circularWait, 'none');
    expect(preempt(fresh, 'priority')).toEqual({ state: fresh, victims: [] });
  });
});
