-- Align orders table with updated PRD: job title required in UI and no client address.

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS job_title text;

-- Backfill existing rows with a sensible fallback.
UPDATE orders
SET job_title = COALESCE(NULLIF(job_title, ''), client_name)
WHERE job_title IS NULL OR job_title = '';

ALTER TABLE orders
DROP COLUMN IF EXISTS client_address;
