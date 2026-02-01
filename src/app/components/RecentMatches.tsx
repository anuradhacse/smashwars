import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Match {
  id: number;
  date: string;
  opponent: string;
  opponentRating: number;
  result: 'win' | 'loss';
  score: string;
  pointsChange: number;
  tournament: string;
}

export function RecentMatches() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const matches: Match[] = [
    {
      id: 1,
      date: '2026-01-22',
      opponent: 'Sarah Chen',
      opponentRating: 2156,
      result: 'win',
      score: '3-1',
      pointsChange: 18,
      tournament: 'City Championship',
    },
    {
      id: 2,
      date: '2026-01-20',
      opponent: 'Marcus Johnson',
      opponentRating: 2201,
      result: 'loss',
      score: '1-3',
      pointsChange: -12,
      tournament: 'City Championship',
    },
    {
      id: 3,
      date: '2026-01-18',
      opponent: 'Emma Williams',
      opponentRating: 2089,
      result: 'win',
      score: '3-0',
      pointsChange: 15,
      tournament: 'Weekly League',
    },
    {
      id: 4,
      date: '2026-01-15',
      opponent: 'David Park',
      opponentRating: 2178,
      result: 'win',
      score: '3-2',
      pointsChange: 22,
      tournament: 'Weekly League',
    },
    {
      id: 5,
      date: '2026-01-13',
      opponent: 'Lisa Anderson',
      opponentRating: 2145,
      result: 'loss',
      score: '2-3',
      pointsChange: -14,
      tournament: 'Club Match',
    },
    {
      id: 6,
      date: '2026-01-11',
      opponent: 'James Brown',
      opponentRating: 2098,
      result: 'win',
      score: '3-1',
      pointsChange: 16,
      tournament: 'Club Match',
    },
    {
      id: 7,
      date: '2026-01-08',
      opponent: 'Nina Patel',
      opponentRating: 2189,
      result: 'loss',
      score: '0-3',
      pointsChange: -10,
      tournament: 'Regional Open',
    },
    {
      id: 8,
      date: '2026-01-06',
      opponent: 'Tom Wilson',
      opponentRating: 2067,
      result: 'win',
      score: '3-0',
      pointsChange: 14,
      tournament: 'Regional Open',
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isSmallMobile) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Mobile card view
  if (isMobile) {
    return (
      <Card sx={{ overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" fontWeight={700}>
              Recent Matches
            </Typography>
          </Box>

          <Stack spacing={2}>
            {matches.map((match) => (
              <Box
                key={match.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor:
                    match.result === 'win'
                      ? 'rgba(166, 211, 136, 0.05)'
                      : 'rgba(242, 184, 181, 0.05)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        background:
                          'linear-gradient(135deg, rgba(204, 194, 220, 0.3) 0%, rgba(204, 194, 220, 0.1) 100%)',
                        color: 'secondary.main',
                        fontSize: '0.875rem',
                        mr: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      {match.opponent
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {match.opponent}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rating: {match.opponentRating}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={match.result.toUpperCase()}
                    color={match.result === 'win' ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 700, minWidth: 55 }}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(match.date)}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Score: {match.score}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1.5,
                      bgcolor:
                        match.pointsChange > 0
                          ? 'rgba(166, 211, 136, 0.15)'
                          : 'rgba(242, 184, 181, 0.15)',
                    }}
                  >
                    {match.pointsChange > 0 ? (
                      <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5, color: 'error.main' }} />
                    )}
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: match.pointsChange > 0 ? 'success.main' : 'error.main' }}
                    >
                      {match.pointsChange > 0 ? '+' : ''}
                      {match.pointsChange}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  {match.tournament}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Desktop table view
  return (
    <Card sx={{ overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Recent Matches
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  Opponent
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  Rating
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  Result
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  Score
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  Points
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  Tournament
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.map((match) => (
                <TableRow
                  key={match.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      bgcolor:
                        match.result === 'win'
                          ? 'rgba(166, 211, 136, 0.05)'
                          : 'rgba(242, 184, 181, 0.05)',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(match.date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          background:
                            'linear-gradient(135deg, rgba(204, 194, 220, 0.3) 0%, rgba(204, 194, 220, 0.1) 100%)',
                          color: 'secondary.main',
                          fontSize: '0.875rem',
                          mr: 1.5,
                          fontWeight: 600,
                        }}
                      >
                        {match.opponent
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {match.opponent}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={match.opponentRating}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(204, 194, 220, 0.15)',
                        color: 'text.primary',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: 'rgba(204, 194, 220, 0.3)',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={match.result.toUpperCase()}
                      color={match.result === 'win' ? 'success' : 'error'}
                      size="small"
                      sx={{ fontWeight: 700, minWidth: 60 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={600}>
                      {match.score}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor:
                          match.pointsChange > 0
                            ? 'rgba(166, 211, 136, 0.15)'
                            : 'rgba(242, 184, 181, 0.15)',
                      }}
                    >
                      {match.pointsChange > 0 ? (
                        <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
                      ) : (
                        <TrendingDownIcon sx={{ fontSize: 18, mr: 0.5, color: 'error.main' }} />
                      )}
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: match.pointsChange > 0 ? 'success.main' : 'error.main' }}
                      >
                        {match.pointsChange > 0 ? '+' : ''}
                        {match.pointsChange}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {match.tournament}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
