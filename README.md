# Stonnex CRM

Self-hosted lead management for **Stonnex Roofing**. Built to replace the Google Sheet as the source of truth, while keeping Make.com automations flowing.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · NextAuth · Neon Postgres · Vercel**.

---

## What it does

- Unified inbox for leads from **Meta Ads**, **Roofle**, **Google Ads**, and the **Website Form**.
- Single webhook endpoint — Make.com posts JSON, we upsert into the CRM.
- Status pipeline (New Lead → Attempted Contact → Appointment Set → Quote Sent → Closed Won / Not Interested / Bad Lead / Spam).
- Per-lead notes + activity log.
- Dashboard, filters, basic analytics.
- Single-admin password login (NextAuth credentials).

---

## Quick start (local)

```bash
pnpm i  # or npm i
cp .env.example .env   # edit values (see below)
npx prisma db push     # creates SQLite dev.db
npm run db:seed        # seeds current 35 leads
npm run dev            # http://localhost:3000
```

**Generate an admin password hash:**

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password',10))"
```

Paste it into `ADMIN_PASSWORD_HASH` in `.env`.

---

## Deploy to Vercel

1. Push this repo to GitHub (see "Push to GitHub" below).
2. Import the repo into Vercel.
3. Add a Neon Postgres integration (free tier) — it'll auto-populate `DATABASE_URL`.
4. In Prisma's `schema.prisma`, change `provider = "sqlite"` → `provider = "postgresql"` and commit.
5. Add these Vercel env vars:
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `https://stonnexcrm.com` (or Vercel preview URL initially)
   - `ADMIN_EMAIL` — `calvin@stonnex.com`
   - `ADMIN_PASSWORD_HASH` — bcrypt hash from above
   - `WEBHOOK_SECRET` — long random string
6. Deploy. After first deploy, run once in Vercel → Storage → Prisma → or locally with prod `DATABASE_URL`:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### Custom domain (stonnexcrm.com via Porkbun)

In Vercel → Project → Settings → Domains, add `stonnexcrm.com` and `www.stonnexcrm.com`. Vercel will give you DNS records to set at Porkbun:

| Host  | Type  | Value                  |
| ----- | ----- | ---------------------- |
| @     | A     | `76.76.21.21`          |
| www   | CNAME | `cname.vercel-dns.com` |

After TTL propagates (usually < 30 min), Vercel auto-issues an SSL cert. Update `NEXTAUTH_URL` env var to `https://stonnexcrm.com` and redeploy.

---

## Make.com integration

Point each of the 3 Make scenarios to the unified webhook instead of (or in addition to) Google Sheets.

### Webhook URL

```
POST https://stonnexcrm.com/api/webhooks/lead?secret={{WEBHOOK_SECRET}}
Content-Type: application/json
```

### Payload schema (minimal)

```json
{
  "externalId": "STX-036",            // optional but recommended for idempotency
  "source": "Meta Ads",                // "Meta Ads" | "Roofle" | "Google Ads" | "Website Form"
  "fullName": "Jane Doe",
  "phone": "+16045551234",
  "email": "jane@example.com",
  "address": "123 Main St",
  "city": "Surrey",
  "service": "Roof Replacement",
  "estSqFt": 2100,
  "quote": 0,
  "status": "New Lead",
  "assignedTo": "Calvin",
  "receivedAt": "2026-04-20T10:00:00Z" // optional, defaults to now
}
```

At minimum, `source` + one of (`fullName` | `phone` | `email`) is required.

Responses: `200 {ok:true, id}` on success; `400` for invalid payload; `401` if the secret is wrong.

---

## Seeding & syncing

- **`npm run db:seed`** — one-shot: inserts/upserts the current 35 leads from the Google Sheet snapshot.
- **`npm run import:sheet`** — re-syncs from the live Google Sheet (requires `GOOGLE_SERVICE_ACCOUNT_JSON_B64` + `SHEET_ID`). Safe to run repeatedly — upserts by STX id.

Create a Google service account at <https://console.cloud.google.com/>, enable the Sheets API, share the sheet with the service account email, base64 the JSON key, and paste into the env var.

---

## Project layout

```
src/
  app/
    page.tsx                  # Dashboard
    leads/                    # Lead list + detail
    analytics/                # Charts
    login/                    # Login
    api/
      auth/[...nextauth]/     # NextAuth
      leads/[id]/             # PATCH status, add notes
      webhooks/lead/          # POST new lead (from Make)
  components/                 # Reusable UI (badges, nav)
  lib/
    db.ts                     # Prisma client
    auth.ts                   # NextAuth options
    utils.ts                  # cn(), status/source normalizers, colors
prisma/
  schema.prisma
  seed.ts                     # frozen snapshot of existing leads
scripts/
  import-sheet.ts             # live re-sync from Google Sheet
```

---

## Security notes

- Single admin user (credentials provider). To add more users later: swap in a `User` model + per-user hashes.
- All non-webhook routes are protected by NextAuth middleware.
- Webhook is protected by a shared secret in the query string. Rotate via Vercel env vars.
- `rawPayload` on each Lead keeps the original webhook body for audit/debugging.

---

## Push to GitHub

```bash
# inside the repo
git init
git add .
git commit -m "Initial commit: Stonnex CRM"
git branch -M main
git remote add origin git@github.com:<your-username>/stonnex-crm.git
git push -u origin main
```

Then in Vercel, "New Project" → pick the repo → deploy.
