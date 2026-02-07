import { parse } from 'csv-parse/sync';

import { fetchText } from '../utils/http.js';
import { toInt } from '../utils/parse.js';

export type EventDetailRow = {
  winnerId: number;
  loserId: number;
  score: string;
  winnerDelta: number;
  winnerOppMean: number;
  winnerOppStDev: number;
  loserDelta: number;
  loserOppMean: number;
  loserOppStDev: number;
  matchesPairPlayed: number;
};

export const fetchEventDetail = async (
  eventId: number
): Promise<EventDetailRow[]> => {
  const url = `https://www.ratingscentral.com/EventDetail.php?CSV_Output=Text&EventID=${eventId}`;
  const csv = await fetchText(url);

  const records: Record<string, string>[] = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records
    .map((row) => ({
      winnerId: toInt(row.WinnerID),
      loserId: toInt(row.LoserID),
      score: String(row.Score ?? '').trim(),
      winnerDelta: toInt(row.WinnerDelta),
      winnerOppMean: toInt(row.WinnerOpponentMean),
      winnerOppStDev: toInt(row.WinnerOpponentStDev),
      loserDelta: toInt(row.LoserDelta),
      loserOppMean: toInt(row.LoserOpponentMean),
      loserOppStDev: toInt(row.LoserOpponentStDev),
      matchesPairPlayed: toInt(row.MatchesPairPlayed),
    }))
    .filter((row) => row.winnerId || row.loserId);
};
