-- Soft-delete orders by setting archived_at instead of hard DELETE.
-- Archived orders are excluded from all normal queries via the RLS policy below.
-- The column is intentionally not exposed as a UI field.

alter table orders
add column archived_at timestamptz;

-- Replace the existing SELECT policy so it never returns archived rows.
drop policy if exists "Users can read their own orders" on orders;

create policy "Users can read their own active orders"
on orders
for select
to authenticated
using (owner_user_id = auth.uid() and archived_at is null);
