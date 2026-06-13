# CLAUDE.md — AduanePa Nutrition & Meal Recommendation Platform

This file is the authoritative reference for the AI assistant working inside this codebase.
Read it fully before making any suggestions, generating code, or answering questions about the project.

---

## Project Overview

**AduanePa** (Twi: "food" / "meal") is an AI-powered Progressive Web Application (PWA) that delivers
personalized, adaptive, and culturally relevant nutrition and meal recommendations — built specifically
for Ghanaian users and the broader African diaspora.

It is a **single-user-per-account** architecture. Each registered user manages their own health profile,
meal plans, biodata logs, and dietary goals in complete isolation. There is no shared planning or
multi-user household mode in MVP scope.

The platform has three integrated subsystems:

1. **Recommendation Engine** — AI-powered meal generation with rule-based dietary constraints for
   condition-specific plans (hypertension, diabetes, weight loss, muscle gain, etc.)
2. **Health Monitoring System** — Daily logging of biodata (blood pressure, blood sugar, weight)
   and meal adherence tracking.
3. **Decision Support System** — Ingredient-based meal generation ("Make Me a Meal"), grocery list
   creation, and nutritional breakdowns.

AI is **central to the product**, not isolated to a single page. It drives meal generation, recipe
suggestions, and ingredient-based outputs. Rule-based logic handles medical constraints; AI handles
flexibility and creativity on top of those constraints.

**Target completion: 5-phase sprint (approximately 6 weeks)**

---

## Project Name

**AduanePa** — applied to `package.json`, the `<title>` tag, and the sidebar/header branding
component. Do not use a placeholder.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend + Backend | Next.js 14+ (App Router) | Single repo, fullstack |
| ORM | Prisma | All DB access goes through Prisma — never raw SQL |
| Database | Neon PostgreSQL | Serverless Postgres; use connection pooling |
| UI Components | shadcn/ui | Primary component library — prefer these over custom |
| Styling | Tailwind CSS | Utility-first; extend theme with design tokens |
| Icons | Lucide React | Use consistently — no mixing of icon libraries |
| Auth | Auth.js (NextAuth v5) | Credentials provider (email + password) |
| Charts | Recharts | Nutritional breakdowns, health metric trends |
| AI | Anthropic Claude API | Core driver of meal generation and recommendations |
| Validation | Zod | All form and API input validation |
| Toasts | Sonner | All success/error feedback — never `alert()` |
| PWA | next-pwa + Service Workers | Offline capability, installable on mobile |
| i18n | Translation API (Google or similar) | Localisation for Ghanaian languages (Twi, Ga) |

**Never introduce new dependencies without a clear reason.** If a feature can be built with the
existing stack, do not add a new library.

---

## Architecture

```
Client (Next.js React + shadcn/ui + Tailwind + Service Workers)
         ↓
Next.js API Routes  (App Router — handles all mutations and AI calls)
         ↓
Prisma ORM  (type-safe queries, schema migrations)
         ↓
Neon PostgreSQL  (cloud-hosted, serverless)

AI-powered routes (meal gen, ingredient-based gen, recommendations):
Client → /api/meals/generate        → Anthropic Claude API
Client → /api/meals/make-me-a-meal  → Anthropic Claude API
Client → /api/recommendations       → Anthropic Claude API
                                   ↗ (reads user health profile + dietary constraints from DB)
```

- Use **Next.js API Routes** for all mutations and all AI-driven endpoints.
- Keep business logic in `lib/services/` — not inline in components or route handlers.
- Never fetch data directly in Client Components. Pass as props from Server Components.
- The Anthropic API key lives **server-side only**. Never expose it to the client bundle.
- Rule-based dietary constraints are evaluated **before** the AI prompt is constructed —
  hard limits (e.g. no high-sodium foods for hypertension) are injected into the system prompt,
  not left for the model to infer.

---

## Folder Structure

