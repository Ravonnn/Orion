# Orion — Product & Build Spec

Oct 7, 2026 · @Timo

## Overview

Orion is a Spotify companion for building smarter playlists, liking songs faster, and seeing deep stats about your playlists and liked songs. It runs as a React Native app (iOS + Android via Expo) and a Next.js web app, sharing one backend.

**Audience:** the owner plus up to 4 friends (5 Spotify accounts total). This is a hard Spotify limit for Development Mode apps, not a choice.

**Goals**

- Generate playlists from your own listening: on repeat, recent songs, songs alike, forgotten likes, plus a group blend.
- Let any generated playlist be a one-time snapshot or auto-update on a schedule.
- Make liking fast: bulk like from recents, swipe review, like + add to playlist in one tap, clean-up suggestions.
- Analytics in the spirit of stats.fm, but centered on playlists and liked songs.
- Social layer for the 5 users: compare, blend, leaderboards, full history visible to friends.
- Weekly recap and a yearly Wrapped-style recap.
- UI in English and Dutch.

**Non-goals (v1)**

- Public launch or open signup.
- Music playback inside Orion (we open tracks in Spotify instead).
- Audio analysis (tempo, energy, mood). Spotify removed this data for new apps.
- Paid features, ads or subscriptions.

## Spotify API constraints and workarounds

Orion is a new Development Mode app, so it gets the most restricted version of the Spotify Web API. Every feature in this spec is designed around the limits below. Agents must never use an endpoint from the "Removed" table, even if a tutorial shows it.

**Account limits**

- Max 5 users per app; each must be added by Spotify account email to the allowlist in the Developer Dashboard.
- The app owner needs active Spotify Premium. If it lapses, the app stops working for everyone.
- Extended Quota Mode (more users) is only for registered organizations, so Orion stays at 5.
- Rate limits are a rolling 30-second window, shared across all Client IDs on the owner's account. A 429 can carry reason `QUOTA_EXCEEDED`; always respect `Retry-After`.

**Removed or restricted, and what Orion does instead**

| Removed / restricted | Impact | Orion workaround |
| --- | --- | --- |
| `GET /recommendations` | No Spotify recommendations | Last.fm `track.getSimilar` + `artist.getSimilar`, matched back to Spotify |
| `GET /audio-features`, `/audio-analysis` | No tempo, energy, mood | Not used. Last.fm tags (`track.getTopTags`) as a rough genre/mood signal |
| `GET /artists/{id}/related-artists`, `/top-tracks` | No related artists | Last.fm `artist.getSimilar` |
| Batch `GET /tracks`, `/albums`, `/artists` | One request per item | Cache every track/artist/album in our DB; only fetch unknown IDs, throttled |
| `popularity`, `followers`, artist `genres` reliability | No popularity sorting | Use our own play counts across the 5 users |
| `GET /users/{id}`, `/users/{id}/playlists` | Can't read a friend's Spotify data via their ID | Each user's data is synced with their own token; friends see it through Orion's DB |
| Playlist `items` only for owned/collab playlists | No track lists for followed playlists | Playlist stats only cover playlists the user owns or collaborates on |
| Search `limit` max 10 | More calls when matching | Use precise queries (`track:… artist:…`), take first match |
| `GET /me` no longer returns `email`, `country`, `product` | Can't read email or Premium status | Invite flow stores email typed by owner; market from track data |
| Recently played returns only last 50 plays | No deep history | Import Spotify data export + poll every 15–30 min |

**Endpoint names to use (post-Feb 2026)**

- Like/unlike: `PUT /me/library` and `DELETE /me/library` with Spotify URIs (`spotify:track:…`). Not `/me/tracks`.
- Check liked: `GET /me/library/contains` with URIs.
- Playlist items: `GET|POST|PUT|DELETE /playlists/{id}/items`. Not `/tracks`. Response field is `items.items[].item`.
- Create playlist: `POST /me/playlists`.
- Still available and used: `GET /me`, `GET /me/tracks` (read liked songs), `GET /me/playlists`, `GET /me/player/recently-played`, `GET /me/top/{artists|tracks}`, `GET /tracks/{id}`, `GET /artists/{id}`, `GET /search`, `PUT /playlists/{id}` (details), `PUT /playlists/{id}/images`.

Agents must check the [February 2026 migration guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide) and the latest Spotify changelog before implementing any Spotify call.

## Tech stack and monorepo

One TypeScript monorepo with two apps and shared packages. The Next.js app is also the API that the mobile app calls. Heavy and scheduled work runs in Supabase, not on Vercel.

&#91;embedded content: Orion architecture · 2 clients, 1 API, Supabase, 3 external services\]

Clients never hold Spotify tokens; anything that touches Spotify or Last.fm runs on the server side.

| Layer | Choice | Notes |
| --- | --- | --- |
| Monorepo | pnpm workspaces + Turborepo | One `pnpm dev` starts web, mobile and Supabase locally |
| Language | TypeScript (strict) everywhere | Zod for every API input/output |
| Mobile | Expo (latest SDK), Expo Router, React Native | Dark, mobile-first; Expo Dev Client; EAS Build for installs |
| Mobile styling | NativeWind (Tailwind classes) | Same design tokens as web |
| Mobile charts | Victory Native (XL, Skia-based) | Charts tab + stat screens |
| Web | Next.js (App Router), React Server Components | Also hosts `/api/*` routes for both apps |
| Web styling | Tailwind + shadcn/ui | Same tokens as mobile |
| Web charts | Recharts |  |
| Data fetching | TanStack Query on both clients | Shared query keys from `packages/api-client` |
| Client state | Zustand | Selection mode, swipe queue, UI prefs |
| Database | Supabase Postgres | Row Level Security on all user tables |
| Auth | Supabase Auth with custom Spotify sign-in | See Auth section |
| File storage | Supabase Storage | Generated playlist covers and recap share images (private bucket); exports are parsed on device, not stored |
| Background jobs | Supabase `pg_cron` + Edge Functions + a `jobs` table | Polling, syncs, imports, auto-playlists, recaps |
| Hosting | Vercel (web + API), Supabase (DB, jobs, storage), EAS (mobile builds) |  |
| Push notifications | Expo Push Service | Tokens stored per device |
| i18n | i18next + react-i18next, shared JSON in `packages/i18n` | `en` and `nl`; default from device language |
| Testing | Vitest (logic), Playwright (web), Maestro (mobile flows) |  |
| Errors | Sentry (web + mobile) | Free tier |

