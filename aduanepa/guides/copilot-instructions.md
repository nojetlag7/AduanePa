# AduanePa — Copilot / AI Coding Instructions

> Rules derived from real patterns and pitfalls relevant to this codebase. Follow every rule here
> before submitting any code. When in doubt, grep the existing codebase for the established pattern
> and copy it.

---

## 1. Server → Client Component Boundary

### 1.1 Never pass functions as props from Server Components
Functions are not serializable. Only plain data (strings, numbers, booleans, plain objects, arrays)
can cross the boundary.

```tsx
// ❌ WRONG — crashes at runtime
<ClientComponent onSuccess={() => redirect("/dashboard")} />

// ✅ CORRECT — handle navigation inside the Client Component
// In the client component, call useRouter().push("/dashboard") directly
```

The only exception is **Server Actions** — functions explicitly marked `"use server"`. Those can be
passed as props.

### 1.2 Never pass Json fields raw from Prisma as props
`Meal.ingredients` and `Meal.instructions` are stored as Prisma `Json`. They are not typed —
they come back as `unknown`. Always Zod-parse them at the service boundary before passing to
any Client Component.

```tsx
// ❌ WRONG — client receives untyped Json, TypeScript gives false safety
<RecipeSheet ingredients={meal.ingredients} />

// ✅ CORRECT — parse at the service layer before the page map
const parsed = IngredientsSchema.parse(meal.ingredients)
<RecipeSheet ingredients={parsed} />
```

### 1.3 Never import server-only modules in Client Components
Files with `"use client"` must not import from `lib/db.ts`, `lib/auth.ts`, `lib/services/*`,
`lib/dietary-rules.ts`, `lib/nutrition.ts`, or `lib/email.ts`. If you need data in a Client
Component, fetch it in the Server Component and pass it as props.

---

## 2. API Routes Must Never Return Raw Prisma Objects

API routes send their return value across the network to the browser. Returning a raw Prisma
result can expose unintended fields, unserializable types, or more data than the client needs.

**Rule:** Never `return result` directly from an API route. Strip and shape the return value
to exactly what the client needs.

```ts
// ❌ WRONG — returns full Prisma object, may include sensitive fields
export async function POST(req: Request) {
  const plan = await saveMealPlan(userId, data)
  return Response.json(plan)
}

// ✅ CORRECT — return only what the client renders
export async function POST(req: Request) {
  const result = await saveMealPlan(userId, data)
  if (result.error) return Response.json({ error: result.error }, { status: 400 })
  return Response.json({ planId: result.data.id, meals: result.data.meals.map(shapeMeal) })
}
```

---

## 3. Data Shape Contracts — Server Pages → Client Components

When a Server Component page maps data to pass to a Client Component, the mapped shape must
include **every field the client will need for all operations** — including forms, edits, and
actions.

**Checklist before finalising a server data map:**
- Does the client have an edit form? → Include raw unformatted values alongside display strings
- Does the client send an ID to an API route? → Include the correct model ID
- Are any numeric fields needed for calculation? → Pass as `number`, not formatted strings

```tsx
// ❌ WRONG — client tries to edit a health log but can't because it's missing the raw values
const logs = data.map((log) => ({
  id: log.id,
  weight: `${log.weight} kg`,         // formatted — useless for a number input
}))

// ✅ CORRECT
const logs = data.map((log) => ({
  id: log.id,
  weight: `${log.weight} kg`,         // display string
  weightRaw: log.weight,              // raw number for the form input
  date: log.date.toISOString(),       // serializable — never pass Date objects
}))
```

---

## 4. Navigation Links — Only Link to Routes That Exist

Before writing any `<Link href="...">` or `router.push("...")`, verify the target route file
exists in `app/`.

```tsx
// ❌ WRONG — /meals/[id] does not exist yet
<Link href={`/meals/${meal.id}`}>...</Link>

// ✅ CORRECT — link to the list page until the detail page is built
<Link href="/meals">...</Link>
```

**Never nest a `<button>` inside a `<Link>` (`<a>`)** — it is invalid HTML and causes click
events to bubble unexpectedly. If a meal card needs both navigation and a "Save" button, make
the card a `<div>` and add a separate navigating element, or stop the event with
`e.stopPropagation()`.

---

## 5. React / Next.js Hook Rules

### 5.1 `useSearchParams()` requires a Suspense boundary
Any component that calls `useSearchParams()` must be wrapped in `<Suspense>` by its parent.

```tsx
// In the parent Server Component:
<Suspense fallback={<Loading />}>
  <ClientThatUsesSearchParams />
</Suspense>
```

### 5.2 Always destructure both values from `useTransition`

