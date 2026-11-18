import { useMemo, useState } from 'react';
import type { AllocationSnapshot } from '../core/model';
import { analyzeState } from '../core/detection';
import { createSim, run } from '../core/engine';
import { GraphStage } from '../components/graph/GraphStage';
import { GraphLegend } from '../components/graph/GraphLegend';
import { snapshotVisuals } from '../components/graph/visuals';
import { OptionGroup } from '../components/ui/OptionGroup';
import { Panel, PanelRow } from '../components/ui/Panel';
import { circularWait } from '../scenarios/circularWait';
import { cycleNoDeadlock } from '../scenarios/snapshots';
import { ragChoices, uiText, type RagChoice } from '../content/demoText';
import { isZero, row } from '../core/vector';

/** The circular wait after it deadlocks. Every resource has one instance. */
const singleInstance: AllocationSnapshot = run(createSim(circularWait, 'none'));

const snapshots: Record<RagChoice, AllocationSnapshot> = { single: singleInstance, multiple: cycleNoDeadlock };

/** Ring order for the multiple-instance graph: the cycle R1 → P3 → R2 → P1 sits on neighbours, P2 and P4 sit next to the resource they hold. */
const ringOrder: Record<RagChoice, readonly string[] | undefined> = {
  single: undefined,
  multiple: ['R1', 'P3', 'R2', 'P4', 'P1', 'P2'],
};

/** Explain why the multiple-instance cycle is not a deadlock, in the order that detection finds. */
function multipleNote(snapshot: AllocationSnapshot, finishOrder: readonly string[]): string {
  const ids = snapshot.resources.map((r) => r.id);
  const free = finishOrder.filter((p) => isZero(ids, row(snapshot.request, p)));
  const later = finishOrder.filter((p) => !free.includes(p));
  const list = (items: readonly string[]) => items.join(' and ');
  return `R1 and R2 have two instances each. ${list(free)} wait for nothing, so they finish and free one instance each. Then ${list(later)} get what they wait for and finish too.`;
}

function EdgeSet({ label, edges }: { readonly label: string; readonly edges: readonly string[] }) {
  return (
    <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-[9rem_1fr]">
      <dt className="text-fg-faint">{label}</dt>
      <dd className="font-mono text-fg-muted">{edges.length > 0 ? edges.join(', ') : uiText.noEdges}</dd>
    </div>
  );
}

/** Chapter 03: the same rule, two results. A cycle with single instances is a deadlock; with multiple instances it may not be. */
export default function RagDemo() {
  const [choice, setChoice] = useState<RagChoice>('single');
  const snapshot = snapshots[choice];
  const analysis = useMemo(() => analyzeState(snapshot), [snapshot]);
  const visuals = useMemo(() => snapshotVisuals(snapshot, analysis.deadlocked), [snapshot, analysis.deadlocked]);

  const arrow = (from: string, to: string) => `${from} → ${to}`;
  const requests = analysis.rag.edges.filter((e) => e.kind === 'request').map((e) => arrow(e.from, e.to));
  const assignments = analysis.rag.edges.filter((e) => e.kind === 'assignment').map((e) => arrow(e.from, e.to));
  const cyclePath = analysis.cycle ? [...analysis.cycle, analysis.cycle[0]].join(' → ') : null;

  return (
    <Panel kind="Graph" title="Resource Allocation Graph">
      <PanelRow>
        <OptionGroup label="Resources" options={ragChoices} value={choice} onChange={setChoice} />
      </PanelRow>
      <div>
        <GraphStage
          snapshot={snapshot}
          visuals={visuals}
          cycle={analysis.cycle}
          cycleTone={analysis.isDeadlocked ? 'deadlock' : 'warning'}
          order={ringOrder[choice]}
          description={`Resource Allocation Graph. ${cyclePath ? `Cycle ${cyclePath}.` : 'No cycle.'} ${analysis.isDeadlocked ? 'Deadlock.' : 'No deadlock.'}`}
        />
        <div className="border-t border-line">
          <GraphLegend showWarning />
        </div>
      </div>
      <PanelRow className={analysis.isDeadlocked ? 'bg-signal-dim/40' : ''}>
        <p role="status" aria-live="polite" className="space-y-1">
          <span className={`block font-display text-lg font-semibold ${analysis.isDeadlocked ? 'text-signal-strong' : 'text-wait'}`}>
            {analysis.isDeadlocked ? 'Cycle → deadlock' : 'Cycle, but no deadlock'}
          </span>
          <span className="block font-mono text-xs text-fg-muted">{cyclePath}</span>
          <span className="block text-sm text-fg-muted">
            {analysis.cycleIsSingleInstance
              ? 'Every resource on the cycle has one instance, so the cycle is a deadlock.'
              : multipleNote(snapshot, analysis.detection.finishOrder)}
          </span>
        </p>
      </PanelRow>
      <PanelRow>
        <dl className="space-y-2 text-xs">
          <EdgeSet label="Request edges" edges={requests} />
          <EdgeSet label="Assignment edges" edges={assignments} />
        </dl>
      </PanelRow>
    </Panel>
  );
}
