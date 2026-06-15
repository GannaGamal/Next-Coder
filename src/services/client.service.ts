import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface ClientProfileDto {
  id: number;
  appUserId: string;
  fullName: string;
  email: string;
  imageUrl: string | null;
  bio: string | null;
  country: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  totalSpent: number;
  totalProjectsPosted: number;
  totalProjectsCompleted: number;
  averageRating: number;
  totalReviews: number;
}

export interface UpdateClientProfilePayload {
  phoneNumber: string;
  country: string;
  websiteUrl: string;
  bio: string;
}

export interface ClientReport {
  reportId: number;
  reportType: string;
  complaintAgainst: string;
  reportedBy: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
  actions: string[];
}

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

const toNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getClientProfile = async (): Promise<ClientProfileDto> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to view your client profile.');
  }

  const response = await fetch(`${API_BASE}/Client/profile`, {
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
  if (!rawText.trim()) {
    throw new Error('Empty client profile response from server.');
  }

  const parsed = JSON.parse(rawText) as Record<string, unknown>;
  const data = (parsed.data ?? parsed) as Record<string, unknown>;

  return {
    id: toNumber(data.id ?? data.Id),
    appUserId: String(data.appUserId ?? data.AppUserId ?? ''),
    fullName: String(data.fullName ?? data.FullName ?? ''),
    email: String(data.email ?? data.Email ?? ''),
    imageUrl: toNullableString(data.imageUrl ?? data.ImageUrl),
    bio: toNullableString(data.bio ?? data.Bio),
    country: toNullableString(data.country ?? data.Country),
    phoneNumber: toNullableString(data.phoneNumber ?? data.PhoneNumber),
    websiteUrl: toNullableString(data.websiteUrl ?? data.WebsiteUrl),
    totalSpent: toNumber(data.totalSpent ?? data.TotalSpent),
    totalProjectsPosted: toNumber(data.totalProjectsPosted ?? data.TotalProjectsPosted),
    totalProjectsCompleted: toNumber(data.totalProjectsCompleted ?? data.TotalProjectsCompleted),
    averageRating: toNumber(data.averageRating ?? data.AverageRating),
    totalReviews: toNumber(data.totalReviews ?? data.TotalReviews),
  };
};

export const updateClientProfile = async (
  payload: UpdateClientProfilePayload
): Promise<ClientProfileDto> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to update your client profile.');
  }

  const response = await fetch(`${API_BASE}/Client/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return {
      id: 0,
      appUserId: '',
      fullName: '',
      email: '',
      imageUrl: null,
      bio: payload.bio,
      country: payload.country,
      phoneNumber: payload.phoneNumber,
      websiteUrl: payload.websiteUrl,
      totalSpent: 0,
      totalProjectsPosted: 0,
      totalProjectsCompleted: 0,
      averageRating: 0,
      totalReviews: 0,
    };
  }

  const parsed = JSON.parse(rawText) as Record<string, unknown>;
  const data = (parsed.data ?? parsed) as Record<string, unknown>;

  return {
    id: toNumber(data.id ?? data.Id),
    appUserId: String(data.appUserId ?? data.AppUserId ?? ''),
    fullName: String(data.fullName ?? data.FullName ?? ''),
    email: String(data.email ?? data.Email ?? ''),
    imageUrl: toNullableString(data.imageUrl ?? data.ImageUrl),
    bio: toNullableString(data.bio ?? data.Bio) ?? payload.bio,
    country: toNullableString(data.country ?? data.Country) ?? payload.country,
    phoneNumber: toNullableString(data.phoneNumber ?? data.PhoneNumber) ?? payload.phoneNumber,
    websiteUrl: toNullableString(data.websiteUrl ?? data.WebsiteUrl) ?? payload.websiteUrl,
    totalSpent: toNumber(data.totalSpent ?? data.TotalSpent),
    totalProjectsPosted: toNumber(data.totalProjectsPosted ?? data.TotalProjectsPosted),
    totalProjectsCompleted: toNumber(data.totalProjectsCompleted ?? data.TotalProjectsCompleted),
    averageRating: toNumber(data.averageRating ?? data.AverageRating),
    totalReviews: toNumber(data.totalReviews ?? data.TotalReviews),
  };
};

/**
 * GET /api/Client/my-reports
 * Returns reports filed against the authenticated client.
 */
export const getClientReports = async (): Promise<ClientReport[]> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to view your reports.');
  }

  const response = await fetch(`${API_BASE}/Client/my-reports`, {
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
  if (!rawText.trim()) return [];

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const data = parsed?.data ?? parsed;
    return Array.isArray(data) ? (data as ClientReport[]) : [];
  } catch {
    return [];
  }
};
