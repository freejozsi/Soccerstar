#!/bin/bash

# SoccerStars AI Overlay — APK Build Script

set -e

echo "🏗️  SoccerStars AI Overlay — APK Builder"
echo "=========================================="
echo ""

# Check if Node.js and pnpm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing..."
    npm install -g pnpm
fi

echo "✅ Node.js and pnpm found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🔨 Generating Android native code..."
pnpm expo prebuild --clean --platform android

echo ""
echo "📱 Building APK..."
pnpm expo run:android --release

echo ""
echo "✅ APK build complete!"
echo ""
echo "📍 APK location: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "📲 To install on device:"
echo "   adb install android/app/build/outputs/apk/release/app-release.apk"
echo ""
