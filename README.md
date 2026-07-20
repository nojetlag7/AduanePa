# AduanePa

Ghanaian-focused nutrition PWA. The Next.js app lives in [`aduanepa/`](./aduanepa).

## Deploy on Vercel (required settings)

The Git repo root is **not** the Next.js app. If Root Directory is wrong, the build can succeed and then fail with:

```text
ENOENT: no such file or directory, lstat '/vercel/path0/.next/package.json'
```

That happens because `.next` is created under `aduanepa/.next`, while Vercel looks for it at the repo root.

### Fix in the Vercel dashboard

1. Open the project → **Settings** → **General**
2. **Root Directory** → set to `aduanepa` → Save
3. **Settings** → **Build & Development Settings**:
   - Framework Preset: **Next.js**
   - Build Command: leave default (`npm run build`) — do **not** prefix with `cd aduanepa`
   - Install Command: leave default — do **not** prefix with `cd aduanepa`
   - Output Directory: leave **empty** / default (do not set `.next` manually)
4. Redeploy

### Environment variables

Add all secrets from `aduanepa/.env.local` in **Settings → Environment Variables** (Production + Preview). At minimum:

- `DATABASE_URL`, `DIRECT_URL`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (production URL)
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (and Google redirect URI for your Vercel domain)
- Brevo, Gemini, Firebase, translation keys as used locally

Google OAuth redirect URI for production:

```text
https://YOUR_DOMAIN/api/auth/callback/google
```

## Local development

```bash
cd aduanepa
npm install
npm run dev
```
