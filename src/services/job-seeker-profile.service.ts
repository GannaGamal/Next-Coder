import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface JobSeekerProfileDto {
  id?: number | string;
  userId?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  experience?: string;
  education?: string;
  bio?: string;
  cvUrl?: string;
  skills?: string[];
  skillNames?: string[];
}

const getToken = () => localStorage.getItem('authToken') ?? '';
const isNumericId = (value: string) => /^\d+$/.test(value.trim());

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'We could not load your profile right now. Please try again.';
};

const fetchProfileByPathId = async (id: string): Promise<JobSeekerProfileDto> => {
  const token = getToken();

  const response = await fetch(`${API_BASE}/JobSeeker/profile/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  const raw = await response.text();
  if (!raw.trim()) return {};

  try {
    return JSON.parse(raw) as JobSeekerProfileDto;
  } catch {
    return {};
  }
};

/**
 * Uses login response userId first (as requested), then falls back to jobSeekerId
 * when backend requires numeric job seeker identifier.
 */
export const getJobSeekerProfile = async (
  userId: string,
  fallbackJobSeekerId?: string | null
): Promise<JobSeekerProfileDto> => {
  const hasFallback = !!fallbackJobSeekerId && fallbackJobSeekerId !== userId;

  // Backend validates {jobSeekerId} as integer; avoid a noisy guaranteed 400 call.
  if (!isNumericId(userId) && hasFallback) {
    return fetchProfileByPathId(String(fallbackJobSeekerId));
  }

  try {
    return await fetchProfileByPathId(userId);
  } catch (err) {
    const msg = getErrorMessage(err).toLowerCase();
    const shouldFallback =
      hasFallback &&
      (msg.includes('not valid') || msg.includes('validation') || msg.includes('bad request'));

    if (shouldFallback) {
      return fetchProfileByPathId(String(fallbackJobSeekerId));
    }

    throw err;
  }
};
