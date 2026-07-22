import type { OrderStatus } from './types'

export const DEFAULT_ORDER_STATUS: OrderStatus = 'accepted'

export const orderStatusChipStyles: Record<OrderStatus, { color: 'default' | 'primary' | 'warning' | 'success' | 'info'; label: string }> = {
  accepted: { color: 'info', label: 'Przyjęte' },
  in_progress: { color: 'warning', label: 'W trakcie' },
  delivered: { color: 'success', label: 'Wydane' },
  paid: { color: 'success', label: 'Zapłacone' },
  ordered: { color: 'primary', label: 'Domówione' },
  archived: { color: 'default', label: 'Zarchiwizowane' },
}

export const orderStatuses: OrderStatus[] = ['accepted', 'in_progress', 'delivered', 'paid', 'ordered']

export const isOrderStatus = (value: string): value is OrderStatus => value in orderStatusChipStyles