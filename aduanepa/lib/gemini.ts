import "server-only"
import { GoogleGenAI } from "@google/genai"

const globalForGemini = globalThis as unknown as { gemini: GoogleGenAI }

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set")
  return new GoogleGenAI({ apiKey })
}

export const gemini = globalForGemini.gemini ?? createGeminiClient()

if (process.env.NODE_ENV !== "production") {
  globalForGemini.gemini = gemini
}

export const GEMINI_MODEL = "gemini-2.5-flash"

/** Strip optional markdown fences from model JSON output. */
export function extractJsonFromModelText(text: string): string {
  const trimmed = text.trim()
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/i.exec(trimmed)
  if (fenced?.[1]) return fenced[1].trim()

  const inline = /```json\s*([\s\S]*?)```/i.exec(trimmed)
  if (inline?.[1]) return inline[1].trim()

  return trimmed
}

export async function generateGeminiText(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  })

  const text = response.text
  if (!text) throw new Error("Empty response from Gemini")
  return text
}
