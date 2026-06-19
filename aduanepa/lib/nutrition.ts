import { DietaryGoal } from "@prisma/client"
import { prisma } from "@/lib/db"
import type { Ingredient, MacroTotals, NutritionalTargets, UserProfile } from "@/types"

/** MVP default — no activity level on User yet. */
const SEDENTARY_ACTIVITY_MULTIPLIER = 1.2

const WEIGHT_LOSS_DEFICIT_KCAL = 500
const MUSCLE_GAIN_SURPLUS_KCAL = 300

/** Common shorthand → seeded `FoodItem.name` */
const INGREDIENT_ALIASES: Record<string, string> = {
  // Rice & grains
  rice: "White rice (cooked)",
  "white rice": "White rice (cooked)",
  "cooked rice": "White rice (cooked)",
  "brown rice": "Brown rice (cooked)",
  millet: "Millet (cooked)",
  "millet flour": "Millet flour",
  "millet porridge": "Hausa koko (millet porridge)",
  "hausa koko": "Hausa koko (millet porridge)",
  koko: "Hausa koko (millet porridge)",
  maize: "Cornmeal (yellow, dry)",
  "corn flour": "Maize flour (white)",
  "cornmeal": "Cornmeal (yellow, dry)",
  corn: "Sweet corn (boiled)",
  gari: "Gari (dry)",
  eba: "Eba (gari, prepared)",
  sorghum: "Sorghum flour",
  oats: "Oats (rolled, dry)",

  // Staples
  plantain: "Plantain (ripe, boiled)",
  "ripe plantain": "Plantain (ripe, boiled)",
  "green plantain": "Plantain (green, boiled)",
  "fried plantain": "Plantain (fried)",
  "kelewele": "Plantain (fried)",
  yam: "Yam (boiled)",
  banku: "Banku",
  kenkey: "Kenkey",
  dokono: "Kenkey",
  fufu: "Fufu (cassava & plantain)",
  fufuo: "Fufu (cassava & plantain)",
  cassava: "Cassava (boiled)",
  bankye: "Cassava (boiled)",
  cocoyam: "Cocoyam (boiled)",
  mankani: "Cocoyam (boiled)",
  taro: "Cocoyam (boiled)",

  // Legumes
  beans: "Beans (red kidney, cooked)",
  "red beans": "Beans (red kidney, cooked)",
  "kidney beans": "Beans (red kidney, cooked)",
  cowpeas: "Cowpeas (black-eyed, cooked)",
  "black-eyed peas": "Cowpeas (black-eyed, cooked)",
  "black eyed peas": "Cowpeas (black-eyed, cooked)",
  waakye: "Waakye beans",
  lentils: "Lentils (cooked)",

  // Proteins
  tilapia: "Tilapia (grilled)",
  apatre: "Tilapia (grilled)",
  fish: "Tilapia (grilled)",
  mackerel: "Mackerel (smoked)",
  salmon: "Mackerel (smoked)",
  "smoked fish": "Dried fish (smoked)",
  momoni: "Dried fish (smoked)",
  chicken: "Chicken (skinless, cooked)",
  akoko: "Chicken (skinless, cooked)",
  goat: "Goat meat (cooked)",
  "goat meat": "Goat meat (cooked)",
  beef: "Beef (lean, cooked)",
  egg: "Eggs (boiled)",
  eggs: "Eggs (boiled)",
  shrimp: "Shrimp (cooked)",
  sardines: "Sardines (canned in oil)",

  // Vegetables & greens
  kontomire: "Kontomire (cocoyam leaves)",
  spinach: "Spinach (cooked)",
  okra: "Okra (boiled)",
  nkruma: "Okra (boiled)",
  tomato: "Tomatoes",
  tomatoes: "Tomatoes",
  "tomato paste": "Tomato paste",
  onion: "Onions",
  onions: "Onions",
  gyeene: "Onions",
  pepper: "Scotch bonnet pepper",
  "chili pepper": "Scotch bonnet pepper",
  "scotch bonnet": "Scotch bonnet pepper",
  mako: "Scotch bonnet pepper",
  "garden egg": "Garden egg",
  eggplant: "Garden egg",
  nyaadewa: "Garden egg",
  cabbage: "Cabbage (raw)",
  carrot: "Carrot (raw)",
  cucumber: "Cucumber (raw)",

  // Fats, nuts & condiments
  "palm oil": "Palm oil",
  "groundnut": "Groundnuts (roasted)",
  groundnuts: "Groundnuts (roasted)",
  peanuts: "Groundnuts (roasted)",
  nkate: "Groundnuts (roasted)",
  nkateɛ: "Groundnuts (roasted)",
  cashew: "Cashew nuts (roasted)",
  "coconut milk": "Coconut milk (canned)",
  coconut: "Coconut (fresh meat)",
  shito: "Shito (pepper sauce)",
  ginger: "Ginger",
  garlic: "Garlic",
  oil: "Vegetable oil",
  "vegetable oil": "Vegetable oil",

  // Snacks & street food
  koose: "Koose (bean fritter)",
  akara: "Koose (bean fritter)",

  // Fruits
  banana: "Banana",
  kwadu: "Banana",
  orange: "Orange",
  mango: "Mango",
  avocado: "Avocado",

  // Other
  bread: "Bread (white)",
  milk: "Milk (whole)",
  sugar: "Sugar (granulated)",
  honey: "Honey",
  "sweet potato": "Sweet potato (boiled)",
}

