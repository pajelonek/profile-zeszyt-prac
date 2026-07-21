import { type ComponentProps } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { orderStatuses } from '../../features/orders/constants'
import type { OrderDraft, Order } from '../../features/orders/types'
import { formatCurrency, parseNumericInput } from '../../features/orders/utils'
import { OrderItems } from '../order-items/OrderItems'
import { PaymentSection } from '../payment-section/PaymentSection'

type OrderFormProps = Readonly<{
  draft: OrderDraft
  selectedOrder: Order | null
  titleError: string
  canMarkComplete: boolean
  canDelete: boolean
  onUpdateDraft: <K extends keyof OrderDraft>(field: K, value: OrderDraft[K]) => void
  onUpdateItem: (itemId: string, field: 'description' | 'quantity' | 'unit_price', value: string) => void
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onSaveOrder: NonNullable<ComponentProps<'form'>['onSubmit']>
  onMarkComplete: () => void
  onDeleteOrder: () => void
  onTitleError: (error: string) => void
}>

export function OrderForm({
  draft,
  selectedOrder,
  titleError,
  canMarkComplete,
  canDelete,
  onUpdateDraft,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onSaveOrder,
  onMarkComplete,
  onDeleteOrder,
  onTitleError,
}: OrderFormProps) {
  return (
    <Paper elevation={4} className="flex-1 rounded-[24px] bg-white p-4 shadow-xl md:p-6" sx={{ borderColor: 'transparent' }}>
      <form onSubmit={onSaveOrder}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Szczegóły zlecenia
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {draft.title || draft.clientName || 'Nowe zlecenie'}
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="w-full sm:w-auto">
              <Button variant="outlined" type="button" className="w-full sm:w-auto" onClick={onDeleteOrder} color="error" disabled={!canDelete} sx={{ borderRadius: 3, px: 2 }}>
                Usuń zlecenie
              </Button>
              <Button variant="outlined" type="button" className="w-full sm:w-auto" onClick={onMarkComplete} color="success" disabled={!canMarkComplete} sx={{ borderRadius: 3, px: 2 }}>
                Oznacz jako zakończone
              </Button>
              <Button variant="contained" type="submit" className="w-full sm:w-auto" sx={{ borderRadius: 3, px: 2 }}>
                Zapisz zlecenie
              </Button>
            </Stack>
          </Stack>

          <Box className="grid gap-3 md:grid-cols-2">
            <TextField
              id="job-title"
              label="Tytuł zlecenia"
              required
              error={!!titleError}
              helperText={titleError || ''}
              value={draft.title}
              onChange={(event) => {
                onUpdateDraft('title', event.target.value)
                if (titleError) onTitleError('')
              }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select labelId="status-label" label="Status" value={draft.status} onChange={(event) => onUpdateDraft('status', event.target.value)}>
                {orderStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box className="grid gap-3 md:grid-cols-2">
            <TextField id="client-name" label="Imię i nazwisko klienta" value={draft.clientName} onChange={(event) => onUpdateDraft('clientName', event.target.value)} fullWidth />
            <TextField id="client-phone" label="Telefon" value={draft.clientPhone} onChange={(event) => onUpdateDraft('clientPhone', event.target.value)} fullWidth />
          </Box>

          <Divider />

          <OrderItems items={draft.items} onUpdateItem={onUpdateItem} onAddItem={onAddItem} onRemoveItem={onRemoveItem} />

          <PaymentSection
            paymentDue={draft.paymentDue}
            paidAmount={draft.paidAmount}
            paymentState={draft.paymentState}
            onPaymentDueChange={(value) => onUpdateDraft('paymentDue', typeof value === 'string' ? parseNumericInput(value) : value)}
            onPaidAmountChange={(value) => onUpdateDraft('paidAmount', typeof value === 'string' ? parseNumericInput(value) : value)}
            onPaymentStateChange={(value) => onUpdateDraft('paymentState', value)}
          />

          <Box className="grid gap-3 md:grid-cols-2">
            <TextField id="order-notes" className="md:col-span-2" label="Notatki" multiline minRows={3} value={draft.notes} onChange={(event) => onUpdateDraft('notes', event.target.value)} fullWidth />
          </Box>
        </Stack>
      </form>

      <Divider className="my-4" />

      <Box className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:grid-cols-3">
        <Box>
          <Typography variant="caption" color="text.secondary">
            Liczba produktów
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{draft.items.reduce((sum, item) => sum + item.quantity, 0)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Łączna cena
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{formatCurrency(draft.items.reduce((sum, item) => sum + item.item_total, 0))}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Wybrane zlecenie
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{selectedOrder?.title || 'Nowy szkic'}</Typography>
        </Box>
      </Box>
    </Paper>
  )
}
