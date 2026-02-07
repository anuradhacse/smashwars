export type RangeKey = '3m' | '6m' | '12m' | 'all';

export const parseRange = (value?: string): RangeKey => {
  if (!value) {
    return '12m';
  }
  if (value === '3m' || value === '6m' || value === '12m' || value === 'all') {
    return value;
  }
  return '12m';
};

export const getRangeStart = (range: RangeKey): Date | null => {
  if (range === 'all') {
    return null;
  }
  const now = new Date();
  const months = range === '3m' ? 3 : range === '6m' ? 6 : 12;
  const start = new Date(now);
  start.setMonth(start.getMonth() - months);
  return start;
};
