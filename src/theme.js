import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: 'hsl(8, 85%, 55%)', light: 'hsl(8, 85%, 65%)', dark: 'hsl(8, 85%, 45%)', contrastText: '#fff' },
    secondary: { main: 'hsl(222, 12%, 22%)', light: 'hsl(222, 10%, 30%)', dark: 'hsl(222, 14%, 16%)', contrastText: 'hsl(210, 20%, 98%)' },
    success: { main: 'hsl(145, 65%, 45%)', light: 'hsl(145, 65%, 55%)', dark: 'hsl(145, 65%, 35%)' },
    warning: { main: 'hsl(38, 92%, 50%)', light: 'hsl(38, 92%, 60%)', dark: 'hsl(38, 92%, 40%)' },
    error: { main: 'hsl(0, 78%, 55%)', light: 'hsl(0, 78%, 65%)', dark: 'hsl(0, 78%, 45%)' },
    background: { default: 'hsl(222, 14%, 10%)', paper: 'hsl(222, 12%, 16%)' },
    text: { primary: 'hsl(210, 20%, 98%)', secondary: 'hsl(214, 12%, 68%)' },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600, fontSize: '0.95rem' },
    subtitle1: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600 },
    subtitle2: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 500 },
    caption: { fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
          backgroundColor: 'hsl(222, 14%, 10%)',
          color: 'hsl(210, 20%, 98%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
          padding: '6px 16px',
          fontSize: '0.75rem',
          fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.2)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif',
            fontWeight: 600,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: 'hsl(222, 14%, 10%)',
            color: 'hsl(214, 12%, 68%)',
            padding: '8px 16px',
            borderBottom: '1px solid hsl(222, 8%, 32%)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
          fontSize: '0.75rem',
          borderBottom: '1px solid hsl(222, 8%, 32%)',
          fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '0.65rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': { color: 'hsl(214, 12%, 68%)', opacity: 1 },
          fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: 'hsl(222, 8%, 32%)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': { color: 'hsl(214, 12%, 68%)' },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
