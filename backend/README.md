# Table Tennis Ratings Backend (Phase 1)

This backend is focused on reliably storing **player** and **event** data scraped on-demand from RatingsCentral. APIs come later.

## What’s in here now
- NestJS app skeleton
- Prisma schema for player + event storage
- Supabase-ready database config

## Quick start
1) Install deps
```
npm install
```

2) Add `.env` (copy from `.env.example`) and set `DATABASE_URL` from Supabase

3) Generate Prisma client
```
npm run prisma:generate
```

4) Run migrations
```
npm run prisma:migrate
```

5) Inspect DB
```
npm run prisma:studio
```

## Next steps (we will build)
- Scrapers for PlayerHistory / EventSummary / EventDetail
- Ingestion scripts to validate DB writes
- Background job queue (BullMQ)
- REST endpoints
