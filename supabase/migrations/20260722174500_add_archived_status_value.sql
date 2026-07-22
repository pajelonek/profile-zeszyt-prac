-- Add explicit archived value for soft-deleted orders.
-- Archiving now sets both archived_at and status='archived'.

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'archived';
