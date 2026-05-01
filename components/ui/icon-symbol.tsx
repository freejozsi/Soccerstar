// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for SoccerStars AI Overlay
 */
const MAPPING = {
  // Navigation
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  // App-specific
  "viewfinder": "center-focus-strong",
  "camera.fill": "camera-alt",
  "gearshape.fill": "settings",
  "gearshape": "settings",
  "play.fill": "play-arrow",
  "stop.fill": "stop",
  "arrow.counterclockwise": "refresh",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "checkmark.circle.fill": "check-circle",
  "exclamationmark.triangle.fill": "warning",
  "info.circle": "info",
  "slider.horizontal.3": "tune",
  "bolt.fill": "bolt",
  "target": "my-location",
  "scope": "gps-fixed",
  "wand.and.stars": "auto-fix-high",
  "hand.tap.fill": "touch-app",
  "sportscourt.fill": "sports-soccer",
  "circle.fill": "circle",
  "square.fill": "square",
  "line.diagonal": "show-chart",
  "photo.fill": "photo",
  "photo.on.rectangle.angled": "photo-library",
  "trash.fill": "delete",
  "plus.circle.fill": "add-circle",
  "minus.circle.fill": "remove-circle",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
