import { memo, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AllocationSnapshot, ProcessId, ResourceSpec } from '../../core/model';
import { buildRag, type RagEdge } from '../../core/rag';
import { cycleEdgeIds } from '../../core/cycle';
import { formatItems } from '../../content/simText';
import { at, row } from '../../core/vector';
import { useElementWidth } from '../../hooks/useElementSize';
import { edgeGeometry, PROCESS_RADIUS, RESOURCE_HALF, ringLayout } from './layout';
import type { ProcessVisual } from './visuals';

export type CycleTone = 'deadlock' | 'warning';

interface GraphStageProps {
  readonly snapshot: AllocationSnapshot;
  readonly visuals: Readonly<Record<ProcessId, ProcessVisual>>;
  /** A cycle in path order, from analyzeState. */
  readonly cycle: readonly string[] | null;
  /** Red when the cycle is a deadlock. Amber when the cycle is not a deadlock (multiple instances). */
  readonly cycleTone: CycleTone;
  /** Short text description for screen readers. */
  readonly description: string;
  /** Optional ring order of the nodes, so that a cycle joins neighbours. */
  readonly order?: readonly string[];
}

const processClass: Record<ProcessVisual, string> = {
  ready: 'fill-surface-2 stroke-fg',
  waiting: 'fill-surface-2 stroke-wait',
  deadlocked: 'fill-signal-dim stroke-signal',
  finished: 'fill-bg stroke-ok opacity-60',
  terminated: 'fill-bg stroke-fg-faint opacity-50',
};

const processText: Record<ProcessVisual, string> = {
  ready: 'fill-fg',
  waiting: 'fill-wait',
  deadlocked: 'fill-signal-strong',
  finished: 'fill-ok',
  terminated: 'fill-fg-faint',
};

const visualWord: Record<ProcessVisual, string> = {
  ready: 'ready',
  waiting: 'waiting',
  deadlocked: 'deadlocked',
  finished: 'finished',
  terminated: 'killed',
};

function stageHeight(width: number): number {
  const ratio = width < 480 ? 0.8 : 0.56;
  return Math.round(Math.min(380, Math.max(260, width * ratio)));
}

function describeNode(id: string, snapshot: AllocationSnapshot, visuals: GraphStageProps['visuals']): string {
  const process = snapshot.processes.find((p) => p.id === id);
  if (process) {
    const holds = formatItems(row(snapshot.allocation, id), snapshot.resources);
    const waits = formatItems(row(snapshot.request, id), snapshot.resources);
    return `${id} is ${visualWord[visuals[id] ?? 'ready']}. Holds ${holds}. Waits for ${waits}.`;
  }
  const resource = snapshot.resources.find((r) => r.id === id);
  if (!resource) return '';
  const holders = snapshot.processes.filter((p) => at(row(snapshot.allocation, p.id), id) > 0).map((p) => p.id);
  const waiters = snapshot.processes.filter((p) => at(row(snapshot.request, p.id), id) > 0).map((p) => p.id);
  const count = resource.instances === 1 ? '1 instance' : `${resource.instances} instances`;
  return `${id} (${resource.label}), ${count}. Held by ${holders.join(', ') || 'nobody'}. Requested by ${waiters.join(', ') || 'nobody'}.`;
}

function ResourceDots({ resource, held, x, y }: { readonly resource: ResourceSpec; readonly held: number; readonly x: number; readonly y: number }) {
  if (resource.instances > 6) {
    return (
      <text x={x} y={y + 13} textAnchor="middle" className="fill-fg-muted font-mono text-[10px]">
        {held}/{resource.instances}
      </text>
    );
  }
  const gap = 7;
  const start = x - ((resource.instances - 1) * gap) / 2;
  return (
    <g>
      {Array.from({ length: resource.instances }, (_, i) => (
        <circle
          key={i}
          cx={start + i * gap}
          cy={y + 10}
          r={2.5}
          className={`transition-colors duration-200 ${i < held ? 'fill-fg stroke-fg' : 'fill-transparent stroke-fg-faint'}`}
          strokeWidth={1}
        />
      ))}
    </g>
  );
}

/**
 * Resource Allocation Graph. Processes are circles. Resources are squares with one dot per instance
 * (filled = held). Request edges are dashed (Pi → Rj). Assignment edges are solid (Rj → Pi).
 */