Follow this structure exactly. Do not deviate without a strong reason.

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                              # Protected routes (require session)
│   │   ├── layout.tsx                      # Sidebar layout wrapper
│   │   ├── dashboard/page.tsx              # Overview: today's meals, health stats, quick actions
│   │   ├── meals/
│   │   │   ├── page.tsx                    # Current meal plan + history
│   │   │   └── [id]/page.tsx               # Single meal detail: recipe, nutrition, substitutions
│   │   ├── make-me-a-meal/page.tsx         # Ingredient-based meal generator
│   │   ├── health/
│   │   │   ├── page.tsx                    # Biodata log overview + trend charts
│   │   │   └── log/page.tsx                # Daily log entry (BP, blood sugar, weight, meals)
│   │   ├── nutrition/page.tsx              # Nutritional breakdown charts and summaries
│   │   ├── grocery/page.tsx                # Generated grocery list (aggregated + optimised)
│   │   └── settings/page.tsx              # Profile, health conditions, goals, language, appearance
│   └── api/
│       ├── meals/
│       │   ├── generate/route.ts           # POST: generate daily/weekly meal plan via Claude
│       │   └── make-me-a-meal/route.ts     # POST: ingredient-based meal generation via Claude
│       ├── recommendations/route.ts        # POST: adaptive recommendations based on user history
│       ├── nutrition/route.ts              # POST: compute nutritional breakdown for a meal/plan
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                                 # shadcn/ui generated (do not edit)
│   ├── dashboard/                          # Today's summary, health snapshot, quick-add
│   ├── meals/                              # Meal cards, plan view, recipe display, substitution modal
│   ├── make-me-a-meal/                     # Ingredient input, generated result, save/discard
│   ├── health/                             # Biodata log form, trend charts, adherence tracker
│   ├── nutrition/                          # Breakdown charts, macros display, food database search
│   ├── grocery/                            # Grocery list view, category grouping, check-off
│   └── shared/                             # Sidebar, header, theme toggle, empty states, language switcher
├── lib/
│   ├── db.ts                               # Prisma client singleton
│   ├── auth.ts                             # Auth.js config + session helpers
│   ├── nutrition.ts                        # Nutritional computation engine (per-100g + portions)
│   ├── dietary-rules.ts                    # Rule-based constraint builder (per condition/goal)
│   ├── services/
│   │   ├── users.ts                        # Profile, health conditions, goals
│   │   ├── meals.ts                        # Meal plan CRUD, recipe storage
│   │   ├── health-logs.ts                  # Biodata and adherence log queries
│   │   ├── nutrition.ts                    # Nutritional aggregation queries
│   │   ├── grocery.ts                      # Grocery list generation from meal plans
│   │   └── recommendations.ts             # Builds AI context payload from user history + profile
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                             # Seeds food database with Ghanaian staple nutritional values
└── types/
    └── index.ts                            # All shared TypeScript types
```

---

## Color Scheme

The design uses a **green-on-white** identity for light mode. Forest green (`#1A5C38`) is the
primary accent — natural, trustworthy, and grounded in Ghanaian visual culture. White and
near-white surfaces keep it clean and clinical enough for a health product.

Dark mode uses **deep forest green** (`#0D2B1A`) as the base — staying on-brand rather than
defaulting to generic charcoal.

### CSS Custom Properties (define in `app/globals.css`)

