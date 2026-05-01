/**
 * Home Screen — Dashboard with app overview and quick start.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const colors = useColors();

  const handleStartAnalysis = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/overlay" as any);
  };

  return (
    <ScreenContainer
      containerClassName="bg-background"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroIconWrap}>
            <Text style={styles.heroEmoji}>⚽</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            SoccerStars AI
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
            Valós idejű pályaelőrejelző overlay
          </Text>
          <Text style={[styles.heroDesc, { color: colors.muted }]}>
            Készíts képernyőképet a játékodról, az AI azonosítja a korongokat,
            labdát és kaput — majd kiszámolja a labda útvonalát a pattanásokkal
            és ütközésekkel együtt.
          </Text>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={handleStartAnalysis}
            activeOpacity={0.85}
          >
            <IconSymbol name="viewfinder" size={20} color="#0D1117" />
            <Text style={styles.startBtnText}>Elemzés indítása</Text>
          </TouchableOpacity>
        </View>

        {/* ── Feature Cards ─────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          FUNKCIÓK
        </Text>

        <View style={styles.featureGrid}>
          <FeatureCard
            icon="scope"
            title="AI Detektálás"
            description="Labda, korongok, kapu és pályahatár automatikus felismerése"
            color="#58A6FF"
          />
          <FeatureCard
            icon="line.diagonal"
            title="Trajektória"
            description="Fizika-alapú útvonal kiszámítása pattanásokkal"
            color={colors.primary}
          />
          <FeatureCard
            icon="bolt.fill"
            title="Erő & Szög"
            description="Állítható lövési erő és szög a pontos előrejelzéshez"
            color="#FFD700"
          />
          <FeatureCard
            icon="circle.fill"
            title="Korong ütközés"
            description="Korongokkal való ütközés fizikailag pontos szimulációja"
            color="#F78166"
          />
        </View>

        {/* ── How to Use ────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          HOGYAN HASZNÁLD
        </Text>

        <View style={[styles.howToCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { step: "1", text: "Nyisd meg a SoccerStars játékot", icon: "sportscourt.fill" },
            { step: "2", text: "Készíts képernyőképet a játékállásról", icon: "camera.fill" },
            { step: "3", text: "Töltsd be a képet az Overlay fülön", icon: "photo.fill" },
            { step: "4", text: "Nyomd meg az Elemzés gombot", icon: "wand.and.stars" },
            { step: "5", text: "Állítsd be az erőt és szöget", icon: "slider.horizontal.3" },
            { step: "6", text: "Kövesd a neon zöld trajektóriát!", icon: "line.diagonal" },
          ].map((item, i) => (
            <View key={i} style={styles.howToStep}>
              <View style={[styles.stepBadge, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.stepNum, { color: colors.primary }]}>{item.step}</Text>
              </View>
              <IconSymbol name={item.icon as any} size={18} color={colors.muted} />
              <Text style={[styles.stepText, { color: colors.foreground }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Settings ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.settingsShortcut, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push("/settings" as any)}
          activeOpacity={0.7}
        >
          <IconSymbol name="gearshape.fill" size={20} color={colors.muted} />
          <Text style={[styles.settingsShortcutText, { color: colors.foreground }]}>
            Fizika és megjelenítési beállítások
          </Text>
          <IconSymbol name="chevron.right" size={18} color={colors.muted} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.featureCard,
        { backgroundColor: colors.surface, borderColor: color + "33" },
      ]}
    >
      <View style={[styles.featureIconWrap, { backgroundColor: color + "22" }]}>
        <IconSymbol name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.featureDesc, { color: colors.muted }]}>{description}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  hero: {
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  heroIconWrap: {
    marginBottom: 12,
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  heroDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
  },
  startBtnText: {
    color: "#0D1117",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  featureCard: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    gap: 8,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  featureDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  howToCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 16,
    gap: 14,
    marginBottom: 16,
  },
  howToStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  settingsShortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 8,
  },
  settingsShortcutText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});
