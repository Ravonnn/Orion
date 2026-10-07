# Orion

Spotify companion app — smart playlists, fast liking, analytics, and a small social circle.

See [`docs/SPEC.md`](docs/SPEC.md) for the product spec and [`AGENTS.md`](AGENTS.md) for agent instructions.

## Setup

```bash
pnpm install
pnpm dev          # starts local Supabase + web + mobile
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Supabase + Next.js + Expo |
| `pnpm lint` | ESLint across the monorepo |
| `pnpm typecheck` | TypeScript across the monorepo |
| `pnpm test` | Vitest (unit) |
| `pnpm db:test` | pgTAP RLS tests |
| `pnpm db:types` | Regenerate `packages/db` types from local DB |

Cloud Supabase project URL/key live in `.env.local` (gitignored). Local `pnpm dev` overrides them with values from `supabase status`.
