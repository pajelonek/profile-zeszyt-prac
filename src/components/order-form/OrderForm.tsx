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
import { orderStatuses, orderStatusChipStyles } from '../../features/orders/constants'
import type { OrderDraft, Order } from '../../features/orders/types'
import { formatCurrency } from '../../features/orders/utils'
import { OrderItems } from '../order-items/OrderItems'

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
    <Paper elevation={0} className="flex-1 rounded-xl bg-white p-3.5 md:p-4" sx={{ borderColor: 'transparent' }}>
      <form onSubmit={onSaveOrder}>
        <Stack spacing={2.25}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Szczegóły zlecenia
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2rem' } }}>
                {draft.title || draft.clientName || 'Nowe zlecenie'}
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} className="w-full sm:w-auto">
              <Button variant="outlined" type="button" className="w-full sm:w-auto" onClick={onDeleteOrder} color="error" disabled={!canDelete} sx={{ borderRadius: 2, px: 1.6 }}>
                Usuń zlecenie
              </Button>
              <Button variant="outlined" type="button" className="w-full sm:w-auto" onClick={onMarkComplete} color="success" disabled={!canMarkComplete} sx={{ borderRadius: 2, px: 1.6 }}>
                Oznacz jako wydane
              </Button>
              <Button variant="contained" type="submit" className="w-full sm:w-auto" sx={{ borderRadius: 2, px: 1.6 }}>
                Zapisz zlecenie
              </Button>
            </Stack>
          </Stack>

          <Box className="grid gap-2.5 md:grid-cols-2">
            <TextField
              id="job-title"
              label="Tytuł zlecenia"
              required
              error={!!titleError}
              helperText={titleError || ' '}
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
                    {orderStatusChipStyles[status].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box className="grid gap-2.5 md:grid-cols-2">
            <TextField id="client-name" label="Imię i nazwisko klienta" value={draft.clientName} onChange={(event) => onUpdateDraft('clientName', event.target.value)} fullWidth />
            <TextField id="client-phone" label="Telefon" value={draft.clientPhone} onChange={(event) => onUpdateDraft('clientPhone', event.target.value)} fullWidth />
          </Box>

          <Divider />

          <OrderItems items={draft.items} onUpdateItem={onUpdateItem} onAddItem={onAddItem} onRemoveItem={onRemoveItem} />

          <Box className="grid gap-2.5 md:grid-cols-2">
            <TextField id="order-notes" className="md:col-span-2" label="Notatki" multiline minRows={3} value={draft.notes} onChange={(event) => onUpdateDraft('notes', event.target.value)} fullWidth />
          </Box>
        </Stack>
      </form>

      <Divider className="my-3.5" />

      <Box className="mt-3 grid gap-2.5 rounded-lg border border-slate-300 bg-slate-50 p-3 md:grid-cols-3">
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Liczba produktów
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{draft.items.reduce((sum, item) => sum + item.quantity, 0)}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Łączna cena
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{formatCurrency(draft.items.reduce((sum, item) => sum + item.item_total, 0))}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Wybrane zlecenie
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{selectedOrder?.title || 'Nowy szkic'}</Typography>
        </Box>
      </Box>
    </Paper>
  )
}
