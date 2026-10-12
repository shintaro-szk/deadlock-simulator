import { useState } from 'react';
import { motion } from 'framer-motion';
import { SimulationState } from '../core/types';

interface SimulationCanvasProps {
  state: SimulationState;
}

interface NodePosition {
  x: number;
  y: number;
}

export function SimulationCanvas({ state }: SimulationCanvasProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const canvasWidth = 800;
  const canvasHeight = 600;
  const nodeRadius = 40;

  const processNodes = state.processes.map((process, index) => {
    const angle = (index / state.processes.length) * 2 * Math.PI;
    const radius = 200;
    return {
      id: process.id,
      type: 'process',
      x: canvasWidth / 2 + radius * Math.cos(angle),
      y: canvasHeight / 2 + radius * Math.sin(angle),
      data: process,
    };
  });

  const resourceNodes = state.resources.map((resource, index) => {
    const angle = (index / state.resources.length) * 2 * Math.PI + Math.PI / state.resources.length;
    const radius = 120;
    return {
      id: resource.id,
      type: 'resource',
      x: canvasWidth / 2 + radius * Math.cos(angle),
      y: canvasHeight / 2 + radius * Math.sin(angle),
      data: resource,
    };
  });

  const allNodes = [...processNodes, ...resourceNodes];
  const nodePositions: Record<string, NodePosition> = {};
  allNodes.forEach(node => {
    nodePositions[node.id] = { x: node.x, y: node.y };
  });

  const edges: Array<{
    from: string;
    to: string;
    type: 'request' | 'hold';
    isInCycle: boolean;
  }> = [];

  state.processes.forEach(process => {
    process.requestedResources.forEach(resourceId => {
      edges.push({
        from: process.id,
        to: resourceId,
        type: 'request',
        isInCycle: state.deadlockCycle.includes(process.id) && state.deadlockCycle.includes(resourceId),
      });
    });
  });

  state.resources.forEach(resource => {
    resource.heldBy.forEach(processId => {
      edges.push({
        from: resource.id,
        to: processId,
        type: 'hold',
        isInCycle: state.deadlockCycle.includes(resource.id) && state.deadlockCycle.includes(processId),
      });
    });
  });

  const getEdgeColor = (edge: typeof edges[0]) => {
    if (edge.isInCycle) return '#f43f5e';
    return edge.type === 'request' ? '#f59e0b' : '#10b981';
  };

  const getNodeColor = (node: typeof allNodes[0]) => {
    if (node.type === 'resource') return '#10b981';
    const process = node.data as any;
    const stateColors: Record<string, string> = {
      idle: '#3b82f6',
      waiting: '#f59e0b',
      running: '#22c55e',
      blocked: '#f43f5e',
    };
    return stateColors[process.state] || '#3b82f6';
  };

  return (
    <section className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Resource Allocation Graph
        </h2>
        
        <div className="overflow-auto">
          <svg
            width={canvasWidth}
            height={canvasHeight}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            className="mx-auto"
            role="img"
            aria-label="Resource allocation graph showing processes and resources"
          >
            <defs>
              <marker
                id="arrowhead-request"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
              </marker>
              <marker
                id="arrowhead-hold"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
              <marker
                id="arrowhead-cycle"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#f43f5e" />
              </marker>
            </defs>

            {edges.map((edge, index) => {
              const fromPos = nodePositions[edge.from];
              const toPos = nodePositions[edge.to];
              if (!fromPos || !toPos) return null;

              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const offsetX = (dx / distance) * nodeRadius;
              const offsetY = (dy / distance) * nodeRadius;

              return (
                <motion.line
                  key={`${edge.from}-${edge.to}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  x1={fromPos.x + offsetX}
                  y1={fromPos.y + offsetY}
                  x2={toPos.x - offsetX}
                  y2={toPos.y - offsetY}
                  stroke={getEdgeColor(edge)}
                  strokeWidth={edge.isInCycle ? 3 : 2}
                  markerEnd={
                    edge.isInCycle
                      ? 'url(#arrowhead-cycle)'
                      : edge.type === 'request'
                      ? 'url(#arrowhead-request)'
                      : 'url(#arrowhead-hold)'
                  }
                  className={edge.isInCycle ? 'animate-pulse' : ''}
                />
              );
            })}

            {allNodes.map((node) => (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={getNodeColor(node)}
                  stroke={hoveredNode === node.id ? '#fff' : 'transparent'}
                  strokeWidth={3}
                  whileHover={{ scale: 1.1 }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy=".3em"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {node.id}
                </text>
              </g>
            ))}

            {hoveredNode && (
              <foreignObject
                x={nodePositions[hoveredNode]?.x || 0}
                y={(nodePositions[hoveredNode]?.y || 0) - nodeRadius - 60}
                width={200}
                height={60}
              >
                <div className="bg-gray-900 text-white p-2 rounded text-xs shadow-lg">
                  {(() => {
                    const node = allNodes.find(n => n.id === hoveredNode);
                    if (!node) return '';
                    if (node.type === 'process') {
                      const p = node.data as any;
                      return `${p.name}: ${p.state}`;
                    }
                    const r = node.data as any;
                    return `${r.name}: ${r.availableInstances}/${r.totalInstances}`;
                  })()}
                </div>
              </foreignObject>
            )}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-waiting" />
            <span className="text-gray-700 dark:text-gray-300">Request edge</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-resource" />
            <span className="text-gray-700 dark:text-gray-300">Hold edge</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-deadlock" />
            <span className="text-gray-700 dark:text-gray-300">Deadlock cycle</span>
          </div>
        </div>
      </div>
    </section>
  );
}
