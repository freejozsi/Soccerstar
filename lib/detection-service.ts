/**
 * Detection Service — client-side module for AI game element detection.
 * Sends screenshot to backend tRPC endpoint and returns parsed game state.
 */

import * as FileSystem from "expo-file-system/legacy";
import { DiscObject, GoalObject, Rect } from "./physics";

export interface DetectionResult {
  ball: { x: number; y: number; radius: number } | null;
  discs: DiscObject[];
  goal: GoalObject | null;
  fieldBounds: Rect | null;
  confidence: number;
  notes: string;
}

/**
 * Analyze a screenshot URI using the server-side AI vision model.
 * Converts the image to base64, uploads it, and returns detected positions.
 */
export async function analyzeScreenshot(
  imageUri: string,
  fieldBounds: Rect
): Promise<DetectionResult> {
  // Read image as base64
  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (err) {
    throw new Error("Nem sikerült beolvasni a képet. Kérlek próbálj egy másik képet.");
  }

  // Determine MIME type from URI
  const mimeType = imageUri.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";

  // Use fetch-based approach to call the tRPC endpoint directly
  const apiBase = getApiBase();
  const response = await fetch(`${apiBase}/trpc/detection.analyzeScreenshot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      json: {
        imageBase64: base64,
        mimeType,
        fieldWidth: Math.round(fieldBounds.width),
        fieldHeight: Math.round(fieldBounds.height),
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Szerver hiba (${response.status}): ${text.slice(0, 100)}`);
  }

  const json = await response.json();

  // tRPC wraps result in { result: { data: { json: ... } } }
  const data = json?.result?.data?.json ?? json?.result?.data ?? json;

  if (!data) {
    throw new Error("Érvénytelen szerver válasz");
  }

  return {
    ball: data.ball || null,
    discs: (data.discs || []).map((d: any, i: number) => ({
      id: d.id || `disc-${i + 1}`,
      x: d.x,
      y: d.y,
      radius: d.radius || 22,
      team: d.team || "opponent",
      label: d.label || `D${i + 1}`,
    })),
    goal: data.goal || null,
    fieldBounds: data.fieldBounds || null,
    confidence: data.confidence || 0,
    notes: data.notes || "",
  };
}

function getApiBase(): string {
  // In development, use the local API server
  if (__DEV__) {
    return "http://localhost:3000";
  }
  return "";
}
