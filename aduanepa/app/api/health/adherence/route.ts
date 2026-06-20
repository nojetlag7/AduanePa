import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { parseDateInput } from "@/lib/meal-utils"
import { getMealById } from "@/lib/services/meals"
import { upsertAdherence } from "@/lib/services/health-logs"
import { AdherenceSchema } from "@/lib/validations/health"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = AdherenceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { mealId, status, date } = parsed.data

  // Ownership check — only allow logging adherence for the user's own meals.
  const meal = await getMealById(session.user.id, mealId)
  if (!meal) {
    return NextResponse.json({ error: "Meal not found" }, { status: 404 })
  }

  const log = await upsertAdherence(
    session.user.id,
    mealId,
    parseDateInput(date),
    status
  )

  return NextResponse.json({ log })
}
