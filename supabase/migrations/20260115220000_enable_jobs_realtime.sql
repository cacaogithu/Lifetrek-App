-- Enable realtime updates for the jobs table when available.
do $$
begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
        if exists (
            select 1
            from pg_class c
            join pg_namespace n on n.oid = c.relnamespace
            where c.relname = 'jobs'
              and n.nspname = 'public'
        ) then
            if not exists (
                select 1
                from pg_publication_tables
                where pubname = 'supabase_realtime'
                  and schemaname = 'public'
                  and tablename = 'jobs'
            ) then
                execute 'alter publication supabase_realtime add table public.jobs';
            end if;
        end if;
    end if;
end $$;
