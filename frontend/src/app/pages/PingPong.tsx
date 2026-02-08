import { Box, Container, Typography } from '@mui/material';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

export function PingPong() {
  const { RiveComponent } = useRive({
    src: '/ping-pong.riv',
    autoplay: true,
    stateMachines: 'State Machine 1',
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  return (
    <Box sx={{ bgcolor: '#111', minHeight: '100%' }}>
      <Container maxWidth="sm" sx={{ py: { xs: 3, md: 6 }, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#fff' }}>
          🏓 Ping Pong Zone
        </Typography>
        <Box
          sx={{
            width: '100%',
            aspectRatio: '3 / 4',
            maxWidth: 480,
            mx: 'auto',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <RiveComponent style={{ width: '100%', height: '100%' }} />
        </Box>
        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.5)' }}>
          Click and drag the blue paddle
        </Typography>
      </Container>
    </Box>
  );
}
