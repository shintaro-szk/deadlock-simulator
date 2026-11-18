import type { ReactNode } from 'react';
import type { Chapter } from '../../content/deadlocks';
import { BlockView } from './BlockView';

interface ChapterSectionProps {
  readonly chapter: Chapter;
  /** The live demo for the chapter. Without it, the text uses the full column. */
  readonly demo?: ReactNode;
}

/** One chapter: number, title, PDF text, and an optional demo beside the text. */
export function ChapterSection({ chapter, demo }: ChapterSectionProps) {
  const headingId = `${chapter.id}-title`;
  return (
    <section id={chapter.id} aria-labelledby={headingId} data-chapter={chapter.id} className="scroll-mt-28 border-t border-line py-14 lg:scroll-mt-0 lg:py-20">
      <header className="mb-8 flex items-baseline gap-4 lg:mb-10">
        <span className="font-mono text-sm text-signal-strong">{chapter.number}</span>
        <h2 id={headingId} className="font-display text-3xl font-bold leading-tight text-fg sm:text-4xl lg:text-5xl">
          {chapter.title}
        </h2>
      </header>
      <div className={demo ? 'grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:gap-12' : ''}>
        <div className="max-w-[64ch] space-y-7">
          {chapter.blocks.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </div>
        {demo && <div className="min-w-0 self-start xl:sticky xl:top-8">{demo}</div>}
      </div>
    </section>
  );
}
