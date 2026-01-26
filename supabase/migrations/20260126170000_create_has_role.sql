create or replace function public.has_role(p_uid uuid, p_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when p_role = 'admin' then exists (
        select 1
        from public.admin_users au
        where au.user_id = p_uid
      ) or exists (
        select 1
        from public.admin_permissions ap
        join auth.users u on u.email = ap.email
        where u.id = p_uid
      )
      else false
    end;
$$;

revoke all on function public.has_role(uuid, text) from public;
grant execute on function public.has_role(uuid, text) to authenticated;
