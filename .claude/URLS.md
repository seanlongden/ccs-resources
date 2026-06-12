# CCS Resources — Critical URLs

**Last updated**: 2026-06-12

## Live site

- **Production**: https://ccs-resources-yl2ha.ondigitalocean.app/
- **VSL / sales page**: https://vsl.closingclientssystem.com/ (external — not in this repo)

## Repo + deploy

- **GitHub**: https://github.com/seanlongden/ccs-resources
- **DigitalOcean App Platform**: https://cloud.digitalocean.com/apps (search "ccs-resources")
- **Auto-deploy branch**: `main`

## Auth integrations

- **Stripe Dashboard**: https://dashboard.stripe.com/ (uses LIVE key — `STRIPE_SECRET_KEY` in DO App Spec)
- **Google Sheets — Lifetime Members**: referenced via `GOOGLE_SHEET_ID` env var. Sheet ID is in DO App Spec.

## Local paths (Sean's Mac)

- **Repo**: `/Users/seanlongden/Projects/ccg-resources/`
- **CCSYSTEM source material** (for content writing): `/Users/seanlongden/Desktop/CCSYSTEM/`
- **Matt's original HTML** (migration source — kept for reference): `/tmp/ccs_research/matts_resources/CCSresources/index.html`
- **Legacy CCG Notion export**: `/Users/seanlongden/Desktop/ALL/CCG/CLOSINGCLIENTSGROUP Resources/`

## Local dev

- **Dev server**: http://localhost:5000 (or 3000 if AirPlay clash)
- **Login emails to test as owner**: seanlongden0@gmail.com, sean@closingclients.com, sean@closingclientsgroup.com (admin status comes from `src/lib/admin.ts`)