```tsx
// ❌ WRONG — startTransition is never available
const [isPending] = useTransition()

// ✅ CORRECT
const [isPending, startTransition] = useTransition()
```

### 5.3 Remove unused imports
Unused hook imports cause lint errors and create confusion. Delete them before submitting.

---

## 6. Form & Dialog UX Rules

### 6.1 Never run success-path code when an API route returns `{ error }`
Always return early after handling an error. The dialog or form should stay open so the user
can see the problem and retry.

```tsx
// ❌ WRONG — form resets even on failure
const result = await generateMeal(data)
if (result.error) toast.error(result.error)
reset()
setOpen(false)

// ✅ CORRECT — early return on error
const result = await generateMeal(data)
if (result.error) {
  toast.error(result.error)
  return
}
toast.success("Meal plan generated")
reset()
setOpen(false)
```

### 6.2 Show field-level errors, not only toasts
Validation errors from Zod must appear as inline `<p>` elements below the relevant field.
A toast alone is not enough — the user has no idea which field to fix.

### 6.3 Disable submit while an AI call is in flight
AI API calls can take 3–10 seconds. The submit button must be disabled and show a loading
indicator during this window. Never let the user submit twice.

```tsx
<Button disabled={isGenerating}>
  {isGenerating ? <Loader2 className="animate-spin" /> : "Generate Plan"}
</Button>
```

---

## 7. AI API Rules

### 7.1 Always call `buildDietaryConstraints()` before constructing any AI prompt
The dietary rules engine is the safety layer. Never call the Gemini API for meal generation
without first injecting constraints from `lib/dietary-rules.ts`.

```ts
// ❌ WRONG — no constraints, model guesses what's appropriate for a diabetic user
const prompt = `Generate a meal plan for a user with diabetes.`

// ✅ CORRECT — constraints are explicit and injected into the system prompt
const constraints = buildDietaryConstraints(user.healthConditions, user.dietaryGoal)
const systemPrompt = `
  You are a Ghanaian nutritionist. Generate meal plans using local foods first.
  The user has the following hard dietary constraints — follow them without exception:
  ${constraints.map((c, i) => `${i + 1}. ${c}`).join("\n")}
`
```

### 7.2 The GEMINI_API_KEY must never reach the client
All calls to the Gemini API happen inside API routes (`app/api/`). Never import
`@google/genai` in a Client Component or a shared `lib/` file that a Client Component
could import.

### 7.3 Never send raw Prisma rows to the AI
Build aggregated summaries for recommendation context. Do not send full `Meal` objects,
full `HealthLog` arrays, or full `MealAdherenceLog` arrays as AI context.

```ts
// ❌ WRONG — sends hundreds of raw rows to the model
const logs = await prisma.healthLog.findMany({ where: { userId } })
const context = JSON.stringify(logs)

// ✅ CORRECT — aggregated summary only
const context = await buildRecommendationContext(userId)
// → { avgBloodSugar: 7.2, avgWeight: 82.4, bpTrend: "rising", adherenceRate: 0.71, ... }
```

### 7.4 Always request structured JSON output from the AI
Every AI route that needs to parse a result must instruct the model to respond in a specific
JSON shape and strip/validate the output before saving to DB.

```ts
// In the system prompt:
"Respond ONLY with a valid JSON object matching this exact schema. No preamble, no markdown fences."

// After receiving the response:
try {
  const raw = response.content[0].text.replace(/```json|```/g, "").trim()
  const parsed = MealPlanResponseSchema.parse(JSON.parse(raw))
} catch (e) {
  return Response.json({ error: "Failed to parse AI response" }, { status: 500 })
}
```

### 7.5 Nutritional values from AI are estimates — flag them
If the AI returns nutritional values (calories, macros), always store them but surface a
disclaimer in the UI that these are estimates. The `FoodItem` table is the authoritative
source — use `calculateMealNutrition()` from `lib/nutrition.ts` when accuracy matters.

---

## 8. Health Data Rules

### 8.1 One health log per user per day — always upsert, never create
The `HealthLog` table has a unique constraint on `[userId, date]`. Always call `upsertHealthLog()`.
Never call `prisma.healthLog.create()` directly for a daily log.

```ts
// ❌ WRONG — crashes on second submission for the same day
await prisma.healthLog.create({ data: { userId, date, weight } })

// ✅ CORRECT
await prisma.healthLog.upsert({
  where: { userId_date: { userId, date } },
  update: { weight, bloodSugar, bpSystolic, bpDiastolic, notes },
  create: { userId, date, weight, bloodSugar, bpSystolic, bpDiastolic, notes },
})
```

