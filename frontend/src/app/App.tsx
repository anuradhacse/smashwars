import { ThemeProvider, createTheme, PaletteMode, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useState, useMemo, useEffect } from 'react';
import { ColorModeContext } from './theme/ColorModeContext';
import { SyncProvider } from './context/SyncContext';

export default function App() {
  const [mode, setMode] = useState<PaletteMode>('dark');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                background: {
                  default: '#0f1115',
                  paper: '#171a21',
                },
                divider: 'rgba(255,255,255,0.08)',
              }
            : {
                background: {
                  default: '#f5f7fb',
                  paper: '#ffffff',
                },
                divider: 'rgba(0,0,0,0.08)',
              }),
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: '"Manrope", "IBM Plex Sans", sans-serif',
          h4: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
          h5: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
          },
          h6: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          body1: {
            letterSpacing: '0.01em',
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundImage: 'none',
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[mode === 'dark' ? 8 : 2],
                border: '1px solid',
                borderColor:
                  mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.08)
                    : alpha(theme.palette.common.black, 0.08),
              }),
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [mode],
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SyncProvider>
          <RouterProvider router={router} />
        </SyncProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
