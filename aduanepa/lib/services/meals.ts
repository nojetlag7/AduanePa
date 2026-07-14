import { MealPlanSource, MealType, type Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { sanitizeMealJson } from "@/lib/meal-utils"
import type { GeneratedMeal, MealPlanWithMeals } from "@/types"

export type SaveMealInput = {
  name: string
  mealType: MealType
  data: Prisma.InputJsonValue
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export async function saveMealPlan(
  userId: string,
  date: Date,
  meals: GeneratedMeal[],
  generatedBy: MealPlanSource = MealPlanSource.AI
): Promise<MealPlanWithMeals> {
  const planDate = startOfDay(date)

  return prisma.$transaction(async (tx) => {
    await tx.mealPlan.deleteMany({
      where: { userId, date: planDate },
    })

    return tx.mealPlan.create({
      data: {
        userId,
        date: planDate,
        generatedBy,
        meals: {
          create: meals.map((meal) => ({
            type: meal.type,
            name: meal.name,
            description: meal.description,
            ingredients: meal.ingredients,
            instructions: meal.instructions,
            calories: meal.calories,
            proteinG: meal.proteinG,
            carbsG: meal.carbsG,
            fatG: meal.fatG,
            prepTimeMin: meal.prepTimeMin,
            isLocalDish: meal.isLocalDish,
          })),
        },
      },
      include: { meals: true },
    })
  })
}

export async function getMealPlanByDate(
  userId: string,
  date: Date
): Promise<MealPlanWithMeals | null> {
  const planDate = startOfDay(date)
  const plan = await prisma.mealPlan.findFirst({
    where: { userId, date: planDate },
    include: { meals: true },
    orderBy: { createdAt: "desc" },
  })
  if (!plan) return null
  return {
    ...plan,
    meals: plan.meals.map(sanitizeMealJson),
  }
}

export async function listMealPlans(
  userId: string,
  limit = 14
): Promise<MealPlanWithMeals[]> {
  const plans = await prisma.mealPlan.findMany({
    where: { userId },
    include: { meals: true },
    orderBy: { date: "desc" },
    take: limit,
  })
  return plans.map((plan) => ({
    ...plan,
    meals: plan.meals.map(sanitizeMealJson),
  }))
}

export async function getMealById(userId: string, mealId: string) {
  const meal = await prisma.meal.findFirst({
    where: {
      id: mealId,
      mealPlan: { userId },
    },
    include: { mealPlan: true },
  })
  return meal ? sanitizeMealJson(meal) : null
}

export async function saveMeal(userId: string, meal: SaveMealInput) {
  return prisma.savedMeal.create({
    data: {
      userId,
      name: meal.name,
      mealType: meal.mealType,
      data: meal.data,
    },
  })
}

export async function listSavedMeals(userId: string) {
  return prisma.savedMeal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

export async function deleteSavedMeal(userId: string, savedMealId: string) {
  const result = await prisma.savedMeal.deleteMany({
    where: { id: savedMealId, userId },
  })
  return result.count > 0
}

export async function isMealSaved(userId: string, mealId: string): Promise<boolean> {
  const ids = await getSavedSourceMealIds(userId)
  return ids.has(mealId)
}

/** Meal IDs referenced by `SavedMeal.data.sourceMealId` for the user. */
export async function getSavedSourceMealIds(userId: string): Promise<Set<string>> {
  const saved = await prisma.savedMeal.findMany({
    where: { userId },
    select: { data: true },
  })

  const ids = new Set<string>()
  for (const row of saved) {
    if (row.data && typeof row.data === "object" && !Array.isArray(row.data)) {
      const sourceMealId = (row.data as { sourceMealId?: string }).sourceMealId
      if (sourceMealId) ids.add(sourceMealId)
    }
  }
  return ids
}
