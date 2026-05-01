# Lebegő Ablak Implementáció — Technikai Útmutató

## Áttekintés

A SoccerStars AI Overlay valódi lebegő ablakot használ Android WindowManager API-val. Az overlay mindig a játék fölött marad, és független az app ablakától.

## Architektúra

### 1. OverlayWindowService (Kotlin)
- **Fájl:** `android/app/src/main/java/space/manus/soccerstars/OverlayWindowService.kt`
- **Felelősség:** Háttér service, amely kezeli az overlay ablak életciklusát
- **Funkciók:**
  - `startOverlay()` — WindowManager-rel hozzáadja az overlay view-t
  - `stopOverlay()` — Eltávolítja az overlay view-t
  - Foreground notification kezelése
  - Service lifecycle management

### 2. DraggableOverlayView (Kotlin)
- **Fájl:** `android/app/src/main/java/space/manus/soccerstars/DraggableOverlayView.kt`
- **Felelősség:** Egyéni View, amely rendereli az overlay tartalmát
- **Funkciók:**
  - Canvas-alapú rajzolás (neon glow effektusok)
  - Touch handling (drag handle + interakció)
  - Physics szimulációs loop (30 FPS)
  - Ball, disc, goal, trajectory megjelenítése

### 3. OverlayModule (Kotlin)
- **Fájl:** `android/app/src/main/java/space/manus/soccerstars/OverlayModule.kt`
- **Felelősség:** Expo modul, amely React Native-ből hívható
- **API:**
  - `startOverlay()` — Indítja az overlay service-t
  - `stopOverlay()` — Leállítja az overlay service-t
  - `updateOverlayPosition(x, y)` — Frissíti az ablak pozícióját

### 4. useOverlay Hook (TypeScript)
- **Fájl:** `hooks/use-overlay.ts`
- **Felelősség:** React hook az overlay kontrollhoz
- **API:**
  - `isActive` — Boolean, hogy az overlay fut-e
  - `error` — Hibamessage, ha van
  - `startOverlay()` — Indítja az overlay-t
  - `stopOverlay()` — Leállítja az overlay-t
  - `updatePosition(x, y)` — Mozgatja az ablakot

## WindowManager Paraméterek

```kotlin
val params = WindowManager.LayoutParams().apply {
    // Ablak típusa (Android 8+ felett APPLICATION_OVERLAY)
    type = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    
    // Formátum (TRANSLUCENT = átlátszó)
    format = PixelFormat.TRANSLUCENT
    
    // Flagek:
    // - FLAG_LAYOUT_NO_LIMITS: Nem korlátozódik a képernyőhöz
    flags = WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
    
    // Méret
    width = 400
    height = 600
    
    // Pozíció
    x = 0
    y = 100
    
    // Gravity (TOP | START = bal felső sarok)
    gravity = Gravity.TOP or Gravity.START
}
```

## Touch Handling

### Drag Handle (40px magasság)
- Felső 40px-es sáv a drag handle
- Húzáskor az egész ablak mozog
- WindowManager.updateViewLayout() frissíti a pozíciót

### Content Area (maradék terület)
- Érintéskor a force és angle értékek módosulnak
- Vertikális drag → angle (szög)
- Horizontális drag → force (erő)

## Renderelési Loop

```kotlin
Thread {
    while (true) {
        updatePhysics()  // Ball, disc, goal pozíció
        postInvalidate() // Redraw
        Thread.sleep(33) // ~30 FPS
    }
}.start()
```

## Engedélyek

Az alábbi engedélyek szükségesek az `AndroidManifest.xml`-ben:

```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />
```

## Notification (Foreground Service)

Az overlay futása közben egy notification jelenik meg:

- **Cím:** "⚽ SoccerStars AI Overlay"
- **Szöveg:** "Valós idejű pályaelőrejelző aktív"
- **Csatorna:** "Overlay Service" (LOW priority)

## Teljesítmény Optimalizáció

### 1. Frame Throttling
- 30 FPS renderelés (33ms/frame)
- Nem 60 FPS, hogy csökkentsük a CPU/GPU terhelést

### 2. Memory Management
- Nem hozunk létre új objektumokat a render loopban
- Paint objektumok előre inicializálva
- Trajectory lista mérete korlátozva

### 3. Battery Optimization
- Csak akkor fut, amikor az overlay aktív
- Foreground service notification
- Háttér service leáll, ha az app bezáródik

## Tesztelés

### Helyi Teszt (Emulator)
```bash
pnpm expo prebuild --clean --platform android
pnpm expo run:android
```

### Fizikai Eszköz
```bash
# ADB-vel
adb install soccerstars-ai-overlay.apk

# Vagy közvetlenül az APK fájlra kattintva
```

### Ellenőrzési Lépések
1. Nyisd meg az appot
2. Kattints az "Overlay indítása" gombra
3. Nyisd meg a SoccerStars játékot
4. Az overlay ablaknak megjelenik a játék fölött
5. Húzd az ablakot a drag handle-ből
6. Érintsd meg az overlay tartalmát (force/angle módosítás)

## Hibaelhárítás

### "Nincs engedély az overlay-hez"
- Beállítások → Alkalmazások → SoccerStars AI Overlay
- Engedélyek → "Egyéb alkalmazások fölött megjelenítés" → Engedélyezés

### "Az overlay nem jelenik meg"
- Ellenőrizd, hogy a SoccerStars app nyitva van-e
- Próbálj meg más appok fölött is (pl. Chrome)
- Indítsd újra az appot

### "Lassú az overlay"
- Csökkentsd az FPS-t (Thread.sleep() értékét növeld)
- Csökkentsd az overlay méretét (width/height)
- Zárd be a háttérben futó appokat

## Jövőbeli Fejlesztések

1. **Real-time frame capture** — MediaProjection API-val képernyő rögzítés
2. **AI detektálás** — LLM vision modellel labda/korong detektálása
3. **Floating window resize** — Ablak méretezés érintéssel
4. **Settings panel** — Physics paraméterek módosítása az overlay-ben
5. **Multi-window support** — Több overlay ablak egyszerre

## Referenciák

- [Android WindowManager API](https://developer.android.com/reference/android/view/WindowManager)
- [Foreground Services](https://developer.android.com/guide/components/foreground-services)
- [Canvas Drawing](https://developer.android.com/reference/android/graphics/Canvas)
- [Touch Events](https://developer.android.com/guide/input/touch)

---

**Verzió:** 1.0.0  
**Utolsó frissítés:** 2026. május 1.