Why jobs run in Supabase: Vercel's Hobby plan only allows cron once per day and has short function timeouts. Polling every 15–30 minutes and importing large export files needs longer, more frequent runs. Check current Vercel and Supabase plan limits before building.

**Folder structure**

```
orion/
  apps/
    mobile/            Expo app (Expo Router: app/(tabs)/...)
    web/               Next.js app + /app/api route handlers
  packages/
    core/              Pure TS: types, zod schemas, playlist generators, stats math
    db/                Supabase migrations, seed, generated DB types
    spotify/           Spotify Web API client: token refresh, rate limiter, typed calls
    lastfm/            Last.fm client + track matching to Spotify
    api-client/        Typed client for Orion's own API, TanStack Query hooks
    i18n/              en.json, nl.json, i18next setup
    ui-tokens/         Colors, spacing, typography shared by NativeWind + Tailwind
    config/            eslint, tsconfig, prettier presets
  supabase/
    functions/         Edge Functions (jobs)
    migrations/        SQL (source of truth for schema)
  docs/                This spec, ADRs, API notes
```

**Rules**

- All business logic (generators, stats, scoring) lives in `packages/core` with no I/O, so it is unit-testable and shared.
- Only `packages/spotify` talks to Spotify; only `packages/lastfm` talks to Last.fm.
- Clients never call Spotify directly; they call Orion's API. Spotify tokens never reach the client.

## Auth, invites and tokens

Users sign in with Spotify only, and only with a valid invite code or an existing account. The server holds Spotify tokens; clients only hold an Orion (Supabase) session.

**Spotify OAuth**

- Flow: Authorization Code with PKCE, handled by the Next.js API.
- Redirect URI: `https://<domain>/api/auth/spotify/callback` (HTTPS required; also register `http://127.0.0.1:3000/...` for local dev).
- Scopes: `user-read-recently-played`, `user-top-read`, `user-library-read`, `user-library-modify`, `playlist-read-private`, `playlist-read-collaborative`, `playlist-modify-private`, `playlist-modify-public`, `ugc-image-upload`, `user-read-currently-playing`.

**Sign-in flow**

1. User opens the app, enters an invite code (first time only), taps "Continue with Spotify".
2. Client calls `GET /api/auth/spotify/start?platform=web|mobile&invite=CODE`. Server stores `state`, PKCE verifier, platform and invite in a short-lived `auth_states` row (10 min), then redirects to Spotify.
   - Mobile opens this URL with `expo-web-browser` (`openAuthSessionAsync`).
3. Spotify redirects to the callback. Server checks `state`, exchanges the code, calls `GET /me` for the Spotify user ID and display name.
4. Server finds the user by `spotify_user_id`. If new: invite must be valid, unused and not expired, and the app must have fewer than 5 users. Otherwise show a clear error screen.
5. Server creates/updates the Supabase user (admin API), stores tokens encrypted, then:
   - Web: sets the Supabase session cookie and redirects to `/`.
   - Mobile: redirects to `orion://auth/callback?code=<one-time code>`. The app exchanges that code at `POST /api/auth/mobile/exchange` for a Supabase session, stored in `expo-secure-store`. Never put tokens in the URL.
6. First sign-in triggers the onboarding jobs (library sync, top items, recently played).

**Invites**

- Only the owner (`profiles.role = 'owner'`) can create invites in Settings.
- Invite = 8-character code, the friend's Spotify email, expires after 14 days, single use.
- After creating an invite, the app shows a reminder: "Add this email to the allowlist in the Spotify Developer Dashboard", with a link. Spotify login fails for that friend until this is done; the error screen explains it.
- Owner can revoke an invite or remove a user (removes all their data).

**Token storage and refresh**

- Refresh and access tokens are encrypted with AES-256-GCM using a key from env (`TOKEN_ENCRYPTION_KEY`), or Supabase Vault.
- `packages/spotify` gets a valid access token per user: refresh if it expires within 5 minutes; on 401 refresh once and retry; on `invalid_grant` mark the connection `needs_reauth` and notify the user.
- Tokens are only readable by the service role, never by RLS-exposed queries.

**Last.fm (optional)**

- Users enter their Last.fm username in Settings. Orion validates it with `user.getInfo`.
- Public data (`user.getRecentTracks`) is read with Orion's API key; no Last.fm login needed.

**Account deletion**

- Settings has "Delete my Orion data": deletes all rows for that user, uploaded exports and tokens. It does not touch the user's Spotify account or playlists.

## Data model

Postgres in Supabase, defined only through SQL migrations in `supabase/migrations`. Catalog tables (tracks, artists, albums) are shared by all users; everything else is per user. Expected size: up to about 1 million play rows across 5 users, so no partitioning is needed.

**Table groups**

| Group | Tables | Owner |
| --- | --- | --- |
| Users and access | `profiles`, `spotify_connections`, `invites`, `auth_states`, `mobile_auth_codes`, `devices` | per user |
| Catalog | `tracks`, `artists`, `albums`, `track_artists`, `track_tags`, `track_similar` | shared |
| Listening | `plays`, `imports` | per user |
| Library | `liked_tracks`, `playlists`, `playlist_tracks`, `playlist_track_events` | per user |
| Orion features | `smart_playlists`, `smart_playlist_runs`, `swipe_decisions`, `recaps` | per user |
| System | `jobs`, `sync_state`, `notifications`, `notification_prefs` | per user / service |
| Stats (derived) | `mv_track_counts`, `mv_daily_listening`, `mv_artist_counts` | materialized views |

**Schema**

