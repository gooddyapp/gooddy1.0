-- Private per-user copy of the on-device gooddy state.
-- Run this in the Supabase SQL editor, or with the Supabase CLI.

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

create policy "read own state"
  on public.user_state
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "insert own state"
  on public.user_state
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "update own state"
  on public.user_state
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own state"
  on public.user_state
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_state where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
