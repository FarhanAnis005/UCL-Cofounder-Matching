# UCL Cohort Network

A full-stack Next.js web application built for an **80-person UCL cohort** to find co-founders, project partners, and network. It eliminates in-app messaging friction by routing all connection requests directly to **WhatsApp**.

---

## ⚡ Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS, Glassmorphism, Google Fonts (`Inter` & `Outfit`)
- **UI Components**: shadcn/ui design patterns (Cards, Buttons, Inputs, Multi-select Badge Pills)
- **Backend & Database**: Supabase (Auth, Postgres SQL, Row Level Security)
- **Handoff Mechanism**: Direct `wa.me` deep links with pre-filled introductory messages
- **Deployment**: Vercel-ready

---

## 🚀 Key Features

### 1. Authentication (Supabase Auth)
- Minimalist landing page with **"Continue with Google"** and **"Continue with LinkedIn"** OAuth buttons.
- New users are seamlessly routed to `/setup-profile`.
- Returning users with an active profile are routed directly to `/feed`.
- Interactive Preview Mode supported out of the box even before configuring production OAuth keys.

### 2. Three-Step Onboarding Funnel (`/setup-profile`)
Client-side multi-step flow with progress bar to maximize completion rate:
- **Step 1: "The Supply" (What they bring)**:
  - *Current Focus*: Building a Startup, Looking to Join a Startup, Hunting for VC/Roles, Academic Projects/Hackathons.
  - *My Superpowers* (Multi-select, Max 2): Engineering/AI, Product/Design, Business/Ops, Sales/GTM, Finance/VC.
  - *The One-Liner*: Max 100 characters with live character counter.
- **Step 2: "The Demand" (Who they want to meet)**:
  - *I am looking to meet* (Multi-select, Max 2): Technical Co-founder, Business/GTM Co-founder, Teammates for Hackathons, VC/Finance connections, Brainstorming partners.
  - *Industry Interests* (Multi-select, Max 3): AI, FinTech, HealthTech, Consumer, DeepTech, Climate.
- **Step 3: "The Handoff" (Contact Info)**:
  - *WhatsApp Number*: Enforces international country code validation (e.g. `+44...`).
  - *Live Preview*: Dynamic `wa.me` link validation and cohort card preview.
  - *Confetti celebration* on completion and instant redirect to `/feed`.

### 3. The Directory Feed (`/feed`)
- Responsive grid of user profile cards.
- **Visual Card Elements**: Display name, UCL department & graduation year, Focus badge, The One-Liner quote, distinct pill-shaped tags for **"I Bring:"** (Superpowers) and **"I Need:"** (Looking to meet), plus industry badges.
- **Demand Toggle Filters**: Simple toggle buttons at the top of the feed to filter users by their *"I am looking to meet"* tags so users can instantly find demand for their specific skills.
- **WhatsApp Deep Link Button**: Primary CTA button opening:
  `https://wa.me/{clean_phone}?text=Hey%20{name}%2C%20saw%20your%20profile%20on%20the%20UCL%20matching%20app...`

---

## 🗄️ Supabase Database Setup & SQL Schema

Run the following SQL snippet in your Supabase project's **SQL Editor** (**Dashboard -> Project -> SQL Editor -> New Query**):

```sql
-- 1. Create the `profiles` table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  phone text not null,
  bio text not null default '', -- The One-Liner (Max 100 chars)
  current_focus text not null default 'Building a Startup',
  superpowers text[] not null default '{}',
  looking_for text[] not null default '{}',
  industries text[] not null default '{}',
  ucl_department text default 'Computer Science',
  graduation_year text default '2025',
  linkedin_url text,
  github_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 2. GIN Indexes for array queries & filters
create index if not exists idx_profiles_current_focus on public.profiles (current_focus);
create index if not exists idx_profiles_superpowers on public.profiles using gin (superpowers);
create index if not exists idx_profiles_looking_for on public.profiles using gin (looking_for);
create index if not exists idx_profiles_industries on public.profiles using gin (industries);

-- 3. Automatic timestamp updater trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy 1: Authenticated users can view all cohort profiles
create policy "Authenticated users can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Policy 2: Users can insert their own profile
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Policy 3: Users can update their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy 4: Public/Anon read access for directory browsing
create policy "Public can read profiles"
  on public.profiles
  for select
  to anon
  using (true);
```

---

## 🛠️ Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your project keys from Supabase (**Project Settings -> API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🏃 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL)
4. In Supabase Authentication settings (**Auth -> URL Configuration**), set your Site URL to your Vercel production domain and add:
   - `https://your-domain.vercel.app/auth/callback` to the **Redirect URLs**.
