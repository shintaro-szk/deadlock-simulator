import { Scenario, ProcessState } from '../core/types';

export const preventionScenario: Scenario = {
  id: 'prevention',
  name: 'Banker\'s Algorithm',
  description: 'Deadlock prevention using Banker\'s algorithm',
  initialState: {
    processes: [
      {
        id: 'p1',
        name: 'Process 1',
        heldResources: [],
        requestedResources: [],
        state: 'idle' as ProcessState,
      },
      {
        id: 'p2',
        name: 'Process 2',
        heldResources: [],
        requestedResources: [],
        state: 'idle' as ProcessState,
      },
      {
        id: 'p3',
        name: 'Process 3',
        heldResources: [],
        requestedResources: [],
        state: 'idle' as ProcessState,
      },
    ],
    resources: [
      {
        id: 'r1',
        name: 'Resource 1',
        totalInstances: 3,
        availableInstances: 3,
        heldBy: [],
      },
      {
        id: 'r2',
        name: 'Resource 2',
        totalInstances: 2,
        availableInstances: 2,
        heldBy: [],
      },
      {
        id: 'r3',
        name: 'Resource 3',
        totalInstances: 2,
        availableInstances: 2,
        heldBy: [],
      },
    ],
    currentStep: 0,
    isDeadlocked: false,
    deadlockCycle: [],
    history: [],
  },
};
