import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { api } from '@/app/api/client';
import type { PlayerHistory } from '@/app/api/types';
import { DEFAULT_PLAYER_ID } from '@/app/config';

export function History() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [range, setRange] = useState<PlayerHistory['range']>('6m');
  const [history, setHistory] = useState<PlayerHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartColor =
    theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main;

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPlayerHistory(DEFAULT_PLAYER_ID, range);
        if (active) {
          setHistory(data);
        }
      } catch {
        if (active) {
          setError('Unable to load rating history.');
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
  }, [range]);

  const chartData = useMemo(() => {
    if (!history) return [];
    return history.events
      .map((event) => ({
        date: event.eventDate,
        mean: event.final.mean,
      }))
      .reverse();
  }, [history]);

  if (loading) {
    return (
      <Container maxWidth={false} disableGutters sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
          <Skeleton variant="text" width={240} height={40} sx={{ mb: 2 }} />
          <Card sx={{ height: 260 }} />
        </Box>
      </Container>
    );
  }

  if (error || !history) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Unable to load history
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

  return (
    <Container maxWidth={false} disableGutters sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/')} aria-label="Back to dashboard">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Rating history
          </Typography>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Timeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Final ratings per event
                </Typography>
              </Box>
              <ToggleButtonGroup
                value={range}
                exclusive
                onChange={(event, newValue) => newValue && setRange(newValue)}
                size="small"
                aria-label="Select range"
              >
                <ToggleButton value="3m">3M</ToggleButton>
                <ToggleButton value="6m">6M</ToggleButton>
                <ToggleButton value="1y">1Y</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorHistory)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Event history
            </Typography>
            <List sx={{ p: 0 }}>
              {history.events.map((event, index) => (
                <ListItem key={event.eventId} disablePadding divider={index < history.events.length - 1}>
                  <ListItemButton onClick={() => navigate(`/event/${event.eventId}`)}>
                    <ListItemText
                      primary={event.eventName}
                      secondary={format(new Date(event.eventDate), 'MMM dd, yyyy')}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Stack alignItems="flex-end">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {event.final.mean} ±{event.final.stdev}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={event.pointChange >= 0 ? 'success.main' : 'error.main'}
                      >
                        {event.pointChange > 0 ? '+' : ''}{event.pointChange}
                      </Typography>
                    </Stack>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
