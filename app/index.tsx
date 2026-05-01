import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function HomeScreen() {
  const handleStart = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/overlay');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚽ SoccerStars AI</Text>
      <Text style={styles.subtitle}>Valós idejű pályaelőrejelző overlay</Text>
      <Text style={styles.description}>
        Folyamatos képernyő-elemzés, labda pattanás előrejelzés, korong ütközés szimulációval
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Overlay indítása</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00FF88',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#58A6FF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#8b949e',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#00FF88',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#0D1117',
    fontSize: 16,
    fontWeight: '700',
  },
});
