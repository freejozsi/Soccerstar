# SoccerStars AI Overlay — Valós Idejű Verzió

## Architektúra
- [x] Bare React Native projekt (Expo modulok)
- [x] Android MediaProjection API integráció
- [x] Physics engine (2D trajektória, pattanás, ütközés)
- [x] Kotlin Android service (háttér rögzítés)
- [x] ScreenCaptureModule (Expo modul)
- [x] Real-time frame analysis pipeline (demo)

## UI Komponensek
- [x] Home screen (indítás gomb)
- [x] Overlay screen (canvas + kontrollpult)
- [x] Erő és szög csúszkák
- [x] SVG canvas rajzolás

## MediaProjection & Capture
- [x] ScreenCapture Expo modul (Kotlin)
- [x] ScreenCaptureService (háttér service)
- [x] AndroidManifest.xml (engedélyek)
- [x] Frame capture loop (30-60 FPS demo)

## AI Detektálás
- [x] Demo game element detection
- [x] Mock ball, discs, goal rendering
- [x] Fallback mock data
- [ ] Real server LLM integráció (opcionális)

## Fizika & Renderelés
- [x] Trajektória szimulációs motor
- [x] SVG canvas rajzolás
- [x] Neon glow effektusok (stroke)
- [x] 30-60 FPS renderelés

## Android Specifikus
- [x] Foreground Service (notification)
- [x] SYSTEM_ALERT_WINDOW permission
- [x] WindowManager floating view (service)
- [x] Battery optimization (frame throttling)
- [x] Háttér service lifecycle

## Build & Deploy
- [x] APK generálás (Expo prebuild)
- [x] Android 10+ compatibility (API 29+)
- [x] build-apk.sh script
- [x] eas.json konfiguráció
- [x] README.md és INSTALL.md útmutatók
