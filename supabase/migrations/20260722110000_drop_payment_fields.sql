-- Remove explicit payment tracking fields; payment completion is represented by order status.

alter table orders
  drop column if exists payment_state,
  drop column if exists payment_due,
  drop column if exists paid_amount;

drop type if exists payment_state;
