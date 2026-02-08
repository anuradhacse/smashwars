# SmashWars 🏓

Table tennis player ratings dashboard. Track your rating, match history, win rate, and club leaderboard using data from [RatingsCentral](https://www.ratingscentral.com/).

## Architecture

```
frontend/          React + Vite + MUI (SPA)
backend/           NestJS + Prisma (REST API)
backend/prisma/    PostgreSQL schema & migrations (Supabase)
```

- Frontend calls backend via `VITE_API_BASE_URL`, authenticated with `x-api-key` header
- Backend connects to Supabase PostgreSQL via Prisma
- Player/event data is scraped from RatingsCentral and stored locally

## Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase free tier works)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL and API_KEY
npm install
npx prisma generate
npx prisma migrate dev
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL and VITE_API_KEY
npm install
```

## Run locally

```bash
# Terminal 1 — backend (port 3001)
cd backend
npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend
npm run dev
```

## Build

```bash
# Frontend
cd frontend && npm run build    # outputs to dist/

# Backend
cd backend && npm run build     # outputs to dist/
node dist/main.js               # start production server
```

## Sync data

```bash
# Sync a player's match history
cd backend
npm run sync:player -- <playerId>

# Sync club roster
npm run sync:club -- <clubId>
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `API_KEY` | API key for request authentication |
| `CORS_ORIGINS` | Comma-separated allowed origins (default: `http://localhost:5173`) |
| `PORT` | Server port (default: `3001`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL (default: `http://localhost:3001/v1`) |
| `VITE_API_KEY` | API key matching backend |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Player not found` on dashboard | Run `npm run sync:player -- <id>` to load data |
| Club leaderboard empty | Run `npm run sync:club -- <clubId>` |
| Prisma errors after schema change | Run `npx prisma generate` then `npx prisma migrate dev` |
| CORS errors in browser | Check `CORS_ORIGINS` in backend `.env` matches your frontend URL |
| Avatar upload fails silently | Image may exceed 500KB after compression — check network tab |

## Deployment

- **Frontend**: Vercel (auto-deploys from `main`)
- **Backend**: Render (auto-deploys from `main`)
- **Database**: Supabase PostgreSQL
- **CI**: GitHub Actions runs lint + typecheck + build on every PR

## License

MIT
