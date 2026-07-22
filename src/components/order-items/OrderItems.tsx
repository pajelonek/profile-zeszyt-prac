import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { OrderItem } from '../../features/orders/types'
import { formatCurrency } from '../../features/orders/utils'

type OrderItemsProps = Readonly<{
  items: readonly OrderItem[]
  onUpdateItem: (itemId: string, field: 'description' | 'quantity' | 'unit_price', value: string) => void
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
}>

export function OrderItems({ items, onUpdateItem, onAddItem, onRemoveItem }: OrderItemsProps) {
  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} className="mb-2.5" sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Pozycje
        </Typography>
        <Button variant="outlined" type="button" className="w-full sm:w-auto" onClick={onAddItem}>
          Dodaj pozycję
        </Button>
      </Stack>

      <Stack spacing={1.5}>
        {items.map((item: OrderItem, index) => (
          <Box key={item.id} className="grid gap-2.5 rounded-lg border border-slate-300 bg-slate-50 p-2.5 lg:grid-cols-[2fr_0.78fr_0.9fr_auto_auto]">
            <TextField
              id={`item-desc-${item.id}`}
              label="Usługa / opis"
              value={item.description}
              onChange={(event) => onUpdateItem(item.id, 'description', event.target.value)}
              fullWidth
            />
            <TextField
              id={`item-qty-${item.id}`}
              label="Ilość / MB"
              type="text"
              slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
              value={item.quantity}
              onChange={(event) => onUpdateItem(item.id, 'quantity', event.target.value)}
              fullWidth
            />
            <TextField
              id={`item-price-${item.id}`}
              label="Cena jedn. / za metr"
              type="text"
              slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' } }}
              value={item.unit_price}
              onChange={(event) => onUpdateItem(item.id, 'unit_price', event.target.value)}
              fullWidth
            />
            <Box className="flex flex-col justify-end rounded-md border border-slate-300 bg-white px-2.5 py-1.5">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Suma pozycji
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{formatCurrency(item.item_total)}</Typography>
            </Box>
            {items.length > 1 ? (
              <Button color="error" variant="outlined" type="button" onClick={() => onRemoveItem(item.id)} aria-label={`Usuń pozycję ${index + 1}`}>
                Usuń
              </Button>
            ) : (
              <Box className="flex items-end justify-center text-sm font-semibold text-slate-400">{index + 1}</Box>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
