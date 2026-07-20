# AduanePa — Manual QA Guide

Use this guide after Phases 14–15 are implemented. Goal: confirm the product is **acceptable for real users** across happy paths, empty states, errors, accessibility, themes, mobile, languages, and push notifications.

**How to use**

1. Run the app locally (`npm run dev`) against a clean or seeded DB.
2. Work section by section. Mark each item **Pass / Fail / N/A** and note the browser + viewport.
3. Prefer Chrome + a second browser (Firefox or Edge). Use DevTools device mode for mobile.
4. Fail anything that confuses, crashes, exposes secrets, or leaves the user stuck with no next action.

**Suggested test accounts**

| Account | Purpose |
|---------|---------|
| Fresh email (never registered) | Full register → verify → onboard path |
| Seeded user (`boatengjo9@gmail.com` / `Test123!` if seeded) | Fast regression of logged-in features |
| Profile with HYPERTENSION + DIABETES + OBESITY | Constraint-heavy meal generation |

---

## 0. Pre-flight

- [ ] `npm run lint` — zero errors/warnings
- [ ] `npm run build` — succeeds
- [ ] `npm run test:phase -- 14` and `npm run test:phase -- 15` — both ≥ 80%
- [ ] `.env.local` has DB, Auth, Gemini, Firebase (client + admin), translation keys (if testing Twi/Ga meals)
- [ ] Hard refresh / unregister old service workers if PWA/FCM behaves oddly (DevTools → Application → Service Workers)

---

## 1. Marketing & public pages

### 1.1 Landing (`/`)
- [ ] Brand name is the dominant hero signal; page feels like one composition (not a dashboard)
- [ ] Nav hash links scroll smoothly to sections
- [ ] Primary CTAs go to register/login as expected
- [ ] Mobile: hamburger opens sheet; links close sheet and navigate/scroll
- [ ] Keyboard: Tab reaches logo, nav, CTAs; visible focus ring

### 1.2 Privacy (`/privacy`)
- [ ] Page loads; content is readable in light and dark mode
- [ ] Linked from onboarding consent step

### 1.3 Offline (`/offline`)
- [ ] Page renders without app chrome; icon and copy visible
- [ ] (Optional) Disable network → open a cached route → offline fallback appears when expected

---

## 2. Authentication & account lifecycle

### 2.1 Register (`/register`)
- [ ] Empty submit → inline field errors (not only toast)
- [ ] Invalid email / short password → clear inline messages
- [ ] Valid register → redirected to email verification
- [ ] Duplicate email → friendly error (no stack trace)
- [ ] Submit button disabled while request is in flight
- [ ] Rate limit: many rapid register attempts eventually blocked (10/hour per IP)

### 2.2 Verify email (`/verify-email`)
- [ ] Wrong OTP → inline/toast error; can retry
- [ ] Resend OTP works (and respects any cooldown messaging)
- [ ] Correct OTP → proceeds to onboarding (or dashboard if already complete)

### 2.3 Login (`/login`)
- [ ] Wrong password → clear error
- [ ] OAuth-only account + email/password → message to use Google sign-in
- [ ] Unverified account → guided to verify
- [ ] Valid login → lands on dashboard or onboarding if incomplete
- [ ] Session persists after refresh

### 2.3a Google sign-in
- [ ] **Continue with Google** visible on login and register
- [ ] New Google user → skips `/verify-email`, lands on `/onboarding` (or dashboard if profile complete)
- [ ] Existing email/password user → Google with same email → signed in to same account (auto-link)
- [ ] Google user with complete profile → `/dashboard`
- [ ] Session persists after refresh

### 2.4 Logout
- [ ] Sign out clears session; protected routes redirect to login

### 2.5 Delete account (Settings → Danger zone)
- [ ] Password account: requires password; wrong password → inline error
- [ ] Google-only account: password section hidden; delete confirms by typing email
- [ ] Confirm delete → account gone; cannot log in with same credentials or Google
- [ ] No `confirm()` / `alert()` browser dialogs — in-app UI only

---

## 3. Onboarding

Complete with a **new** user.

- [ ] Cannot skip required steps with empty fields (inline errors)
- [ ] Step through: basics → body metrics → conditions → goal → privacy consent
- [ ] Privacy checkbox required; link opens `/privacy`
- [ ] Submit creates complete profile → dashboard
- [ ] Incomplete profile trying to open `/dashboard` is redirected back to onboarding
- [ ] Conditions: select none / one / all three (HYPERTENSION, DIABETES, OBESITY) each work

