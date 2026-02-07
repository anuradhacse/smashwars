import * as cheerio from 'cheerio';

import { fetchText } from '../utils/http.js';
import { toDateOptional, toInt } from '../utils/parse.js';

export type ClubRosterEntry = {
  playerId: number;
  rank?: number;
  displayName: string;
  ratingMean?: number;
  ratingStDev?: number;
  lastPlayedDate?: Date | null;
};

const parseRating = (
  value: string | undefined
): { mean?: number; stdev?: number } => {
  if (!value) {
    return {};
  }
  // RatingsCentral inserts zero-width spaces (U+200B) between mean and ±
  const trimmed = value.replace(/[\s\u200B]+/g, ' ').trim();
  const match = trimmed.match(/(\d+)\s*±\s*(\d+)/);
  if (match) {
    return { mean: toInt(match[1]), stdev: toInt(match[2]) };
  }
  const numeric = trimmed.match(/(\d+)/);
  if (numeric) {
    return { mean: toInt(numeric[1]) };
  }
  return {};
};

export const fetchClubRoster = async (
  clubId: number,
  clubName = 'Club'
): Promise<ClubRosterEntry[]> => {
  const heading = encodeURIComponent(`All Members of ${clubName}`);
  const url = `https://www.ratingscentral.com/PlayerList.php?ClubID=${clubId}&MatchNonPrimary=Yes&PlayerSport=1&SortOrder=Rating&Heading=${heading}`;
  const html = await fetchText(url);
  const $ = cheerio.load(html);

  const table = $('table')
    .filter((_, el) => {
      const headerText = $(el).find('th').text().toLowerCase();
      return (
        headerText.includes('rank') &&
        headerText.includes('rating') &&
        headerText.includes('name')
      );
    })
    .first();

  if (!table.length) {
    throw new Error('Club roster table not found.');
  }

  const rows: ClubRosterEntry[] = [];

  table.find('tr').each((_, row) => {
    const cells = $(row).find('td');
    if (!cells.length) {
      return;
    }

    const rankText = $(cells[0]).text().trim();
    const ratingText = $(cells[1]).text().trim();
    const nameCell = $(cells[2]);
    const lastPlayedText = $(cells[4]).text().trim();

    const link = nameCell.find('a').first();
    const href = link.attr('href') ?? '';
    const idMatch = href.match(/PlayerID=(\d+)/i);
    const playerId = idMatch ? toInt(idMatch[1]) : 0;
    const displayName = link.text().trim() || nameCell.text().trim();

    if (!playerId || !displayName) {
      return;
    }

    const { mean, stdev } = parseRating(ratingText);

    rows.push({
      playerId,
      rank: rankText ? toInt(rankText) : undefined,
      displayName,
      ratingMean: mean,
      ratingStDev: stdev,
      lastPlayedDate: toDateOptional(lastPlayedText),
    });
  });

  return rows;
};
