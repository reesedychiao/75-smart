-- 75 Smart schema. Run this once in the Supabase SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

create table public.day_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  deep_work_1 boolean not null default false,
  deep_work_2 boolean not null default false,
  meta_learning boolean not null default false,
  output boolean not null default false,
  reading boolean not null default false,
  no_dopamine boolean not null default false,
  journal text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- Row Level Security: every query is filtered to the signed-in user, so even
-- with the public anon key nobody can read or write anyone else's rows.
alter table public.day_logs enable row level security;

create policy "Users manage their own logs"
  on public.day_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at fresh on every change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger day_logs_updated_at
  before update on public.day_logs
  for each row
  execute function public.set_updated_at();
