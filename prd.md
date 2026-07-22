# Workshop Order Tracker PRD

## Purpose

This app digitizes workshop orders so anyone stops losing track of unpaid work and unfinished jobs. It is a small, focused tool for ongoing workshop tasks, not a generic notebook.

## User story

- As a workshop owner, I want to record each job as a single order.
- I want to store only the client name and telephone number, plus job and payment details.
- I want to update status, payment, order details, and product information later.
- I want the app to remind me what is still unfinished or unpaid.

## Goals

- Track workshop orders in Supabase.
- Keep client data minimal: name + telephone number only.
- Track products inside an order.
- Calculate order total from line items.
- Allow updates to status and notes.
- Use Supabase Auth for login and future user control.

## Dashboard summary (top of app)

At the top of the screen, show only two summary values:

- Number of jobs still not marked as `Zaplacone`.
- Total PLN value still to be collected, calculated as sum of line-item totals for jobs not marked as `Zaplacone`.

No other top summary cards are required.

## Job card content order

Each job description/card should be shown in this order:

1. Job title (at the top).
2. Status.
3. Client name.
4. Client telephone number (only contact detail shown).
5. Line items.
6. Financial details (order total calculated from line items).

## Non-goals

- Not a full bookkeeping system.
- Not a generic personal notebook.
- Not advanced inventory management or invoicing at first.

## Core entities

### orders

Represents a workshop job.

- `id` — UUID primary key.
- `created_at` / `updated_at`.
- `job_title`.
- `client_name`, `client_phone`.
- `status` — workshop workflow state.
- `total_price` — derived from related `order_items` (can be computed in query/view, not required as an editable form field).
- `product_count` — number of products or items in the order.
- `notes`.
- No separate additional-details text field is required; `notes` is enough.

### order_items

Tracks individual products or work items inside each order.

- `id` — UUID primary key.
- `order_id` — foreign key to `orders`.
- `description` — item description.
- `quantity`, `unit_price`, `item_total`.
- Line items can also use `ilość MB` when the price is per meter.
- Support both pricing variants: `ilość MB x cena za metr` and `ilość x cena`.
- `created_at` / `updated_at`.

## Status workflow

Default workshop states:

- `Przyjete`
- `W trakcie`
- `Wydane`
- `Zaplacone`
- `Domowione`

## Primary workflows

1. Create new order
   - Enter job title, status, client name, client telephone number, and items.

2. Update order
   - Change status, add or remove items, update notes and product information.

3. Unsaved changes
   - If the user leaves with unsaved form changes, show a confirmation dialog in Polish.
   - The dialog should list the fields that were changed and not saved yet.
   - The user should be able to either discard changes or save them.

4. Delete order
   - Allow deleting a job from the form.
   - Show a confirmation dialog before the deletion is executed.

5. Mark completion
   - Set status to `Wydane` when work is done and to `Zaplacone` when payment is completed.

## Implementation notes

- Use Supabase local schema files under `supabase/schemas`.
- Keep the app UI focused on current orders and quick updates.
- Use `orders` + `order_items` model because product-level tracking is required.
- Later, add filters for unpaid or incomplete orders.
