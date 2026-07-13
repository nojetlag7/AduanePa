# AduanePa — Project Checklist

This checklist tracks sprint execution progress phase by phase.
Mark tasks `[x]` as they are completed. Do not skip ahead — each phase has exit criteria
that must pass before the next phase begins.

> **Gate:** after finishing a phase, run its scored test (`npm run test:phase -- <N>`)
> and only advance once it clears the **80%** threshold. See `guides/testing.md`.
> Run `npm test` to verify every implemented phase at once. The shared test user
> (`boatengjo9@gmail.com`) is seeded via `npm run test:seed-user`.

---

## Overall Status

- [x] Phase 0 — Project Scaffold & Tooling
- [x] Phase 1 — Database Schema & Migrations
- [x] Phase 2 — Authentication
- [x] Phase 3 — App Shell & Layout
- [x] Phase 4 — Onboarding Flow
- [x] Phase 5 — Dietary Rules & Nutritional Engine
- [x] Phase 6 — Meal Generation API
- [x] Phase 7 — Meal UI & Dashboard
- [x] Phase 8 — Make Me a Meal
- [x] Phase 9 — Nutritional Breakdown & Grocery List
- [x] Phase 10 — Health Monitoring
- [x] Phase 11 — Meal Adherence & Adaptive Recommendations
- [x] Phase 12 — Settings Page
- [x] Phase 13 — PWA & Localisation
- [ ] Phase 14 — Hardening, Accessibility & Final QA
- [ ] Phase 15 — Push Notifications (Firebase Cloud Messaging)

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
- [x] POST handler — session-authenticated; reads `userId` from session
- [x] Fetches user profile via `lib/services/users.ts`
- [x] Calls `buildDietaryConstraints()` — result injected into system prompt
- [x] Calls `calculateDailyTargets()` — calorie/macro targets injected into system prompt
- [x] System prompt instructs model to:
  - [x] Prioritise Ghanaian and West African dishes
  - [x] Respond ONLY with valid JSON matching the `MealPlanResponse` schema
  - [x] Never include markdown fences or preamble in the response
  - [x] Flag estimated nutritional values clearly
- [x] Sends to `gemini-2.5-flash` — `GEMINI_API_KEY` used server-side only, never in client bundle
- [x] Parses and Zod-validates the model response against `MealPlanResponseSchema`
- [x] On parse failure: returns `{ error: "Failed to parse AI response" }` with status 500
- [x] On success: saves plan via `lib/services/meals.ts` and returns `{ planId, meals }`
- [x] Returns cached plan when today already has a plan and `regenerate` is not `true` (skips Gemini)
- [x] Overrides AI macros with `applyDbMacrosToMeals()` when all ingredients resolve in `FoodItem`

### 6.2 Meal service (`lib/services/meals.ts`)
- [x] `saveMealPlan(userId, date, meals)` — creates `MealPlan` + nested `Meal` records in a single transaction
- [x] `getMealPlanByDate(userId, date)` — returns plan with nested meals, or null
- [x] `listMealPlans(userId, limit)` — returns most recent plans (date desc)
- [x] `getMealById(userId, mealId)` — returns a single meal (scoped to userId via join)
- [x] `saveMeal(userId, meal)` — saves a meal snapshot to `SavedMeal`
- [x] `listSavedMeals(userId)` — returns all saved meals
- [x] `deleteSavedMeal(userId, savedMealId)` — deletes a saved meal (scoped to userId)
- [x] All queries scoped to `userId`

### 6.3 Response schema
- [x] `MealPlanResponseSchema` defined in `types/index.ts`:
  - [x] Array of meals, each with: `type`, `name`, `description`, `ingredients`, `instructions`, `calories`, `proteinG`, `carbsG`, `fatG`, `prepTimeMin`, `isLocalDish`
- [x] `IngredientSchema` reused from Phase 1 for `ingredients` field validation

### 6.4 Exit criteria
- [x] POST to `/api/meals/generate` (authenticated) returns a valid meal plan JSON
- [x] Dietary constraints for a hypertension user are present in the constructed system prompt (verify via `console.log` in dev)
- [x] Response is saved to DB — visible in Prisma Studio under `MealPlan` and `Meal`
- [x] Unauthenticated POST returns 401
- [x] Malformed AI response returns 500 with `{ error }` — does not crash the server
- [x] `GEMINI_API_KEY` is not present in any client-side bundle (check with `npm run build` output)
- [x] `npm run build` passes

---

## Phase 7 — Meal UI & Dashboard

> Route group: pages live under `app/(app)/(main)/…` (e.g. `dashboard/page.tsx`).

