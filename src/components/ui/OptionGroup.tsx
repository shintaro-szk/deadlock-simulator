import { useRef, type KeyboardEvent } from 'react';

export interface Option<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface OptionGroupProps<T extends string> {
  readonly label: string;
  readonly options: readonly Option<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

/**
 * A single-choice group (ARIA radio group). The arrow keys move the choice.
 * Only the selected option is in the tab order.
 */
export function OptionGroup<T extends string>({ label, options, value, onChange }: OptionGroupProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const backward = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!forward && !backward) return;
    e.preventDefault();
    // Stop the simulation shortcuts from acting on the same key.
    e.stopPropagation();
    const next = (index + (forward ? 1 : -1) + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-fg-faint">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((option, i) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`rounded border px-2.5 py-1.5 text-[13px] leading-tight transition-colors duration-150 ${
                checked ? 'border-signal bg-signal-dim text-fg' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
