import { memo } from 'react';
import type { Op, ResourceSpec, SimState } from '../../core/model';
import { formatItems } from '../../content/simText';
import { uiText } from '../../content/demoText';

function opText(op: Op, resources: readonly ResourceSpec[]): string {
  if (op.kind === 'work') return 'work';
  return `${op.kind === 'request' ? 'req' : 'rel'} ${formatItems(op.items, resources)}`;
}

/**
 * The script of each process after the policy rewrote it.
 * Done ops are faint. The next op has a border.
 */
export const ScriptView = memo(function ScriptView({ state }: { readonly state: SimState }) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs text-fg-faint">{uiText.scriptsCaption}</p>
      <ul className="space-y-1.5">
        {state.processes.map((p) => {
          const pc = state.pc[p.id];
          const done = state.status[p.id] === 'finished' || state.status[p.id] === 'terminated';
          return (
            <li key={p.id} className="flex items-baseline gap-3">
              <span className="w-6 shrink-0 font-mono text-xs text-fg">{p.label}</span>
              <ol className="flex flex-wrap gap-1" aria-label={`Script of ${p.label}`}>
                {p.script.map((op, i) => {
                  const state_ = done || i < pc ? 'done' : i === pc ? 'next' : 'todo';
                  return (
                    <li
                      key={i}
                      aria-current={state_ === 'next' ? 'step' : undefined}
                      className={`rounded-sm border px-1.5 py-0.5 font-mono text-2xs transition-colors duration-200 ${
                        state_ === 'next'
                          ? 'border-fg-muted text-fg'
                          : state_ === 'done'
                            ? 'border-transparent text-fg-faint line-through decoration-fg-faint/60'
                            : op.kind === 'request'
                              ? 'border-line text-fg-muted'
                              : 'border-transparent text-fg-muted'
                      }`}
                    >
                      {opText(op, state.resources)}
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ul>
    </div>
  );
});
