import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly onChange: (value: number) => void;
}

/** A whole-number input with − and + buttons. */
export function Stepper({ label, value, min, max, onChange }: StepperProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  const button = 'grid h-8 w-8 place-items-center text-fg-muted transition-colors duration-150 hover:text-fg disabled:opacity-30';
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 font-mono text-xs text-fg-faint">{label}</span>
      <div className="flex items-center rounded border border-line">
        <button type="button" className={button} onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Less ${label}`}>
          <Minus size={14} aria-hidden="true" />
        </button>
        <output aria-live="polite" aria-label={`${label} requested`} className="w-6 text-center font-mono text-sm tabular-nums text-fg">
          {value}
        </output>
        <button type="button" className={button} onClick={() => set(value + 1)} disabled={value >= max} aria-label={`More ${label}`}>
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