```sql
-- enums
create type user_role as enum ('owner','member');
create type play_source as enum ('export','recently_played','lastfm');
create type smart_type as enum ('on_repeat','recent','songs_alike','forgotten_likes','blend','top_period');
create type smart_mode as enum ('snapshot','auto');
create type smart_schedule as enum ('daily','weekly','monthly');
create type job_status as enum ('queued','running','done','failed');
create type swipe_decision as enum ('like','skip','later');

-- users
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  spotify_user_id text unique not null,
  display_name text,
  avatar_url text,
  role user_role not null default 'member',
  locale text not null default 'en' check (locale in ('en','nl')),
  timezone text not null default 'Europe/Amsterdam',
  lastfm_username text,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table spotify_connections (
  user_id uuid primary key references profiles on delete cascade,
  access_token_enc text not null,
  refresh_token_enc text not null,
  expires_at timestamptz not null,
  scopes text[] not null,
  status text not null default 'ok' check (status in ('ok','needs_reauth')),
  updated_at timestamptz not null default now()
);  -- service role only, no RLS select policy

create table invites (
  code text primary key,
  email text not null,
  created_by uuid not null references profiles,
  expires_at timestamptz not null,
  used_by uuid references profiles,
  used_at timestamptz,
  revoked_at timestamptz
);

create table devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  expo_push_token text unique not null,
  platform text not null,
  last_seen_at timestamptz not null default now()
);

-- catalog (shared)
create table albums (
  id text primary key,            -- Spotify ID
  name text not null,
  album_type text,
  release_date text,
  image_url text
);

create table artists (
  id text primary key,
  name text not null,
  image_url text,
  genres text[] default '{}',
  fetched_at timestamptz
);

create table tracks (
  id text primary key,
  name text not null,
  album_id text references albums,
  duration_ms int,
  explicit boolean,
  isrc text,
  fetched_at timestamptz          -- null = known only from export, details not fetched yet
);

create table track_artists (
  track_id text references tracks on delete cascade,
  artist_id text references artists,
  position smallint not null,
  primary key (track_id, artist_id)
);

create table track_tags (           -- from Last.fm
  track_id text references tracks on delete cascade,
  tag text not null,
  weight smallint not null,
  primary key (track_id, tag)
);

create table track_similar (        -- from Last.fm, matched to Spotify
  track_id text references tracks on delete cascade,
  similar_track_id text references tracks on delete cascade,
  score real not null,            -- Last.fm match 0..1
  fetched_at timestamptz not null default now(),
  primary key (track_id, similar_track_id)
);

-- listening
create table plays (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles on delete cascade,
  track_id text not null references tracks,
  played_at timestamptz not null,  -- end time of the play, UTC
  ms_played int,                   -- null when source gives no duration
  counted boolean not null,        -- true if ms_played >= 30000 or unknown
  skipped boolean,
  reason_start text,
  reason_end text,
  shuffle boolean,
  platform text,
  context_uri text,                -- playlist/album it was played from (live polling only)
  source play_source not null,
  unique (user_id, track_id, played_at)
);
create index plays_user_time on plays (user_id, played_at desc);
create index plays_user_track on plays (user_id, track_id);

create table imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  storage_path text not null,
  status job_status not null default 'queued',
  files_total int, rows_parsed int default 0, rows_inserted int default 0,
  rows_skipped_podcast int default 0, rows_duplicate int default 0,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- library
create table liked_tracks (
  user_id uuid references profiles on delete cascade,
  track_id text references tracks,
  liked_at timestamptz not null,   -- added_at from Spotify
  unliked_at timestamptz,          -- set when a sync no longer finds it
  primary key (user_id, track_id, liked_at)
);

create table playlists (
  id text primary key,             -- Spotify playlist ID
  user_id uuid not null references profiles on delete cascade,
  name text not null,
  description text,
  image_url text,
  snapshot_id text,
  is_owner boolean not null,
  is_collaborative boolean not null,
  item_count int,
  orion_managed boolean not null default false,
  synced_at timestamptz
);

create table playlist_tracks (
  playlist_id text references playlists on delete cascade,
  track_id text references tracks,
  position int not null,
  added_at timestamptz,
  added_by text,
  primary key (playlist_id, position)
);

create table playlist_track_events (
  id bigint generated always as identity primary key,
  playlist_id text references playlists on delete cascade,
  track_id text references tracks,
  event text not null check (event in ('added','removed')),
  at timestamptz not null default now()
);

-- Orion features
create table smart_playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  spotify_playlist_id text references playlists,
  type smart_type not null,
  name text not null,
  params jsonb not null,           -- validated by zod schema per type in packages/core
  mode smart_mode not null,
  schedule smart_schedule,         -- required when mode = 'auto'
  next_run_at timestamptz,
  last_run_at timestamptz,
  paused boolean not null default false,
  created_at timestamptz not null default now()
);

create table smart_playlist_runs (
  id bigint generated always as identity primary key,
  smart_playlist_id uuid references smart_playlists on delete cascade,
  ran_at timestamptz not null default now(),
  track_ids text[] not null,
  added int, removed int,
  error text
);

create table smart_playlist_overrides (  -- manual edits made in Spotify
  smart_playlist_id uuid references smart_playlists on delete cascade,
  track_id text references tracks,
  kind text not null check (kind in ('kept','excluded')),
  detected_at timestamptz not null default now(),
  primary key (smart_playlist_id, track_id)
);

create table swipe_decisions (
  user_id uuid references profiles on delete cascade,
  track_id text references tracks,
  decision swipe_decision not null,
  source text not null,            -- e.g. 'recs', 'forgotten', 'friend'
  decided_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table recaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  period text not null check (period in ('week','year')),
  period_start date not null,
  data jsonb not null,             -- shape defined in packages/core RecapSchema
  created_at timestamptz not null default now(),
  unique (user_id, period, period_start)
);

-- system
create table jobs (
  id bigint generated always as identity primary key,
  type text not null,
  user_id uuid references profiles on delete cascade,
  payload jsonb not null default '{}',
  status job_status not null default 'queued',
  run_after timestamptz not null default now(),
  attempts int not null default 0,
  max_attempts int not null default 5,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index jobs_ready on jobs (status, run_after);

create table sync_state (
  user_id uuid references profiles on delete cascade,
  kind text not null,              -- 'recently_played','liked','playlists','top','lastfm'
  cursor text,                     -- e.g. last played_at in ms
  last_success_at timestamptz,
  last_error text,
  primary key (user_id, kind)
);

create table notification_prefs (
  user_id uuid primary key references profiles on delete cascade,
  weekly_recap boolean not null default true,
  yearly_recap boolean not null default true,
  smart_playlist_updated boolean not null default true,
  friend_activity boolean not null default true
);

create table notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles on delete cascade,
  kind text not null,
  title text not null, body text not null,
  data jsonb default '{}',
  sent_at timestamptz, read_at timestamptz,
  created_at timestamptz not null default now()
);
```

