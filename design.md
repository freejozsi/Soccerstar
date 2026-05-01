# SoccerStars AI Overlay — Design Document

## App Concept

An Android overlay assistant for SoccerStars-like disc-soccer games. The user runs this app alongside the game, takes a screenshot or uses the camera to capture the current game state, and the app overlays a physics-predicted ball trajectory on top — showing where the ball will go, including bounces off walls and collisions with discs.

---

## Color Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `primary` | `#00E676` | `#00E676` | Neon green — trajectory lines, active state |
| `background` | `#0D1117` | `#0D1117` | Deep dark field background |
| `surface` | `#161B22` | `#161B22` | Card/panel surfaces |
| `foreground` | `#E6EDF3` | `#E6EDF3` | Primary text |
| `muted` | `#7D8590` | `#7D8590` | Secondary text, labels |
| `border` | `#30363D` | `#30363D` | Borders, dividers |
| `accent` | `#F78166` | `#F78166` | Ball indicator, warnings |
| `disc` | `#58A6FF` | `#58A6FF` | Disc/puck highlight color |
| `goal` | `#FFD700` | `#FFD700` | Goal post highlight |
| `success` | `#3FB950` | `#3FB950` | Successful detection |
| `error` | `#F85149` | `#F85149` | Detection failure |

---

## Screen List

### 1. Home / Dashboard Screen (`/`)
**Primary content:** App overview, quick-start button, last session summary.
- Large hero area with animated field preview
- "Start Analysis" CTA button (opens Overlay screen)
- Stats row: last detected objects count, last trajectory accuracy
- Quick settings shortcuts (force level, bounce count)

### 2. Overlay / Analysis Screen (`/overlay`)
**Primary content:** Full-screen canvas showing the game field with AI detections and trajectory overlay.
- Full-screen image/camera view as background
- SVG/Canvas overlay layer with:
  - Detected discs (blue circles with labels)
  - Detected ball (red/orange circle)
  - Detected goal (gold rectangle outline)
  - Field boundary (green dashed outline)
  - Predicted trajectory (neon green animated path with bounce points)
- Bottom control panel (collapsible):
  - Force slider (0–100%)
  - Angle indicator
  - "Analyze" button (triggers AI detection)
  - "Clear" button
  - Bounce count display
- Top bar: back button, screenshot/camera toggle, settings icon

### 3. Settings Screen (`/settings`)
**Primary content:** Configuration for physics parameters and display preferences.
- Physics section:
  - Friction coefficient slider
  - Elasticity (bounciness) slider
  - Max bounces selector (1–10)
  - Ball mass selector
- Display section:
  - Trajectory line color picker
  - Show/hide disc labels toggle
  - Show/hide bounce points toggle
  - Trajectory thickness slider
- Detection section:
  - Detection sensitivity slider
  - Auto-detect on screenshot toggle
  - Detection mode: AI Vision / Manual placement

### 4. Manual Placement Screen (`/manual`)
**Primary content:** Tap-to-place interface for manually positioning game elements when AI detection is unavailable.
- Full-screen canvas with field grid
- Tool selector: Ball / Disc / Goal / Wall
- Tap to place elements
- Drag to reposition
- "Calculate Trajectory" button
- Element list sidebar

---

## Key User Flows

### Flow 1: AI-Assisted Analysis (Primary)
1. User opens app → Home screen
2. Taps "Start Analysis" → Overlay screen opens
3. Taps camera icon → Takes screenshot of game
4. Taps "Analyze" → AI detects field elements
5. Detected elements appear as colored overlays
6. Adjusts force slider to match intended shot power
7. Trajectory path animates showing predicted ball path with bounces
8. User uses trajectory info to aim shot in game

### Flow 2: Manual Placement
1. From Overlay screen, taps "Manual" mode
2. Navigates to Manual Placement screen
3. Selects "Ball" tool, taps to place ball position
4. Selects "Disc" tool, taps to place opponent discs
5. Selects "Goal" tool, taps to place goal
6. Taps "Calculate Trajectory" → physics simulation runs
7. Trajectory displayed on canvas

### Flow 3: Settings Adjustment
1. From any screen, taps settings icon
2. Adjusts physics parameters (friction, elasticity)
3. Changes display preferences
4. Returns to Overlay screen — trajectory recalculates with new params

---

## Layout Principles

- **Dark-first design**: The app is always dark-themed to blend with game overlays and reduce eye strain
- **One-handed operation**: All primary controls in bottom 40% of screen
- **Minimal chrome**: Full-screen canvas with floating controls, no heavy navigation bars
- **Neon aesthetic**: Inspired by sports analytics HUD displays — glowing lines on dark backgrounds
- **Haptic feedback**: On detection complete, trajectory calculated, and force slider snaps

---

## Component Architecture

### `FieldCanvas`
SVG-based canvas component rendering:
- Field boundary polygon
- Disc circles (with team color coding)
- Ball circle (with velocity vector arrow)
- Goal rectangle
- Trajectory path (animated dashed line with glow effect)
- Bounce point markers (small X marks)

### `PhysicsEngine`
Pure TypeScript module:
- `simulateTrajectory(ball, discs, walls, force, angle, params)` → `TrajectoryPoint[]`
- `detectCollision(ball, disc)` → `CollisionResult`
- `reflectVector(velocity, normal)` → `Vector2D`
- `applyFriction(velocity, friction)` → `Vector2D`

### `DetectionService`
Server-side AI vision module:
- Sends screenshot to backend LLM with structured prompt
- Returns JSON with detected positions of all game elements
- Fallback to manual placement if detection fails

### `ControlPanel`
Bottom sheet component:
- Force slider with haptic snapping
- Angle display
- Action buttons
- Detection status indicator