```css
:root {
  /* --- Main Brand --- */
  --color-primary:           #1A5C38;
  --color-primary-hover:     #154d2f;
  --color-primary-active:    #0f3d25;
  --color-primary-light:     #2D8653;
  --color-secondary:         #FFFFFF;
  --color-section-bg:        #F4FAF6;

  /* --- Green Scale --- */
  --color-green-1:  #F4FAF6;
  --color-green-2:  #E8F5E9;
  --color-green-3:  #C8E6C9;
  --color-green-4:  #A5D6A7;
  --color-green-5:  #81C784;
  --color-green-6:  #4CAF50;
  --color-green-7:  #2D8653;
  --color-green-8:  #1A5C38;   /* primary */
  --color-green-9:  #154d2f;
  --color-green-10: #0f3d25;
  --color-green-11: #092618;

  /* --- Neutral Grays --- */
  --color-neutral-1:  #ffffff;
  --color-neutral-2:  #f9faf9;
  --color-neutral-3:  #f0f0f0;
  --color-neutral-4:  #e0e0e0;
  --color-neutral-5:  #bdbdbd;
  --color-neutral-6:  #9e9e9e;
  --color-neutral-7:  #757575;
  --color-neutral-8:  #555555;
  --color-neutral-9:  #3d3d3d;
  --color-neutral-10: #1c1c1c;
  --color-neutral-11: #111111;

  /* --- Semantic --- */
  --color-success-bg:   #f0fdf4;
  --color-success:      #22c55e;
  --color-success-dark: #15803d;

  --color-error-bg:     #fef2f2;
  --color-error:        #f04438;
  --color-error-dark:   #b42318;

  --color-warning-bg:   #fffbeb;
  --color-warning:      #F59E0B;
  --color-warning-dark: #b45309;

  --color-info-bg:      #eff6ff;
  --color-info:         #3b82f6;
  --color-info-dark:    #1d4ed8;

  /* --- Light Mode Semantic Aliases --- */
  --bg-main:        #F4FAF6;
  --bg-card:        #ffffff;
  --bg-muted:       #f9faf9;
  --border-light:   #e0e0e0;
  --border-medium:  #bdbdbd;
  --text-primary:   #1c1c1c;
  --text-secondary: #555555;
  --text-muted:     #9e9e9e;
  --text-inverse:   #ffffff;
}

.dark {
  --bg-main:        #0D2B1A;
  --bg-card:        #122b1e;
  --bg-muted:       #1a3827;
  --border-light:   #1e4530;
  --border-medium:  #2a5c3f;
  --text-primary:   #f4faf6;
  --text-secondary: #a5d6a7;
  --text-muted:     #4CAF50;
  --text-inverse:   #0D2B1A;

  --color-primary:       #4CAF50;
  --color-primary-hover: #2D8653;
  --color-section-bg:    #122b1e;
}
```

### Tailwind Extension

Extend `tailwind.config.ts` to map these tokens:

```ts
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "var(--color-primary)",
        hover:   "var(--color-primary-hover)",
        active:  "var(--color-primary-active)",
        light:   "var(--color-primary-light)",
      },
      secondary: "var(--color-secondary)",
      "bg-main":        "var(--bg-main)",
      "bg-card":        "var(--bg-card)",
      "bg-muted":       "var(--bg-muted)",
      "text-primary":   "var(--text-primary)",
      "text-secondary": "var(--text-secondary)",
      "text-muted":     "var(--text-muted)",
      "border-light":   "var(--border-light)",
      "border-medium":  "var(--border-medium)",
    }
  }
}
```

### Theme Toggle

A dark/light mode toggle must live in the sidebar footer and the settings page. Use `next-themes`
for theme persistence. The toggle uses a Lucide `Sun` / `Moon` icon — no text labels.

---

## Database Schema

This is the canonical schema. All Prisma models must match this exactly.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ─── Enums ────────────────────────────────────────────────────────────────────

enum HealthCondition {
  HYPERTENSION
  DIABETES
  OBESITY
  NONE
}

enum DietaryGoal {
  WEIGHT_LOSS
  MUSCLE_GAIN
  MAINTENANCE
  HEART_HEALTH
  BLOOD_SUGAR_CONTROL
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}

enum LogStatus {
  PENDING
  COMPLETED
  SKIPPED
}

enum LanguagePreference {
  ENGLISH
  TWI
  GA
}

// ─── Models ───────────────────────────────────────────────────────────────────

model User {
  id                 String              @id @default(cuid())
  name               String
  email              String              @unique
  password           String                                    // bcrypt hashed
  age                Int?
  weight             Float?                                    // kg, used for nutritional targets
  height             Float?                                    // cm, used for BMI and targets
  healthConditions   HealthCondition[]
  dietaryGoal        DietaryGoal         @default(MAINTENANCE)
  language           LanguagePreference  @default(ENGLISH)
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  mealPlans          MealPlan[]
  healthLogs         HealthLog[]
  mealAdherenceLogs  MealAdherenceLog[]
  savedMeals         SavedMeal[]

  @@index([email])
}

model MealPlan {
  id          String    @id @default(cuid())
  userId      String
  date        DateTime                            // the day this plan applies to
  generatedBy String    @default("ai")            // "ai" | "manual" | "ingredient-based"
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  meals       Meal[]

  @@index([userId])
  @@index([userId, date])
}

