-- Orion Phase 0 — full schema from docs/SPEC.md (Data model + ingestion/screens extras)

-- enums
create type user_role as enum ('owner', 'member');
create type play_source as enum ('export', 'recently_played', 'lastfm');
create type smart_type as enum (
  'on_repeat',
  'recent',
  'songs_alike',
  'forgotten_likes',
  'blend',
  'top_period'
);
create type smart_mode as enum ('snapshot', 'auto');
create type smart_schedule as enum ('daily', 'weekly', 'monthly');
create type job_status as enum ('queued', 'running', 'done', 'failed');
create type swipe_decision as enum ('like', 'skip', 'later');

-- users
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  spotify_user_id text unique not null,
  display_name text,
  avatar_url text,
  role user_role not null default 'member',
  locale text not null default 'en' check (locale in ('en', 'nl')),
  timezone text not null default 'Europe/Amsterdam',
  lastfm_username text,
  onboarding_done boolean not null default false,
  quick_target_playlist_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint quick_targets_max_3 check (cardinality(quick_target_playlist_ids) <= 3)
);

create table spotify_connections (
  user_id uuid primary key references profiles on delete cascade,
  access_token_enc text not null,
  refresh_token_enc text not null,
  expires_at timestamptz not null,
  scopes text[] not null,
  status text not null default 'ok' check (status in ('ok', 'needs_reauth')),
  updated_at timestamptz not null default now()
);

create table invites (
  code text primary key,
  email text not null,
  created_by uuid not null references profiles,
  expires_at timestamptz not null,
  used_by uuid references profiles,
  used_at timestamptz,
  revoked_at timestamptz
);

