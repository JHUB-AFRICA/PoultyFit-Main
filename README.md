# PoultryFit Kenya

A feasibility-first digital planner for first-time urban poultry keepers in
Kenya, layers, broilers, ducks, quail, and turkey. Built under the JHUB
Africa Innovation Programme (JKUAT), supervised by Mr. Simon Mwangi.

PoultryFit helps a new keeper answer four questions before they spend
money: how many birds can I actually fit, what will it cost, is it legal
where I live, and what do I do if a bird gets sick.

## What it does

- **Feasibility** — recommends a flock size from your yard size, budget,
  and county bylaws, with a real bird-cost / feed-cost budget breakdown.
- **Feed plan** — least-cost feed mix from real Kenyan agrovet ingredient
  prices, per species and growth stage.
- **Bylaws** — county permit requirements as a clear checklist, not a wall
  of text.
- **Health check** — symptom-based disease triage backed by a trained
  ML model (XGBoost on 49 symptoms + two image models for bird/droppings
  photos), with camera or upload support.
- **Find help** — nearby vets and agrovets.

## Tech stack

- **Frontend + backend**: [TanStack Start](https://tanstack.com/start) (React 19), one
  combined app, server functions instead of a separate API layer
- **Database/Auth**: Supabase (Postgres + Row Level Security + Auth)
- **ML model**: Python/FastAPI, XGBoost + two Keras CNNs, deployed as its
  own separate service, see [`disease-api/`](./disease-api)
- **Styling**: Tailwind CSS

## Project layout

```
src/
  routes/       Pages (file-based routing)
  components/   UI components, organized by module
  lib/          Server functions + business logic (feasibility math,
                feed calculations, auth, disease prediction)
  hooks/        React hooks (useAuth, etc.)
  integrations/ Supabase client setup + generated types
disease-api/    The ML model service, its own Dockerfile, deployed
                separately (currently on Render)
supabase/
  migrations/   Every database schema change, in order
docs/           Everything below
```

## Running it locally

```bash
npm install
cp .env.example .env   # fill in real values, see docs/DOCKER_DEPLOYMENT.md
npm run dev
```

## Documentation

| Doc | What's in it |
|---|---|
| [`docs/BACKEND.md`](./docs/BACKEND.md) | Database tables, RLS policies, every server function and what it does |
| [`docs/DOCKER_DEPLOYMENT.md`](./docs/DOCKER_DEPLOYMENT.md) | How to run the whole app in Docker, including taking over hosting of Supabase/the ML model entirely |
| [`docs/ML_MODEL_ARCHITECTURE.md`](./docs/ML_MODEL_ARCHITECTURE.md) | How the disease-prediction model works: features, training, ensemble logic |
| [`docs/ML_MODEL_DEPLOYMENT.md`](./docs/ML_MODEL_DEPLOYMENT.md) | Deploying `disease-api/` specifically (Render or elsewhere) |

## Deployments

This app currently runs in two places at once, independently:

- **Cloudflare Workers** — `npx wrangler deploy`, the primary live
  deployment.
- **Docker** — for self-hosting anywhere else (JHUB's own servers, etc.),
  see `docs/DOCKER_DEPLOYMENT.md`.

The ML model (`disease-api/`) is deployed separately from both of the
above, currently on Render, and is called over HTTPS by whichever web app
deployment is running.

## Team

PoultryFit Kenya is built by an 8-member team spanning ML, backend,
frontend, and research, under the JHUB Africa Innovation Programme.
