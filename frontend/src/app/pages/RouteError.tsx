import { Box, Button, Card, CardContent, Container, Typography } from '@mui/material';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';

export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Unexpected error.';

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {message}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="contained" onClick={() => navigate('/')}>
              Go to player search
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
