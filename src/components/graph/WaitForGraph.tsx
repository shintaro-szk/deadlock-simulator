import { memo, useId, useMemo } from 'react';
import type { AllocationSnapshot, ProcessId } from '../../core/model';
import { buildWaitFor } from '../../core/rag';
import { cycleEdgeIds, findCycle } from '../../core/cycle';
import { useElementWidth } from '../../hooks/useElementSize';
import { edgeGeometry, PROCESS_RADIUS, ringLayout } from './layout';
import type { ProcessVisual } from './visuals';

interface WaitForGraphProps {
  readonly snapshot: AllocationSnapshot;
  readonly visuals: Readonly<Record<ProcessId, ProcessVisual>>;
  /** Show the cycle in red. The detection demo sets this only after the detector runs. */
  readonly showCycle: boolean;
}

const nodeClass: Record<ProcessVisual, string> = {
  ready: 'fill-surface-2 stroke-fg',
  waiting: 'fill-surface-2 stroke-wait',
  deadlocked: 'fill-signal-dim stroke-signal',
  finished: 'fill-bg stroke-ok opacity-60',
  terminated: 'fill-bg stroke-fg-faint opacity-50',
};

/** Wait-for Graph: the RAG without resource nodes. Pi → Pj means Pi waits for a resource that Pj holds. */
export const WaitForGraph = memo(function WaitForGraph({ snapshot, visuals, showCycle }: WaitForGraphProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>(280);
  const height = Math.round(Math.min(300, Math.max(220, width * 0.75)));
  const uid = useId().replace(/:/g, '');

  const wfg = useMemo(() => buildWaitFor(snapshot), [snapshot]);
  const layout = useMemo(() => ringLayout([], snapshot.processes, width, height), [snapshot.processes, width, height]);
  const cycle = useMemo(() => findCycle(wfg.nodes.map((n) => n.id), wfg.edges), [wfg]);
  const onCycle = new Set(showCycle && cycle ? cycleEdgeIds(cycle) : []);

  const description = `Wait-for Graph. ${wfg.edges.length === 0 ? 'No process waits for another.' : wfg.edges.map((e) => `${e.from} waits for ${e.to}`).join('. ')}.`;

  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={description} className="block">
        <defs>
          <marker id={`${uid}-wait`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" className="fill-fg-muted" />
          </marker>
          <marker id={`${uid}-cycle`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" className="fill-signal" />
          </marker>
        </defs>
        <g fill="none">
          {wfg.edges.map((edge) => {
            const from = layout.get(edge.from);
            const to = layout.get(edge.to);
            if (!from || !to) return null;
            const geo = edgeGeometry(from, 'process', to, 'process');
            const isCycle = onCycle.has(edge.id);
            return (
              <g key={edge.id}>
                <path
                  d={geo.d}
                  strokeWidth={isCycle ? 2.5 : 1.5}
                  markerEnd={`url(#${uid}-${isCycle ? 'cycle' : 'wait'})`}
                  className={`transition-colors duration-200 ${isCycle ? 'edge-cycle stroke-signal' : 'stroke-fg-muted'}`}
                />
                <text x={geo.mid.x} y={geo.mid.y - 5} textAnchor="middle" className="fill-fg-faint stroke-none font-mono text-2xs">
                  {edge.via.join(', ')}
                </text>
              </g>
            );
          })}
        </g>
        {snapshot.processes.map((p) => {
          const place = layout.get(p.id);
          if (!place) return null;
          const visual = visuals[p.id] ?? 'ready';
          const shown = visual === 'deadlocked' && !showCycle ? 'waiting' : visual;
          return (
            <g key={p.id}>
              <circle cx={place.x} cy={place.y} r={PROCESS_RADIUS} strokeWidth={1.5} className={`transition-colors duration-200 ${nodeClass[shown]}`} />
              <text x={place.x} y={place.y + 4} textAnchor="middle" className="fill-fg font-mono text-xs font-medium">
                {p.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
