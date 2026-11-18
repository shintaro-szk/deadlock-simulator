import { describe, expect, it } from 'vitest';
import { circularWait } from '../scenarios/circularWait';
import { DEFAULT_SPEED, initialStore } from './useSimulation';

describe('initialStore', () => {
  it('starts paused at step 0 and at 0.5x speed', () => {
    const store = initialStore(circularWait, 'none');
    expect(store.playing).toBe(false);
    expect(store.speed).toBe(0.5);
    expect(DEFAULT_SPEED).toBe(0.5);
    expect(store.index).toBe(0);
    expect(store.history).toHaveLength(1);
    expect(store.history[0].step).toBe(0);
    expect(store.history[0].outcome).toBe('running');
  });
});
