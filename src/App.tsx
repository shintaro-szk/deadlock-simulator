import { useState, useEffect } from 'react';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { ScenarioSelector } from './components/ScenarioSelector';
import { StatusPanel } from './components/StatusPanel';
import { ExplanationPanel } from './components/ExplanationPanel';
import { ProcessState, SimulationState, Scenario } from './core/types';
import { SimulationEngine } from './core/simulationEngine';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('safe');
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [engine, setEngine] = useState<SimulationEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenarios: Scenario[] = [
    {
      id: 'safe',
      name: 'Safe Execution',
      description: 'No deadlock - processes complete sequentially',
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
        ],
        resources: [
          {
            id: 'r1',
            name: 'Resource 1',
            totalInstances: 2,
            availableInstances: 2,
            heldBy: [],
          },
          {
            id: 'r2',
            name: 'Resource 2',
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
    },
    {
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
        ],
        currentStep: 0,
        isDeadlocked: true,
        deadlockCycle: ['p1', 'r1', 'p2', 'r2'],
        history: [],
      },
    },
    {
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
        ],
        currentStep: 0,
        isDeadlocked: false,
        deadlockCycle: [],
        history: [],
      },
    },
  ];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (scenario) {
      const newEngine = new SimulationEngine(scenario.initialState);
      setEngine(newEngine);
      setSimulationState(newEngine.getState());
      setIsPlaying(false);
    }
  }, [selectedScenario]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          handlePause();
        } else {
          handlePlay();
        }
      }
      if (e.code === 'ArrowRight' && !simulationState?.isDeadlocked) {
        e.preventDefault();
        handleStep();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, simulationState]);

  const handlePlay = () => {
    if (engine && !simulationState?.isDeadlocked) {
      engine.start();
      setIsPlaying(true);
      setSimulationState(engine.getState());
    }
  };

  const handlePause = () => {
    if (engine) {
      engine.pause();
      setIsPlaying(false);
      setSimulationState(engine.getState());
    }
  };

  const handleStep = () => {
    if (engine && !simulationState?.isDeadlocked) {
      engine.step();
      setSimulationState(engine.getState());
    }
  };

  const handleReset = () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (scenario) {
      const newEngine = new SimulationEngine(scenario.initialState);
      setEngine(newEngine);
      setSimulationState(newEngine.getState());
      setIsPlaying(false);
    }
  };

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  if (!simulationState) {
    return <div>Loading...</div>;
  }

  const getExplanation = () => {
    switch (selectedScenario) {
      case 'safe':
        return 'This scenario shows safe execution where processes complete without deadlock. Each process requests and releases resources in a sequential manner.';
      case 'deadlock':
        return 'This scenario demonstrates a circular wait condition. Process 1 holds Resource 1 and waits for Resource 2, while Process 2 holds Resource 2 and waits for Resource 1. Neither can proceed.';
      case 'prevention':
        return 'This scenario uses the Banker\'s algorithm to prevent deadlock. The system only grants resource requests if the resulting state is safe.';
      default:
        return '';
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            onSelect={handleScenarioSelect}
          />
        </div>
        <div>
          <StatusPanel state={simulationState} />
        </div>
      </div>

      <div className="mb-6">
        <ControlPanel
          isPlaying={isPlaying}
          isDeadlocked={simulationState.isDeadlocked}
          onPlay={handlePlay}
          onPause={handlePause}
          onStep={handleStep}
          onReset={handleReset}
        />
      </div>

      <SimulationCanvas state={simulationState} />

      <div className="mt-6">
        <ExplanationPanel
          title={scenarios.find(s => s.id === selectedScenario)?.name || ''}
          content={getExplanation()}
          isDeadlocked={simulationState.isDeadlocked}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Keyboard shortcuts: Space = Play/Pause, Arrow Right = Step</p>
      </div>
    </div>
  );
}

export default App;
