import { memo } from 'react';
import type { ProcessId, SimState } from '../../core/model';
import { describeLogEntry, outcomeText, policyText } from '../../content/simText';
import { toneFill, toneText } from '../tone';

interface StatusLineProps {
  readonly state: SimState;
  readonly deadlocked: readonly ProcessId[];
}

function detail(state: SimState, deadlocked: readonly ProcessId[]): string {
  if (state.outcome === 'deadlocked') return `${deadlocked.join(', ')} wait for each other. No process can continue.`;
  if (state.outcome === 'complete') return 'Every process finished. No deadlock.';
  if (state.outcome === 'stalled') return 'Every process waits, but there is no cycle of waits.';
  const last = state.log[state.log.length - 1];
  return last ? `${last.process} ${describeLogEntry(last, state.resources).text}.` : 'Press Play or step forward.';
}

/** The outcome of the run in one line. Screen readers announce a change of outcome. */
export const StatusLine = memo(function StatusLine({ state, deadlocked }: StatusLineProps) {
  const outcome = outcomeText[state.outcome];
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <p className="flex min-w-0 items-baseline gap-2.5">
        <span aria-hidden="true" className={`inline-block h-2 w-2 shrink-0 -translate-y-px ${toneFill[outcome.tone]}`} />
        {/* Only the outcome is a live region. The detail changes on every step and would flood a screen reader. */}
        <span role="status" className={`font-display text-lg font-semibold ${toneText[outcome.tone]}`}>
          {outcome.label}
        </span>
        <span className="text-sm text-fg-muted">{detail(state, deadlocked)}</span>
      </p>
      <p className="font-mono text-xs text-fg-faint">{policyText[state.policy]}</p>
    </div>
  );
});
