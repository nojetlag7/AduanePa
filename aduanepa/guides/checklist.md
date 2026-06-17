# AduanePa — Project Checklist

This checklist tracks sprint execution progress phase by phase.
Mark tasks `[x]` as they are completed. Do not skip ahead — each phase has exit criteria
that must pass before the next phase begins.

---

## Overall Status

- [x] Phase 0 — Project Scaffold & Tooling
- [x] Phase 1 — Database Schema & Migrations
- [x] Phase 2 — Authentication
- [x] Phase 3 — App Shell & Layout
- [x] Phase 4 — Onboarding Flow
- [x] Phase 5 — Dietary Rules & Nutritional Engine
- [ ] Phase 6 — Meal Generation API
- [ ] Phase 7 — Meal UI & Dashboard
- [ ] Phase 8 — Make Me a Meal
- [ ] Phase 9 — Nutritional Breakdown & Grocery List
- [ ] Phase 10 — Health Monitoring
- [ ] Phase 11 — Meal Adherence & Adaptive Recommendations
- [ ] Phase 12 — Settings Page
- [ ] Phase 13 — PWA & Localisation
- [ ] Phase 14 — Hardening, Accessibility & Final QA

---

## Phase 0 — Project Scaffold & Tooling

### 0.1 Project scaffold
- [ ] Next.js 14+ app created with App Router and TypeScript
- [ ] `strict` mode enabled in `tsconfig.json`
- [ ] ESLint configured (`.eslintrc.json`)
- [ ] Prettier configured (`.prettierrc`)
- [ ] Tailwind CSS installed and configured (`tailwind.config.ts`)
- [ ] `next-themes` installed for dark/light mode
- [ ] `next-pwa` installed for PWA support

### 0.2 Dependencies installed
- [ ] Runtime: `@prisma/client`, `zod`, `next-auth`, `bcryptjs`, `lucide-react`, `sonner`, `recharts`, `@google/genai`
- [ ] Dev: `prisma`
- [ ] Tailwind plugins: `tailwindcss-animate`

### 0.3 shadcn/ui initialised
- [ ] `npx shadcn@latest init` run
- [ ] Base components installed: `button`, `card`, `input`, `label`, `badge`, `dialog`, `sheet`, `table`, `progress`, `select`, `dropdown-menu`, `avatar`, `separator`, `skeleton`, `tabs`, `tooltip`, `checkbox`

### 0.4 Design tokens applied
- [ ] Full CSS variable set defined in `app/globals.css` (light + dark mode — see `claude.md`)
- [ ] Tailwind config extended with token aliases (`primary`, `bg-main`, `bg-card`, `text-muted`, etc.)
- [ ] Dark mode class strategy set to `class` in `tailwind.config.ts`
- [ ] Base interactive defaults set globally: `cursor-pointer`, `transition-all duration-200`
- [ ] `:focus-visible` ring style defined using `--color-primary`

### 0.5 Environment & Prisma initialised
- [ ] `prisma/schema.prisma` created with datasource + generator block
- [ ] `lib/db.ts` singleton added
- [ ] `.env.local` created with: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GEMINI_API_KEY`, `TRANSLATION_API_KEY`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`
- [ ] `.env.local` added to `.gitignore`

### 0.6 PWA bootstrap
- [ ] `public/manifest.json` created: `name`, `short_name`, icons, `theme_color: #1A5C38`, `background_color: #F4FAF6`
- [ ] App icons generated at 192×192 and 512×512
- [ ] Service Worker registered via `next-pwa` in `next.config.ts`
- [ ] Offline fallback page created at `app/offline/page.tsx`

### 0.7 Exit criteria
- [ ] `npx prisma validate` passes (empty schema is fine at this stage)
- [ ] `npm run build` passes on the clean scaffold
- [ ] `npm run lint` passes with zero warnings
- [ ] App opens at `localhost:3000` without errors
- [ ] Manifest and Service Worker visible in Chrome DevTools → Application tab

---

## Phase 1 — Database Schema & Migrations

### 1.1 Enums
- [x] `HealthCondition`: `HYPERTENSION`, `DIABETES`, `OBESITY`, `NONE`
- [x] `DietaryGoal`: `WEIGHT_LOSS`, `MUSCLE_GAIN`, `MAINTENANCE`, `HEART_HEALTH`, `BLOOD_SUGAR_CONTROL`
- [x] `MealType`: `BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`
- [x] `LogStatus`: `PENDING`, `COMPLETED`, `SKIPPED`
- [x] `LanguagePreference`: `ENGLISH`, `TWI`, `GA`
- [x] `ThemePreference`: `LIGHT`, `DARK`, `SYSTEM`
- [x] `MeasurementSystem`: `METRIC`, `IMPERIAL`
- [x] `MealPlanSource`: `AI`, `MANUAL`, `INGREDIENT_BASED`

### 1.2 Models
- [x] `User` — id, name, email, password, dateOfBirth (@db.Date), weight, height, healthConditions, dietaryGoal, language, theme, measurementSystem, notificationsEnabled, emailVerified, emailVerifiedAt, timestamps
- [x] `MealPlan` — id, userId, date (@db.Date), generatedBy (MealPlanSource), createdAt; relation to `User` and `Meal[]`
- [x] `Meal` — id, mealPlanId, type, name, description, ingredients (Json), instructions (Json), macros (incl. fiberG, sodiumMg), prepTimeMin, isLocalDish, createdAt
- [x] `SavedMeal` — id, userId, name, mealType, data (Json), createdAt
- [x] `HealthLog` — id, userId, date (@db.Date), weight, bloodSugar, bpSystolic, bpDiastolic, notes, createdAt
- [x] `MealAdherenceLog` — id, userId, mealId, date (@db.Date), status, notes, createdAt
- [x] `FoodItem` — id, name, localName, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g, sodiumMg100g, potassiumMg100g, isLocalFood
- [x] `EmailOtp` — id, userId, email, code (bcrypt hashed), expiresAt, usedAt, createdAt
- [x] `Recommendation` — id, userId, items (Json), generatedAt; relation to `User`

