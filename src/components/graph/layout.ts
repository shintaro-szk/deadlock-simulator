import type { ProcessSpec, ResourceSpec } from '../../core/model';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface NodePlacement extends Point {
  /** Direction from the centre, in radians. Labels go on the outer side. */
  readonly angle: number;
}

export const PROCESS_RADIUS = 24;
export const RESOURCE_HALF = 24;

/**
 * Put the nodes on an ellipse in the order R1, P1, R2, P2, …
 * In the scenarios, Pi holds Ri and requests R(i+1), so each edge of a circular wait joins two
 * neighbours on the ring and the cycle reads as a closed loop.
 */
export function ringLayout(
  resources: readonly ResourceSpec[],
  processes: readonly ProcessSpec[],
  width: number,
  height: number,
  /** Optional ring order. Nodes that it does not list go at the end. */
  preferred?: readonly string[],
): Map<string, NodePlacement> {
  const interleaved: string[] = [];
  const longest = Math.max(resources.length, processes.length);
  for (let i = 0; i < longest; i += 1) {
    if (resources[i]) interleaved.push(resources[i].id);
    if (processes[i]) interleaved.push(processes[i].id);
  }
  const known = new Set(interleaved);
  const order = preferred
    ? [...preferred.filter((id) => known.has(id)), ...interleaved.filter((id) => !preferred.includes(id))]
    : interleaved;

  const cx = width / 2;
  const cy = height / 2;
  // Keep space for the nodes and their labels. Narrow stages use a smaller margin.
  const marginX = Math.min(72, Math.max(40, width * 0.14));
  const rx = Math.max(40, width / 2 - marginX);
  const ry = Math.max(40, height / 2 - 50);

  const out = new Map<string, NodePlacement>();
  order.forEach((id, i) => {
    const angle = -Math.PI / 2 + (i / order.length) * Math.PI * 2;
    out.set(id, { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle), angle });
  });
  return out;
}

/** Distance from the centre of a node to its border in the direction (dx, dy). */
function borderDistance(kind: 'process' | 'resource', dx: number, dy: number): number {
  if (kind === 'process') return PROCESS_RADIUS;
  const len = Math.hypot(dx, dy) || 1;
  const scale = Math.max(Math.abs(dx), Math.abs(dy)) / len;
  return RESOURCE_HALF / (scale || 1);
}

export interface EdgeGeometry {
  readonly d: string;
  /** Point on the curve half way along. The instance count goes here. */
  readonly mid: Point;
}

/**
 * A curved edge from border to border.
 * The curve always bends to the left of its direction, so the edges A → B and B → A do not overlap.
 */
export function edgeGeometry(
  from: Point,
  fromKind: 'process' | 'resource',
  to: Point,
  toKind: 'process' | 'resource',
  arrowGap = 4,
): EdgeGeometry {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const bend = Math.min(36, len * 0.14);
  const nx = uy;
  const ny = -ux;

  const start = { x: from.x + ux * borderDistance(fromKind, dx, dy), y: from.y + uy * borderDistance(fromKind, dx, dy) };
  const endTrim = borderDistance(toKind, dx, dy) + arrowGap;
  const end = { x: to.x - ux * endTrim, y: to.y - uy * endTrim };
  const control = { x: (start.x + end.x) / 2 + nx * bend, y: (start.y + end.y) / 2 + ny * bend };

  const mid = {
    x: 0.25 * start.x + 0.5 * control.x + 0.25 * end.x,
    y: 0.25 * start.y + 0.5 * control.y + 0.25 * end.y,
  };
  const r = (n: number) => Math.round(n * 10) / 10;
  return { d: `M${r(start.x)},${r(start.y)} Q${r(control.x)},${r(control.y)} ${r(end.x)},${r(end.y)}`, mid };
}
