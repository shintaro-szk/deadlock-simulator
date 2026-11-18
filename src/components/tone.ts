import type { Tone } from '../content/simText';

/** Text colour class for each tone. */
export const toneText: Record<Tone, string> = {
  neutral: 'text-fg',
  muted: 'text-fg-muted',
  signal: 'text-signal-strong',
  ok: 'text-ok',
  wait: 'text-wait',
};

/** Fill colour class for each tone (status markers). */
export const toneFill: Record<Tone, string> = {
  neutral: 'bg-fg',
  muted: 'bg-fg-faint',
  signal: 'bg-signal',
  ok: 'bg-ok',
  wait: 'bg-wait',
};
