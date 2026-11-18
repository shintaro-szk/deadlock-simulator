import { useState } from 'react';
import type { Scenario } from '../core/model';
import { useSimulation } from '../hooks/useSimulation';
import { useIsActiveChapter } from '../components/shell/activeChapter';
import { SimPanel } from '../components/sim/SimPanel';
import { ScriptView } from '../components/sim/ScriptView';
import { OptionGroup } from '../components/ui/OptionGroup';
import { circularWait } from '../scenarios/circularWait';
import { printerScanner } from '../scenarios/printerScanner';
import {
  preventionChoices,
  preventionNote,
  scenarioChoices,
  type PreventionPolicy,
  type ScenarioChoice,
} from '../content/demoText';

const scenarios: Record<ScenarioChoice, Scenario> = { 'circular-wait': circularWait, 'printer-scanner': printerScanner };

/** Chapter 04: pick a prevention strategy and see how it rewrites the scripts and changes the run. */
export default function PreventionDemo() {
  const [policy, setPolicy] = useState<PreventionPolicy>('resource-ordering');
  const [scenarioId, setScenarioId] = useState<ScenarioChoice>('printer-scanner');
  const scenario = scenarios[scenarioId];
  const sim = useSimulation(scenario, policy, { keyboard: useIsActiveChapter('prevention') });

  const controls = (
    <div className="space-y-4">
      <OptionGroup label="Strategy" options={preventionChoices} value={policy} onChange={setPolicy} />
      <OptionGroup label="Example" options={scenarioChoices} value={scenarioId} onChange={setScenarioId} />
      <p className="text-sm text-fg-muted">{preventionNote[policy]}</p>
    </div>
  );

  return <SimPanel sim={sim} title={scenario.title} controls={controls} footer={<ScriptView state={sim.state} />} />;
}
