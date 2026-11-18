import { useEffect, useRef } from 'react';
import { Github } from 'lucide-react';
import { chapters, credits, deck, type ChapterId } from '../../content/deadlocks';
import { scrollBehavior } from '../../hooks/motion';
import { BrandMark } from './BrandMark';

interface ChapterRailProps {
  readonly active: ChapterId;
}

/** Desktop: a fixed column on the left. */
export function ChapterRail({ active }: ChapterRailProps) {
  return (
    <nav aria-label="Chapters" className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line px-6 py-8 lg:flex">
      <a href="#top" className="mb-10 flex items-center gap-3">
        <BrandMark className="h-8 w-8" />
        <span className="font-display text-brand font-semibold leading-tight text-fg">{deck.title}</span>
      </a>
      <ol className="space-y-0.5">
        {chapters.map((c) => {
          const isActive = c.id === active;
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={`group relative flex items-baseline gap-3 py-1.5 pl-3 text-sm transition-colors duration-150 coarse:min-h-11 coarse:items-center ${
                  isActive ? 'text-fg' : 'text-fg-faint hover:text-fg-muted'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 transition-colors duration-150 ${isActive ? 'bg-signal' : 'bg-transparent'}`}
                />
                <span className={`font-mono text-xs tabular-nums ${isActive ? 'text-signal-strong' : ''}`}>{c.number}</span>
                <span>{c.short}</span>
              </a>
            </li>
          );
        })}
      </ol>
      <dl className="mt-auto space-y-1.5 font-mono text-2xs text-fg-faint">
        <div className="flex justify-between"><dt>Play / pause</dt><dd className="text-fg-muted">Space</dd></div>
        <div className="flex justify-between"><dt>Step</dt><dd className="text-fg-muted">← →</dd></div>
        <div className="flex justify-between"><dt>Reset</dt><dd className="text-fg-muted">R</dd></div>
      </dl>
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
        <span className="truncate text-xs text-fg-faint">{credits.author}</span>
        <a
          href={credits.repoUrl}
          target="_blank"
          rel="noreferrer"
          title={credits.repoLabel}
          className="-m-1.5 flex shrink-0 items-center justify-center p-1.5 text-fg-muted transition-colors duration-150 hover:text-fg coarse:min-h-11 coarse:min-w-11"
        >
          <Github size={16} aria-hidden="true" />
          <span className="sr-only">{`${credits.repoLabel} ${credits.newTab}`}</span>
        </a>
      </div>
    </nav>
  );
}

/** Mobile and tablet: a bar at the top with chapters that scroll sideways. */
export function ChapterBar({ active }: ChapterRailProps) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const item = listRef.current?.querySelector<HTMLElement>(`[data-chapter="${active}"]`);
    item?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: scrollBehavior() });
  }, [active]);

  return (
    <nav aria-label="Chapters" className="sticky top-0 z-20 border-b border-line bg-bg lg:hidden">
      <div className="flex items-center gap-2.5 px-4 pt-3">
        <BrandMark className="h-6 w-6" />
        <span className="truncate font-display text-brand font-semibold text-fg">{deck.title}</span>
      </div>
      <ol ref={listRef} className="scrollbar-none flex gap-1 overflow-x-auto px-3 py-2">
        {chapters.map((c) => {
          const isActive = c.id === active;
          return (
            <li key={c.id} data-chapter={c.id} className="shrink-0">
              <a
                href={`#${c.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={`flex items-baseline gap-1.5 rounded px-2.5 py-1.5 text-ui coarse:min-h-11 coarse:items-center transition-colors duration-150 ${
                  isActive ? 'bg-surface-2 text-fg' : 'text-fg-faint'
                }`}
              >
                <span className={`font-mono text-2xs ${isActive ? 'text-signal-strong' : ''}`}>{c.number}</span>
                {c.short}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
