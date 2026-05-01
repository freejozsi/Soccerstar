/**
 * SoccerStars AI Overlay — Physics Engine
 *
 * Simulates ball trajectory with:
 * - Wall/boundary bounces (reflection)
 * - Disc collision detection and elastic response
 * - Friction and energy loss
 * - Force-to-velocity conversion
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Vector2D {
  x: number;
  y: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiscObject extends Circle {
  id: string;
  team: "player" | "opponent";
  label?: string;
}

export interface BallObject extends Circle {
  velocity: Vector2D;
}

export interface GoalObject {
  x: number;
  y: number;
  width: number;
  height: number;
  side: "left" | "right" | "top" | "bottom";
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  isBounce: boolean;
  isDiscHit: boolean;
  discId?: string;
  speed: number; // 0–1 normalized
}

export interface PhysicsParams {
  friction: number;       // 0–1, energy retained per step (0.99 = low friction)
  elasticity: number;     // 0–1, bounciness on wall/disc collision
  maxBounces: number;     // max wall bounces to simulate
  maxSteps: number;       // max simulation steps
  stepSize: number;       // pixels per simulation step
  ballMass: number;       // relative mass (affects disc collision response)
  discMass: number;       // disc mass (heavier = less deflection)
}

export const DEFAULT_PHYSICS: PhysicsParams = {
  friction: 0.992,
  elasticity: 0.85,
  maxBounces: 8,
  maxSteps: 2000,
  stepSize: 2,
  ballMass: 1,
  discMass: 3,
};

// ─── Vector Math ──────────────────────────────────────────────────────────────

export function vecAdd(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vecScale(v: Vector2D, s: number): Vector2D {
  return { x: v.x * s, y: v.y * s };
}

export function vecDot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

export function vecLength(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function vecNormalize(v: Vector2D): Vector2D {
  const len = vecLength(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function vecSub(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

/** Reflect velocity vector off a surface with given normal */
export function reflectVector(velocity: Vector2D, normal: Vector2D): Vector2D {
  const dot = vecDot(velocity, normal);
  return {
    x: velocity.x - 2 * dot * normal.x,
    y: velocity.y - 2 * dot * normal.y,
  };
}

// ─── Force Conversion ─────────────────────────────────────────────────────────

/**
 * Convert force percentage (0–100) and angle (degrees) to initial velocity vector.
 * Max speed is ~30 px/step at force=100.
 */
export function forceToVelocity(
  force: number,
  angleDeg: number
): Vector2D {
  const maxSpeed = 30;
  const speed = (force / 100) * maxSpeed;
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * speed,
    y: Math.sin(rad) * speed,
  };
}

// ─── Collision Detection ──────────────────────────────────────────────────────

/** Check if two circles overlap */
export function circlesOverlap(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < a.radius + b.radius;
}

/** Distance between two circle centers */
export function circleDistance(a: Circle, b: Circle): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Elastic collision response between ball and a stationary disc.
 * Returns the new ball velocity after collision.
 */
export function discCollisionResponse(
  ballPos: Vector2D,
  ballVel: Vector2D,
  discPos: Vector2D,
  params: PhysicsParams
): Vector2D {
  // Normal vector from disc center to ball center
  const normal = vecNormalize(vecSub(ballPos, discPos));

  // Relative velocity along normal
  const relVelAlongNormal = vecDot(ballVel, normal);

  // Only resolve if moving toward disc
  if (relVelAlongNormal > 0) return ballVel;

  // Impulse scalar (simplified elastic collision, disc is stationary)
  const massRatio = params.ballMass / (params.ballMass + params.discMass);
  const impulse = -(1 + params.elasticity) * relVelAlongNormal * (1 - massRatio);

  return {
    x: ballVel.x + impulse * normal.x,
    y: ballVel.y + impulse * normal.y,
  };
}

// ─── Main Simulation ──────────────────────────────────────────────────────────

/**
 * Simulate ball trajectory from a starting position with given velocity.
 * Returns array of trajectory points including bounce markers.
 */
