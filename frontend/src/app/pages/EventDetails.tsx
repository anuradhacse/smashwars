import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate, useParams } from 'react-router';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { api } from '@/app/api/client';
import type { EventDetailsForPlayer } from '@/app/api/types';
import { DEFAULT_PLAYER_ID } from '@/app/config';

type ParsedSetScore = {
  playerScore: number;
  opponentScore: number;
};

const parseScoreToken = (token: string): ParsedSetScore | null => {
  if (!token) return null;
  if (/^\d+-\d+$/.test(token)) {
    const [playerScoreRaw, opponentScoreRaw] = token.split('-').map((value) => Number(value));
    if (!Number.isFinite(playerScoreRaw) || !Number.isFinite(opponentScoreRaw)) return null;
    return { playerScore: playerScoreRaw, opponentScore: opponentScoreRaw };
  }

  const value = Number(token);
  if (!Number.isFinite(value)) return null;

  const absValue = Math.abs(value);
  const winnerScore = Math.max(11, absValue + 2);
  const loserScore = absValue;
  const playerScore = value >= 0 ? winnerScore : loserScore;
  const opponentScore = value >= 0 ? loserScore : winnerScore;

  return { playerScore, opponentScore };
};

const parseSetScores = (score: string): ParsedSetScore[] =>
  score
    .split(/[\s,]+/)
    .map((token) => parseScoreToken(token))
    .filter((setScore): setScore is ParsedSetScore => Boolean(setScore));

export function EventDetails() {
  const navigate = useNavigate();
  const { eventId, playerId: playerIdParam } = useParams();
  const playerId = Number(playerIdParam ?? DEFAULT_PLAYER_ID);
  const [details, setDetails] = useState<EventDetailsForPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getEventDetailsForPlayer(Number(eventId), playerId);
        if (active) {
          setDetails(data);
        }
      } catch {
        if (active) {
          setError('Unable to load event details.');
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
  }, [eventId, playerId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 2 }} />
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Skeleton variant="text" width={180} />
            <Skeleton variant="text" width={240} height={36} />
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error || !details) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Unable to load event
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {error ?? 'Please try again later.'}
            </Typography>
            <Chip
              label="Back to dashboard"
              onClick={() => navigate('/')}
              sx={{ cursor: 'pointer' }}
            />
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(`/players/${playerId}`)}
          sx={{ mr: 2 }}
          aria-label="Back to dashboard"
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {details.event.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(details.event.date), 'MMMM dd, yyyy')}
          </Typography>
        </Box>
      </Box>

      {/* Event Rating Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Event Rating Summary
          </Typography>
          {details.summary ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Initial Rating
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {details.summary.initial.mean}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                  {details.summary.totalChange >= 0 ? (
                    <ArrowUpwardIcon color="success" sx={{ fontSize: 40 }} />
                  ) : (
                    <ArrowDownwardIcon color="error" sx={{ fontSize: 40 }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Final Rating
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {details.summary.final.mean}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`Total Change: ${details.summary.totalChange > 0 ? '+' : ''}${details.summary.totalChange}`}
                color={details.summary.totalChange >= 0 ? 'success' : 'error'}
                sx={{ fontWeight: 700, fontSize: '1rem', py: 2.5, px: 1 }}
              />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Event summary not available.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Event insights
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip label={`Wins: ${details.insights.wins}`} />
            <Chip label={`Losses: ${details.insights.losses}`} />
            {details.insights.avgOpponentMean !== null && (
              <Chip label={`Avg opponent rating: ${details.insights.avgOpponentMean}`} />
            )}
            {details.insights.bestWin && (
              <Chip
                label={`Best win vs ${details.insights.bestWin.opponent.name ?? `Player ${details.insights.bestWin.opponent.playerId}`}`}
                color="success"
              />
            )}
            {details.insights.toughestLoss && (
              <Chip
                label={`Toughest loss vs ${details.insights.toughestLoss.opponent.name ?? `Player ${details.insights.toughestLoss.opponent.playerId}`}`}
                color="warning"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Match Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Match breakdown
          </Typography>
          <List sx={{ p: 0 }}>
            {details.matches.map((match, index) => {
              const sets = parseSetScores(match.score);
              const setsWon = sets.filter((s) => s.playerScore > s.opponentScore).length;
              const setsLost = sets.filter((s) => s.playerScore < s.opponentScore).length;

              return (
                <Box key={`${match.opponent.playerId}-${index}`}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                            gap: 1,
                          }}
                        >
                          <Typography variant="body1" noWrap sx={{ fontWeight: 600, minWidth: 0 }}>
                            {match.result === 'W' ? 'Won vs' : 'Lost to'}{' '}
                            {match.opponent.name ?? `Player ${match.opponent.playerId}`}
                            {sets.length > 0 && (
                              <Box
                                component="span"
                                sx={{
                                  color: 'text.secondary',
                                  fontWeight: 400,
                                  fontSize: '0.875rem',
                                }}
                              >
                                {' '}
                                ({setsWon}–{setsLost})
                              </Box>
                            )}
                          </Typography>
                          <Chip
                            label={`${match.delta > 0 ? '+' : ''}${match.delta} pts`}
                            color={match.result === 'W' ? 'success' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 700, flexShrink: 0 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Opponent rating: {match.opponentRating.mean} ±
                            {match.opponentRating.stdev}
                          </Typography>
                          {sets.length > 0 && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                Sets
                              </Typography>
                              {sets.map((setScore, setIndex) => {
                                const isSetWin = setScore.playerScore > setScore.opponentScore;
                                const isSetLoss = setScore.playerScore < setScore.opponentScore;
                                const chipColor = isSetWin
                                  ? 'success'
                                  : isSetLoss
                                    ? 'warning'
                                    : 'default';

                                return (
                                  <Chip
                                    key={`${match.opponent.playerId}-${setIndex}`}
                                    label={`${setScore.playerScore} – ${setScore.opponentScore}`}
                                    size="small"
                                    color={chipColor === 'default' ? undefined : chipColor}
                                    variant={chipColor === 'default' ? 'outlined' : 'filled'}
                                    sx={{ fontWeight: 600 }}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < details.matches.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
}
