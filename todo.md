# SoccerStars AI Overlay — TODO

## Branding & Setup
- [x] Generate custom app icon (neon soccer/disc theme)
- [x] Update app.config.ts with app name and logo
- [x] Update theme colors (dark neon palette)
- [x] Add icon mappings to icon-symbol.tsx

## Navigation & Screens
- [x] Home/Dashboard screen with hero and quick-start
- [x] Overlay/Analysis screen (full-screen canvas)
- [x] Settings screen (physics + display params)
- [ ] Manual placement screen (tap-to-place elements)
- [x] Tab bar with 3 tabs: Home, Overlay, Settings

## Physics Engine
- [x] Vector2D math utilities
- [x] Ball trajectory simulation (position + velocity over time)
- [x] Wall/boundary bounce reflection
- [x] Disc collision detection and response
- [x] Friction and energy loss model
- [x] Force-to-velocity conversion
- [x] Multi-bounce path calculation (up to 10 bounces)

## Field Canvas & Rendering
- [x] SVG canvas component (FieldCanvas)
- [x] Field boundary rendering (green dashed outline)
- [x] Disc rendering (blue circles with labels)
- [x] Ball rendering (orange/red circle with arrow)
- [x] Goal rendering (gold rectangle)
- [x] Trajectory path rendering (neon green animated dashes)
- [x] Bounce point markers (X marks)
- [x] Glow/neon visual effects on trajectory

## AI Detection
- [x] Screenshot capture from device (gallery + camera)
- [x] Server-side AI vision detection endpoint
- [x] Parse AI response into game element positions
- [x] Detection status indicator (loading/success/error)
- [x] Fallback to manual placement on detection failure

## Control Panel
- [x] Force slider (0–100%) with haptic feedback
- [x] Angle display/indicator
- [x] Analyze button (triggers AI detection)
- [x] Clear button (resets canvas)
- [x] Bounce count display
- [x] Collapsible bottom sheet panel

## Settings
- [x] Friction coefficient slider
- [x] Elasticity (bounciness) slider
- [x] Max bounces selector
- [x] Trajectory color preference
- [x] Show/hide labels toggle
- [x] Show/hide bounce points toggle
- [x] Detection sensitivity slider
- [x] Persist settings with AsyncStorage

## Manual Placement Mode
- [ ] Tap-to-place ball position
- [ ] Tap-to-place disc positions
- [ ] Tap-to-place goal position
- [ ] Drag to reposition elements
- [ ] Tool selector (Ball/Disc/Goal/Wall)
- [ ] Calculate trajectory from manual placement
