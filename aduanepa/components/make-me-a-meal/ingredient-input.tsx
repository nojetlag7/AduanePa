"use client"

import { useState, type KeyboardEvent } from "react"
import { Loader2, Plus, Sparkles, X } from "lucide-react"
import { MealType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MEAL_TYPE_LABELS } from "@/lib/meal-utils"

const ANY_MEAL = "ANY"

export interface GeneratePayload {
  ingredients: string[]
  mealType?: MealType
  strictIngredients: boolean
}

export function IngredientInput({
  onGenerate,
  loading,
}: {
  onGenerate: (payload: GeneratePayload) => void
  loading: boolean
}) {
  const [draft, setDraft] = useState("")
  const [ingredients, setIngredients] = useState<string[]>([])
  const [mealType, setMealType] = useState<string>(ANY_MEAL)
  const [strict, setStrict] = useState(false)

  function addIngredient(raw: string) {
    const value = raw.trim().replace(/,$/, "").trim()
    if (!value) return
    const exists = ingredients.some((i) => i.toLowerCase() === value.toLowerCase())
    if (!exists) setIngredients((prev) => [...prev, value])
    setDraft("")
  }

  function removeIngredient(target: string) {
    setIngredients((prev) => prev.filter((i) => i !== target))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addIngredient(draft)
    } else if (event.key === "Backspace" && draft === "" && ingredients.length > 0) {
      removeIngredient(ingredients[ingredients.length - 1])
    }
  }

  function handleSubmit() {
    // Fold any unsubmitted text into the list before generating.
    const pending = draft.trim().replace(/,$/, "").trim()
    const finalList = pending
      ? ingredients.some((i) => i.toLowerCase() === pending.toLowerCase())
        ? ingredients
        : [...ingredients, pending]
      : ingredients

    if (finalList.length === 0) return
    setIngredients(finalList)
    setDraft("")
    onGenerate({
      ingredients: finalList,
      mealType: mealType === ANY_MEAL ? undefined : (mealType as MealType),
      strictIngredients: strict,
    })
  }

  const canGenerate = !loading && (ingredients.length > 0 || draft.trim().length > 0)

  return (
    <section className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card">
      <h2 className="font-display text-lg font-semibold text-text-primary">
        What&apos;s in your kitchen?
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Add the ingredients you have and we&apos;ll build a meal that fits your dietary needs.
      </p>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ingredient-draft">Ingredients</Label>
          <div className="flex gap-2">
            <Input
              id="ingredient-draft"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. tilapia, plantain, tomatoes"
              autoComplete="off"
              disabled={loading}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => addIngredient(draft)}
              disabled={loading || draft.trim().length === 0}
              aria-label="Add ingredient"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>

          {ingredients.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1">
              {ingredients.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-bg-muted py-1 pr-1 pl-3 text-sm text-text-primary"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeIngredient(item)}
                    disabled={loading}
                    aria-label={`Remove ${item}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-border-light hover:text-text-primary"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="meal-type">Meal type</Label>
            <Select value={mealType} onValueChange={setMealType} disabled={loading}>
              <SelectTrigger id="meal-type" className="w-full">
                <SelectValue placeholder="Any meal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_MEAL}>Any meal</SelectItem>
                {Object.values(MealType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {MEAL_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border-light p-3 sm:items-center">
              <Checkbox
                checked={strict}
                onCheckedChange={(v) => setStrict(v === true)}
                disabled={loading}
                className="mt-0.5 sm:mt-0"
              />
              <span className="text-sm">
                <span className="font-medium text-text-primary">Strict ingredients only</span>
                <span className="block text-xs text-text-muted">
                  Don&apos;t assume I have salt, oil or water.
                </span>
              </span>
            </label>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canGenerate}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {loading ? "Cooking up ideas…" : "Make me a meal"}
        </Button>
      </div>
    </section>
  )
}