### 1.3 Constraints & indexes
- [x] `cuid()` used for all IDs
- [x] `HealthLog` unique constraint: `@@unique([userId, date])`
- [x] `MealAdherenceLog` unique constraint: `@@unique([userId, mealId, date])`
- [x] `FoodItem` unique constraint: `@@unique([name])`
- [x] All indexes added per `claude.md` schema section
- [x] Cascade deletes set on all `userId` foreign keys

### 1.4 Migration & seed
- [x] Initial migration run: `npx prisma migrate dev --name init`
- [x] Prisma client regenerated: `npx prisma generate`
- [x] `prisma/seed.ts` written with `FoodItem` records:
  - [x] Ghanaian staples: rice, kenkey, banku, fufu, yam, plantain, kontomire, garden egg, tilapia, mackerel, chicken, groundnuts, palm oil, tomatoes, onions, ginger, garlic
  - [x] Global staples: oats, eggs, bread, milk, beans, lentils
- [x] Seed script run: `npx prisma db seed` (23 records seeded)

### 1.5 Shared Zod schemas
- [x] `IngredientSchema` and `IngredientsSchema` defined in `types/index.ts`
- [x] `InstructionsSchema` (array of strings) defined in `types/index.ts`
- [x] All shared TypeScript types derived from Prisma models defined in `types/index.ts`

### 1.6 Exit criteria
- [x] `npx prisma validate` passes with all models
- [x] FoodItem table populated (23 records confirmed via seed output; `npx prisma studio` available)
- [x] `npm run build` passes

---

## Phase 2 — Authentication

### 2.1 Auth configuration
- [x] `lib/auth.ts` — Auth.js v5 with Credentials provider (email + password)
- [x] `lib/auth.config.ts` — edge-safe config (no Prisma/bcrypt) for middleware; jwt/session callbacks
- [x] `app/api/auth/[...nextauth]/route.ts` — route handler
- [x] `types/next-auth.d.ts` — session type extended with `id`, `language`, `theme`, `measurementSystem`, `isEmailVerified`

### 2.2 Email service
- [x] `lib/email.ts` — Brevo transactional email via `@getbrevo/brevo` v5 `BrevoClient`
- [x] `sendOtpEmail(to: string, code: string)` — sends branded OTP email; subject: "Your AduanePa verification code"
- [x] `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` used server-side only (`server-only` import) — never in client bundle

### 2.3 OTP service
- [x] `lib/services/otp.ts`:
  - [x] `generateOtp(userId, email)` — 6-digit code, bcrypt-hashed, saved to `EmailOtp` (10min expiry); invalidates prior unused OTPs first
  - [x] `verifyOtp(userId, code)` — finds latest unused unexpired OTP, compares bcrypt hash, marks `usedAt`
  - [x] `invalidateOtps(userId)` — marks all existing OTPs `usedAt` (prevents replay)
  - [x] Rate limit: max 3 OTP sends per hour per user (query `EmailOtp.createdAt` count)

### 2.4 Register flow
- [x] `app/api/auth/register/route.ts` — POST: Zod-validate, bcrypt-hash password, create `User` (`emailVerified: false`), generate OTP, send via Brevo, return `{ userId }`
- [x] `app/(auth)/register/page.tsx`
- [x] `components/auth/auth-panel.tsx` (unified sign in / sign up) — sign-up fields: name, email, password (+ strength meter), confirm password; field-level Zod errors

### 2.5 Email verification flow
- [x] `app/api/auth/verify-email/route.ts` — POST: session-authenticated, receives `{ code }`, calls `verifyOtp`, sets `emailVerified: true` + `emailVerifiedAt`, returns success
- [x] `app/(auth)/verify-email/page.tsx` — shows 6-digit OTP input; "Resend code" button (rate-limited, 30s cooldown)
- [x] `components/auth/verify-email-form.tsx` — 6 separate digit inputs (auto-advance, paste support); field-level errors; spinner on submit
- [x] Resend OTP: dedicated `/api/auth/resend-otp` route

**Post-verify redirect loop fix (dev notes):**
- **Symptom:** After OTP verify, user stuck on `/verify-email` with repeated `307` redirects, or `500` when syncing session from the page.
- **Root cause:** Email was marked verified in Postgres, but the JWT cookie still had `isEmailVerified: false`. The verify-email *page* trusted the DB and redirected to `/onboarding`, while `proxy.ts` only reads the JWT and sent the user back to `/verify-email`.
- **Fixes applied:**
  - `lib/session-patch.ts` — `readSessionPatch()` reads flat or nested `user` fields from Auth.js `update` payloads (avoids circular import with `auth.config.ts`).
  - `lib/session-sync.ts` + `GET /api/auth/sync-session` — refresh JWT claims from the DB inside a **Route Handler** (Next.js 16 does not allow cookie writes from Server Components).
  - `app/(auth)/verify-email/page.tsx` — if DB says verified but JWT is stale, redirect through `/api/auth/sync-session?redirect=…` instead of calling `unstable_update` in the page.
  - `components/auth/verify-email-form.tsx` — after successful OTP POST, navigate via `/api/auth/sync-session?redirect=/onboarding`.
  - `lib/auth.ts` jwt callback — on `trigger: "update"`, re-read `emailVerified` / profile fields from Prisma.
  - `lib/db.ts` — normalize `sslmode=require` → `sslmode=verify-full` to silence the `pg` SSL deprecation warning.