model Meal {
  id             String    @id @default(cuid())
  mealPlanId     String
  type           MealType
  name           String
  description    String?
  ingredients    Json                              // [{ name, amount, unit }]
  instructions   Json                              // [string] — ordered steps
  calories       Int?
  proteinG       Float?
  carbsG         Float?
  fatG           Float?
  prepTimeMin    Int?
  isLocalDish    Boolean   @default(true)          // flags Ghanaian/local dishes
  createdAt      DateTime  @default(now())

  mealPlan       MealPlan  @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  adherenceLogs  MealAdherenceLog[]

  @@index([mealPlanId])
}

model SavedMeal {
  id        String   @id @default(cuid())
  userId    String
  name      String
  mealType  MealType
  data      Json                                   // full meal snapshot (ingredients, macros, etc.)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model HealthLog {
  id           String   @id @default(cuid())
  userId       String
  date         DateTime
  weight       Float?                              // kg
  bloodSugar   Float?                              // mmol/L
  bpSystolic   Int?                                // mmHg
  bpDiastolic  Int?                                // mmHg
  notes        String?
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId])
  @@index([userId, date])
}

model MealAdherenceLog {
  id        String    @id @default(cuid())
  userId    String
  mealId    String
  date      DateTime
  status    LogStatus @default(PENDING)
  notes     String?
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  meal      Meal      @relation(fields: [mealId], references: [id], onDelete: Cascade)

  @@unique([userId, mealId, date])
  @@index([userId])
  @@index([mealId])
}

