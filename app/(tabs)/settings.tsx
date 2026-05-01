/**
 * Settings Screen — Configure physics parameters and display preferences.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import {
  loadSettings,
  saveSettings,
  resetSettings,
  AppSettings,
  DEFAULT_SETTINGS,
} from "@/lib/settings-store";

export default function SettingsScreen() {
  const colors = useColors();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const updatePhysics = useCallback(
    (key: keyof AppSettings["physics"], value: number) => {
      setSettings((prev) => ({
        ...prev,
        physics: { ...prev.physics, [key]: value },
      }));
    },
    []
  );

  const updateDisplay = useCallback(
    (key: keyof AppSettings["display"], value: any) => {
      setSettings((prev) => ({
        ...prev,
        display: { ...prev.display, [key]: value },
      }));
    },
    []
  );

  const updateDetection = useCallback(
    (key: keyof AppSettings["detection"], value: any) => {
      setSettings((prev) => ({
        ...prev,
        detection: { ...prev.detection, [key]: value },
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    await saveSettings(settings);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const handleReset = useCallback(() => {
    Alert.alert(
      "Visszaállítás",
      "Biztosan visszaállítod az alapértelmezett beállításokat?",
      [
        { text: "Mégse", style: "cancel" },
        {
          text: "Visszaállítás",
          style: "destructive",
          onPress: async () => {
            const defaults = await resetSettings();
            setSettings(defaults);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          },
        },
      ]
    );
  }, []);

  const s = settings;

  return (
    <ScreenContainer
      containerClassName="bg-background"
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Beállítások
        </Text>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: saved ? colors.success + "33" : colors.primary + "22" },
          ]}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={[styles.saveBtnText, { color: saved ? colors.success : colors.primary }]}>
            {saved ? "✓ Mentve" : "Mentés"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Physics Section ──────────────────────────────────────────── */}
        <SectionHeader title="Fizika" icon="bolt.fill" color={colors.primary} />

        <SettingsCard>
          <SliderRow
            label="Súrlódás"
            description="Alacsonyabb = tovább gurul a labda"
            value={s.physics.friction}
            min={0.95}
            max={0.999}
            step={0.001}
            displayValue={`${((1 - s.physics.friction) * 1000).toFixed(1)}‰`}
            onValueChange={(v) => updatePhysics("friction", v)}
            trackColor={colors.primary}
          />
          <Divider color={colors.border} />
          <SliderRow
            label="Rugalmasság"
            description="Labda pattanási ereje falakon"
            value={s.physics.elasticity}
            min={0.3}
            max={1.0}
            step={0.05}
            displayValue={`${Math.round(s.physics.elasticity * 100)}%`}
            onValueChange={(v) => updatePhysics("elasticity", v)}
            trackColor={colors.primary}
          />
          <Divider color={colors.border} />
          <SliderRow
            label="Max. pattanás"
            description="Hány falról pattanhat a labda"
            value={s.physics.maxBounces}
            min={1}
            max={10}
            step={1}
            displayValue={`${s.physics.maxBounces}x`}
            onValueChange={(v) => updatePhysics("maxBounces", Math.round(v))}
            trackColor={colors.primary}
          />
          <Divider color={colors.border} />
          <SliderRow
            label="Korong tömeg"
            description="Nehezebb korong = kisebb kitérítés"
            value={s.physics.discMass}
            min={1}
            max={8}
            step={0.5}
            displayValue={`${s.physics.discMass}x`}
            onValueChange={(v) => updatePhysics("discMass", v)}
            trackColor={colors.primary}
          />
        </SettingsCard>

        {/* ── Display Section ──────────────────────────────────────────── */}
        <SectionHeader title="Megjelenítés" icon="line.diagonal" color="#58A6FF" />

        <SettingsCard>
          <SliderRow
            label="Vonal vastagsága"
            description="Trajektória vonal vastagsága"
            value={s.display.trajectoryThickness}
            min={1}
            max={5}
            step={1}
            displayValue={`${s.display.trajectoryThickness}px`}
            onValueChange={(v) => updateDisplay("trajectoryThickness", Math.round(v))}
            trackColor="#58A6FF"
          />
          <Divider color={colors.border} />
          <ToggleRow
            label="Korong feliratok"
            description="P1, D1 stb. megjelenítése"
            value={s.display.showDiscLabels}
            onValueChange={(v) => updateDisplay("showDiscLabels", v)}
            tintColor={colors.primary}
          />
          <Divider color={colors.border} />
          <ToggleRow
            label="Pattanási pontok"
            description="X jelölők a pattanási helyeken"
            value={s.display.showBouncePoints}
            onValueChange={(v) => updateDisplay("showBouncePoints", v)}
            tintColor={colors.primary}
          />
          <Divider color={colors.border} />
          <ToggleRow
            label="Erő nyíl"
            description="Irány és erő megjelenítése a labdán"
            value={s.display.showVelocityArrow}
            onValueChange={(v) => updateDisplay("showVelocityArrow", v)}
            tintColor={colors.primary}
          />
        </SettingsCard>

        {/* ── Detection Section ────────────────────────────────────────── */}
        <SectionHeader title="Detektálás" icon="scope" color="#FFD700" />

        <SettingsCard>
          <SliderRow
            label="Érzékenység"
            description="AI detektálás érzékenysége"
            value={s.detection.sensitivity}
            min={0.1}
            max={1.0}
            step={0.1}
            displayValue={`${Math.round(s.detection.sensitivity * 100)}%`}
            onValueChange={(v) => updateDetection("sensitivity", v)}
            trackColor="#FFD700"
          />
          <Divider color={colors.border} />
          <ToggleRow
            label="Automatikus detektálás"
            description="Kép betöltésekor azonnal elemez"
            value={s.detection.autoDetect}
            onValueChange={(v) => updateDetection("autoDetect", v)}
            tintColor="#FFD700"
          />
        </SettingsCard>

        {/* ── Info Section ─────────────────────────────────────────────── */}
        <SectionHeader title="Névjegy" icon="info.circle" color={colors.muted} />

        <SettingsCard>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.foreground }]}>
              SoccerStars AI Overlay
            </Text>
            <Text style={[styles.infoValue, { color: colors.muted }]}>v1.0.0</Text>
          </View>
          <Divider color={colors.border} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.foreground }]}>
              Fizika motor
            </Text>
            <Text style={[styles.infoValue, { color: colors.muted }]}>
              Custom 2D Physics
            </Text>
          </View>
          <Divider color={colors.border} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.foreground }]}>
              AI Modell
            </Text>
            <Text style={[styles.infoValue, { color: colors.muted }]}>
              Vision LLM
            </Text>
          </View>
        </SettingsCard>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: colors.error + "44" }]}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow.counterclockwise" size={16} color={colors.error} />
          <Text style={[styles.resetBtnText, { color: colors.error }]}>
            Alapértelmezett visszaállítása
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  icon,
  color,
}: {
  title: string;
  icon: any;
  color: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <IconSymbol name={icon} size={16} color={color} />
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {children}
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

function SliderRow({
  label,
  description,
  value,
  min,
  max,
  step,
  displayValue,
  onValueChange,
  trackColor,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onValueChange: (v: number) => void;
  trackColor: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderRowHeader}>
        <View>
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
          <Text style={[styles.rowDesc, { color: colors.muted }]}>{description}</Text>
        </View>
        <Text style={[styles.sliderDisplayValue, { color: trackColor }]}>
          {displayValue}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={trackColor}
        maximumTrackTintColor={colors.border}
        thumbTintColor={trackColor}
        step={step}
      />
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  tintColor,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  tintColor: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextGroup}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.muted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: tintColor + "88" }}
        thumbColor={value ? tintColor : colors.muted}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  divider: {
    height: 0.5,
    marginHorizontal: 16,
  },
  sliderRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sliderRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  rowDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  sliderDisplayValue: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 44,
    textAlign: "right",
  },
  slider: {
    height: 32,
    marginHorizontal: -8,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
