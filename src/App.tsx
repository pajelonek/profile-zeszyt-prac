import { useEffect, useMemo, useState, type ComponentProps } from 'react'
import type { Session } from '@supabase/supabase-js'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AppHeader, AuthScreen, OrdersList, OrderForm } from './components'
import { fetchOrders, upsertOrder, patchOrderStatus, removeOrder } from './features/orders/api'
import type { Order, OrderDraft } from './features/orders/types'
import {
    cloneItems,
    createEmptyDraft,
    createId,
    parseNumericInput,
} from './features/orders/utils'
import { supabase } from './lib/supabase'

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
    const [session, setSession] = useState<Session | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)
    const [authError, setAuthError] = useState('')
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const [draft, setDraft] = useState<OrderDraft>(createEmptyDraft)
    const [baselineDraft, setBaselineDraft] = useState<OrderDraft>(createEmptyDraft)
    const [isOrdersLoading, setIsOrdersLoading] = useState(false)
    const [apiError, setApiError] = useState('')
    const [titleError, setTitleError] = useState('')
    const [navigationIntent, setNavigationIntent] = useState<NavigationIntent | null>(null)
    const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId])
    const canMarkComplete = !!selectedOrderId && draft.status !== 'Wydane' && draft.status !== 'Zaplacone'
    const changedFieldLabels = useMemo(() => getChangedFieldLabels(baselineDraft, draft), [baselineDraft, draft])
    const hasUnsavedChanges = changedFieldLabels.length > 0

    useEffect(() => {
        let isMounted = true

        const loadSession = async () => {
            const { data, error } = await supabase.auth.getSession()

            if (!isMounted) {
                return
            }

            if (error) {
                setAuthError('Nie udało się sprawdzić sesji logowania. Odśwież stronę i spróbuj ponownie.')
            } else {
                setSession(data.session)
            }

            setIsAuthLoading(false)
        }

        void loadSession()

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (!isMounted) {
                return
            }

            setSession(nextSession)
            setAuthError('')
            setIsAuthLoading(false)
        })

        return () => {
            isMounted = false
            subscription.subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (!session) return

        let isMounted = true
        setIsOrdersLoading(true)
        setApiError('')

        fetchOrders()
            .then((fetched) => {
                if (!isMounted) return
                setOrders(fetched)
                if (fetched.length > 0 && fetched[0]) {
                    const first = fetched[0]
                    setSelectedOrderId(first.id)
                    const nextDraft = createDraftFromOrder(first)
                    setDraft(nextDraft)
                    setBaselineDraft(nextDraft)
                }
            })
            .catch((err: unknown) => {
                if (!isMounted) return
                setApiError('Nie udało się wczytać zleceń. Odśwież stronę i spróbuj ponownie.')
                console.error(err)
            })
            .finally(() => {
                if (isMounted) setIsOrdersLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [session])

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

    const persistDraft = async (): Promise<Order | null> => {
        if (!draft.title?.trim()) {
            setTitleError('Tytuł zlecenia jest wymagany')
            return null
        }

        try {
            setApiError('')
            const savedOrder = await upsertOrder(draft)
            setOrders((current) => {
                const exists = current.some((o) => o.id === savedOrder.id)
                if (exists) return current.map((o) => o.id === savedOrder.id ? savedOrder : o)
                return [savedOrder, ...current]
            })
            setSelectedOrderId(savedOrder.id)
            const nextDraft = createDraftFromOrder(savedOrder)
            setDraft(nextDraft)
            setBaselineDraft(nextDraft)
            return savedOrder
        } catch (err: unknown) {
            setApiError('Nie udało się zapisać zlecenia. Spróbuj ponownie.')
            console.error(err)
            return null
        }
    }

    const saveOrder: FormSubmitHandler = (event) => {
        event.preventDefault()
        void persistDraft()
    }

    const markComplete = () => {
        if (!selectedOrderId) {
            return
        }

        void patchOrderStatus(selectedOrderId, 'Wydane')
            .then(() => {
                setOrders((current) =>
                    current.map((order) =>
                        order.id === selectedOrderId
                            ? { ...order, status: 'Wydane', updatedAt: new Date().toISOString() }
                            : order,
                    ),
                )
                setDraft((current) => ({ ...current, status: 'Wydane' }))
                setBaselineDraft((current) => ({ ...current, status: 'Wydane' }))
            })
            .catch((err: unknown) => {
                setApiError('Nie udało się zaktualizować statusu. Spróbuj ponownie.')
                console.error(err)
            })
    }

    const confirmUnsavedDiscard = () => {
        if (navigationIntent) {
            applyNavigationIntent(navigationIntent)
        }

        setNavigationIntent(null)
        setIsUnsavedDialogOpen(false)
    }

    const confirmUnsavedSave = async () => {
        const savedOrder = await persistDraft()

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

    const confirmDeleteOrder = async () => {
        if (!selectedOrderId) {
            setIsDeleteDialogOpen(false)
            return
        }

        try {
            setApiError('')
            await removeOrder(selectedOrderId)
        } catch (err: unknown) {
            setApiError('Nie udało się usunąć zlecenia. Spróbuj ponownie.')
            console.error(err)
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

    if (isAuthLoading) {
        return (
            <Box className="min-h-screen bg-[#f4f4f4] p-4">
                <Stack spacing={2} sx={{ mx: 'auto', maxWidth: 520, pt: { xs: 8, md: 12 } }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Sprawdzanie dostępu
                    </Typography>
                    <Typography color="text.secondary">
                        Trwa weryfikacja sesji użytkownika.
                    </Typography>
                    <LinearProgress />
                </Stack>
            </Box>
        )
    }

    if (!session) {
        return <AuthScreen />
    }

    return (
        <Box className="min-h-screen bg-[#f4f4f4] p-2.5 sm:p-3.5 md:p-4.5">
            <Stack spacing={2}>
                {authError ? <Alert severity="error">{authError}</Alert> : null}
                {apiError ? <Alert severity="error">{apiError}</Alert> : null}
                {isOrdersLoading ? <LinearProgress /> : null}
                <AppHeader
                    orders={orders}
                    userEmail={session.user.email ?? 'konto bez adresu e-mail'}
                />

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
                    <Button variant="contained" onClick={() => { void confirmUnsavedSave() }}>Zapisz i przejdź</Button>
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
                    <Button color="error" variant="contained" onClick={() => { void confirmDeleteOrder() }}>Usuń</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default App