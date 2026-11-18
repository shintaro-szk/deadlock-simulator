import { useMemo, useState, type ReactNode } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import type { ProcessId, ResourceId, Vector } from '../core/model';
import { checkSafety, evaluateRequest, needOf, type BankerState, type RequestVerdict } from '../core/banker';
import { lessOrEqual } from '../core/vector';
import { useSimulation } from '../hooks/useSimulation';
import { useIsActiveChapter } from '../components/shell/activeChapter';
import { SimPanel } from '../components/sim/SimPanel';
import { MatrixTable } from '../components/sim/MatrixTable';
import { ReductionTrace } from '../components/sim/ReductionTrace';
import { OptionGroup } from '../components/ui/OptionGroup';
import { Panel, PanelRow } from '../components/ui/Panel';
import { Stepper } from '../components/ui/Stepper';
import { bankerPresets, bankerTable } from '../scenarios/bankerTable';
import { bankerExample } from '../scenarios/bankerExample';
import { formatVector } from '../content/simText';
import {
  avoidanceViews,
  livePolicies,
  livePolicyNote,
  verdictTitle,
  type AvoidanceView,
  type LivePolicy,
} from '../content/demoText';

const zero = (state: BankerState): Vector => Object.fromEntries(state.resources.map((r) => [r.id, 0]));

const verdictTone = {
  granted: 'text-ok',
  unsafe: 'text-signal-strong',
  'must-wait': 'text-wait',
  'exceeds-claim': 'text-signal-strong',
} as const;

function VerdictView({ verdict, state, process, request }: {
  readonly verdict: RequestVerdict;
  readonly state: BankerState;
  readonly process: ProcessId;
  readonly request: Vector;
}) {
  const fmt = (v: Vector) => formatVector(v, state.resources);
  let detail: string;
  switch (verdict.outcome) {
    case 'granted':
      detail = `Safe sequence: ${verdict.safety.sequence.join(' → ')}.`;
      break;
    case 'unsafe':
      detail = `After the grant, ${verdict.safety.stuck.join(', ')} could never finish. ${process} waits.`;
      break;
    case 'must-wait':
      detail = `Request ${fmt(request)} is more than Available ${fmt(state.available)}.`;
      break;
    case 'exceeds-claim':
      detail = `Request ${fmt(request)} is more than Need ${fmt(needOf(state, process))}.`;
      break;
  }
  return (
    <div className="space-y-2">
      <p role="status" aria-live="polite">
        <span className={`block font-display text-lg font-semibold ${verdictTone[verdict.outcome]}`}>{verdictTitle[verdict.outcome]}</span>
        <span className="block text-sm text-fg-muted">{detail}</span>
      </p>
      {(verdict.outcome === 'granted' || verdict.outcome === 'unsafe') && (
        <ReductionTrace trace={verdict.safety.trace} resources={state.resources} demandLabel="Need" />
      )}
    </div>
  );
}