### 2.6 Login flow
- [x] `app/(auth)/login/page.tsx`
- [x] `components/auth/auth-panel.tsx` (unified sign in / sign up, animated segmented toggle) — sign-in fields: email, password; field-level Zod errors
- [x] Successful login: proxy routes unverified → `/verify-email`; verified + incomplete profile → `/onboarding`; complete → `/dashboard`

### 2.7 Route protection
- [x] `proxy.ts` (Next 16 rename of `middleware.ts`) — protects all `(app)/` routes; unauthenticated → `/login`; unverified email → `/verify-email`
- [x] Authenticated + verified requests to `/login`, `/register`, `/verify-email` redirect to `/dashboard`

### 2.8 Exit criteria
- [x] Register flow: Zod-validated, creates user, generates + emails OTP via Brevo *(live email delivery pending manual run)*
- [x] Duplicate email registration returns a clear error (409 → inline field error)
- [x] OTP entry verifies the user and redirects to `/onboarding`
- [x] Expired OTP (> 10 min) returns a clear error
- [x] Wrong OTP returns a clear error
- [x] "Resend code" sends a fresh OTP and invalidates the previous one
- [x] Unverified user visiting `(app)/` routes is redirected to `/verify-email`
- [x] User can log in with correct credentials after verification
- [x] Wrong password returns a clear error
- [x] Unauthenticated visit to `/dashboard` redirects to `/login`
- [x] `BREVO_API_KEY` does not appear in any client bundle (`server-only` enforced; build output clean)
- [x] `npm run build` passes

---

## Phase 3 — App Shell & Layout

### 3.1 Protected layout
- [x] `app/(app)/layout.tsx` — wraps all protected pages with sidebar + main content area (server-side `auth()` guard; renders `AppShell`)
- [x] `next-themes` `ThemeProvider` wrapping the app in `app/layout.tsx` (already configured in Phase 0/2)
- [x] `components/shared/app-shell.tsx` — client shell managing desktop collapse + mobile drawer

### 3.2 Sidebar component (`components/shared/sidebar.tsx`)
- [x] Logo / "AduanePa" wordmark at top
- [x] Navigation links with Lucide icons:
  - [x] Dashboard (`/dashboard`) — `LayoutDashboard`
  - [x] My Meals (`/meals`) — `UtensilsCrossed`
  - [x] Make Me a Meal (`/make-me-a-meal`) — `ChefHat`
  - [x] Health (`/health`) — `HeartPulse`
  - [x] Nutrition (`/nutrition`) — `Apple`
  - [x] Grocery List (`/grocery`) — `ShoppingBasket`
  - [x] Settings (`/settings`) — `Settings`
- [x] Active state: green left border + green text + subtle green-tinted background (`bg-primary/10`)
- [x] Collapsible to icon-only on desktop (persisted via `localStorage`, hydration-safe `useSyncExternalStore`; icon tooltips when collapsed)
- [x] Mobile: drawer using shadcn/ui `Sheet` (left side)
- [x] Dark/light toggle in sidebar footer (Lucide `Sun` / `Moon`, no text label; CSS-driven, hydration-safe)
- [x] User avatar + name in sidebar footer (initials fallback + sign out)

### 3.3 Shared utility components
- [x] `components/shared/empty-state.tsx` — icon, heading, body text, optional CTA button
- [x] `components/shared/loading-state.tsx` — full-page centered spinner
- [x] `components/shared/page-header.tsx` — page title + optional subtitle and action slot
- [x] `app/(app)/loading.tsx` — protected route loading UI
- [x] `app/(app)/error.tsx` — error boundary for protected routes

### 3.4 Public landing page
- [x] `app/page.tsx` — hero value prop, sign in + register CTAs, features, how-it-works, final CTA, footer
- [x] Renders without authentication
- [x] Value prop copy in English (Twi version added in Phase 13)

### 3.5 Exit criteria
- [x] Sidebar renders correctly in light and dark mode (semantic design tokens throughout)
- [x] All nav links are present and highlight correctly on active route
- [x] Sidebar collapses to icon-only on desktop
- [x] Mobile bottom drawer opens and closes correctly
- [x] Dark/light toggle switches theme and persists across page refresh
- [x] `npm run build` passes (lint clean, 18 routes compiled)

---

## Phase 4 — Onboarding Flow

### 4.1 Onboarding detection
- [x] After registration, `User` has no `dateOfBirth`/`weight`/`height` set → redirect to `/onboarding`
- [x] `proxy.ts` checks `isProfileComplete` in JWT; incomplete profile → `/onboarding` before any `(main)/` route
- [x] Returning users with complete profile skip onboarding entirely

### 4.2 Onboarding page (`app/(app)/onboarding/page.tsx`)
- [x] Multi-step form — progress indicator shows current step (Step X of 4)
- [x] Step 1 — Basic profile:
  - [x] Date of birth (required; validates age 10–120)
  - [x] Weight in kg (number, required)
  - [x] Height in cm (number, required)
  - [x] Zod validation: weight 20–300, height 50–250
- [x] Step 2 — Health conditions:
  - [x] Multi-select checkboxes from `HealthCondition` enum (HYPERTENSION, DIABETES, OBESITY)
  - [x] "None of the above" option that clears all others (stores `[NONE]`)
- [x] Step 3 — Dietary goal:
  - [x] Single-select radio cards from `DietaryGoal` enum
  - [x] Each option has a short plain-language description
- [x] Step 4 — Language preference:
  - [x] Single-select: English / Twi / Ga
  - [x] Note: "You can change this anytime in Settings"
- [x] On complete: saves all fields to `User` via `PATCH /api/users/profile`, redirects to `/dashboard`
- [x] Back button navigates to previous step without losing entered data

