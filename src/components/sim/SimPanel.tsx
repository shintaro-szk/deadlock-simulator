import { useMemo, type ReactNode } from 'react';
import type { SimulationControls } from '../../hooks/useSimulation';
import { analyzeState } from '../../core/detection';
import { toSnapshot } from '../../core/engine';
import { GraphStage } from '../graph/GraphStage';
import { GraphLegend } from '../graph/GraphLegend';
import { simVisuals } from '../graph/visuals';
import { Panel, PanelRow } from '../ui/Panel';
import { ProcessTable } from './ProcessTable';
import { StatusLine } from './StatusLine';
import { StepLog } from './StepLog';
import { Transport } from './Transport';

const NONE: readonly string[] = [];

interface SimPanelProps {
  readonly sim: SimulationControls;
  /** A label for the panel, for example the scenario name. */
  readonly title: string;
  /** Controls above the transport, for example a policy selector. */
  readonly controls?: ReactNode;
  /** Extra rows under the process table, for example the scripts. */
  readonly footer?: ReactNode;
}

/** A live simulation: controls, status, Resource Allocation Graph, process table, and step log. */
export function SimPanel({ sim, title, controls, footer }: SimPanelProps) {
  const snapshot = useMemo(() => toSnapshot(sim.state), [sim.state]);
  const analysis = useMemo(() => analyzeState(snapshot), [snapshot]);
  const deadlocked = sim.state.outcome === 'deadlocked' ? analysis.deadlocked : NONE;
  const visuals = useMemo(() => simVisuals(sim.state, deadlocked), [sim.state, deadlocked]);
  // Show the cycle only while it is a deadlock. A passing cycle with free instances is not a problem here.
  const cycle = sim.state.outcome === 'deadlocked' ? analysis.cycle : null;

  return (
    <Panel kind="Simulation" title={title}>
      {controls && <PanelRow>{controls}</PanelRow>}
      <PanelRow>
        <Transport sim={sim} />
      </PanelRow>
      <PanelRow className={`transition-colors duration-200 ${sim.state.outcome === 'deadlocked' ? 'bg-signal-dim/40' : ''}`}>
        <StatusLine state={sim.state} deadlocked={deadlocked} />
      </PanelRow>
      <div>
        <GraphStage
          snapshot={snapshot}
          visuals={visuals}
          cycle={cycle}
          cycleTone="deadlock"
          description={`Resource Allocation Graph for ${title}, step ${sim.state.step}.`}
        />
        <div className="border-t border-line">
          <GraphLegend />
        </div>
      </div>
      <PanelRow className="py-1">
        <ProcessTable state={sim.state} deadlocked={deadlocked} />
      </PanelRow>
      {footer && <PanelRow>{footer}</PanelRow>}
      <PanelRow className="px-3 py-1">
        <StepLog state={sim.state} />
      </PanelRow>
    </Panel>
  );
}