model FoodItem {
  id           String  @id @default(cuid())
  name         String  @unique
  localName    String?                             // Twi/Ga name if applicable
  caloriesPer100g  Int
  proteinPer100g   Float
  carbsPer100g     Float
  fatPer100g       Float
  isLocalFood  Boolean @default(false)

  @@index([name])
}
```

### Schema Rules

- Always use `cuid()` for IDs.
- `Meal.ingredients` and `Meal.instructions` are stored as `Json` — the shape is validated at the
  service layer with Zod before write and after read.
- `HealthLog` is unique per user per day — one log entry per calendar day.
- `MealAdherenceLog` is unique per user per meal per day — prevents duplicate adherence entries.
- Every query must be scoped to `userId`. A missing `userId` filter is a data leak and a security bug.
- `FoodItem` is a shared (non-user-scoped) reference table for the nutritional computation engine.

---

## Authentication & Authorization

- Auth.js v5 with **Credentials provider** (email + password).
- Passwords are bcrypt-hashed before storage. Never store or log plain text.
- After registration, redirect to an onboarding flow that collects: age, weight, height, health
  conditions, and dietary goal. This profile data drives all AI meal generation.
- All `(app)/` routes are protected by middleware session check.
- There are no roles — every authenticated user has full access to their own data only.
- Session carries: `id`, `name`, `email`, `language`.

---

## Key Feature Specifications

### Dashboard (`/dashboard`)

The first thing a user sees after login. Must load fast and feel purposeful.

**Sections:**
- **Today's meal plan** — breakfast, lunch, dinner, snack cards with adherence checkboxes.
- **Health snapshot** — most recent biodata readings (weight, blood pressure, blood sugar) with
  trend arrows (up/down/stable vs. last 7 days).
- **Daily nutrition ring** — donut chart showing today's calories consumed vs. target.
- **Quick actions** — "Generate today's plan", "Log health data", "Make Me a Meal".

### Meal Plans (`/meals`)

- View current and past daily meal plans.
- Each plan shows all four meal slots (Breakfast / Lunch / Dinner / Snack).
- Each meal card: name, key ingredients, macros summary (calories, protein, carbs, fat),
  prep time, "Local dish" badge if `isLocalDish = true`.
- Clicking a meal opens a full recipe view with instructions, ingredient list, and a
  "Substitute ingredient" action that triggers the AI.
- User can save any generated meal to `SavedMeal` for reuse.
- "Generate Plan" button calls `/api/meals/generate` — see AI spec below.

### Make Me a Meal (`/make-me-a-meal`)

The ingredient-based meal generation feature. User enters what they have at home.

- Free-text ingredient input (with tag-style UI — add/remove ingredients as chips).
- Optional: meal type selector (Breakfast / Lunch / Dinner / Snack).
- On submit: calls `/api/meals/make-me-a-meal` with the ingredient list + user health profile.
- AI generates a contextually appropriate, culturally relevant meal using only those ingredients
  (plus common pantry staples — salt, oil, water — unless user opts out).
- Result displays: meal name, full recipe, nutritional breakdown, and a "Save Meal" action.
- If no valid meal can be formed from the ingredients given, the AI explains why and suggests
  the one additional ingredient that would unlock the most options.

### Health Monitoring (`/health`)

- Overview page: trend charts for weight, blood sugar, systolic/diastolic BP over last 30 days.
- Daily log form (`/health/log`): log weight, blood sugar, blood pressure readings for today.
  One entry per day — editing overwrites the existing log.
- Meal adherence tracker: mark each planned meal as Completed / Skipped for the day.
- Colour coding: readings within healthy range (green), borderline (amber), out of range (red).
  Thresholds are condition-aware — hypertension users have different BP thresholds highlighted.

### Nutritional Breakdown (`/nutrition`)

Static, chart-heavy analytics. No AI — clean data visualisation.

- **Macronutrient breakdown** — donut chart: calories split by protein / carbs / fat for today
  and a chosen date range.
- **Calorie trend** — line chart over the last 14 or 30 days.
- **Top foods by frequency** — horizontal bar chart of most-eaten foods/dishes.
- **Goal progress** — progress bar comparing average daily intake vs. nutritional targets.

### Grocery List (`/grocery`)

Generated from the current week's meal plan. Not AI — computed from meal ingredients.

- Aggregated list: quantities summed across all meals in the plan period.
- Grouped by food category (Vegetables, Proteins, Grains, Condiments, etc.).
- Check-off items as purchased (client-side state, no DB persistence needed for MVP).
- "Regenerate" button recalculates from the active plan.

### Settings (`/settings`)

- **Profile:** update name, email, age, weight, height.
- **Health profile:** update health conditions (multi-select) and dietary goal.
- **Password:** change password (current + new + confirm).
- **Language:** select interface language (English / Twi / Ga). Applies Translation API on change.
- **Appearance:** dark/light mode toggle.
- **Danger zone:** delete account with password confirmation — cascades all user data.

---

## AI Integration Specification

### Meal Generation (`/api/meals/generate`)

**Trigger:** User clicks "Generate Plan" on the dashboard or meals page.

**What the route does:**
1. Reads the user's full health profile from DB: age, weight, height, health conditions, dietary goal.
2. Calls `lib/dietary-rules.ts` to build hard constraint strings (e.g., "avoid high-sodium foods",
   "limit simple carbohydrates", "prioritise high-protein options").
3. Constructs a system prompt with: constraints, cultural context (Ghanaian cuisine first),
   nutritional targets (calculated from profile), and today's date.
4. Sends to `claude-sonnet-4-6` and streams the response.
5. Parses the streamed response into structured `Meal` objects and saves them to the DB.

**Output format (ask the model to respond in this JSON shape):**
```json
{
  "meals": [
    {
      "type": "BREAKFAST",
      "name": "Hausa Koko with Koose",
      "description": "...",
      "ingredients": [{ "name": "millet flour", "amount": 100, "unit": "g" }],
      "instructions": ["Step 1...", "Step 2..."],
      "calories": 320,
      "proteinG": 12,
      "carbsG": 48,
      "fatG": 8,
      "prepTimeMin": 15,
      "isLocalDish": true
    }
  ]
}
```

**AI tone:** The model should sound like a knowledgeable Ghanaian nutritionist — familiar with local
dishes, practical, and specific. No filler phrases. Never hallucinate nutritional values — if
uncertain, omit and note that values are estimates.

### Make Me a Meal (`/api/meals/make-me-a-meal`)

**Trigger:** User submits ingredient list on `/make-me-a-meal`.

**What the route does:**
1. Reads the user's health profile for constraints.
2. Sends the ingredient list + constraints to `claude-sonnet-4-6`.
3. The model generates one meal using only the given ingredients (plus salt, oil, water unless
   `strictIngredients: true` is passed).
4. If no valid meal is possible, the model must return `{ "possible": false, "suggestion": "..." }`.
5. Streams the result back to the client.

### Adaptive Recommendations (`/api/recommendations`)

**Trigger:** Runs after each health log submission and once daily in the background.

**What the route does:**
1. `lib/services/recommendations.ts` queries:
   - Last 7 days of health logs (BP, blood sugar, weight trend).
   - Last 7 days of meal adherence (what was eaten vs. planned).
   - User's health conditions and dietary goal.
2. Builds a compact JSON summary (no raw rows — aggregated only).
3. Sends to `claude-sonnet-4-6` requesting 3–5 specific, numbered, data-grounded recommendations.
4. Stores the output as a structured response and surfaces it on the dashboard.

**The model must:**
- Ground every recommendation in actual logged data ("Your average blood sugar this week was X").
- Never give generic advice that isn't connected to the user's specific numbers.
- Defer to qualified medical professionals for clinical decisions — the platform is educational,
  not a substitute for medical advice.

---

## Nutritional Computation Engine (`lib/nutrition.ts`)

- `FoodItem` table stores nutritional values per 100g for Ghanaian staple foods and common ingredients.
- `calculateMealNutrition(ingredients: Ingredient[])` — maps each ingredient to `FoodItem`, scales
  by portion size, sums macros.
- `calculateDailyTargets(user: UserProfile)` — derives calorie and macro targets from age, weight,
  height, goal, and conditions using standard formulas (Mifflin-St Jeor for TDEE).
- Seed file (`prisma/seed.ts`) must populate `FoodItem` with at minimum:
  - Common Ghanaian staples: rice, kenkey, banku, fufu, yam, plantain, kontomire, garden egg,
    tilapia, mackerel, chicken, groundnuts, palm oil, tomatoes, onions, ginger, garlic.
  - Common global staples: oats, eggs, bread, milk, beans, lentils.

---

## Dietary Rules Engine (`lib/dietary-rules.ts`)

This module converts a user's health conditions and goals into concrete constraint strings
injected into every AI system prompt.

```ts
// lib/dietary-rules.ts
export function buildDietaryConstraints(
  conditions: HealthCondition[],
  goal: DietaryGoal
): string[]