function ageFromDateOfBirth(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDelta = today.getMonth() - dateOfBirth.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1
  }
  return age
}

/**
 * Mifflin–St Jeor BMR (male formula used when sex is not on the profile).
 * Returns null when required biodata is missing.
 */
function calculateBmr(weightKg: number, heightCm: number, ageYears: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5
}

function roundMacro(value: number): number {
  return Math.round(value * 10) / 10
}

function roundCalories(value: number): number {
  return Math.round(value)
}

function macroSplitFromCalories(
  calories: number,
  proteinRatio: number,
  carbsRatio: number,
  fatRatio: number
): Pick<NutritionalTargets, "proteinG" | "carbsG" | "fatG"> {
  return {
    proteinG: roundMacro((calories * proteinRatio) / 4),
    carbsG: roundMacro((calories * carbsRatio) / 4),
    fatG: roundMacro((calories * fatRatio) / 9),
  }
}

/**
 * Daily calorie and macro targets from profile biodata and dietary goal.
 * Uses Mifflin–St Jeor + sedentary activity multiplier for MVP.
 */
export function calculateDailyTargets(user: UserProfile): NutritionalTargets | null {
  if (user.dateOfBirth == null || user.weight == null || user.height == null) {
    return null
  }

  const age = ageFromDateOfBirth(user.dateOfBirth)
  const bmr = calculateBmr(user.weight, user.height, age)
  const tdee = bmr * SEDENTARY_ACTIVITY_MULTIPLIER

  let calories = tdee
  let proteinRatio = 0.25
  let carbsRatio = 0.45
  let fatRatio = 0.3

  switch (user.dietaryGoal) {
    case DietaryGoal.WEIGHT_LOSS:
      calories = tdee - WEIGHT_LOSS_DEFICIT_KCAL
      proteinRatio = 0.3
      carbsRatio = 0.4
      fatRatio = 0.3
      break
    case DietaryGoal.MUSCLE_GAIN:
      calories = tdee + MUSCLE_GAIN_SURPLUS_KCAL
      proteinRatio = 0.3
      carbsRatio = 0.45
      fatRatio = 0.25
      break
    case DietaryGoal.HEART_HEALTH:
      proteinRatio = 0.25
      carbsRatio = 0.45
      fatRatio = 0.3
      break
    case DietaryGoal.BLOOD_SUGAR_CONTROL:
      proteinRatio = 0.28
      carbsRatio = 0.42
      fatRatio = 0.3
      break
    case DietaryGoal.MAINTENANCE:
    default:
      break
  }

  calories = Math.max(calories, 1200)

  const macros = macroSplitFromCalories(calories, proteinRatio, carbsRatio, fatRatio)

  if (user.dietaryGoal === DietaryGoal.MUSCLE_GAIN) {
    const proteinFloor = roundMacro(user.weight * 1.8)
    if (macros.proteinG < proteinFloor) {
      macros.proteinG = proteinFloor
    }
  }

  return {
    calories: roundCalories(calories),
    ...macros,
  }
}

