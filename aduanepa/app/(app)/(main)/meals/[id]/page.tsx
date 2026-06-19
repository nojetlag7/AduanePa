import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SaveMealButton } from "@/components/meals/save-meal-button"
import { SubstituteIngredient } from "@/components/meals/substitute-ingredient"
import { PageHeader } from "@/components/shared/page-header"
import { auth } from "@/lib/auth"
import {
  formatMacro,
  MEAL_TYPE_LABELS,
  parseMealIngredients,
} from "@/lib/meal-utils"
import { getMealById, isMealSaved } from "@/lib/services/meals"
import { InstructionsSchema } from "@/types"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  const meal = session?.user?.id ? await getMealById(session.user.id, id) : null
  return { title: meal ? `${meal.name} · AduanePa` : "Meal · AduanePa" }
}

export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const meal = await getMealById(session!.user!.id, id)

  if (!meal) notFound()

  const ingredients = parseMealIngredients(meal)
  const instructionsParsed = InstructionsSchema.safeParse(meal.instructions)
  const instructions = instructionsParsed.success ? instructionsParsed.data : []
  const saved = await isMealSaved(session!.user!.id, meal.id)

  return (
    <>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/meals">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to meals
          </Link>
        </Button>
      </div>

      <PageHeader
        title={meal.name}
        subtitle={meal.description ?? undefined}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{MEAL_TYPE_LABELS[meal.type]}</Badge>
        {meal.isLocalDish && (
          <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            Local dish
          </Badge>
        )}
        {meal.prepTimeMin != null && (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {meal.prepTimeMin} min
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border-light bg-bg-card p-5">
            <h2 className="font-display text-base font-semibold text-text-primary">
              Ingredients
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-text-secondary">
              {ingredients.map((item, index) => (
                <li
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-md py-1 pl-1 transition-colors hover:bg-bg-muted/50"
                >
                  <span>{item.name}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-text-muted">
                      {item.amount} {item.unit}
                    </span>
                    <SubstituteIngredient mealId={meal.id} ingredientName={item.name} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border-light bg-bg-card p-5">
            <h2 className="font-display text-base font-semibold text-text-primary">
              Instructions
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
              {instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border-light bg-bg-card p-5">
            <h2 className="font-display text-base font-semibold text-text-primary">
              Nutrition
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Calories</dt>
                <dd className="font-medium">{formatMacro(meal.calories, " kcal")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Protein</dt>
                <dd className="font-medium">{formatMacro(meal.proteinG)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Carbs</dt>
                <dd className="font-medium">{formatMacro(meal.carbsG)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Fat</dt>
                <dd className="font-medium">{formatMacro(meal.fatG)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-text-muted">
              Values are estimates. When ingredients match our FoodItem database, macros are
              calculated from Ghana/USDA reference data.
            </p>
          </section>

          <SaveMealButton mealId={meal.id} initiallySaved={saved} />
        </aside>
      </div>
    </>
  )
}
