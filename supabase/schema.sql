create table public.players (
    id bigint primary key,
    name text not null,

    level integer not null,
    total integer not null,

    strength integer not null,
    defense integer not null,
    speed integer not null,
    dexterity integer not null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.players enable row level security;

create policy "Anyone can view players"
on public.players
for select
to anon
using (true);
