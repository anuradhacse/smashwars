import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { format } from 'date-fns';
import { ApiError, api } from '@/app/api/client';
import type { PlayerOverview } from '@/app/api/types';
import { DEFAULT_PLAYER_ID } from '@/app/config';
import { useSync } from '@/app/context/SyncContext';

function InfoTooltip({ title }: { title: string }) {
  return (
    <Tooltip title={title} arrow enterTouchDelay={0} leaveTouchDelay={3000} placement="top">
      <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help', ml: 0.5 }} />
    </Tooltip>
  );
}

export function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { playerId: playerIdParam } = useParams();
  const playerId = Number(playerIdParam ?? DEFAULT_PLAYER_ID);
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m' | 'all'>('12m');
  const [overview, setOverview] = useState<PlayerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const { syncing, syncError: syncErr, lastSyncMessage, triggerSync, clearSyncMessage } = useSync();
  const [syncMenuAnchor, setSyncMenuAnchor] = useState<null | HTMLElement>(null);

  // Load avatar from DB on mount
  useEffect(() => {
    let active = true;
    api
      .getAvatar(playerId)
      .then((res) => {
        if (active && res.avatarUrl) {
          setProfilePhotoUrl(res.avatarUrl);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [playerId]);

  const handleSync = async (rangeValue: 12 | 24 | 'all') => {
    await triggerSync(playerId, rangeValue);
  };

  const handleSyncMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSyncMenuAnchor(event.currentTarget);
  };

  const handleSyncMenuClose = () => {
    setSyncMenuAnchor(null);
  };

  const handleSyncSelect = (range: 12 | 24 | 'all') => {
    handleSyncMenuClose();
    handleSync(range);
  };

  const chartColor =
    theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main;

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPlayerOverview(playerId, timeRange);
        if (active) {
          setOverview(data);
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 404) {
            setError('No data yet. Sync this player to load data.');
          } else {
            setError('Unable to load player overview.');
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [timeRange, playerId, syncing]);

  const trendPoints = useMemo(() => overview?.trend.points ?? [], [overview]);

  useEffect(() => {
    if (Number.isFinite(playerId) && playerId > 0) {
      localStorage.setItem('lastPlayerId', String(playerId));
    }
  }, [playerId]);

  const mobileCardSx = {
    width: '100%',
  };

  if (loading) {
    return (
      <Container maxWidth={false} disableGutters sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
          <Skeleton variant="text" width={220} height={40} />
          <Skeleton variant="text" width={280} height={24} sx={{ mb: 3 }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[...Array(4)].map((_, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
                  <CardContent>
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="text" width={120} height={36} />
                    <Skeleton variant="text" width={160} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Card sx={{ height: 280, ...mobileCardSx }} />
        </Box>
      </Container>
    );
  }

  if (error || !overview) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Unable to load dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {error ?? 'Please try again later.'}
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="contained" onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button variant="outlined" onClick={() => handleSync(12)}>
                Sync now
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const initials = overview.displayName
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Container maxWidth={false} disableGutters sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Grid
          container
          spacing={{ xs: 2, md: 4 }}
          columnSpacing={{ xs: 2, md: 24 }}
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box>
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    event.target.value = '';
                    const img = new Image();
                    img.onload = () => {
                      const size = 256;
                      const canvas = document.createElement('canvas');
                      canvas.width = size;
                      canvas.height = size;
                      const ctx = canvas.getContext('2d')!;
                      // Crop to square from center
                      const min = Math.min(img.width, img.height);
                      const sx = (img.width - min) / 2;
                      const sy = (img.height - min) / 2;
                      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
                      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                      setProfilePhotoUrl(dataUrl);
                      api.updateAvatar(playerId, dataUrl).catch(() => {});
                    };
                    img.src = URL.createObjectURL(file);
                  }}
                />
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      size="small"
                      component="label"
                      htmlFor="profile-photo-upload"
                      sx={{
                        width: { xs: 24, md: 28 },
                        height: { xs: 24, md: 28 },
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      aria-label="Upload profile photo"
                    >
                      <CameraAltIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={profilePhotoUrl ?? undefined}
                    sx={{
                      width: { xs: 56, md: 64 },
                      height: { xs: 56, md: 64 },
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </Avatar>
                </Badge>
              </Box>

              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.25 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {overview.displayName}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Penicuik Table Tennis Club
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Synced{' '}
                    {overview.sync.lastSyncedAt
                      ? format(new Date(overview.sync.lastSyncedAt), 'MMM dd, HH:mm')
                      : '—'}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Showing
                </Typography>
                <ToggleButtonGroup
                  value={timeRange}
                  exclusive
                  onChange={(_e, v) => v && setTimeRange(v)}
                  size="small"
                  aria-label="Select time range"
                >
                  <ToggleButton value="3m">3M</ToggleButton>
                  <ToggleButton value="6m">6M</ToggleButton>
                  <ToggleButton value="12m">12M</ToggleButton>
                  <ToggleButton value="all">All</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              {!isMobile && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleSyncMenuOpen}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Sync player data
                  </Button>
                  <Menu
                    anchorEl={syncMenuAnchor}
                    open={Boolean(syncMenuAnchor)}
                    onClose={handleSyncMenuClose}
                  >
                    <MenuItem onClick={() => handleSyncSelect(12)}>
                      <ListItemText>12 months</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleSyncSelect(24)}>
                      <ListItemText>24 months</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleSyncSelect('all')}>
                      <ListItemText>All history</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Key Metrics — Row 1 */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 1.5, sm: 2 } }}>
          {/* Rating */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
              >
                <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    Rating
                  </Typography>
                  <InfoTooltip title="Your skill level as a number. The range shows where your true rating likely falls." />
                </Stack>
                {overview.current ? (
                  <>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                    >
                      {overview.current.mean}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      True rating between {overview.current.mean - overview.current.stdev}–
                      {overview.current.mean + overview.current.stdev}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No rating data yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Win Rate */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
              >
                <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    Win Rate
                  </Typography>
                  <InfoTooltip title="Your win percentage from all matches in the selected time range." />
                </Stack>
                {overview.insights.winRate ? (
                  <>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                    >
                      {Math.round(
                        (overview.insights.winRate.wins / overview.insights.winRate.total) * 100,
                      )}
                      %
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      {overview.insights.winRate.wins}W – {overview.insights.winRate.losses}L (
                      {overview.insights.winRate.total} matches)
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No match data yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Form */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
              >
                <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    Recent Form
                  </Typography>
                  <InfoTooltip title="Total rating points gained or lost across your last 5 events. Positive means you're on an upswing." />
                </Stack>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                    color: overview.insights.momentumLast5
                      ? overview.insights.momentumLast5 > 0
                        ? 'success.main'
                        : overview.insights.momentumLast5 < 0
                          ? 'error.main'
                          : 'text.primary'
                      : 'text.primary',
                  }}
                >
                  {overview.insights.momentumLast5
                    ? `${overview.insights.momentumLast5 > 0 ? '+' : ''}${overview.insights.momentumLast5}`
                    : '0'}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  {overview.insights.momentumLast5
                    ? overview.insights.momentumLast5 > 0
                      ? 'Points gained in last 5 events'
                      : 'Points lost in last 5 events'
                    : 'No change in last 5 events'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Last Played */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  Last played
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                  >
                    {overview.lastPlayedDate
                      ? format(new Date(overview.lastPlayedDate), 'MMM dd')
                      : '—'}
                  </Typography>
                  {overview.current?.lastChange !== undefined && (
                    <Chip
                      label={`${overview.current.lastChange > 0 ? '+' : ''}${overview.current.lastChange}`}
                      color={overview.current.lastChange >= 0 ? 'success' : 'error'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  Activity recency
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Key Metrics — Row 2 */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
          {/* Events Played */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  Events Played
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {overview.insights.eventsPlayed ?? 0}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  In selected time range
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Upset Wins */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
              >
                <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    Upset Wins
                  </Typography>
                  <InfoTooltip title="Wins against opponents rated higher than you. Shows your best scalp — the highest-rated opponent you beat." />
                </Stack>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {overview.insights.upsetWins?.count ?? 0}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  {overview.insights.upsetWins?.best
                    ? `Best: ${overview.insights.upsetWins.best.opponentName ?? 'Unknown'} (${overview.insights.upsetWins.best.opponentRating})`
                    : 'No upsets in this range'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Toughest Loss */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
              >
                <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    Toughest Loss
                  </Typography>
                  <InfoTooltip title="The lowest-rated opponent who beat you in the selected time range." />
                </Stack>
                {overview.insights.toughestLoss ? (
                  <>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                      noWrap
                    >
                      {overview.insights.toughestLoss.opponentName ?? 'Unknown'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Rated {overview.insights.toughestLoss.opponentRating}
                    </Typography>
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                  >
                    No losses in this range
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Current Streak */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
              >
                <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    Current Streak
                  </Typography>
                  <InfoTooltip title="Consecutive events where you gained or lost rating points." />
                </Stack>
                {overview.insights.currentStreak ? (
                  <>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        fontSize: { xs: '1.5rem', sm: '2.125rem' },
                        color:
                          overview.insights.currentStreak.direction === 'W'
                            ? 'success.main'
                            : 'error.main',
                      }}
                    >
                      {overview.insights.currentStreak.count}{' '}
                      {overview.insights.currentStreak.direction === 'W' ? 'W' : 'L'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      {overview.insights.currentStreak.direction === 'W'
                        ? `Gained points in last ${overview.insights.currentStreak.count} events`
                        : `Lost points in last ${overview.insights.currentStreak.count} events`}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No events yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex' }}>
            <Card sx={{ ...mobileCardSx, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent events
                  </Typography>
                  <Button size="small" onClick={() => navigate(`/players/${playerId}/history`)}>
                    Full history
                  </Button>
                </Stack>
                <List sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
                  {overview.recentEvents.slice(0, 7).map((event, index, arr) => (
                    <ListItem key={event.eventId} disablePadding divider={index < arr.length - 1}>
                      <ListItemButton
                        onClick={() => navigate(`/players/${playerId}/event/${event.eventId}`)}
                        sx={{ alignItems: 'center', gap: 2 }}
                      >
                        <ListItemText
                          primary={event.eventName}
                          secondary={format(new Date(event.eventDate), 'MMM dd, yyyy')}
                          primaryTypographyProps={{ fontWeight: 600 }}
                          sx={{ minWidth: 0 }}
                        />
                        <Chip
                          label={`${event.pointChange > 0 ? '+' : ''}${event.pointChange}`}
                          color={event.pointChange >= 0 ? 'success' : 'error'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex' }}>
            <Stack
              spacing={2}
              sx={{
                flex: 1,
                minHeight: { md: 520 },
                alignItems: { xs: 'center', md: 'stretch' },
              }}
            >
              <Card sx={{ ...mobileCardSx, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Rating trend
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {timeRange === 'all'
                        ? 'All time'
                        : `Last ${timeRange.replace('m', ' months')}`}
                      {' · '}
                      {trendPoints.length} events
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minHeight: isMobile ? 200 : 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendPoints}>
                        <defs>
                          <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={alpha(
                            theme.palette.text.primary,
                            theme.palette.mode === 'dark' ? 0.16 : 0.1,
                          )}
                        />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                          stroke={theme.palette.text.secondary}
                        />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="mean"
                          stroke={chartColor}
                          strokeWidth={2.5}
                          fill="url(#colorRating)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={mobileCardSx}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Club snapshot
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    {overview.club?.name ?? 'Penicuik Table Tennis Club'}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Rank {overview.club?.rank ?? '—'}
                  </Typography>
                  <Button variant="contained" onClick={() => navigate(`/players/${playerId}/club`)}>
                    View club leaderboard
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Sync snackbar */}
      <Snackbar
        open={syncing}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right',
        }}
      >
        <Alert severity="info" icon={<CircularProgress size={18} />} variant="filled">
          Syncing player data…
        </Alert>
      </Snackbar>
      <Snackbar
        open={!syncing && (!!lastSyncMessage || !!syncErr)}
        autoHideDuration={4000}
        onClose={clearSyncMessage}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right',
        }}
      >
        <Alert severity={syncErr ? 'error' : 'success'} variant="filled" onClose={clearSyncMessage}>
          {syncErr ?? lastSyncMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
