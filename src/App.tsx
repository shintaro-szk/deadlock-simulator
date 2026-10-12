import { useState, useEffect } from 'react';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ProcessState, SimulationState } from './core/types';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const testState: SimulationState = {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Deadlock Simulator
        </h1>
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      
      <SimulationCanvas state={testState} />
    </div>
  );
}

export default App;
