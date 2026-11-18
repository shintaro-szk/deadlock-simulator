import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { AllocationSnapshot } from '../core/model';
import { analyzeState, detectDeadlock } from '../core/detection';
import { buildWaitFor } from '../core/rag';
import { findCycle } from '../core/cycle';
import { createSim, run, toSnapshot } from '../core/engine';
import { availableOf, row } from '../core/vector';
import { useSimulation } from '../hooks/useSimulation';
import { useIsActiveChapter } from '../components/shell/activeChapter';
import { SimPanel } from '../components/sim/SimPanel';
import { MatrixTable, type MatrixRow } from '../components/sim/MatrixTable';
import { GraphStage } from '../components/graph/GraphStage';
import { WaitForGraph } from '../components/graph/WaitForGraph';
import { simVisuals } from '../components/graph/visuals';
import { OptionGroup } from '../components/ui/OptionGroup';
import { Panel, PanelRow } from '../components/ui/Panel';
import { circularWait } from '../scenarios/circularWait';
import { bankerExample } from '../scenarios/bankerExample';
import { multiInstanceDetection } from '../scenarios/snapshots';
import { formatVector } from '../content/simText';
import {
  detectionModes,
  detectionViews,
  matrixExamples,
  type DetectionMode,
  type DetectionView,
  type MatrixExample,
  uiText,
} from '../content/demoText';

/** The periodic detector runs after every PERIOD-th step. */
const PERIOD = 2;

interface DetectorResult {
  readonly step: number;
  readonly deadlocked: readonly string[];
  readonly wfgCycle: readonly string[] | null;
}

/* ------------------------------------------------------------------ */
/* Single instance: RAG and WFG                                        */
/* ------------------------------------------------------------------ */

function SingleInstance({ switcher, keyboard }: { readonly switcher: ReactNode; readonly keyboard: boolean }) {
  const [mode, setMode] = useState<DetectionMode>('periodic');
  const sim = useSimulation(circularWait, 'none', { keyboard });
  const [last, setLast] = useState<DetectorResult | null>(null);
  const snapshot = useMemo(() => toSnapshot(sim.state), [sim.state]);

  const detect = () => {
    const analysis = analyzeState(snapshot);
    const wfg = buildWaitFor(snapshot);
    setLast({ step: sim.state.step, deadlocked: analysis.deadlocked, wfgCycle: findCycle(wfg.nodes.map((n) => n.id), wfg.edges) });
  };

  // Periodic mode: run the detector after every PERIOD-th step. Forget results from steps that were undone.
  const step = sim.state.step;
  useEffect(() => {
    if (last && last.step > step) setLast(null);
    if (mode !== 'periodic' || step === 0 || step % PERIOD !== 0 || last?.step === step) return;
    const analysis = analyzeState(snapshot);
    const wfg = buildWaitFor(snapshot);
    setLast({ step, deadlocked: analysis.deadlocked, wfgCycle: findCycle(wfg.nodes.map((n) => n.id), wfg.edges) });
  }, [mode, step, snapshot, last]);

  const found = last !== null && last.deadlocked.length > 0;
  const deadlocked = found ? last.deadlocked : [];
  const visuals = simVisuals(sim.state, deadlocked);
  const ragCycle = found ? analyzeState(snapshot).cycle : null;

  const status = (
    <PanelRow className={found ? 'bg-signal-dim/40' : ''}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p role="status" aria-live="polite" className="min-w-0">
          <span className={`block font-display text-lg font-semibold ${found ? 'text-signal-strong' : 'text-fg'}`}>
            {last === null ? 'Detector has not run' : found ? `Deadlock detected at step ${last.step}` : `No deadlock at step ${last.step}`}
          </span>
          <span className="block text-sm text-fg-muted">
            {found && last.wfgCycle
              ? `WFG cycle: ${[...last.wfgCycle, last.wfgCycle[0]].join(' → ')}.`
              : mode === 'periodic'
                ? `The detector runs after every ${PERIOD} steps.`
                : 'The detector runs only when you ask. A deadlock can exist before anyone checks.'}
          </span>
        </p>
        <button
          type="button"
          onClick={detect}
          className="flex h-9 coarse:h-11 items-center gap-1.5 rounded border border-line-strong px-3 text-sm text-fg transition-colors duration-150 hover:border-fg-muted"
        >
          <Search size={14} aria-hidden="true" /> Run detection
        </button>
      </div>
    </PanelRow>
  );

  const view = (
    <div>
      <div>
        <p className="px-4 pt-3 font-mono text-xs text-fg-faint">{uiText.ragCaption}</p>
        <GraphStage snapshot={snapshot} visuals={visuals} cycle={ragCycle} cycleTone="deadlock" description={`Resource Allocation Graph at step ${step}.`} />
      </div>
      <div className="border-t border-line">
        <p className="px-4 pt-3 font-mono text-xs text-fg-faint">{uiText.wfgCaption}</p>
        <WaitForGraph snapshot={snapshot} visuals={visuals} showCycle={found} />
        <p className="border-t border-line px-4 py-2.5 text-xs leading-5 text-fg-muted">{uiText.wfgNote}</p>
      </div>
    </div>
  );

  const controls = (
    <div className="space-y-4">
      {switcher}
      <OptionGroup label="Detection frequency" options={detectionModes} value={mode} onChange={setMode} />
    </div>
  );

  return <SimPanel sim={sim} title={circularWait.title} controls={controls} status={status} view={view} revealDeadlock={found} />;
}

