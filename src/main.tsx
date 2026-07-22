import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './index.css'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0057a3',
      dark: '#003d73',
    },
    background: {
      default: '#f4f4f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#303030',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: 'Verdana, Tahoma, Arial, sans-serif',
    fontSize: 16,
    h4: {
      fontWeight: 700,
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 700,
      lineHeight: 1.25,
    },
    h6: {
      fontWeight: 700,
      lineHeight: 1.3,
    },
    body1: {
      lineHeight: 1.5,
    },
    body2: {
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'medium',
      },
      styleOverrides: {
        root: {
          minHeight: 42,
          textTransform: 'none',
          fontWeight: 700,
          paddingInline: 14,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'medium',
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 600,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: '0.98rem',
          minHeight: 20,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #d9d9d9',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 34,
          fontSize: '0.95rem',
          fontWeight: 700,
        },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
