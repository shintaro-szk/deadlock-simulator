import { memo } from 'react';
import type { ProcessId, SimState } from '../../core/model';
import { formatItems, statusText } from '../../content/simText';
import { row } from '../../core/vector';

interface ProcessTableProps {
  readonly state: SimState;
  readonly deadlocked: readonly ProcessId[];
}

/** Who holds what and who waits for what. */
export const ProcessTable = memo(function ProcessTable({ state, deadlocked }: ProcessTableProps) {
  const stuck = new Set(deadlocked);
  // Show how often each process lost its resources, once it has happened (starvation risk).
  const showLost = state.processes.some((p) => state.victimCount[p.id] > 0);
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-fg-faint">
          <th scope="col" className="py-2 pr-3 font-normal">Process</th>
          <th scope="col" className="py-2 pr-3 font-normal">State</th>
          <th scope="col" className="py-2 pr-3 font-normal">Holds</th>
          <th scope="col" className="py-2 pr-3 font-normal">Waits for</th>
          {showLost && <th scope="col" className="py-2 text-right font-normal">Lost</th>}
        </tr>
      </thead>
      <tbody>
        {state.processes.map((p) => {
          const status = state.status[p.id];
          const isStuck = stuck.has(p.id);
          const holds = formatItems(row(state.allocation, p.id), state.resources);
          const waits = formatItems(row(state.request, p.id), state.resources);
          return (
            <tr key={p.id} className="border-b border-line/60 last:border-b-0">
              <th scope="row" className={`py-2 pr-3 font-mono font-medium ${isStuck ? 'text-signal-strong' : 'text-fg'}`}>
                {p.label}
              </th>
              <td className={`py-2 pr-3 ${isStuck ? 'text-signal-strong' : status === 'waiting' ? 'text-wait' : status === 'finished' ? 'text-ok' : 'text-fg-muted'}`}>
                {isStuck ? 'deadlocked' : statusText[status]}
              </td>
              <td className={`py-2 pr-3 font-mono ${holds === 'nothing' ? 'text-fg-faint' : 'text-fg'}`}>{holds === 'nothing' ? '—' : holds}</td>
              <td className={`py-2 pr-3 font-mono ${waits === 'nothing' ? 'text-fg-faint' : 'text-wait'}`}>{waits === 'nothing' ? '—' : waits}</td>
              {showLost && (
                <td className={`py-2 text-right font-mono tabular-nums ${state.victimCount[p.id] > 0 ? 'text-wait' : 'text-fg-faint'}`}>
                  {state.victimCount[p.id]}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});