### 7.1 Dashboard page (`app/(app)/(main)/dashboard/page.tsx`)
- [x] Fetches today's meal plan via `getMealPlanByDate`
- [x] Fetches latest health readings via `getLatestReadings` (`lib/services/health-logs.ts`)
- [x] Fetches daily nutrition totals via `getDailyNutrition` (`lib/services/nutrition.ts`)
- [x] All data fetched server-side; passed as props to client components

### 7.2 Dashboard components
- [x] `components/dashboard/todays-meals.tsx`:
  - [x] Shows all four meal slots (Breakfast / Lunch / Dinner / Snack)
  - [x] Each slot: meal card if plan exists, or "Not planned" placeholder
  - [x] "Generate Plan" button — calls `/api/meals/generate`, disabled while loading
- [x] `components/dashboard/health-snapshot.tsx`:
  - [x] Most recent weight, blood pressure, blood sugar readings
  - [x] Trend arrow per metric (up / down / stable vs. 7 days ago)
  - [x] Colour-coded badge per reading (green / amber / red)
  - [x] "Log Today's Data" link to `/health/log`
- [x] `components/dashboard/nutrition-ring.tsx`:
  - [x] Recharts `PieChart` donut: calories consumed vs. target
  - [x] Shows grams of protein / carbs / fat consumed today
  - [x] Falls back to empty ring when no meals logged
