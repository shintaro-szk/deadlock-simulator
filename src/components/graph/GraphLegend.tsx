/** Key for the RAG symbols. Shapes and line styles carry the meaning, not only colour. */
export function GraphLegend({ showWarning = false }: { readonly showWarning?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 px-4 py-2.5 text-[11px] text-fg-muted" aria-label="Graph key">
      <li className="flex items-center gap-2">
        <svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5.5" className="fill-surface-2 stroke-fg" strokeWidth="1.5" /></svg>
        Process
      </li>
      <li className="flex items-center gap-2">
        <svg width="14" height="14" aria-hidden="true"><rect x="1.5" y="1.5" width="11" height="11" rx="1.5" className="fill-surface-2 stroke-line-strong" strokeWidth="1.5" /></svg>
        Resource (dot = instance)
      </li>
      <li className="flex items-center gap-2">
        <svg width="24" height="6" aria-hidden="true"><line x1="0" y1="3" x2="24" y2="3" className="stroke-fg-muted" strokeWidth="1.5" strokeDasharray="5 4" /></svg>
        Request P → R
      </li>
      <li className="flex items-center gap-2">
        <svg width="24" height="6" aria-hidden="true"><line x1="0" y1="3" x2="24" y2="3" className="stroke-fg" strokeWidth="1.5" /></svg>
        Assignment R → P
      </li>
      <li className="flex items-center gap-2">
        <svg width="24" height="6" aria-hidden="true"><line x1="0" y1="3" x2="24" y2="3" className="stroke-signal" strokeWidth="2.5" strokeDasharray="7 4" /></svg>
        Deadlock cycle
      </li>
      {showWarning && (
        <li className="flex items-center gap-2">
          <svg width="24" height="6" aria-hidden="true"><line x1="0" y1="3" x2="24" y2="3" className="stroke-wait" strokeWidth="2.5" strokeDasharray="7 4" /></svg>
          Cycle, no deadlock
        </li>
      )}
    </ul>
  );
}
