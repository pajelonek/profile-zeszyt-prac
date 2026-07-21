import { useMemo, useState, type ComponentProps } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { AppHeader, OrdersList, OrderForm } from './components'
import { initialOrders } from './features/orders/mockData'
import type { Order, OrderDraft } from './features/orders/types'
import {
    calculateOrderTotals,
    cloneItems,
    createEmptyDraft,
    createId,
    normalizeItems,
    parseNumericInput,
} from './features/orders/utils'

const createDraftFromOrder = (order: Order): OrderDraft => ({
    ...order,
    items: cloneItems(order.items),
})

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

function App() {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrders[0]?.id ?? null)
    const [draft, setDraft] = useState<OrderDraft>(() => {
        const starter = initialOrders[0]
        if (!starter) {
            return createEmptyDraft()
        }

        return createDraftFromOrder(starter)
    })
    const [titleError, setTitleError] = useState('')

    const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId])
    const canMarkComplete = !!selectedOrderId && draft.status !== 'Wydane'

    const updateDraft = <K extends keyof OrderDraft>(field: K, value: OrderDraft[K]) => {
        setDraft((current) => ({ ...current, [field]: value }))
    }

    const updateItem = (itemId: string, field: 'description' | 'quantity' | 'unit_price', value: string) => {
        setDraft((current) => ({
            ...current,
            items: current.items.map((item) => {
                if (item.id !== itemId) {
                    return item
                }

                if (field === 'description') {
                    return { ...item, description: value }
                }

                const nextValue = field === 'quantity'
                    ? parseNumericInput(value, { allowDecimal: false })
                    : parseNumericInput(value)
                const updatedItem = { ...item, [field]: nextValue }

                if (field === 'quantity') {
                    updatedItem.item_total = nextValue * item.unit_price
                } else {
                    updatedItem.item_total = item.quantity * nextValue
                }

                return updatedItem
            }),
        }))
    }

    const addItem = () => {
        setDraft((current) => ({
            ...current,
            items: [...current.items, { id: createId(), description: '', quantity: 1, unit_price: 0, item_total: 0 }],
        }))
    }

    const removeItem = (itemId: string) => {
        setDraft((current) => ({
            ...current,
            items: current.items.filter((item) => item.id !== itemId),
        }))
    }

    const handleSelectOrder = (order: Order) => {
        setSelectedOrderId(order.id)
        setDraft(createDraftFromOrder(order))
    }

    const handleNewOrder = () => {
        setSelectedOrderId(null)
        setDraft(createEmptyDraft())
    }

    const saveOrder: FormSubmitHandler = (event) => {
        event.preventDefault()

        if (!draft.title?.trim()) {
            setTitleError('Tytuł zlecenia jest wymagany')
            return
        }

        const normalizedItems = normalizeItems(draft.items)
        const { totalPrice, productCount } = calculateOrderTotals(normalizedItems)
        const now = new Date().toISOString()

        const nextOrder: Order = {
            id: draft.id ?? createId(),
            createdAt: draft.createdAt ?? now,
            updatedAt: now,
            clientName: draft.clientName.trim(),
            title: draft.title?.trim() || '',
            clientPhone: draft.clientPhone.trim(),
            status: draft.status,
            paymentState: draft.paymentState,
            paymentDue: Number(draft.paymentDue) || 0,
            paidAmount: Number(draft.paidAmount) || 0,
            totalPrice,
            productCount,
            dueDate: draft.dueDate,
            completedAt: draft.completedAt,
            notes: draft.notes.trim(),
            extraDetails: draft.extraDetails.trim(),
            items: normalizedItems,
        }

        setOrders((current) => {
            const exists = current.some((order) => order.id === nextOrder.id)
            if (exists) {
                return current.map((order) => (order.id === nextOrder.id ? nextOrder : order))
            }

            return [nextOrder, ...current]
        })

        setSelectedOrderId(nextOrder.id)
        setDraft(createDraftFromOrder(nextOrder))
    }

    const markComplete = () => {
        if (!selectedOrderId) {
            return
        }

        const completedAt = new Date().toISOString().slice(0, 10)

        setOrders((current) =>
            current.map((order) =>
                order.id === selectedOrderId
                    ? { ...order, status: 'Wydane', completedAt, updatedAt: new Date().toISOString() }
                    : order,
            ),
        )

        setDraft((current) => ({ ...current, status: 'Wydane', completedAt }))
    }

    return (
        <Box className="min-h-screen bg-slate-100 p-3 sm:p-4 md:p-8">
            <Stack spacing={3}>
                <AppHeader orders={orders} />

                <Box
                    sx={{
                        display: 'grid',
                        gap: 3,
                        gridTemplateColumns: {
                            xs: '1fr',
                            lg: '340px minmax(0, 1fr)',
                        },
                        alignItems: 'stretch',
                    }}
                >
                    <OrdersList
                        orders={orders}
                        selectedOrderId={selectedOrderId}
                        onSelectOrder={handleSelectOrder}
                        onNewOrder={handleNewOrder}
                    />

                    <OrderForm
                        draft={draft}
                        selectedOrder={selectedOrder}
                        titleError={titleError}
                        canMarkComplete={canMarkComplete}
                        onUpdateDraft={updateDraft}
                        onUpdateItem={updateItem}
                        onAddItem={addItem}
                        onRemoveItem={removeItem}
                        onSaveOrder={saveOrder}
                        onMarkComplete={markComplete}
                        onTitleError={setTitleError}
                    />
                </Box>
            </Stack>
        </Box>
    )
}

export default App