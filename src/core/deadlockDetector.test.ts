import { describe, it, expect } from 'vitest';
import { DeadlockDetector } from './deadlockDetector';
import { Process, Resource } from './types';

describe('DeadlockDetector', () => {
  it('detects no deadlock in safe state', () => {
    const detector = new DeadlockDetector();
    
    const processes: Process[] = [
      {
        id: 'p1',
        name: 'Process 1',
        heldResources: ['r1'],
        requestedResources: [],
        state: 'running',
      },
      {
        id: 'p2',
        name: 'Process 2',
        heldResources: [],
        requestedResources: ['r2'],
        state: 'waiting',
      },
    ];

    const resources: Resource[] = [
      {
        id: 'r1',
        name: 'Resource 1',
        totalInstances: 1,
        availableInstances: 0,
        heldBy: ['p1'],
      },
      {
        id: 'r2',
        name: 'Resource 2',
        totalInstances: 1,
        availableInstances: 1,
        heldBy: [],
      },
    ];

    const result = detector.detectDeadlock(processes, resources);
    
    expect(result.isDeadlocked).toBe(false);
    expect(result.cycle).toEqual([]);
  });

  it('detects deadlock in circular wait condition', () => {
    const detector = new DeadlockDetector();
    
    const processes: Process[] = [
      {
        id: 'p1',
        name: 'Process 1',
        heldResources: ['r1'],
        requestedResources: ['r2'],
        state: 'waiting',
      },
      {
        id: 'p2',
        name: 'Process 2',
        heldResources: ['r2'],
        requestedResources: ['r1'],
        state: 'waiting',
      },
    ];

    const resources: Resource[] = [
      {
        id: 'r1',
        name: 'Resource 1',
        totalInstances: 1,
        availableInstances: 0,
        heldBy: ['p1'],
      },
      {
        id: 'r2',
        name: 'Resource 2',
        totalInstances: 1,
        availableInstances: 0,
        heldBy: ['p2'],
      },
    ];

    const result = detector.detectDeadlock(processes, resources);
    
    expect(result.isDeadlocked).toBe(true);
    expect(result.cycle.length).toBeGreaterThan(0);
  });

  it('detects deadlock in three-process circular wait', () => {
    const detector = new DeadlockDetector();
    
    const processes: Process[] = [
      {
        id: 'p1',
        name: 'Process 1',
        heldResources: ['r1'],
        requestedResources: ['r2'],
        state: 'waiting',
      },
      {
        id: 'p2',
        name: 'Process 2',
        heldResources: ['r2'],
        requestedResources: ['r3'],
        state: 'waiting',
      },
      {
        id: 'p3',
        name: 'Process 3',
        heldResources: ['r3'],
        requestedResources: ['r1'],
        state: 'waiting',
      },
    ];

    const resources: Resource[] = [
      {
        id: 'r1',
        name: 'Resource 1',
        totalInstances: 1,
        availableInstances: 0,
        heldBy: ['p1'],
      },
      {
        id: 'r2',
        name: 'Resource 2',
        totalInstances: 1,
        availableInstances: 0,
        heldBy: ['p2'],
      },
      {
        id: 'r3',
        name: 'Resource 3',
        totalInstances: 1,
        availableInstances: 0,
        heldBy: ['p3'],
      },
    ];

    const result = detector.detectDeadlock(processes, resources);
    
    expect(result.isDeadlocked).toBe(true);
    expect(result.cycle.length).toBeGreaterThan(0);
  });

  it('handles empty state without deadlock', () => {
    const detector = new DeadlockDetector();
    
    const processes: Process[] = [];
    const resources: Resource[] = [];

    const result = detector.detectDeadlock(processes, resources);
    
    expect(result.isDeadlocked).toBe(false);
    expect(result.cycle).toEqual([]);
  });
});
