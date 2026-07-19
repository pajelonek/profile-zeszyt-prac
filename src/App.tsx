import { useMemo, useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import './App.css'

type OrderStatus = 'Przyjete' | 'W trakcie' | 'Wydane' | 'Zaplacone' | 'Domowione'
type PaymentState = 'not_paid' | 'partial' | 'paid'

const paymentLabels: Record<PaymentState, string> = {
  not_paid: 'Nie zapłacone',
  partial: 'Częściowo zapłacone',
  paid: 'Zapłacone',
}

const paymentChipStyles: Record<PaymentState, { color: 'default' | 'success' | 'warning' | 'error'; label: string }> = {
  not_paid: { color: 'error', label: 'Nie zapłacone' },
  partial: { color: 'warning', label: 'Częściowo zapłacone' },
  paid: { color: 'success', label: 'Zapłacone' },
}

const orderStatusChipStyles: Record<OrderStatus, { color: 'default' | 'primary' | 'warning' | 'success' | 'info'; label: string }> = {
  Przyjete: { color: 'info', label: 'Przyjęte' },
  'W trakcie': { color: 'warning', label: 'W trakcie' },
  Wydane: { color: 'success', label: 'Wydane' },
  Zaplacone: { color: 'success', label: 'Zapłacone' },
  Domowione: { color: 'primary', label: 'Domówione' },
}

interface OrderItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  item_total: number
}

interface Order {
  id: string
  createdAt: string
  updatedAt: string
  clientName: string
  title?: string
  clientPhone: string
  clientAddress: string
  status: OrderStatus
  paymentState: PaymentState
  paymentDue: number
  paidAmount: number
  totalPrice: number
  productCount: number
  dueDate: string
  completedAt: string
  notes: string
  extraDetails: string
  items: OrderItem[]
}

interface OrderDraft {
  id?: string
  createdAt?: string
  updatedAt?: string
  clientName: string
  title?: string
  clientPhone: string
  clientAddress: string
  status: OrderStatus
  paymentState: PaymentState
  paymentDue: number
  paidAmount: number
  totalPrice: number
  productCount: number
  dueDate: string
  completedAt: string
  notes: string
  extraDetails: string
  items: OrderItem[]
}

const orderStatuses: OrderStatus[] = ['Przyjete', 'W trakcie', 'Wydane', 'Zaplacone', 'Domowione']
const paymentStates: PaymentState[] = ['not_paid', 'partial', 'paid']

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2)
}

const createEmptyDraft = (): OrderDraft => ({
  title: '',
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  status: 'Przyjete',
  paymentState: 'not_paid',
  paymentDue: 0,
  paidAmount: 0,
  totalPrice: 0,
  productCount: 0,
  dueDate: '',
  completedAt: '',
  notes: '',
  extraDetails: '',
  items: [{ id: createId(), description: '', quantity: 1, unit_price: 0, item_total: 0 }],
})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value)

const initialOrders: Order[] = [
  {
    id: createId(),
    createdAt: '2026-07-15T09:30:00.000Z',
    updatedAt: '2026-07-16T11:15:00.000Z',
    clientName: 'Marta Kowalska',
    title: 'Naprawa roweru - Marta',
    clientPhone: '+48 501 123 456',
    clientAddress: 'ul. Zielona 12, Kraków',
    status: 'W trakcie',
    paymentState: 'partial',
    paymentDue: 350,
    paidAmount: 150,
    totalPrice: 500,
    productCount: 2,
    dueDate: '2026-07-22',
    completedAt: '',
    notes: 'Klient chce odbiór po 22 lipca.',
    extraDetails: 'Potrzebny kontakt po naprawie.',
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
    clientAddress: 'ul. Długa 8, Tarnów',
    status: 'Przyjete',
    paymentState: 'not_paid',
    paymentDue: 0,
    paidAmount: 0,
    totalPrice: 280,
    productCount: 3,
    dueDate: '2026-07-24',
    completedAt: '',
    notes: 'Przyjąć w środę rano.',
    extraDetails: 'Czeka na część zamienną.',
    items: [
      { id: createId(), description: 'Czyszczenie mechanizmu', quantity: 2, unit_price: 80, item_total: 160 },
      { id: createId(), description: 'Konserwacja', quantity: 1, unit_price: 120, item_total: 120 },
    ],
  },
]

