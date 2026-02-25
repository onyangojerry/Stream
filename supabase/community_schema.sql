-- Community feature tables and storage for Striim
-- Run in Supabase SQL editor (adjust policies for your auth model before production)

create extension if not exists pgcrypto;

create table if not exists public.profiles_public (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  avatar_url text,
  github_profile text,
  bio text,
  is_registered_user boolean not null default true,
  is_active boolean not null default false,
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meeting_join_requests (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  meeting_title text,
  requester_user_id uuid references auth.users(id) on delete set null,
  requester_name text not null,
  requester_github text not null,
  interest_description text not null,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists meeting_join_requests_room_id_idx on public.meeting_join_requests(room_id);
create index if not exists meeting_join_requests_status_idx on public.meeting_join_requests(status);

create table if not exists public.public_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null check (type in ('recording','presentation','image','video','object','document','project','demo')),
  url text not null,
  github_url text,
  demo_url text,
  owner_user_id uuid references auth.users(id) on delete set null,
  owner_name text not null,
  is_public boolean not null default true,
  visibility text not null default 'public' check (visibility in ('public','private','invite-gated')),
  publish_after_invite_accepted boolean not null default false,
  collaborator_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists public_materials_public_idx on public.public_materials(is_public);

alter table public.public_materials add column if not exists github_url text;
alter table public.public_materials add column if not exists demo_url text;
alter table public.public_materials add column if not exists visibility text not null default 'public';
alter table public.public_materials add column if not exists publish_after_invite_accepted boolean not null default false;

create table if not exists public.material_reactions (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.public_materials(id) on delete cascade,
  reaction text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists material_reactions_material_id_idx on public.material_reactions(material_id);

create table if not exists public.collaboration_invites (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.public_materials(id) on delete cascade,
  material_title text not null,
  invited_user_id uuid not null references auth.users(id) on delete cascade,
  invited_user_name text not null,
  invited_by_user_id uuid not null references auth.users(id) on delete cascade,
  invited_by_name text not null,
  role text not null check (role in ('viewer','commenter','editor')),
  status text not null check (status in ('pending','accepted','declined')) default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  owner_name text not null,
  is_private boolean not null default false,
  member_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_threads (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) on delete cascade,
  title text not null,
  author_user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  tags text[] not null default '{}',
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_thread_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.community_threads(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  content text not null,
  parent_message_id uuid references public.community_thread_messages(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Optional timestamp trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_public_set_updated_at'
  ) THEN
    CREATE TRIGGER profiles_public_set_updated_at
    BEFORE UPDATE ON public.profiles_public
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'public_materials_set_updated_at'
  ) THEN
    CREATE TRIGGER public_materials_set_updated_at
    BEFORE UPDATE ON public.public_materials
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Storage bucket for uploaded public materials
insert into storage.buckets (id, name, public)
values ('public-materials', 'public-materials', true)
on conflict (id) do update set public = excluded.public;

-- Enable RLS (you should tailor policies to your project)
alter table public.profiles_public enable row level security;
alter table public.meeting_join_requests enable row level security;
alter table public.public_materials enable row level security;
alter table public.material_reactions enable row level security;
alter table public.collaboration_invites enable row level security;
alter table public.communities enable row level security;
alter table public.community_threads enable row level security;
alter table public.community_thread_messages enable row level security;

-- Baseline permissive policies for prototyping (replace in production)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profiles_public' and policyname = 'profiles_public_read') then
    create policy profiles_public_read on public.profiles_public for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles_public' and policyname = 'profiles_public_upsert') then
    create policy profiles_public_upsert on public.profiles_public for all using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'meeting_join_requests' and policyname = 'meeting_join_requests_read') then
    create policy meeting_join_requests_read on public.meeting_join_requests for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'meeting_join_requests' and policyname = 'meeting_join_requests_insert') then
    create policy meeting_join_requests_insert on public.meeting_join_requests for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'meeting_join_requests' and policyname = 'meeting_join_requests_update') then
    create policy meeting_join_requests_update on public.meeting_join_requests for update using (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'public_materials' and policyname = 'public_materials_read') then
    create policy public_materials_read on public.public_materials for select using (is_public = true or auth.uid() = owner_user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'public_materials' and policyname = 'public_materials_insert') then
    create policy public_materials_insert on public.public_materials for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'public_materials' and policyname = 'public_materials_update_owner') then
    create policy public_materials_update_owner on public.public_materials for update using (auth.uid() = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'material_reactions' and policyname = 'material_reactions_read') then
    create policy material_reactions_read on public.material_reactions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'material_reactions' and policyname = 'material_reactions_insert') then
    create policy material_reactions_insert on public.material_reactions for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'collaboration_invites' and policyname = 'collaboration_invites_read') then
    create policy collaboration_invites_read on public.collaboration_invites for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'collaboration_invites' and policyname = 'collaboration_invites_insert') then
    create policy collaboration_invites_insert on public.collaboration_invites for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'collaboration_invites' and policyname = 'collaboration_invites_update') then
    create policy collaboration_invites_update on public.collaboration_invites for update using (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'communities' and policyname = 'communities_read') then
    create policy communities_read on public.communities for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'communities' and policyname = 'communities_insert') then
    create policy communities_insert on public.communities for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'communities' and policyname = 'communities_update_owner') then
    create policy communities_update_owner on public.communities for update using (auth.uid() = owner_user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'communities' and policyname = 'communities_delete_owner') then
    create policy communities_delete_owner on public.communities for delete using (auth.uid() = owner_user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'community_threads' and policyname = 'community_threads_read') then
    create policy community_threads_read on public.community_threads for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'community_threads' and policyname = 'community_threads_insert') then
    create policy community_threads_insert on public.community_threads for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'community_threads' and policyname = 'community_threads_update') then
    create policy community_threads_update on public.community_threads for update using (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'community_thread_messages' and policyname = 'community_thread_messages_read') then
    create policy community_thread_messages_read on public.community_thread_messages for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'community_thread_messages' and policyname = 'community_thread_messages_insert') then
    create policy community_thread_messages_insert on public.community_thread_messages for insert with check (true);
  end if;
end $$;

-- Storage policies (prototype-open, tighten in production)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'public_materials_bucket_read' and schemaname = 'storage') then
    create policy public_materials_bucket_read on storage.objects for select using (bucket_id = 'public-materials');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'public_materials_bucket_insert' and schemaname = 'storage') then
    create policy public_materials_bucket_insert on storage.objects for insert with check (bucket_id = 'public-materials' and auth.role() = 'authenticated');
  end if;
end $$;
