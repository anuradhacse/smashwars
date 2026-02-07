// Mock data for the table tennis stats dashboard

export interface Player {
  id: string;
  name: string;
  club: string;
  rating: number;
  uncertainty: number;
  lastPlayed: string;
}

export interface RankedPlayer extends Player {
  rank: number;
}

export interface RatingPoint {
  date: string;
  rating: number;
  uncertainty: number;
}

export interface Match {
  id: string;
  opponentId: number;
  opponentName: string;
  result: 'win' | 'loss';
  score: string;
  ratingDelta: number;
  opponentMean: number;
  opponentStDev: number;
  date: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  initialRating: number;
  finalRating: number;
  ratingChange: number;
  matches: Match[];
}

export const currentPlayer: Player = {
  id: '156412',
  name: 'Jayalath, Jay',
  club: 'Penicuik Table Tennis Club',
  rating: 1005,
  uncertainty: 41,
  lastPlayed: '2026-01-19',
};

export const ratingHistory: RatingPoint[] = [
  { date: '2025-07-19', rating: 987, uncertainty: 52 },
  { date: '2025-08-02', rating: 993, uncertainty: 50 },
  { date: '2025-08-16', rating: 989, uncertainty: 49 },
  { date: '2025-08-30', rating: 996, uncertainty: 48 },
  { date: '2025-09-13', rating: 1001, uncertainty: 47 },
  { date: '2025-09-27', rating: 1008, uncertainty: 46 },
  { date: '2025-10-11', rating: 1003, uncertainty: 45 },
  { date: '2025-10-25', rating: 1012, uncertainty: 44 },
  { date: '2025-11-08', rating: 1007, uncertainty: 43 },
  { date: '2025-11-22', rating: 1015, uncertainty: 42 },
  { date: '2025-12-06', rating: 1012, uncertainty: 42 },
  { date: '2025-12-20', rating: 998, uncertainty: 41 },
  { date: '2026-01-03', rating: 1002, uncertainty: 41 },
  { date: '2026-01-19', rating: 1005, uncertainty: 41 },
];

