import { memo, useEffect, useRef } from 'react';
import type { ResourceSpec } from '../../core/model';
import type { ReductionCheck } from '../../core/reduction';
import { formatVector } from '../../content/simText';
import { scrollBehavior } from '../../hooks/motion';

interface ReductionTraceProps {
  readonly trace: readonly ReductionCheck[];
  readonly resources: readonly ResourceSpec[];
  /** "Need" for Banker's, "Request" for detection. */
  readonly demandLabel: string;
  /** Show only the checks up to this index, and mark it. Omit to show all checks. */
  readonly upTo?: number;
}

/**
 * Each check of the "find a process that can finish" loop:
 * "P1  Need (1, 2, 2) ≤ Work (3, 3, 2)?  yes → Work (5, 3, 2)".
 */
export const ReductionTrace = memo(function ReductionTrace({ trace, resources, demandLabel, upTo }: ReductionTraceProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const shown = upTo === undefined ? trace : trace.slice(0, upTo + 1);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: scrollBehavior() });
  }, [shown.length]);

  return (
    <ol ref={listRef} aria-label="Algorithm steps" tabIndex={0} className="max-h-56 space-y-0.5 overflow-y-auto overscroll-contain font-mono text-[11px] leading-5">
      {shown.map((check, i) => {
        const current = upTo !== undefined && i === upTo;
        const newPass = i > 0 && trace[i - 1].pass !== check.pass;
        return (
          <li key={i} className={`${newPass ? 'mt-1.5 border-t border-line/60 pt-1.5' : ''}`}>
            <div className={`grid grid-cols-[2rem_1fr] gap-x-2 rounded-sm px-1 ${current ? 'bg-surface-2' : ''}`}>
              <span className="text-fg">{check.process}</span>
              <span className="text-fg-muted">
                {demandLabel} {formatVector(check.demand, resources)} ≤ Work {formatVector(check.work, resources)}?{' '}
                {check.canFinish ? (
                  <span className="text-ok">
                    yes → Work {check.workAfter ? formatVector(check.workAfter, resources) : ''}
                  </span>
                ) : (
                  <span className="text-wait">no</span>
                )}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
});