// Example output for HYPERTENSION + WEIGHT_LOSS:
// [
//   "Limit sodium to under 1500mg per day. Avoid processed foods, canned goods, and high-salt condiments.",
//   "Avoid simple carbohydrates and refined sugars. Prefer complex carbs and high-fibre options.",
//   "Target a 500-calorie daily deficit from the user's TDEE.",
//   "Prioritise potassium-rich foods: bananas, avocado, leafy greens.",
// ]
```

**Never** let the AI determine its own constraints from scratch. Always inject pre-computed,
condition-specific rules from this module.

---

## Coding Conventions

**TypeScript:** Strict mode on. No `any` — use `unknown` and narrow, or define explicit types.
All shared types live in `types/index.ts`.

**Naming:**
- Components: `PascalCase` (`MealCard.tsx`)
- Services and utilities: `camelCase` (`generateMealPlan.ts`)
- DB service files: mirror model name (`meals.ts`, `health-logs.ts`)
- Constants: `SCREAMING_SNAKE_CASE`

**Service layer pattern:**
```ts
// lib/services/meals.ts
export async function saveMealPlan(userId: string, data: unknown) {
  const parsed = SaveMealPlanSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const plan = await prisma.mealPlan.create({
    data: { userId, ...parsed.data },
  })
  return { data: plan }
}
```

**Error handling:** All errors caught at the service layer, returned as `{ error: string }`.
Never let Prisma errors surface to the client. `console.error` server-side in development.

**DB queries:** Always filter by `userId`. This is the security boundary.

```ts
// ✅ Correct
const plans = await prisma.mealPlan.findMany({ where: { userId } })

// ❌ Wrong — exposes all users' data
const plans = await prisma.mealPlan.findMany()
```

**Prisma singleton:**
```ts
// lib/db.ts
import { PrismaClient } from "@prisma/client"
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

**JSON field validation:** `Meal.ingredients` and `Meal.instructions` are `Json` in Prisma.
Always validate with Zod schemas at the service boundary before writing or after reading.

```ts
const IngredientSchema = z.object({ name: z.string(), amount: z.number(), unit: z.string() })
const IngredientsSchema = z.array(IngredientSchema)
```

---

## UI & Design Directives

- **No emojis as icons.** Use Lucide React SVG icons exclusively.
- `cursor-pointer` on all interactive elements.
- Hover states with smooth `transition-all duration-200`.
- All protected pages use a **fixed left sidebar** with icon + label navigation.
- Sidebar collapsible to icon-only on desktop. On mobile: bottom drawer/sheet.

