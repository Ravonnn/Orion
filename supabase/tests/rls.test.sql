begin;
create extension if not exists pgtap with schema extensions;

select plan(14);

select set_config('orion.alice', '11111111-1111-1111-1111-111111111111', true);
select set_config('orion.bob', '22222222-2222-2222-2222-222222222222', true);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    current_setting('orion.alice')::uuid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alice@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    current_setting('orion.bob')::uuid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'bob@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.profiles (id, spotify_user_id, display_name, role)
values
  (current_setting('orion.alice')::uuid, 'spotify_alice', 'Alice', 'owner'),
  (current_setting('orion.bob')::uuid, 'spotify_bob', 'Bob', 'member');

insert into public.tracks (id, name) values ('track_1', 'Test Track');

insert into public.plays (user_id, track_id, played_at, ms_played, counted, source)
values (
  current_setting('orion.alice')::uuid,
  'track_1',
  now(),
  60000,
  true,
  'recently_played'
);

insert into public.devices (user_id, expo_push_token, platform)
values (current_setting('orion.alice')::uuid, 'ExponentPushToken[alice]', 'ios');

insert into public.spotify_connections (
  user_id, access_token_enc, refresh_token_enc, expires_at, scopes
) values (
  current_setting('orion.alice')::uuid,
  'enc_a',
  'enc_r',
  now() + interval '1 hour',
  array['playlist-read-private']
);

insert into public.invites (code, email, created_by, expires_at)
values (
  'ABCD1234',
  'friend@example.com',
  current_setting('orion.alice')::uuid,
  now() + interval '14 days'
);

insert into public.jobs (type, user_id, payload)
values ('poll_recently_played', current_setting('orion.alice')::uuid, '{}'::jsonb);

insert into public.auth_states (state, code_verifier, platform, expires_at)
values ('state1', 'verifier', 'web', now() + interval '10 minutes');

insert into public.mobile_auth_codes (code, user_id, expires_at)
values ('mobile1', current_setting('orion.alice')::uuid, now() + interval '5 minutes');

-- Authenticate as Bob
select set_config('request.jwt.claim.sub', current_setting('orion.bob'), true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('orion.bob'),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

select throws_ok(
  format(
    $sql$insert into public.plays (user_id, track_id, played_at, ms_played, counted, source)
      values (%L::uuid, 'track_1', now() + interval '1 second', 60000, true, 'recently_played')$sql$,
    current_setting('orion.alice')
  ),
  '42501',
  null,
  'member cannot insert another member''s plays'
);

do $$
declare
  n int;
begin
  update public.plays
  set ms_played = 1
  where user_id = current_setting('orion.alice')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'expected 0 updated plays, got %', n;
  end if;
end $$;
select pass('member cannot update another member''s plays');

do $$
declare
  n int;
begin
  delete from public.plays
  where user_id = current_setting('orion.alice')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'expected 0 deleted plays, got %', n;
  end if;
end $$;
select pass('member cannot delete another member''s plays');

select throws_ok(
  format(
    $sql$insert into public.devices (user_id, expo_push_token, platform)
      values (%L::uuid, 'ExponentPushToken[bob-as-alice]', 'ios')$sql$,
    current_setting('orion.alice')
  ),
  '42501',
  null,
  'member cannot insert a device for another member'
);

do $$
declare
  n int;
begin
  update public.devices
  set platform = 'android'
  where user_id = current_setting('orion.alice')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'expected 0 updated devices, got %', n;
  end if;
end $$;
select pass('member cannot update another member''s devices');

do $$
declare
  n int;
begin
  delete from public.devices
  where user_id = current_setting('orion.alice')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'expected 0 deleted devices, got %', n;
  end if;
end $$;
select pass('member cannot delete another member''s devices');

select is(
  (select count(*)::int from public.spotify_connections),
  0,
  'member cannot read spotify_connections'
);

select is(
  (select count(*)::int from public.invites),
  0,
  'member cannot read invites'
);

select is(
  (select count(*)::int from public.jobs),
  0,
  'member cannot read jobs'
);

select is(
  (select count(*)::int from public.auth_states),
  0,
  'member cannot read auth_states'
);

select is(
  (select count(*)::int from public.mobile_auth_codes),
  0,
  'member cannot read mobile_auth_codes'
);

select is(
  (
    select count(*)::int
    from public.plays
    where user_id = current_setting('orion.alice')::uuid
  ),
  1,
  'member can select another member''s plays'
);

select lives_ok(
  format(
    $sql$insert into public.plays (user_id, track_id, played_at, ms_played, counted, source)
      values (%L::uuid, 'track_1', now() + interval '2 seconds', 45000, true, 'recently_played')$sql$,
    current_setting('orion.bob')
  ),
  'member can insert own plays'
);

select is(
  (select count(*)::int from public.plays where user_id = current_setting('orion.bob')::uuid),
  1,
  'member sees own inserted play'
);

select * from finish();
rollback;
