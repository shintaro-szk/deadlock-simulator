import { useState, useEffect, useCallback } from 'react';
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
import { ReferencesPanel } from './components/ReferencesPanel';
import { SimulationState, Scenario } from './core/types';
import { SimulationEngine } from './core/simulationEngine';
import { safeScenario } from './scenarios/safeScenario';
import { deadlockScenario } from './scenarios/deadlockScenario';
import { preventionScenario } from './scenarios/preventionScenario';

const scenarios: Scenario[] = [safeScenario, deadlockScenario, preventionScenario];

function App() {
  const [selectedScenario, setSelectedScenario] = useState<string>('safe');
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [engine, setEngine] = useState<SimulationEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isLoading = false;

  useEffect(() => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (scenario) {
      const newEngine = new SimulationEngine(scenario.initialState);
      setEngine(newEngine);
      setSimulationState(newEngine.getState());
      setIsPlaying(false);
    }
  }, [selectedScenario]);

  const handlePlay = useCallback(() => {
    if (engine && !simulationState?.isDeadlocked) {
      engine.start();
      setIsPlaying(true);
      setSimulationState(engine.getState());
    }
  }, [engine, simulationState?.isDeadlocked]);

  const handlePause = useCallback(() => {
    if (engine) {
      engine.pause();
      setIsPlaying(false);
      setSimulationState(engine.getState());
    }
  }, [engine]);

  const handleStep = useCallback(() => {
    if (engine && !simulationState?.isDeadlocked) {
      engine.step();
      setSimulationState(engine.getState());
    }
  }, [engine, simulationState?.isDeadlocked]);

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
  }, [isPlaying, simulationState?.isDeadlocked, handlePlay, handlePause, handleStep]);

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
      <header className="mb-8 flex items-baseline gap-3 border-b border-line pb-4">
        <span aria-hidden="true" className="inline-block h-3 w-3 self-center bg-signal" />
        <h1 className="font-display text-4xl font-bold text-fg">
          Deadlock Simulator
        </h1>
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

      <div className="mt-6">
        <ReferencesPanel />
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
