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
  Menu,
  MenuItem,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import GroupsIcon from '@mui/icons-material/Groups';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import RefreshIcon from '@mui/icons-material/Refresh';
import { TableTennisIcon } from './TableTennisIcon';
import { useContext, useMemo, useState } from 'react';
import { ColorModeContext } from '../theme/ColorModeContext';
import { RiveLogo } from './RiveLogo';
import { DEFAULT_PLAYER_ID } from '../config';
import { useSync } from '../context/SyncContext';

const SYNC_RANGES = [
  { label: '12 months', value: 12 as const },
  { label: '24 months', value: 24 as const },
  { label: 'All history', value: 'all' as const },
];

export function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const { syncing, triggerSync } = useSync();
  const [syncMenuAnchor, setSyncMenuAnchor] = useState<null | HTMLElement>(null);

  const getPlayerIdFromPath = () => {
    const match = location.pathname.match(/\/players\/(\d+)/);
    if (match) {
      return Number(match[1]);
    }
    const last = localStorage.getItem('lastPlayerId');
    return last ? Number(last) : DEFAULT_PLAYER_ID;
  };

  const playerId = getPlayerIdFromPath();
  const titleChars = useMemo(() => Array.from('SmashWars'), []);

  const handleSyncMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSyncMenuAnchor(event.currentTarget);
  };

  const handleSyncMenuClose = () => {
    setSyncMenuAnchor(null);
  };

  const handleSyncSelect = (range: 12 | 24 | 'all') => {
    handleSyncMenuClose();
    triggerSync(playerId, range);
  };

  const getNavValue = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname.includes('/history') || location.pathname.includes('/event')) return 1;
    if (location.pathname.includes('/club')) return 2;
    if (location.pathname.includes('/ping-pong')) return 3;
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
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            onClick={() => navigate('/')}
            role="link"
            aria-label="Go to player search"
            className="smash-logo"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              borderRadius: 2,
              px: 1,
              mx: -1,
              transition: 'opacity 180ms ease',
              '&:hover': { opacity: 0.85 },
              '&:hover .smash-subtitle': {
                letterSpacing: '0.12em',
              },
            }}
          >
            <RiveLogo src="/table_tennis.riv" size={56} />
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0, lineHeight: 1.2 }}
              >
                <Box
                  component="span"
                  className="smash-title"
                  sx={{
                    display: 'inline-flex',
                    flexWrap: 'wrap',
                    '@keyframes titleIn': {
                      '0%': { opacity: 0, transform: 'translateY(6px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' },
                    },
                    '@keyframes letterPop': {
                      '0%': { transform: 'translateY(0) scale(1)' },
                      '40%': { transform: 'translateY(-3px) scale(1.12)' },
                      '100%': { transform: 'translateY(0) scale(1)' },
                    },
                  }}
                >
                  {titleChars.map((char, index) => (
                    <Box
                      key={`${char}-${index}`}
                      component="span"
                      className="smash-char"
                      sx={{
                        display: 'inline-block',
                        whiteSpace: 'pre',
                        animation: reduceMotion ? 'none' : 'titleIn 520ms ease-out forwards',
                        animationDelay: reduceMotion ? '0ms' : `${index * 22}ms`,
                        opacity: reduceMotion ? 1 : 0,
                        transition: 'color 250ms ease',
                        '.smash-logo:hover &': reduceMotion
                          ? {}
                          : {
                              animation: `titleIn 520ms ease-out forwards, letterPop 400ms ease ${index * 45}ms`,
                              color: 'primary.main',
                            },
                      }}
                    >
                      {char}
                    </Box>
                  ))}
                </Box>
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                className="smash-subtitle"
                sx={{
                  display: 'inline-block',
                  fontSize: { xs: '0.6rem', md: '0.95rem' },
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  transition: reduceMotion ? 'none' : 'letter-spacing 350ms ease',
                }}
              >
                Player ratings
              </Typography>
            </Box>
          </Stack>
          {!isMobile && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Home">
                <IconButton
                  color="inherit"
                  onClick={() => navigate(`/players/${playerId}`)}
                  aria-label="Go to home"
                >
                  <HomeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="History">
                <IconButton
                  color="inherit"
                  onClick={() => navigate(`/players/${playerId}/history`)}
                  aria-label="Go to history"
                >
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Club leaderboard">
                <IconButton
                  color="inherit"
                  onClick={() => navigate(`/players/${playerId}/club`)}
                  aria-label="Go to club leaderboard"
                >
                  <GroupsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ping Pong Zone">
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/ping-pong')}
                  aria-label="Go to Ping Pong Zone"
                >
                  <TableTennisIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          {isMobile && (
            <Tooltip
              title="Sync player data"
              enterTouchDelay={0}
              leaveTouchDelay={2000}
              placement="bottom"
            >
              <span>
                <IconButton
                  onClick={handleSyncMenuOpen}
                  color="inherit"
                  aria-label="Sync player data"
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Menu
            anchorEl={syncMenuAnchor}
            open={Boolean(syncMenuAnchor)}
            onClose={handleSyncMenuClose}
          >
            {SYNC_RANGES.map((opt) => (
              <MenuItem key={String(opt.value)} onClick={() => handleSyncSelect(opt.value)}>
                <ListItemText>{opt.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleColorMode} color="inherit" aria-label="Toggle color mode">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
        {syncing && <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />}
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
              if (newValue === 0) navigate(`/players/${playerId}`);
              if (newValue === 1) navigate(`/players/${playerId}/history`);
              if (newValue === 2) navigate(`/players/${playerId}/club`);
              if (newValue === 3) navigate('/ping-pong');
            }}
            showLabels
          >
            <BottomNavigationAction label="Home" icon={<HomeIcon />} />
            <BottomNavigationAction label="History" icon={<HistoryIcon />} />
            <BottomNavigationAction label="Club" icon={<GroupsIcon />} />
            <BottomNavigationAction label="Ping Pong" icon={<TableTennisIcon />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
