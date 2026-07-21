import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Order } from '../../features/orders/types'
import { formatCurrency } from '../../features/orders/utils'

type AppHeaderProps = Readonly<{
  orders: readonly Order[]
}>

export function AppHeader({ orders }: AppHeaderProps) {
  const unpaidCount = useMemo(() => orders.filter((order) => order.paymentState !== 'paid').length, [orders])
  const outstandingPln = useMemo(
    () => orders.reduce((sum, order) => sum + Math.max(0, order.paymentDue - order.paidAmount), 0),
    [orders],
  )

  return (
    <Paper elevation={3} className="rounded-[24px] bg-white p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)] sm:p-6">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Tracker zleceń warsztatowych
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Rejestr zleceń i płatności warsztatu
          </Typography>
          <Typography color="text.secondary" className="max-w-2xl">
            Skupienie na pracy operacyjnej: kto czeka na odbiór, kto nie zapłacił i ile pieniędzy jest jeszcze do odzyskania.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="w-full">
          <Paper elevation={1} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {unpaidCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Zlecenia oczekujące na płatność
            </Typography>
          </Paper>
          <Paper elevation={1} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatCurrency(outstandingPln)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Kwota do odzyskania (PLN)
            </Typography>
          </Paper>
        </Stack>
      </Stack>
    </Paper>
  )
}
