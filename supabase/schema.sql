create extension if not exists "pgcrypto";

create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  business_name text not null,
  category text not null,
  intent text not null,
  city text not null,
  state text not null,
  pincode text not null,
  latitude double precision not null,
  longitude double precision not null,
  contact_phone text not null,
  website_url text,
  image_url text,
  valid_until date not null,
  is_featured boolean not null default false,
  tags text[] not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ads_city_idx on public.advertisements (city);
create index if not exists ads_category_idx on public.advertisements (category);
create index if not exists ads_intent_idx on public.advertisements (intent);
create index if not exists ads_created_at_idx on public.advertisements (created_at desc);
create index if not exists ads_status_idx on public.advertisements (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists advertisements_set_updated_at on public.advertisements;
create trigger advertisements_set_updated_at
before update on public.advertisements
for each row
execute function public.set_updated_at();

alter table public.advertisements enable row level security;

drop policy if exists "public_can_read_active_ads" on public.advertisements;
create policy "public_can_read_active_ads"
on public.advertisements
for select
using (status = 'active');

drop policy if exists "public_can_create_ads" on public.advertisements;
create policy "public_can_create_ads"
on public.advertisements
for insert
with check (status = 'active');

insert into public.advertisements (
  title,
  description,
  business_name,
  category,
  intent,
  city,
  state,
  pincode,
  latitude,
  longitude,
  contact_phone,
  website_url,
  image_url,
  valid_until,
  is_featured,
  tags,
  status
)
select
  'Mega Weekend Sale at City Junction Mall',
  'Save up to 35% on fashion, food court combos, and cinema bookings this weekend.',
  'City Junction Mall',
  'Shopping',
  'Discount',
  'Hyderabad',
  'Telangana',
  '500081',
  17.436,
  78.367,
  '+91 90000 11111',
  'https://example.com/city-junction',
  'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80',
  '2026-12-31',
  true,
  '{festival,shopping,weekend}',
  'active'
where not exists (
  select 1
  from public.advertisements
  where title = 'Mega Weekend Sale at City Junction Mall'
    and business_name = 'City Junction Mall'
    and city = 'Hyderabad'
);

