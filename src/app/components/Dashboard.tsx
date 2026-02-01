import {
  Container,
  Grid,
  Box,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import { PlayerProfile } from './PlayerProfile';
import { RecentMatches } from './RecentMatches';
import { PointsChart } from './PointsChart';
import SportsIcon from '@mui/icons-material/Sports';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { PaletteMode } from '@mui/material';

interface DashboardProps {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

export function Dashboard({ toggleColorMode, mode }: DashboardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: mode === 'dark' ? 'rgba(43, 41, 48, 0.9)' : 'rgba(255, 251, 254, 0.9)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <SportsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {isMobile ? 'TT Stats' : 'Table Tennis Stats Dashboard'}
          </Typography>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 3 },
        }}
      >
        <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
          {/* Player Profile and Club Info */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <PlayerProfile />
          </Grid>

          {/* Points Chart */}
          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <PointsChart />
          </Grid>

          {/* Recent Matches */}
          <Grid size={{ xs: 12 }}>
            <RecentMatches />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
