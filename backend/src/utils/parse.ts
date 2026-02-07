export const toInt = (
  value: string | number | null | undefined,
  fallback = 0
): number => {
  if (value == null) {
    return fallback;
  }
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  if (Number.isNaN(num)) {
    return fallback;
  }
  return Math.round(num);
};

export const toDate = (value: string): Date => {
  const trimmed = value.trim();
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
};

export const toDateOptional = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};
