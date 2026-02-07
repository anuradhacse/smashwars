import { Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DEFAULT_PLAYER_ID } from '@/app/config';

export function PlayerLanding() {
  const navigate = useNavigate();
  const [playerId, setPlayerId] = useState(String(DEFAULT_PLAYER_ID));

  const submit = () => {
    const id = Number(playerId);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }
    localStorage.setItem('lastPlayerId', String(id));
    navigate(`/players/${id}`);
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Enter Player ID
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use your RatingsCentral PlayerID to load stats and history.
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Player ID"
              value={playerId}
              onChange={(event) => setPlayerId(event.target.value)}
              inputMode="numeric"
            />
            <Stack direction="row" spacing={1.5}>
              <Button variant="contained" onClick={submit}>
                Load player
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/players/${DEFAULT_PLAYER_ID}`)}
              >
                Use sample (156412)
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          size="small"
          onClick={() => {
            const last = localStorage.getItem('lastPlayerId');
            if (last) {
              navigate(`/players/${last}`);
            }
          }}
        >
          Open last player
        </Button>
      </Box>
    </Container>
  );
}