### 8.2 Dates passed as props must be serialized to ISO strings
Never pass `Date` objects as props from Server Components to Client Components.
`Date` is not serializable across the Server/Client boundary.

```tsx
// ❌ WRONG — runtime serialization error
<HealthLogForm existingLog={{ date: log.date }} />

// ✅ CORRECT
<HealthLogForm existingLog={{ date: log.date.toISOString() }} />
```

### 8.3 Health reading thresholds are condition-aware
The colour-coding of health readings (green / amber / red) must respect the user's conditions.
Do not apply generic thresholds to all users.

```ts
// Systolic BP thresholds:
// General: green < 120, amber 120–139, red ≥ 140
// Hypertension users: green < 130, amber 130–139, red ≥ 140 (tighter)
```

---

## 9. Charts & Nutrition Display Rules

### 9.1 Guard against division by zero in percentage calculations

```tsx
// ❌ WRONG — shows "Infinity%" when targetCalories is 0
const pct = ((consumed / targetCalories) * 100).toFixed(1)

// ✅ CORRECT
const pct = targetCalories > 0
  ? ((consumed / targetCalories) * 100).toFixed(1)
  : "0.0"
```

### 9.2 All charts must be theme-aware
Never hardcode hex colors in chart components. Use CSS variable values or pass colors from
the design token set so charts recolor correctly in dark mode.

```tsx
// ❌ WRONG
<Cell fill="#1A5C38" />

// ✅ CORRECT — read from CSS variables or pass as a themed prop
const green = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-primary").trim()
<Cell fill={green} />
```

### 9.3 All charts use `ResponsiveContainer`

```tsx
// ✅ CORRECT — always
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>...</LineChart>
</ResponsiveContainer>
```

---

## 10. CSS / Positioning Rules

### 10.1 Absolutely-positioned children need a `relative` parent
Any element using `absolute` positioning (tooltips, overlays, badges) will escape to the
nearest positioned ancestor. If no ancestor has `relative`, it will fly to an unexpected location.

```tsx
// ❌ WRONG
<div className="aspect-square ...">
  <div className="absolute ...">Badge</div>
</div>

// ✅ CORRECT
<div className="relative aspect-square ...">
  <div className="absolute ...">Badge</div>
</div>
```

### 10.2 Dark mode — use CSS variables only
Never use a hardcoded hex in any component. Every color must come from a CSS variable or
Tailwind alias defined in `tailwind.config.ts`. The `.dark` class on `<html>` flips the
variables — hardcoded colors will not flip.

---

## 11. Type Safety Rules

### 11.1 Never use `as any` to resolve a type mismatch
Fix the actual mismatch — trace the type from its source and correct the interface or the
value being passed.

```tsx
// ❌ WRONG
const ingredient = props.payload as any

// ✅ CORRECT
const ingredient = props.payload as { name: string; amount: number; unit: string }
```

### 11.2 When a shared type changes, update all consumers
If you add or remove a field from a shared type (e.g. `MealCardData`, `HealthSnapshot`,
`RecommendationItem`), immediately search for every file that constructs or destructures
that type and update them all. TypeScript errors are the signal — do not suppress with casts.

### 11.3 `Meal.ingredients` and `Meal.instructions` are `unknown` after Prisma read
Always Zod-parse them before use. Do not assume the shape is correct just because the seed
data was written correctly.

---

## 12. Quick Pre-Commit Checklist

Before marking any task done, run through this list:

- [ ] Does this component cross the Server/Client boundary? → Are all props plain serializable values?
- [ ] Are any `Json` fields (ingredients, instructions) being passed as props? → Zod-parse them at the service layer first
- [ ] Are any `Date` objects in props? → Convert to `.toISOString()` before passing
- [ ] Does any `<Link>` or `router.push` point to a route that actually exists in `app/`?
- [ ] Does any component call `useSearchParams()`? → Ensure a `<Suspense>` wrapper exists in the parent
- [ ] Does any `useTransition` omit `startTransition`?
- [ ] Does any form or dialog close/reset on the error path?
- [ ] Does any AI call skip `buildDietaryConstraints()`? → This is mandatory for every meal generation call
- [ ] Does any AI route return raw Prisma rows as context? → Aggregate before sending
- [ ] Does any chart compute a percentage? → Guard the denominator against zero
- [ ] Does any chart hardcode a hex color? → Use CSS variables
- [ ] Does any `absolute`-positioned element have a `relative` parent?
- [ ] Is `GEMINI_API_KEY` or `TRANSLATION_API_KEY` referenced in any client-side file?
- [ ] Are there unused imports? → Remove them
- [ ] `npm run build` passes cleanly with zero TypeScript errors
