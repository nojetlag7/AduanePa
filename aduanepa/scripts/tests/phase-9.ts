import {
  categorizeIngredient,
  generateGroceryList,
  GROCERY_CATEGORIES,
} from "@/lib/services/grocery"
import {
  getMacroBreakdown,
  getNutritionTrend,
  getTopFoods,
} from "@/lib/services/nutrition"
import type { Tester } from "./harness"
import { fileExists, getTestUser } from "./util"

export const meta = {
  phase: 9,
  title: "Nutritional Breakdown & Grocery List",
  implemented: true,
}

export async function run(t: Tester) {
  t.section("Files")
  t.check("nutrition page", fileExists("app/(app)/(main)/nutrition/page.tsx"))
  t.check("grocery page", fileExists("app/(app)/(main)/grocery/page.tsx"))
  t.check("grocery service", fileExists("lib/services/grocery.ts"))
  t.check("macro-donut", fileExists("components/nutrition/macro-donut.tsx"))
  t.check("calorie-trend-chart", fileExists("components/nutrition/calorie-trend-chart.tsx"))
  t.check("top-foods-chart", fileExists("components/nutrition/top-foods-chart.tsx"))
  t.check("goal-progress-bar", fileExists("components/nutrition/goal-progress-bar.tsx"))
  t.check("grocery-list", fileExists("components/grocery/grocery-list.tsx"))

  t.section("Ingredient categorization (pure)")
  t.check("proteins → Proteins", categorizeIngredient("Tilapia Fish") === "Proteins", {
    weight: 2,
    critical: true,
  })
  t.check("chicken → Proteins", categorizeIngredient("chicken breast") === "Proteins")
  t.check("rice → Grains & Starches", categorizeIngredient("Jasmine Rice") === "Grains & Starches", {
    weight: 2,
  })
  t.check("yam → Grains & Starches", categorizeIngredient("yam") === "Grains & Starches")
  t.check("tomato → Vegetables & Fruit", categorizeIngredient("Tomatoes") === "Vegetables & Fruit", {
    weight: 2,
  })
  t.check("kontomire → Vegetables & Fruit", categorizeIngredient("kontomire") === "Vegetables & Fruit")
  t.check("salt → Condiments & Spices", categorizeIngredient("salt") === "Condiments & Spices", {
    weight: 2,
  })
  t.check("palm oil → Condiments & Spices", categorizeIngredient("Palm Oil") === "Condiments & Spices")
  t.check(
    "unknown → Other",
    categorizeIngredient("unobtanium crystals") === "Other",
    { weight: 2, critical: true }
  )

  t.section("Services against test user (DB)")
  const user = await getTestUser()
  if (!user) {
    t.check("services exercised against test user", false, {
      weight: 2,
      detail: "no test user — run npm run test:seed-user",
    })
    return
  }

  const today = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 29)

  const trend = await getNutritionTrend(user.id, 14).catch(() => null)
  t.check(
    "getNutritionTrend(14) returns 14 ordered points",
    Array.isArray(trend) &&
      trend.length === 14 &&
      trend.every((p) => typeof p.calories === "number" && typeof p.date === "string"),
    { weight: 2, critical: true }
  )

  const trend30 = await getNutritionTrend(user.id, 30).catch(() => null)
  t.check("getNutritionTrend(30) returns 30 points", Array.isArray(trend30) && trend30.length === 30)

  const breakdown = await getMacroBreakdown(user.id, start, today).catch(() => null)
  t.check(
    "getMacroBreakdown returns macro shape",
    !!breakdown &&
      ["calories", "proteinG", "carbsG", "fatG", "daysWithData"].every((k) => k in breakdown),
    { weight: 2, critical: true }
  )

  const topFoods = await getTopFoods(user.id, 10).catch(() => null)
  t.check(
    "getTopFoods returns a sorted, capped list",
    Array.isArray(topFoods) &&
      topFoods.length <= 10 &&
      topFoods.every((f) => typeof f.name === "string" && typeof f.count === "number") &&
      topFoods.every((f, i) => i === 0 || topFoods[i - 1].count >= f.count),
    { weight: 2 }
  )

  const groceries = await generateGroceryList(user.id).catch(() => null)
  t.check(
    "generateGroceryList returns valid categorized groups",
    Array.isArray(groceries) &&
      groceries.every(
        (g) =>
          (GROCERY_CATEGORIES as readonly string[]).includes(g.category) &&
          Array.isArray(g.items) &&
          g.items.every(
            (it) =>
              typeof it.name === "string" &&
              typeof it.amount === "number" &&
              typeof it.unit === "string"
          )
      ),
    { weight: 2, critical: true }
  )
}
