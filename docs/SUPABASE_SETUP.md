# Supabase Setup Guide

## Prerequisites
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js 18+ installed

## Setup Steps

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - Project name: `stream-video-platform`
   - Database password (save this securely)
   - Region (choose closest to your users)
4. Click "Create new project"

### 2. Get Your API Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the public API key)

### 3. Set Up Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Create Database Schema
1. In your Supabase project dashboard, go to **SQL Editor**
2. Run the following SQL to create the profiles table:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 5. Configure Authentication Settings (Optional)
1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable email auth (enabled by default)
3. Optional: Enable social auth providers (Google, GitHub, etc.)
4. Configure email templates in **Authentication** → **Email Templates**

### 6. Test Your Setup
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/signup` and create a test account
3. Check your Supabase dashboard under **Authentication** → **Users** to verify the user was created
4. Check **Table Editor** → **profiles** to verify the profile was created

## Additional Configuration

### Email Confirmation (Production)
By default, Supabase requires email confirmation. To disable for testing:
1. Go to **Authentication** → **Settings**
2. Under "Email Auth", disable "Enable email confirmations"

For production, keep this enabled and configure email templates.

### Password Reset
Password reset emails are sent automatically. Configure the redirect URL:
1. Go to **Authentication** → **URL Configuration**
2. Add your app URL to **Redirect URLs**

### Database Backups
Enable automatic backups:
1. Go to **Database** → **Backups**
2. Configure backup schedule

## Troubleshooting

### "Invalid API key" error
- Verify your `.env` file has the correct credentials
- Make sure you're using the **anon/public** key, not the service role key
- Restart your dev server after updating `.env`

### Profile not created after signup
- Check the SQL trigger was created successfully
- Verify RLS policies are set up correctly
- Check Supabase logs in the dashboard

### CORS errors
- Add your local development URL to **Authentication** → **URL Configuration** → **Site URL**

## Security Best Practices

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Use environment variables** for all credentials
3. **Enable RLS** on all tables (already done in setup)
4. **Keep dependencies updated**: `npm update`
5. **Use service role key only in server-side code**, never in the browser

## Next Steps

- Read the [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- Explore [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- Set up [Storage](https://supabase.com/docs/guides/storage) for user avatars
- Add [Realtime](https://supabase.com/docs/guides/realtime) for live features