### 4.3 User profile service
- [x] `lib/services/users.ts`:
  - [x] `getUserProfile(userId)` — returns full user record
  - [x] `updateUserProfile(userId, data)` — Zod-validated; updates profile fields
  - [x] `isProfileComplete(user)` — in `lib/profile.ts`; returns boolean (`dateOfBirth` + weight + height all set)
  - [x] All queries scoped to `userId`

### 4.4 Exit criteria
- [x] New user is redirected to `/onboarding` after email verification
- [x] Stepping back preserves entered data
- [x] "None of the above" for health conditions clears other selections
- [x] Completed profile is saved to DB and readable via Prisma Studio
- [x] After onboarding, user lands on `/dashboard` and does not see onboarding again on refresh
- [x] `npm run build` passes

---

## Phase 5 — Dietary Rules & Nutritional Engine

### 5.1 Dietary rules engine (`lib/dietary-rules.ts`)
- [x] `buildDietaryConstraints(conditions: HealthCondition[], goal: DietaryGoal): string[]`
- [x] Constraints defined for `HYPERTENSION`: low sodium, potassium-rich foods, limit processed foods
- [x] Constraints defined for `DIABETES`: low glycaemic index, limit simple carbs, fibre-rich options
- [x] Constraints defined for `OBESITY`: calorie deficit, high satiety foods, limit refined sugars
- [x] Constraints defined for `WEIGHT_LOSS`: 500-calorie deficit from TDEE, high protein
- [x] Constraints defined for `MUSCLE_GAIN`: calorie surplus, high protein target (1.6–2.2g/kg body weight)
- [x] Constraints defined for `HEART_HEALTH`: low saturated fat, omega-3 rich, high fibre
- [x] Constraints defined for `BLOOD_SUGAR_CONTROL`: low GI, complex carbs only, regular meal timing
- [x] Combined constraints from conditions + goal are deduplicated before return
- [x] Unit tests (or manual verification log) covering each condition + goal combination — `scripts/verify-phase5.ts`

### 5.2 Nutritional computation engine (`lib/nutrition.ts`)
- [x] `calculateDailyTargets(user: UserProfile): NutritionalTargets`
  - [x] Uses Mifflin-St Jeor formula for BMR
  - [x] Applies activity multiplier (default: sedentary 1.2 for MVP)
  - [x] Adjusts calorie target based on `DietaryGoal` (deficit / surplus / maintenance)
  - [x] Derives protein, carb, fat gram targets from calorie total and goal ratios
- [x] `calculateMealNutrition(ingredients: Ingredient[]): MacroTotals`
  - [x] Maps each ingredient name to `FoodItem` in DB
  - [x] Scales per-100g values by the given portion amount
  - [x] Sums calories, protein, carbs, fat across all ingredients
  - [x] Returns `null` for unrecognised ingredient names (does not throw)
- [x] Return types (`NutritionalTargets`, `MacroTotals`) defined in `types/index.ts`

### 5.3 Exit criteria
- [x] `buildDietaryConstraints(["HYPERTENSION"], "WEIGHT_LOSS")` returns at least 4 non-empty constraint strings
- [x] `calculateDailyTargets` returns sensible calorie targets for a range of test profiles (verify manually)
- [x] `calculateMealNutrition` correctly scales a known ingredient (e.g. 200g of rice) against the seeded `FoodItem` record
- [x] Unrecognised ingredient returns `null` gracefully — no crash
- [x] `npm run build` passes

---

## Phase 6 — Meal Generation API

### 6.1 Meal generation route (`app/api/meals/generate/route.ts`)
- [ ] POST handler — session-authenticated; reads `userId` from session
- [ ] Fetches user profile via `lib/services/users.ts`
- [ ] Calls `buildDietaryConstraints()` — result injected into system prompt
- [ ] Calls `calculateDailyTargets()` — calorie/macro targets injected into system prompt
- [ ] System prompt instructs model to:
  - [ ] Prioritise Ghanaian and West African dishes
  - [ ] Respond ONLY with valid JSON matching the `MealPlanResponse` schema
  - [ ] Never include markdown fences or preamble in the response
  - [ ] Flag estimated nutritional values clearly
- [ ] Sends to `gemini-2.5-flash` — `GEMINI_API_KEY` used server-side only, never in client bundle
- [ ] Parses and Zod-validates the model response against `MealPlanResponseSchema`
- [ ] On parse failure: returns `{ error: "Failed to parse AI response" }` with status 500
- [ ] On success: saves plan via `lib/services/meals.ts` and returns `{ planId, meals }`

### 6.2 Meal service (`lib/services/meals.ts`)
- [ ] `saveMealPlan(userId, date, meals)` — creates `MealPlan` + nested `Meal` records in a single transaction
- [ ] `getMealPlanByDate(userId, date)` — returns plan with nested meals, or null
- [ ] `listMealPlans(userId, limit)` — returns most recent plans (date desc)
- [ ] `getMealById(userId, mealId)` — returns a single meal (scoped to userId via join)
- [ ] `saveMeal(userId, meal)` — saves a meal snapshot to `SavedMeal`
- [ ] `listSavedMeals(userId)` — returns all saved meals
- [ ] `deleteSavedMeal(userId, savedMealId)` — deletes a saved meal (scoped to userId)
- [ ] All queries scoped to `userId`

### 6.3 Response schema
- [ ] `MealPlanResponseSchema` defined in `types/index.ts`:
  - [ ] Array of meals, each with: `type`, `name`, `description`, `ingredients`, `instructions`, `calories`, `proteinG`, `carbsG`, `fatG`, `prepTimeMin`, `isLocalDish`
- [ ] `IngredientSchema` reused from Phase 1 for `ingredients` field validation

