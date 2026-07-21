alter table orders
  drop column if exists due_date,
  drop column if exists completed_at;
