import { Buffer } from 'node:buffer';

type CursorPayload = {
  eventDate: string;
  eventId: number;
};

export const encodeCursor = (payload: CursorPayload): string =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

export const decodeCursor = (cursor?: string): CursorPayload | null => {
  if (!cursor) {
    return null;
  }
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8');
    return JSON.parse(json) as CursorPayload;
  } catch {
    return null;
  }
};
