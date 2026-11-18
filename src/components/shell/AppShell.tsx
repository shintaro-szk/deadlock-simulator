import { useEffect, useState, type ReactNode } from 'react';
import { chapters, deck, type ChapterId } from '../../content/deadlocks';
import { ActiveChapterContext } from './activeChapter';
import { ChapterBar, ChapterRail } from './ChapterRail';
import { ChapterSection } from './ChapterSection';

interface AppShellProps {
  /** A live demo for some chapters. */
  readonly demos: Partial<Record<ChapterId, ReactNode>>;
}

/** Track the chapter that crosses the upper middle of the viewport. */
function useActiveChapter(): ChapterId {
  const [active, setActive] = useState<ChapterId>('concept');
  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        const id = hit?.target.getAttribute('data-chapter') as ChapterId | null;
        if (id) setActive(id);
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return active;
}

export function AppShell({ demos }: AppShellProps) {
  const active = useActiveChapter();
  return (
    <ActiveChapterContext.Provider value={active}>
      <a href="#concept" className="sr-only z-50 bg-signal-solid px-3 py-2 text-fg focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <div className="flex min-h-screen">
        <ChapterRail active={active} />
        <div className="min-w-0 flex-1">
          <ChapterBar active={active} />
          <main id="top" className="mx-auto max-w-[78rem] px-4 sm:px-8 lg:px-12">
            <header className="pb-14 pt-12 lg:pb-20 lg:pt-24">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-strong">Operating systems</p>
              <h1 className="max-w-4xl font-display text-4xl font-bold leading-[1.05] text-fg sm:text-6xl lg:text-7xl">
                {deck.title}
              </h1>
              <p className="mt-4 text-lg text-fg-muted sm:text-xl">{deck.subtitle}</p>
            </header>
            {chapters.map((chapter) => (
              <ChapterSection key={chapter.id} chapter={chapter} demo={demos[chapter.id]} />
            ))}
            <footer className="border-t border-line py-10 font-mono text-xs text-fg-faint">
              Based on the presentation “{deck.title}: {deck.subtitle}”.
            </footer>
          </main>
        </div>
      </div>
    </ActiveChapterContext.Provider>
  );
}
