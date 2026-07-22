import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { orderStatusChipStyles } from '../../features/orders/constants'
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
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false)

  const filteredOrders = useMemo(
    () => (showOnlyUnpaid ? orders.filter((order) => order.status !== 'paid') : orders),
    [orders, showOnlyUnpaid],
  )

  const totalOrders = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize))
  const safePage = Math.min(page, totalPages)

  const visibleOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, safePage, pageSize])

  const rangeStart = totalOrders === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalOrders)

  return (
    <Paper
      elevation={0}
      className="w-full rounded-xl bg-white p-3 lg:w-[330px]"
      sx={{ borderColor: 'transparent', display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} className="mb-2.5" spacing={1} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Zlecenia
        </Typography>
        <Button variant="contained" className="w-full sm:w-auto" color="primary" onClick={onNewOrder} sx={{ borderRadius: 2, px: 2 }}>
          Nowe zlecenie
        </Button>
      </Stack>

      <Box className="mb-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
        <FormControlLabel
          control={(
            <Switch
              checked={showOnlyUnpaid}
              onChange={(event) => {
                setShowOnlyUnpaid(event.target.checked)
                setPage(1)
              }}
            />
          )}
          label="Tylko nieopłacone"
          sx={{ m: 0, '& .MuiFormControlLabel-label': { fontWeight: 600 } }}
        />
      </Box>

      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
        {totalOrders === 0 ? (
          <Box className="rounded-lg border border-dashed border-slate-400 bg-slate-50 p-3.5">
            <Typography sx={{ fontWeight: 700 }}>
              {showOnlyUnpaid ? 'Brak nieopłaconych zleceń' : 'Brak aktywnych zleceń'}
            </Typography>
            <Typography variant="body1" color="text.secondary" className="mt-1">
              {showOnlyUnpaid
                ? 'Wszystkie zlecenia są oznaczone jako Zapłacone.'
                : 'Dodaj pierwsze zlecenie, aby rozpocząć rejestr pracy i płatności.'}
            </Typography>
            {!showOnlyUnpaid ? (
              <Button variant="contained" className="mt-3 w-full" onClick={onNewOrder}>
                Nowe zlecenie
              </Button>
            ) : null}
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
            <Stack spacing={1.1}>
              {visibleOrders.map((order) => (
                <ButtonBase
                  key={order.id}
                  type="button"
                  onClick={() => onSelectOrder(order)}
                  aria-pressed={selectedOrderId === order.id}
                  aria-label={`Otwórz zlecenie ${order.title || order.clientName}`}
                  className={`w-full rounded-lg border p-2.5 text-left transition-all ${selectedOrderId === order.id ? 'border-blue-700' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  sx={{
                    display: 'block',
                    borderLeftWidth: '6px',
                    borderLeftStyle: 'solid',
                    borderLeftColor: selectedOrderId === order.id ? 'primary.dark' : 'transparent',
                    backgroundColor: selectedOrderId === order.id ? '#e7f1fb' : 'white',
                    pl: 1.5,
                    '&:hover': {
                      backgroundColor: selectedOrderId === order.id ? '#d6e7f8' : '#f8fafc',
                    },
                    '&:focus-visible': {
                      outline: '3px solid #003d73',
                      outlineOffset: '3px',
                    },
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
                      aria-label={`Status: ${orderStatusChipStyles[order.status].label}`}
                      label={orderStatusChipStyles[order.status].label}
                      size="small"
                      color={orderStatusChipStyles[order.status].color}
                      variant="filled"
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>

                  <Stack direction="row" className="mt-1.5" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, minWidth: 0, pr: 1 }}>
                      Wartość zlecenia: {formatCurrency(order.totalPrice)}
                    </Typography>
                  </Stack>
                </ButtonBase>
              ))}
            </Stack>
          </Box>
        )}

        {totalOrders > 0 ? (
          <Box className="mt-auto rounded-lg border border-slate-300 bg-slate-50 px-3 py-3">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {rangeStart}-{rangeEnd} z {totalOrders}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Na stronę
                </Typography>
                <Select
                  value={pageSize}
                  onChange={(event) => {
                    const nextPageSize = Number(event.target.value)
                    setPageSize(nextPageSize)
                    setPage(1)
                  }}
                  sx={{ minWidth: 90, backgroundColor: 'white', '.MuiSelect-select': { py: 0.8, pr: 2 } }}
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
              <Button variant="outlined" className="w-full sm:w-auto" onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))} disabled={safePage <= 1}>
                Poprzednia
              </Button>
              <Button
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
