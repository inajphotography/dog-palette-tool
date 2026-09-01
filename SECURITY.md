# Security setup: Dog Palette Tool

This is a no-login, no-database tool. A photo is sent to Claude for analysis and
nothing is stored, so the main risk is someone looping the paid Claude call to run
up cost. The hardening below targets that.

## What the code already does

- **API key is server-side only.** `ANTHROPIC_API_KEY` is read only inside the
  `/api/analyse` route. It never reaches the browser.
- **Origin check** allows same-origin requests (works for any white-label domain)
  and rejects cross-site browser calls (`lib/security.ts`).
- **Per-IP rate limit** (8 analyses/min) as best-effort backup.
- **Body-size cap** rejects oversized image uploads (over ~5MB).
- **Media-type allowlist** (JPG, PNG, WebP only).
- **Generic error messages** to the client; full detail is logged server-side only.
- **Security headers** (CSP, HSTS, X-Frame-Options, etc.) via `next.config.ts`.

## You need to do (dashboard steps, I can't do these)

### 1. Mark the API key "Sensitive" in Vercel
In **Vercel → Project → Settings → Environment Variables**, toggle **Sensitive**
on for `ANTHROPIC_API_KEY` so the value can't be read back from the dashboard.
Rotate it at console.anthropic.com if it has been shared around.

### 2. Add a Vercel Firewall rate-limit rule (the hard ceiling)
- **Vercel → Project → Firewall → Configure → Add Rule.**
- Match path `/api/*`, action **Rate Limit**, e.g. 15 requests/min per IP.
- This is the bulletproof layer; the in-code limiter is best-effort backup.

### 3. (Optional) `ALLOWED_ORIGINS`
Same-origin requests are always allowed, so you usually don't need this. If you
embed the tool on a different domain, set `ALLOWED_ORIGINS` (comma-separated) to
that origin.

## Note for white-label deploys
The headers set `frame-ancestors 'self'`, so the tool can't be iframed on a client's
own website by default. If a client wants to embed it, relax `frame-ancestors` in
`next.config.ts` to include their domain.

## Before promoting to production
Deploy to a **Vercel preview** first and run one real photo through it. The CSP is
tight (self only). If you add any third-party script later, update the CSP in
`next.config.ts` or it will be blocked.