/** Convert portion amount to grams; returns null for unsupported units. */
export function portionToGrams(amount: number, unit: string): number | null {
  const normalised = unit.toLowerCase().trim()

  if (normalised === "g" || normalised === "gram" || normalised === "grams") {
    return amount
  }
  if (normalised === "kg" || normalised === "kilogram" || normalised === "kilograms") {
    return amount * 1000
  }
  if (
    normalised === "ml" ||
    normalised === "millilitre" ||
    normalised === "millilitres" ||
    normalised === "milliliter" ||
    normalised === "milliliters"
  ) {
    return amount
  }
  if (normalised === "mg") {
    return amount / 1000
  }

  return null
}

function resolveFoodName(name: string, lookup: Map<string, string>): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null

  const lower = trimmed.toLowerCase()
  if (lookup.has(lower)) return lookup.get(lower)!

  const alias = INGREDIENT_ALIASES[lower]
  if (alias) {
    const aliasLower = alias.toLowerCase()
    if (lookup.has(aliasLower)) return lookup.get(aliasLower)!
  }

  return null
}

async function buildFoodLookup(): Promise<Map<string, string>> {
  const items = await prisma.foodItem.findMany({
    select: { name: true, localName: true },
  })

  const map = new Map<string, string>()
  for (const item of items) {
    map.set(item.name.toLowerCase(), item.name)
    if (item.localName) {
      map.set(item.localName.toLowerCase(), item.name)
    }
  }

  for (const [alias, canonical] of Object.entries(INGREDIENT_ALIASES)) {
    if (map.has(canonical.toLowerCase())) {
      map.set(alias.toLowerCase(), canonical)
    }
  }

  return map
}

/**
 * Sum macros for a list of ingredients using `FoodItem` per-100g values.
 * Returns null if any ingredient name or unit cannot be resolved.
 */
export async function calculateMealNutrition(
  ingredients: Ingredient[]
): Promise<MacroTotals | null> {
  if (ingredients.length === 0) return null

  const lookup = await buildFoodLookup()
  const canonicalNames = new Set<string>()

  for (const ingredient of ingredients) {
    const canonical = resolveFoodName(ingredient.name, lookup)
    if (!canonical) return null

    const grams = portionToGrams(ingredient.amount, ingredient.unit)
    if (grams == null || grams <= 0) return null

    canonicalNames.add(canonical)
  }

  const foods = await prisma.foodItem.findMany({
    where: { name: { in: [...canonicalNames] } },
  })
  const foodByName = new Map(foods.map((f) => [f.name, f]))

  let calories = 0
  let proteinG = 0
  let carbsG = 0
  let fatG = 0

  for (const ingredient of ingredients) {
    const canonical = resolveFoodName(ingredient.name, lookup)!
    const food = foodByName.get(canonical)
    if (!food) return null

    const grams = portionToGrams(ingredient.amount, ingredient.unit)!
    const scale = grams / 100

    calories += food.caloriesPer100g * scale
    proteinG += food.proteinPer100g * scale
    carbsG += food.carbsPer100g * scale
    fatG += food.fatPer100g * scale
  }

  return {
    calories: roundCalories(calories),
    proteinG: roundMacro(proteinG),
    carbsG: roundMacro(carbsG),
    fatG: roundMacro(fatG),
  }
}