**Derived stats (materialized views, refreshed by jobs)**

- `mv_track_counts(user_id, track_id, plays_total, plays_7d, plays_30d, plays_365d, ms_total, first_played_at, last_played_at)` from `plays where counted`.
- `mv_daily_listening(user_id, day, plays, ms_played)` using the user's timezone.
- `mv_artist_counts(user_id, artist_id, plays_total, plays_30d, ms_total)` via `track_artists` (primary artist only, `position = 0`).
- Refresh with `refresh materialized view concurrently` after each ingest job (needs a unique index on each view).

**Row Level Security**

- Enable RLS on every table. A helper `is_member()` returns true if `auth.uid()` exists in `profiles`.
- Per-user tables: members can **select** rows of any member (friends see full history, as decided). Members can **insert/update/delete** only their own rows (`user_id = auth.uid()`).
- Catalog tables: select for members; writes only by service role.
- `spotify_connections`, `invites`, `auth_states`, `mobile_auth_codes`, `jobs`: no client access; service role only (invites are read through an owner-only API route).

## Data ingestion

History comes from four sources, in this order of trust: Spotify data export, live polling, Last.fm scrobbles, Spotify top items. All Spotify calls go through one shared rate limiter, because all 5 users share one quota.

**Extra schema for ingestion** (add to the first migration)

- `tracks.fallback_artist_name text`, `tracks.fallback_album_name text`: names from the export, shown until full details are fetched.
- `lastfm_matches(artist_norm text, track_norm text, spotify_track_id text null, matched_at timestamptz, primary key (artist_norm, track_norm))`: cache of Last.fm → Spotify matches; `null` means "no match found", retried after 30 days.
- `spotify_top_snapshots(user_id, kind 'tracks'|'artists', time_range 'short'|'medium'|'long', taken_on date, ids text[], primary key (user_id, kind, time_range, taken_on))`.

### 1. Spotify data export (full history)

Users request "Extended streaming history" in their Spotify account privacy settings. Spotify emails a zip, which can take up to 30 days. Onboarding explains this with step-by-step screenshots and lets users skip it.

Parsing happens **on the device**, not on the server. This avoids server memory and timeout limits and means private fields (like IP address) never leave the phone or browser.

1. User picks the zip or the JSON files (web: file input; mobile: `expo-document-picker` + `expo-file-system`).
2. Client unzips with JSZip and reads only `Streaming_History_Audio_*.json`. Video and podcast files are ignored.
3. For each entry: skip if `spotify_track_uri` is null (podcasts, local files). Keep only: `ts`, `ms_played`, `spotify_track_uri`, `master_metadata_track_name`, `master_metadata_album_artist_name`, `master_metadata_album_album_name`, `reason_start`, `reason_end`, `shuffle`, `skipped`, `platform`.
4. Client calls `POST /api/imports` to create an import, then sends batches of 1,000 rows to `POST /api/imports/{id}/batch`, showing a progress bar. Batches are idempotent (retry-safe).
5. Server upserts minimal `tracks` rows (ID + fallback names) and inserts `plays` with `source = 'export'` and `counted = ms_played >= 30000`.
6. On `POST /api/imports/{id}/complete`, the server enqueues `dedupe_plays`, `backfill_track_details` and `refresh_stats` jobs.

The basic "Account data" export (`StreamingHistory_music_*.json`) has no track URIs. v1 rejects it with a clear message; matching by name is a v2 option.

**Deduplication rule:** an export play and a live-polled play for the same user and track within 60 seconds of each other are the same play. Keep the export row (it has `ms_played`) and delete the polled row.

**Backfilling track details:** the export has names but no artist or album IDs. The `backfill_track_details` job calls `GET /tracks/{id}` (no batch endpoint exists anymore) for tracks with `fetched_at is null`, most-played first, then `GET /artists/{id}` for new artists. It runs at a low, steady rate in the background and can take hours for a big library; the UI uses fallback names meanwhile.

### 2. Live polling (ongoing history)

- Job `poll_recently_played` runs every 20 minutes per user.
- Calls `GET /me/player/recently-played?limit=50&after=<cursor>` and stores new plays with `source = 'recently_played'`, `ms_played = null`, `counted = true`, and `context_uri` from the response.
- The response includes full track, artist and album objects; upsert them into the catalog (free details, no extra calls).
- Cursor = the highest `played_at` stored, in `sync_state`.
- If more than 50 plays happened between polls, the extra ones are lost. 20 minutes keeps that rare. Last.fm fills the gap if connected.

### 3. Library sync

| Job | Schedule | What it does |
| --- | --- | --- |
| `sync_liked_incremental` | every 30 min | Pages `GET /me/tracks` (newest first) until it reaches a known `liked_at`; inserts new likes |
| `sync_liked_full` | daily 04:00 user time | Reads all liked songs; tracks no longer present get `unliked_at = now()` |
| `sync_playlists` | every 6 h + on app open | `GET /me/playlists`; for owned/collab playlists whose `snapshot_id` changed, reads `GET /playlists/{id}/items`, diffs, writes `playlist_track_events` |
| `snapshot_top_items` | daily | `GET /me/top/{tracks,artists}` for all 3 time ranges; useful before a user has history |

Unlikes done inside Orion update `liked_tracks` immediately, so they don't wait for the daily sync.

### 4. Last.fm

- If a username is set, `sync_lastfm` reads `user.getRecentTracks` (200 per page).
- Scrobbles are only inserted for time ranges where Orion has no export or polled plays, so nothing is counted twice.
- Each scrobble is matched to Spotify via the `lastfm_matches` cache, else `GET /search?q=track:"…" artist:"…"&type=track&limit=5`, picking the result whose normalized name and primary artist match exactly.
- Normalizing: lowercase, remove accents, strip "- Remastered…", "(feat. …)", "- Live" and extra spaces.

### 5. Similar tracks (for recommendations)

- `fetch_similar(track_id)`: Last.fm `track.getSimilar` (limit 50) using the track's primary artist and name, then match the top 20 to Spotify as above and store in `track_similar`.
- Fallback when a track has fewer than 5 matches: `artist.getSimilar` → for each similar artist, use Orion's own play data or `GET /search` (`artist:"…"`, type track) to get a few tracks.
- Nightly job prefetches similar tracks for each user's top 100 tracks of the last 30 days. Cached results older than 30 days are refreshed.
- Respect Last.fm's rate limits (stay under 5 requests per second) and send a descriptive `User-Agent`.

