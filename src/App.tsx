import { useMemo, useState, type ComponentProps } from 'react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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

type NavigationIntent =
    | { type: 'select'; order: Order }
    | { type: 'new' }

const changedItems = (left: OrderDraft['items'], right: OrderDraft['items']) => {
    if (left.length !== right.length) {
        return true
    }

    return left.some((item, index) => {
        const other = right[index]

        if (!other) {
            return true
        }

        return (
            item.description.trim() !== other.description.trim()
            || Number(item.quantity) !== Number(other.quantity)
            || Number(item.unit_price) !== Number(other.unit_price)
        )
    })
}

const getChangedFieldLabels = (baseline: OrderDraft, current: OrderDraft) => {
    const labels: string[] = []

    if ((baseline.title ?? '').trim() !== (current.title ?? '').trim()) labels.push('Tytuł zlecenia')
    if (baseline.status !== current.status) labels.push('Status')
    if (baseline.clientName.trim() !== current.clientName.trim()) labels.push('Imię i nazwisko klienta')
    if (baseline.clientPhone.trim() !== current.clientPhone.trim()) labels.push('Telefon klienta')
    if (baseline.notes.trim() !== current.notes.trim()) labels.push('Notatki')
    if (changedItems(baseline.items, current.items)) labels.push('Pozycje zlecenia')

    return labels
}

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
    const [baselineDraft, setBaselineDraft] = useState<OrderDraft>(() => {
        const starter = initialOrders[0]
        if (!starter) {
            return createEmptyDraft()
        }

        return createDraftFromOrder(starter)
    })
    const [titleError, setTitleError] = useState('')
    const [navigationIntent, setNavigationIntent] = useState<NavigationIntent | null>(null)
    const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId])
    const canMarkComplete = !!selectedOrderId && draft.status !== 'Wydane' && draft.status !== 'Zaplacone'
    const changedFieldLabels = useMemo(() => getChangedFieldLabels(baselineDraft, draft), [baselineDraft, draft])
    const hasUnsavedChanges = changedFieldLabels.length > 0

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

    const applyNavigationIntent = (intent: NavigationIntent) => {
        if (intent.type === 'select') {
            setSelectedOrderId(intent.order.id)
            const nextDraft = createDraftFromOrder(intent.order)
            setDraft(nextDraft)
            setBaselineDraft(nextDraft)
            setTitleError('')
            return
        }

        setSelectedOrderId(null)
        const nextDraft = createEmptyDraft()
        setDraft(nextDraft)
        setBaselineDraft(nextDraft)
        setTitleError('')
    }

    const requestNavigation = (intent: NavigationIntent) => {
        if (hasUnsavedChanges) {
            setNavigationIntent(intent)
            setIsUnsavedDialogOpen(true)
            return
        }

        applyNavigationIntent(intent)
    }

    const persistDraft = () => {
        if (!draft.title?.trim()) {
            setTitleError('Tytuł zlecenia jest wymagany')
            return null
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
            totalPrice,
            productCount,
            notes: draft.notes.trim(),
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
        const nextDraft = createDraftFromOrder(nextOrder)
        setDraft(nextDraft)
        setBaselineDraft(nextDraft)

        return nextOrder
    }

    const saveOrder: FormSubmitHandler = (event) => {
        event.preventDefault()
        persistDraft()
    }

    const markComplete = () => {
        if (!selectedOrderId) {
            return
        }

        setOrders((current) =>
            current.map((order) =>
                order.id === selectedOrderId
                    ? { ...order, status: 'Wydane', updatedAt: new Date().toISOString() }
                    : order,
            ),
        )

        setDraft((current) => ({ ...current, status: 'Wydane' }))
    }

    const confirmUnsavedDiscard = () => {
        if (navigationIntent) {
            applyNavigationIntent(navigationIntent)
        }

        setNavigationIntent(null)
        setIsUnsavedDialogOpen(false)
    }

    const confirmUnsavedSave = () => {
        const savedOrder = persistDraft()

        if (!savedOrder) {
            return
        }

        if (navigationIntent) {
            applyNavigationIntent(navigationIntent)
        }

        setNavigationIntent(null)
        setIsUnsavedDialogOpen(false)
    }

    const openDeleteDialog = () => {
        if (!selectedOrder) {
            return
        }

        setIsDeleteDialogOpen(true)
    }

    const confirmDeleteOrder = () => {
        if (!selectedOrderId) {
            setIsDeleteDialogOpen(false)
            return
        }

        setOrders((current) => {
            const filteredOrders = current.filter((order) => order.id !== selectedOrderId)
            const nextSelectedOrder = filteredOrders[0] ?? null

            if (nextSelectedOrder) {
                const nextDraft = createDraftFromOrder(nextSelectedOrder)
                setSelectedOrderId(nextSelectedOrder.id)
                setDraft(nextDraft)
                setBaselineDraft(nextDraft)
            } else {
                const nextDraft = createEmptyDraft()
                setSelectedOrderId(null)
                setDraft(nextDraft)
                setBaselineDraft(nextDraft)
            }

            return filteredOrders
        })

        setIsDeleteDialogOpen(false)
        setTitleError('')
    }

    return (
        <Box className="min-h-screen bg-[#f4f4f4] p-2.5 sm:p-3.5 md:p-4.5">
            <Stack spacing={2}>
                <AppHeader orders={orders} />

                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                            xs: '1fr',
                            lg: '330px minmax(0, 1fr)',
                        },
                        alignItems: 'stretch',
                    }}
                >
                    <OrdersList
                        orders={orders}
                        selectedOrderId={selectedOrderId}
                        onSelectOrder={(order) => requestNavigation({ type: 'select', order })}
                        onNewOrder={() => requestNavigation({ type: 'new' })}
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
                        onDeleteOrder={openDeleteDialog}
                        canDelete={!!selectedOrderId}
                        onTitleError={setTitleError}
                    />
                </Box>
            </Stack>

            <Dialog open={isUnsavedDialogOpen} onClose={() => setIsUnsavedDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700 }}>Niezapisane zmiany</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Masz niezapisane zmiany. Jeśli opuścisz formularz, utracisz modyfikacje poniższych pól:
                    </Typography>
                    <Box component="ul" sx={{ mt: 1.5, mb: 0, pl: 3 }}>
                        {changedFieldLabels.map((label) => (
                            <Box component="li" key={label} sx={{ mb: 0.5 }}>
                                <Typography component="span" variant="body1">{label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsUnsavedDialogOpen(false)}>Anuluj</Button>
                    <Button color="warning" onClick={confirmUnsavedDiscard}>Odrzuć zmiany</Button>
                    <Button variant="contained" onClick={confirmUnsavedSave}>Zapisz i przejdź</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 700 }}>Usunąć zlecenie?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Czy na pewno chcesz usunąć zlecenie "{selectedOrder?.title || selectedOrder?.clientName || 'bez tytułu'}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Anuluj</Button>
                    <Button color="error" variant="contained" onClick={confirmDeleteOrder}>Usuń</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default App