
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "albums": {
                  Row: {
                    "album_type": string | null,"id": string,"image_url": string | null,"name": string,"release_date": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "album_type"?: string | null,"id": string,"image_url"?: string | null,"name": string,"release_date"?: string | null
                  }
                  Update: {
                    "album_type"?: string | null,"id"?: string,"image_url"?: string | null,"name"?: string,"release_date"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"artists": {
                  Row: {
                    "fetched_at": string | null,"genres": (string)[] | null,"id": string,"image_url": string | null,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "fetched_at"?: string | null,"genres"?: (string)[] | null,"id": string,"image_url"?: string | null,"name": string
                  }
                  Update: {
                    "fetched_at"?: string | null,"genres"?: (string)[] | null,"id"?: string,"image_url"?: string | null,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"auth_states": {
                  Row: {
                    "code_verifier": string,"created_at": string,"expires_at": string,"invite_code": string | null,"platform": string,"state": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code_verifier": string,"created_at"?: string,"expires_at": string,"invite_code"?: string | null,"platform": string,"state": string
                  }
                  Update: {
                    "code_verifier"?: string,"created_at"?: string,"expires_at"?: string,"invite_code"?: string | null,"platform"?: string,"state"?: string
                  }
                  Relationships: [
                    
                  ]
                },"devices": {
                  Row: {
                    "expo_push_token": string,"id": string,"last_seen_at": string,"platform": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "expo_push_token": string,"id"?: string,"last_seen_at"?: string,"platform": string,"user_id": string
                  }
                  Update: {
                    "expo_push_token"?: string,"id"?: string,"last_seen_at"?: string,"platform"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "devices_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"imports": {
                  Row: {
                    "created_at": string,"error": string | null,"files_total": number | null,"finished_at": string | null,"id": string,"rows_duplicate": number | null,"rows_inserted": number | null,"rows_parsed": number | null,"rows_skipped_podcast": number | null,"status": Database["public"]['Enums']["job_status"],"storage_path": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"error"?: string | null,"files_total"?: number | null,"finished_at"?: string | null,"id"?: string,"rows_duplicate"?: number | null,"rows_inserted"?: number | null,"rows_parsed"?: number | null,"rows_skipped_podcast"?: number | null,"status"?: Database["public"]['Enums']["job_status"],"storage_path": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"error"?: string | null,"files_total"?: number | null,"finished_at"?: string | null,"id"?: string,"rows_duplicate"?: number | null,"rows_inserted"?: number | null,"rows_parsed"?: number | null,"rows_skipped_podcast"?: number | null,"status"?: Database["public"]['Enums']["job_status"],"storage_path"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "imports_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"invites": {
                  Row: {
                    "code": string,"created_by": string,"email": string,"expires_at": string,"revoked_at": string | null,"used_at": string | null,"used_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_by": string,"email": string,"expires_at": string,"revoked_at"?: string | null,"used_at"?: string | null,"used_by"?: string | null
                  }
                  Update: {
                    "code"?: string,"created_by"?: string,"email"?: string,"expires_at"?: string,"revoked_at"?: string | null,"used_at"?: string | null,"used_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "invites_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invites_used_by_fkey"
      columns: ["used_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"jobs": {
                  Row: {
                    "attempts": number,"created_at": string,"id": number,"last_error": string | null,"locked_at": string | null,"max_attempts": number,"payload": NonNullable<Json>,"run_after": string,"status": Database["public"]['Enums']["job_status"],"type": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "attempts"?: number,"created_at"?: string,"id"?: never,"last_error"?: string | null,"locked_at"?: string | null,"max_attempts"?: number,"payload"?: NonNullable<Json>,"run_after"?: string,"status"?: Database["public"]['Enums']["job_status"],"type": string,"user_id"?: string | null
                  }
                  Update: {
                    "attempts"?: number,"created_at"?: string,"id"?: never,"last_error"?: string | null,"locked_at"?: string | null,"max_attempts"?: number,"payload"?: NonNullable<Json>,"run_after"?: string,"status"?: Database["public"]['Enums']["job_status"],"type"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "jobs_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"lastfm_matches": {
                  Row: {
                    "artist_norm": string,"matched_at": string,"spotify_track_id": string | null,"track_norm": string
                  }
                  ComputedFields: never
                  Insert: {
                    "artist_norm": string,"matched_at"?: string,"spotify_track_id"?: string | null,"track_norm": string
                  }
                  Update: {
                    "artist_norm"?: string,"matched_at"?: string,"spotify_track_id"?: string | null,"track_norm"?: string
                  }
                  Relationships: [
                    
                  ]
                },"liked_tracks": {
                  Row: {
                    "liked_at": string,"track_id": string,"unliked_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "liked_at": string,"track_id": string,"unliked_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "liked_at"?: string,"track_id"?: string,"unliked_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "liked_tracks_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "liked_tracks_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"mobile_auth_codes": {
                  Row: {
                    "code": string,"created_at": string,"expires_at": string,"used_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"expires_at": string,"used_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"expires_at"?: string,"used_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "mobile_auth_codes_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"notification_prefs": {
                  Row: {
                    "friend_activity": boolean,"smart_playlist_updated": boolean,"user_id": string,"weekly_recap": boolean,"yearly_recap": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "friend_activity"?: boolean,"smart_playlist_updated"?: boolean,"user_id": string,"weekly_recap"?: boolean,"yearly_recap"?: boolean
                  }
                  Update: {
                    "friend_activity"?: boolean,"smart_playlist_updated"?: boolean,"user_id"?: string,"weekly_recap"?: boolean,"yearly_recap"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "notification_prefs_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "body": string,"created_at": string,"data": Json | null,"id": number,"kind": string,"read_at": string | null,"sent_at": string | null,"title": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"data"?: Json | null,"id"?: never,"kind": string,"read_at"?: string | null,"sent_at"?: string | null,"title": string,"user_id": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"data"?: Json | null,"id"?: never,"kind"?: string,"read_at"?: string | null,"sent_at"?: string | null,"title"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"playlist_track_events": {
                  Row: {
                    "at": string,"event": string,"id": number,"playlist_id": string | null,"track_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "at"?: string,"event": string,"id"?: never,"playlist_id"?: string | null,"track_id"?: string | null
                  }
                  Update: {
                    "at"?: string,"event"?: string,"id"?: never,"playlist_id"?: string | null,"track_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "playlist_track_events_playlist_id_fkey"
      columns: ["playlist_id"]
isOneToOne: false
      referencedRelation: "playlists"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "playlist_track_events_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    }
                  ]
                },"playlist_tracks": {
                  Row: {
                    "added_at": string | null,"added_by": string | null,"playlist_id": string,"position": number,"track_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "added_at"?: string | null,"added_by"?: string | null,"playlist_id": string,"position": number,"track_id"?: string | null
                  }
                  Update: {
                    "added_at"?: string | null,"added_by"?: string | null,"playlist_id"?: string,"position"?: number,"track_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "playlist_tracks_playlist_id_fkey"
      columns: ["playlist_id"]
isOneToOne: false
      referencedRelation: "playlists"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "playlist_tracks_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    }
                  ]
                },"playlists": {
                  Row: {
                    "description": string | null,"id": string,"image_url": string | null,"is_collaborative": boolean,"is_owner": boolean,"item_count": number | null,"name": string,"orion_managed": boolean,"snapshot_id": string | null,"synced_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string | null,"id": string,"image_url"?: string | null,"is_collaborative": boolean,"is_owner": boolean,"item_count"?: number | null,"name": string,"orion_managed"?: boolean,"snapshot_id"?: string | null,"synced_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "description"?: string | null,"id"?: string,"image_url"?: string | null,"is_collaborative"?: boolean,"is_owner"?: boolean,"item_count"?: number | null,"name"?: string,"orion_managed"?: boolean,"snapshot_id"?: string | null,"synced_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "playlists_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"plays": {
                  Row: {
                    "context_uri": string | null,"counted": boolean,"id": number,"ms_played": number | null,"platform": string | null,"played_at": string,"reason_end": string | null,"reason_start": string | null,"shuffle": boolean | null,"skipped": boolean | null,"source": Database["public"]['Enums']["play_source"],"track_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "context_uri"?: string | null,"counted": boolean,"id"?: never,"ms_played"?: number | null,"platform"?: string | null,"played_at": string,"reason_end"?: string | null,"reason_start"?: string | null,"shuffle"?: boolean | null,"skipped"?: boolean | null,"source": Database["public"]['Enums']["play_source"],"track_id": string,"user_id": string
                  }
                  Update: {
                    "context_uri"?: string | null,"counted"?: boolean,"id"?: never,"ms_played"?: number | null,"platform"?: string | null,"played_at"?: string,"reason_end"?: string | null,"reason_start"?: string | null,"shuffle"?: boolean | null,"skipped"?: boolean | null,"source"?: Database["public"]['Enums']["play_source"],"track_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "plays_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "plays_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"display_name": string | null,"id": string,"lastfm_username": string | null,"locale": string,"onboarding_done": boolean,"quick_target_playlist_ids": (string)[],"role": Database["public"]['Enums']["user_role"],"spotify_user_id": string,"timezone": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"display_name"?: string | null,"id": string,"lastfm_username"?: string | null,"locale"?: string,"onboarding_done"?: boolean,"quick_target_playlist_ids"?: (string)[],"role"?: Database["public"]['Enums']["user_role"],"spotify_user_id": string,"timezone"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"display_name"?: string | null,"id"?: string,"lastfm_username"?: string | null,"locale"?: string,"onboarding_done"?: boolean,"quick_target_playlist_ids"?: (string)[],"role"?: Database["public"]['Enums']["user_role"],"spotify_user_id"?: string,"timezone"?: string
                  }
                  Relationships: [
                    
                  ]
                },"recaps": {
                  Row: {
                    "created_at": string,"data": NonNullable<Json>,"id": string,"period": string,"period_start": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"data": NonNullable<Json>,"id"?: string,"period": string,"period_start": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"period"?: string,"period_start"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "recaps_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"smart_playlist_overrides": {
                  Row: {
                    "detected_at": string,"kind": string,"smart_playlist_id": string,"track_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "detected_at"?: string,"kind": string,"smart_playlist_id": string,"track_id": string
                  }
                  Update: {
                    "detected_at"?: string,"kind"?: string,"smart_playlist_id"?: string,"track_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "smart_playlist_overrides_smart_playlist_id_fkey"
      columns: ["smart_playlist_id"]
isOneToOne: false
      referencedRelation: "smart_playlists"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "smart_playlist_overrides_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    }
                  ]
                },"smart_playlist_runs": {
                  Row: {
                    "added": number | null,"error": string | null,"id": number,"ran_at": string,"removed": number | null,"smart_playlist_id": string | null,"track_ids": (string)[]
                  }
                  ComputedFields: never
                  Insert: {
                    "added"?: number | null,"error"?: string | null,"id"?: never,"ran_at"?: string,"removed"?: number | null,"smart_playlist_id"?: string | null,"track_ids": (string)[]
                  }
                  Update: {
                    "added"?: number | null,"error"?: string | null,"id"?: never,"ran_at"?: string,"removed"?: number | null,"smart_playlist_id"?: string | null,"track_ids"?: (string)[]
                  }
                  Relationships: [
                    {
      foreignKeyName: "smart_playlist_runs_smart_playlist_id_fkey"
      columns: ["smart_playlist_id"]
isOneToOne: false
      referencedRelation: "smart_playlists"
      referencedColumns: ["id"]
    }
                  ]
                },"smart_playlists": {
                  Row: {
                    "created_at": string,"id": string,"last_run_at": string | null,"mode": Database["public"]['Enums']["smart_mode"],"name": string,"next_run_at": string | null,"params": NonNullable<Json>,"paused": boolean,"schedule": Database["public"]['Enums']["smart_schedule"] | null,"spotify_playlist_id": string | null,"type": Database["public"]['Enums']["smart_type"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"last_run_at"?: string | null,"mode": Database["public"]['Enums']["smart_mode"],"name": string,"next_run_at"?: string | null,"params": NonNullable<Json>,"paused"?: boolean,"schedule"?: Database["public"]['Enums']["smart_schedule"] | null,"spotify_playlist_id"?: string | null,"type": Database["public"]['Enums']["smart_type"],"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"last_run_at"?: string | null,"mode"?: Database["public"]['Enums']["smart_mode"],"name"?: string,"next_run_at"?: string | null,"params"?: NonNullable<Json>,"paused"?: boolean,"schedule"?: Database["public"]['Enums']["smart_schedule"] | null,"spotify_playlist_id"?: string | null,"type"?: Database["public"]['Enums']["smart_type"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "smart_playlists_spotify_playlist_id_fkey"
      columns: ["spotify_playlist_id"]
isOneToOne: false
      referencedRelation: "playlists"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "smart_playlists_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"spotify_connections": {
                  Row: {
                    "access_token_enc": string,"expires_at": string,"refresh_token_enc": string,"scopes": (string)[],"status": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "access_token_enc": string,"expires_at": string,"refresh_token_enc": string,"scopes": (string)[],"status"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "access_token_enc"?: string,"expires_at"?: string,"refresh_token_enc"?: string,"scopes"?: (string)[],"status"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "spotify_connections_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"spotify_top_snapshots": {
                  Row: {
                    "ids": (string)[],"kind": string,"taken_on": string,"time_range": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ids": (string)[],"kind": string,"taken_on": string,"time_range": string,"user_id": string
                  }
                  Update: {
                    "ids"?: (string)[],"kind"?: string,"taken_on"?: string,"time_range"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "spotify_top_snapshots_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"swipe_decisions": {
                  Row: {
                    "decided_at": string,"decision": Database["public"]['Enums']["swipe_decision"],"source": string,"track_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "decided_at"?: string,"decision": Database["public"]['Enums']["swipe_decision"],"source": string,"track_id": string,"user_id": string
                  }
                  Update: {
                    "decided_at"?: string,"decision"?: Database["public"]['Enums']["swipe_decision"],"source"?: string,"track_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "swipe_decisions_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "swipe_decisions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"sync_state": {
                  Row: {
                    "cursor": string | null,"kind": string,"last_error": string | null,"last_success_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cursor"?: string | null,"kind": string,"last_error"?: string | null,"last_success_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "cursor"?: string | null,"kind"?: string,"last_error"?: string | null,"last_success_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sync_state_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"track_artists": {
                  Row: {
                    "artist_id": string,"position": number,"track_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "artist_id": string,"position": number,"track_id": string
                  }
                  Update: {
                    "artist_id"?: string,"position"?: number,"track_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "track_artists_artist_id_fkey"
      columns: ["artist_id"]
isOneToOne: false
      referencedRelation: "artists"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "track_artists_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    }
                  ]
                },"track_similar": {
                  Row: {
                    "fetched_at": string,"score": number,"similar_track_id": string,"track_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "fetched_at"?: string,"score": number,"similar_track_id": string,"track_id": string
                  }
                  Update: {
                    "fetched_at"?: string,"score"?: number,"similar_track_id"?: string,"track_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "track_similar_similar_track_id_fkey"
      columns: ["similar_track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "track_similar_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    }
                  ]
                },"track_tags": {
                  Row: {
                    "tag": string,"track_id": string,"weight": number
                  }
                  ComputedFields: never
                  Insert: {
                    "tag": string,"track_id": string,"weight": number
                  }
                  Update: {
                    "tag"?: string,"track_id"?: string,"weight"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "track_tags_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    }
                  ]
                },"tracks": {
                  Row: {
                    "album_id": string | null,"duration_ms": number | null,"explicit": boolean | null,"fallback_album_name": string | null,"fallback_artist_name": string | null,"fetched_at": string | null,"id": string,"isrc": string | null,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "album_id"?: string | null,"duration_ms"?: number | null,"explicit"?: boolean | null,"fallback_album_name"?: string | null,"fallback_artist_name"?: string | null,"fetched_at"?: string | null,"id": string,"isrc"?: string | null,"name": string
                  }
                  Update: {
                    "album_id"?: string | null,"duration_ms"?: number | null,"explicit"?: boolean | null,"fallback_album_name"?: string | null,"fallback_artist_name"?: string | null,"fetched_at"?: string | null,"id"?: string,"isrc"?: string | null,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tracks_album_id_fkey"
      columns: ["album_id"]
isOneToOne: false
      referencedRelation: "albums"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "mv_artist_counts": {
                  Row: {
                    "artist_id": string | null,"ms_total": number | null,"plays_30d": number | null,"plays_total": number | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "plays_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "track_artists_artist_id_fkey"
      columns: ["artist_id"]
isOneToOne: false
      referencedRelation: "artists"
      referencedColumns: ["id"]
    }
                  ]
                },"mv_daily_listening": {
                  Row: {
                    "day": string | null,"ms_played": number | null,"plays": number | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "plays_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"mv_track_counts": {
                  Row: {
                    "first_played_at": string | null,"last_played_at": string | null,"ms_total": number | null,"plays_30d": number | null,"plays_365d": number | null,"plays_7d": number | null,"plays_total": number | null,"track_id": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "plays_track_id_fkey"
      columns: ["track_id"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "plays_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "is_member":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           }
          }
          Enums: {
            "job_status": "queued"|"running"|"done"|"failed","play_source": "export"|"recently_played"|"lastfm","smart_mode": "snapshot"|"auto","smart_schedule": "daily"|"weekly"|"monthly","smart_type": "on_repeat"|"recent"|"songs_alike"|"forgotten_likes"|"blend"|"top_period","swipe_decision": "like"|"skip"|"later","user_role": "owner"|"member"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "job_status": ["queued", "running", "done", "failed"],"play_source": ["export", "recently_played", "lastfm"],"smart_mode": ["snapshot", "auto"],"smart_schedule": ["daily", "weekly", "monthly"],"smart_type": ["on_repeat", "recent", "songs_alike", "forgotten_likes", "blend", "top_period"],"swipe_decision": ["like", "skip", "later"],"user_role": ["owner", "member"]
          }
        }
} as const
