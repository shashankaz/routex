import { env } from "../../config/config.js";

export type NutritionResult = {
  calories: number;
  healthScore: number;
  isVeg: boolean;
  tags: string[];
};

type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } }
  | { image_url: { url: string } };

type GeminiRequest = {
  contents: Array<{
    parts: GeminiPart[];
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    responseMimeType: string;
    responseJsonSchema?: Record<string, unknown>;
    thinkingConfig?: {
      thinkingLevel?:
        | "THINKING_LEVEL_UNSPECIFIED"
        | "MINIMAL"
        | "LOW"
        | "MEDIUM"
        | "HIGH";
      thinkingBudget?: number;
      includeThoughts?: boolean;
    };
  };
};

type GeminiNutritionResponse = {
  calories: number;
  healthScore: number;
  isVeg: boolean;
  tags: string[];
};

async function fetchImageAsBase64(
  url: string,
): Promise<{ mime_type: string; data: string } | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return null;

    const buffer = await response.arrayBuffer();
    const data = Buffer.from(buffer).toString("base64");
    return { mime_type: contentType.split(";")[0]!, data };
  } catch {
    return null;
  }
}

function buildPrompt(dishName: string, hasImage: boolean): string {
  const imageContext = hasImage
    ? "I am also providing an image of the dish — use it to identify all visible ingredients and cooking methods."
    : "No image is available, so rely solely on the dish name and your culinary knowledge.";

  return `You are a professional nutritionist and Indian food expert.

Dish name: "${dishName}"
${imageContext}

Analyse the COMPLETE dish holistically — consider ALL ingredients that typically go into this dish (base ingredients like rice, roti, bread; proteins; vegetables; cooking medium such as oil/ghee/butter; spices; garnishes; sauces; etc.) and estimate the total nutrition for ONE standard single-serving portion.

Return ONLY a JSON object (no markdown, no explanation) with exactly these keys:
{
  "calories":    <integer, total kcal for one serving>,
  "healthScore": <number 1–10, one decimal place allowed, 10 = most healthy>,
  "isVeg":       <boolean>,
  "tags":        <array of strings from the allowed set below>
}

Rules for tags — include every tag that applies from this exact list only:
- "Veg"          — if isVeg is true
- "Non-Veg"      — if isVeg is false
- "High Protein" — if protein content is notably high for the category
- "Low Calorie"  — if calories ≤ 350 kcal per serving
- "Keto"         — if the dish is low-carb / keto-friendly
- "Healthy"      — if healthScore ≥ 8.0
- "High Carb"    — if the dish is predominantly carbohydrate-heavy
- "Spicy"        — if the dish is typically spicy
- "Indulgent"    — if the dish is rich / heavy / treat food

Important:
- Biryani must account for rice + meat/veg + masala + ghee together.
- Curries must include the gravy base (onion, tomato, oil/ghee, cream if any).
- Breads (roti, naan, paratha) must include the fat used during cooking.
- Do NOT return null or omit any key.
- calories must be a positive integer.
- healthScore must be between 1 and 10.`;
}

function fallbackNutrition(dishName: string): NutritionResult {
  const name = dishName.toLowerCase();
  const isNonVeg = [
    "chicken",
    "mutton",
    "lamb",
    "beef",
    "pork",
    "fish",
    "prawn",
    "shrimp",
    "egg",
    "keema",
    "meat",
    "tuna",
    "salmon",
    "crab",
    "lobster",
  ].some((t) => name.includes(t));

  return {
    calories: 400,
    healthScore: 6.0,
    isVeg: !isNonVeg,
    tags: [isNonVeg ? "Non-Veg" : "Veg"],
  };
}

const nutritionResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["calories", "healthScore", "isVeg", "tags"],
  properties: {
    calories: {
      type: "integer",
      minimum: 1,
      description: "Total calories for one serving.",
    },
    healthScore: {
      type: "number",
      minimum: 1,
      maximum: 10,
      description: "Health score from 1 to 10.",
    },
    isVeg: {
      type: "boolean",
      description: "Whether the dish is vegetarian.",
    },
    tags: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "Veg",
          "Non-Veg",
          "High Protein",
          "Low Calorie",
          "Keto",
          "Healthy",
          "High Carb",
          "Spicy",
          "Indulgent",
        ],
      },
      description: "Applicable tags from the allowed set.",
    },
  },
  propertyOrdering: ["calories", "healthScore", "isVeg", "tags"],
} as const;

function extractJsonPayload(rawText: string): string | null {
  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    const fencedText = fencedMatch[1].trim();
    const startIndex = fencedText.indexOf("{");
    const endIndex = fencedText.lastIndexOf("}");

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      return fencedText.slice(startIndex, endIndex + 1);
    }

    return fencedText;
  }

  const startIndex = rawText.indexOf("{");
  const endIndex = rawText.lastIndexOf("}");

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return rawText.slice(startIndex, endIndex + 1);
  }

  return null;
}

export async function estimateNutrition(
  dishName: string,
  mediaUrl?: string | null,
): Promise<NutritionResult> {
  const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

  let imageData: { mime_type: string; data: string } | null = null;
  if (mediaUrl) {
    imageData = await fetchImageAsBase64(mediaUrl);
  }

  const parts: GeminiPart[] = [];

  if (imageData) {
    parts.push({ inline_data: imageData });
  }

  parts.push({ text: buildPrompt(dishName, imageData !== null) });

  const requestBody: GeminiRequest = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 1,
      maxOutputTokens: 256,
      responseMimeType: "application/json",
      responseJsonSchema: nutritionResponseSchema,
      thinkingConfig: {
        thinkingLevel: "MINIMAL",
        includeThoughts: false,
      },
    },
  };

  let rawText = "";
  try {
    const response = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI] Gemini API error:", response.status, errText);
      return fallbackNutrition(dishName);
    }

    const json = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    console.log("[AI] Gemini response:", JSON.stringify(json, null, 2));

    rawText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!rawText) {
      console.error("[AI] Gemini returned empty content");
      return fallbackNutrition(dishName);
    }
  } catch (err) {
    console.error("[AI] Gemini fetch failed:", err);
    return fallbackNutrition(dishName);
  }

  try {
    const cleaned = extractJsonPayload(rawText) ?? rawText.trim();

    const parsed = JSON.parse(cleaned) as Partial<GeminiNutritionResponse>;

    const calories = Math.max(1, Math.round(Number(parsed.calories ?? 400)));
    const healthScore = Math.max(
      1,
      Math.min(10, parseFloat(Number(parsed.healthScore ?? 6).toFixed(1))),
    );
    const isVeg = Boolean(parsed.isVeg);
    const tags: string[] = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t) => typeof t === "string")
      : [isVeg ? "Veg" : "Non-Veg"];

    if (!tags.includes("Veg") && !tags.includes("Non-Veg")) {
      tags.unshift(isVeg ? "Veg" : "Non-Veg");
    }

    return { calories, healthScore, isVeg, tags };
  } catch (err) {
    console.error("[AI] Failed to parse Gemini response:", rawText, err);
    return fallbackNutrition(dishName);
  }
}
