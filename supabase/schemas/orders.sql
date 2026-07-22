-- Orders schema for workshop order tracker

create type order_status as enum (
  'accepted',
  'in_progress',
  'delivered',
  'paid',
  'ordered',
  'archived'
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_user_id uuid references auth.users(id),
  job_title text,
  client_name text,
  client_phone text,
  status order_status not null default 'accepted',
  total_price numeric(10,2) not null default 0,
  product_count int not null default 0,
  notes text
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  position int not null default 1,
  description text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  item_total numeric(10,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index order_items_order_id_idx on order_items(order_id);
create index orders_owner_user_id_idx on orders(owner_user_id);

alter table orders enable row level security;
alter table order_items enable row level security;

create function set_order_owner_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if new.owner_user_id is null then
    new.owner_user_id := auth.uid();
  elsif new.owner_user_id <> auth.uid() then
    raise exception 'owner_user_id must match auth.uid()';
  end if;

  return new;
end;
$$;

create trigger set_order_owner_user_id_before_insert
before insert on orders
for each row
execute function set_order_owner_user_id();

create policy "Users can read their own orders"
on orders
for select
to authenticated
using (owner_user_id = auth.uid());

create policy "Users can insert their own orders"
on orders
for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "Users can update their own orders"
on orders
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "Users can delete their own orders"
on orders
for delete
to authenticated
using (owner_user_id = auth.uid());

create policy "Users can read items from their own orders"
on order_items
for select
to authenticated
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.owner_user_id = auth.uid()
  )
);

create policy "Users can insert items into their own orders"
on order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.owner_user_id = auth.uid()
  )
);

create policy "Users can update items from their own orders"
on order_items
for update
to authenticated
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.owner_user_id = auth.uid()
  )
);

create policy "Users can delete items from their own orders"
on order_items
for delete
to authenticated
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.owner_user_id = auth.uid()
  )
);
