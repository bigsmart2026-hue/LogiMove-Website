import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext({ toggleTheme: () => {}, mode: 'dark' });

export function useThemeMode() {
  return useContext(ThemeContext);
}

const baseTheme = {
  typography: {
    fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600, fontSize: '0.95rem' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 6, padding: '6px 16px', fontSize: '0.75rem', fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif' }, contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.3)' } } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.2)', backgroundImage: 'none' } } },
    MuiChip: { styleOverrides: { root: { fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontWeight: 600, fontSize: '0.65rem' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDrawer: { styleOverrides: { paper: { backgroundImage: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { backgroundImage: 'none' } } },
  },
};

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('logimove_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('logimove_theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => {
    const isDark = mode === 'dark';
    return createTheme({
      ...baseTheme,
      palette: {
        mode,
        primary: { main: 'hsl(8, 85%, 55%)', light: 'hsl(8, 85%, 65%)', dark: 'hsl(8, 85%, 45%)', contrastText: '#fff' },
        secondary: { main: isDark ? 'hsl(222, 12%, 22%)' : '#64748b', light: isDark ? 'hsl(222, 10%, 30%)' : '#94a3b8', dark: isDark ? 'hsl(222, 14%, 16%)' : '#475569', contrastText: isDark ? 'hsl(210, 20%, 98%)' : '#fff' },
        success: { main: 'hsl(145, 65%, 45%)', light: 'hsl(145, 65%, 55%)', dark: 'hsl(145, 65%, 35%)' },
        warning: { main: 'hsl(38, 92%, 50%)', light: 'hsl(38, 92%, 60%)', dark: 'hsl(38, 92%, 40%)' },
        error: { main: 'hsl(0, 78%, 55%)', light: 'hsl(0, 78%, 65%)', dark: 'hsl(0, 78%, 45%)' },
        background: isDark
          ? { default: 'hsl(222, 14%, 10%)', paper: 'hsl(222, 12%, 16%)' }
          : { default: '#f1f5f9', paper: '#ffffff' },
        text: isDark
          ? { primary: 'hsl(210, 20%, 98%)', secondary: 'hsl(214, 12%, 68%)' }
          : { primary: '#0f172a', secondary: '#475569' },
      },
      components: {
        ...baseTheme.components,
        MuiTableHead: {
          styleOverrides: {
            root: {
              '& .MuiTableCell-head': {
                fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: isDark ? 'hsl(222, 14%, 10%)' : '#f8fafc',
                color: isDark ? 'hsl(214, 12%, 68%)' : '#475569',
                padding: '8px 16px',
                borderBottom: `1px solid ${isDark ? 'hsl(222, 8%, 32%)' : '#e2e8f0'}`,
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: '10px 16px',
              fontSize: '0.75rem',
              borderBottom: `1px solid ${isDark ? 'hsl(222, 8%, 32%)' : '#e2e8f0'}`,
              color: isDark ? 'hsl(210, 20%, 98%)' : '#0f172a',
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            input: {
              '&::placeholder': { color: isDark ? 'hsl(214, 12%, 68%)' : '#9ca3af', opacity: 1 },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            notchedOutline: { borderColor: isDark ? 'hsl(222, 8%, 32%)' : '#d1d5db' },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiInputLabel-root': { color: isDark ? 'hsl(214, 12%, 68%)' : '#6b7280' },
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
