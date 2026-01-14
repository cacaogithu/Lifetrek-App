-- Create Job Queue Table
create type job_status as enum ('pending', 'processing', 'completed', 'failed');

create table public.job_queue (
    id uuid primary key default gen_random_uuid(),
    job_type text not null, -- 'research', 'blog_generate', 'lead_score'
    payload jsonb not null default '{}'::jsonb,
    result jsonb,
    error text,
    status job_status not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    started_at timestamptz,
    completed_at timestamptz,
    user_id uuid references auth.users(id) not null
);

-- Indexes
create index idx_jobs_status on public.job_queue(status);
create index idx_jobs_type on public.job_queue(job_type);
create index idx_jobs_user on public.job_queue(user_id);

-- RLS
alter table public.job_queue enable row level security;

-- Policy: Users can see their own jobs
create policy "Users can view their own jobs"
    on public.job_queue for select
    using (auth.uid() = user_id);

-- Policy: Users can insert jobs
create policy "Users can insert jobs"
    on public.job_queue for insert
    with check (auth.uid() = user_id);

-- Policy: Only Service Role can update jobs (Workers)
create policy "Service Role can update jobs"
    on public.job_queue for update
    using ( auth.role() = 'service_role' );

-- Trigger for updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.job_queue
  for each row execute procedure moddatetime (updated_at);
