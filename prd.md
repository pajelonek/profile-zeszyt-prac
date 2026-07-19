# Workshop Order Tracker PRD

## Purpose

This app digitizes workshop orders so anyone stops losing track of unpaid work and unfinished jobs. It is a small, focused tool for ongoing workshop tasks, not a generic notebook.

## User story

- As a workshop owner, I want to record each job as a single order.
- I want to store client details, order status, payment state, item count, and extra notes.
- I want to update status, payment, order details, and product information later.
- I want the app to remind me what is still unfinished or unpaid.

## Goals

- Track workshop orders in Supabase.
- Store client metadata and order-level details.
- Track products inside an order.
- Track payment state and payment amount.
- Allow updates to status, completion date, and notes.
- Use Supabase Auth for login and future user control.

## Non-goals

- Not a full bookkeeping system.
- Not a generic personal notebook.
- Not advanced inventory management or invoicing at first.

## Core entities

### orders

Represents a workshop job.

- `id` — UUID primary key.
- `created_at` / `updated_at`.
- `client_name`, `client_phone`, `client_address`.
- `status` — workshop workflow state.
- `payment_state` — not paid / partial / paid.
- `payment_due`, `paid_amount`, `total_price`.
- `product_count` — number of products or items in the order.
- `due_date`, `completed_at`.
- `notes`, `extra_details`.

### order_items

Tracks individual products or work items inside each order.

- `id` — UUID primary key.
- `order_id` — foreign key to `orders`.
- `description` — item description.
- `quantity`, `unit_price`, `item_total`.
- `created_at` / `updated_at`.

## Status workflow

Default workshop states:

- `Przyjete`
- `W trakcie`
- `Wydane`
- `Zaplacone`
- `Domowione`

## Payment workflow

- `not_paid` — no payment received yet.
- `partial` — partial payment received.
- `paid` — fully paid.

## Primary workflows

1. Create new order
   - Enter client info, details, due date, status, payment due, and items.

2. Update order
   - Change status, add or remove items, update payment state or amounts.

3. Mark completion
   - Set `completed_at` and `status` when work is finished.

4. Payment tracking
   - Update `paid_amount` and `payment_state`.

## Implementation notes

- Use Supabase local schema files under `supabase/schemas`.
- Keep the app UI focused on current orders and quick updates.
- Use `orders` + `order_items` model because product-level tracking is required.
- Later, add filters for unpaid or incomplete orders.
