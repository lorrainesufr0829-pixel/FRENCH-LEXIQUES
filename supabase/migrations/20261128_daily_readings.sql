create table if not exists public.daily_readings (
 id uuid primary key default gen_random_uuid(),
 title text not null, title_en text, title_zh text,
 published_at date not null default current_date,
 level text not null default 'B2–C1', topic text,
 content_fr text not null, summary_zh text,
 vocabulary jsonb not null default '[]'::jsonb,
 source_name text, source_title text, source_url text,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists daily_readings_status_date_idx on public.daily_readings(status,published_at desc);
alter table public.daily_readings enable row level security;
grant select on public.daily_readings to anon,authenticated;
grant insert,update,delete on public.daily_readings to authenticated;
drop policy if exists "Anyone can read published daily readings" on public.daily_readings;
create policy "Anyone can read published daily readings" on public.daily_readings for select to anon,authenticated using(status='published');
drop policy if exists "Daily Reading admin can read all" on public.daily_readings;
create policy "Daily Reading admin can read all" on public.daily_readings for select to authenticated using(lower(coalesce(auth.jwt()->>'email',''))='lorrainesufr@outlook.com');
drop policy if exists "Daily Reading admin can insert" on public.daily_readings;
create policy "Daily Reading admin can insert" on public.daily_readings for insert to authenticated with check(lower(coalesce(auth.jwt()->>'email',''))='lorrainesufr@outlook.com' and created_by=auth.uid());
drop policy if exists "Daily Reading admin can update" on public.daily_readings;
create policy "Daily Reading admin can update" on public.daily_readings for update to authenticated using(lower(coalesce(auth.jwt()->>'email',''))='lorrainesufr@outlook.com') with check(lower(coalesce(auth.jwt()->>'email',''))='lorrainesufr@outlook.com');
drop policy if exists "Daily Reading admin can delete" on public.daily_readings;
create policy "Daily Reading admin can delete" on public.daily_readings for delete to authenticated using(lower(coalesce(auth.jwt()->>'email',''))='lorrainesufr@outlook.com');
create or replace function public.set_daily_reading_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists daily_readings_updated_at on public.daily_readings;
create trigger daily_readings_updated_at before update on public.daily_readings for each row execute function public.set_daily_reading_updated_at();
