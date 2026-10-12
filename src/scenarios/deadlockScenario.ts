import { Scenario, ProcessState } from '../core/types';

export const deadlockScenario: Scenario = {
  id: 'deadlock',
  name: 'Circular Wait',
  description: 'Deadlock demonstration with circular wait condition',
  initialState: {
    processes: [
      {
        id: 'p1',
        name: 'Process 1',
        heldResources: ['r1'],
        requestedResources: ['r2'],
        state: 'waiting' as ProcessState,
      },
      {
        id: 'p2',
        name: 'Process 2',
        heldResources: ['r2'],
        requestedResources: ['r3'],
        state: 'waiting' as ProcessState,
      },
      {
        id: 'p3',
        name: 'Process 3',
        heldResources: ['r3'],
        requestedResources: ['r1'],
        state: 'waiting' as ProcessState,
      },
    ],
    resources: [
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
    ],
    currentStep: 0,
    isDeadlocked: true,
    deadlockCycle: ['p1', 'r1', 'p2', 'r2', 'p3', 'r3'],
    history: [],
  },
};
