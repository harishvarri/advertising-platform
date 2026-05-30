# BharatAd Pulse

BharatAd Pulse is a hyperlocal Indian advertisement platform focused only on ads.
It helps users discover nearby job openings, discounts, and brand campaigns across Indian cities.

## Core Features

- Nearby ad feed by city + radius (jobs, discounts, brand ads)
- Category and intent filters for shopping, food, jewellery, electronics, and more
- Search by business name, tags, city, and offer text
- Festival Spotlight cards for featured campaigns
- "Post Advertisement" workflow for businesses and local sellers
- Supabase-backed data with local sample fallback for instant demo

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind package present; custom CSS design system for unique UI
- Supabase (`@supabase/supabase-js`) for storage and APIs
- Vercel-ready configuration

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   copy .env.example .env.local
   ```
3. Fill `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (recommended for server-side insert reliability)
4. Start the app:
   ```bash
   npm run dev
   ```

If env keys are missing, the app uses curated sample ads so you can still run and test UI/UX.

## Supabase Database Setup

1. Open your Supabase project SQL editor.
2. Run [supabase/schema.sql](/C:/Users/haris/Downloads/tester-app/supabase/schema.sql).
3. Confirm `advertisements` table exists and RLS policies are applied.

## GitHub Connection

1. Initialize git in this folder if needed:
   ```bash
   git init
   ```
2. Commit:
   ```bash
   git add .
   git commit -m "Initial BharatAd Pulse app"
   ```
3. Create a GitHub repo and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/bharatad-pulse.git
   git push -u origin main
   ```

## Vercel Deployment

1. Import the GitHub repository into Vercel.
2. Add all environment variables from `.env.local` to Vercel project settings.
3. Deploy. `vercel.json` is included with India-first region preference (`bom1`).

## Build Check

```bash
npm run build
```

## Project Structure

- `app/page.tsx`: server-rendered entry, loads advertisements
- `app/api/ads/route.ts`: GET and POST API for ads
- `components/ads-explorer.tsx`: main UI (filters, feed, spotlight)
- `components/post-ad-form.tsx`: advertiser posting form
- `lib/ads-data.ts`: Supabase integration and fallback data logic
- `lib/sample-ads.ts`: sample ad dataset for demo mode
- `supabase/schema.sql`: database schema + RLS policies


# advertising-platform