### 6.4 Exit criteria
- [ ] POST to `/api/meals/generate` (authenticated) returns a valid meal plan JSON
- [ ] Dietary constraints for a hypertension user are present in the constructed system prompt (verify via `console.log` in dev)
- [ ] Response is saved to DB — visible in Prisma Studio under `MealPlan` and `Meal`
- [ ] Unauthenticated POST returns 401
- [ ] Malformed AI response returns 500 with `{ error }` — does not crash the server
- [ ] `GEMINI_API_KEY` is not present in any client-side bundle (check with `npm run build` output)
- [ ] `npm run build` passes

---

## Phase 7 — Meal UI & Dashboard

### 7.1 Dashboard page (`app/(app)/dashboard/page.tsx`)
- [ ] Fetches today's meal plan via `getMealPlanByDate`
- [ ] Fetches latest health readings via `getLatestReadings`
- [ ] Fetches daily nutrition totals via `getDailyNutrition`
- [ ] All data fetched server-side; passed as props to client components

### 7.2 Dashboard components
- [ ] `components/dashboard/todays-meals.tsx`:
  - [ ] Shows all four meal slots (Breakfast / Lunch / Dinner / Snack)
  - [ ] Each slot: meal card if plan exists, or "Not planned" placeholder
  - [ ] "Generate Plan" button — calls `/api/meals/generate`, disabled while loading
- [ ] `components/dashboard/health-snapshot.tsx`:
  - [ ] Most recent weight, blood pressure, blood sugar readings
  - [ ] Trend arrow per metric (up / down / stable vs. 7 days ago)
  - [ ] Colour-coded badge per reading (green / amber / red)
  - [ ] "Log Today's Data" link to `/health/log`
- [ ] `components/dashboard/nutrition-ring.tsx`:
  - [ ] Recharts `PieChart` donut: calories consumed vs. target
  - [ ] Shows grams of protein / carbs / fat consumed today
  - [ ] Falls back to empty ring when no meals logged
- [ ] `components/dashboard/quick-actions.tsx`:
  - [ ] Three action buttons: "Generate Plan", "Log Health Data", "Make Me a Meal"

### 7.3 Meals list page (`app/(app)/meals/page.tsx`)
- [ ] Lists meal plans by date (most recent first)
- [ ] Date navigation: previous / next day arrows
- [ ] Each plan entry shows the four meal slots as compact cards
- [ ] Skeleton loading while data fetches

### 7.4 Meal detail page (`app/(app)/meals/[id]/page.tsx`)
- [ ] Full recipe: name, description, type badge, local dish badge
- [ ] Ingredients list with amounts and units
- [ ] Numbered preparation instructions
- [ ] Full macros: calories, protein, carbs, fat, prep time
- [ ] "Save Meal" button → calls `saveMeal`; disabled if already saved
- [ ] "Substitute ingredient" — opens a dialog (AI call to suggest swap; Phase 8 covers the API)

### 7.5 Meal components
- [ ] `components/meals/meal-card.tsx`:
  - [ ] Meal name + `MealType` badge
  - [ ] Up to 4 key ingredients listed, "+ N more" if exceeded
  - [ ] Macros summary: calories, protein, carbs, fat
  - [ ] Prep time
  - [ ] "Local dish" badge (`isLocalDish = true`)
  - [ ] "Save" action
- [ ] `components/meals/recipe-sheet.tsx` — full recipe in a shadcn/ui `Sheet`
- [ ] Skeleton variants of `meal-card.tsx` for loading states

### 7.6 Exit criteria
- [ ] Dashboard loads with real data: today's plan, health snapshot, nutrition ring
- [ ] "Generate Plan" button triggers the API and renders the new plan without a full page reload
- [ ] Submit button is disabled and shows a spinner while generation is in flight
- [ ] Meal detail page renders all recipe fields correctly
- [ ] "Save Meal" saves to `SavedMeal` and button state updates
- [ ] All components render correctly in light and dark mode
- [ ] Skeleton loaders appear while data is fetching — no layout shift
- [ ] `npm run build` passes

---

## Phase 8 — Make Me a Meal

### 8.1 Make Me a Meal API (`app/api/meals/make-me-a-meal/route.ts`)
- [ ] POST handler — session-authenticated
- [ ] Receives `{ ingredients: string[], mealType?: MealType, strictIngredients?: boolean }`
- [ ] Zod-validates input
- [ ] Fetches user profile, calls `buildDietaryConstraints()`
- [ ] System prompt instructs model to:
  - [ ] Use only the provided ingredients (+ salt, oil, water unless `strictIngredients: true`)
  - [ ] Respect all dietary constraints — adapt rather than reject where possible
  - [ ] Return `{ "possible": false, "suggestion": "..." }` if no valid meal can be made
  - [ ] Return valid JSON matching `MealResponseSchema` if a meal is possible
- [ ] Sends to `gemini-2.5-flash` — `GEMINI_API_KEY` server-side only
- [ ] Parses and Zod-validates response
- [ ] Returns shaped result to client

### 8.2 Ingredient substitution API (extension of Phase 6)
- [ ] `app/api/meals/substitute/route.ts`:
  - [ ] POST — receives `{ mealId, ingredientName }`
  - [ ] Fetches meal from DB, calls Claude to suggest one alternative ingredient
  - [ ] Returns `{ substitute: string, reason: string }`
  - [ ] Respects user's dietary constraints in the substitution

### 8.3 Make Me a Meal page (`app/(app)/make-me-a-meal/page.tsx`)
- [ ] Client component — no initial data fetch needed

### 8.4 Make Me a Meal components
- [ ] `components/make-me-a-meal/ingredient-input.tsx`:
  - [ ] Tag-chip style entry: type ingredient name + press Enter to add
  - [ ] Click × on a chip to remove an ingredient
  - [ ] Optional: `MealType` selector (Breakfast / Lunch / Dinner / Snack)
  - [ ] Optional: "Strict ingredients only" toggle (hides salt/oil/water fallback)
  - [ ] "Generate" button — disabled while generating; shows spinner
  - [ ] Minimum 1 ingredient required before submission
