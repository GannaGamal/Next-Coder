import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';
import { normalizeUserRole } from '../utils/dashboard';
import type { UserRole } from '../types';

export interface AppUserSearchResult {
  id: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  roles: UserRole[];
  skills?: string[];
  rating?: number | null;
  completedProjects?: number | null;
  location?: string | null;
  hourlyRate?: number | null;
  bio?: string | null;
}

const API_ORIGIN = API_BASE.replace(/\/api\/?$/i, '');

const toNonEmptyString = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '').trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
};

const buildUserImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl || imageUrl === '/' || imageUrl === './') {
    return null;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const slashNormalized = imageUrl.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!slashNormalized) {
    return null;
  }

  return `${API_ORIGIN}/${slashNormalized}`;
};

const normalizeRoles = (rawRoles: unknown): UserRole[] => {
  const roles = toStringArray(rawRoles)
    .map((role) => normalizeUserRole(role))
    .filter((role): role is UserRole => Boolean(role));

  return Array.from(new Set(roles));
};

const parseSearchUser = (raw: Record<string, unknown>): AppUserSearchResult | null => {
  const id = toNonEmptyString(raw.id ?? raw.Id ?? raw.userId ?? raw.UserId);
  if (!id) return null;

  const username = toNonEmptyString(
    raw.userName ?? raw.UserName ?? raw.username ?? raw.Username
  );
  const name =
    toNonEmptyString(raw.fullName ?? raw.FullName ?? raw.name ?? raw.Name) ??
    username;

  if (!name) return null;

  const avatarRaw = toNonEmptyString(
    raw.avatar ??
      raw.Avatar ??
      raw.imageUrl ??
      raw.ImageUrl ??
      raw.photoUrl ??
      raw.PhotoUrl ??
      raw.profileImage ??
      raw.ProfileImage ??
      raw.image ??
      raw.Image
  );

  const roles = normalizeRoles(raw.roles ?? raw.Roles ?? raw.userRoles ?? raw.UserRoles);
  const skills = toStringArray(raw.skills ?? raw.Skills);

  return {
    id,
    name,
    username,
    avatar: buildUserImageUrl(avatarRaw),
    roles,
    skills,
    rating: toNumber(raw.rating ?? raw.Rating),
    completedProjects: toNumber(raw.completedProjects ?? raw.CompletedProjects),
    location: toNonEmptyString(raw.location ?? raw.Location ?? raw.address ?? raw.Address),
    hourlyRate: toNumber(raw.hourlyRate ?? raw.HourlyRate),
    bio: toNonEmptyString(raw.bio ?? raw.Bio ?? raw.about ?? raw.About),
  };
};

const extractList = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const candidate = payload as Record<string, unknown>;
  const listCandidates = [
    candidate.value,
    candidate.data,
    candidate.items,
    candidate.results,
    candidate.users,
  ];

  for (const entry of listCandidates) {
    if (Array.isArray(entry)) {
      return entry;
    }
  }

  const nestedCandidates = [candidate.data, candidate.result, candidate.payload];
  for (const nested of nestedCandidates) {
    if (!nested || typeof nested !== 'object') {
      continue;
    }
    const nestedRecord = nested as Record<string, unknown>;
    const nestedList = nestedRecord.items ?? nestedRecord.value ?? nestedRecord.data;
    if (Array.isArray(nestedList)) {
      return nestedList;
    }
  }

  return [];
};

const parseSearchResults = (data: unknown): AppUserSearchResult[] => {
  const list = extractList(data);

  return list
    .map((item) => (item && typeof item === 'object' ? parseSearchUser(item as Record<string, unknown>) : null))
    .filter((item): item is AppUserSearchResult => Boolean(item));
};

const toApiRoleName = (role: UserRole): string => {
  switch (role) {
    case 'freelancer':
      return 'Freelancer';
    case 'client':
      return 'Client';
    case 'employer':
      return 'Employer';
    case 'applicant':
      return 'Applicant';
    case 'learner':
      return 'Learner';
    case 'admin':
      return 'Admin';
    default:
      return role;
  }
};

export const searchAppUsers = async (
  query: string,
  options?: { roles?: UserRole[] }
): Promise<AppUserSearchResult[]> => {
  const normalizedQuery = String(query ?? '').trim();
  if (!normalizedQuery) {
    return [];
  }

  const token = localStorage.getItem('authToken') ?? '';
  const params = new URLSearchParams({ Keyword: normalizedQuery });
  const roles = options?.roles ?? [];
  for (const role of roles) {
    params.append('Roles', toApiRoleName(role));
  }
  const requestUrl = `${API_BASE}/AppUser/search?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/json',
      },
    });
  } catch {
    throw new Error('We could not search users right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    let apiMessage = '';
    try {
      apiMessage = await parseApiError(response);
    } catch {
      apiMessage = '';
    }
    const statusMessage = response.status ? ` (HTTP ${response.status})` : '';
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Please sign in to search users.${statusMessage}`);
    }
    const message = apiMessage || 'Search request failed. Please try again.';
    throw new Error(`${message}${statusMessage}`);
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawText) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const wrapper = parsed as Record<string, unknown>;
      const success = typeof wrapper.success === 'boolean' ? wrapper.success : undefined;
      const message = typeof wrapper.message === 'string' ? wrapper.message : '';
      const data = 'data' in wrapper ? wrapper.data : parsed;
      if (success === false) {
        throw new Error(message || 'Search request failed.');
      }
      return parseSearchResults(data);
    }

    return parseSearchResults(parsed);
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    return [];
  }
};
