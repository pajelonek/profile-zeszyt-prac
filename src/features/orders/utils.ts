import type { OrderDraft, OrderItem } from './types'

let fallbackIdCounter = 0

export const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  fallbackIdCounter += 1

  return `${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}`
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value)

export const createEmptyDraft = (): OrderDraft => ({
  title: '',
  clientName: '',
  clientPhone: '',
  status: 'Przyjete',
  totalPrice: 0,
  productCount: 0,
  notes: '',
  items: [{ id: createId(), description: '', quantity: 1, unit_price: 0, item_total: 0 }],
})

export const normalizeItems = (items: OrderItem[]) =>
  items
    .filter((item) => item.description.trim() || item.quantity > 0 || item.unit_price > 0)
    .map((item) => ({
      ...item,
      description: item.description.trim(),
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
      item_total: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    }))

export const calculateOrderTotals = (items: OrderItem[]) => {
  const totalPrice = items.reduce((sum, item) => sum + item.item_total, 0)
  const productCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { totalPrice, productCount }
}

export const cloneItems = (items: OrderItem[]) => items.map((item) => ({ ...item }))

export const parseNumericInput = (
  value: string,
  { allowDecimal = true }: { allowDecimal?: boolean } = {},
) => {
  const normalized = value
    .replace(',', '.')
    .replace(allowDecimal ? /[^\d.-]/g : /[^\d-]/g, '')

  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') {
    return 0
  }

  const parsed = allowDecimal
    ? Number(normalized)
    : Number.parseInt(normalized, 10)

  if (!Number.isFinite(parsed)) {
    return 0
  }

  return Math.max(0, parsed)
}