- [ ] `components/make-me-a-meal/generated-meal.tsx`:
  - [ ] Full recipe result: name, ingredients, instructions, macros
  - [ ] Nutritional disclaimer: "Nutritional values are estimates"
  - [ ] "Save Meal" action
  - [ ] "Try Again" action — re-calls API with same ingredients
- [ ] `components/make-me-a-meal/no-meal-state.tsx`:
  - [ ] Shown when AI returns `possible: false`
  - [ ] Displays the model's explanation and unlock suggestion
  - [ ] "Try Again" action

### 8.5 Exit criteria
- [ ] Submitting 3+ valid ingredients returns a complete recipe
- [ ] Recipe respects the user's dietary constraints (verify with a hypertension user + high-sodium ingredients)
- [ ] Insufficient ingredients surface the `no-meal-state` component cleanly — no crash
- [ ] "Strict ingredients only" mode produces a recipe using only the listed ingredients
- [ ] "Save Meal" saves to `SavedMeal` and the button disables
- [ ] Ingredient substitution dialog suggests a valid alternative with a reason
- [ ] `npm run build` passes

---

## Phase 9 — Nutritional Breakdown & Grocery List

### 9.1 Nutrition service (`lib/services/nutrition.ts`)
- [ ] `getDailyNutrition(userId, date)` — sums macros across all meals in the day's plan
- [ ] `getNutritionTrend(userId, days: 14 | 30)` — daily calorie totals ordered by date
- [ ] `getMacroBreakdown(userId, startDate, endDate)` — averaged protein / carbs / fat ratios
- [ ] `getTopFoods(userId, limit: 10)` — most frequently appearing ingredient names across all meals
- [ ] All queries scoped to `userId`

### 9.2 Nutrition page & components (`app/(app)/nutrition/page.tsx`)
- [ ] Page fetches all four data sets server-side; passes as props
- [ ] `components/nutrition/macro-donut.tsx` — Recharts `PieChart`: protein / carbs / fat split
- [ ] `components/nutrition/calorie-trend-chart.tsx` — Recharts `LineChart`: 14 or 30-day calorie history; period toggle
- [ ] `components/nutrition/top-foods-chart.tsx` — Recharts horizontal `BarChart`: top 10 ingredients
- [ ] `components/nutrition/goal-progress-bar.tsx` — shadcn/ui `Progress`: avg daily intake vs. target macros
- [ ] All charts use `ResponsiveContainer`
- [ ] All chart colors come from CSS variables — no hardcoded hex values
- [ ] Charts recolor correctly in dark mode

### 9.3 Grocery service (`lib/services/grocery.ts`)
- [ ] `generateGroceryList(userId)`:
  - [ ] Reads all `Meal` records in the current week's `MealPlan`
  - [ ] Aggregates ingredients: sums quantities per ingredient name
  - [ ] Groups by category: Vegetables, Proteins, Grains, Condiments, Other
  - [ ] Returns `{ category: string, items: { name: string, totalAmount: number, unit: string }[] }[]`

### 9.4 Grocery page & components (`app/(app)/grocery/page.tsx`)
- [ ] `components/grocery/grocery-list.tsx`:
  - [ ] Grouped by category with category headings
  - [ ] Each item: name + aggregated quantity
  - [ ] Checkbox to mark as purchased (client state only — no DB write)
  - [ ] "Regenerate" button re-fetches from the API
- [ ] Empty state when no active meal plan exists → CTA to `/dashboard`

### 9.5 Exit criteria
- [ ] Macro donut renders with real proportions from this week's meals
- [ ] Calorie trend chart shows the correct values per day over the selected period
- [ ] Grocery list correctly sums duplicate ingredients across multiple meals (e.g. tomatoes in both lunch and dinner)
- [ ] Category grouping is correct — no items in the wrong group
- [ ] Checking off a grocery item persists within the session; unchecking works
- [ ] All charts render in both light and dark mode with correct token colors
- [ ] `npm run build` passes

---

## Phase 10 — Health Monitoring

### 10.1 Health log service (`lib/services/health-logs.ts`)
- [ ] `getTodayLog(userId)` — returns today's `HealthLog` or `null`
- [ ] `upsertHealthLog(userId, data)` — create or update; never `create` directly (unique constraint on `[userId, date]`)
- [ ] `getHealthTrend(userId, days: 30)` — returns ordered logs for chart rendering
- [ ] `getLatestReadings(userId)` — most recent non-null values for each metric
- [ ] All queries scoped to `userId`

### 10.2 Health overview page (`app/(app)/health/page.tsx`)
- [ ] Fetches health trend (30 days) and today's adherence server-side
- [ ] `components/health/trend-chart.tsx`:
  - [ ] Recharts `LineChart` with three series: weight, systolic BP, blood sugar
  - [ ] Toggle between metrics via tabs
  - [ ] 30-day window; date on x-axis
  - [ ] Uses `ResponsiveContainer`
- [ ] `components/health/reading-badge.tsx`:
  - [ ] Colour-coded: green (healthy) / amber (borderline) / red (out of range)
  - [ ] Thresholds are condition-aware:
    - [ ] General systolic: green < 120, amber 120–139, red ≥ 140
    - [ ] Hypertension systolic: green < 130, amber 130–139, red ≥ 140
    - [ ] Blood sugar (fasting): green < 5.6 mmol/L, amber 5.6–6.9, red ≥ 7.0
- [ ] "Log Today's Data" CTA links to `/health/log`
- [ ] Empty state when no logs exist

