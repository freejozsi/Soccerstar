# SoccerStars AI Overlay — Gyors Start (5 perc)

## Előfeltételek

- Windows/Mac/Linux
- Node.js 18+
- Android SDK (vagy Android Studio)
- Git

## 1. Projekt Letöltése

```bash
git clone <repo-url> soccerstars-ai-overlay
cd soccerstars-ai-overlay
```

## 2. Függőségek

```bash
npm install
```

## 3. APK Generálása (Legegyszerűbb)

```bash
# Egy parancs, amely mindent csinál
npm run build:apk:release
```

**Vagy lépésről lépésre:**

```bash
# Prebuild (Android Studio projekt generálása)
npx react-native-cli prebuild --clean --platform android

# Build
cd android && ./gradlew assembleRelease && cd ..
```

## 4. APK Helye

```
android/app/build/outputs/apk/release/app-release.apk
```

## 5. Telepítés Eszközre

```bash
# USB-n csatlakoztatott eszköz
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## Tippek

- **Első build**: 10-15 perc (Gradle cache építése)
- **Következő buildek**: 2-5 perc
- **Debug build** (gyorsabb): `./gradlew assembleDebug`

---

## Hibaelhárítás

| Hiba | Megoldás |
|------|----------|
| "Gradle not found" | `npm install` futtatása |
| "SDK not found" | Android Studio telepítése vagy `ANDROID_HOME` beállítása |
| "No connected devices" | `adb devices` futtatása, USB debugging engedélyezése |

---

## Részletes Útmutató

Nézd meg: `BUILD_GUIDE.md`
