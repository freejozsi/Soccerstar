/**
 * FieldCanvas — SVG overlay component that renders:
 * - Field boundary
 * - Detected discs (player/opponent)
 * - Ball with velocity arrow
 * - Goal
 * - Predicted trajectory with bounce markers
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Rect,
  Line,
  Path,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
  G,
  Polygon,
} from "react-native-svg";

import { DiscObject, GoalObject, TrajectoryPoint, Vector2D, Rect as FieldRect } from "@/lib/physics";
import { DisplaySettings } from "@/lib/settings-store";

interface FieldCanvasProps {
  width: number;
  height: number;
  fieldBounds: FieldRect;
  ball: { x: number; y: number; radius: number } | null;
  discs: DiscObject[];
  goal: GoalObject | null;
  trajectory: TrajectoryPoint[];
  angle: number;
  force: number;
  display: DisplaySettings;
}

export function FieldCanvas({
  width,
  height,
  fieldBounds,
  ball,
  discs,
  goal,
  trajectory,
  angle,
  force,
  display,
}: FieldCanvasProps) {
  // Build trajectory SVG path string
  const trajectoryPath = useMemo(() => {
    if (trajectory.length < 2) return "";
    const parts = trajectory.map((pt, i) =>
      i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`
    );
    return parts.join(" ");
  }, [trajectory]);

  // Bounce points
  const bouncePoints = useMemo(
    () => trajectory.filter((pt) => pt.isBounce || pt.isDiscHit),
    [trajectory]
  );

  const lineColor = display.trajectoryColor;
  const lineWidth = display.trajectoryThickness;

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#F78166" stopOpacity="0.9" />
            <Stop offset="60%" stopColor="#FF4500" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="discGlowPlayer" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#58A6FF" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#58A6FF" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="discGlowOpponent" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FF6B6B" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* ── Field Boundary ──────────────────────────────────────────── */}
        <Rect
          x={fieldBounds.x}
          y={fieldBounds.y}
          width={fieldBounds.width}
          height={fieldBounds.height}
          fill="none"
          stroke="#3FB950"
          strokeWidth={2}
          strokeDasharray="8,4"
          opacity={0.6}
        />

        {/* Center line */}
        <Line
          x1={fieldBounds.x}
          y1={fieldBounds.y + fieldBounds.height / 2}
          x2={fieldBounds.x + fieldBounds.width}
          y2={fieldBounds.y + fieldBounds.height / 2}
          stroke="#3FB950"
          strokeWidth={1}
          strokeDasharray="4,6"
          opacity={0.3}
        />

        {/* Center circle */}
        <Circle
          cx={fieldBounds.x + fieldBounds.width / 2}
          cy={fieldBounds.y + fieldBounds.height / 2}
          r={40}
          fill="none"
          stroke="#3FB950"
          strokeWidth={1}
          strokeDasharray="4,6"
          opacity={0.25}
        />

        {/* ── Goal ────────────────────────────────────────────────────── */}
        {goal && (
          <G>
            <Rect
              x={goal.x}
              y={goal.y}
              width={goal.width}
              height={goal.height}
              fill="#FFD70022"
              stroke="#FFD700"
              strokeWidth={2.5}
              rx={3}
            />
            <SvgText
              x={goal.x + goal.width / 2}
              y={goal.y + goal.height / 2 + 4}
              textAnchor="middle"
              fill="#FFD700"
              fontSize={9}
              fontWeight="bold"
            >
              GOAL
            </SvgText>
          </G>
        )}

        {/* ── Trajectory Path ──────────────────────────────────────────── */}
        {trajectoryPath !== "" && (
          <>
            {/* Glow layer */}
            <Path
              d={trajectoryPath}
              fill="none"
              stroke={lineColor}
              strokeWidth={lineWidth + 6}
              strokeOpacity={0.15}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main line */}
            <Path
              d={trajectoryPath}
              fill="none"
              stroke={lineColor}
              strokeWidth={lineWidth}
              strokeOpacity={0.9}
              strokeDasharray="8,5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* ── Bounce Points ────────────────────────────────────────────── */}
        {display.showBouncePoints &&
          bouncePoints.map((pt, i) => (
            <G key={`bounce-${i}`}>
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={pt.isDiscHit ? 7 : 5}
                fill={pt.isDiscHit ? "#FF6B6B33" : `${lineColor}22`}
                stroke={pt.isDiscHit ? "#FF6B6B" : lineColor}
                strokeWidth={1.5}
              />
              {/* X mark */}
              <Line
                x1={pt.x - 3}
                y1={pt.y - 3}
                x2={pt.x + 3}
                y2={pt.y + 3}
                stroke={pt.isDiscHit ? "#FF6B6B" : lineColor}
                strokeWidth={1.5}
              />
              <Line
                x1={pt.x + 3}
                y1={pt.y - 3}
                x2={pt.x - 3}
                y2={pt.y + 3}
                stroke={pt.isDiscHit ? "#FF6B6B" : lineColor}
                strokeWidth={1.5}
              />
            </G>
          ))}

        {/* ── Discs ────────────────────────────────────────────────────── */}
        {discs.map((disc) => {
          const isPlayer = disc.team === "player";
          const color = isPlayer ? "#58A6FF" : "#FF6B6B";
          const gradId = isPlayer ? "discGlowPlayer" : "discGlowOpponent";
          return (
            <G key={disc.id}>
              {/* Glow */}
              <Circle
                cx={disc.x}
                cy={disc.y}
                r={disc.radius * 1.8}
                fill={`url(#${gradId})`}
                opacity={0.5}
              />
              {/* Body */}
              <Circle
                cx={disc.x}
                cy={disc.y}
                r={disc.radius}
                fill={`${color}22`}
                stroke={color}
                strokeWidth={2}
              />
              {/* Inner ring */}
              <Circle
                cx={disc.x}
                cy={disc.y}
                r={disc.radius * 0.55}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={0.6}
              />
              {/* Label */}
              {display.showDiscLabels && disc.label && (
                <SvgText
                  x={disc.x}
                  y={disc.y + 4}
                  textAnchor="middle"
                  fill={color}
                  fontSize={10}
                  fontWeight="bold"
                >
                  {disc.label}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* ── Ball ─────────────────────────────────────────────────────── */}
        {ball && (
          <G>
            {/* Glow */}
            <Circle
              cx={ball.x}
              cy={ball.y}
              r={ball.radius * 2.5}
              fill="url(#ballGlow)"
              opacity={0.7}
            />
            {/* Body */}
            <Circle
              cx={ball.x}
              cy={ball.y}
              r={ball.radius}
              fill="#FF450044"
              stroke="#F78166"
              strokeWidth={2.5}
            />
            {/* Center dot */}
            <Circle
              cx={ball.x}
              cy={ball.y}
              r={3}
              fill="#F78166"
            />

            {/* Velocity arrow */}
            {display.showVelocityArrow && force > 0 && (
              <VelocityArrow
                cx={ball.x}
                cy={ball.y}
                angle={angle}
                force={force}
                color="#F78166"
              />
            )}
          </G>
        )}
      </Svg>
    </View>
  );
}

// ─── Velocity Arrow ───────────────────────────────────────────────────────────

function VelocityArrow({
  cx,
  cy,
  angle,
  force,
  color,
}: {
  cx: number;
  cy: number;
  angle: number;
  force: number;
  color: string;
}) {
  const rad = (angle * Math.PI) / 180;
  const len = 20 + (force / 100) * 40;
  const ex = cx + Math.cos(rad) * len;
  const ey = cy + Math.sin(rad) * len;

  // Arrow head
  const headLen = 8;
  const headAngle = 0.4;
  const ax1 = ex - headLen * Math.cos(rad - headAngle);
  const ay1 = ey - headLen * Math.sin(rad - headAngle);
  const ax2 = ex - headLen * Math.cos(rad + headAngle);
  const ay2 = ey - headLen * Math.sin(rad + headAngle);

  return (
    <G>
      <Line
        x1={cx}
        y1={cy}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.8}
      />
      <Polygon
        points={`${ex},${ey} ${ax1},${ay1} ${ax2},${ay2}`}
        fill={color}
        opacity={0.8}
      />
    </G>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
