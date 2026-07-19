-- Rename Polish status enum values to English in the workshop order tracker

ALTER TYPE order_status RENAME VALUE 'Przyjete' TO 'accepted';
ALTER TYPE order_status RENAME VALUE 'W trakcie' TO 'in_progress';
ALTER TYPE order_status RENAME VALUE 'Wydane' TO 'delivered';
ALTER TYPE order_status RENAME VALUE 'Zaplacone' TO 'paid';
ALTER TYPE order_status RENAME VALUE 'Domowione' TO 'ordered';

ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'accepted';
