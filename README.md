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

```bash
npm install
npm run dev
```

Open the app, choose **Create an account**, confirm the email Supabase sends you, and sign in.

## Development

```bash
npm test        # streak engine unit tests
npm run build   # typecheck + production build
npm run lint    # oxlint
```
