# vital_info.md — Next.js 16 & AduanePa pitfalls

**Read this before touching auth, proxy, images, cookies, or env.**  
Companion to `claude.md` (architecture) and `checklist.md` (tasks). This file captures **non-obvious behaviour** we hit in development — things that are easy to get wrong even when the “happy path” docs look fine.

**Project versions (as of writing):** Next.js `16.2.9`, React `19`, Auth.js / `next-auth` `5.0.0-beta.31`, Prisma `7`, Turbopack in dev, Webpack in production builds.

Official index: [nextjs.org/docs/llms.txt](https://nextjs.org/docs/llms.txt)

---

## 1. `middleware.ts` → `proxy.ts` (Next.js 16)

The `middleware` file convention is **deprecated** and renamed to **`proxy`**.

| Old | New |
|-----|-----|
| `middleware.ts` exporting `middleware` | `proxy.ts` exporting `proxy` (or default) |

- Docs: [proxy file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- Our file: `aduanepa/proxy.ts`
- **Proxy runs before routes render** and only sees what is in the JWT / request — not Prisma.

### Matcher is critical

Without a careful `matcher`, proxy runs on **every** request, including static assets. The docs explicitly warn that auth redirects can block CSS, JS, and images.

**Always exclude:**

- `api`
- `_next/static`
- `_next/image` (image optimizer internal route)
- Static file extensions you serve from `public/` (see §2)

Our matcher lives in `proxy.ts` — update it when adding new static asset types (e.g. `webp`, `avif`, `woff2`).

---

## 2. `next/image` (Next.js 16)

Docs: [Image component](https://nextjs.org/docs/app/api-reference/components/image) · [Getting started: images](https://nextjs.org/docs/app/getting-started/images)

### What changed in v16

- **`images.qualities`** — allowed quality values must be listed in `next.config.ts` (default allowlist is `[75]`). If you pass `quality={80}`, add `80` to the config.
- **`images.localPatterns`** — optional but recommended; restrict which local paths may be optimized.
- **`preload`** replaces deprecated **`priority`** for LCP images.

Our config (`next.config.ts`):

```ts
images: {
  qualities: [75],
  localPatterns: [{ pathname: "/landing_page_meals/**" }],
},
```

### Recommended patterns for local images

1. **Static import (preferred)** — automatic `width` / `height` / `blurDataURL`:

   ```tsx
   import photo from "@/public/landing_page_meals/waakye.webp"
   <Image src={photo} alt="…" fill className="object-cover" />
   ```

2. **String path from `public/`** — must supply `width` + `height`, or `fill` on a positioned parent:

   ```tsx
   <Image src="/landing_page_meals/waakye.webp" alt="…" width={144} height={144} />
   ```

   Do **not** prefix with `/public` — paths are relative to the `public` root.

### Error: “The requested resource isn't a valid image … received null”

Usually **not** a corrupt file. Common causes:

| Cause | Fix |
|-------|-----|
| **Proxy blocks the optimizer’s upstream fetch** | Exclude `_next/image` **and** static extensions (`webp`, etc.) from `proxy` matcher |
| Proxy redirects unauthenticated internal fetch to `/login` | Same as above — optimizer gets HTML, not bytes |
| Missing `localPatterns` / wrong path | Add pathname to `next.config.ts` |
| Turbopack + WebP edge cases in dev | Prefer static imports; production build uses `--webpack` |

Reference: [GitHub #82703](https://github.com/vercel/next.js/issues/82703) (middleware blocking `_next/image`).

### Decorative / low-priority images

For purely decorative assets, `unoptimized` or native `<img>` is valid when optimization adds no value — but fix proxy/config first before falling back.

---

## 3. Cookies (Next.js 15+)

Docs: [cookies()](https://nextjs.org/docs/app/api-reference/functions/cookies)

| Action | Allowed in |
|--------|------------|
| **Read** cookies | Server Components, Route Handlers, Server Actions |
| **Set / delete** cookies | **Route Handlers and Server Actions only** |

**You cannot call `unstable_update()` / session cookie writes from a Server Component page.**  
Error: `Cookies can only be modified in a Server Action or Route Handler`.

### AduanePa pattern for stale JWT

When the DB is ahead of the session cookie (e.g. after email verify):

1. **`POST /api/auth/verify-email`** — updates DB + `unstable_update()` in the route handler.
2. **`GET /api/auth/sync-session?redirect=/onboarding`** — refreshes JWT from DB, then redirects (used by verify page + form).
3. **`lib/session-sync.ts`** — shared DB → JWT sync logic; **only** call from route handlers.

Never import `session-sync` from `auth.config.ts` (circular dependency → `Cannot access 'authConfig' before initialization`). Use `lib/session-patch.ts` for shared JWT patch parsing.

---

## 4. Auth.js v5 + `proxy.ts`

### Two auth entry points

| Module | Runtime | DB access |
|--------|---------|-----------|
| `lib/auth.config.ts` | Edge-safe (proxy) | **No** |
| `lib/auth.ts` | Node (API routes, pages) | **Yes** (Prisma in jwt callback on `update`) |

**Proxy only reads JWT claims** (`isEmailVerified`, `isProfileComplete`). It cannot call Prisma.

### Custom JWT fields

- Set on sign-in in `authorize()` return object.
- Patch via `unstable_update({ user: { isEmailVerified: true, … } })` or flat fields — jwt callback must read both (see `readSessionPatch` in `lib/session-patch.ts`).
- Client: `useSession().update({ … })` triggers jwt `trigger: "update"`.

### Redirect loops we fixed

```
DB: emailVerified=true  →  page redirects to /onboarding
JWT: isEmailVerified=false  →  proxy redirects to /verify-email  →  loop
```

Fix: sync session in a **route handler** before navigation, not in the page component.

### Reset a stuck browser session (dev)

1. `http://localhost:3000/api/auth/signout`
2. DevTools → Application → **Clear site data** (cookies + service workers)
3. New tab → login or register again  
   Optional: `http://localhost:3000/api/auth/sync-session?redirect=/onboarding`

Restarting `npm run dev` does **not** clear browser cookies.

---

## 5. Turbopack vs Webpack + PWA

- **`next dev`** → Turbopack (Next 16 default).
- **`next build --webpack`** → Webpack (our `package.json` script).

`@ducanh2912/next-pwa` injects webpack config. Wrapping `next.config` with PWA in **development** causes Turbopack/webpack conflicts.

**Our rule:** only apply `withPWA()` when `NODE_ENV !== "development"`.

After moving routes or changing route groups, delete `.next` if you see stale route/type errors.

---

## 6. Environment files

| File | Purpose | Git |
|------|---------|-----|
| `.env` | `DATABASE_URL`, `DIRECT_URL` (Prisma CLI) | Committed (no secrets if team policy allows — prefer secrets in `.env.local`) |
| `.env.local` | `NEXTAUTH_SECRET`, API keys, app secrets | **Never commit** |

- Prisma 7 + `prisma.config.ts` does **not** auto-load `.env` — we call `dotenv` in `prisma.config.ts`.
- Restart dev server after changing env vars.
- Auth.js accepts `AUTH_SECRET` or `NEXTAUTH_SECRET`.

### Neon / `pg` SSL warning

`sslmode=require` triggers a deprecation warning in `pg` v8. Use **`sslmode=verify-full`** in connection strings (same security on Neon). `lib/db.ts` also normalizes legacy `require` → `verify-full` at runtime.

---

## 7. Prisma 7 driver adapter

- Runtime uses `@prisma/adapter-pg` + `PrismaPg({ connectionString })` in `lib/db.ts`.
- Migrations use `DIRECT_URL` (non-pooled) via `prisma.config.ts`.
- Do not import `lib/db.ts` from edge-only modules (`auth.config.ts`, `proxy.ts`).

---

## 8. Zod validation — parse once

If a Zod schema **transforms** input (e.g. `dateOfBirth` string → `Date`):

- Validate **once** at the API route with `safeParse`.
- Pass **`z.output<typeof schema>`** (`OnboardingParsed`) to services.
- **Do not** call `.parse()` again in the service on already-parsed data.

---

## 9. Proxy route matrix (AduanePa)

| State | Allowed |
|-------|---------|
| Logged out | `/`, `/login`, `/register`, `/offline` |
| Logged in, unverified | `/verify-email` only |
| Verified, incomplete profile | `/onboarding` only |
| Complete profile | App routes; redirect away from auth / verify / onboarding |

API routes (`/api/*`) are excluded from the proxy matcher and handle their own auth.

---

## 10. Quick debugging checklist

| Symptom | Check |
|---------|--------|
| Stuck on `/verify-email` | JWT vs DB; hit `/api/auth/sync-session`; sign out + clear cookies |
| `received null` images | Proxy matcher + `localPatterns` + static imports |
| `authConfig before initialization` | Circular import between `auth.config` ↔ `session-sync` ↔ `auth` |
| `Cookies can only be modified…` | Move cookie write to route handler / server action |
| OTP / env changes ignored | Restart dev server |
| `pg` SSL warning | `sslmode=verify-full` in `.env` |
| Onboarding 500 on PATCH profile | Double Zod parse / `Date` vs `string` |
| PWA stale shell in browser | Unregister service worker in DevTools |

---

## 11. Doc links to re-check when upgrading Next.js

- [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Image](https://nextjs.org/docs/app/api-reference/components/image)
- [cookies()](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Environment variables](https://nextjs.org/docs/app/guides/environment-variables)
- Auth.js: [session update](https://authjs.dev/getting-started/session-management/protecting)

When bumping Next.js minor versions, re-read the **Image** and **Proxy** sections — regressions in `_next/image` and HEAD caching have occurred in recent 15.x/16.x releases.

---

*Last updated from dev session: verify-email JWT sync, landing page images, onboarding Zod, Neon SSL, proxy matcher.*