function App() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrders[0]?.id ?? null)
  const [draft, setDraft] = useState<OrderDraft>(() => {
    const starter = initialOrders[0]
    if (!starter) {
      return createEmptyDraft()
    }

    return {
      ...starter,
      items: starter.items.map((item) => ({ ...item })),
    }
  })

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId])
  const [clientAccordionOpen, setClientAccordionOpen] = useState(false)
  const [titleError, setTitleError] = useState('')

  const pendingCount = orders.filter((order) => !['Wydane', 'Zaplacone', 'Domowione'].includes(order.status)).length
  const unpaidCount = orders.filter((order) => order.paymentState !== 'paid').length

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

        const numericValue = Number(value)
        const nextValue = Number.isNaN(numericValue) ? 0 : numericValue
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
      items: [
        ...current.items,
        { id: createId(), description: '', quantity: 1, unit_price: 0, item_total: 0 },
      ],
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
    setDraft({
      ...order,
      items: order.items.map((item) => ({ ...item })),
    })
  }

  const handleNewOrder = () => {
    setSelectedOrderId(null)
    setDraft(createEmptyDraft())
  }

  const saveOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!draft.title || !draft.title.trim()) {
      setTitleError('Tytuł zlecenia jest wymagany')
      setClientAccordionOpen(true)
      return
    }

    const normalizedItems = draft.items
      .filter((item) => item.description.trim() || item.quantity > 0 || item.unit_price > 0)
      .map((item) => ({
        ...item,
        description: item.description.trim(),
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        item_total: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
      }))

    const totalPrice = normalizedItems.reduce((sum, item) => sum + item.item_total, 0)
    const productCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0)
    const now = new Date().toISOString()

    const nextOrder: Order = {
      id: draft.id ?? createId(),
      createdAt: draft.createdAt ?? now,
      updatedAt: now,
      clientName: draft.clientName.trim(),
      title: draft.title?.trim() || '',
      clientPhone: draft.clientPhone.trim(),
      clientAddress: draft.clientAddress.trim(),
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
    setDraft({ ...nextOrder, items: nextOrder.items.map((item) => ({ ...item })) })
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
        <Paper elevation={3} className="rounded-[24px] bg-white p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)] sm:p-6">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Tracker zleceń warsztatowych
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                Mockowy flow zleceń warsztatowych
              </Typography>
              <Typography color="text.secondary" className="max-w-2xl">
                Wszystko jest przechowywane w pamięci przeglądarki, dopóki nie dopracujemy pól, kroków i kształtu API.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="w-full">
              <Paper elevation={1} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{orders.length}</Typography>
                <Typography variant="caption" color="text.secondary">Zlecenia</Typography>
              </Paper>
              <Paper elevation={1} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{pendingCount}</Typography>
                <Typography variant="caption" color="text.secondary">W toku</Typography>
              </Paper>
              <Paper elevation={1} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{unpaidCount}</Typography>
                <Typography variant="caption" color="text.secondary">Nieopłacone</Typography>
              </Paper>
            </Stack>
          </Stack>
        </Paper>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          <Paper elevation={2} className="w-full rounded-[24px] bg-white p-4 shadow-lg lg:w-[340px]" sx={{ borderColor: 'transparent' }}>
            <Stack direction="row" className="mb-4" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Zlecenia</Typography>
              <Button variant="contained" size="small" className="w-full sm:w-auto" color="primary" onClick={handleNewOrder} sx={{ borderRadius: 3, px: 2 }}>
                Nowe zlecenie
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {orders.map((order) => (
                <Box
                  key={order.id}
                  component="button"
                  type="button"
                  onClick={() => handleSelectOrder(order)}
                  className={`w-full rounded-2xl border p-3 text-left transition-all ${selectedOrder?.id === order.id ? 'border-sky-500 bg-sky-50 shadow-[0_6px_20px_rgba(2,132,199,0.12)]' : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'}`}
                >
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 700 }}>{order.clientName}</Typography>
                    <Chip label={orderStatusChipStyles[order.status].label} size="small" color={orderStatusChipStyles[order.status].color} variant="filled" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" className="mt-2">
                    {order.notes || 'Brak notatek'}
                  </Typography>
                  <Stack direction="row" className="mt-2" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(order.totalPrice)}</Typography>
                    <Chip label={paymentLabels[order.paymentState]} size="small" color={paymentChipStyles[order.paymentState].color} variant="filled" />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>

          <Paper elevation={4} className="flex-1 rounded-[24px] bg-white p-4 shadow-xl md:p-6" sx={{ borderColor: 'transparent' }}>
            <form onSubmit={saveOrder}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
                                  <Box>
                                    <Typography variant="overline" color="text.secondary">Szczegóły zlecenia</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{draft.title || draft.clientName || 'Nowe zlecenie'}</Typography>
                                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="w-full sm:w-auto">
                    <Button variant="outlined" type="button" className="w-full sm:w-auto" onClick={markComplete} color="success" sx={{ borderRadius: 3, px: 2 }}>
                      Oznacz jako zakończone
                    </Button>
                    <Button variant="contained" type="submit" className="w-full sm:w-auto" sx={{ borderRadius: 3, px: 2 }}>
                      Zapisz zlecenie
                    </Button>
                  </Stack>
                </Stack>

                <Box className="grid gap-3 md:grid-cols-2">
                      <TextField
                        label="Tytuł zlecenia"
                        required
                        error={!!titleError}
                        helperText={titleError || ''}
                        value={draft.title}
                        onChange={(event) => {
                          updateDraft('title', event.target.value)
                          if (titleError) setTitleError('')
                        }}
                        fullWidth
                      />
                </Box>

                <Accordion expanded={clientAccordionOpen} onChange={(_, expanded) => setClientAccordionOpen(expanded)} className="md:col-span-2 shadow-sm">
                  <AccordionSummary expandIcon={<span className="text-slate-400">▾</span>} aria-controls="client-details" id="client-details-summary">
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 700 }}>{draft.clientName || 'Dane klienta'}</Typography>
                      <Typography variant="caption" color="text.secondary">{draft.clientPhone || ''}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box className="grid gap-3 md:grid-cols-2">
                      <TextField label="Imię i nazwisko klienta" value={draft.clientName} onChange={(event) => updateDraft('clientName', event.target.value)} fullWidth />
                      <TextField label="Telefon" value={draft.clientPhone} onChange={(event) => updateDraft('clientPhone', event.target.value)} fullWidth />
                      <TextField className="md:col-span-2" label="Adres" value={draft.clientAddress} onChange={(event) => updateDraft('clientAddress', event.target.value)} fullWidth />
                      <FormControl fullWidth>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select labelId="status-label" label="Status" value={draft.status} onChange={(event) => updateDraft('status', event.target.value as OrderStatus)}>
                          {orderStatuses.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField label="Termin realizacji" type="date" slotProps={{ inputLabel: { shrink: true } }} value={draft.dueDate} onChange={(event) => updateDraft('dueDate', event.target.value)} fullWidth />
                      <TextField label="Data zakończenia" type="date" slotProps={{ inputLabel: { shrink: true } }} value={draft.completedAt} onChange={(event) => updateDraft('completedAt', event.target.value)} fullWidth />
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Box className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }} className="mb-4">
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Informacje o płatności
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="max-w-xl">
                      Wprowadź kwotę, wpłatę i stan, aby obsłużyć płatność w zamówieniu.
                    </Typography>
                  </Stack>

                  <Box className="grid gap-3 md:grid-cols-3">
                    <TextField label="Kwota do zapłaty" type="number" value={draft.paymentDue} onChange={(event) => updateDraft('paymentDue', Number(event.target.value))} fullWidth />
                    <TextField label="Zapłacono" type="number" value={draft.paidAmount} onChange={(event) => updateDraft('paidAmount', Number(event.target.value))} fullWidth />
                    <TextField label="Pozostało do zapłaty" value={formatCurrency(Math.max(0, draft.paymentDue - draft.paidAmount))} slotProps={{ input: { readOnly: true } }} fullWidth />
                  </Box>

                  <FormControl fullWidth className="mt-6 pt-3">
                    <InputLabel id="payment-state-label">Stan płatności</InputLabel>
                    <Select labelId="payment-state-label" label="Stan płatności" value={draft.paymentState} onChange={(event) => updateDraft('paymentState', event.target.value as PaymentState)}>
                      {paymentStates.map((state) => (
                        <MenuItem key={state} value={state}>{paymentLabels[state]}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="grid gap-3 md:grid-cols-2">
                  <TextField className="md:col-span-2" label="Notatki" multiline minRows={3} value={draft.notes} onChange={(event) => updateDraft('notes', event.target.value)} fullWidth />
                  <TextField className="md:col-span-2" label="Dodatkowe informacje" multiline minRows={3} value={draft.extraDetails} onChange={(event) => updateDraft('extraDetails', event.target.value)} fullWidth />
                </Box>

                <Divider />

                <Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} className="mb-3" sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Pozycje</Typography>
                    <Button variant="outlined" type="button" className="w-full sm:w-auto" onClick={addItem}>Dodaj pozycję</Button>
                  </Stack>

                  <Stack spacing={2}>
                    {draft.items.map((item, index) => (
                      <Box key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm lg:grid-cols-[2fr_0.7fr_0.9fr_auto_auto]">
                        <TextField label="Usługa / opis" value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} fullWidth />
                        <TextField label="Ilość" type="number" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} fullWidth />
                        <TextField label="Cena jedn." type="number" value={item.unit_price} onChange={(event) => updateItem(item.id, 'unit_price', event.target.value)} fullWidth />
                        <Box className="flex flex-col justify-end rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <Typography variant="caption" color="text.secondary">Suma pozycji</Typography>
                          <Typography sx={{ fontWeight: 700 }}>{formatCurrency(item.item_total)}</Typography>
                        </Box>
                        {draft.items.length > 1 ? (
                          <Button color="error" variant="outlined" type="button" onClick={() => removeItem(item.id)}>Usuń</Button>
                        ) : (
                          <Box className="flex items-end justify-center text-sm font-semibold text-slate-400">{index + 1}</Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </form>

            <Divider className="my-4" />

            <Box className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:grid-cols-3">
              <Box>
                <Typography variant="caption" color="text.secondary">Liczba produktów</Typography>
                <Typography sx={{ fontWeight: 700 }}>{draft.items.reduce((sum, item) => sum + item.quantity, 0)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Łączna cena</Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatCurrency(draft.items.reduce((sum, item) => sum + item.item_total, 0))}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Wybrane zlecenie</Typography>
                <Typography sx={{ fontWeight: 700 }}>{selectedOrder?.clientName ?? 'Nowy szkic'}</Typography>
              </Box>
            </Box>
          </Paper>
        </Stack>
      </Stack>
    </Box>
  )
}

export default App
