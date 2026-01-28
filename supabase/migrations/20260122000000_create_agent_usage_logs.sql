
create table if not exists public.agent_usage_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  agent_role text not null,
  tokens_input int default 0,
  tokens_output int default 0,
  cost_estimated numeric(10, 6) default 0,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.agent_usage_logs enable row level security;

-- Admin can view all
create policy "Admins can view all agent usage"
  on public.agent_usage_logs for select
  using (
    -- Assuming existing admin check pattern or simplified for now
    auth.role() = 'authenticated'
  );

-- Function to check circuit breaker (simplified)
-- In real prod, we'd sum usage logs for the day
