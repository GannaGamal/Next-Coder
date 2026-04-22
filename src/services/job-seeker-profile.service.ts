import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface JobSeekerProfileDto {
  id?: number | string;
  fullName?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  gitHubUrl?: string | null;
  websiteUrl?: string | null;
  education?: string | null;
  experience?: string | null;
}

export interface UpdateJobSeekerProfilePayload {
  phoneNumber: string;
  address: string;
  gitHubUrl: string;
  websiteUrl: string;
  education: string;
  experience: string;
}

interface StoredUserAuth {
  roles: string[];
  jobSeekerId: string;
}

const API_ORIGIN = API_BASE.replace(/\/api\/?$/i, '');
const getToken = () => localStorage.getItem('authToken') ?? '';

const toNullableTrimmedString = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
};

const getStoredUserAuth = (): StoredUserAuth => {
  const storedUserRaw = localStorage.getItem('user');
  if (!storedUserRaw) {
    return { roles: [], jobSeekerId: '' };
  }

  try {
    const parsed = JSON.parse(storedUserRaw) as { roles?: unknown; jobSeekerId?: unknown };
    const roles = Array.isArray(parsed.roles)
      ? parsed.roles
          .filter((role): role is string => typeof role === 'string')
          .map((role) => role.toLowerCase().trim())
      : [];
    const jobSeekerId = String(parsed.jobSeekerId ?? '').trim();
    return { roles, jobSeekerId };
  } catch {
    return { roles: [], jobSeekerId: '' };
  }
};

export const canCurrentUserEditJobSeekerProfile = (
  profileOwnerJobSeekerId: string | null | undefined
): boolean => {
  const { roles, jobSeekerId } = getStoredUserAuth();
  const normalizedOwnerId = String(profileOwnerJobSeekerId ?? '').trim();
  return (
    roles.includes('applicant') &&
    jobSeekerId.length > 0 &&
    normalizedOwnerId.length > 0 &&
    jobSeekerId === normalizedOwnerId
  );
};

export const buildJobSeekerImageUrl = (imageUrl: string | null | undefined): string | null => {
  const normalized = toNullableTrimmedString(imageUrl);

  if (!normalized || normalized === '/' || normalized === './') {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const slashNormalized = normalized.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!slashNormalized) {
    return null;
  }

  return `${API_ORIGIN}/${slashNormalized}`;
};

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'We could not load your profile right now. Please try again.';
};

const fetchProfileByPathId = async (id: string): Promise<JobSeekerProfileDto> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to view job seeker profiles.');
  }

  const response = await fetch(`${API_BASE}/JobSeeker/profile/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
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
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      id: parsed.id ?? parsed.Id ?? id,
      fullName: toNullableTrimmedString(parsed.fullName ?? parsed.FullName),
      email: toNullableTrimmedString(parsed.email ?? parsed.Email),
      imageUrl: toNullableTrimmedString(parsed.imageUrl ?? parsed.ImageUrl),
      phoneNumber: toNullableTrimmedString(parsed.phoneNumber ?? parsed.PhoneNumber),
      address: toNullableTrimmedString(parsed.address ?? parsed.Address),
      gitHubUrl: toNullableTrimmedString(parsed.gitHubUrl ?? parsed.GitHubUrl),
      websiteUrl: toNullableTrimmedString(parsed.websiteUrl ?? parsed.WebsiteUrl),
      education: toNullableString(parsed.education ?? parsed.Education),
      experience: toNullableString(parsed.experience ?? parsed.Experience),
    };
  } catch {
    return {};
  }
};

export const getJobSeekerProfile = async (
  jobSeekerId: string | null | undefined
): Promise<JobSeekerProfileDto> => {
  const normalizedId = String(jobSeekerId ?? '').trim();
  if (!normalizedId) {
    throw new Error('Invalid job seeker ID.');
  }

  try {
    return await fetchProfileByPathId(normalizedId);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const updateJobSeekerProfile = async (
  payload: UpdateJobSeekerProfilePayload,
  profileOwnerJobSeekerId: string | null | undefined
): Promise<UpdateJobSeekerProfilePayload> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to update your profile.');
  }

  if (!canCurrentUserEditJobSeekerProfile(profileOwnerJobSeekerId)) {
    throw new Error('Only the profile owner can update this job seeker profile.');
  }

  const body: UpdateJobSeekerProfilePayload = {
    phoneNumber: String(payload.phoneNumber ?? '').trim(),
    address: String(payload.address ?? '').trim(),
    gitHubUrl: String(payload.gitHubUrl ?? '').trim(),
    websiteUrl: String(payload.websiteUrl ?? '').trim(),
    education: String(payload.education ?? ''),
    experience: String(payload.experience ?? ''),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/JobSeeker/profile`, {
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
    return body;
  }

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    return {
      phoneNumber: String(parsed.phoneNumber ?? parsed.PhoneNumber ?? body.phoneNumber),
      address: String(parsed.address ?? parsed.Address ?? body.address),
      gitHubUrl: String(parsed.gitHubUrl ?? parsed.GitHubUrl ?? body.gitHubUrl),
      websiteUrl: String(parsed.websiteUrl ?? parsed.WebsiteUrl ?? body.websiteUrl),
      education: String(parsed.education ?? parsed.Education ?? body.education),
      experience: String(parsed.experience ?? parsed.Experience ?? body.experience),
    };
  } catch {
    return body;
  }
};
