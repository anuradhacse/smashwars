import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { api } from '@/app/api/client';
import type { ClubLeaderboard as ClubLeaderboardType } from '@/app/api/types';
import { DEFAULT_CLUB_ID, DEFAULT_PLAYER_ID } from '@/app/config';
import { useParams } from 'react-router';

export function ClubLeaderboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [leaderboard, setLeaderboard] = useState<ClubLeaderboardType | null>(null);
  const [search, setSearch] = useState('');
  const { playerId: playerIdParam } = useParams();
  const playerId = Number(playerIdParam ?? DEFAULT_PLAYER_ID);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const clearSyncNotification = () => {
    setSyncMessage(null);
    setSyncError(null);
  };

  const loadLeaderboard = async () => {
    const data = await api.getClubLeaderboard(DEFAULT_CLUB_ID);
    setLeaderboard(data);
    setCursor(data.nextCursor);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await api.getClubLeaderboard(DEFAULT_CLUB_ID);
      if (active) {
        setLeaderboard(data);
        setCursor(data.nextCursor);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSyncClub = async () => {
    setSyncing(true);
    setSyncMessage(null);
    setSyncError(null);
    try {
      await api.syncClub(DEFAULT_CLUB_ID, 'Penicuik Table Tennis Club');
      await loadLeaderboard();
      setSyncMessage('Club data synced successfully');
    } catch {
      setSyncError('Club sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!leaderboard) return [];
    const query = search.trim().toLowerCase();
    const members = leaderboard.items;
    if (!query) return members;
    return members.filter((member) => member.name.toLowerCase().includes(query));
  }, [leaderboard, search]);

  const loadMore = async () => {
    if (!leaderboard || !cursor) return;
    setLoadingMore(true);
    try {
      const data = await api.getClubLeaderboard(DEFAULT_CLUB_ID, 50, cursor);
      setLeaderboard({
        items: [...leaderboard.items, ...data.items],
        nextCursor: data.nextCursor,
        hasMore: data.hasMore,
      });
      setCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!leaderboard) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Typography>Loading leaderboard…</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Club Leaderboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Penicuik Table Tennis Club
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleSyncClub}
          sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'inline-flex' } }}
        >
          Sync club data
        </Button>
      </Stack>

      {/* Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search players"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ maxWidth: 280 }}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleSyncClub}
          sx={{ whiteSpace: 'nowrap', display: { xs: 'inline-flex', md: 'none' } }}
        >
          Sync club data
        </Button>
      </Stack>

      {/* Leaderboard */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredMembers.map((member) => (
            <Card
              key={member.playerId}
              sx={{
                bgcolor: member.playerId === playerId ? 'primary.dark' : 'background.paper',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      #{member.rank}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${member.rating.mean} ±${member.rating.stdev}`}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Last played:{' '}
                  {member.lastPlayedDate
                    ? format(new Date(member.lastPlayedDate), 'MMM dd, yyyy')
                    : '—'}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Last Played</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow
                    key={member.playerId}
                    sx={{
                      bgcolor: member.playerId === playerId ? 'primary.dark' : 'inherit',
                      '& td': {
                        color: member.playerId === playerId ? 'white' : 'inherit',
                      },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>#{member.rank}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{member.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.rating.mean}{' '}
                        <span style={{ opacity: 0.7 }}>±{member.rating.stdev}</span>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {member.lastPlayedDate
                        ? format(new Date(member.lastPlayedDate), 'MMM dd, yyyy')
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
      {leaderboard.hasMore && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </Box>
      )}

      {/* Sync snackbar */}
      <Snackbar
        open={syncing}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right',
        }}
      >
        <Alert severity="info" icon={<CircularProgress size={18} />} variant="filled">
          Syncing club data…
        </Alert>
      </Snackbar>
      <Snackbar
        open={!syncing && (!!syncMessage || !!syncError)}
        autoHideDuration={4000}
        onClose={clearSyncNotification}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right',
        }}
      >
        <Alert
          severity={syncError ? 'error' : 'success'}
          variant="filled"
          onClose={clearSyncNotification}
        >
          {syncError ?? syncMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
