import { describe, it, expect } from "vitest";
import {
  vecAdd, vecScale, vecDot, vecLength, vecNormalize, vecSub,
  reflectVector, forceToVelocity, circlesOverlap, circleDistance,
  discCollisionResponse, simulateTrajectory, DEFAULT_PHYSICS
} from "../lib/physics";

describe("Vector Math", () => {
  it("vecAdd adds two vectors", () => {
    expect(vecAdd({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
  });

  it("vecScale scales a vector", () => {
    expect(vecScale({ x: 2, y: 4 }, 0.5)).toEqual({ x: 1, y: 2 });
  });

  it("vecDot computes dot product", () => {
    expect(vecDot({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(0);
    expect(vecDot({ x: 1, y: 0 }, { x: 1, y: 0 })).toBe(1);
  });

  it("vecLength computes magnitude", () => {
    expect(vecLength({ x: 3, y: 4 })).toBeCloseTo(5);
  });

  it("vecNormalize returns unit vector", () => {
    const n = vecNormalize({ x: 3, y: 4 });
    expect(vecLength(n)).toBeCloseTo(1);
  });

  it("reflectVector reflects off horizontal surface", () => {
    const vel = { x: 1, y: 1 };
    const normal = { x: 0, y: -1 }; // pointing up
    const reflected = reflectVector(vel, normal);
    expect(reflected.x).toBeCloseTo(1);
    expect(reflected.y).toBeCloseTo(-1);
  });
});

describe("Force Conversion", () => {
  it("forceToVelocity at 0 degrees", () => {
    const vel = forceToVelocity(100, 0);
    expect(vel.x).toBeCloseTo(30);
    expect(vel.y).toBeCloseTo(0);
  });

  it("forceToVelocity at 90 degrees", () => {
    const vel = forceToVelocity(100, 90);
    expect(vel.x).toBeCloseTo(0);
    expect(vel.y).toBeCloseTo(30);
  });

  it("forceToVelocity scales with force", () => {
    const vel50 = forceToVelocity(50, 0);
    const vel100 = forceToVelocity(100, 0);
    expect(vel50.x).toBeCloseTo(vel100.x / 2);
  });
});

describe("Collision Detection", () => {
  it("circlesOverlap detects overlap", () => {
    expect(circlesOverlap({ x: 0, y: 0, radius: 10 }, { x: 5, y: 0, radius: 10 })).toBe(true);
    expect(circlesOverlap({ x: 0, y: 0, radius: 5 }, { x: 20, y: 0, radius: 5 })).toBe(false);
  });

  it("circleDistance computes distance", () => {
    expect(circleDistance({ x: 0, y: 0, radius: 0 }, { x: 3, y: 4, radius: 0 })).toBeCloseTo(5);
  });
});

describe("Trajectory Simulation", () => {
  it("produces trajectory points from starting position", () => {
    const ball = { x: 200, y: 300, radius: 14 };
    const vel = forceToVelocity(50, -45);
    const fieldBounds = { x: 0, y: 0, width: 400, height: 600 };
    const traj = simulateTrajectory(ball, vel, [], fieldBounds, DEFAULT_PHYSICS);
    expect(traj.length).toBeGreaterThan(5);
    expect(traj[0].x).toBeCloseTo(ball.x);
    expect(traj[0].y).toBeCloseTo(ball.y);
  });

  it("trajectory stays within field bounds (with tolerance)", () => {
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

  it("trajectory includes bounce points when hitting walls", () => {
    const ball = { x: 200, y: 300, radius: 14 };
    const vel = forceToVelocity(90, 0); // shoot right
    const fieldBounds = { x: 0, y: 0, width: 400, height: 600 };
    const traj = simulateTrajectory(ball, vel, [], fieldBounds, {
      ...DEFAULT_PHYSICS,
      maxBounces: 3,
    });
    const bounces = traj.filter((p) => p.isBounce);
    expect(bounces.length).toBeGreaterThan(0);
  });

  it("trajectory detects disc collision", () => {
    const ball = { x: 100, y: 300, radius: 14 };
    const vel = forceToVelocity(80, 0); // shoot right toward disc
    const fieldBounds = { x: 0, y: 0, width: 800, height: 600 };
    const discs = [{ id: "d1", x: 300, y: 300, radius: 22, team: "opponent" as const, label: "D1" }];
    const traj = simulateTrajectory(ball, vel, discs, fieldBounds, DEFAULT_PHYSICS);
    const discHits = traj.filter((p) => p.isDiscHit);
    expect(discHits.length).toBeGreaterThan(0);
  });
});
