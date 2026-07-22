export type OrderStatus = 'Przyjete' | 'W trakcie' | 'Wydane' | 'Zaplacone' | 'Domowione'

export interface OrderItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  item_total: number
}

export interface Order {
  id: string
  createdAt: string
  updatedAt: string
  clientName: string
  title?: string
  clientPhone: string
  status: OrderStatus
  totalPrice: number
  productCount: number
  notes: string
  items: OrderItem[]
}

export interface OrderDraft {
  id?: string
  createdAt?: string
  updatedAt?: string
  clientName: string
  title?: string
  clientPhone: string
  status: OrderStatus
  totalPrice: number
  productCount: number
  notes: string
  items: OrderItem[]
}