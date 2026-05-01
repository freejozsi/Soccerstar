# SoccerStars AI Overlay — Valós Idejű Pályaelőrejelző

Egy Android overlay app, amely valós időben elemzi a SoccerStars játékot, detektálja a labdát, korongokat és kaput, majd előre kiszámítja és kirajzolja a labda pattanási útvonalát a fizika-alapú szimulációval.

## Funkciók

- **Valós idejű képernyő-megosztás** — MediaProjection API-val folyamatos rögzítés
- **Lebegő overlay ablak** — a játék fölött megjelenő átlátszó réteg
- **AI elemzés** — LLM vision modellel labda, korongok, kapu detektálása
- **Fizika szimuláció** — 2D trajektória, falról pattanás, korong ütközés
- **30-60 FPS** — valós idejű renderelés neon glow effektekkel
- **Háttér service** — az app futhat a háttérben

## Telepítés

### 1. APK letöltése és telepítése

Az `soccerstars-ai-overlay.apk` fájlt közvetlenül telepítheted az Android eszközödre:

```bash
adb install soccerstars-ai-overlay.apk
```

Vagy:
- Töltsd le az APK-t az eszközödre
- Nyisd meg a fájlkezelőt
- Kattints az APK fájlra
- Engedélyezd az ismeretlen forrásokból való telepítést (ha szükséges)
- Kattints a "Telepítés" gombra

### 2. Engedélyek

Az app az alábbi engedélyeket igényli:

- **Képernyő-megosztás** — MediaProjection (felugró ablak kéréskor)
- **Rendszer felügyelete** — SYSTEM_ALERT_WINDOW (lebegő ablak)
- **Fájlok olvasása/írása** — WRITE/READ_EXTERNAL_STORAGE
- **Hang rögzítése** — RECORD_AUDIO (opcionális)

### 3. Használat

1. Nyisd meg a **SoccerStars AI Overlay** appot
2. Kattints az **"Overlay indítása"** gombra
3. Engedélyezd a képernyő-megosztást a felugró ablakban
4. Az app elkezdi elemezni a SoccerStars játékot
5. Állítsd be az erőt és szöget a csúszkákkal
6. Kövesd a neon zöld trajektória vonalat!

## Fejlesztés (opcionális)

### Forrás kódból való építés

```bash
# Klónozd a projektet
git clone <repo>
cd soccerstars-ai-overlay

# Telepítsd a függőségeket
pnpm install

# Expo prebuild (Android natív kód generálása)
pnpm expo prebuild --clean

# APK építés
pnpm expo run:android --release
```

### Vagy EAS Build-del (ajánlott)

```bash
# Bejelentkezés
eas login

# Build indítása
eas build --platform android --release

# Az APK letöltéséhez kövesd az utasításokat
```

## Architektúra

### Frontend (React Native)
- **Home Screen** — indítás gomb
- **Overlay Screen** — valós idejű canvas + kontrollpult
- **Physics Engine** — 2D trajektória szimuláció

### Backend (Android Native)
- **ScreenCaptureModule** — Expo modul MediaProjection API-hoz
- **ScreenCaptureService** — háttér service a rögzítéshez
- **WindowManager** — lebegő overlay ablak

### AI (Server-side)
- **LLM Vision API** — labda, korongok, kapu detektálása
- **JSON parsing** — pozíció koordináták kinyerése

## Fizika Motor

A trajektória szimulációja a következőket veszi figyelembe:

- **Súrlódás** — labda lassulása (0.95-0.999)
- **Rugalmasság** — fal pattanás ereje (0.3-1.0)
- **Korong ütközés** — rugalmas ütközés tömeg figyelembevételével
- **Pattanások** — max. 10 fal/korong ütközés
- **Erő modell** — lövési erő → sebesség konverzió

## Beállítások

Az app-ban módosítható paraméterek:

| Paraméter | Tartomány | Leírás |
|-----------|-----------|--------|
| Súrlódás | 0.95-0.999 | Alacsonyabb = tovább gurul |
| Rugalmasság | 0.3-1.0 | Magasabb = jobban pattan |
| Max pattanás | 1-10 | Hány falról pattanhat |
| Korong tömeg | 1-8x | Nehezebb = kisebb kitérítés |

## Hibaelhárítás

### "Nincs engedély a képernyő-megosztáshoz"
- Engedélyezd a **SYSTEM_ALERT_WINDOW** engedélyt a Beállításokban
- Próbálj meg újra indítani az appot

### "Az overlay nem jelenik meg"
- Ellenőrizd, hogy a SoccerStars app nyitva van-e
- Próbálj meg más appok fölött is megjeleníteni (pl. Chrome)

### "Lassú az elemzés"
- Csökkentsd az erőt és szöget az FPS optimalizálásához
- Zárd be a háttérben futó más appokat

## Technikai Specifikáció

- **Minimum Android verzió** — 10 (API 29)
- **Target Android verzió** — 14 (API 34)
- **Architektúra** — ARM64-v8a, ARMv7
- **Memória** — ~150 MB (idle), ~250 MB (aktív)
- **Teljesítmény** — 30-60 FPS (eszköztől függően)

## Jogi Megjegyzés

Ez az app a **SoccerStars** játékhoz készült, amely a **Miniclip** tulajdona. Az app kizárólag személyes, nem kereskedelmi célokra használható. A szerzők nem felelősek az app használatából eredő következményekért.

## Támogatás

Hibákat vagy javaslatokat a GitHub Issues-ban jelenthetsz.

---

**Verzió:** 1.0.0  
**Utolsó frissítés:** 2026. május 1.
