alter table orders
add column owner_user_id uuid references auth.users(id);

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