import { prisma } from "@/lib/db"
import { parseMealIngredients, startOfDay } from "@/lib/meal-utils"

export const GROCERY_CATEGORIES = [
  "Vegetables & Fruit",
  "Proteins",
  "Grains & Starches",
  "Condiments & Spices",
  "Other",
] as const

export type GroceryCategory = (typeof GROCERY_CATEGORIES)[number]

export interface GroceryItem {
  name: string
  /** Aggregated amount across the week for this name + unit. */
  amount: number
  unit: string
}

export interface GroceryGroup {
  category: GroceryCategory
  items: GroceryItem[]
}

const CATEGORY_KEYWORDS: Record<Exclude<GroceryCategory, "Other">, string[]> = {
  "Vegetables & Fruit": [
    "tomato", "onion", "pepper", "garden egg", "garden eggs", "okro", "okra",
    "spinach", "kontomire", "cocoyam leaves", "cabbage", "carrot", "lettuce",
    "cucumber", "ginger", "garlic", "plantain", "banana", "orange", "mango",
    "pineapple", "pawpaw", "papaya", "avocado", "apple", "lime", "lemon",
    "leaf", "leaves", "ayoyo", "alefu", "kale", "eggplant", "spring onion",
    "shallot", "scotch bonnet", "chili", "chilli", "vegetable", "fruit",
  ],
  Proteins: [
    "chicken", "beef", "goat", "mutton", "pork", "fish", "tilapia", "salmon",
    "tuna", "mackerel", "herring", "sardine", "shrimp", "prawn", "crab",
    "egg", "eggs", "turkey", "guinea fowl", "snail", "wele", "cow", "tripe",
    "liver", "gizzard", "sausage", "beans", "cowpea", "soya", "tofu",
    "groundnut", "peanut", "agushie", "agushi", "egusi", "milk", "yogurt",
    "yoghurt", "cheese", "protein",
  ],
  "Grains & Starches": [
    "rice", "yam", "cassava", "gari", "garri", "fufu", "banku", "kenkey",
    "tuo", "tz", "maize", "corn", "millet", "wheat", "flour", "bread",
    "spaghetti", "pasta", "noodle", "macaroni", "oats", "potato", "kokonte",
    "ampesi", "cocoyam", "semolina", "couscous", "starch",
  ],
  "Condiments & Spices": [
    "salt", "sugar", "oil", "palm oil", "vegetable oil", "coconut oil",
    "stock", "cube", "maggi", "seasoning", "curry", "thyme", "nutmeg",
    "clove", "cinnamon", "bay leaf", "pepper sauce", "shito", "tomato paste",
    "tomato puree", "vinegar", "soy sauce", "honey", "spice", "powder",
    "dawadawa", "prekese", "anise", "mustard", "ketchup", "mayonnaise",
  ],
}

export function categorizeIngredient(name: string): GroceryCategory {
  const lower = name.trim().toLowerCase()
  if (!lower) return "Other"

  for (const category of Object.keys(CATEGORY_KEYWORDS) as Exclude<
    GroceryCategory,
    "Other"
  >[]) {
    for (const keyword of CATEGORY_KEYWORDS[category]) {
      if (lower === keyword || lower.includes(keyword)) return category
    }
  }
  return "Other"
}

function titleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Aggregate ingredients from the current calendar week's (Mon–Sun) meal plans
 * into a categorised, deduplicated grocery list. Amounts with matching units
 * are summed; differing units for the same ingredient are kept as separate rows.
 */
export async function generateGroceryList(userId: string): Promise<GroceryGroup[]> {
  const today = startOfDay(new Date())
  // Monday as the start of the week.
  const weekStart = new Date(today)
  const dayOffset = (today.getDay() + 6) % 7
  weekStart.setDate(today.getDate() - dayOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const plans = await prisma.mealPlan.findMany({
    where: { userId, date: { gte: weekStart, lte: weekEnd } },
    include: { meals: { select: { ingredients: true } } },
  })

  // key = `${lowerName}|${lowerUnit}` → aggregated row
  const aggregated = new Map<string, GroceryItem>()
  for (const plan of plans) {
    for (const meal of plan.meals) {
      for (const ingredient of parseMealIngredients(meal)) {
        const name = ingredient.name.trim()
        if (!name) continue
        const unit = ingredient.unit.trim().toLowerCase()
        const key = `${name.toLowerCase()}|${unit}`
        const existing = aggregated.get(key)
        if (existing) {
          existing.amount = Math.round((existing.amount + ingredient.amount) * 100) / 100
        } else {
          aggregated.set(key, {
            name: titleCase(name),
            amount: Math.round(ingredient.amount * 100) / 100,
            unit: ingredient.unit.trim(),
          })
        }
      }
    }
  }

  const grouped = new Map<GroceryCategory, GroceryItem[]>()
  for (const item of aggregated.values()) {
    const category = categorizeIngredient(item.name)
    const bucket = grouped.get(category) ?? []
    bucket.push(item)
    grouped.set(category, bucket)
  }

  return GROCERY_CATEGORIES.flatMap((category) => {
    const items = grouped.get(category)
    if (!items || items.length === 0) return []
    items.sort((a, b) => a.name.localeCompare(b.name))
    return [{ category, items }]
  })
}
