import { SimulationState } from '../core/types';

interface RAGVisualizationProps {
  state: SimulationState;
}

export function RAGVisualization({ state }: RAGVisualizationProps) {
  const svgWidth = 600;
  const svgHeight = 400;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const processRadius = 40;
  const resourceSize = 30;

  const processCount = state.processes.length;
  const resourceCount = state.resources.length;

  const processNodes = state.processes.map((process, index) => {
    const angle = (2 * Math.PI * index) / processCount - Math.PI / 2;
    const x = centerX + Math.cos(angle) * 120;
    const y = centerY + Math.sin(angle) * 120;
    return { ...process, x, y };
  });

  const resourceNodes = state.resources.map((resource, index) => {
    const angle = (2 * Math.PI * index) / resourceCount - Math.PI / 2;
    const x = centerX + Math.cos(angle) * 60;
    const y = centerY + Math.sin(angle) * 60;
    return { ...resource, x, y };
  });

  const getRequestEdge = (processId: string, resourceId: string) => {
    const process = processNodes.find(p => p.id === processId);
    const resource = resourceNodes.find(r => r.id === resourceId);
    if (!process || !resource) return null;

    const dx = resource.x - process.x;
    const dy = resource.y - process.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const scale = (length - processRadius - resourceSize / 2) / length;

    return {
      x1: process.x + dx * scale,
      y1: process.y + dy * scale,
      x2: resource.x - dx * scale,
      y2: resource.y - dy * scale,
    };
  };

  const getAssignmentEdge = (resourceId: string, processId: string) => {
    const resource = resourceNodes.find(r => r.id === resourceId);
    const process = processNodes.find(p => p.id === processId);
    if (!resource || !process) return null;

    const dx = process.x - resource.x;
    const dy = process.y - resource.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const scale = (length - resourceSize / 2 - processRadius) / length;

    return {
      x1: resource.x + dx * scale,
      y1: resource.y + dy * scale,
      x2: process.x - dx * scale,
      y2: process.y - dy * scale,
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Resource Allocation Graph (RAG)
      </h3>

      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="mx-auto">
          <defs>
            <marker
              id="requestArrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
            </marker>
            <marker
              id="assignmentArrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
            </marker>
          </defs>

          {processNodes.map(process => (
            <g key={process.id}>
              <circle
                cx={process.x}
                cy={process.y}
                r={processRadius}
                fill="#3b82f6"
                stroke="#1d4ed8"
                strokeWidth="2"
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

          {resourceNodes.map(resource => (
            <g key={resource.id}>
              <rect
                x={resource.x - resourceSize / 2}
                y={resource.y - resourceSize / 2}
                width={resourceSize}
                height={resourceSize}
                fill="#10b981"
                stroke="#059669"
                strokeWidth="2"
              />
              <text
                x={resource.x}
                y={resource.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {resource.name}
              </text>
            </g>
          ))}

          {state.processes.flatMap(process =>
            process.requestedResources.map(resourceId => {
              const edge = getRequestEdge(process.id, resourceId);
              if (!edge) return null;
              return (
                <line
                  key={`${process.id}-request-${resourceId}`}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  markerEnd="url(#requestArrow)"
                />
              );
            })
          )}

          {state.resources.flatMap(resource =>
            resource.heldBy.map(processId => {
              const edge = getAssignmentEdge(resource.id, processId);
              if (!edge) return null;
              return (
                <line
                  key={`${resource.id}-assign-${processId}`}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#10b981"
                  strokeWidth="2"
                  markerEnd="url(#assignmentArrow)"
                />
              );
            })
          )}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-process"></div>
          <span className="text-gray-700 dark:text-gray-300">Process (Circle)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-resource"></div>
          <span className="text-gray-700 dark:text-gray-300">Resource (Square)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-waiting"></div>
          <span className="text-gray-700 dark:text-gray-300">Request Edge (P → R)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-safe"></div>
          <span className="text-gray-700 dark:text-gray-300">Assignment Edge (R → P)</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>RAG Definition:</strong> A directed graph with vertices V (processes P and resources R) and edges E.
          Request edge: P → R (process requests resource). Assignment edge: R → P (resource allocated to process).
          For single-instance resources, a cycle implies deadlock.
        </p>
      </div>
    </div>
  );
}
