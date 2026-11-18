import { memo, useEffect, useRef } from 'react';
import type { SimState } from '../../core/model';
import { describeLogEntry } from '../../content/simText';
import { toneText } from '../tone';
import { scrollBehavior } from '../../hooks/motion';

interface StepLogProps {
  readonly state: SimState;
  /** Show this many recent entries. */
  readonly limit?: number;
}

/** The recent actions, newest at the bottom. The list scrolls to the newest entry. */
export const StepLog = memo(function StepLog({ state, limit = 40 }: StepLogProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const entries = state.log.slice(-limit);
  const newest = entries.length > 0 ? entries.length - 1 : -1;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: scrollBehavior() });
  }, [state.log.length]);

  if (entries.length === 0) {
    return <p className="py-3 font-mono text-xs text-fg-faint">No steps yet.</p>;
  }

  return (
    <ol ref={listRef} aria-label="Step log" tabIndex={0} className="max-h-48 overflow-y-auto overscroll-contain py-1 font-mono text-xs leading-6">
      {entries.map((entry, i) => {
        const line = describeLogEntry(entry, state.resources);
        return (
          <li
            key={`${entry.step}-${entry.process}-${entry.kind}-${i}`}
            className={`grid grid-cols-[2.25rem_2.25rem_1fr] gap-2 ${i === newest ? 'bg-surface-2' : ''}`}
          >
            <span className="pl-1 tabular-nums text-fg-faint">{String(entry.step).padStart(2, '0')}</span>
            <span className="text-fg">{entry.process}</span>
            <span className={toneText[line.tone]}>{line.text}</span>
          </li>
        );
      })}
    </ol>
  );
});
