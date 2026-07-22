import { useState, type ComponentProps } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { supabase } from '../../lib/supabase'

export function AuthScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    let submitLabel = 'Trwa wysyłanie...'

    if (!isSubmitting) {
        submitLabel = 'Zaloguj się'
    }

    const submitCredentials = async () => {
        setIsSubmitting(true)
        setErrorMessage('')

        const credentials = {
            email: email.trim(),
            password,
        }

        const result = await supabase.auth.signInWithPassword(credentials)

        if (result.error) {
            setErrorMessage(result.error.message)
            setIsSubmitting(false)
            return
        }

        setIsSubmitting(false)
    }

    const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
        event.preventDefault()
        void submitCredentials()
    }

    return (
        <Box className="min-h-screen bg-[#f4f4f4] p-4">
            <Paper
                elevation={0}
                className="mx-auto w-full rounded-2xl bg-white p-5 sm:p-6"
                sx={{ maxWidth: 520, mt: { xs: 6, md: 10 }, borderColor: 'transparent' }}
            >
                <Stack spacing={2.5}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.1rem' } }}>
                            Dostęp do rejestru warsztatu
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Tylko zalogowany użytkownik może otworzyć aplikację i wykonywać operacje przez Supabase.
                            Konto utworzysz osobno w panelu Supabase.
                        </Typography>
                    </Box>

                    {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                type="email"
                                label="Adres e-mail"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                fullWidth
                            />
                            <TextField
                                type="password"
                                label="Hasło"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                slotProps={{ htmlInput: { minLength: 6 } }}
                                fullWidth
                            />
                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                {submitLabel}
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}