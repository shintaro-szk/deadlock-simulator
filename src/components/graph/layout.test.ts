import { describe, expect, it } from 'vitest';
import { edgeGeometry, PROCESS_RADIUS, ringLayout } from './layout';
import { circularWait } from '../../scenarios/circularWait';

describe('ringLayout', () => {
  it('places R1 at the top and alternates resources and processes', () => {
    const layout = ringLayout(circularWait.resources, circularWait.processes, 600, 400);
    expect([...layout.keys()]).toEqual(['R1', 'P1', 'R2', 'P2', 'R3', 'P3']);
    const top = layout.get('R1');
    expect(top?.x).toBeCloseTo(300);
    expect(top?.y).toBeCloseTo(50);
  });

  it('follows a preferred order and puts unlisted nodes at the end', () => {
    const layout = ringLayout(circularWait.resources, circularWait.processes, 600, 400, ['P3', 'R1']);
    expect([...layout.keys()]).toEqual(['P3', 'R1', 'P1', 'R2', 'P2', 'R3']);
  });

  it('keeps every node inside the stage', () => {
    for (const [, p] of ringLayout(circularWait.resources, circularWait.processes, 340, 260)) {
      expect(p.x).toBeGreaterThan(PROCESS_RADIUS);
      expect(p.x).toBeLessThan(340 - PROCESS_RADIUS);
      expect(p.y).toBeGreaterThan(PROCESS_RADIUS);
      expect(p.y).toBeLessThan(260 - PROCESS_RADIUS);
    }
  });
});

describe('edgeGeometry', () => {
  it('starts on the border of the first node and bends to the left', () => {
    const g = edgeGeometry({ x: 0, y: 0 }, 'process', { x: 200, y: 0 }, 'resource');
    expect(g.d.startsWith(`M${PROCESS_RADIUS},0`)).toBe(true);
    expect(g.mid.y).toBeLessThan(0);
  });

  it('bends the reverse edge to the other side', () => {
    const forward = edgeGeometry({ x: 0, y: 0 }, 'process', { x: 200, y: 0 }, 'resource');
    const back = edgeGeometry({ x: 200, y: 0 }, 'resource', { x: 0, y: 0 }, 'process');
    expect(Math.sign(forward.mid.y)).not.toBe(Math.sign(back.mid.y));
  });
});
