# AduanePa — Phase Test Suite

Scored, gated verification you run **after every phase**. A phase may only be
considered "done" once its tests meet the pass threshold.

## How it works

- Each phase has a test file at `scripts/tests/phase-<N>.ts`.
- Tests register **weighted checks** via a shared harness (`scripts/tests/harness.ts`).
- The runner computes a **score percentage** = earned weight ÷ total weight.
- A phase **passes** when `score% >= threshold` (default **80%**).
- AI (Gemini) calls are **mocked** with deterministic fixtures (`scripts/tests/fixtures.ts`)
  so tests are fast, free, and reproducible. We verify our schema parsing,
  prompt construction, and macro logic — not Google's model.

## Running

```bash
# Every implemented phase (0–8 today)
npm test

# A single phase
npm run test:phase -- 8

# Several phases
npm run test:phase -- 5 6 7

# Custom threshold (e.g. stricter gate before a release)
npm run test:phase -- 8 --threshold 90

# Also hard-fail on any "critical" check, not just the percentage
npm test -- --strict
```

The runner loads `.env.local` then `.env` automatically (no `--env-file` flag
needed). It exits with a non-zero code if any gated phase is below threshold —
suitable for CI or a pre-merge hook.

## Threshold

| Setting | Value |
|---------|-------|
| Default pass threshold | **80%** |
| Critical checks | Marked with `*` in output; only hard-gate under `--strict` |
| Gate semantics | Score `>=` threshold ⇒ advance. Below ⇒ **do not move to the next phase.** |

## Test user

DB-dependent checks (auth, profile, persistence) use a shared seeded account:

- Email: `boatengjo9@gmail.com`
- Password: `Test123!`

Override with env vars `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`. If the user is
absent or the DB is unreachable, those specific checks fail with a helpful note
rather than crashing the run — file-based and pure-logic checks still score.

## Coverage status

| Phase | Title | Tests |
|-------|-------|-------|
| 0 | Project Scaffold & Tooling | ✅ files, tokens, deps, PWA |
| 1 | Database Schema & Migrations | ✅ models, enums, constraints, seed count |
| 2 | Authentication | ✅ files, test user, bcrypt password verify |
| 3 | App Shell & Layout | ✅ shell/components, nav links, landing |
| 4 | Onboarding Flow | ✅ `isProfileComplete` logic, test-user profile |
| 5 | Dietary Rules & Nutritional Engine | ✅ constraints, targets, FoodItem macros |
| 6 | Meal Generation API | ✅ prompt/constraints, schema parse, DB round-trip |
| 7 | Meal UI & Dashboard | ✅ components, dashboard service shapes |
| 8 | Make Me a Meal | ✅ validation, result union, prompts, save union |
| 9–14 | (future phases) | ⏳ pending — add `run()` to the stub files |

## Adding tests for a new phase

1. Open `scripts/tests/phase-<N>.ts` (stub already exists for 9–14).
2. Set `meta.implemented = true` and export `run(t)`.
3. Register checks: `t.check(name, condition, { weight, critical, detail })`
   or `await t.test(name, async () => boolean, opts)` for code that may throw.
4. Group with `t.section("…")`.
5. Run `npm run test:phase -- <N>` until it clears 80%.
