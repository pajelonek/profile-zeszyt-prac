-- Fix soft-delete RLS conflict on UPDATE.
--
-- When an order is archived (archived_at set), strict SELECT policy
-- filtering archived_at is null can block UPDATE response visibility,
-- which surfaces as 42501 in PostgREST clients.
--
-- We keep soft-delete behavior at query level (the app already filters
-- archived rows with .is('archived_at', null)) and allow users to read
-- all of their own rows regardless of archive state.

DROP POLICY IF EXISTS "Users can read their own active orders" ON orders;
DROP POLICY IF EXISTS "Users can read their own orders" ON orders;

CREATE POLICY "Users can read their own orders"
ON orders
FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());
