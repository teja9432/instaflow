# Instagram Comment & DM Automation Multi-Tenant SaaS

A premium, multi-tenant SaaS application that enables Instagram Business and Creator accounts to automate comment-to-DM lead generation workflows with follow guards (verifies the user is following your profile before dispatching a downloadable asset like a PDF).

---

## Tech Stack Overview

- **Frontend**: React.js with **Material UI (MUI v5+)** with Outfit typography, custom dark-mode gradients, visual line charts (Chart.js), and DataGrids.
- **Backend**: **Next.js App Router** serverless API routing for authentication, Meta OAuth flow, and webhook handling.
- **Database/ORM**: **Prisma ORM** with **SQLite** configured by default for instant local setup (easily swapped to PostgreSQL/Supabase).
- **Authentication**: JWT-based session token storage with password hashing (bcryptjs).

---

## Getting Started

### 1. Installation

Install project dependencies:
```bash
npm install
```

### 2. Database Migration & Seeding

Deploy database migrations and generate the Prisma Client:
```bash
# Initialize SQLite database and run schema migrations
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed the database with the Demo account and historical metrics logs
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
```

### 3. Start Development Server

Run the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing Dashboard Features (Quick Sandbox Demo)

To test the application instantly without configuring a Meta App:
1. On the landing page or login screen, click **"Sign In with Demo Creator"**.
2. This uses the seeded credentials `demo@instaflow.com` / `demopass123`.
3. In the **Dashboard** home screen, navigate to the **Webhook Lead Simulator** on the right.
4. Select one of the pre-configured automation posts (e.g. *Post: ig_post_111*).
5. Type in the trigger keyword (e.g. `PDF` or `GUIDE`).
6. Select a simulated user:
   - **Sarah (Follower status = TRUE)**: Triggers the success branch, sending the customized download link.
   - **Matt (Follower status = FALSE)**: Triggers the fallback branch, prompting them to follow you first.
7. Click **"Execute Webhook Trigger"** to run the live webhook endpoint locally.
8. Watch the timeline chart, KPI statistics, and **Recent Automation Events** logs update instantly!

---

## Integrating with Meta API (Production Ready)

To test with real Instagram accounts, configure your Facebook Developer App:

1. **Create Facebook Developer App**: Set up a "Consumer" or "Business" app at [developers.facebook.com](https://developers.facebook.com).
2. **Add Products**: Add **Facebook Login for Business** and **Instagram Graph API**.
3. **Configure Redirect URI**: Set OAuth Redirect URI to `https://<your-domain>/api/instagram/callback`.
4. **Setup Webhooks**:
   - Expose your local Next.js instance via **ngrok**: `ngrok http 3000`.
   - In Facebook Developer App, set webhook Callback URL to `https://<ngrok-domain>/api/webhooks/instagram`.
   - Set Verification Token to match `META_WEBHOOK_VERIFY_TOKEN` in your `.env`.
   - Subscribe to the `comments` field under **Instagram**.
5. **Populate `.env`**:
   Update your `.env` variables with your specific credentials:
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `META_WEBHOOK_VERIFY_TOKEN`
   - `NEXT_PUBLIC_APP_URL` (change from localhost to your ngrok or production URL)
