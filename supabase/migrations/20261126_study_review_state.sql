-- LEXIQUE spaced-repetition state
-- Run once in Supabase SQL Editor.
create table if not exists public.vocabulary_review_state (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    vocabulary_id uuid not null references public.vocabulary(id) on delete cascade,
    due_at timestamptz not null default now(),
    interval_days numeric(10,4) not null default 0,
    ease_factor numeric(4,2) not null default 2.50,
    repetitions integer not null default 0,
    lapses integer not null default 0,
    last_rating text check (last_rating in ('again','hard','good','easy')),
    last_reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, vocabulary_id)
);

create index if not exists vocabulary_review_state_due_idx
    on public.vocabulary_review_state (user_id, due_at);

alter table public.vocabulary_review_state enable row level security;

drop policy if exists "Users manage their own vocabulary review state"
    on public.vocabulary_review_state;

create policy "Users manage their own vocabulary review state"
    on public.vocabulary_review_state
    for all
    to authenticated
    using (auth.uid() = user_id)
    with check (
        auth.uid() = user_id
        and exists (
            select 1
            from public.vocabulary v
            where v.id = vocabulary_id
              and v.user_id = auth.uid()
        )
    );

grant select, insert, update, delete
    on public.vocabulary_review_state to authenticated;