create table auth_states (
  state text primary key,
  code_verifier text not null,
  platform text not null check (platform in ('web', 'mobile')),
  invite_code text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table mobile_auth_codes (
  code text primary key,
  user_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
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
  id text primary key,
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
  fetched_at timestamptz,
  fallback_artist_name text,
  fallback_album_name text
);

create table track_artists (
  track_id text references tracks on delete cascade,
  artist_id text references artists,
  position smallint not null,
  primary key (track_id, artist_id)
);

create table track_tags (
  track_id text references tracks on delete cascade,
  tag text not null,
  weight smallint not null,
  primary key (track_id, tag)
);

create table track_similar (
  track_id text references tracks on delete cascade,
  similar_track_id text references tracks on delete cascade,
  score real not null,
  fetched_at timestamptz not null default now(),
  primary key (track_id, similar_track_id)
);

create table lastfm_matches (
  artist_norm text not null,
  track_norm text not null,
  spotify_track_id text,
  matched_at timestamptz not null default now(),
  primary key (artist_norm, track_norm)
);

-- listening
create table plays (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles on delete cascade,
  track_id text not null references tracks,
  played_at timestamptz not null,
  ms_played int,
  counted boolean not null,
  skipped boolean,
  reason_start text,
  reason_end text,
  shuffle boolean,
  platform text,
  context_uri text,
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
  files_total int,
  rows_parsed int default 0,
  rows_inserted int default 0,
  rows_skipped_podcast int default 0,
  rows_duplicate int default 0,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table spotify_top_snapshots (
  user_id uuid not null references profiles on delete cascade,
  kind text not null check (kind in ('tracks', 'artists')),
  time_range text not null check (time_range in ('short', 'medium', 'long')),
  taken_on date not null,
  ids text[] not null,
  primary key (user_id, kind, time_range, taken_on)
);

-- library
create table liked_tracks (
  user_id uuid references profiles on delete cascade,
  track_id text references tracks,
  liked_at timestamptz not null,
  unliked_at timestamptz,
  primary key (user_id, track_id, liked_at)
);

create table playlists (
  id text primary key,
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
  event text not null check (event in ('added', 'removed')),
  at timestamptz not null default now()
);

-- Orion features
create table smart_playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  spotify_playlist_id text references playlists,
  type smart_type not null,
  name text not null,
  params jsonb not null,
  mode smart_mode not null,
  schedule smart_schedule,
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
  added int,
  removed int,
  error text
);

create table smart_playlist_overrides (
  smart_playlist_id uuid references smart_playlists on delete cascade,
  track_id text references tracks,
  kind text not null check (kind in ('kept', 'excluded')),
  detected_at timestamptz not null default now(),
  primary key (smart_playlist_id, track_id)
);

create table swipe_decisions (
  user_id uuid references profiles on delete cascade,
  track_id text references tracks,
  decision swipe_decision not null,
  source text not null,
  decided_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table recaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  period text not null check (period in ('week', 'year')),
  period_start date not null,
  data jsonb not null,
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
  kind text not null,
  cursor text,
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
  title text not null,
  body text not null,
  data jsonb default '{}',
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- derived stats (materialized views)
create materialized view mv_track_counts as
select
  p.user_id,
  p.track_id,
  count(*)::bigint as plays_total,
  count(*) filter (where p.played_at >= now() - interval '7 days')::bigint as plays_7d,
  count(*) filter (where p.played_at >= now() - interval '30 days')::bigint as plays_30d,
  count(*) filter (where p.played_at >= now() - interval '365 days')::bigint as plays_365d,
  coalesce(sum(p.ms_played), 0)::bigint as ms_total,
  min(p.played_at) as first_played_at,
  max(p.played_at) as last_played_at
from plays p
where p.counted
group by p.user_id, p.track_id;

create unique index mv_track_counts_pk on mv_track_counts (user_id, track_id);

create materialized view mv_daily_listening as
select
  p.user_id,
  ((p.played_at at time zone coalesce(pr.timezone, 'Europe/Amsterdam'))::date) as day,
  count(*)::bigint as plays,
  coalesce(sum(p.ms_played), 0)::bigint as ms_played
from plays p
join profiles pr on pr.id = p.user_id
where p.counted
group by p.user_id, day;

create unique index mv_daily_listening_pk on mv_daily_listening (user_id, day);

create materialized view mv_artist_counts as
select
  p.user_id,
  ta.artist_id,
  count(*)::bigint as plays_total,
  count(*) filter (where p.played_at >= now() - interval '30 days')::bigint as plays_30d,
  coalesce(sum(p.ms_played), 0)::bigint as ms_total
from plays p
join track_artists ta on ta.track_id = p.track_id and ta.position = 0
where p.counted
group by p.user_id, ta.artist_id;

create unique index mv_artist_counts_pk on mv_artist_counts (user_id, artist_id);

-- RLS helpers
create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$;

revoke all on function public.is_member() from public;
grant execute on function public.is_member() to authenticated;

-- Enable RLS on every table
alter table profiles enable row level security;
alter table spotify_connections enable row level security;
alter table invites enable row level security;
alter table auth_states enable row level security;
alter table mobile_auth_codes enable row level security;
alter table devices enable row level security;
alter table albums enable row level security;
alter table artists enable row level security;
alter table tracks enable row level security;
alter table track_artists enable row level security;
alter table track_tags enable row level security;
alter table track_similar enable row level security;
alter table lastfm_matches enable row level security;
alter table plays enable row level security;
alter table imports enable row level security;
alter table spotify_top_snapshots enable row level security;
alter table liked_tracks enable row level security;
alter table playlists enable row level security;
alter table playlist_tracks enable row level security;
alter table playlist_track_events enable row level security;
alter table smart_playlists enable row level security;
alter table smart_playlist_runs enable row level security;
alter table smart_playlist_overrides enable row level security;
alter table swipe_decisions enable row level security;
alter table recaps enable row level security;
alter table jobs enable row level security;
alter table sync_state enable row level security;
alter table notification_prefs enable row level security;
alter table notifications enable row level security;

-- profiles: members can select all members; write own row
create policy profiles_select_members on profiles
  for select to authenticated
  using (is_member());

create policy profiles_insert_own on profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_own on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_delete_own on profiles
  for delete to authenticated
  using (id = auth.uid());

-- service-role-only tables: RLS on, no policies for authenticated/anon
-- spotify_connections, invites, auth_states, mobile_auth_codes, jobs

-- catalog: select for members; writes via service role only
create policy albums_select_members on albums
  for select to authenticated using (is_member());
create policy artists_select_members on artists
  for select to authenticated using (is_member());
create policy tracks_select_members on tracks
  for select to authenticated using (is_member());
create policy track_artists_select_members on track_artists
  for select to authenticated using (is_member());
create policy track_tags_select_members on track_tags
  for select to authenticated using (is_member());
create policy track_similar_select_members on track_similar
  for select to authenticated using (is_member());
create policy lastfm_matches_select_members on lastfm_matches
  for select to authenticated using (is_member());

-- per-user tables: select any member's rows; write own only
create policy devices_select_members on devices
  for select to authenticated using (is_member());
create policy devices_insert_own on devices
  for insert to authenticated with check (user_id = auth.uid());
create policy devices_update_own on devices
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy devices_delete_own on devices
  for delete to authenticated using (user_id = auth.uid());

create policy plays_select_members on plays
  for select to authenticated using (is_member());
create policy plays_insert_own on plays
  for insert to authenticated with check (user_id = auth.uid());
create policy plays_update_own on plays
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy plays_delete_own on plays
  for delete to authenticated using (user_id = auth.uid());

create policy imports_select_members on imports
  for select to authenticated using (is_member());
create policy imports_insert_own on imports
  for insert to authenticated with check (user_id = auth.uid());
create policy imports_update_own on imports
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy imports_delete_own on imports
  for delete to authenticated using (user_id = auth.uid());

create policy spotify_top_snapshots_select_members on spotify_top_snapshots
  for select to authenticated using (is_member());
create policy spotify_top_snapshots_insert_own on spotify_top_snapshots
  for insert to authenticated with check (user_id = auth.uid());
create policy spotify_top_snapshots_update_own on spotify_top_snapshots
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy spotify_top_snapshots_delete_own on spotify_top_snapshots
  for delete to authenticated using (user_id = auth.uid());

create policy liked_tracks_select_members on liked_tracks
  for select to authenticated using (is_member());
create policy liked_tracks_insert_own on liked_tracks
  for insert to authenticated with check (user_id = auth.uid());
create policy liked_tracks_update_own on liked_tracks
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy liked_tracks_delete_own on liked_tracks
  for delete to authenticated using (user_id = auth.uid());

create policy playlists_select_members on playlists
  for select to authenticated using (is_member());
create policy playlists_insert_own on playlists
  for insert to authenticated with check (user_id = auth.uid());
create policy playlists_update_own on playlists
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy playlists_delete_own on playlists
  for delete to authenticated using (user_id = auth.uid());

-- playlist_tracks / events: own via owning playlist
create policy playlist_tracks_select_members on playlist_tracks
  for select to authenticated using (is_member());
create policy playlist_tracks_insert_own on playlist_tracks
  for insert to authenticated
  with check (
    exists (
      select 1 from playlists pl
      where pl.id = playlist_id and pl.user_id = auth.uid()
    )
  );
create policy playlist_tracks_update_own on playlist_tracks
  for update to authenticated
  using (
    exists (
      select 1 from playlists pl
      where pl.id = playlist_id and pl.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from playlists pl
      where pl.id = playlist_id and pl.user_id = auth.uid()
    )
  );
create policy playlist_tracks_delete_own on playlist_tracks
  for delete to authenticated
  using (
    exists (
      select 1 from playlists pl
      where pl.id = playlist_id and pl.user_id = auth.uid()
    )
  );

create policy playlist_track_events_select_members on playlist_track_events
  for select to authenticated using (is_member());
create policy playlist_track_events_insert_own on playlist_track_events
  for insert to authenticated
  with check (
    exists (
      select 1 from playlists pl
      where pl.id = playlist_id and pl.user_id = auth.uid()
    )
  );
create policy playlist_track_events_update_own on playlist_track_events
  for update to authenticated
  using (
    exists (
      select 1 from playlists pl
      where pl.id = playlist_id and pl.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from playlists pl
      where pl.id = playlist_id and pl.user_id = auth.uid()
    )
  );
create policy playlist_track_events_delete_own on playlist_track_events
  for delete to authenticated
  using (
    exists (
      select 1 from playlists pl
      where pl.id = playlist_id and pl.user_id = auth.uid()
    )
  );

create policy smart_playlists_select_members on smart_playlists
  for select to authenticated using (is_member());
create policy smart_playlists_insert_own on smart_playlists
  for insert to authenticated with check (user_id = auth.uid());
create policy smart_playlists_update_own on smart_playlists
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy smart_playlists_delete_own on smart_playlists
  for delete to authenticated using (user_id = auth.uid());

create policy smart_playlist_runs_select_members on smart_playlist_runs
  for select to authenticated using (is_member());
create policy smart_playlist_runs_insert_own on smart_playlist_runs
  for insert to authenticated
  with check (
    exists (
      select 1 from smart_playlists sp
      where sp.id = smart_playlist_id and sp.user_id = auth.uid()
    )
  );
create policy smart_playlist_runs_update_own on smart_playlist_runs
  for update to authenticated
  using (
    exists (
      select 1 from smart_playlists sp
      where sp.id = smart_playlist_id and sp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from smart_playlists sp
      where sp.id = smart_playlist_id and sp.user_id = auth.uid()
    )
  );
create policy smart_playlist_runs_delete_own on smart_playlist_runs
  for delete to authenticated
  using (
    exists (
      select 1 from smart_playlists sp
      where sp.id = smart_playlist_id and sp.user_id = auth.uid()
    )
  );

create policy smart_playlist_overrides_select_members on smart_playlist_overrides
  for select to authenticated using (is_member());
create policy smart_playlist_overrides_insert_own on smart_playlist_overrides
  for insert to authenticated
  with check (
    exists (
      select 1 from smart_playlists sp
      where sp.id = smart_playlist_id and sp.user_id = auth.uid()
    )
  );
create policy smart_playlist_overrides_update_own on smart_playlist_overrides
  for update to authenticated
  using (
    exists (
      select 1 from smart_playlists sp
      where sp.id = smart_playlist_id and sp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from smart_playlists sp
      where sp.id = smart_playlist_id and sp.user_id = auth.uid()
    )
  );
create policy smart_playlist_overrides_delete_own on smart_playlist_overrides
  for delete to authenticated
  using (
    exists (
      select 1 from smart_playlists sp
      where sp.id = smart_playlist_id and sp.user_id = auth.uid()
    )
  );

create policy swipe_decisions_select_members on swipe_decisions
  for select to authenticated using (is_member());
create policy swipe_decisions_insert_own on swipe_decisions
  for insert to authenticated with check (user_id = auth.uid());
create policy swipe_decisions_update_own on swipe_decisions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy swipe_decisions_delete_own on swipe_decisions
  for delete to authenticated using (user_id = auth.uid());

create policy recaps_select_members on recaps
  for select to authenticated using (is_member());
create policy recaps_insert_own on recaps
  for insert to authenticated with check (user_id = auth.uid());
create policy recaps_update_own on recaps
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy recaps_delete_own on recaps
  for delete to authenticated using (user_id = auth.uid());

create policy sync_state_select_members on sync_state
  for select to authenticated using (is_member());
create policy sync_state_insert_own on sync_state
  for insert to authenticated with check (user_id = auth.uid());
create policy sync_state_update_own on sync_state
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sync_state_delete_own on sync_state
  for delete to authenticated using (user_id = auth.uid());

create policy notification_prefs_select_members on notification_prefs
  for select to authenticated using (is_member());
create policy notification_prefs_insert_own on notification_prefs
  for insert to authenticated with check (user_id = auth.uid());
create policy notification_prefs_update_own on notification_prefs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notification_prefs_delete_own on notification_prefs
  for delete to authenticated using (user_id = auth.uid());

create policy notifications_select_members on notifications
  for select to authenticated using (is_member());
create policy notifications_insert_own on notifications
  for insert to authenticated with check (user_id = auth.uid());
create policy notifications_update_own on notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete_own on notifications
  for delete to authenticated using (user_id = auth.uid());
