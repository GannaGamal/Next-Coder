/**
 * Parses an error response from the API and returns a human-readable message.
 * Handles ASP.NET Core Problem Details, Identity error arrays, and plain strings.
 */
export const parseApiError = async (response: Response): Promise<string> => {
  const raw = await response.text();
  return parseErrorText(raw, response.status);
};

/**
 * Parses a raw response text string into a human-readable error message.
 */
export const parseErrorText = (rawText: string, status?: number): string => {
  try {
    const parsed = JSON.parse(rawText);

    // Plain string body
    if (typeof parsed === 'string') return parsed;

    // { message: "..." }
    if (parsed?.message) return parsed.message;

    // Problem Details { title: "..." }
    if (parsed?.title) return parsed.title;

    // Identity error array [{ code, description }]
    if (Array.isArray(parsed) && parsed[0]?.description) {
      return parsed.map((e: { description: string }) => e.description).join(' ');
    }

    // Problem Details with nested errors { errors: { Field: ["msg"] } }
    if (parsed?.errors && typeof parsed.errors === 'object') {
      const msgs: string[] = [];
      Object.values(parsed.errors).forEach((v) => {
        if (Array.isArray(v)) msgs.push(...(v as string[]));
        else if (typeof v === 'string') msgs.push(v);
      });
      if (msgs.length) return msgs.join(' ');
    }
  } catch {
    // not JSON — fall through
  }

  if (rawText && rawText.length < 500) return rawText;
  return `Request failed${status ? ` (${status})` : ''}. Please try again.`;
};

/**
 * Collects all error messages from a failed API response into an array.
 * Useful for registration forms with multiple validation errors.
 */
export const collectApiErrors = async (response: Response): Promise<string[]> => {
  const rawText = await response.text();
  const collected: string[] = [];

  try {
    const data = JSON.parse(rawText);

    if (Array.isArray(data)) {
      data.forEach((e: { description?: string; code?: string }) => {
        const msg = e.description || e.code;
        if (msg) collected.push(msg);
      });
    }

    if (data?.errors && typeof data.errors === 'object') {
      Object.values(data.errors).forEach((msgs) => {
        if (Array.isArray(msgs)) msgs.forEach((m) => { if (m) collected.push(m as string); });
        else if (typeof msgs === 'string') collected.push(msgs);
      });
    }

    if (data?.message && !collected.length) collected.push(data.message);
    if (data?.title && !collected.length) collected.push(data.title);
    if (typeof data === 'string' && !collected.length) collected.push(data);
  } catch {
    if (rawText && rawText.length < 500) collected.push(rawText);
  }

  if (collected.length === 0) {
    collected.push(`Request failed with status ${response.status}. Please try again.`);
  }

  return collected;
};
