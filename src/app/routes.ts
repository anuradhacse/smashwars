import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { EventDetails } from './pages/EventDetails';
import { ClubLeaderboard } from './pages/ClubLeaderboard';
import { History } from './pages/History';
import { Layout } from './components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'history', Component: History },
      { path: 'event/:eventId', Component: EventDetails },
      { path: 'club', Component: ClubLeaderboard },
    ],
  },
]);
