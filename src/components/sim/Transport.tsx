import { Pause, Play, RotateCcw, StepBack, StepForward } from 'lucide-react';
import type { ReactNode } from 'react';
import { SPEEDS, type SimulationControls } from '../../hooks/useSimulation';

interface TransportProps {
  readonly sim: SimulationControls;
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded border border-line text-fg-muted transition-colors duration-150 hover:border-line-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-fg-muted"
    >
      {children}
    </button>
  );
}

/** Play, pause, step, step back, reset, and speed. */
export function Transport({ sim }: TransportProps) {
  const ended = !sim.canForward;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="flex items-center gap-1.5">
        <IconButton label="Reset (R)" onClick={sim.reset}>
          <RotateCcw size={16} aria-hidden="true" />
        </IconButton>
        <IconButton label="Step back (←)" onClick={sim.back} disabled={!sim.canBack}>
          <StepBack size={16} aria-hidden="true" />
        </IconButton>
        <button
          type="button"
          onClick={sim.toggle}
          disabled={ended && !sim.playing}
          aria-label={sim.playing ? 'Pause (Space)' : 'Play (Space)'}
          className="flex h-9 min-w-[6.5rem] items-center justify-center gap-2 rounded bg-signal px-4 font-medium text-fg transition-colors duration-150 hover:bg-signal-strong disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-faint"
        >
          {sim.playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          <span>{sim.playing ? 'Pause' : 'Play'}</span>
        </button>
        <IconButton label="Step forward (→)" onClick={sim.forward} disabled={ended}>
          <StepForward size={16} aria-hidden="true" />
        </IconButton>
      </div>

      <div role="group" aria-label="Speed" className="flex items-center rounded border border-line p-0.5">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            aria-pressed={sim.speed === speed}
            onClick={() => sim.setSpeed(speed)}
            className={`rounded-sm px-2 py-1 font-mono text-xs transition-colors duration-150 ${
              sim.speed === speed ? 'bg-surface-2 text-fg' : 'text-fg-faint hover:text-fg-muted'
            }`}
          >
            {speed}×
          </button>
        ))}
      </div>

      <p className="ml-auto font-mono text-xs uppercase tracking-wider text-fg-faint">
        Step <span className="text-fg tabular-nums">{String(sim.state.step).padStart(2, '0')}</span>
      </p>
    </div>
  );
}
