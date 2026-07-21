import type { OrderStatus, PaymentState } from './types'

export const paymentLabels: Record<PaymentState, string> = {
  not_paid: 'Nie zapłacone',
  partial: 'Częściowo zapłacone',
  paid: 'Zapłacone',
}

export const paymentChipStyles: Record<PaymentState, { color: 'default' | 'success' | 'warning' | 'error'; label: string }> = {
  not_paid: { color: 'error', label: 'Nie zapłacone' },
  partial: { color: 'warning', label: 'Częściowo zapłacone' },
  paid: { color: 'success', label: 'Zapłacone' },
}

export const orderStatusChipStyles: Record<OrderStatus, { color: 'default' | 'primary' | 'warning' | 'success' | 'info'; label: string }> = {
  Przyjete: { color: 'info', label: 'Przyjęte' },
  'W trakcie': { color: 'warning', label: 'W trakcie' },
  Wydane: { color: 'success', label: 'Wydane' },
  Zaplacone: { color: 'success', label: 'Zapłacone' },
  Domowione: { color: 'primary', label: 'Domówione' },
}

export const orderStatuses: OrderStatus[] = ['Przyjete', 'W trakcie', 'Wydane', 'Zaplacone', 'Domowione']

export const paymentStates: PaymentState[] = ['not_paid', 'partial', 'paid']