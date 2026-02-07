import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';

export function PlayerProfile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const playerData = {
    name: 'Alex Morgan',
    rating: 2145,
    rank: 12,
    club: 'City Table Tennis Club',
    location: 'San Francisco, CA',
    gamesPlayed: 156,
    wins: 98,
    losses: 58,
    winRate: 62.8,
    bestRating: 2189,
    memberId: 'TT-2024-1547',
  };

  return (
    <Card sx={{ height: '100%', overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Player Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', sm: 'center', md: 'flex-start' },
            mb: { xs: 2, sm: 3 },
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: { xs: 64, sm: 80, md: 72 },
              height: { xs: 64, sm: 80, md: 72 },
              background: 'linear-gradient(135deg, #D0BCFF 0%, #9A82DB 100%)',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '1.75rem' },
            }}
          >
            <PersonIcon fontSize={isMobile ? 'medium' : 'large'} />
          </Avatar>
          <Box
            sx={{
              flex: { xs: 1, sm: 'initial', md: 1 },
              textAlign: { xs: 'left', sm: 'center', md: 'left' },
            }}
          >
            <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom sx={{ mb: 0.5 }}>
              {playerData.name}
            </Typography>
            <Chip
              label={`${playerData.rating}`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.875rem' }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

        {/* Rank and Best Rating */}
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(208, 188, 255, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon
                sx={{ color: 'warning.main', mr: 1, fontSize: { xs: 20, sm: 24 } }}
              />
              <Typography variant="body2" color="text.secondary">
                Club Rank
              </Typography>
            </Box>
            <Typography variant="h6" color="primary" fontWeight={700}>
              #{playerData.rank}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(166, 211, 136, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: { xs: 20, sm: 24 } }} />
              <Typography variant="body2" color="text.secondary">
                Best Rating
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {playerData.bestRating}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

        {/* Club Information */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            sx={{
              mb: 1.5,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
            }}
          >
            Club Information
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'start',
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(204, 194, 220, 0.08)',
            }}
          >
            <GroupsIcon
              sx={{ color: 'primary.main', mr: 1.5, mt: 0.5, fontSize: { xs: 20, sm: 24 } }}
            />
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {playerData.club}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {playerData.location}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}
              >
                ID: {playerData.memberId}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

        {/* Statistics Grid */}
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            sx={{
              mb: 1.5,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
            }}
          >
            Season Statistics
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                background:
                  'linear-gradient(135deg, rgba(208, 188, 255, 0.15) 0%, rgba(208, 188, 255, 0.05) 100%)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(208, 188, 255, 0.2)',
              }}
            >
              <Typography variant={isMobile ? 'h6' : 'h5'} color="primary" fontWeight={700}>
                {playerData.gamesPlayed}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Games
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                background:
                  'linear-gradient(135deg, rgba(166, 211, 136, 0.15) 0%, rgba(166, 211, 136, 0.05) 100%)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(166, 211, 136, 0.2)',
              }}
            >
              <Typography variant={isMobile ? 'h6' : 'h5'} color="success.main" fontWeight={700}>
                {playerData.wins}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Wins
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                background:
                  'linear-gradient(135deg, rgba(242, 184, 181, 0.15) 0%, rgba(242, 184, 181, 0.05) 100%)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(242, 184, 181, 0.2)',
              }}
            >
              <Typography variant={isMobile ? 'h6' : 'h5'} color="error.main" fontWeight={700}>
                {playerData.losses}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Losses
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                background:
                  'linear-gradient(135deg, rgba(204, 194, 220, 0.15) 0%, rgba(204, 194, 220, 0.05) 100%)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(204, 194, 220, 0.2)',
              }}
            >
              <Typography variant={isMobile ? 'h6' : 'h5'} color="secondary.main" fontWeight={700}>
                {playerData.winRate}%
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Win Rate
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
