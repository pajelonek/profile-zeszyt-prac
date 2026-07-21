import type { Order } from './types'
import { createId } from './utils'

export const initialOrders: Order[] = [
  {
    id: createId(),
    createdAt: '2026-07-15T09:30:00.000Z',
    updatedAt: '2026-07-16T11:15:00.000Z',
    clientName: 'Marta Kowalska',
    title: 'Naprawa roweru - Marta',
    clientPhone: '+48 501 123 456',
    status: 'W trakcie',
    paymentState: 'partial',
    paymentDue: 350,
    paidAmount: 150,
    totalPrice: 500,
    productCount: 2,
    notes: 'Klient chce odbiór po 22 lipca.',
    items: [
      { id: createId(), description: 'Naprawa roweru', quantity: 1, unit_price: 350, item_total: 350 },
      { id: createId(), description: 'Wymiana opon', quantity: 1, unit_price: 150, item_total: 150 },
    ],
  },
  {
    id: createId(),
    createdAt: '2026-07-17T13:10:00.000Z',
    updatedAt: '2026-07-18T16:35:00.000Z',
    clientName: 'Piotr Nowak',
    title: 'Przegląd i konserwacja - Piotr',
    clientPhone: '+48 606 555 444',
    status: 'Przyjete',
    paymentState: 'not_paid',
    paymentDue: 0,
    paidAmount: 0,
    totalPrice: 280,
    productCount: 3,
    notes: 'Przyjąć w środę rano.',
    items: [
      { id: createId(), description: 'Czyszczenie mechanizmu', quantity: 2, unit_price: 80, item_total: 160 },
      { id: createId(), description: 'Konserwacja', quantity: 1, unit_price: 120, item_total: 120 },
    ],
  },
]