/* ------------------------------------------------------------------ */
/* Multiple instances: tables                                          */
/* ------------------------------------------------------------------ */

const examples: Record<MatrixExample, AllocationSnapshot> = {
  pdf: multiInstanceDetection,
  deadlock: run(createSim(bankerExample, 'none')),
};

const ordinal = (n: number) => ['1st', '2nd', '3rd'][n] ?? `${n + 1}th`;

function MultipleInstances({ switcher }: { readonly switcher: ReactNode }) {
  const [example, setExample] = useState<MatrixExample>('pdf');
  const snapshot = examples[example];
  const result = useMemo(() => detectDeadlock(snapshot), [snapshot]);
  const [index, setIndex] = useState(-1);
  const last = result.trace.length - 1;
  const done = index >= last;

  const pick = (next: MatrixExample) => {
    setExample(next);
    setIndex(-1);
  };

  // Processes that finished in the checks shown so far.
  const shown = result.trace.slice(0, index + 1);
  const finished = shown.filter((c) => c.canFinish).map((c) => c.process);
  const current = index >= 0 ? result.trace[index] : null;
  const work = current ? (current.workAfter ?? current.work) : availableOf(snapshot);

  const rows: MatrixRow[] = snapshot.processes.map((p) => {
    const order = finished.indexOf(p.id);
    const skipped = result.skipped.includes(p.id);
    const stuck = done && result.deadlocked.includes(p.id);
    return {
      id: p.id,
      cells: [row(snapshot.allocation, p.id), row(snapshot.request, p.id)],
      tone: current?.process === p.id ? 'current' : stuck ? 'stuck' : order >= 0 || skipped ? 'done' : 'none',
      note: skipped ? 'holds nothing' : order >= 0 ? `finished ${ordinal(order)}` : stuck ? 'stuck' : '',
    };
  });

  const fmt = (v: Parameters<typeof formatVector>[0]) => formatVector(v, snapshot.resources);
  const explanation = !current
    ? `Start with Work = Available = ${fmt(availableOf(snapshot))}.`
    : current.canFinish
      ? `${current.process} needs ${fmt(current.demand)} and Work is ${fmt(current.work)}, so it can finish. Add its allocation back: Work = ${fmt(current.workAfter ?? current.work)}.`
      : `${current.process} needs ${fmt(current.demand)}, but Work is only ${fmt(current.work)}. It cannot finish yet.`;

  return (
    <Panel kind="Detection" title="Multiple-instance detection">
      <PanelRow>
        <div className="space-y-4">
          {switcher}
          <OptionGroup label="Example" options={matrixExamples} value={example} onChange={pick} />
        </div>
      </PanelRow>
      <PanelRow>
        <MatrixTable
          caption="Allocation and Request for each process"
          resources={snapshot.resources}
          groups={['Allocation', 'Request']}
          rows={rows}
          footer={{ label: 'Work', vector: work, highlight: true }}
        />
      </PanelRow>
      <PanelRow>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex(Math.max(-1, index - 1))}
            disabled={index < 0}
            aria-label="Previous check"
            className="grid h-9 w-9 coarse:h-11 coarse:w-11 place-items-center rounded border border-line text-fg-muted hover:border-line-strong hover:text-fg disabled:opacity-35"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIndex(Math.min(last, index + 1))}
            disabled={done}
            className="flex h-9 coarse:h-11 items-center gap-1.5 rounded bg-signal-solid px-4 text-sm font-medium text-fg hover:bg-signal-solid-hover disabled:bg-surface-2 disabled:text-fg-faint"
          >
            Next check <ChevronRight size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIndex(last)}
            disabled={done}
            className="h-9 coarse:h-11 rounded border border-line px-3 text-sm text-fg-muted hover:border-line-strong hover:text-fg disabled:opacity-35"
          >
            Run to end
          </button>
          <span className="ml-auto font-mono text-xs text-fg-faint">
            Check <span className="text-fg tabular-nums">{index + 1}</span>/{result.trace.length}
          </span>
        </div>
      </PanelRow>
      <PanelRow className={done && result.deadlocked.length > 0 ? 'bg-signal-dim/40' : ''}>
        <p role="status" aria-live="polite">
          {done && (
            <span className={`block font-display text-lg font-semibold ${result.deadlocked.length > 0 ? 'text-signal-strong' : 'text-ok'}`}>
              {result.deadlocked.length > 0 ? `Deadlock: ${result.deadlocked.join(', ')} are stuck` : 'All processes can finish: no deadlock'}
            </span>
          )}
          <span className="block text-sm text-fg-muted">{explanation}</span>
        </p>
      </PanelRow>
    </Panel>
  );
}

/** Chapter 06: detect a deadlock with graphs (single instance) or with tables (multiple instances). */
export default function DetectionDemo() {
  const [view, setView] = useState<DetectionView>('single');
  const active = useIsActiveChapter('detection');
  const switcher = <OptionGroup label="Resources" options={detectionViews} value={view} onChange={setView} />;
  return view === 'single' ? <SingleInstance switcher={switcher} keyboard={active} /> : <MultipleInstances switcher={switcher} />;
}
