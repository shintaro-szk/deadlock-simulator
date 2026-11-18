import { ArrowUpRight } from 'lucide-react';
import type { Block, Point } from '../../content/deadlocks';
import { chapters } from '../../content/deadlocks';

const toneLabel = { downside: 'Downside', works: 'Works', fails: 'Limit' } as const;
const toneClass = { downside: 'text-signal-strong', works: 'text-ok', fails: 'text-signal-strong' } as const;

function PointItem({ point }: { readonly point: Point }) {
  const label = point.label ?? (point.tone ? toneLabel[point.tone] : undefined);
  // Tone labels are short tags, so they are one step smaller. Other labels can hold formulas such as "Pi → Rj".
  const labelClass = point.tone ? `${toneClass[point.tone]} text-xs` : 'text-sm text-fg';
  return (
    <>
      {label && <span className={`font-mono leading-6 ${labelClass}`}>{label}</span>}
      <span className="text-fg-muted">{point.text}</span>
    </>
  );
}

function PointList({ items, ordered }: { readonly items: readonly Point[]; readonly ordered?: boolean }) {
  const labelled = items.some((p) => p.label || p.tone);
  const List = ordered ? 'ol' : 'ul';
  return (
    <List className="divide-y divide-line/70 border-y border-line/70">
      {items.map((point, i) => (
        <li
          key={i}
          className={`grid gap-x-4 gap-y-1 py-2.5 ${labelled ? 'sm:grid-cols-[10rem_1fr]' : ordered ? 'grid-cols-[1.5rem_1fr]' : ''}`}
        >
          {ordered && !labelled && <span className="font-mono text-xs leading-6 text-signal-strong">{i + 1}</span>}
          {labelled ? <PointItem point={point} /> : <span className="text-fg-muted">{point.text}</span>}
        </li>
      ))}
    </List>
  );
}

function Example({ text }: { readonly text: string }) {
  return (
    <p className="border-l-2 border-signal py-0.5 pl-4 text-fg">
      <span className="mr-2 font-mono text-xs text-fg-faint">Example</span>
      {text}
    </p>
  );
}

/** Render one block of chapter text. */
export function BlockView({ block }: { readonly block: Block }) {
  switch (block.kind) {
    case 'lead':
      return <p className="text-lg leading-relaxed text-fg sm:text-xl">{block.text}</p>;
    case 'para':
      return <p className="leading-relaxed text-fg-muted">{block.text}</p>;
    case 'quote':
      return (
        <blockquote className="border-l-2 border-signal pl-5 font-display text-2xl font-semibold leading-snug text-fg sm:text-3xl">
          “{block.text}”
        </blockquote>
      );
    case 'list':
      return (
        <div className="space-y-3">
          {block.title && <h3 className="font-mono text-xs text-fg-faint">{block.title}</h3>}
          <PointList items={block.items} ordered={block.ordered} />
        </div>
      );
    case 'topic':
      return (
        <article className="space-y-3">
          <h3 className="font-display text-xl font-semibold text-fg">{block.title}</h3>
          {block.body.map((text, i) => (
            <p key={i} className="leading-relaxed text-fg-muted">
              {text}
            </p>
          ))}
          {block.points && <PointList items={block.points} ordered={block.ordered} />}
          {block.example && <Example text={block.example} />}
        </article>
      );
    case 'approaches':
      return (
        <div className="space-y-3">
          <h3 className="font-mono text-xs text-fg-faint">{block.title}</h3>
          <div className="grid border border-line sm:grid-cols-2">
            {block.columns.map((column, ci) => (
              <div key={column.title} className={`p-4 ${ci > 0 ? 'border-t border-line sm:border-l sm:border-t-0' : ''}`}>
                <p className="mb-3 font-display text-base font-semibold text-fg">{column.title}</p>
                <div className="space-y-4">
                  {column.groups.map((group) => {
                    const target = chapters.find((c) => c.id === group.chapter);
                    return (
                      <div key={group.title}>
                        <a href={`#${group.chapter}`} className="group inline-flex items-baseline gap-2 text-sm text-fg hover:text-signal-strong coarse:min-h-11 coarse:items-center">
                          <span className="font-mono text-xs text-signal-strong">{target?.number}</span>
                          <span className="underline decoration-line underline-offset-4 group-hover:decoration-signal">{group.title}</span>
                        </a>
                        <ul className="mt-1.5 space-y-0.5 pl-7 text-sm text-fg-muted">
                          {group.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'references':
      return (
        <div className="space-y-10">
          {block.groups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="font-mono text-xs text-fg-faint">{group.title}</h3>
              <ul className="divide-y divide-line border-y border-line">
                {group.items.map((ref) => (
                  <li key={ref.title} className="py-4">
                    <p className="text-fg">{ref.title}</p>
                    <p className="mt-1 text-sm text-fg-muted">{ref.detail}</p>
                    {ref.href && (
                      <a
                        href={ref.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-signal-strong hover:underline coarse:min-h-11"
                      >
                        {ref.href.replace('https://', '')}
                        <ArrowUpRight size={12} aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
  }
}
