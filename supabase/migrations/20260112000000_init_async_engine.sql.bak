-- Create jobs table
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'carousel_generation', 'lead_enrichment', 'linkedin_invite'
  status text not null default 'pending', -- pending, queued, processing, completed, failed
  payload jsonb not null, -- The input arguments (prompt, etc)
  result jsonb, -- The output (image URLs, etc)
  error text, -- Error message if failed
  
  -- Scheduling & Safety
  scheduled_for timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Resumability
  checkpoint jsonb,
  
  -- Governance
  user_id uuid references auth.users(id) default auth.uid()
);

-- Indexes
create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists jobs_scheduled_idx on public.jobs(scheduled_for) where status = 'pending';
create index if not exists jobs_user_id_idx on public.jobs(user_id);

-- Governance Rules
create table if not exists public.governance_rules (
  rule_key text primary key,
  config jsonb not null, 
  current_usage int default 0,
  last_reset_at timestamptz default now()
);

-- RLS
alter table public.jobs enable row level security;
alter table public.governance_rules enable row level security;

-- Policies for jobs
create policy "Users can view their own jobs"
  on public.jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

create policy "Service Role can manage all jobs"
  on public.jobs for all
  to service_role
  using (true)
  with check (true);

-- Policies for governance_rules (Read-only for users)
create policy "Users can view governance rules"
  on public.governance_rules for select
  to authenticated
  using (true);

-- Explicitly grant permissions to Authenticated and Service Role
grant select, insert, update on public.jobs to authenticated;
grant all on public.jobs to service_role;

grant select on public.governance_rules to authenticated;
grant all on public.governance_rules to service_role;

-- Seed initial LinkedIn Governance Rule
insert into public.governance_rules (rule_key, config)
values 
('linkedin_outreach_daily', '{"min": 20, "max": 40, "window_start": "09:00", "window_end": "21:00", "timezone": "America/New_York"}')
on conflict (rule_key) do nothing;