---

## 4. App shell & navigation

- [ ] Sidebar links: Dashboard, Meals, Health, Nutrition, Grocery, Make Me a Meal, Settings
- [ ] Active route is visually indicated (`aria-current` / style)
- [ ] Collapse sidebar → icon-only; each item still has `aria-label`; tooltips/labels make sense
- [ ] Mobile (~390px): drawer/sheet navigation works; content not clipped; no horizontal scroll
- [ ] Header user menu / theme controls reachable by keyboard
- [ ] Loading skeletons appear briefly on slow navigation (throttle CPU or Network in DevTools)

### 4.1 Error boundary
- [ ] Temporarily force an error in a child of `(app)` (or use a known bad deep link that throws) → “Something went wrong” + **Try again** recovers
- [ ] Message is announced politely (alert region); no white screen of death

---

## 5. Dashboard

### 5.1 Empty / first-run
- [ ] No meal plan → empty / slot placeholders + **Generate Plan** CTA
- [ ] No health data → “No data yet” (or equivalent) with path to log health
- [ ] Recommendations with &lt; min days of logs → helpful “log more days” message, **not** an error toast/crash

### 5.2 With data
- [ ] Generate plan → success toast; today’s meals appear
- [ ] Regenerate replaces plan; toast distinguishes generate vs regenerate
- [ ] Nutrition snapshot / macros update for today
- [ ] Health snapshot shows latest readings when logs exist
- [ ] Recommendations appear after enough health history

---

## 6. Meals

### 6.1 List (`/meals`)
- [ ] Empty date → empty state + **Generate Plan**
- [ ] Date prev/next and date picker change day correctly
- [ ] Meal cards show type, name, macros; open detail on click
- [ ] Save / unsave meal (bookmark) updates UI and survives refresh

### 6.2 Detail (`/meals/[id]`)
- [ ] Loading skeleton → content without large layout jump
- [ ] Ingredients + instructions render
- [ ] Invalid / other-user meal id → not-found (not a crash)
- [ ] Substitute ingredient flow: success updates meal; failure → toast, no corrupt UI

### 6.3 Constraints stress test
- [ ] User with **all three** conditions generates a plan successfully
- [ ] Plan feels medically constrained (low salt / low GI / calorie-aware as appropriate) — spot-check meal names/descriptions
- [ ] Network tab: request body/response **never** contain `GEMINI_API_KEY`

---

## 7. Make Me a Meal

- [ ] Empty ingredients + Generate → **inline** error (“Add at least one ingredient…”)
- [ ] Valid ingredients → loading state; button disabled while in flight
- [ ] Possible result → recipe UI with save/actions
- [ ] Impossible / no-meal result → `no-meal-state` (friendly), not a blank crash
- [ ] Strict mode checkbox affects generation (spot-check copy / result)
- [ ] Meal type filter (Breakfast/Lunch/…) accepted

---

## 8. Health

### 8.1 Overview (`/health`)
- [ ] No logs → empty state + **Log Today's Data** CTA
- [ ] With logs → tiles, trends, adherence section
- [ ] Adherence with no today’s plan → link to generate a plan
- [ ] Mark meal Done / Skipped / etc. → persists; toast on failure and UI reverts if needed

### 8.2 Log form (`/health/log`)
- [ ] Invalid numbers → inline Zod errors
- [ ] Partial log (e.g. weight only) allowed if schema allows
- [ ] Submit → toast + refresh; values show on Health / Dashboard
- [ ] Button disabled while saving

---

## 9. Nutrition (`/nutrition`)

- [ ] No plan / no data → charts show empty messages (no crash)
- [ ] With plan → calorie trend, macros, top foods populate
- [ ] Light and dark: chart colours readable (not black-on-black)

---

## 10. Grocery (`/grocery`)

- [ ] No plan → empty state + **Generate Plan**
- [ ] With plan → items grouped by category; checkboxes toggle strikethrough
- [ ] Regenerate refreshes list after plan changes
- [ ] Checked state is local (OK if resets on refresh — note behaviour)

---

## 11. Settings

### 11.1 Profile
- [ ] Invalid name/email/weight/height/DOB → inline errors
- [ ] Valid save → toast; header/name updates after refresh

### 11.2 Health profile
- [ ] Toggle conditions + goal; save → toast
- [ ] Validation errors (if any) show inline under fields
- [ ] Changing conditions affects **next** meal generation

