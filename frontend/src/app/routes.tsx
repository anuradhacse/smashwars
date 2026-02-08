import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { EventDetails } from './pages/EventDetails';
import { ClubLeaderboard } from './pages/ClubLeaderboard';
import { History } from './pages/History';
import { PingPong } from './pages/PingPong';
import { Layout } from './components/Layout';
import { PlayerLanding } from './pages/PlayerLanding';
import { RouteError } from './pages/RouteError';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    errorElement: <RouteError />,
    children: [
      { index: true, Component: PlayerLanding },
      { path: 'players/:playerId', Component: Home },
      { path: 'players/:playerId/history', Component: History },
      { path: 'players/:playerId/event/:eventId', Component: EventDetails },
      { path: 'players/:playerId/club', Component: ClubLeaderboard },
      { path: 'ping-pong', Component: PingPong },
    ],
  },
]);
