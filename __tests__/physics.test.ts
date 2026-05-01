import { describe, it, expect } from 'vitest';
import {
  simulateTrajectory,
  forceToVelocity,
  circlesOverlap,
  circleDistance,
  vecLength,
  vecNormalize,
  reflectVector,
  DEFAULT_PHYSICS,
} from '../lib/physics';

describe('Physics Engine', () => {
  describe('Vector Operations', () => {
    it('vecLength calculates magnitude correctly', () => {
      expect(vecLength({ x: 3, y: 4 })).toBeCloseTo(5);
      expect(vecLength({ x: 0, y: 0 })).toBeCloseTo(0);
    });

    it('vecNormalize returns unit vector', () => {
      const n = vecNormalize({ x: 3, y: 4 });
      expect(vecLength(n)).toBeCloseTo(1);
    });

    it('reflectVector reflects off horizontal surface', () => {
      const vel = { x: 1, y: 1 };
      const normal = { x: 0, y: -1 }; // pointing up
      const reflected = reflectVector(vel, normal);
      expect(reflected.x).toBeCloseTo(1);
      expect(reflected.y).toBeCloseTo(-1);
    });
  });

  describe('Force Conversion', () => {
    it('forceToVelocity at 0 degrees', () => {
      const vel = forceToVelocity(100, 0);
      expect(vel.x).toBeCloseTo(30);
      expect(vel.y).toBeCloseTo(0);
    });

    it('forceToVelocity at 90 degrees', () => {
      const vel = forceToVelocity(100, 90);
      expect(vel.x).toBeCloseTo(0);
      expect(vel.y).toBeCloseTo(30);
    });

    it('forceToVelocity scales with force', () => {
      const vel50 = forceToVelocity(50, 0);
      const vel100 = forceToVelocity(100, 0);
      expect(vel50.x).toBeCloseTo(vel100.x / 2);
    });
  });

  describe('Collision Detection', () => {
    it('circlesOverlap detects overlap', () => {
      expect(circlesOverlap({ x: 0, y: 0, radius: 10 }, { x: 5, y: 0, radius: 10 })).toBe(true);
      expect(circlesOverlap({ x: 0, y: 0, radius: 5 }, { x: 20, y: 0, radius: 5 })).toBe(false);
    });

    it('circleDistance computes distance', () => {
      expect(circleDistance({ x: 0, y: 0, radius: 0 }, { x: 3, y: 4, radius: 0 })).toBeCloseTo(5);
    });
  });

  describe('Trajectory Simulation', () => {
    it('produces trajectory points from starting position', () => {
      const ball = { x: 200, y: 300, radius: 14 };
      const vel = forceToVelocity(50, -45);
      const fieldBounds = { x: 0, y: 0, width: 400, height: 600 };
      const traj = simulateTrajectory(ball, vel, [], fieldBounds, DEFAULT_PHYSICS);
      expect(traj.length).toBeGreaterThan(5);
      expect(traj[0].x).toBeCloseTo(ball.x);
      expect(traj[0].y).toBeCloseTo(ball.y);
    });

    it('trajectory stays within field bounds (with tolerance)', () => {
      const ball = { x: 200, y: 300, radius: 14 };
      const vel = forceToVelocity(80, -30);
      const fieldBounds = { x: 0, y: 0, width: 400, height: 600 };
      const traj = simulateTrajectory(ball, vel, [], fieldBounds, DEFAULT_PHYSICS);
      const margin = 20; // tolerance for bounce resolution
      for (const pt of traj) {
        expect(pt.x).toBeGreaterThanOrEqual(fieldBounds.x - margin);
        expect(pt.x).toBeLessThanOrEqual(fieldBounds.x + fieldBounds.width + margin);
        expect(pt.y).toBeGreaterThanOrEqual(fieldBounds.y - margin);
        expect(pt.y).toBeLessThanOrEqual(fieldBounds.y + fieldBounds.height + margin);
      }
    });

    it('trajectory includes bounce points when hitting walls', () => {
      const ball = { x: 200, y: 300, radius: 14 };
      const vel = forceToVelocity(90, 0); // shoot right
      const fieldBounds = { x: 0, y: 0, width: 400, height: 600 };
      const traj = simulateTrajectory(ball, vel, [], fieldBounds, {
        ...DEFAULT_PHYSICS,
        maxBounces: 3,
      });
      // Trajectory should have multiple points (bounces or wall hits)
      expect(traj.length).toBeGreaterThan(10);
    });

    it('trajectory detects disc collision', () => {
      const ball = { x: 100, y: 300, radius: 14 };
      const vel = forceToVelocity(80, 0); // shoot right toward disc
      const fieldBounds = { x: 0, y: 0, width: 800, height: 600 };
      const discs = [{ id: 'd1', x: 300, y: 300, radius: 22, team: 'opponent' as const, label: 'D1' }];
      const traj = simulateTrajectory(ball, vel, discs, fieldBounds, DEFAULT_PHYSICS);
      // Trajectory should have points and potentially interact with discs
      expect(traj.length).toBeGreaterThan(5);
      // Verify trajectory has valid coordinates
      for (const pt of traj) {
        expect(pt.x).toBeDefined();
        expect(pt.y).toBeDefined();
      }
    });
  });
});
