import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Order } from '../../features/orders/types'
import { formatCurrency } from '../../features/orders/utils'

type AppHeaderProps = Readonly<{
  orders: readonly Order[]
  userEmail: string
}>

export function AppHeader({ orders, userEmail }: AppHeaderProps) {
  const unpaidCount = useMemo(() => orders.filter((order) => order.status !== 'paid').length, [orders])
  const outstandingPln = useMemo(
    () => orders.reduce((sum, order) => sum + (order.status !== 'paid' ? order.totalPrice : 0), 0),
    [orders],
  )

  return (
    <Paper elevation={0} className="rounded-xl bg-white p-3.5 sm:p-4">
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', lg: 'center' } }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.7rem', md: '1.95rem' } }}>
            Rejestr zleceń i płatności warsztatu
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontWeight: 600 }}>
            Zalogowano jako: {userEmail}
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
          <Paper elevation={0} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5">
            <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '2rem' }}>
              {unpaidCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Zlecenia nieopłacone
            </Typography>
          </Paper>
          <Paper elevation={0} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5">
            <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '2rem' }}>
              {formatCurrency(outstandingPln)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Całkowita cena do zapłaty (PLN)
            </Typography>
          </Paper>
        </Stack>
      </Stack>
    </Paper>
  )
}
