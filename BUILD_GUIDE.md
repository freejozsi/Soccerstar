# SoccerStars AI Overlay — Build Guide

Ez az útmutató segít az Android APK generálásában és telepítésében.

## Rendszerkövetelmények

- **Node.js** 18+ (https://nodejs.org)
- **Android Studio** vagy **Android SDK** (API 29+)
- **Java Development Kit (JDK)** 11+
- **Git**

## Gyors Start (Ajánlott)

### 1. Projekt Klónozása

```bash
git clone <repo-url> soccerstars-ai-overlay
cd soccerstars-ai-overlay
```

### 2. Függőségek Telepítése

```bash
npm install
# vagy
pnpm install
```

### 3. Android Prebuild

```bash
npm run prebuild:android
# vagy
npx react-native-cli prebuild --clean --platform android
```

### 4. APK Generálás

```bash
npm run build:android:release
# vagy
cd android && ./gradlew assembleRelease && cd ..
```

Az APK a következő helyen lesz:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 5. Telepítés Android Eszközre

```bash
# Csatlakoztasd az Android eszközt USB-n
npm run install:android
# vagy
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## Részletes Lépések

### A. Android Studio-val (GUI)

1. **Android Studio megnyitása**
   ```bash
   android-studio
   ```

2. **Projekt megnyitása**
   - File → Open → `soccerstars-ai-overlay/android`

3. **Build konfigurálása**
   - Build → Generate Signed Bundle / APK
   - APK kiválasztása
   - Keystore létrehozása vagy meglévő használata

4. **Build indítása**
   - Finish gombra kattintás
   - Várakozás a build befejezésére (5-15 perc)

5. **APK helye**
   - `android/app/release/app-release.apk`

### B. Parancssorral (CLI)

1. **Gradle wrapper használata**
   ```bash
   cd android
   ./gradlew assembleRelease
   cd ..
   ```

2. **APK ellenőrzése**
   ```bash
   ls -lh android/app/build/outputs/apk/release/
   ```

3. **Telepítés**
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

---

## Fejlesztői Build (Gyorsabb)

Ha tesztelni szeretnéd az appot gyorsabban:

```bash
# Debug APK (nagyobb, de gyorsabb build)
cd android && ./gradlew assembleDebug && cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Hibaelhárítás

### "Gradle build failed"

```bash
# Gradle cache törlése
cd android && ./gradlew clean && cd ..
./gradlew assembleRelease
```

### "SDK not found"

```bash
# Android SDK path beállítása
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### "No connected devices"

```bash
# Eszköz ellenőrzése
adb devices

# USB debugging engedélyezése az eszközön
# Beállítások → Fejlesztői opciók → USB hibakeresés
```

### "Permission denied"

```bash
# Gradle wrapper végrehajthatóvá tétele
chmod +x android/gradlew
```

---

## Keystore Kezelés

### Új Keystore Létrehozása

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias
```

### Keystore Használata a Build-ben

```bash
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=../my-release-key.keystore \
  -Pandroid.injected.signing.store.password=<jelszó> \
  -Pandroid.injected.signing.key.alias=my-key-alias \
  -Pandroid.injected.signing.key.password=<jelszó>
cd ..
```

---

## Telepítés Eszközre

### USB-n Keresztül

```bash
# Eszköz csatlakoztatása
adb devices  # Ellenőrzés

# APK telepítése
adb install -r android/app/build/outputs/apk/release/app-release.apk

# App indítása
adb shell am start -n space.manus.soccerstars.ai.overlay/space.manus.soccerstars.ai.overlay.MainActivity
```

### Wireless (ADB over WiFi)

```bash
# Eszköz csatlakoztatása USB-n
adb tcpip 5555

# Eszköz IP-je
adb shell ip addr show wlan0

# Csatlakozás WiFi-n
adb connect <DEVICE_IP>:5555

# Telepítés
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## Engedélyek

Az app a következő Android engedélyeket igényli:

- `SYSTEM_ALERT_WINDOW` — Lebegő ablak megjelenítése
- `FOREGROUND_SERVICE` — Háttér service futtatása
- `FOREGROUND_SERVICE_MEDIA_PROJECTION` — Képernyő rögzítés
- `POST_NOTIFICATIONS` — Push notifikációk

Ezek automatikusan engedélyezve vannak az `AndroidManifest.xml`-ben.

---

## Teljesítmény Optimizálása

### Release Build Beállítások

```bash
cd android
./gradlew assembleRelease \
  -Dorg.gradle.parallel=true \
  -Dorg.gradle.workers.max=8
cd ..
```

### APK Méretének Csökkentése

```bash
# Nem használt kódok eltávolítása (ProGuard/R8)
# build.gradle-ben már engedélyezve van
```

---

## Verziókezelés

Az app verziója az `app.json`-ben van:

```json
{
  "version": "1.0.0"
}
```

Frissítéshez:

```bash
# app.json szerkesztése
"version": "1.0.1"

# Új build
./gradlew assembleRelease
```

---

## Támogatás

Ha problémáid vannak:

1. Ellenőrizd az Android Studio logokat
2. Futtasd: `adb logcat | grep soccerstars`
3. Nézd meg a `FLOATING_WINDOW_GUIDE.md`-t a lebegő ablak konfigurációjához

---

## Következő Lépések

- ✅ APK generálva
- ⏭️ Telepítés Android eszközre
- ⏭️ Teszt a SoccerStars játékkal
- ⏭️ Beállítások konfigurálása az app-ban
