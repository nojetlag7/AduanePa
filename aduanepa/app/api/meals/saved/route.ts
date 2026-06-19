import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getMealById, saveMeal, isMealSaved } from "@/lib/services/meals"
import { SaveMealSchema } from "@/lib/validations/meals"
import { IngredientsSchema, InstructionsSchema } from "@/types"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = SaveMealSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  // ── Ad-hoc meal (Make Me a Meal): save the snapshot directly ──────────────
  if ("meal" in parsed.data) {
    const { meal } = parsed.data
    const saved = await saveMeal(session.user.id, {
      name: meal.name,
      mealType: meal.type,
      data: {
        name: meal.name,
        description: meal.description,
        type: meal.type,
        ingredients: meal.ingredients,
        instructions: meal.instructions,
        calories: meal.calories,
        proteinG: meal.proteinG,
        carbsG: meal.carbsG,
        fatG: meal.fatG,
        prepTimeMin: meal.prepTimeMin,
        isLocalDish: meal.isLocalDish,
      },
    })
    return NextResponse.json({ saved: true, savedMealId: saved.id })
  }

  // ── Reference an existing DB meal by id ───────────────────────────────────
  const meal = await getMealById(session.user.id, parsed.data.mealId)
  if (!meal) {
    return NextResponse.json({ error: "Meal not found" }, { status: 404 })
  }

  const alreadySaved = await isMealSaved(session.user.id, meal.id)
  if (alreadySaved) {
    return NextResponse.json({ saved: true, alreadySaved: true })
  }

  const ingredients = IngredientsSchema.safeParse(meal.ingredients)
  const instructions = InstructionsSchema.safeParse(meal.instructions)

  const saved = await saveMeal(session.user.id, {
    name: meal.name,
    mealType: meal.type,
    data: {
      sourceMealId: meal.id,
      name: meal.name,
      description: meal.description,
      type: meal.type,
      ingredients: ingredients.success ? ingredients.data : [],
      instructions: instructions.success ? instructions.data : [],
      calories: meal.calories,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatG: meal.fatG,
      prepTimeMin: meal.prepTimeMin,
      isLocalDish: meal.isLocalDish,
    },
  })

  return NextResponse.json({ saved: true, savedMealId: saved.id })
}