export const recentEvents: Event[] = [
  {
    id: '1001',
    name: 'Penicuik League Night',
    date: '2026-01-19',
    initialRating: 1002,
    finalRating: 1005,
    ratingChange: 3,
    matches: [
      {
        id: 'm1',
        opponentId: 20011,
        opponentName: 'Smith, John',
        result: 'win',
        score: '11-5 11-4 11-5',
        ratingDelta: 5,
        opponentMean: 1012,
        opponentStDev: 39,
        date: '2026-01-19',
      },
      {
        id: 'm2',
        opponentId: 20024,
        opponentName: 'Williams, Sarah',
        result: 'loss',
        score: '9-11 3-11 5-11',
        ratingDelta: -2,
        opponentMean: 1036,
        opponentStDev: 36,
        date: '2026-01-19',
      },
    ],
  },
  {
    id: '1002',
    name: 'Edinburgh Open',
    date: '2026-01-03',
    initialRating: 998,
    finalRating: 1002,
    ratingChange: 4,
    matches: [
      {
        id: 'm3',
        opponentId: 20102,
        opponentName: 'Brown, Mike',
        result: 'win',
        score: '11-9 9-11 11-7 8-11 11-6',
        ratingDelta: 7,
        opponentMean: 1004,
        opponentStDev: 42,
        date: '2026-01-03',
      },
      {
        id: 'm4',
        opponentId: 20119,
        opponentName: 'Davis, Emma',
        result: 'win',
        score: '11-7 11-6 11-8',
        ratingDelta: 6,
        opponentMean: 986,
        opponentStDev: 45,
        date: '2026-01-03',
      },
      {
        id: 'm5',
        opponentId: 20133,
        opponentName: 'Johnson, Alex',
        result: 'loss',
        score: '8-11 6-11 7-11',
        ratingDelta: -9,
        opponentMean: 1058,
        opponentStDev: 34,
        date: '2026-01-03',
      },
    ],
  },
  {
    id: '1003',
    name: 'Winter Championship',
    date: '2025-12-20',
    initialRating: 1012,
    finalRating: 998,
    ratingChange: -14,
    matches: [
      {
        id: 'm6',
        opponentId: 20204,
        opponentName: 'Taylor, Chris',
        result: 'loss',
        score: '11-9 7-11 9-11 11-8 8-11',
        ratingDelta: -8,
        opponentMean: 1046,
        opponentStDev: 37,
        date: '2025-12-20',
      },
      {
        id: 'm7',
        opponentId: 20218,
        opponentName: 'Anderson, Pat',
        result: 'loss',
        score: '9-11 11-7 6-11 8-11',
        ratingDelta: -6,
        opponentMean: 1092,
        opponentStDev: 33,
        date: '2025-12-20',
      },
    ],
  },
  {
    id: '1004',
    name: 'Penicuik League Night',
    date: '2025-12-06',
    initialRating: 1015,
    finalRating: 1012,
    ratingChange: -3,
    matches: [
      {
        id: 'm8',
        opponentId: 20302,
        opponentName: 'Wilson, Tom',
        result: 'win',
        score: '11-9 9-11 11-6 11-4',
        ratingDelta: 4,
        opponentMean: 1088,
        opponentStDev: 34,
        date: '2025-12-06',
      },
      {
        id: 'm9',
        opponentId: 20316,
        opponentName: 'Moore, Lisa',
        result: 'loss',
        score: '11-7 8-11 9-11 11-9 7-11',
        ratingDelta: -7,
        opponentMean: 1102,
        opponentStDev: 32,
        date: '2025-12-06',
      },
    ],
  },
  {
    id: '1005',
    name: 'Scottish Regional',
    date: '2025-11-22',
    initialRating: 1007,
    finalRating: 1015,
    ratingChange: 8,
    matches: [
      {
        id: 'm10',
        opponentId: 20408,
        opponentName: 'Clark, James',
        result: 'win',
        score: '11-6 11-8 11-5',
        ratingDelta: 9,
        opponentMean: 988,
        opponentStDev: 44,
        date: '2025-11-22',
      },
      {
        id: 'm11',
        opponentId: 20421,
        opponentName: 'Young, Rachel',
        result: 'loss',
        score: '9-11 11-8 8-11 6-11',
        ratingDelta: -1,
        opponentMean: 1024,
        opponentStDev: 41,
        date: '2025-11-22',
      },
    ],
  },
];

export const clubMembers: RankedPlayer[] = [
  {
    id: '2001',
    name: 'Anderson, Pat',
    club: 'Penicuik Table Tennis Club',
    rating: 1245,
    uncertainty: 35,
    lastPlayed: '2026-01-20',
  },
  {
    id: '2002',
    name: 'Wilson, Tom',
    club: 'Penicuik Table Tennis Club',
    rating: 1198,
    uncertainty: 38,
    lastPlayed: '2026-01-19',
  },
  {
    id: '2003',
    name: 'Moore, Lisa',
    club: 'Penicuik Table Tennis Club',
    rating: 1156,
    uncertainty: 40,
    lastPlayed: '2026-01-18',
  },
  // ... add more members
  {
    id: currentPlayer.id,
    name: 'Jayalath, Jay',
    club: 'Penicuik Table Tennis Club',
    rating: 1005,
    uncertainty: 41,
    lastPlayed: '2026-01-19',
  },
  // ... add more members
  {
    id: '2068',
    name: 'Taylor, Ben',
    club: 'Penicuik Table Tennis Club',
    rating: 723,
    uncertainty: 55,
    lastPlayed: '2025-12-15',
  },
]
  .sort((a, b) => b.rating - a.rating)
  .map((p, i) => ({ ...p, rank: i + 1 }));