function RequestCheck({ switcher }: { readonly switcher: ReactNode }) {
  const [history, setHistory] = useState<readonly BankerState[]>([bankerTable]);
  const state = history[history.length - 1];
  const [process, setProcess] = useState<ProcessId>('P1');
  const [request, setRequest] = useState<Vector>(() => zero(bankerTable));
  const [verdict, setVerdict] = useState<RequestVerdict | null>(null);

  const safety = useMemo(() => checkSafety(state), [state]);
  const ids = state.resources.map((r) => r.id);
  const processOptions = state.processes.map((p) => ({ value: p.id, label: p.id }));

  const choose = (next: ProcessId, vector: Vector) => {
    setProcess(next);
    setRequest(vector);
    setVerdict(null);
  };
  const setAmount = (id: ResourceId, n: number) => {
    setRequest({ ...request, [id]: n });
    setVerdict(null);
  };
  const check = () => {
    const result = evaluateRequest(state, process, request);
    setVerdict(result);
    if (result.outcome === 'granted') setHistory([...history, result.after]);
  };
  const undo = () => {
    setHistory(history.slice(0, -1));
    setVerdict(null);
  };
  const reset = () => {
    setHistory([bankerTable]);
    choose('P1', zero(bankerTable));
  };

  const rows = state.processes.map((p) => ({
    id: p.id,
    cells: [state.allocation[p.id] ?? {}, state.max[p.id] ?? {}, needOf(state, p.id)],
    tone: p.id === process ? ('current' as const) : ('none' as const),
  }));
  const empty = lessOrEqual(ids, request, {});

  return (
    <Panel kind="Avoidance" title="Banker's Algorithm">
      <PanelRow>{switcher}</PanelRow>
      <PanelRow>
        <MatrixTable
          caption="Allocation, Max, and Need for each process"
          resources={state.resources}
          groups={['Allocation', 'Max', 'Need']}
          rows={rows}
          footer={{ label: 'Available', vector: state.available }}
        />
        <p className="mt-2 text-xs text-fg-muted">
          Current state: <span className={safety.safe ? 'text-ok' : 'text-signal-strong'}>{safety.safe ? 'safe' : 'unsafe'}</span>
          {safety.safe && <span className="font-mono text-fg-faint"> · {safety.sequence.join(' → ')}</span>}
        </p>
      </PanelRow>
      <PanelRow>
        <div className="space-y-4">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-fg-faint">Try the textbook requests</p>
            <div className="flex flex-wrap gap-1.5">
              {bankerPresets.map((preset) => (
                <button
                  key={preset.process}
                  type="button"
                  onClick={() => choose(preset.process, preset.request)}
                  className="rounded border border-line px-2.5 py-1 font-mono text-xs text-fg-muted transition-colors duration-150 hover:border-line-strong hover:text-fg"
                >
                  {preset.process} asks {formatVector(preset.request, state.resources)}
                </button>
              ))}
            </div>
          </div>
          <OptionGroup label="Process" options={processOptions} value={process} onChange={(p) => choose(p, zero(state))} />
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-fg-faint">Request</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {state.resources.map((r) => (
                <Stepper key={r.id} label={r.id} value={request[r.id] ?? 0} min={0} max={r.instances} onChange={(n) => setAmount(r.id, n)} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={check}
              disabled={empty}
              className="h-9 rounded bg-signal px-4 text-sm font-medium text-fg transition-colors duration-150 hover:bg-signal-strong disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-faint"
            >
              Is it safe?
            </button>
            <button
              type="button"
              onClick={undo}
              disabled={history.length < 2}
              className="flex h-9 items-center gap-1.5 rounded border border-line px-3 text-sm text-fg-muted hover:border-line-strong hover:text-fg disabled:opacity-35"
            >
              <Undo2 size={14} aria-hidden="true" /> Undo grant
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex h-9 items-center gap-1.5 rounded border border-line px-3 text-sm text-fg-muted hover:border-line-strong hover:text-fg"
            >
              <RotateCcw size={14} aria-hidden="true" /> Reset
            </button>
          </div>
        </div>
      </PanelRow>
      {verdict && (
        <PanelRow className={verdict.outcome === 'unsafe' || verdict.outcome === 'exceeds-claim' ? 'bg-signal-dim/40' : ''}>
          <VerdictView verdict={verdict} state={history[history.length - (verdict.outcome === 'granted' ? 2 : 1)]} process={process} request={request} />
        </PanelRow>
      )}
    </Panel>
  );
}

function LiveRun({ switcher, keyboard }: { readonly switcher: ReactNode; readonly keyboard: boolean }) {
  const [policy, setPolicy] = useState<LivePolicy>('banker');
  const sim = useSimulation(bankerExample, policy, { keyboard });
  const controls = (
    <div className="space-y-4">
      {switcher}
      <OptionGroup label="Policy" options={livePolicies} value={policy} onChange={setPolicy} />
      <p className="text-sm text-fg-muted">{livePolicyNote[policy]}</p>
    </div>
  );
  return <SimPanel sim={sim} title={bankerExample.title} controls={controls} />;
}

/** Chapter 05: ask "If I give this resource, will the system remain safe?" */
export default function AvoidanceDemo() {
  const [view, setView] = useState<AvoidanceView>('check');
  const active = useIsActiveChapter('avoidance');
  const switcher = <OptionGroup label="View" options={avoidanceViews} value={view} onChange={setView} />;
  return view === 'check' ? <RequestCheck switcher={switcher} /> : <LiveRun switcher={switcher} keyboard={active} />;
}