### Rate limiter

- One token bucket per external API, stored in Postgres (or Upstash Redis if needed), shared by every job and API route.
- Spotify: start at 2 requests/second total, priority queue: user-triggered actions > polling > syncs > backfill.
- On 429: pause that API for `Retry-After` seconds, lower the rate by 25%, and slowly raise it again after 10 minutes without errors.

## Feature specs

Every generator and metric below is a pure function in `packages/core`, with unit tests using fixture data. A "play" always means a row in `plays` where `counted = true`, unless stated otherwise.

### Smart playlists

All smart playlists are created in the user's own Spotify account as private playlists. Each one has a mode: **snapshot** (generate once, then it's a normal playlist) or **auto** (refreshed daily, weekly or monthly). The user picks the mode when creating and can change it later.

| Type | Params (defaults) | How tracks are picked |
| --- | --- | --- |
| On repeat | period: 7d / **30d** / 90d / 365d; size: 25 / **50** / 100; min plays: **3** | Most plays in period, ties broken by most recent play |
| Top of a period | date range (e.g. a month, "Summer 2025"); size **50** | Same as On repeat for a fixed past range. Snapshot only |
| Recent songs | last **14** days or last N plays; size **50**; exclude skipped: **on** | Unique tracks by latest play, newest first; skipped = `ms_played < 30000` or `skipped = true` |
| Songs alike | seeds: 1–5 tracks or one playlist; size **30**; discovery: **70%** new / 30% familiar; max **2** per artist | See algorithm below |
| Forgotten likes | liked more than **90** days ago; not played in **60** days; size **50**; include never-played: off | Ranked by lifetime plays, highest first |
| Group blend | members: 2–5; period **30d**; size **50** | See algorithm below |

**Songs alike algorithm**

1. For each seed, load `track_similar` (fetch if missing). Candidate score = sum of Last.fm match scores across seeds.
2. "New" candidates: not liked and played fewer than 2 times by this user. "Familiar": the rest.
3. Remove tracks the user swiped "skip" on in the last 90 days.
4. Fill the discovery ratio from the top of each group, applying the max-per-artist rule.
5. Order: interleave so no artist appears twice in a row.

**Group blend algorithm**

1. Each member's top 100 tracks in the period, scored by rank (100 down to 1).
2. Tracks in 2+ members' lists rank first, sorted by summed score.
3. Fill the rest with equal shares per member, round-robin, so every member is represented.
4. The playlist is created in the creator's account; the description lists members. Members get a notification.

**Auto-refresh behavior**

- Refresh writes kept tracks first, then the generated tracks, with `PUT /playlists/{id}/items` (first 100) plus `POST /playlists/{id}/items` in chunks of 100.
- Skip the write if the new track list equals the current one.
- Manual edits in Spotify are kept. Before each refresh, Orion compares the playlist with the last run: tracks you added by hand are saved as "kept" and stay at the top; Orion tracks you removed are saved as "excluded" and never re-added. Both lists are editable on the smart playlist screen.
- Description: "Made with Orion · updates weekly · last update 6 Oct" (localized).
- If the user deletes the playlist in Spotify, the next run detects a 404, pauses the smart playlist and notifies the user.
- Cover image: generated server-side (`@vercel/og`) with the playlist name on a gradient, uploaded via `PUT /playlists/{id}/images` (base64 JPEG, under 256 KB).
- Every run is logged in `smart_playlist_runs`; the detail screen shows what was added and removed.

### Recents and bulk actions

- Recents screen: plays grouped by day, newest first, with time, cover, title, artist, a heart (liked state) and a "played from" chip (playlist/album name when known).
- Long-press (mobile) or checkbox (web) starts **selection mode**. "Select all" per day header.
- Action bar in selection mode: **Like all**, **Add to playlist**, **Remove likes**, **Make a playlist from these**.
- Add to playlist opens a sheet with the user's owned/collaborative playlists (search, recent first) and "New playlist". Duplicates already in the target are skipped by default, with a toggle to add anyway.
- Writes are chunked (max 50 URIs per library call, 100 per playlist call). Show one toast with the result and an **Undo** button for 10 seconds.
- Filters: date range, only not-liked, only skipped, from a specific playlist.

### Liking

**Quick targets:** each user can set up to 3 "quick target" playlists. Long-pressing a heart anywhere opens a sheet: Like, Like + add to target 1/2/3, Add to other playlist.

**Swipe review mode**

- A card deck with cover art, title, artist, why it's shown ("Because you like X", "Mila's top track").
- Deck sources: Recommendations (songs alike from your top tracks), Friends' favorites (friends' top tracks you haven't liked), a chosen playlist, Clean-up (see below).
- Gestures: right = like, left = skip, up = like + add to quick target 1, down = later. Buttons for each as well (accessibility, web).
- Undo the last swipe.
- Spotify no longer gives audio previews to new apps, so cards have a **Play on Spotify** button: if the user has an active Spotify device, start playback there via the Player API; otherwise open the track in the Spotify app.
- Every decision is saved in `swipe_decisions` so tracks are not shown again (skips expire after 90 days).

**Clean-up unlikes**

- Candidates: liked more than 180 days ago and no plays in the last 180 days; or skip rate above 50% with at least 5 plays.
- Reviewed in swipe mode with flipped meaning: left = unlike, right = keep. Kept tracks are not suggested again for 180 days.
- Unliked tracks are listed in "Recently removed likes" for 30 days with a restore button.

### Analytics

All analytics screens share a period picker: 7 days, 4 weeks, 6 months, 12 months, all time, custom. The metric toggle is plays or minutes (minutes use `ms_played`, or track duration when `ms_played` is null).

**Playlist stats** (owned and collaborative playlists only)

- Playlist leaderboard: playlists ranked by plays of their tracks in the period, and by plays started from that playlist (`context_uri`; only available from live polling, not the export).
- Per playlist: number of tracks, total duration, growth over time (from `playlist_track_events`), most played tracks in it, **dead weight** (tracks with 0 plays in 90 days), % of tracks played in the last 30 days, top artists by share, average release year, overlap with your other playlists, duplicates across playlists.

