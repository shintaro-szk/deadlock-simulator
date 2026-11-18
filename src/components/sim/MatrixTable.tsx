import { memo } from 'react';
import type { ProcessId, ResourceSpec, Vector } from '../../core/model';

export interface MatrixRow {
  readonly id: ProcessId;
  /** One vector per column group, in the same order as `groups`. */
  readonly cells: readonly Vector[];
  readonly tone?: 'current' | 'done' | 'stuck' | 'none';
  /** Short text in the last column, for example "finished 2nd". */
  readonly note?: string;
}

interface MatrixTableProps {
  readonly caption: string;
  readonly resources: readonly ResourceSpec[];
  readonly groups: readonly string[];
  readonly rows: readonly MatrixRow[];
  /** A summary row under the table, for example Available or Work. */
  readonly footer?: { readonly label: string; readonly vector: Vector; readonly highlight?: boolean };
}

const rowTone = {
  current: 'bg-surface-2 text-fg',
  done: 'text-fg-faint',
  stuck: 'text-signal-strong',
  none: 'text-fg-muted',
} as const;

/** Matrices such as Allocation, Max, Need, and Request. One sub-column per resource type. */
export const MatrixTable = memo(function MatrixTable({ caption, resources, groups, rows, footer }: MatrixTableProps) {
  const showNote = rows.some((r) => r.note);
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-max border-collapse text-right font-mono text-xs tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-2xs text-fg-faint">
            <th scope="col" rowSpan={2} className="pb-1 pr-3 text-left align-bottom font-normal">
              Process
            </th>
            {groups.map((g) => (
              <th key={g} scope="colgroup" colSpan={resources.length} className="border-l border-line px-2 pb-1 text-center font-normal">
                {g}
              </th>
            ))}
            {showNote && <th rowSpan={2} className="pl-3" aria-hidden="true" />}
          </tr>
          <tr className="border-b border-line text-2xs text-fg-faint">
            {groups.map((g) =>
              resources.map((r, i) => (
                <th key={`${g}-${r.id}`} scope="col" className={`px-2 pb-1.5 font-normal ${i === 0 ? 'border-l border-line' : ''}`}>
                  {r.id}
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={`border-b border-line/50 transition-colors duration-200 ${rowTone[row.tone ?? 'none']}`}>
              <th scope="row" className="py-1.5 pr-3 text-left font-medium">
                {row.id}
              </th>
              {row.cells.map((cell, gi) =>
                resources.map((r, i) => (
                  <td key={`${gi}-${r.id}`} className={`px-2 py-1.5 ${i === 0 ? 'border-l border-line' : ''}`}>
                    {cell[r.id] ?? 0}
                  </td>
                )),
              )}
              {showNote && <td className="pl-3 text-left text-2xs">{row.note}</td>}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr className={footer.highlight ? 'text-fg' : 'text-fg-muted'}>
              <th scope="row" className="pt-2 pr-3 text-left font-medium">
                {footer.label}
              </th>
              <td colSpan={groups.length * resources.length} className="pt-2 text-left">
                <span className="pl-2">
                  {resources.map((r) => `${r.id} ${footer.vector[r.id] ?? 0}`).join('   ')}
                </span>
              </td>
              {showNote && <td />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
});
