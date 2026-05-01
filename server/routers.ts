import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * AI-powered game screenshot analysis.
   * Detects ball, discs, goal, and field bounds from a SoccerStars screenshot.
   */
  detection: router({
    analyzeScreenshot: publicProcedure
      .input(
        z.object({
          imageBase64: z.string(),
          mimeType: z.string().default("image/jpeg"),
          fieldWidth: z.number().default(380),
          fieldHeight: z.number().default(600),
        })
      )
      .mutation(async ({ input }) => {
        // Upload image to storage (LLM needs a URL)
        const imageBuffer = Buffer.from(input.imageBase64, "base64");
        const key = `detection/${Date.now()}.jpg`;
        const { url } = await storagePut(key, imageBuffer, input.mimeType);

        const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
        const imageUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

        const systemPrompt = `You are a computer vision AI specialized in analyzing SoccerStars mobile game screenshots.
Detect and locate all game elements in the image.

The game is a top-down disc soccer game:
- BALL: small round object (white/light colored, smaller than discs)
- PLAYER DISCS: round pucks belonging to the user (one team color)
- OPPONENT DISCS: round pucks of the opponent (different color)
- GOAL: rectangular opening in the wall/boundary
- FIELD: the rectangular playing area

Return JSON with this exact structure:
{
  "ball": { "x": number, "y": number, "radius": number },
  "discs": [ { "id": "disc-1", "x": number, "y": number, "radius": number, "team": "player" or "opponent", "label": "P1" or "D1" } ],
  "goal": { "x": number, "y": number, "width": number, "height": number, "side": "top" or "bottom" or "left" or "right" },
  "fieldBounds": { "x": number, "y": number, "width": number, "height": number },
  "confidence": number,
  "notes": "string"
}

Coordinates: (0,0) = top-left, x increases right, y increases down.
Image dimensions: ${input.fieldWidth}x${input.fieldHeight} pixels.
If an element is not visible, set it to null.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this SoccerStars screenshot and return JSON with pixel coordinates for all detected game elements." },
                { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        let parsed: any;
        try {
          parsed = typeof content === "string" ? JSON.parse(content) : content;
        } catch {
          throw new Error("AI returned invalid JSON response");
        }

        return {
          ball: parsed.ball ? {
            x: Number(parsed.ball.x) || 0,
            y: Number(parsed.ball.y) || 0,
            radius: Number(parsed.ball.radius) || 14,
          } : null,
          discs: Array.isArray(parsed.discs)
            ? parsed.discs.map((d: any, i: number) => ({
                id: d.id || `disc-${i + 1}`,
                x: Number(d.x) || 0,
                y: Number(d.y) || 0,
                radius: Number(d.radius) || 22,
                team: d.team === "player" ? "player" : "opponent",
                label: d.label || (d.team === "player" ? `P${i + 1}` : `D${i + 1}`),
              }))
            : [],
          goal: parsed.goal ? {
            x: Number(parsed.goal.x) || 0,
            y: Number(parsed.goal.y) || 0,
            width: Number(parsed.goal.width) || 80,
            height: Number(parsed.goal.height) || 20,
            side: parsed.goal.side || "top",
          } : null,
          fieldBounds: parsed.fieldBounds ? {
            x: Number(parsed.fieldBounds.x) || 0,
            y: Number(parsed.fieldBounds.y) || 0,
            width: Number(parsed.fieldBounds.width) || input.fieldWidth,
            height: Number(parsed.fieldBounds.height) || input.fieldHeight,
          } : null,
          confidence: Number(parsed.confidence) || 0.5,
          notes: parsed.notes || "",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
