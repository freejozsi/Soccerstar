/**
 * Physics Engine — 2D trajectory simulation with bounce and collision
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle extends Vector2 {
  radius: number;
}

export interface DiscObject extends Circle {
  id: string;
  team: "player" | "opponent";
  label: string;
}

export interface GoalObject extends Rect {
  side: "top" | "bottom" | "left" | "right";
}

export interface TrajectoryPoint extends Vector2 {
  isBounce?: boolean;
  isDiscHit?: boolean;
  bounceCount?: number;
}

export interface PhysicsConfig {
  friction: number;
  elasticity: number;
  maxBounces: number;
  discMass: number;
  timeStep: number;
}

export const DEFAULT_PHYSICS: PhysicsConfig = {
  friction: 0.98,
  elasticity: 0.75,
  maxBounces: 5,
  discMass: 2,
  timeStep: 16,
};

export function vecAdd(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vecSub(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vecScale(v: Vector2, s: number): Vector2 {
  return { x: v.x * s, y: v.y * s };
}

export function vecDot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

export function vecLength(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function vecNormalize(v: Vector2): Vector2 {
  const len = vecLength(v);
  return len > 0 ? { x: v.x / len, y: v.y / len } : { x: 0, y: 0 };
}

export function vecDistance(a: Vector2, b: Vector2): number {
  return vecLength(vecSub(b, a));
}

export function reflectVector(velocity: Vector2, normal: Vector2): Vector2 {
  const dot = vecDot(velocity, normal);
  return vecSub(velocity, vecScale(normal, 2 * dot));
}

export function forceToVelocity(force: number, angleDegrees: number): Vector2 {
  const angleRad = (angleDegrees * Math.PI) / 180;
  const speed = force * 0.3;
  return {
    x: speed * Math.cos(angleRad),
    y: speed * Math.sin(angleRad),
  };
}

export function circlesOverlap(a: Circle, b: Circle): boolean {
  const dist = vecDistance(a, b);
  return dist < a.radius + b.radius;
}

export function circleDistance(a: Circle, b: Circle): number {
  return vecDistance(a, b);
}

export function discCollisionResponse(
  ballVel: Vector2,
  ballPos: Vector2,
  disc: DiscObject,
  config: PhysicsConfig
): Vector2 {
  const normal = vecNormalize(vecSub(ballPos, disc));
  let reflected = reflectVector(ballVel, normal);
  const massFactor = 1 / (1 + config.discMass);
  reflected = vecScale(reflected, config.elasticity * massFactor);
  return reflected;
}

export function simulateTrajectory(
  ball: Circle,
  initialVelocity: Vector2,
  discs: DiscObject[],
  fieldBounds: Rect,
  config: PhysicsConfig
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  let pos = { ...ball };
  let vel = { ...initialVelocity };
  let bounceCount = 0;

  const maxIterations = 500;
  const velocityThreshold = 0.5;

  for (let i = 0; i < maxIterations && bounceCount < config.maxBounces; i++) {
    points.push({ x: pos.x, y: pos.y });

    vel = vecScale(vel, config.friction);

    if (vecLength(vel) < velocityThreshold) {
      break;
    }

    pos = vecAdd(pos, vecScale(vel, config.timeStep / 1000));

    let hitWall = false;

    if (pos.x - ball.radius < fieldBounds.x) {
      pos.x = fieldBounds.x + ball.radius;
      vel.x = Math.abs(vel.x) * config.elasticity;
      hitWall = true;
    } else if (pos.x + ball.radius > fieldBounds.x + fieldBounds.width) {
      pos.x = fieldBounds.x + fieldBounds.width - ball.radius;
      vel.x = -Math.abs(vel.x) * config.elasticity;
      hitWall = true;
    }

    if (pos.y - ball.radius < fieldBounds.y) {
      pos.y = fieldBounds.y + ball.radius;
      vel.y = Math.abs(vel.y) * config.elasticity;
      hitWall = true;
    } else if (pos.y + ball.radius > fieldBounds.y + fieldBounds.height) {
      pos.y = fieldBounds.y + fieldBounds.height - ball.radius;
      vel.y = -Math.abs(vel.y) * config.elasticity;
      hitWall = true;
    }

    if (hitWall) {
      bounceCount++;
      points[points.length - 1].isBounce = true;
      points[points.length - 1].bounceCount = bounceCount;
    }

    for (const disc of discs) {
      if (circlesOverlap(pos, disc)) {
        vel = discCollisionResponse(vel, pos, disc, config);
        bounceCount++;
        points[points.length - 1].isDiscHit = true;
        points[points.length - 1].bounceCount = bounceCount;
        const normal = vecNormalize(vecSub(pos, disc));
        pos = vecAdd(pos, vecScale(normal, pos.radius + disc.radius + 1));
        break;
      }
    }
  }

  return points;
}

export function velocityToAngle(vel: Vector2): number {
  return (Math.atan2(vel.y, vel.x) * 180) / Math.PI;
}

export function velocityToForce(vel: Vector2): number {
  return vecLength(vel) / 0.3;
}
