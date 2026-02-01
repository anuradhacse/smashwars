import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import GroupsIcon from '@mui/icons-material/Groups';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useContext } from 'react';
import { ColorModeContext } from '../theme/ColorModeContext';
import { RiveLogo } from './RiveLogo';

export function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const getNavValue = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname.startsWith('/history') || location.pathname.startsWith('/event')) return 1;
    if (location.pathname === '/club') return 2;
    return 0;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top AppBar - Desktop */}
      <AppBar
        position="sticky"
        elevation={0}
        color="default"
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: { xs: 64, md: 72 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
            <RiveLogo src="/table_tennis.riv" size={56} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Table tennis stats
              </Typography>
              {!isMobile && (
                <Typography variant="caption" color="text.secondary">
                  Performance dashboard
                </Typography>
              )}
            </Box>
          </Stack>
          {!isMobile && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Home">
                <IconButton color="inherit" onClick={() => navigate('/')} aria-label="Go to home">
                  <HomeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="History">
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/history')}
                  aria-label="Go to history"
                >
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Club leaderboard">
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/club')}
                  aria-label="Go to club leaderboard"
                >
                  <GroupsIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          {isMobile && (
            <Tooltip title="Sync data">
              <IconButton onClick={() => window.location.reload()} color="inherit" aria-label="Sync data">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleColorMode} color="inherit" aria-label="Toggle color mode">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: isMobile ? 8 : 0,
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Navigation - Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
          elevation={8}
        >
          <BottomNavigation
            value={getNavValue()}
            onChange={(event, newValue) => {
              if (newValue === 0) navigate('/');
              if (newValue === 1) navigate('/history');
              if (newValue === 2) navigate('/club');
            }}
            showLabels
          >
            <BottomNavigationAction label="Home" icon={<HomeIcon />} />
            <BottomNavigationAction label="History" icon={<HistoryIcon />} />
            <BottomNavigationAction label="Club" icon={<GroupsIcon />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
