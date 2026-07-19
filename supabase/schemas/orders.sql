-- Orders schema for workshop order tracker

create type order_status as enum (
  'accepted',
  'in_progress',
  'delivered',
  'paid',
  'ordered'
);

create type payment_state as enum (
  'not_paid',
  'partial',
  'paid'
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_name text,
  client_phone text,
  client_address text,
  status order_status not null default 'Przyjete',
  payment_state payment_state not null default 'not_paid',
  payment_due numeric(10,2) not null default 0,
  paid_amount numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  product_count int not null default 0,
  due_date date,
  completed_at timestamptz,
  notes text,
  extra_details text
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
