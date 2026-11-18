import { useMemo, useState } from 'react';
import type { ProcessId, SimState } from '../core/model';
import { run } from '../core/engine';
import { deadlockedProcesses, preempt, rollback, selectVictim, terminate, type VictimCriterion } from '../core/recovery';
import { row } from '../core/vector';
import { useSimulation } from '../hooks/useSimulation';
import { useIsActiveChapter } from '../components/shell/activeChapter';
import { SimPanel } from '../components/sim/SimPanel';
import { OptionGroup } from '../components/ui/OptionGroup';
import { circularWait } from '../scenarios/circularWait';
import {
  criterionChoices,
  criterionRule,
  recoveryMethods,
  recoveryNote,
  type RecoveryMethod,
  uiText,
} from '../content/demoText';

function recover(state: SimState, method: RecoveryMethod, criterion: VictimCriterion) {
  switch (method) {
    case 'terminate-one':
      return terminate(state, { criterion, mode: 'one-at-a-time' });
    case 'terminate-all':
      return terminate(state, { criterion, mode: 'all' });
    case 'rollback':
      return rollback(state, criterion);
    case 'preempt':
      return preempt(state, criterion);
  }
}

const verb: Record<RecoveryMethod, string> = {
  'terminate-one': 'Killed',
  'terminate-all': 'Killed',
  rollback: 'Rolled back',
  preempt: 'Preempted the resources of',
};

/** The values that each criterion compares. */
function CandidateTable({ state, candidates, victim, criterion }: {
  readonly state: SimState;
  readonly candidates: readonly ProcessId[];
  readonly victim: ProcessId | null;
  readonly criterion: VictimCriterion | null;
}) {
  const held = (id: ProcessId) => Object.values(row(state.allocation, id)).reduce((s, n) => s + n, 0);
  const columns: { key: VictimCriterion; label: string; value: (id: ProcessId) => number }[] = [
    { key: 'priority', label: 'Priority', value: (id) => state.processes.find((p) => p.id === id)?.priority ?? 0 },
    { key: 'execution-time', label: 'Steps run', value: (id) => state.executed[id] },
    { key: 'resource-usage', label: 'Holds', value: held },
    { key: 'restart-cost', label: 'Restart cost', value: (id) => state.processes.find((p) => p.id === id)?.restartCost ?? 0 },
  ];
  return (
    <table className="w-full border-collapse text-right font-mono text-xs tabular-nums">
      <caption className="sr-only">{uiText.victimTableCaption}</caption>
      <thead>
        <tr className="border-b border-line text-2xs text-fg-faint">
          <th scope="col" className="pb-1.5 pr-3 text-left font-normal">Process</th>
          {columns.map((c) => (
            <th key={c.key} scope="col" className={`px-2 pb-1.5 font-normal ${c.key === criterion ? 'text-signal-strong' : ''}`}>
              {c.label}
            </th>
          ))}
          <th className="pl-3" aria-hidden="true" />
        </tr>
      </thead>
      <tbody>
        {candidates.map((id) => (
          <tr key={id} className={`border-b border-line/50 ${id === victim ? 'bg-signal-dim/50 text-fg' : 'text-fg-muted'}`}>
            <th scope="row" className="py-1.5 pr-3 text-left font-medium">{id}</th>
            {columns.map((c) => (
              <td key={c.key} className={`px-2 py-1.5 ${c.key === criterion ? 'text-fg' : ''}`}>
                {c.value(id)}
              </td>
            ))}
            <td className="pl-3 text-left text-2xs text-signal-strong">{id === victim ? 'victim' : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Chapter 07: recover from a live deadlock by killing, rolling back, or preempting. */
export default function RecoveryDemo() {
  const sim = useSimulation(circularWait, 'none', { keyboard: useIsActiveChapter('recovery') });
  const [method, setMethod] = useState<RecoveryMethod>('terminate-one');
  const [criterion, setCriterion] = useState<VictimCriterion>('priority');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const isDeadlocked = sim.state.outcome === 'deadlocked';
  const candidates = useMemo(() => (isDeadlocked ? deadlockedProcesses(sim.state) : []), [isDeadlocked, sim.state]);
  const usesCriterion = method !== 'terminate-all';
  const victim = isDeadlocked && usesCriterion && candidates.length > 0 ? selectVictim(sim.state, candidates, criterion) : null;

  const doRecover = () => {
    const result = recover(sim.state, method, criterion);
    sim.apply(() => result.state);
    setLastAction(`${verb[method]} ${result.victims.join(', ')}. Press Play to let the other processes continue.`);
  };
  const toDeadlock = () => {
    sim.apply((s) => run(s));
    setLastAction(null);
  };

  const controls = (
    <div className="space-y-4">
      <OptionGroup label="Method" options={recoveryMethods} value={method} onChange={setMethod} />
      {usesCriterion && (
        <OptionGroup label="Select the victim by" options={criterionChoices} value={criterion} onChange={setCriterion} />
      )}
      <p className="text-sm text-fg-muted">
        {recoveryNote[method]}
        {usesCriterion && <span className="text-fg-faint"> Rule: {criterionRule[criterion].toLowerCase()}. Ties go to the first process.</span>}
      </p>
      {isDeadlocked ? (
        <CandidateTable state={sim.state} candidates={candidates} victim={victim} criterion={usesCriterion ? criterion : null} />
      ) : (
        <p className="font-mono text-xs text-fg-faint">
          {sim.state.outcome === 'complete' ? 'No deadlock now. Reset to try another method.' : 'No deadlock yet. Run the simulation into the deadlock first.'}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {isDeadlocked ? (
          <button
            type="button"
            onClick={doRecover}
            className="h-9 coarse:h-11 rounded bg-signal-solid px-4 text-sm font-medium text-fg transition-colors duration-150 hover:bg-signal-solid-hover"
          >
            Recover now
          </button>
        ) : (
          sim.state.outcome === 'running' && (
            <button
              type="button"
              onClick={toDeadlock}
              className="h-9 coarse:h-11 rounded border border-line-strong px-3 text-sm text-fg transition-colors duration-150 hover:border-fg-muted"
            >
              Run to deadlock
            </button>
          )
        )}
        {lastAction && sim.state.outcome === 'running' && (
          <p className="text-sm text-fg-muted" role="status">
            {lastAction}
          </p>
        )}
      </div>
    </div>
  );

  return <SimPanel sim={sim} title={circularWait.title} controls={controls} />;
}
