import type { ReactNode } from 'react';

interface PanelProps {
  /** Small label on the left of the caption, for example "Simulation". */
  readonly kind: string;
  readonly title: string;
  readonly children: ReactNode;
}

/** The frame for every demo: a caption bar and rows split by hairlines. */
export function Panel({ kind, title, children }: PanelProps) {
  return (
    <figure className="overflow-hidden rounded-lg border border-line bg-surface" aria-label={`${kind}: ${title}`}>
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">{kind}</span>
        <span className="truncate font-mono text-xs text-fg-muted">{title}</span>
      </figcaption>
      <div className="divide-y divide-line">{children}</div>
    </figure>
  );
}

/** One row of a panel with standard padding. */
export function PanelRow({ children, className = '' }: { readonly children: ReactNode; readonly className?: string }) {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>;
}
