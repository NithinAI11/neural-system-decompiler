// ===== File: nsd-frontend/src/theme.js =====
import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      // PREMIUM MIDNIGHT BLUE / BLACK THEME
      background: { default: '#020617', paper: '#0f172a' }, // Slate 950 and Slate 900
      primary: { main: '#38bdf8', light: '#7dd3fc' },       // Light Blue Neon
      secondary: { main: '#818cf8' },                       // Indigo
      error: { main: '#f43f5e' },
      warning: { main: '#eab308' },
      divider: 'rgba(56, 189, 248, 0.1)',
      text: { primary: '#f8fafc', secondary: '#94a3b8' }
    } : {
      // PREMIUM GLACIER WHITE / BLUE THEME
      background: { default: '#f8fafc', paper: '#ffffff' }, 
      primary: { main: '#0284c7', light: '#38bdf8' },
      secondary: { main: '#4f46e5' },
      error: { main: '#e11d48' },
      warning: { main: '#ca8a04' },
      divider: 'rgba(2, 132, 199, 0.1)',
      text: { primary: '#0f172a', secondary: '#475569' }
    }),
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    subtitle1: { textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '16px',
          boxShadow: mode === 'dark' ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 10px 30px -10px rgba(2, 132, 199, 0.15)',
          border: `1px solid ${mode === 'dark' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(2, 132, 199, 0.1)'}`,
        },
      },
    },
    MuiButton: { styleOverrides: { root: { borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontFamily: '"Space Grotesk", sans-serif' } } },
  },
});