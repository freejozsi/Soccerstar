/**
 * Settings store for SoccerStars AI Overlay.
 * Persists physics and display preferences to AsyncStorage.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_PHYSICS, PhysicsParams } from "./physics";

const SETTINGS_KEY = "@soccerstars_settings";

export interface DisplaySettings {
  trajectoryColor: string;
  showDiscLabels: boolean;
  showBouncePoints: boolean;
  trajectoryThickness: number; // 1–5
  showVelocityArrow: boolean;
}

export interface DetectionSettings {
  sensitivity: number;      // 0–1
  autoDetect: boolean;
  detectionMode: "ai" | "manual";
}

export interface AppSettings {
  physics: PhysicsParams;
  display: DisplaySettings;
  detection: DetectionSettings;
}

export const DEFAULT_DISPLAY: DisplaySettings = {
  trajectoryColor: "#00E676",
  showDiscLabels: true,
  showBouncePoints: true,
  trajectoryThickness: 2,
  showVelocityArrow: true,
};

export const DEFAULT_DETECTION: DetectionSettings = {
  sensitivity: 0.7,
  autoDetect: false,
  detectionMode: "ai",
};

export const DEFAULT_SETTINGS: AppSettings = {
  physics: DEFAULT_PHYSICS,
  display: DEFAULT_DISPLAY,
  detection: DEFAULT_DETECTION,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle missing keys from older versions
    return {
      physics: { ...DEFAULT_PHYSICS, ...parsed.physics },
      display: { ...DEFAULT_DISPLAY, ...parsed.display },
      detection: { ...DEFAULT_DETECTION, ...parsed.detection },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Silently fail — non-critical
  }
}

export async function resetSettings(): Promise<AppSettings> {
  await AsyncStorage.removeItem(SETTINGS_KEY);
  return DEFAULT_SETTINGS;
}
