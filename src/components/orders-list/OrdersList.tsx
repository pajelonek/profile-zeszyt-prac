import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { orderStatusChipStyles, paymentChipStyles, paymentLabels } from '../../features/orders/constants'
import type { Order } from '../../features/orders/types'
import { formatCurrency } from '../../features/orders/utils'

type OrdersListProps = Readonly<{
  orders: readonly Order[]
  selectedOrderId: string | null
  onSelectOrder: (order: Order) => void
  onNewOrder: () => void
}>

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export function OrdersList({ orders, selectedOrderId, onSelectOrder, onNewOrder }: OrdersListProps) {
  const [pageSize, setPageSize] = useState<number>(25)
  const [page, setPage] = useState<number>(1)

  const totalOrders = orders.length
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize))
  const safePage = Math.min(page, totalPages)

  const visibleOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return orders.slice(start, start + pageSize)
  }, [orders, safePage, pageSize])

  const rangeStart = totalOrders === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalOrders)

  return (
    <Paper
      elevation={2}
      className="w-full rounded-[24px] bg-white p-4 shadow-lg lg:w-[340px]"
      sx={{ borderColor: 'transparent', display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}
    >
      <Stack direction="row" className="mb-4" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Zlecenia
        </Typography>
        <Button variant="contained" size="small" className="w-full sm:w-auto" color="primary" onClick={onNewOrder} sx={{ borderRadius: 3, px: 2 }}>
          Nowe zlecenie
        </Button>
      </Stack>

      <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
        {totalOrders === 0 ? (
          <Box className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <Typography sx={{ fontWeight: 700 }}>Brak aktywnych zleceń</Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Dodaj pierwsze zlecenie, aby rozpocząć rejestr pracy i płatności.
            </Typography>
            <Button variant="contained" size="small" className="mt-3 w-full" onClick={onNewOrder}>
              Nowe zlecenie
            </Button>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
            <Stack spacing={1.5}>
              {visibleOrders.map((order) => (
                <ButtonBase
                  key={order.id}
                  type="button"
                  onClick={() => onSelectOrder(order)}
                  aria-pressed={selectedOrderId === order.id}
                  aria-label={`Otwórz zlecenie ${order.title || order.clientName}`}
                  className={`w-full rounded-2xl border p-3 text-left transition-all ${selectedOrderId === order.id ? 'border-sky-500 bg-sky-50 shadow-[0_6px_20px_rgba(2,132,199,0.12)]' : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'
                    }`}
                  sx={{
                    display: 'block',
                    borderLeftWidth: '6px',
                    borderLeftStyle: 'solid',
                    borderLeftColor: selectedOrderId === order.id ? 'primary.main' : 'transparent',
                    pl: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography
                      sx={{
                        fontWeight: selectedOrderId === order.id ? 800 : 700,
                        color: selectedOrderId === order.id ? 'primary.dark' : 'text.primary',
                        flex: 1,
                        minWidth: 0,
                        pr: 1,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {order.title || 'Bez tytułu zlecenia'}
                    </Typography>
                    <Chip
                      label={orderStatusChipStyles[order.status].label}
                      size="small"
                      color={orderStatusChipStyles[order.status].color}
                      variant="filled"
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" className="mt-1 block" sx={{ overflowWrap: 'anywhere' }}>
                    {order.clientName} · {order.clientPhone || 'Brak telefonu'}
                  </Typography>
                  <Stack direction="row" className="mt-2" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0, pr: 1 }}>
                      Do odbioru: {formatCurrency(Math.max(0, order.paymentDue - order.paidAmount))}
                    </Typography>
                    <Chip label={paymentLabels[order.paymentState]} size="small" color={paymentChipStyles[order.paymentState].color} variant="filled" sx={{ flexShrink: 0 }} />
                  </Stack>
                </ButtonBase>
              ))}
            </Stack>
          </Box>
        )}

        {totalOrders > 0 ? (
          <Box className="mt-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
              <Typography variant="caption" color="text.secondary">
                {rangeStart}-{rangeEnd} z {totalOrders}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                <Typography variant="caption" color="text.secondary">
                  Na stronę
                </Typography>
                <Select
                  size="small"
                  value={pageSize}
                  onChange={(event) => {
                    const nextPageSize = Number(event.target.value)
                    setPageSize(nextPageSize)
                    setPage(1)
                  }}
                  sx={{ minWidth: 74, backgroundColor: 'white', '.MuiSelect-select': { py: 0.5, pr: 2 } }}
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} className="mt-2" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Button size="small" variant="outlined" className="w-full sm:w-auto" onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))} disabled={safePage <= 1}>
                Poprzednia
              </Button>
              <Button
                size="small"
                variant="outlined"
                className="w-full sm:w-auto"
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                disabled={safePage >= totalPages}
              >
                Następna
              </Button>
            </Stack>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  )
}
