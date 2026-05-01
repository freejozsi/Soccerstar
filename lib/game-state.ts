/**
 * Game state store for SoccerStars AI Overlay.
 * Holds the current detected/placed game elements.
 */

import { DiscObject, GoalObject, Rect, TrajectoryPoint, Vector2D } from "./physics";

export interface GameState {
  // Field
  fieldBounds: Rect;
  // Detected elements
  ball: { x: number; y: number; radius: number } | null;
  discs: DiscObject[];
  goal: GoalObject | null;
  // Shot parameters
  force: number;        // 0–100
  angle: number;        // degrees
  // Computed trajectory
  trajectory: TrajectoryPoint[];
  // UI state
  isAnalyzing: boolean;
  detectionError: string | null;
  lastImageUri: string | null;
  // Mode
  mode: "ai" | "manual";
}

export const DEFAULT_FIELD_BOUNDS: Rect = {
  x: 20,
  y: 80,
  width: 340,
  height: 500,
};

export const INITIAL_GAME_STATE: GameState = {
  fieldBounds: DEFAULT_FIELD_BOUNDS,
  ball: null,
  discs: [],
  goal: null,
  force: 50,
  angle: 0,
  trajectory: [],
  isAnalyzing: false,
  detectionError: null,
  lastImageUri: null,
  mode: "ai",
};

// ─── Demo / Sample State ──────────────────────────────────────────────────────

/** Creates a sample game state for demonstration/testing */
export function createDemoState(fieldBounds: Rect): Partial<GameState> {
  const { x, y, width, height } = fieldBounds;
  const cx = x + width / 2;
  const cy = y + height / 2;

  return {
    ball: { x: cx, y: cy + height * 0.2, radius: 14 },
    discs: [
      {
        id: "disc-1",
        x: cx - 60,
        y: cy - 30,
        radius: 22,
        team: "opponent",
        label: "D1",
      },
      {
        id: "disc-2",
        x: cx + 50,
        y: cy - 80,
        radius: 22,
        team: "opponent",
        label: "D2",
      },
      {
        id: "disc-3",
        x: cx - 20,
        y: cy + 60,
        radius: 22,
        team: "player",
        label: "P1",
      },
    ],
    goal: {
      x: cx - 40,
      y: y + 10,
      width: 80,
      height: 20,
      side: "top",
    },
    force: 65,
    angle: -75,
  };
}
