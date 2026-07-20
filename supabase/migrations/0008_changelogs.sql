-- Changelog system for "What's new" notifications
create table if not exists public.changelogs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  version text not null,
  title text not null,
  description text,
  changes jsonb default '[]',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- org_id NULL = global changelog (platform-wide), org_id set = org-specific
create index idx_changelogs_published on public.changelogs(published_at desc);

-- Track what each member has seen
alter table public.members
  add column if not exists last_seen_changelog timestamptz;

-- RLS
alter table public.changelogs enable row level security;

create policy "Members can read global and own org changelogs"
  on public.changelogs for select
  using (org_id is null or org_id = public.org_id());

create policy "Bureau can manage own org changelogs"
  on public.changelogs for insert
  with check (org_id = public.org_id());

create policy "Bureau can update own org changelogs"
  on public.changelogs for update
  using (org_id = public.org_id());

create policy "Bureau can delete own org changelogs"
  on public.changelogs for delete
  using (org_id = public.org_id());
