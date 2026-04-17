
-- Roles enum + table (secure pattern)
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users see own roles" on public.user_roles
  for select using (auth.uid() = user_id);
create policy "Admins see all roles" on public.user_roles
  for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  balance_usdt numeric(12,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users see own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins see all profiles" on public.profiles
  for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update all profiles" on public.profiles
  for update using (public.has_role(auth.uid(), 'admin'));

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  message_link text not null,
  total_reactions int not null check (total_reactions >= 10),
  reaction_config jsonb not null,
  cost_usdt numeric(12,4) not null,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  bot_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create index idx_orders_status_created on public.orders (status, created_at);
create index idx_orders_user on public.orders (user_id);

create policy "Users see own orders" on public.orders
  for select using (auth.uid() = user_id);
create policy "Users create own orders" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "Admins see all orders" on public.orders
  for select using (public.has_role(auth.uid(), 'admin'));

-- Transactions (wallet ledger)
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('deposit','order_debit','refund','admin_adjust')),
  amount_usdt numeric(12,4) not null,
  reference text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;
create index idx_tx_user on public.transactions (user_id, created_at desc);

create policy "Users see own tx" on public.transactions
  for select using (auth.uid() = user_id);
create policy "Admins see all tx" on public.transactions
  for select using (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- Auto-create profile + user role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic order placement: debit balance and create order in one txn
create or replace function public.place_order(
  _message_link text,
  _total int,
  _config jsonb,
  _cost numeric
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _bal numeric;
  _order_id uuid;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  if _total < 10 then raise exception 'Minimum 10 reactions'; end if;

  select balance_usdt into _bal from public.profiles where id = _uid for update;
  if _bal is null then raise exception 'Profile not found'; end if;
  if _bal < _cost then raise exception 'Insufficient balance'; end if;

  update public.profiles set balance_usdt = balance_usdt - _cost where id = _uid;

  insert into public.orders (user_id, message_link, total_reactions, reaction_config, cost_usdt)
  values (_uid, _message_link, _total, _config, _cost)
  returning id into _order_id;

  insert into public.transactions (user_id, type, amount_usdt, reference, metadata)
  values (_uid, 'order_debit', -_cost, _order_id::text, jsonb_build_object('order_id', _order_id));

  return _order_id;
end; $$;
