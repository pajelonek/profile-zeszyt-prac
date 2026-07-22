import { supabase } from '../../lib/supabase'
import type { Order, OrderDraft, OrderStatus } from './types'
import { calculateOrderTotals, normalizeItems } from './utils'

// ── DB row shapes ─────────────────────────────────────────────────────────────

interface DbOrderItem {
  id: string
  order_id: string
  description: string
  quantity: number
  unit_price: number
  item_total: number
  position: number
}

interface DbOrder {
  id: string
  created_at: string
  updated_at: string
  archived_at: string | null
  client_name: string | null
  client_phone: string | null
  job_title: string | null
  status: string
  total_price: number | string
  product_count: number
  notes: string | null
  owner_user_id: string | null
  order_items: DbOrderItem[]
}

// ── Row → domain mapping ──────────────────────────────────────────────────────

function rowToOrder(row: DbOrder): Order {
  const items = (row.order_items ?? []).map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    item_total: Number(item.item_total),
  }))

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    clientName: row.client_name ?? '',
    clientPhone: row.client_phone ?? '',
    title: row.job_title ?? '',
    status: row.status as OrderStatus,
    totalPrice: Number(row.total_price),
    productCount: row.product_count,
    notes: row.notes ?? '',
    items,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as DbOrder[]).map(rowToOrder)
}

export async function upsertOrder(draft: OrderDraft): Promise<Order> {
  const normalizedItems = normalizeItems(draft.items)
  const { totalPrice, productCount } = calculateOrderTotals(normalizedItems)

  const orderPayload = {
    ...(draft.id ? { id: draft.id } : {}),
    client_name: draft.clientName.trim(),
    client_phone: draft.clientPhone.trim(),
    job_title: (draft.title ?? '').trim(),
    status: draft.status,
    total_price: totalPrice,
    product_count: productCount,
    notes: draft.notes.trim(),
    updated_at: new Date().toISOString(),
  }

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .upsert(orderPayload)
    .select()
    .single()

  if (orderError) throw orderError

  // Replace all items: delete existing then insert fresh
  const { error: deleteError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', (orderRow as { id: string }).id)

  if (deleteError) throw deleteError

  const itemsPayload = normalizedItems.map((item, index) => ({
    order_id: (orderRow as { id: string }).id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    position: index + 1,
  }))

  const { data: itemRows, error: itemsError } = itemsPayload.length > 0
    ? await supabase.from('order_items').insert(itemsPayload).select()
    : { data: [] as DbOrderItem[], error: null }

  if (itemsError) throw itemsError

  return rowToOrder({ ...orderRow, order_items: itemRows ?? [] } as DbOrder)
}

export async function patchOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) throw error
}

export async function removeOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) throw error
}