**Liked songs stats**

- Total likes; likes added per month (bar chart); unlikes per month.
- Liked but never played (list + count).
- Time to like: median days between first play and like.
- **Bored after:** for each liked track, the number of days after liking until its weekly plays fall below 20% of its best week. Show the median and the tracks that lasted longest.
- Likes by release decade, top artists in likes, artists you like most but rarely play.

**Classic top lists**

- Top tracks, artists and albums for the period, with rank change versus the previous period of equal length (arrows, "new" badge).
- Tap any item for a detail page: plays over time chart, first and last play, playlists it's in, which friends also play it.

**Listening habits**

- Minutes per day / week chart.
- Heatmap: weekday × hour, in the user's timezone.
- Streaks: current and longest run of days with at least one play.
- Skip rate, shuffle share, platform split (export data only).
- New vs familiar: share of plays in the period on tracks first played in that period. Discoveries per month.
- Sessions: plays separated by gaps under 30 minutes; average session length.

### Social

All members are automatically friends; there is one circle of up to 5 people. Friends can see each other's full history and stats, as decided. Settings states this clearly.

- **Friend profile:** the same stats screens as your own, read-only, with a "compare" button.
- **Compare:** taste match % (weighted Jaccard similarity of top 100 artists in the last 90 days), shared top tracks and artists, artists only one of you loves, a "make a blend" shortcut.
- **Leaderboards:** weekly, monthly and all-time for minutes, plays, distinct artists, discoveries and longest streak; plus **superfan** per artist (who played them most).
- **Activity feed:** new likes (grouped per day), new smart playlists, blends you were added to, leaderboard overtakes, recaps posted.
- **Listening now:** if a friend's latest play is from the last 10 minutes, show it as "recently played" on their avatar.

### Recaps

**Weekly recap**

- Generated every Monday at 08:00 user time for the previous Monday–Sunday and saved in `recaps`.
- Contents: minutes vs previous week, top 5 tracks and artists, new likes, top discovery, most played playlist, streak, your leaderboard positions.
- Shown as swipeable story cards; push notification when ready.

**Yearly recap (Wrapped-style)**

- Generated on 1 January for the previous calendar year; a live "so far this year" preview is available any time.
- Contents: total minutes, top 10 tracks/artists/albums, top song per month, most liked month, biggest discovery, longest streak, "bored after" champion, top playlist, friend with the closest taste.
- Story-card format with animated transitions; each card can be shared as an image (mobile: `react-native-view-shot`; web: `html-to-image`).
- One-tap "Save my Top 100 of 2026" playlist.

### Notifications

| Type | Trigger | Example (en) |
| --- | --- | --- |
| Weekly recap | Monday 08:00 user time | "Your week: 14 h of music. See your recap" |
| Yearly recap | 1 Jan 10:00 | "Your 2026 in music is ready" |
| Smart playlist updated | After an auto refresh that changed tracks | "On Repeat updated: 6 new songs" |
| Friend activity | Overtakes on a leaderboard, added to a blend | "Mila passed you on minutes this week" |
| Needs attention | Spotify reconnect needed, import finished/failed, playlist deleted | "Reconnect Spotify to keep tracking" |

- Each type can be switched off in Settings (`notification_prefs`). "Needs attention" cannot be switched off.
- Quiet hours 22:00–08:00 user time; notifications wait until 08:00.
- Max one friend-activity push per day; the rest go only to the in-app inbox.
- All notifications are also stored in `notifications` for the in-app inbox.

## Screens and navigation

The mobile app has 5 bottom tabs; the web app shows the same 5 sections in a left sidebar and uses the extra width for side-by-side panels. Both use a dark theme by default (light theme optional in Settings) with one accent color.

**Mobile tabs:** Home · Recents · Playlists · Charts · Friends. Settings and the notification inbox open from the avatar and bell icons in the Home header.

| Screen | Mobile route (Expo Router) | Web route | Contents |
| --- | --- | --- | --- |
| Welcome / sign in | `/(auth)/welcome` | `/login` | Invite code field, Continue with Spotify, language switch |
| Onboarding | `/(auth)/onboarding` | `/onboarding` | 4 steps: sync progress, request data export (guide), Last.fm username (optional), notifications permission |
| Home | `/(tabs)/index` | `/` | This week so far, latest recap card, swipe-review entry, smart playlists due, friend activity preview |
| Recents | `/(tabs)/recents` | `/recents` | Play list by day, filters, selection mode, bulk action bar |
| Playlists | `/(tabs)/playlists` | `/playlists` | Segments: Smart playlists · My playlists · Liked songs |
| Smart playlist create/edit | `/playlists/smart/new`, `/playlists/smart/[id]` | same | Type picker, params form, mode/schedule, live preview of tracks, run history |
| Playlist detail | `/playlists/[id]` | same | Tracks + playlist stats (dead weight, growth, top artists) |
| Liked songs | `/playlists/liked` | `/liked` | Liked list + liked-songs stats, clean-up entry |
| Swipe review | `/review?source=…` | `/review` | Card deck; web uses buttons and arrow keys |
| Charts | `/(tabs)/charts` | `/charts` | Top tabs: Top lists · Habits · Playlists · Likes; period picker; plays/minutes toggle |
| Track / artist / album detail | `/track/[id]`, `/artist/[id]`, `/album/[id]` | same | Plays over time, first/last play, in playlists, friends who play it |
| Friends | `/(tabs)/friends` | `/friends` | Friend list with taste match %, leaderboards, activity feed |
| Friend profile | `/friends/[userId]` | same | Read-only stats + Compare |
| Compare | `/friends/[userId]/compare` | same | Taste match, shared and unique artists/tracks, make a blend |
| Recap viewer | `/recap/[id]` | same | Story cards, share image, save playlist |
| Import history | `/settings/import` | `/settings/import` | Export guide, file picker, progress, import log |
| Notifications inbox | `/inbox` | `/inbox` | All notifications, mark as read |
| Settings | `/settings` | `/settings` | Language, theme, timezone, quick target playlists, Last.fm, notifications, invites (owner), delete data, sign out |

**Shared UI components** (same names on both platforms, separate implementations)