export function simulateTrajectory(
  ball: Circle,
  initialVelocity: Vector2D,
  discs: DiscObject[],
  fieldBounds: Rect,
  params: PhysicsParams = DEFAULT_PHYSICS
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];

  let pos: Vector2D = { x: ball.x, y: ball.y };
  let vel: Vector2D = { ...initialVelocity };
  let bounceCount = 0;
  const hitDiscs = new Set<string>();

  const minSpeed = 0.3;

  // Add starting point
  points.push({
    x: pos.x,
    y: pos.y,
    isBounce: false,
    isDiscHit: false,
    speed: vecLength(vel) / 30,
  });

  for (let step = 0; step < params.maxSteps; step++) {
    // Apply friction
    vel = vecScale(vel, params.friction);

    const speed = vecLength(vel);
    if (speed < minSpeed) break;
    if (bounceCount >= params.maxBounces) break;

    // Move ball
    const nextPos: Vector2D = vecAdd(pos, vel);

    // ── Wall collision detection ──────────────────────────────────────────
    let wallBounce = false;
    let newVel = { ...vel };
    let newPos = { ...nextPos };

    const left = fieldBounds.x + ball.radius;
    const right = fieldBounds.x + fieldBounds.width - ball.radius;
    const top = fieldBounds.y + ball.radius;
    const bottom = fieldBounds.y + fieldBounds.height - ball.radius;

    if (nextPos.x < left) {
      newPos.x = left + (left - nextPos.x);
      newVel.x = Math.abs(newVel.x) * params.elasticity;
      wallBounce = true;
    } else if (nextPos.x > right) {
      newPos.x = right - (nextPos.x - right);
      newVel.x = -Math.abs(newVel.x) * params.elasticity;
      wallBounce = true;
    }

    if (nextPos.y < top) {
      newPos.y = top + (top - nextPos.y);
      newVel.y = Math.abs(newVel.y) * params.elasticity;
      wallBounce = true;
    } else if (nextPos.y > bottom) {
      newPos.y = bottom - (nextPos.y - bottom);
      newVel.y = -Math.abs(newVel.y) * params.elasticity;
      wallBounce = true;
    }

    if (wallBounce) {
      bounceCount++;
      pos = newPos;
      vel = newVel;
      points.push({
        x: pos.x,
        y: pos.y,
        isBounce: true,
        isDiscHit: false,
        speed: vecLength(vel) / 30,
      });
      continue;
    }

    // ── Disc collision detection ──────────────────────────────────────────
    let discHit = false;
    for (const disc of discs) {
      if (hitDiscs.has(disc.id)) continue;

      const ballCircle: Circle = { x: nextPos.x, y: nextPos.y, radius: ball.radius };
      if (circlesOverlap(ballCircle, disc)) {
        newVel = discCollisionResponse(nextPos, vel, disc, params);
        // Push ball out of disc
        const normal = vecNormalize(vecSub(nextPos, disc));
        const overlap = ball.radius + disc.radius - circleDistance(
          { x: nextPos.x, y: nextPos.y, radius: 0 },
          { x: disc.x, y: disc.y, radius: 0 }
        );
        newPos = {
          x: nextPos.x + normal.x * (overlap + 1),
          y: nextPos.y + normal.y * (overlap + 1),
        };
        hitDiscs.add(disc.id);
        discHit = true;

        pos = newPos;
        vel = newVel;
        points.push({
          x: pos.x,
          y: pos.y,
          isBounce: false,
          isDiscHit: true,
          discId: disc.id,
          speed: vecLength(vel) / 30,
        });
        break;
      }
    }

    if (!discHit) {
      pos = nextPos;
      vel = newVel;

      // Only record every few steps to keep path smooth but not too dense
      if (step % 3 === 0) {
        points.push({
          x: pos.x,
          y: pos.y,
          isBounce: false,
          isDiscHit: false,
          speed: vecLength(vel) / 30,
        });
      }
    }
  }

  // Add final point
  points.push({
    x: pos.x,
    y: pos.y,
    isBounce: false,
    isDiscHit: false,
    speed: 0,
  });

  return points;
}

// ─── Angle Calculation ────────────────────────────────────────────────────────

/** Calculate angle in degrees from ball to a target point */
export function angleToTarget(from: Vector2D, to: Vector2D): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/** Normalize angle to 0–360 range */
export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}
