import { Box, Button, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { useState } from 'react';

export function PingPong() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [started, setStarted] = useState(!isMobile);

  const { RiveComponent, rive } = useRive({
    src: '/ping-pong.riv',
    autoplay: !isMobile,
    stateMachines: 'State Machine 1',
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  const handleStart = () => {
    setStarted(true);
    rive?.play();
  };

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
            position: 'relative',
          }}
        >
          <RiveComponent style={{ width: '100%', height: '100%' }} />
          {!started && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.6)',
              }}
            >
              <Button variant="contained" size="large" onClick={handleStart}>
                Tap to play
              </Button>
            </Box>
          )}
        </Box>
        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.5)' }}>
          Press and drag the blue paddle
        </Typography>
      </Container>
    </Box>
  );
}
