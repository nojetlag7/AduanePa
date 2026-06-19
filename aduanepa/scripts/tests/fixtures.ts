/**
 * Deterministic mock AI payloads — shaped exactly like Gemini's JSON output.
 * Tests feed these through our Zod schemas + macro logic so we verify parsing
 * and shaping without spending tokens or relying on the network.
 */

/** A valid four-meal plan as the model would return it. */
export const MOCK_MEAL_PLAN = {
  meals: [
    {
      type: "BREAKFAST",
      name: "Hausa koko with koose",
      description: "Spiced millet porridge with bean fritters.",
      ingredients: [
        { name: "millet flour", amount: 60, unit: "g" },
        { name: "koose", amount: 80, unit: "g" },
      ],
      instructions: ["Cook the millet porridge.", "Fry the koose.", "Serve warm."],
      calories: 420,
      proteinG: 14,
      carbsG: 70,
      fatG: 9,
      prepTimeMin: 25,
      isLocalDish: true,
    },
    {
      type: "LUNCH",
      name: "Jollof rice with grilled tilapia",
      description: "Classic Ghanaian jollof with lean grilled fish.",
      ingredients: [
        { name: "White rice (cooked)", amount: 200, unit: "g" },
        { name: "tilapia", amount: 150, unit: "g" },
      ],
      instructions: ["Cook the jollof.", "Grill the tilapia.", "Plate together."],
      calories: 650,
      proteinG: 38,
      carbsG: 80,
      fatG: 18,
      prepTimeMin: 45,
      isLocalDish: true,
    },
    {
      type: "DINNER",
      name: "Kontomire stew with boiled yam",
      description: "Cocoyam-leaf stew served with yam.",
      ingredients: [
        { name: "kontomire", amount: 120, unit: "g" },
        { name: "yam", amount: 200, unit: "g" },
      ],
      instructions: ["Prepare the stew.", "Boil the yam.", "Serve."],
      calories: 540,
      proteinG: 18,
      carbsG: 88,
      fatG: 14,
      prepTimeMin: 40,
      isLocalDish: true,
    },
    {
      type: "SNACK",
      name: "Roasted groundnuts",
      description: "A handful of protein-rich roasted groundnuts.",
      ingredients: [{ name: "groundnuts", amount: 40, unit: "g" }],
      instructions: ["Roast and serve."],
      calories: 230,
      proteinG: 10,
      carbsG: 7,
      fatG: 19,
      prepTimeMin: 5,
      isLocalDish: true,
    },
  ],
}

/** Make-Me-a-Meal: a possible result. */
export const MOCK_MMAM_POSSIBLE = {
  possible: true,
  meal: {
    type: "DINNER",
    name: "Grilled tilapia with plantain",
    description: "Lean grilled fish with boiled ripe plantain.",
    ingredients: [
      { name: "tilapia", amount: 150, unit: "g" },
      { name: "plantain", amount: 180, unit: "g" },
    ],
    instructions: ["Grill the tilapia.", "Boil the plantain.", "Serve together."],
    calories: 480,
    proteinG: 34,
    carbsG: 60,
    fatG: 10,
    prepTimeMin: 30,
    isLocalDish: true,
  },
}

/** Make-Me-a-Meal: an impossible result. */
export const MOCK_MMAM_IMPOSSIBLE = {
  possible: false,
  suggestion: "Add a protein source like eggs, beans, or fish to make a balanced meal.",
}

/** Ingredient substitution result. */
export const MOCK_SUBSTITUTE = {
  substitute: "Brown rice (cooked)",
  reason: "Brown rice has a lower glycaemic index, better for blood-sugar control.",
}

/** Simulates Gemini wrapping JSON in markdown fences (we must strip these). */
export function wrapInFences(payload: unknown): string {
  return "```json\n" + JSON.stringify(payload) + "\n```"
}