### 10.3 Daily log form (`app/(app)/health/log/page.tsx`)
- [ ] `components/health/health-log-form.tsx`:
  - [ ] Fields: weight (kg), blood sugar (mmol/L), systolic BP (mmHg), diastolic BP (mmHg), notes
  - [ ] Zod validation: weight 20–300, blood sugar 2.0–30.0, BP systolic 60–250, diastolic 40–150
  - [ ] Pre-populated with today's existing log values if a log already exists
  - [ ] On submit: calls `upsertHealthLog` — success toast + redirect to `/health`
  - [ ] All fields optional individually — user may log only weight, for example
- [ ] Date displayed at top of form: "Logging for: [today's date]"

### 10.4 Exit criteria
- [ ] Submitting the log form saves a `HealthLog` record to DB
- [ ] Submitting the form a second time for the same day updates (upserts) the existing record — no duplicate
- [ ] Trend chart renders correctly with ≥ 3 days of logged data
- [ ] `reading-badge` shows correct colour for each metric based on the user's conditions
- [ ] Pre-population works: existing today's log values appear in the form on page load
- [ ] Empty state shows on `/health` when no logs exist
- [ ] `npm run build` passes

---

## Phase 11 — Meal Adherence & Adaptive Recommendations

### 11.1 Meal adherence service (extend `lib/services/health-logs.ts`)
- [ ] `getMealAdherence(userId, date)` — returns `MealAdherenceLog[]` for all meals on that day
- [ ] `upsertAdherence(userId, mealId, date, status)` — create or update adherence record
- [ ] All queries scoped to `userId`

### 11.2 Adherence tracker component
- [ ] `components/health/adherence-tracker.tsx`:
  - [ ] Lists today's planned meals (Breakfast / Lunch / Dinner / Snack)
  - [ ] Each meal: name + three-way toggle: Completed / Skipped / Pending
  - [ ] On toggle: calls `upsertAdherence` via API route; optimistic UI update
  - [ ] Shown on `/dashboard` (compact) and `/health` (full)
- [ ] `app/api/health/adherence/route.ts`:
  - [ ] POST handler — receives `{ mealId, date, status }`
  - [ ] Calls `upsertAdherence`; returns updated record

### 11.3 Recommendations service (`lib/services/recommendations.ts`)
- [ ] `buildRecommendationContext(userId)`:
  - [ ] Last 7 days of `HealthLog` — averages and direction per metric (not raw rows)
  - [ ] Last 7 days of `MealAdherenceLog` — completion rate per `MealType`
  - [ ] User's `healthConditions`, `dietaryGoal`, and `dietaryGoal`
  - [ ] Returns compact JSON object — no raw Prisma rows in the output

### 11.4 Recommendations API (`app/api/recommendations/route.ts`)
- [ ] POST handler — session-authenticated
- [ ] Calls `buildRecommendationContext(userId)`
- [ ] System prompt instructs model to:
  - [ ] Return exactly 3–5 numbered recommendations
  - [ ] Ground every recommendation in a specific number from the context
  - [ ] Never give generic diet advice not tied to the user's actual data
  - [ ] Defer clinical decisions to a healthcare professional
  - [ ] Respond ONLY with valid JSON: `{ recommendations: { number: int, text: string }[] }`
- [ ] Sends to `gemini-2.5-flash` — `GEMINI_API_KEY` server-side only
- [ ] Parses and Zod-validates response
- [ ] Returns shaped recommendations to client

### 11.5 Recommendations panel component
- [ ] `components/dashboard/recommendations-panel.tsx`:
  - [ ] Displays 3–5 current recommendations as a numbered list
  - [ ] "Refresh" button triggers new recommendation generation
  - [ ] Skeleton loading while API call is in flight
  - [ ] Empty state when < 3 days of health data exist: "Log a few more days of health data to unlock personalised recommendations"
  - [ ] Disclaimer: "These recommendations are based on your logged data and are not a substitute for medical advice"

### 11.6 Exit criteria
- [ ] Toggling adherence status saves to DB and UI updates optimistically
- [ ] Toggling the same meal twice updates correctly (upsert, no duplicate)
- [ ] Recommendations panel displays 3–5 items with specific numbers from logged data
- [ ] Recommendations for a user with < 3 days of logs show the empty state, not an error
- [ ] `GEMINI_API_KEY` is not visible in network tab response or client JS bundle
- [ ] `npm run build` passes

---

## Phase 12 — Settings Page

### 12.1 Settings page (`app/(app)/settings/page.tsx`)
Sections:

- [ ] **Profile** — update name, email, age, weight, height; Zod-validated; success toast on save
- [ ] **Health profile** — update health conditions (multi-select checkboxes) + dietary goal (radio); saves to `User`; toast on save
- [ ] **Password** — change password: current password, new password, confirm new password; verifies current before updating; field-level errors
- [ ] **Language** — select English / Twi / Ga; saves to `User.language`; applies immediately
- [ ] **Appearance** — dark/light mode toggle (also accessible from sidebar)
- [ ] **Danger zone** — "Delete Account": requires password confirmation in a `Dialog`; on confirm, deletes `User` and all cascaded data; logs out

### 12.2 Settings service (extend `lib/services/users.ts`)
- [ ] `updateProfile(userId, data)` — updates name, email, age, weight, height
- [ ] `updateHealthProfile(userId, data)` — updates healthConditions, dietaryGoal
- [ ] `updatePassword(userId, currentPassword, newPassword)` — verifies current hash before updating
- [ ] `updateLanguage(userId, language)` — updates `User.language`
- [ ] `deleteAccount(userId, password)` — verifies password then deletes user (cascade handles all related records)

### 12.3 Exit criteria
- [ ] Profile updates save and are reflected on next page load
- [ ] Health profile update is saved; a new meal generation after this update uses the new constraints
- [ ] Wrong current password on password change returns a field-level error
- [ ] Language change saves to DB
- [ ] Account deletion: password confirmation dialog works; on confirm, user is logged out and all their data is removed (verify in Prisma Studio)
- [ ] `npm run build` passes

