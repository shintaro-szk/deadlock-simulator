import { useMemo, type ReactNode } from 'react';
import type { SimulationControls } from '../../hooks/useSimulation';
import { analyzeState } from '../../core/detection';
import { toSnapshot } from '../../core/engine';
import { ProcessTable } from './ProcessTable';
import { StatusLine } from './StatusLine';
import { StepLog } from './StepLog';
import { Transport } from './Transport';

interface SimPanelProps {
  readonly sim: SimulationControls;
  /** A label for the panel, for example the scenario name. */
  readonly title: string;
  /** Controls above the transport, for example a policy selector. */
  readonly controls?: ReactNode;
  /** The main view, for example the graph. */
  readonly children?: ReactNode;
}

/** The frame for a live simulation: controls, status, view, process table, and step log. */
export function SimPanel({ sim, title, controls, children }: SimPanelProps) {
  const analysis = useMemo(() => analyzeState(toSnapshot(sim.state)), [sim.state]);
  const deadlocked = sim.state.outcome === 'deadlocked' ? analysis.deadlocked : [];

  return (
    <figure className="rounded-lg border border-line bg-surface" aria-label={`Simulation: ${title}`}>
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">Simulation</span>
        <span className="font-mono text-xs text-fg-muted">{title}</span>
      </figcaption>
      {controls && <div className="border-b border-line px-4 py-3">{controls}</div>}
      <div className="border-b border-line px-4 py-3">
        <Transport sim={sim} />
      </div>
      <div className={`border-b px-4 py-3 transition-colors duration-200 ${sim.state.outcome === 'deadlocked' ? 'border-signal/50 bg-signal-dim/40' : 'border-line'}`}>
        <StatusLine state={sim.state} deadlocked={deadlocked} />
      </div>
      {children && <div className="border-b border-line">{children}</div>}
      <div className="border-b border-line px-4 py-1">
        <ProcessTable state={sim.state} deadlocked={deadlocked} />
      </div>
      <div className="px-3 py-1">
        <StepLog state={sim.state} />
      </div>
    </figure>
  );
}
