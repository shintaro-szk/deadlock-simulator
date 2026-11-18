import { ArrowUpRight, Github } from 'lucide-react';
import { credits } from '../../content/deadlocks';

/** The end of the page: the author, the source of the content, and a link to the source code. */
export function SiteFooter() {
  return (
    <footer className="flex flex-col gap-6 border-t border-line py-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        <p className="text-sm text-fg-muted">
          {credits.authorLabel} <span className="text-fg">{credits.author}</span>
        </p>
        <p className="font-mono text-xs text-fg-faint">{credits.basedOn}</p>
      </div>
      <a
        href={credits.repoUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 self-start border border-line px-3 py-2 text-sm text-fg-muted transition-colors duration-150 hover:border-line-strong hover:text-fg coarse:min-h-11 sm:self-auto"
      >
        <Github size={16} aria-hidden="true" />
        <span>{credits.repoLabel}</span>
        <ArrowUpRight size={14} aria-hidden="true" />
        <span className="sr-only">{` ${credits.newTab}`}</span>
      </a>
    </footer>
  );
}