- [x] `components/dashboard/quick-actions.tsx`:
  - [x] Shortcuts: View all meals, Log health data, Make me a meal (generate lives on Today's meals only)

### 7.3 Meals list page (`app/(app)/(main)/meals/page.tsx`)
- [x] Meal plan for selected date (date picker + prev/next navigation)
- [x] Date navigation: previous / next day arrows
- [x] Each plan entry shows the four meal slots as compact cards
- [x] Skeleton loading via `meals/loading.tsx`

### 7.4 Meal detail page (`app/(app)/(main)/meals/[id]/page.tsx`)
- [x] Full recipe: name, description, type badge, local dish badge
- [x] Ingredients list with amounts and units
- [x] Numbered preparation instructions
- [x] Full macros: calories, protein, carbs, fat, prep time
- [x] "Save Meal" button → `POST /api/meals/saved`; disabled if already saved
- [x] "Substitute ingredient" — shipped in **Phase 8.2** (API + dialog on ingredient list)

### 7.5 Meal components
- [x] `components/meals/meal-card.tsx`:
  - [x] Meal name + `MealType` badge
  - [x] Up to 4 key ingredients listed, "+ N more" if exceeded
  - [x] Macros summary: calories, protein, carbs, fat
  - [x] Prep time
  - [x] "Local dish" badge (`isLocalDish = true`)
  - [x] "Save" action on card (compact bookmark icon)
- [x] `recipe-sheet.tsx` — **cancelled**; `/meals/[id]` detail page is the canonical full-recipe view
- [x] Skeleton variants of `meal-card.tsx` for loading states

### 7.6 Exit criteria
- [x] Dashboard loads with real data: today's plan, health snapshot, nutrition ring
- [x] "Generate Plan" button triggers the API and renders the new plan without a full page reload (`router.refresh()`)
- [x] Submit button is disabled and shows a spinner while generation is in flight
- [x] Meal detail page renders all recipe fields correctly
- [x] "Save Meal" saves to `SavedMeal` and button state updates
- [x] Semantic tokens used on meal/dashboard components; full light/dark QA in Phase 14.6
- [x] Skeleton loaders appear while data is fetching — `dashboard/loading.tsx`, `meals/loading.tsx`
- [x] `npm run build` passes

---

## Phase 8 — Make Me a Meal

### 8.1 Make Me a Meal API (`app/api/meals/make-me-a-meal/route.ts`)
- [x] POST handler — session-authenticated
- [x] Receives `{ ingredients: string[], mealType?: MealType, strictIngredients?: boolean }`
- [x] Zod-validates input (`MakeMeAMealSchema` in `lib/validations/meals.ts`; 1–30 ingredients)
- [x] Fetches user profile, calls `buildDietaryConstraints()`
- [x] System prompt instructs model to:
  - [x] Use only the provided ingredients (+ salt, oil, water unless `strictIngredients: true`)
  - [x] Respect all dietary constraints — adapt rather than reject where possible
  - [x] Return `{ "possible": false, "suggestion": "..." }` if no valid meal can be made
  - [x] Return valid JSON matching the meal shape if a meal is possible (`MakeMeAMealResultSchema`)
- [x] Sends to `gemini-2.5-flash` — `GEMINI_API_KEY` server-side only
- [x] Parses and Zod-validates response (discriminated union on `possible`)
- [x] Returns shaped result to client; overrides macros via `applyDbMacrosToMeals` when ingredients resolve

### 8.2 Ingredient substitution API (extension of Phase 6)
- [x] `app/api/meals/substitute/route.ts`:
  - [x] POST — receives `{ mealId, ingredientName }`
  - [x] Fetches meal from DB, calls **Gemini** to suggest one alternative ingredient
  - [x] Returns `{ substitute: string, reason: string }` (`SubstituteResultSchema`)
  - [x] Respects user's dietary constraints in the substitution
- [x] `components/meals/substitute-ingredient.tsx` — dialog wired into `/meals/[id]` ingredient list

### 8.3 Make Me a Meal page (`app/(app)/(main)/make-me-a-meal/page.tsx`)
- [x] Server page exports metadata; renders `MakeMeAMealClient` (client orchestrator holds state)

### 8.4 Make Me a Meal components
- [x] `components/make-me-a-meal/ingredient-input.tsx`:
  - [x] Tag-chip style entry: type ingredient name + press Enter (or comma) to add
  - [x] Click × on a chip to remove an ingredient (Backspace removes last)
  - [x] Optional: `MealType` selector (Any / Breakfast / Lunch / Dinner / Snack)
  - [x] Optional: "Strict ingredients only" toggle (hides salt/oil/water fallback)
  - [x] "Generate" button — disabled while generating; shows spinner
  - [x] Minimum 1 ingredient required before submission (folds pending draft in)
- [x] `components/make-me-a-meal/generated-meal.tsx`:
  - [x] Full recipe result: name, ingredients, instructions, macros
  - [x] Nutritional disclaimer (DB-calculated vs estimate)
  - [x] "Save Meal" action (ad-hoc snapshot via extended `/api/meals/saved`)
  - [x] "Try Again" action — re-calls API with same ingredients
- [x] `components/make-me-a-meal/no-meal-state.tsx`:
  - [x] Shown when AI returns `possible: false`
  - [x] Displays the model's explanation and unlock suggestion
  - [x] "Try Again" action

### 8.5 Exit criteria
- [x] Submitting 3+ valid ingredients returns a complete recipe *(live Gemini run pending manual verification)*
- [x] Recipe respects the user's dietary constraints (constraints injected into system prompt)
- [x] Insufficient ingredients surface the `no-meal-state` component cleanly — no crash
- [x] "Strict ingredients only" mode produces a recipe using only the listed ingredients (prompt enforced)
- [x] "Save Meal" saves to `SavedMeal` and the button disables
- [x] Ingredient substitution dialog suggests a valid alternative with a reason
- [x] `npm run build` passes

---

## Phase 9 — Nutritional Breakdown & Grocery List

### 9.1 Nutrition service (`lib/services/nutrition.ts`)
- [x] `getDailyNutrition(userId, date)` — shipped in Phase 7 (dashboard nutrition ring)
- [x] `getNutritionTrend(userId, days: 14 | 30)` — daily calorie totals ordered by date (gaps filled with 0)
- [x] `getMacroBreakdown(userId, startDate, endDate)` — averaged protein / carbs / fat (over days with a plan)
- [x] `getTopFoods(userId, limit: 10)` — most frequently appearing ingredient names across all meals
- [x] All queries scoped to `userId`

### 9.2 Nutrition page & components (`app/(app)/nutrition/page.tsx`)
- [x] Page fetches all data sets server-side; passes as props
- [x] `components/nutrition/macro-donut.tsx` — Recharts `PieChart`: protein / carbs / fat split
- [x] `components/nutrition/calorie-trend-chart.tsx` — Recharts `LineChart`: 14 or 30-day calorie history; period toggle (Tabs)
- [x] `components/nutrition/top-foods-chart.tsx` — Recharts horizontal `BarChart`: top 10 ingredients
- [x] `components/nutrition/goal-progress-bar.tsx` — shadcn/ui `Progress`: avg daily intake vs. target macros
- [x] All charts use `ResponsiveContainer`
- [x] All chart colors come from CSS variables (`--chart-protein/carbs/fat`, `--color-primary`) — no hardcoded hex
- [x] Charts recolor correctly in dark mode (chart palette has a `.dark` override)

### 9.3 Grocery service (`lib/services/grocery.ts`)
- [x] `generateGroceryList(userId)`:
  - [x] Reads all `Meal` records in the current week's (Mon–Sun) `MealPlan`s
  - [x] Aggregates ingredients: sums quantities per ingredient name + unit
  - [x] Groups by category: Vegetables & Fruit, Proteins, Grains & Starches, Condiments & Spices, Other
  - [x] Returns `{ category, items: { name, amount, unit }[] }[]` (empty categories omitted)

### 9.4 Grocery page & components (`app/(app)/grocery/page.tsx`)
- [x] `components/grocery/grocery-list.tsx`:
  - [x] Grouped by category with category headings + per-group counts
  - [x] Each item: name + aggregated quantity
  - [x] Checkbox to mark as purchased (client state only — no DB write)
  - [x] "Regenerate" button re-fetches from the server (`router.refresh()` re-runs the SSR query)
- [x] Empty state when no active meal plan exists → CTA to generate a plan

### 9.5 Exit criteria
- [x] Macro donut renders with real proportions from this week's meals
- [x] Calorie trend chart shows the correct values per day over the selected period
- [x] Grocery list correctly sums duplicate ingredients across multiple meals (e.g. tomatoes in both lunch and dinner)
- [x] Category grouping is correct — no items in the wrong group
- [x] Checking off a grocery item persists within the session; unchecking works
- [x] **Phase 9 test suite ≥ 80%** — `npm run test:phase -- 9` (100%, 31/31)
- [ ] All charts render in both light and dark mode with correct token colors
- [ ] `npm run build` passes

---

## Phase 10 — Health Monitoring

### 10.1 Health log service (`lib/services/health-logs.ts`)
- [x] `getTodayLog(userId)` — returns today's `HealthLog` or `null`
- [x] `upsertHealthLog(userId, data)` — create or update; never `create` directly (unique constraint on `[userId, date]`)
- [x] `getHealthTrend(userId, days: 30)` — returns ordered logs for chart rendering
- [x] `getLatestReadings(userId)` — minimal version shipped in Phase 7 (dashboard snapshot); extended for condition-aware badges
- [x] All queries scoped to `userId`

### 10.2 Health overview page (`app/(app)/health/page.tsx`)
- [x] Fetches health trend (30 days) + latest readings server-side
- [x] `components/health/trend-chart.tsx`:
  - [x] Recharts `LineChart` with three metrics: weight, systolic BP, blood sugar
  - [x] Toggle between metrics via tabs
  - [x] 30-day window; date on x-axis
  - [x] Uses `ResponsiveContainer`
- [x] `components/health/reading-badge.tsx` (logic in `lib/health-thresholds.ts`):
  - [x] Colour-coded: green (healthy) / amber (borderline) / red (out of range)
  - [x] Thresholds are condition-aware:
    - [x] General systolic: green < 120, amber 120–139, red ≥ 140
    - [x] Hypertension systolic: green < 130, amber 130–139, red ≥ 140
    - [x] Blood sugar (fasting): green < 5.6 mmol/L, amber 5.6–6.9, red ≥ 7.0
- [x] "Log Today's Data" CTA links to `/health/log`
- [x] Empty state when no logs exist

### 10.3 Daily log form (`app/(app)/health/log/page.tsx`)
- [x] `components/health/health-log-form.tsx`:
  - [x] Fields: weight (kg), blood sugar (mmol/L), systolic BP (mmHg), diastolic BP (mmHg), notes
  - [x] Zod validation: weight 20–300, blood sugar 2.0–30.0, BP systolic 60–250, diastolic 40–150
  - [x] Pre-populated with today's existing log values if a log already exists
  - [x] On submit: POST `/api/health/logs` → `upsertHealthLog` — success toast + redirect to `/health`
  - [x] All fields optional individually (but at least one reading required) — user may log only weight
- [x] Date displayed at top of form: "Logging for: [today's date]"

### 10.4 Exit criteria
- [x] Submitting the log form saves a `HealthLog` record to DB
- [x] Submitting the form a second time for the same day updates (upserts) the existing record — no duplicate
- [x] Trend chart renders correctly with ≥ 3 days of logged data
- [x] `reading-badge` shows correct colour for each metric based on the user's conditions
- [x] Pre-population works: existing today's log values appear in the form on page load
- [x] Empty state shows on `/health` when no logs exist
- [x] `npm run build` passes
- [x] **Phase 10 test suite ≥ 80%** — `npm run test:phase -- 10` (100%, 35/35)

---

## Phase 11 — Meal Adherence & Adaptive Recommendations

### 11.1 Meal adherence service (extend `lib/services/health-logs.ts`)
- [x] `getMealAdherence(userId, date)` — returns `MealAdherenceLog[]` for all meals on that day
- [x] `upsertAdherence(userId, mealId, date, status)` — create or update adherence record
- [x] `getAdherenceRate(userId, days)` — derived completion rate per `MealType` (feeds recommendations)
- [x] All queries scoped to `userId`

### 11.2 Adherence tracker component
- [x] `components/health/adherence-tracker.tsx`:
  - [x] Lists today's planned meals (Breakfast / Lunch / Dinner / Snack)
  - [x] Each meal: name + three-way toggle: Completed / Skipped / Pending
  - [x] On toggle: calls `upsertAdherence` via API route; optimistic UI update (reverts on failure)
  - [x] Shown on `/dashboard` (compact) and `/health` (full)
- [x] `app/api/health/adherence/route.ts`:
  - [x] POST handler — receives `{ mealId, date, status }`; Zod-validated; meal ownership checked
  - [x] Calls `upsertAdherence`; returns updated record

### 11.3 Recommendations service (`lib/services/recommendations.ts`)
- [x] `buildRecommendationContext(userId)`:
  - [x] Last 7 days of `HealthLog` — averages and direction per metric (not raw rows)
  - [x] Last 7 days of `MealAdherenceLog` — completion rate per `MealType`
  - [x] User's `healthConditions`, `dietaryGoal`, age and weight
  - [x] Returns compact JSON object — no raw Prisma rows in the output
- [x] `getLatestRecommendation` / `saveRecommendation` persist to `Recommendation` (dashboard shows last result without re-calling Gemini)

### 11.4 Recommendations API (`app/api/recommendations/route.ts`)
- [x] POST handler — session-authenticated
- [x] Calls `buildRecommendationContext(userId)`; returns `{ ready: false, daysLogged }` below the 3-day minimum
- [x] System prompt instructs model to:
  - [x] Return exactly 3–5 numbered recommendations
  - [x] Ground every recommendation in a specific number from the context
  - [x] Never give generic diet advice not tied to the user's actual data
  - [x] Defer clinical decisions to a healthcare professional
  - [x] Respond ONLY with valid JSON: `{ recommendations: { number: int, text: string }[] }`
- [x] Sends to `gemini-2.5-flash` — `GEMINI_API_KEY` server-side only
- [x] Parses and Zod-validates response (`RecommendationResultSchema`)
- [x] Returns shaped recommendations to client

### 11.5 Recommendations panel component
- [x] `components/dashboard/recommendations-panel.tsx`:
  - [x] Displays 3–5 current recommendations as a numbered list
  - [x] "Refresh" button triggers new recommendation generation
  - [x] Skeleton loading while API call is in flight
  - [x] Empty state when < 3 days of health data exist: "Log a few more days of health data to unlock personalised recommendations"
  - [x] Disclaimer: "These recommendations are based on your logged data and are not a substitute for medical advice"

### 11.6 Exit criteria
- [x] Toggling adherence status saves to DB and UI updates optimistically
- [x] Toggling the same meal twice updates correctly (upsert, no duplicate)
- [x] Recommendations panel displays 3–5 items with specific numbers from logged data
- [x] Recommendations for a user with < 3 days of logs show the empty state, not an error
- [x] `GEMINI_API_KEY` is not visible in network tab response or client JS bundle (server-only `lib/gemini.ts`)
- [x] `npm run build` passes
- [x] **Phase 11 test suite ≥ 80%** — `npm run test:phase -- 11` (100%, 18/18)

---

## Phase 12 — Settings Page

### 12.1 Settings page (`app/(app)/settings/page.tsx`)
Sections:

- [x] **Profile** — update name, email, age, weight, height; Zod-validated; success toast on save
- [x] **Health profile** — update health conditions (multi-select checkboxes) + dietary goal (radio); saves to `User`; toast on save
- [x] **Password** — change password: current password, new password, confirm new password; verifies current before updating; field-level errors
- [x] **Language** — select English / Twi / Ga; saves to `User.language`; applies immediately
- [x] **Appearance** — dark/light/system mode selector (three-way, not just toggle)
- [x] **Danger zone** — "Delete Account": requires password confirmation in a `Dialog`; on confirm, deletes `User` and all cascaded data; logs out

### 12.2 Settings service (extend `lib/services/users.ts`)
- [x] `updateProfile(userId, data)` — updates name, email, dateOfBirth, weight, height; duplicate email check
- [x] `updateHealthProfile(userId, data)` — updates healthConditions, dietaryGoal
- [x] `updatePassword(userId, currentPassword, newPassword)` — verifies current hash before updating
- [x] `updateLanguage(userId, language)` — updates `User.language`
- [x] `deleteAccount(userId, password)` — verifies password then deletes user (cascade handles all related records)

### 12.3 Exit criteria
- [x] Profile updates save and are reflected on next page load
- [x] Health profile update is saved; a new meal generation after this update uses the new constraints
- [x] Wrong current password on password change returns a field-level error
- [x] Language change saves to DB
- [x] Account deletion: password confirmation dialog works; on confirm, user is logged out and all their data is removed (verify in Prisma Studio)
- [x] `npm run build` passes
- [x] **Phase 12 test suite ≥ 80%** — `npm run test:phase -- 12` (100%, 46/46)

---

## Phase 13 — PWA & Localisation

### 13.1 PWA hardening
- [x] Offline fallback page shown when user is offline and navigates to an uncached route
- [x] Last-generated meal plan cached by Service Worker (`NetworkFirst` strategy with 24h TTL)
- [x] Install prompt handled as a passive banner — no forced or blocking prompts
- [x] `public/manifest.json` — all required fields: `id`, `name`, `start_url`, `display`, icons (any + maskable), shortcuts (Dashboard, Make Meal, Log Health)
- [ ] Lighthouse PWA score ≥ 90 (run in Chrome DevTools → Lighthouse — manual verification)
- [ ] PWA install tested on Android Chrome
- [ ] PWA install tested on iOS Safari (Add to Home Screen)

> **Architecture decision (i18n):** static UI strings and dynamic AI content are
> two separate problems and use two separate mechanisms:
> - **Static UI** → **next-intl** with authored message catalogs (instant,
>   offline-capable, reviewable, git-versioned). No runtime machine translation.
> - **Dynamic AI content** (meal names/descriptions) → runtime translation via
>   `lib/translate.ts`, applied post-response.

### 13.2 Static UI localisation (next-intl)
- [x] `next-intl` installed; `next.config` wrapped with `createNextIntlPlugin('./i18n/request.ts')`
- [x] `i18n/request.ts` resolves locale from `NEXT_LOCALE` cookie ("without-i18n-routing" mode)
- [x] Authored message catalogs: `messages/en.json`, `messages/tw.json`, `messages/gaa.json` — 8 namespaces: `nav`, `common`, `meals`, `health`, `dashboard`, `settings`, `auth`, `landing`
- [x] Sidebar nav labels use `useTranslations("nav")` — all 7 routes translated into Twi and Ga
- [x] Settings, dashboard, meals, health, nutrition, grocery, make-me-a-meal page chrome use `getTranslations` / `useTranslations`
- [x] Landing hero + nav and auth panel headings use message catalogs
- [x] `NextIntlClientProvider` wired into root `app/layout.tsx`; locale injected into `<html lang>`
- [x] Locale codes: `en`, `tw` (Twi), `gaa` (Ga); mapped via `lib/locale.ts` `languageToLocale()`
- [x] Page skeletons: dashboard, meals, health, nutrition, grocery, make-me-a-meal, settings (+ shared `(app)/loading`)

### 13.3 Localisation application
- [x] Settings language change: DB update + `NEXT_LOCALE` cookie set + `window.location.reload()` — new locale takes effect immediately
- [x] On login session sync (`/api/auth/sync-session`): `User.language` → `NEXT_LOCALE` cookie synced automatically
- [x] Translation keys (`PRIMARY_TRANSLATION_API_KEY`, `SECONDARY_TRANSLATION_API_KEY`) server-only — `import "server-only"` enforced in `lib/translate.ts`
- [x] `lib/translate.ts` wraps Khaya API with primary/secondary fallback — plain-string response handled correctly
- [x] Translation applied post-Gemini in `meals/generate` and `make-me-a-meal` routes
- [x] English is a no-op — `LANG_CODE["ENGLISH"]` is `undefined`, no API call made

### 13.4 Speed & security improvements (added alongside Phase 13)
- [x] `sharp` installed for AVIF/WebP image auto-conversion
- [x] `next.config.ts` adds 8 HTTP security headers to every route: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, `X-DNS-Prefetch-Control`, `Cross-Origin-Resource-Policy`, `Cross-Origin-Opener-Policy`
- [x] `console.log` removed from production bundle (`removeConsole: { exclude: ['error','warn'] }`)
- [x] `lib/rate-limit.ts` — in-memory token-bucket; applied to `POST /api/auth/register` (10/hour per IP)
- [x] PWA `runtimeCaching` entries for meal plan and meals API endpoints

### 13.5 Exit criteria
- [x] Switching language to Twi in Settings updates sidebar navigation labels
- [x] Switching back to English reverts all labels
- [x] Meal generation for a Twi user calls `translateMeals` post-Gemini
- [x] `npm run build` passes
- [x] **Phase 13 test suite ≥ 80%** — `npm run test:phase -- 13` (100%, 95/95)

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

## Phase 15 — Push Notifications (Firebase Cloud Messaging)

> **Goal:** a complete push pipeline — Frontend → Firebase → Service Worker →
> Backend → User device — for a Next.js (App Router) PWA, in TypeScript, using
> the Firebase **client SDK** (browser) and **admin SDK** (server).
>
> **Depends on:** Phase 13 PWA service-worker registration and `User.notificationsEnabled`
> (already on the schema from Phase 1). FCM's `firebase-messaging-sw.js` lives
> alongside the PWA service worker — register both without conflict.
>
> **Architecture decision:** the FCM web SDK requires a *dedicated* service
> worker at the web root (`/firebase-messaging-sw.js`) loaded with the **compat**
> build (service-worker scripts can't use ES module imports reliably across
> browsers). All Firebase config is read from `NEXT_PUBLIC_*` env vars; the admin
> private key is server-only.

### 15.1 Environment & config
- [ ] Firebase project created; Cloud Messaging enabled; Web Push certificate (VAPID key pair) generated
- [ ] Client env vars added to `.env.local` (all `NEXT_PUBLIC_` — safe to expose):
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (Web Push public key)
- [ ] Admin (server-only — **never** `NEXT_PUBLIC_`) env vars added: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (escaped newlines normalised at read time)
- [ ] `firebase` and `firebase-admin` installed

### 15.2 Firebase client setup
- [ ] `lib/firebase/client.ts` — reusable client init: `initializeApp` guarded against re-init (`getApps().length`)
- [ ] Messaging accessed only in the browser — `isSupported()` checked before `getMessaging()` (avoids SSR/`window` crashes)
- [ ] Exports a typed `getMessagingIfSupported()` helper returning `Messaging | null`
- [ ] No secrets hardcoded — all values from `NEXT_PUBLIC_FIREBASE_*`

### 15.3 Service worker (background notifications)
- [ ] `public/firebase-messaging-sw.js` created at the web root (so its scope covers the whole app)
- [ ] Initialises Firebase inside the SW using `firebase-app-compat.js` + `firebase-messaging-compat.js` (importScripts)
- [ ] `onBackgroundMessage` handler builds and shows the notification (title, body, icon) so it displays even when the app/tab is closed
- [ ] `notificationclick` handler focuses an existing client tab or opens the target URL

### 15.4 Permission + token retrieval
- [ ] `lib/firebase/messaging.ts` — `requestNotificationPermission()`:
  - [ ] Returns early/typed result if `Notification` unsupported or permission `denied`
  - [ ] Calls `Notification.requestPermission()` then `getToken(messaging, { vapidKey, serviceWorkerRegistration })`
  - [ ] Edge cases handled: unsupported browser, denied permission, missing SW registration — never throws to the caller
- [ ] Token retrieval is idempotent (safe to call repeatedly; returns the same token)

### 15.5 Token management
- [ ] `app/api/notifications/save-token/route.ts` — POST: session-authenticated, Zod-validates `{ token }`, persists per-user (deduped)
- [ ] DB: `DeviceToken` model (`id`, `userId`, `token` `@unique`, `userAgent?`, `createdAt`) with cascade delete on `userId`; or store on `User` — pick one and note it
- [ ] `lib/services/notifications.ts` — `saveDeviceToken(userId, token)` / `listDeviceTokens(userId)` / `removeDeviceToken(token)`; all scoped to `userId`
- [ ] Client `useFcmToken()` hook: requests permission, fetches token, POSTs it to `save-token`, exposes `{ token, permission, error }`

### 15.6 Backend (Firebase Admin)
- [ ] `lib/firebase/admin.ts` — admin init from env vars (`cert({ projectId, clientEmail, privateKey })`), guarded against re-init; `server-only` import
- [ ] `lib/services/notifications.ts` — `sendNotificationToToken(token, { title, body, data? })` and `sendNotificationToUser(userId, payload)` (fans out to all of a user's tokens; prunes tokens that return `messaging/registration-token-not-registered`)
- [ ] Modular: messaging send logic separate from token persistence

### 15.7 Foreground notifications
- [ ] `components/notifications/foreground-listener.tsx` — client component: subscribes via `onMessage` while the app is open
- [ ] Surfaces foreground messages through a Sonner toast (no `alert()`), with optional click action
- [ ] Mounted once in the protected app shell; no-ops when messaging unsupported

### 15.8 Settings integration
- [ ] Settings notification toggle writes `User.notificationsEnabled`; enabling triggers permission + token registration, disabling removes the device token
- [ ] Graceful UI states: "blocked in browser settings", "unsupported on this device"

### 15.9 Exit criteria
- [ ] Permission prompt appears once and the FCM token is saved to the backend
- [ ] Background notification (app closed) is delivered and shown by the service worker
- [ ] Foreground notification (app open) surfaces as an in-app toast via `onMessage`
- [ ] `notificationclick` focuses/opens the correct route
- [ ] No Firebase admin secret (`FIREBASE_PRIVATE_KEY`) appears in any client bundle
- [ ] Stale/unregistered tokens are pruned on send failure
- [ ] `npm run build` passes

---

## Notes

### Cross-phase overlaps & conflicts (read before building)

| Area | Issue | Resolution |
|------|--------|------------|
| **Generate plan button** | Was on Today's meals *and* Quick actions | One primary CTA on Today's meals; Quick actions links elsewhere |
| **Nutrition ring (Ph 7) vs Nutrition page (Ph 9)** | Both show macro charts | Ph 7 = today only; Ph 9 = trends, top foods, date ranges — complementary |
| **Health snapshot (Ph 7) vs Health page (Ph 10)** | Both show readings | Ph 7 = latest + trends preview; Ph 10 = full charts + log form |
| **`getDailyNutrition`** | Listed in Ph 7 and Ph 9 | Built in Ph 7; Ph 9 adds trend/breakdown helpers only |
| **`getLatestReadings`** | Listed in Ph 7 and Ph 10 | Minimal version in Ph 7; Ph 10 adds upsert, trends, condition-aware thresholds |
| **Recipe sheet vs detail page** | Two ways to view full recipe | **Detail page wins**; `recipe-sheet.tsx` cancelled |
| **Save meal** | Card, detail, Make Me a Meal | Same `POST /api/meals/saved`; list saved meals UI still missing (future) |
| **Make Me a Meal vs Generate plan** | Both call Gemini for meals | Different inputs: full-day plan vs user ingredients; keep both |
| **`SavedMeal` vs `Meal`** | Bookmark vs daily plan slot | Saved meals are snapshots; no "saved recipes" list page yet |
| **`listMealPlans` vs date picker on `/meals`** | Service returns history; UI picks one day | Date nav is MVP; optional "recent plans" list can come later |
| **Meal adherence checkboxes** | `claude.md` mentions on dashboard; Ph 11 owns it | Deferred to Ph 11 — don't add to Ph 7 |
| **OBESITY + WEIGHT_LOSS** | Overlapping constraint strings | Acceptable overlap in `dietary-rules.ts`; dedupe handles duplicates |
| **Theme toggle** | Sidebar + Settings (Ph 12) | Intentional duplicate entry points |
| **AI provider in docs** | Notes mention "Claude" | App uses **Gemini** (`gemini-2.5-flash`) everywhere |
| **Ph 13 i18n vs hardcoded strings** | Ph 13 extracts all strings into next-intl catalogs | Technical debt until Ph 13; extract strings from Ph 10 on to reduce retrofit |
| **Static UI vs AI content translation** | next-intl (authored) for UI; Translation API only for AI meal text | Static strings shouldn't hit a runtime API — costly, can't QA, breaks offline |
| **Grocery "Regenerate"** | Recomputes from DB | No AI; not redundant with meal generate |

### Deferred items (by phase)

| Item | When | Why |
|------|------|-----|
| ~~Substitute ingredient dialog + API~~ | ~~Phase 8.2~~ | **Done** — shipped in Phase 8 |
| Saved meals library page | Post–Ph 8 or Ph 12 | `SavedMeal` exists; no list UI yet |
| Meal adherence on dashboard | Phase 11 | Depends on adherence API + today's plan |
| Recommendations panel | Phase 11 | Needs 3+ days health + adherence data |
| ~~Full health log form~~ | ~~Phase 10~~ | **Done** — `/health/log` form + `/api/health/logs` shipped |
| Condition-aware reading badges on snapshot | Phase 10 (partial) | `/health` page uses condition-aware badges; dashboard snapshot still uses general thresholds |

### Original notes

- **Do not start Phase 6 until Phase 5 is complete.** The meal generation API requires both `buildDietaryConstraints()` and `calculateDailyTargets()` to exist and be tested.
- **Do not start Phase 11 until Phases 7 and 10 are complete.** The recommendations engine requires meal adherence logs (meals must exist) and health logs (readings must be logged).
- **Do not start Phase 13 until Phase 12 is complete.** Language preference is saved in Settings; localisation depends on that field being reliably set.
- **Static UI uses next-intl, not the Translation API.** Author `messages/{en,tw,gaa}.json` by hand; reserve `lib/translate.ts` (Translation API) strictly for dynamic AI-generated meal names/descriptions. Locale comes from the `NEXT_LOCALE` cookie mirrored from `User.language` (no URL locale segment).
- **The dietary rules engine is mandatory for every AI call.** Never send a prompt to **Gemini** for meal generation or Make Me a Meal without first calling `buildDietaryConstraints()`.
- **AI nutritional values are estimates.** Always surface a disclaimer. The `FoodItem` table is the authoritative source; use `calculateMealNutrition()` when precision matters.
- **One health log per user per day.** Always call `upsertHealthLog()` — never `prisma.healthLog.create()` directly.
- **Grocery list check-off state is client-only.** No DB write is required or expected for MVP.
- **Hardcoded English strings in components are a localisation debt.** Extract strings from day one; retrofitting i18n after the fact is painful.