**Component rules:**
- `Card` (shadcn/ui) for all stat containers, form panels, and data sections.
- `Badge` for statuses: health ranges (green/amber/red), meal adherence (completed/skipped/pending),
  local dish indicator.
- `Dialog` or `Sheet` for full recipe view, ingredient substitution, health log edit.
- `Sonner` for all toasts. Never `alert()` or `confirm()`.
- `Table` (shadcn/ui) for health log history. Include loading skeletons.
- `Progress` (shadcn/ui) for nutritional goal fill bars.

**Visual polish:**
- Cards use subtle shadows: `shadow-sm` in light mode, no shadow + `border border-border-light` in dark.
- Border radius: `rounded-2xl` for cards and modals, `rounded-lg` for inputs/buttons.
- Typography hierarchy:
  - Page title: `text-2xl font-bold`
  - Section heading: `text-lg font-semibold`
  - Body: `text-sm`
  - Label / caption: `text-xs text-muted`
- Primary buttons: `bg-primary text-white font-semibold` (forest green bg, white text).
- Sidebar active state: green left border + green text + subtle green-tinted background.
- Healthy readings: green (`--color-success`). Out-of-range readings: red (`--color-error`).
  Borderline: amber (`--color-warning`).

---

## Environment Variables

```
DATABASE_URL=           # Neon PostgreSQL pooled connection string
DIRECT_URL=             # Neon direct (non-pooled) connection string for migrations
NEXTAUTH_SECRET=        # 32-char random string for session signing
NEXTAUTH_URL=           # Full app URL (http://localhost:3000 in dev)
ANTHROPIC_API_KEY=      # Server-side only — never expose to client
TRANSLATION_API_KEY=    # Google Translate API or equivalent — server-side only
```

Never commit `.env.local`. Neither `ANTHROPIC_API_KEY` nor `TRANSLATION_API_KEY` must ever appear
in client bundles.

---

## Sprint Reference

| Phase | Focus |
|---|---|
| Phase 1 — Foundation | Setup, schema, auth, onboarding (health profile collection) |
| Phase 2 — Core Features | Meal generation engine, recipe display, basic UI |
| Phase 3 — Advanced Features | Nutritional computation, grocery list, Make Me a Meal |
| Phase 4 — Intelligence Layer | Health monitoring, adaptive recommendations, adherence tracking |
| Phase 5 — Optimisation | Performance tuning, PWA enhancements, localisation, UI/UX polish |

**In scope for MVP:** All features above.
**Out of scope for MVP:** Wearable device integration, real-time health monitoring, voice interaction,
bank/grocery delivery integrations, shared household plans, export to PDF/CSV.
**Stretch goals:** Wearable sync, voice-based meal logging, expanded language support, 30-day
premium diet plans, vendor partnerships.

---

## Common Pitfalls to Avoid

- **Missing `userId` in queries.** Every Prisma query on user-owned data must be scoped. This is a
  security bug.
- **Sending raw meal rows to the AI.** Build an aggregated summary in `lib/services/recommendations.ts`.
  Do not send full `Meal` objects with all fields — summarise by type, date, and macros.
- **Skipping the dietary rules engine.** Never let the AI infer constraints from the user's
  conditions alone. Always call `buildDietaryConstraints()` and inject the result into the system
  prompt.
- **Trusting AI nutritional values blindly.** The AI may estimate macros. Always flag AI-generated
  nutritional values with a note that they are estimates and may vary.
- **Exposing `ANTHROPIC_API_KEY` client-side.** All Claude API calls must happen inside server-side
  API routes.
- **Calling `new PrismaClient()` outside the singleton.** Always import from `lib/db.ts`.
- **Using `alert()` or `confirm()`.** Use shadcn/ui `Dialog` and `Sonner` toasts.
- **Forgetting dark mode.** Every component must use CSS variable-based colours so dark mode works
  via the `.dark` class toggle.
- **Hardcoding English strings.** Any user-facing string that may be translated must be extracted
  into a localisation key from day one — retrofitting i18n is painful.

---

*Keep this file up to date as the project evolves. Schema changes → update the schema section.
New conventions → add to Coding Conventions. Scope changes → update the sprint reference.*
