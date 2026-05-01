import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Polyline, Circle, Rect, Text as SvgText } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { simulateTrajectory, forceToVelocity, DEFAULT_PHYSICS } from '../lib/physics';
import { useOverlay } from '../hooks/use-overlay';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function OverlayScreen() {
  const { isActive, error, startOverlay, stopOverlay } = useOverlay();
  const [force, setForce] = useState(50);
  const [angle, setAngle] = useState(-45);
  const [trajectory, setTrajectory] = useState<any[]>([]);
  const [gameElements, setGameElements] = useState<any>(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Simulate frame capture and analysis
      frameCountRef.current++;

      // Demo: simulate detected game elements
      const demoElements = {
        ball: { x: 200, y: 300, radius: 14 },
        discs: [
          { id: 'd1', x: 100, y: 200, radius: 22, team: 'player', label: 'P1' },
          { id: 'd2', x: 300, y: 400, radius: 22, team: 'opponent', label: 'D1' },
        ],
        goal: { x: 150, y: 50, width: 100, height: 20, side: 'top' },
        fieldBounds: { x: 0, y: 0, width: 400, height: 600 },
      };

      setGameElements(demoElements);

      // Calculate trajectory
      const vel = forceToVelocity(force, angle);
      const traj = simulateTrajectory(
        demoElements.ball,
        vel,
        demoElements.discs,
        demoElements.fieldBounds,
        DEFAULT_PHYSICS
      );
      setTrajectory(traj);
    }, 33); // ~30 FPS

    return () => clearInterval(interval);
  }, [isActive, force, angle]);

  const handleStartOverlay = async () => {
    await startOverlay();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleStopOverlay = async () => {
    await stopOverlay();
    setTrajectory([]);
  };

  const trajectoryPath = trajectory
    .map((p, i) => `${p.x},${p.y}`)
    .join(' ');

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.7} style={styles.canvas}>
        {gameElements && (
          <>
            <Rect
              x={gameElements.fieldBounds.x}
              y={gameElements.fieldBounds.y}
              width={gameElements.fieldBounds.width}
              height={gameElements.fieldBounds.height}
              stroke="#00FF88"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
            />

            {trajectory.length > 0 && (
              <Polyline
                points={trajectoryPath}
                stroke="#00FF88"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />
            )}

            <Circle
              cx={gameElements.ball.x}
              cy={gameElements.ball.y}
              r={gameElements.ball.radius}
              fill="#FF6B35"
              opacity="0.9"
            />

            {gameElements.discs.map((disc: any) => (
              <g key={disc.id}>
                <Circle
                  cx={disc.x}
                  cy={disc.y}
                  r={disc.radius}
                  fill={disc.team === 'player' ? '#0099FF' : '#FF3366'}
                  opacity="0.8"
                />
                <SvgText
                  x={disc.x}
                  y={disc.y}
                  fontSize="10"
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {disc.label}
                </SvgText>
              </g>
            ))}

            {gameElements.goal && (
              <Rect
                x={gameElements.goal.x}
                y={gameElements.goal.y}
                width={gameElements.goal.width}
                height={gameElements.goal.height}
                fill="#FFD700"
                opacity="0.7"
              />
            )}
          </>
        )}
      </Svg>

      <View style={styles.controlPanel}>
        <View style={styles.sliderGroup}>
          <Text style={styles.label}>Erő: {force}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={force}
            onValueChange={setForce}
            minimumTrackTintColor="#00FF88"
            maximumTrackTintColor="#444"
            thumbTintColor="#00FF88"
          />
        </View>

        <View style={styles.sliderGroup}>
          <Text style={styles.label}>Szög: {angle}°</Text>
          <Slider
            style={styles.slider}
            minimumValue={-90}
            maximumValue={90}
            value={angle}
            onValueChange={setAngle}
            minimumTrackTintColor="#58A6FF"
            maximumTrackTintColor="#444"
            thumbTintColor="#58A6FF"
          />
        </View>

        <View style={styles.buttonGroup}>
          {!isActive ? (
            <TouchableOpacity
              style={[styles.button, styles.startBtn]}
              onPress={handleStartOverlay}
            >
              <Text style={styles.buttonText}>Overlay indítása</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.stopBtn]}
              onPress={handleStopOverlay}
            >
              <Text style={styles.buttonText}>Overlay leállítása</Text>
            </TouchableOpacity>
          )}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.stats}>
          {isActive ? `⚽ Overlay aktív - FPS: ${frameCountRef.current}` : 'Offline'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  canvas: {
    backgroundColor: '#1a1f26',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  controlPanel: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  sliderGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#c9d1d9',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  slider: {
    height: 40,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtn: {
    backgroundColor: '#00FF88',
  },
  stopBtn: {
    backgroundColor: '#FF3366',
  },
  buttonText: {
    color: '#0D1117',
    fontSize: 14,
    fontWeight: '700',
  },
  stats: {
    color: '#58A6FF',
    fontSize: 12,
    marginTop: 12,
  },
  error: {
    color: '#FF3366',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
});
