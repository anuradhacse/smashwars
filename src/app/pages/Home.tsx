import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { api } from '@/app/api/client';
import type { PlayerOverview, SyncStatus } from '@/app/api/types';
import { DEFAULT_PLAYER_ID } from '@/app/config';

const statusColorMap: Record<SyncStatus, 'success' | 'warning' | 'info' | 'error'> = {
  ok: 'success',
  stale: 'warning',
  in_progress: 'info',
  failed: 'error',
};

export function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [overview, setOverview] = useState<PlayerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const chartColor =
    theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main;

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPlayerOverview(DEFAULT_PLAYER_ID);
        if (active) {
          setOverview(data);
        }
      } catch {
        if (active) {
          setError('Unable to load player overview.');
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
  }, []);

  useEffect(() => {
    return () => {
      if (profilePhotoUrl) {
        URL.revokeObjectURL(profilePhotoUrl);
      }
    };
  }, [profilePhotoUrl]);

  const filteredTrend = useMemo(() => {
    if (!overview) return [];
    if (timeRange === 'all') return overview.trend.points;

    const monthsMap: Record<'3m' | '6m' | '1y', number> = { '3m': 3, '6m': 6, '1y': 12 };
    const cutoffDate = new Date(overview.trend.points.at(-1)?.date ?? new Date());
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsMap[timeRange]);

    return overview.trend.points.filter((point) => new Date(point.date) >= cutoffDate);
  }, [overview, timeRange]);

  const stdevChangeSelected = useMemo(() => {
    if (filteredTrend.length < 2) return undefined;
    const first = filteredTrend[0]?.stdev ?? 0;
    const last = filteredTrend.at(-1)?.stdev ?? 0;
    return last - first;
  }, [filteredTrend]);

  const mobileCardSx = {
    width: '100%',
    maxWidth: { xs: 360, sm: '100%' },
    mx: { xs: 'auto', sm: 0 },
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
            <Button variant="contained" onClick={() => window.location.reload()}>
              Retry
            </Button>
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
                    setProfilePhotoUrl(URL.createObjectURL(file));
                  }}
                />
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    !profilePhotoUrl ? (
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
                    ) : null
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
                  {overview.club?.name}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Synced {format(new Date(overview.sync.lastSyncedAt), 'MMM dd, HH:mm')}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
          >
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
              >
                Sync data
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="overline" color="text.secondary">
                    Rating
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {overview.current.mean}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ±{overview.current.stdev} uncertainty
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Consistency
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stdevChangeSelected ? Math.abs(stdevChangeSelected).toFixed(1) : '—'}
                  </Typography>
                  {stdevChangeSelected !== undefined &&
                    (stdevChangeSelected < 0 ? (
                      <TrendingDownIcon color="success" />
                    ) : (
                      <TrendingUpIcon color="error" />
                    ))}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Stdev {stdevChangeSelected && stdevChangeSelected < 0 ? 'down' : 'up'} in range
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Momentum
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {overview.insights.momentumLast5 ? `+${overview.insights.momentumLast5}` : '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 5 events
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%', ...mobileCardSx }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Last played
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {overview.insights.lastPlayedDate
                    ? format(new Date(overview.insights.lastPlayedDate), 'MMM dd')
                    : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Activity recency
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex' }}>
            <Card sx={{ ...mobileCardSx, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent events
                  </Typography>
                  <Button size="small" onClick={() => navigate('/history')}>
                    Full history
                  </Button>
                </Stack>
                <List sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
                  {overview.recentEvents.slice(0, 7).map((event, index, arr) => (
                    <ListItem key={event.eventId} disablePadding divider={index < arr.length - 1}>
                      <ListItemButton
                        onClick={() => navigate(`/event/${event.eventId}`)}
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
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Rating trend
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stability and improvement over time
                      </Typography>
                    </Box>
                    <ToggleButtonGroup
                      value={timeRange}
                      exclusive
                      onChange={(event, newValue) => newValue && setTimeRange(newValue)}
                      size="small"
                      aria-label="Select time range"
                    >
                      <ToggleButton value="3m">3M</ToggleButton>
                      <ToggleButton value="6m">6M</ToggleButton>
                      <ToggleButton value="1y">1Y</ToggleButton>
                      <ToggleButton value="all">All</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                  <Box sx={{ flex: 1, minHeight: isMobile ? 200 : 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredTrend}>
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
                    {overview.club?.name}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Rank {overview.club?.rank ?? '—'}
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/club')}>
                    View club leaderboard
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
