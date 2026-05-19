import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface FreelancerProfileDto {
  title?: string | null;
  hourlyRate?: number | null;
  country?: string | null;
  phoneNumber?: string | null;
  yearsOfExperience?: number | null;
  isAvailable?: boolean | null;
  websiteUrl?: string | null;
  bio?: string | null;
  linkedInUrl?: string | null;
  gitHubUrl?: string | null;
}

export interface UpdateFreelancerProfilePayload {
  title: string;
  hourlyRate: number;
  country: string;
  phoneNumber: string;
  yearsOfExperience: number;
  isAvailable: boolean;
  websiteUrl: string;
  bio: string;
  linkedInUrl: string;
  gitHubUrl: string;
}

export interface UpdateFreelancerProfileResult {
  profile: UpdateFreelancerProfilePayload;
  message: string;
}

const getToken = () => localStorage.getItem('authToken') ?? '';

const toNullableTrimmedString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const toNullableBoolean = (value: unknown): boolean | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;

  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;

  return null;
};

const toProfileDto = (raw: Record<string, unknown>): FreelancerProfileDto => ({
  title: toNullableTrimmedString(raw.title ?? raw.Title),
  hourlyRate: toNullableNumber(raw.hourlyRate ?? raw.HourlyRate),
  country: toNullableTrimmedString(raw.country ?? raw.Country),
  phoneNumber: toNullableTrimmedString(raw.phoneNumber ?? raw.PhoneNumber),
  yearsOfExperience: toNullableNumber(raw.yearsOfExperience ?? raw.YearsOfExperience),
  isAvailable: toNullableBoolean(raw.isAvailable ?? raw.IsAvailable),
  websiteUrl: toNullableTrimmedString(raw.websiteUrl ?? raw.WebsiteUrl),
  bio: toNullableTrimmedString(raw.bio ?? raw.Bio),
  linkedInUrl: toNullableTrimmedString(raw.linkedInUrl ?? raw.LinkedInUrl),
  gitHubUrl: toNullableTrimmedString(raw.gitHubUrl ?? raw.GitHubUrl),
});

export const getFreelancerProfile = async (): Promise<FreelancerProfileDto> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to view your profile.');
  }

  const response = await fetch(`${API_BASE}/Freelancer/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) return {};

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const candidate =
      parsed?.data && typeof parsed.data === 'object'
        ? (parsed.data as Record<string, unknown>)
        : parsed;
    return toProfileDto(candidate);
  } catch {
    return {};
  }
};

export const updateFreelancerProfile = async (
  payload: UpdateFreelancerProfilePayload
): Promise<UpdateFreelancerProfileResult> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to update your profile.');
  }

  const body: UpdateFreelancerProfilePayload = {
    title: String(payload.title ?? '').trim(),
    hourlyRate: Number(payload.hourlyRate ?? 0),
    country: String(payload.country ?? '').trim(),
    phoneNumber: String(payload.phoneNumber ?? '').trim(),
    yearsOfExperience: Number(payload.yearsOfExperience ?? 0),
    isAvailable: Boolean(payload.isAvailable),
    websiteUrl: String(payload.websiteUrl ?? '').trim(),
    bio: String(payload.bio ?? '').trim(),
    linkedInUrl: String(payload.linkedInUrl ?? '').trim(),
    gitHubUrl: String(payload.gitHubUrl ?? '').trim(),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Freelancer/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('We could not update your profile right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return { profile: body, message: 'Profile updated successfully.' };
  }

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const message = typeof parsed.message === 'string' ? parsed.message : 'Profile updated successfully.';
    const candidate =
      parsed?.data && typeof parsed.data === 'object'
        ? (parsed.data as Record<string, unknown>)
        : parsed;
    const profile = Object.keys(candidate).length ? toProfileDto(candidate) : {};

    return {
      profile: {
        title: profile.title ?? body.title,
        hourlyRate: profile.hourlyRate ?? body.hourlyRate,
        country: profile.country ?? body.country,
        phoneNumber: profile.phoneNumber ?? body.phoneNumber,
        yearsOfExperience: profile.yearsOfExperience ?? body.yearsOfExperience,
        isAvailable: profile.isAvailable ?? body.isAvailable,
        websiteUrl: profile.websiteUrl ?? body.websiteUrl,
        bio: profile.bio ?? body.bio,
        linkedInUrl: profile.linkedInUrl ?? body.linkedInUrl,
        gitHubUrl: profile.gitHubUrl ?? body.gitHubUrl,
      },
      message,
    };
  } catch {
    return { profile: body, message: 'Profile updated successfully.' };
  }
};