- `TrackRow` (cover, title, artist, heart, overflow menu, selectable state)
- `PeriodPicker`, `MetricToggle`, `StatCard`, `RankChange`
- `PlaylistPickerSheet`, `BulkActionBar`, `UndoToast`
- `SwipeCard`, `StoryCard`
- Chart wrappers: `BarChart`, `LineChart`, `Heatmap`, `DonutChart` with one shared props shape defined in `packages/core/charts.ts`

**Extra column needed:** `profiles.quick_target_playlist_ids text[] default '{}'` (max 3).

**States every screen must handle:** loading skeletons, empty state with a next action ("Import your history to see all-time stats"), error with retry, and "data still syncing" banners while backfill jobs run.

## Backend API and jobs

The Next.js app exposes a REST API under `/api`, used by both clients. Reads that are simple and RLS-safe may go straight to Supabase from the client; every write to Spotify goes through the API.

**API conventions**

- Auth: `Authorization: Bearer <Supabase access token>` (mobile) or Supabase cookie (web). A shared `withUser()` helper validates it.
- Every request body and response is a Zod schema in `packages/core/api`. `packages/api-client` is generated from those schemas.
- Errors: `{ error: { code, message, details? } }` with codes like `SPOTIFY_REAUTH`, `RATE_LIMITED`, `NOT_FOUND`, `VALIDATION`.
- Lists use cursor pagination: `?cursor=…&limit=50`.

**Endpoints**

| Method + path | Purpose |
| --- | --- |
| `GET /api/auth/spotify/start`, `GET /api/auth/spotify/callback` | Spotify OAuth |
| `POST /api/auth/mobile/exchange` | One-time code → Supabase session |
| `GET /api/me`, `PATCH /api/me` | Profile, locale, timezone, quick targets, Last.fm username |
| `DELETE /api/me` | Delete all Orion data |
| `POST /api/devices` | Register Expo push token |
| `GET /api/plays` | Recents (filters: from, to, notLiked, skipped, contextUri) |
| `POST /api/library/like`, `POST /api/library/unlike` | Body: `trackIds[]` (max 500, chunked server-side) |
| `GET /api/playlists` | Owned/collab playlists |
| `POST /api/playlists` | Create empty or from `trackIds[]` |
| `POST /api/playlists/{id}/items` | Add tracks; `skipDuplicates` default true |
| `GET /api/playlists/{id}/stats` | Playlist stats for a period |
| `GET/POST /api/smart-playlists`, `GET/PATCH/DELETE /api/smart-playlists/{id}` | CRUD |
| `POST /api/smart-playlists/preview` | Run a generator without writing to Spotify |
| `POST /api/smart-playlists/{id}/run` | Refresh now |
| `GET /api/review/deck?source=…` | Next 20 swipe cards |
| `POST /api/review/decisions` | Batch of swipe decisions |
| `GET /api/stats/top`, `/habits`, `/likes`, `/playlists` | Analytics; params: `userId` (self or friend), `period`, `metric` |
| `GET /api/items/{type}/{id}` | Track/artist/album detail with stats |
| `GET /api/friends`, `GET /api/friends/{id}/compare` | Friends + compare |
| `GET /api/leaderboards?board=…&period=…` | Leaderboards |
| `GET /api/feed` | Activity feed |
| `POST /api/blends` | Create a group blend |
| `GET /api/recaps`, `GET /api/recaps/{id}`, `GET /api/recaps/year-preview` | Recaps |
| `POST /api/imports`, `POST /api/imports/{id}/batch`, `POST /api/imports/{id}/complete`, `GET /api/imports/{id}` | History import |
| `GET/POST/DELETE /api/invites` | Owner only |
| `POST /api/player/play` | Play a track on the active Spotify device |
| `GET /api/notifications`, `POST /api/notifications/read` | Inbox |

**Job runner**

1. `pg_cron` calls the `job-runner` Edge Function every minute (via `pg_net`).
2. The runner claims up to 20 ready jobs with `update … where id in (select … for update skip locked)` and sets `status = 'running'`, `locked_at = now()`.
3. It runs them one by one, respecting the shared rate limiter, and stops claiming new ones after 45 seconds.
4. Success → `done`. Failure → `attempts + 1`, `run_after = now() + 2^attempts minutes`, `failed` after `max_attempts`.
5. Jobs stuck in `running` for over 10 minutes are reset to `queued`.
6. Long jobs (backfill, Last.fm history) process one chunk per run and re-enqueue themselves with a cursor.

**Scheduled jobs** (a `scheduler` cron enqueues one job per user when due)

| Job | When | Notes |
| --- | --- | --- |
| `poll_recently_played` | every 20 min | Highest priority background job |
| `sync_liked_incremental` | every 30 min |  |
| `sync_playlists` | every 6 h | Also on app open, max once per 10 min |
| `sync_liked_full` | daily 04:00 user time | Detects unlikes |
| `snapshot_top_items` | daily 04:30 |  |
| `refresh_stats` | after ingest jobs, max every 10 min | Refreshes materialized views |
| `run_smart_playlists` | hourly | Runs those with `next_run_at <= now()` |
| `prefetch_similar` | nightly 03:00 | Top 100 tracks per user |
| `backfill_track_details` | continuous, low priority | Chunks of 50 tracks |
| `sync_lastfm` | every 6 h | Only if username set |
| `weekly_recap` | Monday 07:30 user time | Push at 08:00 |
| `yearly_recap` | 1 January 09:30 |  |
| `leaderboard_check` | hourly | Creates overtake events for the feed and notifications |
| `cleanup` | daily | Old `auth_states`, `jobs` older than 30 days, expired invites |

**Environment variables**