export const GraphStage = memo(function GraphStage({ snapshot, visuals, cycle, cycleTone, description, order }: GraphStageProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const height = stageHeight(width);
  const uid = useId().replace(/:/g, '');
  const [focused, setFocused] = useState<string | null>(null);

  const layout = useMemo(
    () => ringLayout(snapshot.resources, snapshot.processes, width, height, order),
    [snapshot.resources, snapshot.processes, width, height, order],
  );
  const { edges } = useMemo(() => buildRag(snapshot), [snapshot]);
  const onCycle = useMemo(() => new Set(cycle ? cycleEdgeIds(cycle) : []), [cycle]);
  const cycleNodes = useMemo(() => new Set(cycle ?? []), [cycle]);

  const kindOf = (id: string) => (snapshot.processes.some((p) => p.id === id) ? 'process' : 'resource') as 'process' | 'resource';
  const marker = (edge: RagEdge) =>
    onCycle.has(edge.id) ? `url(#${uid}-${cycleTone})` : edge.kind === 'request' ? `url(#${uid}-request)` : `url(#${uid}-assign)`;
  const edgeClass = (edge: RagEdge) =>
    onCycle.has(edge.id)
      ? `edge-cycle ${cycleTone === 'deadlock' ? 'stroke-signal' : 'stroke-wait'}`
      : edge.kind === 'request'
        ? 'stroke-fg-muted'
        : 'stroke-fg';

  const detail = focused ? describeNode(focused, snapshot, visuals) : 'Point at or tap a node to see what it holds and waits for.';

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={description} className="block select-none">
        <defs>
          {(
            [
              ['assign', 'fill-fg'],
              ['request', 'fill-fg-muted'],
              ['deadlock', 'fill-signal'],
              ['warning', 'fill-wait'],
            ] as const
          ).map(([name, fill]) => (
            <marker key={name} id={`${uid}-${name}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 z" className={fill} />
            </marker>
          ))}
        </defs>

        <g fill="none">
          <AnimatePresence initial={false}>
            {edges.map((edge) => {
              const from = layout.get(edge.from);
              const to = layout.get(edge.to);
              if (!from || !to) return null;
              const geo = edgeGeometry(from, kindOf(edge.from), to, kindOf(edge.to));
              const isCycle = onCycle.has(edge.id);
              return (
                <motion.g key={edge.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <path
                    d={geo.d}
                    strokeWidth={isCycle ? 2.5 : 1.5}
                    strokeDasharray={!isCycle && edge.kind === 'request' ? '5 4' : undefined}
                    markerEnd={marker(edge)}
                    className={`transition-colors duration-200 ${edgeClass(edge)}`}
                  />
                  {edge.count > 1 && (
                    <text x={geo.mid.x} y={geo.mid.y - 4} textAnchor="middle" className="fill-fg-muted stroke-none font-mono text-[10px]">
                      ×{edge.count}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </g>

        {snapshot.resources.map((resource) => {
          const place = layout.get(resource.id);
          if (!place) return null;
          const held = snapshot.processes.reduce((sum, p) => sum + at(row(snapshot.allocation, p.id), resource.id), 0);
          const inCycle = cycleNodes.has(resource.id);
          return (
            <g
              key={resource.id}
              tabIndex={0}
              aria-label={describeNode(resource.id, snapshot, visuals)}
              onMouseEnter={() => setFocused(resource.id)}
              onMouseLeave={() => setFocused(null)}
              onFocus={() => setFocused(resource.id)}
              onBlur={() => setFocused(null)}
              className="cursor-default outline-none"
            >
              <rect
                x={place.x - RESOURCE_HALF}
                y={place.y - RESOURCE_HALF}
                width={RESOURCE_HALF * 2}
                height={RESOURCE_HALF * 2}
                rx={3}
                strokeWidth={focused === resource.id ? 2.5 : 1.5}
                className={`fill-surface-2 transition-colors duration-200 ${inCycle && cycleTone === 'deadlock' ? 'stroke-signal' : focused === resource.id ? 'stroke-fg' : 'stroke-line-strong'}`}
              />
              <text x={place.x} y={place.y - 2} textAnchor="middle" className="fill-fg font-mono text-[12px] font-medium">
                {resource.id}
              </text>
              <ResourceDots resource={resource} held={held} x={place.x} y={place.y} />
              <text x={place.x} y={place.y + RESOURCE_HALF + 14} textAnchor="middle" className="fill-fg-faint text-[11px]">
                {resource.label}
              </text>
            </g>
          );
        })}

        {snapshot.processes.map((process) => {
          const place = layout.get(process.id);
          if (!place) return null;
          const visual = visuals[process.id] ?? 'ready';
          return (
            <g
              key={process.id}
              tabIndex={0}
              aria-label={describeNode(process.id, snapshot, visuals)}
              onMouseEnter={() => setFocused(process.id)}
              onMouseLeave={() => setFocused(null)}
              onFocus={() => setFocused(process.id)}
              onBlur={() => setFocused(null)}
              className="cursor-default outline-none"
            >
              {focused === process.id && <circle cx={place.x} cy={place.y} r={PROCESS_RADIUS + 5} className="fill-none stroke-fg-faint" strokeWidth={1} />}
              <circle
                cx={place.x}
                cy={place.y}
                r={PROCESS_RADIUS}
                strokeWidth={visual === 'deadlocked' ? 2.5 : 1.5}
                strokeDasharray={visual === 'waiting' ? '3 3' : undefined}
                className={`transition-colors duration-200 ${processClass[visual]}`}
              />
              {visual === 'terminated' && (
                <line
                  x1={place.x - 14}
                  y1={place.y + 14}
                  x2={place.x + 14}
                  y2={place.y - 14}
                  className="stroke-fg-faint"
                  strokeWidth={1.5}
                />
              )}
              <text x={place.x} y={place.y + 4} textAnchor="middle" className={`font-mono text-[12px] font-medium transition-colors duration-200 ${processText[visual]}`}>
                {process.id}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="min-h-[2.5rem] border-t border-line px-4 py-2.5 text-xs leading-5 text-fg-muted">{detail}</p>
    </div>
  );
});
