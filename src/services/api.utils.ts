export const AUTH_EXPIRED_EVENT = 'nextcoder:auth-expired';

const notifyAuthExpired = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
};

const statusFallbackMessage = (status?: number): string => {
  if (!status) return 'Something went wrong. Please try again.';

  if (status === 400) return 'Please check your input and try again.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'We could not find what you are looking for.';
  if (status === 409) return 'This action conflicts with existing data. Please refresh and try again.';
  if (status === 422) return 'Some submitted values are invalid. Please review and try again.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'A server error occurred. Please try again in a moment.';

  return `Request failed (${status}). Please try again.`;
};

const normalizeMessage = (message: string): string => message.replace(/\s+/g, ' ').trim();

const looksTechnical = (message: string): boolean => {
  const value = message.toLowerCase();
  return (
    value.includes('failed to fetch') ||
    value.includes('networkerror') ||
    value.includes('cors') ||
    value.includes('stack trace') ||
    value.includes('exception') ||
    value.includes('sql') ||
    value.includes('system.')
  );
};

const toUserFriendlyMessage = (candidate: string, status?: number): string => {
  const normalized = normalizeMessage(candidate);

  if (!normalized) {
    return statusFallbackMessage(status);
  }

  if (normalized.length > 220 || looksTechnical(normalized)) {
    return statusFallbackMessage(status);
  }

  return normalized;
};

/**
 * Parses an error response from the API and returns a human-readable message.
 * Handles ASP.NET Core Problem Details, Identity error arrays, and plain strings.
 */
export const parseApiError = async (response: Response): Promise<string> => {
  // If the server rejects an existing token, force client session reset.
  if ((response.status === 401 || response.status === 403) && localStorage.getItem('authToken')) {
    notifyAuthExpired();
  }

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
    if (typeof parsed === 'string') return toUserFriendlyMessage(parsed, status);

    // { message: "..." }
    if (parsed?.message) return toUserFriendlyMessage(parsed.message, status);

    // Problem Details { title: "..." }
    if (parsed?.title) return toUserFriendlyMessage(parsed.title, status);

    // Identity error array [{ code, description }]
    if (Array.isArray(parsed) && parsed[0]?.description) {
      return toUserFriendlyMessage(
        parsed.map((e: { description: string }) => e.description).join(' '),
        status
      );
    }

    // Problem Details with nested errors { errors: { Field: ["msg"] } }
    if (parsed?.errors && typeof parsed.errors === 'object') {
      const msgs: string[] = [];
      Object.values(parsed.errors).forEach((v) => {
        if (Array.isArray(v)) msgs.push(...(v as string[]));
        else if (typeof v === 'string') msgs.push(v);
      });
      if (msgs.length) return toUserFriendlyMessage(msgs.join(' '), status);
    }
  } catch {
    // not JSON — fall through
  }

  if (rawText && rawText.length < 500) return toUserFriendlyMessage(rawText, status);
  return statusFallbackMessage(status);
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
        if (msg) collected.push(toUserFriendlyMessage(msg, response.status));
      });
    }

    if (data?.errors && typeof data.errors === 'object') {
      Object.values(data.errors).forEach((msgs) => {
        if (Array.isArray(msgs)) {
          msgs.forEach((m) => {
            if (m) collected.push(toUserFriendlyMessage(m as string, response.status));
          });
        } else if (typeof msgs === 'string') {
          collected.push(toUserFriendlyMessage(msgs, response.status));
        }
      });
    }

    if (data?.message && !collected.length) {
      collected.push(toUserFriendlyMessage(data.message, response.status));
    }
    if (data?.title && !collected.length) {
      collected.push(toUserFriendlyMessage(data.title, response.status));
    }
    if (typeof data === 'string' && !collected.length) {
      collected.push(toUserFriendlyMessage(data, response.status));
    }
  } catch {
    if (rawText && rawText.length < 500) {
      collected.push(toUserFriendlyMessage(rawText, response.status));
    }
  }

  if (collected.length === 0) {
    collected.push(statusFallbackMessage(response.status));
  }

  return collected;
};
