# Skeptr — Landing Page (A/B) + Resend signup capture

A single-page A/B test to validate demand for an independent, cross-model AI answer
fact-checker. Two variants (A = "ask all models / disagreement", B = "fact-check / sources")
are shown 50/50; signups + a willingness-to-pay answer are emailed to you via Resend.

## Files
- `index.html`      the landing page (both variants built in)
- `api/signup.js`   Vercel serverless function → sends each signup to you via Resend
- `package.json`    marks the project as ES modules

## Deploy (Vercel + GitHub — same stack as Guardian)

1. Push this folder to a GitHub repo.
2. In Vercel: New Project → import that repo → deploy (no build settings needed;
   it's static HTML + one serverless function).
3. In Vercel → Project → Settings → Environment Variables, add:
   - `RESEND_API_KEY`  your Resend key (re_...)
   - `SIGNUP_TO`       the address that should receive signup notifications
   - `SIGNUP_FROM`     a verified Resend sender, e.g. `Skeptr <hello@yourdomain.com>`
                       (for first tests you may use `onboarding@resend.dev`, which only
                        delivers to your own Resend account email — fine for testing)
4. Redeploy so the variables take effect.

## Point a domain (all-inkl) at it (once the name is decided)
- In Vercel → Project → Settings → Domains, add your domain.
- In all-inkl DNS, set the records Vercel shows you (usually a CNAME/A record).
- Add the same domain in Resend and verify it (DKIM/SPF records in all-inkl DNS) so
  your beta-launch emails don't land in spam. Then set `SIGNUP_FROM` to that domain.

## A/B testing
- Random 50/50 by default (sticky per visitor).
- Force a variant with `?v=A` or `?v=B` in the URL — useful when seeding different
  posts. Measure which variant gets the higher signup rate.

## Local note
Opened directly as a file, the form falls back to storing signups in the browser
(localStorage) because `/api/signup` only exists on Vercel. Click the small counter
box (bottom-right) to export those local test signups as CSV. Once deployed on Vercel,
real signups are emailed to you via Resend.
