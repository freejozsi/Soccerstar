# Telepítési Útmutató — SoccerStars AI Overlay

## Gyors Telepítés (Ajánlott)

### 1. lépés: APK Letöltése

Töltsd le a `soccerstars-ai-overlay.apk` fájlt az alábbi helyekről:
- GitHub Releases
- Manus platform
- Közvetlen link

### 2. lépés: Telepítés Android-ra

#### Módszer A: ADB (Android Debug Bridge) — Fejlesztőknek

```bash
# Csatlakoztasd az Android eszközt USB-vel
# Engedélyezd a USB Debug Mode-ot a Beállításokban

# Telepítés parancssor segítségével
adb install soccerstars-ai-overlay.apk

# Ellenőrzés
adb shell pm list packages | grep soccerstars
```

#### Módszer B: Közvetlen Telepítés — Felhasználóknak

1. **Másolj az APK-t az eszközödre**
   - USB kábellel vagy Bluetooth-on keresztül
   - Vagy töltsd le közvetlenül az eszközödre

2. **Nyisd meg a fájlkezelőt**
   - Navigálj az APK fájlhoz
   - Kattints rá

3. **Engedélyezd az ismeretlen forrásokból való telepítést**
   - Ha szükséges, a Beállítások → Biztonsági → Ismeretlen alkalmazások
   - Válaszd ki a fájlkezelőt és engedélyezd

4. **Kattints a "Telepítés" gombra**
   - Várj, amíg a telepítés befejeződik
   - Kattints az "Alkalmazás megnyitása" gombra

### 3. lépés: Engedélyek Beállítása

Az app az alábbi engedélyeket igényli:

1. **Képernyő-megosztás (MediaProjection)**
   - Az app kéréskor felugró ablakban kéri
   - Kattints az "Indítás" gombra

2. **Rendszer felügyelete (SYSTEM_ALERT_WINDOW)**
   - Beállítások → Alkalmazások → SoccerStars AI Overlay
   - Kattints az "Engedélyek" gombra
   - Engedélyezd az "Egyéb alkalmazások fölött megjelenítés" engedélyt

3. **Fájlok olvasása/írása (opcionális)**
   - Beállítások → Alkalmazások → SoccerStars AI Overlay
   - Kattints az "Engedélyek" gombra
   - Engedélyezd a "Fájlok és média" engedélyt

## Első Használat

1. **Nyisd meg az appot**
   - Kattints az "SoccerStars AI Overlay" ikonra
   - Az app betöltődik

2. **Indítsd el az overlay-t**
   - Kattints az "Overlay indítása" gombra
   - Engedélyezd a képernyő-megosztást a felugró ablakban

3. **Nyisd meg a SoccerStars játékot**
   - Indítsd el a SoccerStars appot
   - Az overlay elkezdi elemezni a játékot

4. **Állítsd be az erőt és szöget**
   - Használd az app csúszkáit
   - Kövesd a neon zöld trajektória vonalat

## Hibaelhárítás

### "Nincs engedély a képernyő-megosztáshoz"

**Megoldás:**
1. Beállítások → Alkalmazások → SoccerStars AI Overlay
2. Kattints az "Engedélyek" gombra
3. Engedélyezd a "Képernyő-megosztás" engedélyt
4. Indítsd újra az appot

### "Az overlay nem jelenik meg a játék fölött"

**Megoldás:**
1. Beállítások → Alkalmazások → SoccerStars AI Overlay
2. Kattints az "Engedélyek" gombra
3. Engedélyezd az "Egyéb alkalmazások fölött megjelenítés" engedélyt
4. Indítsd újra az appot

### "Az app összeomlik vagy lefagy"

**Megoldás:**
1. Zárd be az appot (Beállítások → Alkalmazások → Erőltetett leállítás)
2. Indítsd újra az appot
3. Ha továbbra is problémás, telepítsd újra az APK-t

### "Az elemzés nem működik pontosan"

**Megoldás:**
1. Ellenőrizd, hogy a SoccerStars játék jól látható-e
2. Állítsd be az erőt és szöget az app-ban
3. Próbálj meg más szögeket (pl. -45°, 0°, 45°)

## Fejlett Beállítások

### Fizika Paraméterek

Az app Beállítások menüjében módosíthatod:

- **Súrlódás** — Alacsonyabb érték = tovább gurul a labda
- **Rugalmasság** — Magasabb érték = jobban pattan a labda
- **Max pattanás** — Hány falról/korongról pattanhat
- **Korong tömeg** — Nehezebb korong = kisebb kitérítés

### Megjelenítési Opciók

- **Trajektória vastagsága** — Vonal vastagsága pixelben
- **Korong feliratok** — P1, D1 stb. megjelenítése
- **Pattanási pontok** — X jelölők a pattanási helyeken
- **Erő nyíl** — Irány és erő megjelenítése

## Eltávolítás

### Android-ról való eltávolítás

1. Beállítások → Alkalmazások
2. Keress rá a "SoccerStars AI Overlay" alkalmazásra
3. Kattints az "Eltávolítás" gombra
4. Erősítsd meg az eltávolítást

### ADB-vel való eltávolítás

```bash
adb uninstall space.manus.soccerstars.ai.overlay
```

## Támogatás

Ha problémáid vannak:

1. Ellenőrizd az Android verziót (minimum 10 szükséges)
2. Győződj meg, hogy az összes engedély be van állítva
3. Próbálj meg újraindítani az eszközt
4. Telepítsd újra az APK-t

---

**Verzió:** 1.0.0  
**Utolsó frissítés:** 2026. május 1.
