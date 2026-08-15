# PoultryFit Kenya — Docker Deployment Guide

Hi JHUB team — this document covers everything you need to get PoultryFit
running on your own servers using Docker.

## Architecture, read this first

This repository contains **only the main web app** (our frontend plus its
backend server functions, one combined Node.js process). Two other pieces
we run separately are **not part of this Docker image**:

1. **Database** — we use Supabase (hosted, cloud). This app connects to it
   over the internet using the credentials we'll give you below. Nothing
   for you to deploy here.
2. **Disease-prediction ML model** — a separate FastAPI service we've
   already deployed on Render, already running. This app calls it over
   HTTPS. You'll see a `disease-api/` folder in this repo too, that's a
   *different, independent* Docker setup (its own `Dockerfile` inside that
   folder) for that separate service — you don't need to build or run it
   unless you're specifically taking over hosting of the ML model too (see
   the section on that below).

**Requirement:** the server you run this container on needs outbound
internet access to reach both of those services. This isn't an
offline-capable deployment as-is.

## What you need before starting

We'll give you six values, treat all of them as secrets (don't commit
them, don't paste them anywhere public):

| Variable | Where we get it from |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | Same page, "Publishable key" |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, "Secret keys" section |
| `ML_SERVICE_URL` | Our deployed model's Render URL, e.g. `https://poultryfit-disease-api.onrender.com` |
| `ML_SERVICE_API_KEY` | The API key we configured on that Render service |
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console → Credentials (used for our vet/agrovet finder feature) |

Reach out to us directly for these six values, they're not stored in this
repository.

## Build and run

```bash
# 1. Copy the template and fill in the six values above
cp .env.example .env

# 2. Build the image
docker build -t poultryfit .

# 3. Run it
docker compose up -d
```

The app listens on port 3000 inside the container. Our `docker-compose.yml`
maps that to port 3000 on the host by default, edit the `ports:` line in
that file if you need a different host port (e.g. `"8080:3000"` to expose
it on 8080 instead).

To run without docker-compose, equivalently:

```bash
docker run -d -p 3000:3000 --env-file .env --name poultryfit poultryfit
```

## Verifying it's working

```bash
curl -I http://localhost:3000/
```

Expect `HTTP/1.1 200 OK`. Then open `http://<your-server-address>:3000` in a
browser and confirm the homepage loads, sign-in works, and the dashboard
shows data after onboarding.

If you're putting this behind a reverse proxy (nginx, Caddy, etc.) for a
real domain and HTTPS, that's standard reverse-proxy-to-port-3000
configuration on your end, nothing app-specific we need to change for that.

## Updating to a new version later

```bash
git pull
docker compose down
docker build -t poultryfit .
docker compose up -d
```

## Logs

```bash
docker compose logs -f
```

## If you'd rather have full ownership (your own Supabase project and your own model hosting)

Everything above assumes you run the web app container but still point at
*our* Supabase project and *our* Render-hosted model. That's the fastest
path to get started, but it means you're depending on our accounts staying
active. If you'd rather be fully independent instead, owning both pieces
yourselves, here's how.

### Option A: We transfer our existing Supabase project to you (keeps all real data)

Supabase supports transferring a project to a different organization
account directly, no data loss, nothing to re-enter.

1. On our end, we go to Project Settings → General → Transfer project.
2. We'll need your Supabase organization name/ID, so create a free
   Supabase account and organization on your side first, then send that to
   us.
3. Once you accept, the Project URL usually stays the same, but double
   check Project Settings → API afterward, and update `SUPABASE_URL`,
   `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in your
   `.env` if anything changed.

We'd recommend this option if keeping real farmer data (accounts, saved
farm profiles) matters to you.

### Option B: Start a brand new Supabase project under your own account

Use this instead if a clean slate is fine (no existing user data carried
over), or if a transfer isn't possible for some reason.

1. Create a new Supabase project under your own account.
2. Every file in `supabase/migrations/` in this repo, run them **in
   filename order** (they're timestamp-prefixed, so sorting alphabetically
   is sorting chronologically), either by pasting each into your new
   project's SQL editor one at a time, or via `supabase db push` if you're
   using the Supabase CLI linked to your new project.
3. Update `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` in `.env` to your new project's values
   (Project Settings → API).
4. In your new project's Authentication → URL Configuration, set the Site
   URL and Redirect URLs to wherever this app will actually be reached
   (your server address or domain), and set up Google OAuth credentials
   under Authentication → Providers if you want to keep Google sign-in,
   you'll need your own Google Cloud OAuth client, a new one per Supabase
   project.

### Taking over the ML model too

The model already has its own, separate Dockerfile at `disease-api/Dockerfile`,
independent of everything above. Two ways to make it yours:

**B1. Deploy it to your own Render account** (same steps we originally
used ourselves): New Web Service → connect this repo → root directory
`disease-api` → Docker environment → set one environment variable,
`API_KEY`, to any random string you generate. Update `ML_SERVICE_URL` and
`ML_SERVICE_API_KEY` in `.env` to match.

**B2. Self-host it alongside the web app**, no Render at all, since you'll
already have a Docker-capable server for the main app. Add it as a second
service in `docker-compose.yml`:

```yaml
services:
  poultryfit:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped

  disease-api:
    build: ./disease-api
    ports:
      - "8000:8000"
    environment:
      - API_KEY=set-a-real-random-value-here
    restart: unless-stopped
```

Then set `ML_SERVICE_URL=http://disease-api:8000` in `.env` (that's the
internal Docker network address, containers on the same compose file can
reach each other by service name, no public URL needed for this internal
connection) and `ML_SERVICE_API_KEY` to match the value used above.

This option means your server needs enough RAM to run the model
comfortably. The RAM constraints we hit earlier were specific to Render's
free tier, not a hard requirement of the model itself, a normal server has
plenty of headroom for this.

## This doesn't affect our existing Cloudflare deployment

We also separately run this app on Cloudflare Workers
(`poultryfit.poultryfit-kenya.workers.dev`), which we maintain
independently via `npx wrangler deploy`. That deployment keeps running as
usual regardless of what you do with this Docker setup, they're two
separate, independent copies of the same app.

Questions, just reach out to us directly.