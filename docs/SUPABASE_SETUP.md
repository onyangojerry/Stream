# Supabase Setup

This project depends on two SQL setup layers:
1. base auth profile table (`profiles`)
2. community and meeting schema (`supabase/community_schema.sql`)

## 1. Create Supabase Project
1. Create a new Supabase project.
2. Save:
- project URL
- anon key

## 2. Configure Environment
Create `.env` from `.env.example` and set:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Create `profiles` Table
Run in SQL Editor:
```sql
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  avatar_url text,
  github_profile text,
  interest_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_read') then
    create policy profiles_read on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_insert') then
    create policy profiles_insert on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_update') then
    create policy profiles_update on public.profiles for update using (auth.uid() = id);
  end if;
end $$;
```

## 4. Apply Community Schema
Run full file:
- `supabase/community_schema.sql`

This creates tables and policies for:
- public profiles mirror
- join requests
- materials and reactions
- collaboration invites
- communities and threads
- follows
- scheduled meetings
- RSVPs
- storage bucket policy for public materials

## 5. Verify Setup
1. Start app: `npm run dev`
2. Sign up a user
3. Confirm `profiles` has a row for that user
4. Open `/community` and verify data fetch works
5. Create a scheduled meeting and RSVP to confirm persistence

## 6. Common Setup Failures
- Missing env values: auth and data calls fail
- `profiles` missing: auth session maps but profile operations fail
- community schema not applied: community/scheduler persistence fails