`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, `LASTFM_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TOKEN_ENCRYPTION_KEY`, `EXPO_ACCESS_TOKEN`, `SENTRY_DSN`, `APP_URL`, `MOBILE_SCHEME=orion`. Keep `.env.example` up to date.

## Build phases

Ten phases, each ending in something you can use. An agent only starts a phase when every acceptance check of the previous one passes. Web and mobile are built together in each phase, so they never drift apart.

### Phase 0 — Foundations

Monorepo, tooling, empty apps, database, i18n, design tokens, CI.

- [ ] `pnpm dev` starts Supabase locally, the web app and the Expo app
- [ ] All migrations from the Data model section apply cleanly; generated DB types committed
- [ ] RLS enabled on every table, with tests proving a user can't write another user's rows
- [ ] `en` and `nl` switch live on both apps
- [ ] CI runs lint, typecheck and tests on every push

### Phase 1 — Sign in and live sync

Spotify OAuth (web + mobile), invites, encrypted tokens, rate limiter, job runner, recently-played polling, liked and playlist sync.

- [ ] Owner and one invited friend can sign in on web and on a phone
- [ ] A sign-in without a valid invite shows a clear error
- [ ] New plays appear in `plays` within 20 minutes
- [ ] Liking a song in Spotify shows up within 30 minutes; unliking within 24 hours
- [ ] Revoking access in Spotify sets `needs_reauth` and shows a reconnect banner

### Phase 2 — Recents and fast liking

Recents screen, selection mode, bulk like / add to playlist / new playlist, quick targets, undo.

- [ ] Select 20 recent songs and like them in one action; Spotify reflects it
- [ ] Add selected songs to a playlist with duplicates skipped
- [ ] Undo reverses the last bulk action within 10 seconds
- [ ] Long-press heart → like + add to quick target works on both apps

### Phase 3 — History import and core stats

On-device export parsing, batch upload, dedupe, track detail backfill, materialized views, Charts tab with top lists and listening habits.

- [ ] A real extended streaming history export (multiple years) imports with a progress bar and no duplicates
- [ ] Reimporting the same files adds zero rows
- [ ] Top tracks/artists/albums and habits charts load in under 1 second for all-time
- [ ] Tracks without details show fallback names until backfill finishes

### Phase 4 — Smart playlists

All types except group blend, Last.fm similar tracks and matching, preview, snapshot and auto modes, generated covers, run history.

- [ ] Each type previews correctly against fixture data (unit tests) and real data
- [ ] An auto playlist refreshes on schedule and only writes when tracks changed
- [ ] Deleting the playlist in Spotify pauses it and notifies the user
- [ ] Songs alike returns at least 70% matched tracks for popular seeds

### Phase 5 — Swipe review and clean-up

Card deck with all sources, gestures and buttons, play on Spotify, decisions stored, clean-up flow, recently removed likes.

- [ ] Swiping 50 cards is smooth (60 fps on a mid-range phone)
- [ ] Skipped tracks don't reappear for 90 days
- [ ] Clean-up unlikes can be restored from "Recently removed likes"

### Phase 6 — Playlist and liked-songs analytics

Playlist leaderboard and per-playlist stats, liked-songs stats including "bored after", item detail pages.

- [ ] Every metric in the Analytics spec has a unit test with a hand-checked fixture
- [ ] Dead weight list matches a manual check on one real playlist

### Phase 7 — Social

Friend profiles, compare, leaderboards, activity feed, group blends.

- [ ] A friend's stats screens show the same numbers they see themselves
- [ ] Taste match is symmetric (A vs B equals B vs A)
- [ ] A 3-person blend includes tracks from every member

### Phase 8 — Recaps and notifications

Weekly and yearly recaps, story viewer, share as image, push notifications with prefs and quiet hours, in-app inbox.

- [ ] A weekly recap generates for a fixture week and arrives as a push on Monday 08:00 local time
- [ ] Turning a notification type off stops it; quiet hours delay pushes
- [ ] Shared recap images render correctly in both languages

### Phase 9 — Polish and release

Accessibility pass, performance, empty and error states, full Dutch copy review, EAS builds for iOS and Android, production deploy.

- [ ] All screens pass screen reader labels and 44 pt touch targets
- [ ] No untranslated strings (CI check for missing keys)
- [ ] Installed builds on all 5 users' phones; web live on the production domain

## Working with AI agents

This spec is the source of truth. Copy it to `docs/SPEC.md` in the repo and keep a short `CLAUDE.md` (or `AGENTS.md`) at the root that points to it and lists the rules below.

**Rules for agents**

1. Work one phase at a time. Start each task by reading the relevant spec section and the current code; finish by running lint, typecheck and tests.
2. Never call a Spotify endpoint listed as removed. Check Spotify's changelog before adding any new Spotify call, and use `/me/library` and `/playlists/{id}/items`.
3. Schema changes only through new SQL migration files; regenerate DB types in the same change.
4. Business logic in `packages/core` as pure functions with tests. API routes and jobs only fetch data, call core, and write results.
5. No hard-coded user-facing text: every string goes in `en.json` and `nl.json` in the same change.
6. Never log or return Spotify tokens; never send them to clients.
7. Every Spotify or Last.fm call goes through the shared rate limiter.
8. When the spec is unclear, write the question in `docs/OPEN_QUESTIONS.md` and pick the simplest option; don't invent features.
9. Record bigger decisions as short ADRs in `docs/adr/`.
10. Keep each pull request to one feature and include screenshots for UI changes.

**Testing**

- Unit (Vitest): all generators, metrics, normalizing and matching, dedupe rule, recap builder. Fixtures in `packages/core/fixtures` (a fake 2-year listening history for 3 users).
- API: route tests against local Supabase with seeded users.
- Spotify/Last.fm: recorded responses (MSW) for tests; never call the real APIs in CI.
- Web E2E (Playwright): sign-in with a mocked OAuth, bulk like, create smart playlist.
- Mobile E2E (Maestro): recents selection, swipe review, recap viewer.

**Risks**

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Spotify changes the API again | Features break without warning | All Spotify code in one package; weekly check of the changelog; Sentry alerts on new 403/404 patterns |
| Owner's Premium lapses | App stops working for all 5 users | Owner keeps Premium; app shows a clear error page |
| Rate limits during big imports | Slow backfill, failed user actions | Priority queue, adaptive throttling, backfill can take hours |
| Last.fm matching misses tracks | Weaker "songs alike" | Artist-level fallback; cache misses and retry after 30 days |
| Plays lost between polls (over 50 plays in 20 min) | Small gaps in history | Rare in practice; Last.fm fills gaps when connected |
| Spotify Developer Terms on storing and showing data | Policy issues | Review the [Developer Policy](https://developer.spotify.com/policy) before release; keep Spotify attribution and "Open in Spotify" links |

**Open items**

- [ ] Pick the production domain (needed for the Spotify redirect URI)
- [ ] Choose the accent color and app icon for Orion
- [ ] Decide whether removed members' data is deleted at once or after 30 days
