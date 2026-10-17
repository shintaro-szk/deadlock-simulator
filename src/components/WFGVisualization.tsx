import { SimulationState } from '../core/types';

interface WFGVisualizationProps {
  state: SimulationState;
}

export function WFGVisualization({ state }: WFGVisualizationProps) {
  const svgWidth = 600;
  const svgHeight = 400;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const processRadius = 40;

  const processNodes = state.processes.map((process, index) => {
    const angle = (2 * Math.PI * index) / state.processes.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * 100;
    const y = centerY + Math.sin(angle) * 100;
    return { ...process, x, y };
  });

  const getWaitEdge = (fromProcessId: string, toProcessId: string) => {
    const fromProcess = processNodes.find(p => p.id === fromProcessId);
    const toProcess = processNodes.find(p => p.id === toProcessId);
    if (!fromProcess || !toProcess) return null;

    const dx = toProcess.x - fromProcess.x;
    const dy = toProcess.y - fromProcess.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const scale = (length - processRadius * 2) / length;

    return {
      x1: fromProcess.x + dx * scale,
      y1: fromProcess.y + dy * scale,
      x2: toProcess.x - dx * scale,
      y2: toProcess.y - dy * scale,
    };
  };

  const buildWaitEdges = () => {
    const edges: { from: string; to: string }[] = [];

    state.processes.forEach(process => {
      process.requestedResources.forEach(resourceId => {
        const resource = state.resources.find(r => r.id === resourceId);
        if (resource && resource.heldBy.length > 0) {
          resource.heldBy.forEach(holdingProcessId => {
            if (holdingProcessId !== process.id) {
              edges.push({ from: process.id, to: holdingProcessId });
            }
          });
        }
      });
    });

    return edges;
  };

  const waitEdges = buildWaitEdges();

  const hasCycle = state.isDeadlocked;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Wait-for Graph (WFG)
      </h3>

      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="mx-auto">
          <defs>
            <marker
              id="waitArrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#f43f5e" />
            </marker>
          </defs>

          {processNodes.map(process => (
            <g key={process.id}>
              <circle
                cx={process.x}
                cy={process.y}
                r={processRadius}
                fill="#3b82f6"
                stroke={hasCycle ? "#f43f5e" : "#1d4ed8"}
                strokeWidth={hasCycle ? 3 : 2}
              />
              <text
                x={process.x}
                y={process.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {process.name}
              </text>
            </g>
          ))}

          {waitEdges.map((edge) => {
            const edgeCoords = getWaitEdge(edge.from, edge.to);
            if (!edgeCoords) return null;

            const isInCycle = hasCycle && state.deadlockCycle.includes(edge.from) && state.deadlockCycle.includes(edge.to);

            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={edgeCoords.x1}
                y1={edgeCoords.y1}
                x2={edgeCoords.x2}
                y2={edgeCoords.y2}
                stroke={isInCycle ? "#f43f5e" : "#f59e0b"}
                strokeWidth={isInCycle ? 3 : 2}
                markerEnd="url(#waitArrow)"
              />
            );
          })}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-process"></div>
          <span className="text-gray-700 dark:text-gray-300">Process (Circle)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-waiting"></div>
          <span className="text-gray-700 dark:text-gray-300">Wait Edge (Pi → Pj)</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          <strong>WFG Definition:</strong> Simplified version of RAG removing resource nodes. Only shows processes and who they wait on.
          Arrow from Pi → Pj: Pi waits for resource held by Pj.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          If there's a cycle, it means the processes are deadlocked.
          Example: P1 → P2 → P3 → P1 forms a cycle → deadlock.
        </p>
      </div>

      {hasCycle && (
        <div className="mt-4 p-4 bg-deadlock/10 border border-deadlock rounded-lg">
          <p className="text-sm text-deadlock font-semibold">
            Cycle Detected: {state.deadlockCycle.join(' → ')}
          </p>
        </div>
      )}
    </div>
  );
}
