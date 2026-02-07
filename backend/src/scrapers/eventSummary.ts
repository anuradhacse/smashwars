import { parse } from 'csv-parse/sync';

import { fetchText } from '../utils/http.js';
import { toInt } from '../utils/parse.js';

export type EventSummaryRow = {
  playerId: number;
  playerName: string;
  playerCountry?: string;
  initialMean: number;
  initialStDev: number;
  pointChange: number;
  finalMean: number;
  finalStDev: number;
};

export const fetchEventSummary = async (
  eventId: number
): Promise<EventSummaryRow[]> => {
  const url = `https://www.ratingscentral.com/EventSummary.php?CSV_Output=Text&EventID=${eventId}&SortBy=Name`;
  const csv = await fetchText(url);

  const records: Record<string, string>[] = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records
    .map((row) => ({
      playerId: toInt(row.PlayerID),
      playerName: String(row.PlayerName ?? '').trim(),
      playerCountry: row.PlayerCountry
        ? String(row.PlayerCountry).trim()
        : undefined,
      initialMean: toInt(row.InitialMean),
      initialStDev: toInt(row.InitialStDev),
      pointChange: toInt(row.PointChange),
      finalMean: toInt(row.FinalMean),
      finalStDev: toInt(row.FinalStDev),
    }))
    .filter((row) => row.playerId);
};
