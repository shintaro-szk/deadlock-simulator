/**
 * The official logo mark for dark surfaces: four resources in a closed chain of waits.
 * The paths are traced from the official 1024 x 1024 icon. The light-theme icon (white tile)
 * is in `public/favicon.svg`.
 */
const ARROWS =
  'M774.5 601.2A278.5 278.5 0 0 1 620.8 764.6L602.8 722.3A232.5 232.5 0 0 0 731.2 585.9ZM635.7 786.2L560.8 759.1L596.1 697.1ZM419 770.8A278.5 278.5 0 0 1 255.6 617.1L298 599.1A232.5 232.5 0 0 0 434.4 727.4ZM234.1 632L261.2 557L323.1 592.3ZM249.5 415.3A278.5 278.5 0 0 1 403.2 251.9L421.2 294.2A232.5 232.5 0 0 0 292.8 430.6ZM388.3 230.3L463.2 257.4L427.9 319.4ZM605 245.7A278.5 278.5 0 0 1 768.4 399.4L726 417.4A232.5 232.5 0 0 0 589.6 289.1ZM789.9 384.5L762.8 459.5L700.9 424.2Z';
const SQUARES = 'M741 475.3h66v66h-66ZM479 737.3h66v66h-66ZM217 475.3h66v66h-66ZM479 213.3h66v66h-66Z';

interface BrandMarkProps {
  /** Tailwind size classes, for example `h-6 w-6`. */
  readonly className: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg viewBox="206 206 612 612" className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <path d={ARROWS} className="fill-fg" />
      <path d={SQUARES} className="fill-signal" />
    </svg>
  );
}
