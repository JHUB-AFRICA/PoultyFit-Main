# PoultryFit Kenya — Backend

This project runs on Lovable Cloud (Postgres + Auth + Storage under the hood).
App-internal logic is served by **TanStack server functions** at same-origin
routes — no separate edge deploy needed.

## Tables

| Table                    | Purpose                                             | Access                        |
| ------------------------ | --------------------------------------------------- | ----------------------------- |
| `profiles`               | User profile (auto-created on signup via trigger)   | Owner only                    |
| `user_roles`             | RBAC (`user` / `admin`); role checked via `has_role()` | Read own row                |
| `poultry_types`          | Species catalogue                                   | Public read, admin write      |
| `feed_prices`            | Brand / feed-type / KES per kg / county             | Public read, admin write      |
| `county_bylaws`          | Permit rules + setbacks per county / sub-county     | Public read, admin write      |
| `vets`                   | Vet + agrovet directory with lat/lng                | Public read, admin write      |
| `diseases`               | Reference of poultry diseases                       | Public read, admin write      |
| `farms`                  | A user's farm setup                                 | Owner only                    |
| `feasibility_reports`    | Saved feasibility calculations                      | Owner only                    |
| `disease_predictions`    | History of ML disease checks                        | Owner only                    |

## Reference-data queries (direct from the browser)

Public reference tables have `SELECT` policies for `anon` + `authenticated`,
so the frontend reads them straight through `@/integrations/supabase/client`:

```ts
const { data } = await supabase.from('feed_prices').select('*').eq('county', 'Kiambu');
const { data } = await supabase.from('vets').select('*');
const { data } = await supabase.from('county_bylaws').select('*').eq('county', 'Kiambu');
const { data } = await supabase.from('poultry_types').select('*');
```

## Server functions

Import via `useServerFn(...)` from `@tanstack/react-start`.

### `predictDisease` — `src/lib/disease.functions.ts`

- **Auth**: required
- **Input**: `{ symptoms: string[], species?: string }`
- **Output**:
  ```ts
  {
    source: 'ml' | 'stub',
    top: { slug, name, score, urgency, prevention, treatment_notes } | null,
    ranked: DiseaseMatch[],
    advice: string,
    logged_id: string | null
  }
  ```
- **Behaviour**: If `ML_SERVICE_URL` + `ML_SERVICE_API_KEY` secrets are set,
  POSTs `{symptoms, species}` to the ML service with a Bearer token and
  expects `{ top_slug: string, ranked: [...] }`. Otherwise falls back to a
  keyword-overlap match against the `diseases` table (`source: 'stub'`).
  Always writes a row to `disease_predictions` for the current user.

### `saveFeasibilityReport` — `src/lib/reports.functions.ts`

- **Auth**: required
- **Input**: `{ farm_id?: string, inputs: object, results: object }`
- **Output**: `{ id: uuid, created_at: string }`
- **Behaviour**: Persists the report to `feasibility_reports` (RLS-scoped).

### Feasibility math

`computeFeasibility()` is a deterministic pure function and stays in
`src/lib/poultry-calc.ts` (client-side). It doesn't need a server round-trip;
results are persisted by calling `saveFeasibilityReport` afterwards.

## Secrets

Add these when the ML team publishes the service — until then `predictDisease`
runs in stub mode automatically:

| Secret                | What it is                                               |
| --------------------- | -------------------------------------------------------- |
| `ML_SERVICE_URL`      | Full URL to the disease-prediction endpoint              |
| `ML_SERVICE_API_KEY`  | Bearer token the ML service expects                      |

## Auth

- Email + password
- Google sign-in via `@/integrations/lovable/index` (`lovable.auth.signInWithOAuth('google', ...)`)
- New signups get a `profiles` row automatically via the `on_auth_user_created` trigger
