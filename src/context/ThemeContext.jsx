import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext({ toggleTheme: () => {}, mode: 'light' });

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('logimove_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('logimove_theme', mode);
  }, [mode]);

  const toggleTheme = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8', contrastText: '#fff' },
          secondary: { main: '#7c3aed', light: '#8b5cf6', dark: '#6d28d9', contrastText: '#fff' },
          success: { main: '#16a34a', light: '#22c55e', dark: '#15803d' },
          warning: { main: '#d97706', light: '#f59e0b', dark: '#b45309' },
          error: { main: '#dc2626', light: '#ef4444', dark: '#b91c1c' },
          background: mode === 'dark'
            ? { default: '#0f172a', paper: '#1e293b' }
            : { default: '#f1f5f9', paper: '#ffffff' },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: { fontWeight: 700, fontSize: '1.75rem' },
          h5: { fontWeight: 600, fontSize: '1.25rem' },
          h6: { fontWeight: 600, fontSize: '1.1rem' },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { textTransform: 'none', fontWeight: 600, borderRadius: 10, padding: '8px 20px' },
              contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } },
            },
          },
          MuiCard: {
            styleOverrides: { root: { borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' } },
          },
          MuiTableHead: {
            styleOverrides: { root: {
              '& .MuiTableCell-head': { fontWeight: 700, backgroundColor: mode === 'dark' ? '#334155' : '#f8fafc', color: mode === 'dark' ? '#e2e8f0' : '#475569' },
            } },
          },
          MuiChip: {
            styleOverrides: { root: { fontWeight: 600 } },
          },
          MuiPaper: {
            styleOverrides: { root: { backgroundImage: 'none' } },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