---

## Phase 13 — PWA & Localisation

### 13.1 PWA hardening
- [ ] Offline fallback page shown when user is offline and navigates to an uncached route
- [ ] Last-generated meal plan cached by Service Worker for offline viewing
- [ ] Install prompt handled as a passive banner — no forced or blocking prompts
- [ ] `public/manifest.json` — all required fields present and valid
- [ ] Lighthouse PWA score ≥ 90 (run in Chrome DevTools → Lighthouse)
- [ ] PWA install tested on Android Chrome
- [ ] PWA install tested on iOS Safari (Add to Home Screen)

### 13.2 Localisation setup
- [ ] `TRANSLATION_API_KEY` confirmed as server-side only — not in any client bundle
- [ ] All user-facing strings in components extracted to a localisation key map (no hardcoded English strings in JSX)
- [ ] Translation utility function (`lib/translate.ts`) wraps the Translation API call

### 13.3 Localisation application
- [ ] Language switcher in sidebar footer functional (updates `User.language` on change)
- [ ] Meal names and descriptions returned by AI translated when user language is Twi or Ga
- [ ] UI strings (nav labels, button text, empty states, error messages) translated when language is not English
- [ ] Translation applied post-response (AI system prompt stays in English for reliability)
- [ ] Landing page (`app/page.tsx`) value prop available in both English and Twi

### 13.4 Exit criteria
- [ ] Navigating offline to the dashboard shows the offline fallback, not a browser error page
- [ ] Previously generated meal plan is viewable offline
- [ ] Switching language to Twi in Settings updates UI strings and meal name translations
- [ ] Switching back to English reverts all strings
- [ ] Lighthouse PWA score ≥ 90
- [ ] `npm run build` passes

---

## Phase 14 — Hardening, Accessibility & Final QA

### 14.1 Error boundaries & loading UX
- [ ] `app/(app)/error.tsx` error boundary tested: simulate an error and verify the boundary catches it
- [ ] Page-level skeletons present on all data-heavy pages (dashboard, meals, health, nutrition)
- [ ] No layout shift observed during skeleton → content transition on any page

### 14.2 Accessibility
- [ ] Visible `:focus-visible` ring on all interactive elements (verified via keyboard navigation)
- [ ] `prefers-reduced-motion` media query in `globals.css` — all CSS animations respect it
- [ ] All form inputs have an associated `<label>` or `aria-label`
- [ ] All icon-only buttons have `aria-label`
- [ ] Sidebar nav links have descriptive `aria-label` when collapsed to icon-only
- [ ] Full keyboard navigation pass: tab through dashboard, meals, health log form, settings

### 14.3 Form validation UX audit
- [ ] Every form in the app surfaces Zod field-level errors as inline `<p>` messages — not only toasts
- [ ] Every submit button is disabled while an API call is in flight
- [ ] Every successful mutation shows a Sonner toast and resets/redirects correctly
- [ ] No `alert()` or `confirm()` calls anywhere in the codebase

### 14.4 Edge cases
- [ ] Dashboard with no meal plan generated → empty state with "Generate Plan" CTA
- [ ] Dashboard with no health data → health snapshot shows "No data yet" gracefully
- [ ] Health page with no logs → empty state with "Log Today's Data" CTA
- [ ] Make Me a Meal with no valid result → `no-meal-state` component, not a crash
- [ ] Grocery list with no active meal plan → empty state with "Generate Plan" CTA
- [ ] Recommendations panel with < 3 days of logs → graceful fallback message, not an error
- [ ] Meal plan generation for a user with all three conditions set (HYPERTENSION + DIABETES + OBESITY) → verify constraints appear in system prompt log

### 14.5 Code quality
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run build` passes cleanly with zero TypeScript errors
- [ ] No `any` types remaining in the codebase
- [ ] All `userId` scoping verified in every service function
- [ ] No `GEMINI_API_KEY` or `TRANSLATION_API_KEY` in any client-side file
- [ ] All `Meal.ingredients` and `Meal.instructions` Json reads are Zod-validated at the service boundary
- [ ] No unused imports anywhere

### 14.6 Full QA pass
- [ ] Light mode QA: all pages visually correct
- [ ] Dark mode QA: all pages visually correct; no hardcoded colors visible
- [ ] Mobile layout QA: sidebar drawer, stacked cards, bottom CTAs all correct on a 390px viewport
- [ ] Language QA: English → Twi → English roundtrip works on all translated strings
- [ ] AI API key QA: open Network tab in DevTools, generate a meal plan, confirm `GEMINI_API_KEY` does not appear in any request or response payload
- [ ] End-to-end flow: register → onboard → generate plan → log health → view recommendations → check grocery list → change language → delete account

---

## Notes

- **Do not start Phase 6 until Phase 5 is complete.** The meal generation API requires both `buildDietaryConstraints()` and `calculateDailyTargets()` to exist and be tested.
- **Do not start Phase 11 until Phases 7 and 10 are complete.** The recommendations engine requires meal adherence logs (meals must exist) and health logs (readings must be logged).
- **Do not start Phase 13 until Phase 12 is complete.** Language preference is saved in Settings; localisation depends on that field being reliably set.
- **The dietary rules engine is mandatory for every AI call.** Never send a prompt to Claude for meal generation or Make Me a Meal without first calling `buildDietaryConstraints()`.
- **AI nutritional values are estimates.** Always surface a disclaimer. The `FoodItem` table is the authoritative source; use `calculateMealNutrition()` when precision matters.
- **One health log per user per day.** Always call `upsertHealthLog()` — never `prisma.healthLog.create()` directly.
- **Grocery list check-off state is client-only.** No DB write is required or expected for MVP.
- **Hardcoded English strings in components are a localisation debt.** Extract strings from day one; retrofitting i18n after the fact is painful.
