# Orion — agent instructions

Orion is a Spotify companion app: smart playlists, fast liking, playlist and liked-songs analytics, and a small social circle (max 5 users). Mobile app (Expo / React Native) + web app (Next.js), one shared backend on Supabase.

**The full spec is `docs/SPEC.md`. It is the source of truth. Read the relevant section before every task.**

## Current phase

Phase 1 — Sign in and live sync. Do not start a later phase until every acceptance check of the current one passes. Update this line when a phase is done.

## Stack

- pnpm workspaces + Turborepo, TypeScript strict everywhere, Zod for all API input/output
- `apps/mobile`: Expo (latest SDK), Expo Router, NativeWind, Victory Native, TanStack Query, Zustand
- `apps/web`: Next.js App Router, Tailwind, shadcn/ui, Recharts, TanStack Query. Also hosts `/api/*` for both apps
- Supabase: Postgres (RLS on every table), Auth, Storage, Edge Functions + pg_cron for background jobs
- i18n: i18next, shared `en.json` + `nl.json` in `packages/i18n`
- Tests: Vitest (logic), Playwright (web), Maestro (mobile)

## Repo layout

```
apps/mobile        Expo app
apps/web           Next.js app + API routes
packages/core      Pure TS: types, zod schemas, generators, stats math (no I/O)
packages/db        Generated DB types, seed
packages/spotify   The ONLY place that calls Spotify
packages/lastfm    The ONLY place that calls Last.fm
packages/api-client  Typed client + TanStack Query hooks
packages/i18n      Translations
packages/ui-tokens Shared colors, spacing, type
packages/config    eslint, tsconfig, prettier
supabase/migrations  SQL migrations (schema source of truth)
supabase/functions   Edge Functions (job runner)
docs/              SPEC.md, OPEN_QUESTIONS.md, adr/
```

## Rules

1. Work one phase at a time. Finish every task by running `pnpm lint`, `pnpm typecheck` and `pnpm test`.
2. Spotify is a Development Mode app (max 5 users, Feb 2026 restrictions). Never use removed endpoints: `/recommendations`, `/audio-features`, `/audio-analysis`, `/artists/{id}/related-artists`, `/artists/{id}/top-tracks`, batch `GET /tracks|/albums|/artists`, `/users/{id}`, `/browse/*`.
3. Use the new endpoints: like/unlike via `PUT|DELETE /me/library` with URIs, playlist items via `/playlists/{id}/items` (field `items.items[].item`), create playlists via `POST /me/playlists`. Search `limit` max is 10.
4. Check Spotify's Web API changelog before adding any new Spotify call.
5. Schema changes only through new SQL files in `supabase/migrations`; regenerate DB types in the same change.
6. Business logic lives in `packages/core` as pure functions with unit tests. API routes and jobs only fetch data, call core, and write results.
7. No hard-coded user-facing text. Every string goes in both `en.json` and `nl.json` in the same change.
8. Never log, return or send Spotify tokens to clients. Tokens are encrypted at rest and readable only by the service role.
9. Every Spotify and Last.fm call goes through the shared rate limiter.
10. Smart playlist refreshes keep tracks the user added by hand and never re-add tracks they removed (`smart_playlist_overrides`).
11. When the spec is unclear, add the question to `docs/OPEN_QUESTIONS.md`, pick the simplest option, and don't invent features.
12. Record bigger decisions as short ADRs in `docs/adr/`.
13. Keep each change to one feature. Include screenshots for UI changes.
14. Tests never call real Spotify or Last.fm APIs; use recorded responses (MSW).

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
