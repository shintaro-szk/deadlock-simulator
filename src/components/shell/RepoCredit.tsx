import { Github } from 'lucide-react';
import { credits } from '../../content/deadlocks';

interface RepoCreditProps {
  /** Tailwind layout classes for the place where the link sits. */
  readonly className: string;
}

/** The author name and the GitHub icon, as one link to the source code. */
export function RepoCredit({ className }: RepoCreditProps) {
  return (
    <a
      href={credits.repoUrl}
      target="_blank"
      rel="noreferrer"
      title={credits.repoLabel}
      className={`flex items-center text-xs text-fg-faint transition-colors duration-150 hover:text-fg coarse:min-h-11 ${className}`}
    >
      <span>{credits.author}</span>
      <span className="sr-only">{`: ${credits.repoSuffix} ${credits.newTab}`}</span>
      <Github size={16} aria-hidden="true" className="shrink-0" />
    </a>
  );
}
