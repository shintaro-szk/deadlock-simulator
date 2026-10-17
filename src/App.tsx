import { useState, useEffect } from 'react';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { ScenarioSelector } from './components/ScenarioSelector';
import { StatusPanel } from './components/StatusPanel';
import { ExplanationPanel } from './components/ExplanationPanel';
import { DeadlockConditionsPanel } from './components/DeadlockConditionsPanel';
import { GlossaryPanel } from './components/GlossaryPanel';
import { ProgressIndicator } from './components/ProgressIndicator';
import { RAGVisualization } from './components/RAGVisualization';
import { WFGVisualization } from './components/WFGVisualization';
import { PreventionStrategiesPanel } from './components/PreventionStrategiesPanel';
import { BankerAlgorithmPanel } from './components/BankerAlgorithmPanel';
import { DetectionPanel } from './components/DetectionPanel';
import { RecoveryStrategiesPanel } from './components/RecoveryStrategiesPanel';
import { SimulationState, Scenario } from './core/types';
import { SimulationEngine } from './core/simulationEngine';
import { safeScenario } from './scenarios/safeScenario';
import { deadlockScenario } from './scenarios/deadlockScenario';
import { preventionScenario } from './scenarios/preventionScenario';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('safe');
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [engine, setEngine] = useState<SimulationEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scenarios: Scenario[] = [safeScenario, deadlockScenario, preventionScenario];

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
      setIsLoading(true);
      setTimeout(() => {
        const newEngine = new SimulationEngine(scenario.initialState);
        setEngine(newEngine);
        setSimulationState(newEngine.getState());
        setIsPlaying(false);
        setIsLoading(false);
      }, 300);
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

  if (!simulationState || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-process border-t-transparent"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading scenario...</p>
        </div>
      </div>
    );
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
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Deadlock Simulator
        </h1>
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-process"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            onSelect={handleScenarioSelect}
          />
        </div>
        <div className="space-y-4">
          <StatusPanel state={simulationState} />
          <ProgressIndicator state={simulationState} />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RAGVisualization state={simulationState} />
        <WFGVisualization state={simulationState} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DeadlockConditionsPanel />
        <GlossaryPanel />
      </div>

      <div className="mt-6">
        <PreventionStrategiesPanel />
      </div>

      <div className="mt-6">
        <BankerAlgorithmPanel />
      </div>

      <div className="mt-6">
        <DetectionPanel />
      </div>

      <div className="mt-6">
        <RecoveryStrategiesPanel />
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Keyboard shortcuts: Space = Play/Pause, Arrow Right = Step</p>
      </div>

      <footer className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
        <p>Deadlock Simulator - Educational Tool for Operating System Concepts</p>
      </footer>
    </div>
  );
}

export default App;
