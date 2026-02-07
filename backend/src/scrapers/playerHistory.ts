import { parse } from 'csv-parse/sync';

import { fetchText } from '../utils/http.js';
import { toDate, toInt } from '../utils/parse.js';

export type PlayerHistoryRow = {
  eventId: number;
  eventDate: Date;
  eventName: string;
  initialMean: number;
  initialStDev: number;
  pointChange: number;
  finalMean: number;
  finalStDev: number;
};

export const fetchPlayerHistory = async (
  playerId: number
): Promise<PlayerHistoryRow[]> => {
  const url = `https://www.ratingscentral.com/PlayerHistory.php?CSV_Output=Text&PlayerID=${playerId}`;
  const csv = await fetchText(url);

  const records: Record<string, string>[] = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records
    .map((row) => ({
      eventId: toInt(row.EventID),
      eventDate: toDate(row.EventDate),
      eventName: String(row.EventName ?? '').trim(),
      initialMean: toInt(row.InitialMean),
      initialStDev: toInt(row.InitialStDev),
      pointChange: toInt(row.PointChange),
      finalMean: toInt(row.FinalMean),
      finalStDev: toInt(row.FinalStDev),
    }))
    .filter((row) => row.eventId);
};
