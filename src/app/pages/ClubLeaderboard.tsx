import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { api } from '@/app/api/client';
import type { ClubLeaderboard as ClubLeaderboardType } from '@/app/api/types';
import { DEFAULT_CLUB_ID, DEFAULT_PLAYER_ID } from '@/app/config';

export function ClubLeaderboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scope, setScope] = useState<'all' | 'primary'>('all');
  const [leaderboard, setLeaderboard] = useState<ClubLeaderboardType | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await api.getClubLeaderboard(DEFAULT_CLUB_ID, scope);
      if (active) {
        setLeaderboard(data);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [scope]);

  const filteredMembers = useMemo(() => {
    if (!leaderboard) return [];
    const query = search.trim().toLowerCase();
    const members = leaderboard.members;
    if (!query) return members;
    return members.filter((member) => member.name.toLowerCase().includes(query));
  }, [leaderboard, search]);

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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Club Leaderboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {leaderboard.name}
        </Typography>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <ToggleButtonGroup
          value={scope}
          exclusive
          onChange={(event, newValue) => newValue && setScope(newValue)}
          size="small"
        >
          <ToggleButton value="all">All Members</ToggleButton>
          <ToggleButton value="primary">Primary Members</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small"
          placeholder="Search players"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ maxWidth: 280 }}
        />
      </Box>

      {/* Leaderboard */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredMembers.map((member) => (
            <Card
              key={member.playerId}
              sx={{
                bgcolor: member.playerId === DEFAULT_PLAYER_ID ? 'primary.dark' : 'background.paper',
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
                  Last played: {member.lastPlayedDate ? format(new Date(member.lastPlayedDate), 'MMM dd, yyyy') : '—'}
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
                    bgcolor: member.playerId === DEFAULT_PLAYER_ID ? 'primary.dark' : 'inherit',
                    '& td': {
                        color: member.playerId === DEFAULT_PLAYER_ID ? 'white' : 'inherit',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>#{member.rank}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{member.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.rating.mean} <span style={{ opacity: 0.7 }}>±{member.rating.stdev}</span>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {member.lastPlayedDate ? format(new Date(member.lastPlayedDate), 'MMM dd, yyyy') : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Container>
  );
}
