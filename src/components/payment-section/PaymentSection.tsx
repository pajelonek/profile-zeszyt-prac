import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { paymentLabels, paymentStates } from '../../features/orders/constants'
import type { PaymentState } from '../../features/orders/types'
import { formatCurrency, parseNumericInput } from '../../features/orders/utils'

type PaymentSectionProps = Readonly<{
  paymentDue: number | string
  paidAmount: number | string
  paymentState: PaymentState
  onPaymentDueChange: (value: number | string) => void
  onPaidAmountChange: (value: number | string) => void
  onPaymentStateChange: (value: PaymentState) => void
}>

export function PaymentSection({
  paymentDue,
  paidAmount,
  paymentState,
  onPaymentDueChange,
  onPaidAmountChange,
  onPaymentStateChange,
}: PaymentSectionProps) {
  const remaining = Math.max(0, Number(paymentDue) - Number(paidAmount))

  return (
    <Box className="mt-4 rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.08)] md:p-6">
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
            Informacje o płatności
          </Typography>
          <Typography variant="body2" color="text.secondary" className="max-w-xl">
            Wprowadź kwotę, wpłatę i stan, aby obsłużyć płatność w zamówieniu.
          </Typography>
        </Stack>

        <Box className="grid gap-3 md:grid-cols-3">
          <TextField
            id="payment-due"
            label="Kwota do zapłaty"
            type="text"
            slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' } }}
            value={paymentDue}
            onChange={(event) => onPaymentDueChange(parseNumericInput(event.target.value))}
            fullWidth
          />
          <TextField
            id="paid-amount"
            label="Zapłacono"
            type="text"
            slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' } }}
            value={paidAmount}
            onChange={(event) => onPaidAmountChange(parseNumericInput(event.target.value))}
            fullWidth
          />
          <TextField id="remaining-amount" label="Pozostało do zapłaty" value={formatCurrency(remaining)} slotProps={{ htmlInput: { readOnly: true } }} fullWidth />
        </Box>

        <FormControl fullWidth>
          <InputLabel id="payment-state-label">Stan płatności</InputLabel>
          <Select labelId="payment-state-label" label="Stan płatności" value={paymentState} onChange={(event) => onPaymentStateChange(event.target.value)}>
            {paymentStates.map((state) => (
              <MenuItem key={state} value={state}>
                {paymentLabels[state]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Box>
  )
}
