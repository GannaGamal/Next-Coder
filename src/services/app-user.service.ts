import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';
import { normalizeUserRole } from '../utils/dashboard';

export interface AppUserSearchResult {
  id: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  roles: string[];
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

const normalizeRoles = (rawRoles: unknown): string[] => {
  const roles = toStringArray(rawRoles)
    .map((role) => normalizeUserRole(role) ?? '')
    .filter((role): role is string => Boolean(role));

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

const parseSearchResults = (data: unknown): AppUserSearchResult[] => {
  if (!data || typeof data !== 'object') {
    return [];
  }

  const candidate = data as Record<string, unknown>;
  const list = Array.isArray(candidate.value)
    ? candidate.value
    : Array.isArray(candidate.data)
      ? candidate.data
      : Array.isArray(candidate.items)
        ? candidate.items
        : Array.isArray(data)
          ? data
          : [];

  return list
    .map((item) => (item && typeof item === 'object' ? parseSearchUser(item as Record<string, unknown>) : null))
    .filter((item): item is AppUserSearchResult => Boolean(item));
};

export const searchAppUsers = async (query: string): Promise<AppUserSearchResult[]> => {
  const normalizedQuery = String(query ?? '').trim();
  if (!normalizedQuery) {
    return [];
  }

  const token = localStorage.getItem('authToken') ?? '';
  const params = new URLSearchParams({ search: normalizedQuery });

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/AppUser/search?${params.toString()}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch {
    throw new Error('We could not search users right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawText) as unknown;
    return parseSearchResults(parsed);
  } catch {
    return [];
  }
};