### 11.3 Password
- [ ] Wrong current password → error
- [ ] Mismatch confirm → inline error
- [ ] Success → can log in with new password only

### 11.4 Language
- [ ] Select Twi → save → page reload; sidebar/nav strings switch
- [ ] Select Ga → UI strings where translated
- [ ] Back to English → strings restore
- [ ] Meal generation for Twi/Ga user returns translated meal text (if Khaya keys configured); English is a no-op

### 11.5 Appearance
- [ ] Light / Dark / System each apply correctly
- [ ] No hardcoded light-only colours on dark (white boxes, invisible text)
- [ ] Radiogroup semantics: arrow/space or click selects theme

### 11.6 Notifications (Phase 15)
- [ ] Enable → browser permission prompt (once)
- [ ] Allow → token saved (`POST /api/notifications/save-token` 200); success UI
- [ ] Deny / blocked → clear “blocked in browser settings” (or equivalent) state
- [ ] Unsupported browser → unsupported message
- [ ] Disable → preference off; token removed/not used
- [ ] Foreground: with app open, test push → Sonner toast (not native-only)
- [ ] Background: app closed/minimised → system notification from SW
- [ ] Click notification → focuses/opens expected route

---

## 12. Accessibility (keyboard & motion)

- [ ] Tab order is logical on: landing, login, dashboard, meals, health log, settings
- [ ] Focus ring always visible on keyboard focus (`:focus-visible`)
- [ ] Icon-only buttons announce purpose (screen reader or Accessibility tree)
- [ ] Forms: every control has a name (label / aria-label)
- [ ] OS “Reduce motion” → landing animations / transitions do not thrash; app still usable

---

## 13. Responsive & visual QA

### 13.1 Viewports
Run key pages at **390×844**, **768×1024**, **1440×900**:

| Page | 390 | 768 | 1440 |
|------|-----|-----|------|
| Landing | ☐ | ☐ | ☐ |
| Dashboard | ☐ | ☐ | ☐ |
| Meals + detail | ☐ | ☐ | ☐ |
| Health + log | ☐ | ☐ | ☐ |
| Nutrition | ☐ | ☐ | ☐ |
| Grocery | ☐ | ☐ | ☐ |
| Make Me a Meal | ☐ | ☐ | ☐ |
| Settings | ☐ | ☐ | ☐ |

### 13.2 Themes
- [ ] Light mode pass on all main pages
- [ ] Dark mode pass on all main pages
- [ ] System theme follows OS toggle live

---

## 14. Security & privacy spot checks

- [ ] Generate meal plan with Network tab open → **no** `GEMINI_API_KEY` / translation private keys in payloads or responses
- [ ] Client bundle / Sources: no `FIREBASE_PRIVATE_KEY`
- [ ] Unauthenticated request to `/api/meals/generate` → 401
- [ ] User A cannot open User B’s meal id (404/not found)
- [ ] XSS: try entering `<script>alert(1)</script>` in name/notes/ingredients → rendered as text, no execution

---

## 15. End-to-end “day in the life”

Run this once on a **new** account without skipping steps:

1. [ ] Register → verify email  
2. [ ] Complete onboarding (include privacy consent)  
3. [ ] Generate today’s meal plan  
4. [ ] Open a meal → save it → substitute one ingredient  
5. [ ] Log health (weight + BP or sugar)  
6. [ ] Mark adherence for at least one meal  
7. [ ] Open Nutrition + Grocery lists  
8. [ ] Make Me a Meal from 3–4 kitchen ingredients  
9. [ ] Switch language to Twi → confirm nav labels → back to English  
10. [ ] Toggle dark mode → confirm dashboard still readable  
11. [ ] Enable notifications (if testing FCM)  
12. [ ] Delete account → confirm lockout  

**Pass criteria for “acceptable QA”:** no crashes, no secret leaks, every empty state has a clear next action, forms never fail silently, mobile + dark mode usable, and the E2E path completes without workarounds.

---

## 16. Bug report template

When something fails, capture:

```text
Title:
Page / route:
Viewport / device:
Browser:
Theme (light/dark/system):
Locale:
Steps to reproduce:
Expected:
Actual:
Screenshot / console / network notes:
Severity (blocker / major / minor):
```

---

## Related docs

- Sprint checklist: `guides/checklist.md` (Phases 14–15)
- Automated gates: `guides/testing.md` — `npm run test:phase -- <N>`
