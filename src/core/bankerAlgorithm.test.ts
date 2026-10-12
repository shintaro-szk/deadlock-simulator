import { describe, it, expect } from 'vitest';
import { BankerAlgorithm } from './bankerAlgorithm';
import { ProcessState } from './types';

describe('BankerAlgorithm', () => {
  it('identifies safe state', () => {
    const allocation = {
      p1: { r1: 0, r2: 1, r3: 0 },
      p2: { r1: 2, r2: 0, r3: 0 },
      p3: { r1: 3, r2: 0, r3: 2 },
      p4: { r1: 2, r2: 1, r3: 1 },
      p5: { r1: 0, r2: 0, r3: 2 },
    };

    const max = {
      p1: { r1: 0, r2: 1, r3: 0 },
      p2: { r1: 2, r2: 0, r3: 0 },
      p3: { r1: 3, r2: 0, r3: 2 },
      p4: { r1: 2, r2: 1, r3: 1 },
      p5: { r1: 0, r2: 0, r3: 2 },
    };

    const available = { r1: 3, r2: 3, r3: 2 };

    const banker = new BankerAlgorithm(allocation, max, available);
    const processes = [
      { id: 'p1', name: 'P1', heldResources: [], requestedResources: [], state: 'idle' as ProcessState },
      { id: 'p2', name: 'P2', heldResources: [], requestedResources: [], state: 'idle' as ProcessState },
      { id: 'p3', name: 'P3', heldResources: [], requestedResources: [], state: 'idle' as ProcessState },
      { id: 'p4', name: 'P4', heldResources: [], requestedResources: [], state: 'idle' as ProcessState },
      { id: 'p5', name: 'P5', heldResources: [], requestedResources: [], state: 'idle' as ProcessState },
    ];

    const isSafe = banker.isSafeState(processes);
    
    expect(isSafe).toBe(true);
  });

  it('identifies unsafe state', () => {
    const allocation = {
      p1: { r1: 0, r2: 1, r3: 0 },
      p2: { r1: 2, r2: 0, r3: 0 },
    };

    const max = {
      p1: { r1: 7, r2: 5, r3: 3 },
      p2: { r1: 3, r2: 2, r3: 2 },
    };

    const available = { r1: 2, r2: 3, r3: 0 };

    const banker = new BankerAlgorithm(allocation, max, available);
    const processes = [
      { id: 'p1', name: 'P1', heldResources: [], requestedResources: [], state: 'idle' as ProcessState },
      { id: 'p2', name: 'P2', heldResources: [], requestedResources: [], state: 'idle' as ProcessState },
    ];

    const isSafe = banker.isSafeState(processes);
    
    expect(isSafe).toBe(false);
  });

  it('grants safe resource request', () => {
    const allocation = {
      p1: { r1: 0, r2: 1, r3: 0 },
      p2: { r1: 2, r2: 0, r3: 0 },
    };

    const max = {
      p1: { r1: 2, r2: 1, r3: 0 },
      p2: { r1: 2, r2: 0, r3: 0 },
    };

    const available = { r1: 3, r2: 3, r3: 2 };

    const banker = new BankerAlgorithm(allocation, max, available);
    
    const request = { r1: 1, r2: 0, r3: 0 };
    const granted = banker.requestResources('p1', request);
    
    expect(granted).toBe(true);
  });

  it('rejects unsafe resource request', () => {
    const allocation = {
      p1: { r1: 0, r2: 1, r3: 0 },
    };

    const max = {
      p1: { r1: 7, r2: 5, r3: 3 },
    };

    const available = { r1: 2, r2: 3, r3: 0 };

    const banker = new BankerAlgorithm(allocation, max, available);
    
    const request = { r1: 3, r2: 0, r3: 0 };
    const granted = banker.requestResources('p1', request);
    
    expect(granted).toBe(false);
  });
});
