import type { OrderStatus } from './types'

export const orderStatusChipStyles: Record<OrderStatus, { color: 'default' | 'primary' | 'warning' | 'success' | 'info'; label: string }> = {
  Przyjete: { color: 'info', label: 'Przyjęte' },
  'W trakcie': { color: 'warning', label: 'W trakcie' },
  Wydane: { color: 'success', label: 'Wydane' },
  Zaplacone: { color: 'success', label: 'Zapłacone' },
  Domowione: { color: 'primary', label: 'Domówione' },
}

export const orderStatuses: OrderStatus[] = ['Przyjete', 'W trakcie', 'Wydane', 'Zaplacone', 'Domowione']