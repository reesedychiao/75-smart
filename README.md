# 75 Smart

A personal tracker for the **75 Smart** challenge: six tasks a day, seventy-five days, no shortcuts.

The six daily tasks:

1. Deep learning session 1 (30–45 min)
2. Deep learning session 2 (30–45 min)
3. Meta-learning (15 min)
4. One piece of intellectual output
5. Read 10 pages
6. No low-value dopamine before 5 pm — and log your progress (the journal counts as the log)

**The rules:** a day only counts toward 75 when all six are done. Miss a day and the count holds — you get one chance to recover. Miss **two days in a row** and the count resets to zero. Days you skip the app entirely count as misses.

## Stack

- React 19 + TypeScript + Vite, Tailwind CSS v4
- Supabase (auth + Postgres with row-level security) so progress syncs across devices
- Vitest for the streak engine ([src/lib/streak.ts](src/lib/streak.ts)), where all counting/reset rules live as one pure, tested function

## Setup

### 1. Supabase (one-time, ~5 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of [supabase/schema.sql](supabase/schema.sql), and run it.
3. Open **Project Settings → API** and copy the project URL and the `anon public` key.
4. `cp .env.example .env.local` and fill in both values.

### 2. Run locally

```bash
npm install
npm run dev
```

Open the app, choose **Create an account**, confirm the email Supabase sends you, and sign in. That account is yours alone — row-level security keeps every row scoped to it.

### 3. Deploy to Vercel

1. Push this repo to GitHub.
2. At [vercel.com](https://vercel.com), **Add New → Project**, import the repo (Vite is auto-detected).
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as `.env.local`.
4. Deploy. Open the URL on your phone and laptop — same data everywhere.

## Development

```bash
npm test        # streak engine unit tests
npm run build   # typecheck + production build
npm run lint    # oxlint
```
