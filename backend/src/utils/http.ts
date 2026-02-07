const DEFAULT_TIMEOUT_MS = 15000;

export const fetchText = async (
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'table-tennis-ratings/0.1',
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
};
