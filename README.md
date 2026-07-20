# AduanePa

Ghanaian-focused nutrition PWA. The Next.js app lives in [`aduanepa/`](./aduanepa).

## Deploy on Vercel

### Critical: Root Directory must be empty

The deploy config at the **repo root** builds `aduanepa/` and mirrors `.next` to where Vercel expects it.

1. Vercel project → **Settings** → **General**
2. **Root Directory** → clear it / leave **empty** (not `aduanepa`) → Save  
   If it still says `aduanepa`, click Edit → erase the value → Save.
3. **Settings** → **Build & Development Settings**:
   - Framework Preset: **Next.js** (or leave as detected)
   - Override Build / Install only if needed — root `vercel.json` already sets them
   - **Output Directory**: leave empty (do not set `.next` manually)
4. If present, turn **off** “Include files outside the root directory in the Build Step”
5. Commit + push the latest root `package.json`, `vercel.json`, and `scripts/sync-next-output.mjs`, then **Redeploy**

### Why this error happens

```text
ENOENT: no such file or directory, lstat '/vercel/path0/.next/package.json'
```

Vercel’s packager looks for `.next` at the **Git repo root**. A Root Directory of `aduanepa` builds into `aduanepa/.next`, but the packager still resolves `/vercel/path0/.next`. The sync script copies the build output to the repo root so that path exists.

### Environment variables

Add secrets from `aduanepa/.env.local` under **Settings → Environment Variables** (Production + Preview):

- `DATABASE_URL`, `DIRECT_URL`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your production URL)
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- Brevo, Gemini, Firebase, translation keys

Google OAuth redirect URI:

```text
https://YOUR_DOMAIN/api/auth/callback/google
```

## Local development

```bash
cd aduanepa
npm install
npm run dev
```
