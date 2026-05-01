/**
 * Overlay Screen — Main analysis screen.
 * Shows game field with AI detections and trajectory overlay.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import Slider from "@react-native-community/slider";

import { ScreenContainer } from "@/components/screen-container";
import { FieldCanvas } from "@/components/field-canvas";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  simulateTrajectory,
  forceToVelocity,
  TrajectoryPoint,
  DiscObject,
  GoalObject,
  DEFAULT_PHYSICS,
} from "@/lib/physics";
import {
  GameState,
  INITIAL_GAME_STATE,
  DEFAULT_FIELD_BOUNDS,
  createDemoState,
} from "@/lib/game-state";
import {
  loadSettings,
  DEFAULT_SETTINGS,
  AppSettings,
} from "@/lib/settings-store";
import { analyzeScreenshot, DetectionResult } from "@/lib/detection-service";

export default function OverlayScreen() {
  useKeepAwake();
  const colors = useColors();
  const { width, height } = useWindowDimensions();

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_GAME_STATE,
    fieldBounds: { x: 0, y: 0, width, height: height - 200 },
  });
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [angleInput, setAngleInput] = useState(0);

  // Load settings on mount
  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  // Recalculate trajectory whenever relevant state changes
  useEffect(() => {
    if (!gameState.ball) return;
    const vel = forceToVelocity(gameState.force, gameState.angle);
    const traj = simulateTrajectory(
      gameState.ball,
      vel,
      gameState.discs,
      gameState.fieldBounds,
      settings.physics
    );
    setGameState((prev) => ({ ...prev, trajectory: traj }));
  }, [
    gameState.ball,
    gameState.discs,
    gameState.force,
    gameState.angle,
    gameState.fieldBounds,
    settings.physics,
  ]);

  // ── Image Picker ────────────────────────────────────────────────────────────

  const pickImage = useCallback(async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library to pick a screenshot."
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setGameState((prev) => ({
        ...prev,
        lastImageUri: uri,
        trajectory: [],
        detectionError: null,
      }));
    }
  }, []);

  const takePhoto = useCallback(async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow camera access to capture the game screen."
        );
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setGameState((prev) => ({
        ...prev,
        lastImageUri: uri,
        trajectory: [],
        detectionError: null,
      }));
    }
  }, []);

  // ── AI Analysis ─────────────────────────────────────────────────────────────

  const analyzeImage = useCallback(async () => {
    if (!gameState.lastImageUri) {
      Alert.alert("No image", "Please take a screenshot or pick an image first.");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setGameState((prev) => ({
      ...prev,
      isAnalyzing: true,
      detectionError: null,
    }));

    try {
      const fieldBounds = {
        x: 0,
        y: 0,
        width,
        height: height - 200,
      };

      const result: DetectionResult = await analyzeScreenshot(
        gameState.lastImageUri,
        fieldBounds
      );

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setGameState((prev) => ({
        ...prev,
        isAnalyzing: false,
        ball: result.ball,
        discs: result.discs,
        goal: result.goal,
        fieldBounds: result.fieldBounds || fieldBounds,
        trajectory: [],
      }));
    } catch (err: any) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setGameState((prev) => ({
        ...prev,
        isAnalyzing: false,
        detectionError: err.message || "Detection failed",
      }));
    }
  }, [gameState.lastImageUri, width, height]);

  // ── Demo Mode ────────────────────────────────────────────────────────────────

  const loadDemo = useCallback(() => {
    const fieldBounds = { x: 20, y: 60, width: width - 40, height: height - 280 };
    const demo = createDemoState(fieldBounds);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setGameState((prev) => ({
      ...prev,
      ...demo,
      fieldBounds,
      lastImageUri: null,
      trajectory: [],
      isAnalyzing: false,
      detectionError: null,
    }));
  }, [width, height]);

  // ── Clear ────────────────────────────────────────────────────────────────────

  const clearAll = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      ball: null,
      discs: [],
      goal: null,
      trajectory: [],
      lastImageUri: null,
      detectionError: null,
    }));
  }, []);

  // ── Force / Angle ────────────────────────────────────────────────────────────

  const setForce = useCallback((val: number) => {
    setGameState((prev) => ({ ...prev, force: val }));
  }, []);

  const setAngle = useCallback((val: number) => {
    setGameState((prev) => ({ ...prev, angle: val }));
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  const canvasHeight = height - (controlsExpanded ? 220 : 80);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Background Image ─────────────────────────────────────────────── */}
      {gameState.lastImageUri ? (
        <Image
          source={{ uri: gameState.lastImageUri }}
          style={[styles.bgImage, { width, height: canvasHeight }]}
          resizeMode="contain"
        />
      ) : (
        <View
          style={[
            styles.emptyField,
            {
              width,
              height: canvasHeight,
              backgroundColor: "#0a1a0a",
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.emptyFieldText, { color: colors.muted }]}>
            📸 Készíts képernyőképet a játékról
          </Text>
          <Text style={[styles.emptyFieldSubText, { color: colors.muted }]}>
            Vagy töltsd be a demo módot
          </Text>
        </View>
      )}

      {/* ── SVG Overlay Canvas ───────────────────────────────────────────── */}
      <FieldCanvas
        width={width}
        height={canvasHeight}
        fieldBounds={gameState.fieldBounds}
        ball={gameState.ball}
        discs={gameState.discs}
        goal={gameState.goal}
        trajectory={gameState.trajectory}
        angle={gameState.angle}
        force={gameState.force}
        display={settings.display}
      />

      {/* ── Analyzing Indicator ──────────────────────────────────────────── */}
      {gameState.isAnalyzing && (
        <View style={styles.analyzingOverlay}>
          <View style={[styles.analyzingBox, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.analyzingText, { color: colors.foreground }]}>
              AI elemzés folyamatban...
            </Text>
          </View>
        </View>
      )}

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {gameState.detectionError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.error + "CC" }]}>
          <Text style={styles.errorText}>⚠ {gameState.detectionError}</Text>
        </View>
      )}

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface + "DD" }]}>
        <StatChip
          label="Labda"
          value={gameState.ball ? "✓" : "–"}
          color={gameState.ball ? colors.success : colors.muted}
        />
        <StatChip
          label="Korongok"
          value={`${gameState.discs.length}`}
          color={gameState.discs.length > 0 ? "#58A6FF" : colors.muted}
        />
        <StatChip
          label="Kapu"
          value={gameState.goal ? "✓" : "–"}
          color={gameState.goal ? "#FFD700" : colors.muted}
        />
        <StatChip
          label="Pattanás"
          value={`${gameState.trajectory.filter((p) => p.isBounce).length}`}
          color={colors.primary}
        />
      </View>

      {/* ── Control Panel ────────────────────────────────────────────────── */}
      <View
        style={[
          styles.controlPanel,
          {
            backgroundColor: colors.surface + "F0",
            borderTopColor: colors.border,
            height: controlsExpanded ? 220 : 60,
          },
        ]}
      >
        {/* Toggle handle */}
        <TouchableOpacity
          style={styles.panelHandle}
          onPress={() => setControlsExpanded((v) => !v)}
        >
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>
            {controlsExpanded ? "▼ Vezérlőpult" : "▲ Vezérlőpult"}
          </Text>
        </TouchableOpacity>

        {controlsExpanded && (
          <>
            {/* Sliders */}
            <View style={styles.slidersRow}>
              <View style={styles.sliderGroup}>
                <View style={styles.sliderLabelRow}>
                  <Text style={[styles.sliderLabel, { color: colors.muted }]}>
                    Erő
                  </Text>
                  <Text style={[styles.sliderValue, { color: colors.primary }]}>
                    {Math.round(gameState.force)}%
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={100}
                  value={gameState.force}
                  onValueChange={setForce}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                  step={1}
                />
              </View>

              <View style={styles.sliderGroup}>
                <View style={styles.sliderLabelRow}>
                  <Text style={[styles.sliderLabel, { color: colors.muted }]}>
                    Szög
                  </Text>
                  <Text style={[styles.sliderValue, { color: colors.primary }]}>
                    {Math.round(gameState.angle)}°
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={-180}
                  maximumValue={180}
                  value={gameState.angle}
                  onValueChange={setAngle}
                  minimumTrackTintColor="#58A6FF"
                  maximumTrackTintColor={colors.border}
                  thumbTintColor="#58A6FF"
                  step={1}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <ActionButton
                icon="photo.fill"
                label="Galéria"
                onPress={pickImage}
                color="#58A6FF"
                bgColor="#58A6FF22"
              />
              <ActionButton
                icon="camera.fill"
                label="Kamera"
                onPress={takePhoto}
                color="#58A6FF"
                bgColor="#58A6FF22"
              />
              <ActionButton
                icon="wand.and.stars"
                label="Elemzés"
                onPress={analyzeImage}
                color={colors.primary}
                bgColor={colors.primary + "22"}
                disabled={!gameState.lastImageUri || gameState.isAnalyzing}
              />
              <ActionButton
                icon="sportscourt.fill"
                label="Demo"
                onPress={loadDemo}
                color="#FFD700"
                bgColor="#FFD70022"
              />
              <ActionButton
                icon="trash.fill"
                label="Törlés"
                onPress={clearAll}
                color={colors.error}
                bgColor={colors.error + "22"}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: "#7D8590" }]}>{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  color,
  bgColor,
  disabled = false,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  color: string;
  bgColor: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        { backgroundColor: bgColor, borderColor: color + "44" },
        disabled && styles.actionBtnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <IconSymbol name={icon} size={20} color={disabled ? "#555" : color} />
      <Text
        style={[
          styles.actionBtnLabel,
          { color: disabled ? "#555" : color },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  emptyField: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyFieldText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptyFieldSubText: {
    fontSize: 13,
  },
  analyzingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000088",
  },
  analyzingBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  analyzingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorBanner: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  statsBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  statChip: {
    alignItems: "center",
    minWidth: 60,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  controlPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingBottom: 8,
    overflow: "hidden",
  },
  panelHandle: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  slidersRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  sliderGroup: {
    flex: 1,
  },
  sliderLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  sliderValue: {
    fontSize: 11,
    fontWeight: "700",
  },
  slider: {
    height: 32,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 54,
    gap: 3,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
});
