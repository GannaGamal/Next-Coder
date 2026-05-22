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

export interface FreelancerCompletedProjectDto {
  id: string;
  title: string | null;
  client: string | null;
  clientAvatar: string | null;
  description: string | null;
  budget: number | null;
  totalPaid: number | null;
  completedDate: string | null;
  rating: number | null;
  review: string | null;
  category: string | null;
  status: string | null;
}

export interface FreelancerCompletedProjectsResponse {
  projects: FreelancerCompletedProjectDto[];
  totalCompletedProjects: number;
}

export const getFreelancerCompletedProjects = async (): Promise<FreelancerCompletedProjectsResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to view your completed projects.');
  }

  const response = await fetch(`${API_BASE}/Freelancer/profile/completed-projects`, {
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
    return { projects: [], totalCompletedProjects: 0 };
  }

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const data = parsed?.data as Record<string, unknown> | undefined;
    const rawProjects = data?.projects ?? [];
    const totalCompletedProjects = Number(data?.totalCompletedProjects ?? 0);

    if (!Array.isArray(rawProjects)) {
      return { projects: [], totalCompletedProjects: 0 };
    }

    const projects = rawProjects.map((item: Record<string, unknown>) => {
      const id = String(item.id ?? item.Id ?? item.projectId ?? item.ProjectId ?? '');
      
      const title = item.title !== undefined && item.title !== null && String(item.title).trim() !== ''
        ? String(item.title).trim()
        : (item.Title !== undefined && item.Title !== null && String(item.Title).trim() !== ''
          ? String(item.Title).trim()
          : null);

      const client = item.clientName !== undefined && item.clientName !== null && String(item.clientName).trim() !== ''
        ? String(item.clientName).trim()
        : (item.ClientName !== undefined && item.ClientName !== null && String(item.ClientName).trim() !== ''
          ? String(item.ClientName).trim()
          : (item.client !== undefined && item.client !== null && String(item.client).trim() !== ''
            ? String(item.client).trim()
            : (item.Client !== undefined && item.Client !== null && String(item.Client).trim() !== ''
              ? String(item.Client).trim()
              : null)));
      
      let rawAvatar: string | null = null;
      const avatarKeys = ['clientImageUrl', 'ClientImageUrl', 'clientAvatar', 'ClientAvatar'];
      for (const key of avatarKeys) {
        if (item[key] !== undefined && item[key] !== null) {
          const val = String(item[key]).trim();
          if (val && val !== 'null' && val !== 'undefined') {
            rawAvatar = val;
            break;
          }
        }
      }

      let clientAvatar: string | null = null;
      if (rawAvatar && rawAvatar !== '/' && rawAvatar !== 'null' && rawAvatar !== 'undefined') {
        if (/^https?:\/\//i.test(rawAvatar)) {
          clientAvatar = rawAvatar;
        } else {
          const cleanPath = rawAvatar.startsWith('/') ? rawAvatar.slice(1) : rawAvatar;
          if (cleanPath.trim() !== '') {
            clientAvatar = `https://nextcoder.runasp.net/${cleanPath}`;
          }
        }
      }

      const description = item.description !== undefined && item.description !== null && String(item.description).trim() !== ''
        ? String(item.description).trim()
        : (item.Description !== undefined && item.Description !== null && String(item.Description).trim() !== ''
          ? String(item.Description).trim()
          : null);

      const budget = item.budget !== undefined && item.budget !== null
        ? Number(item.budget)
        : (item.Budget !== undefined && item.Budget !== null
          ? Number(item.Budget)
          : null);

      const totalPaid = item.totalPaid !== undefined && item.totalPaid !== null
        ? Number(item.totalPaid)
        : (item.TotalPaid !== undefined && item.TotalPaid !== null
          ? Number(item.TotalPaid)
          : null);
      
      let completedDate: string | null = null;
      const dateKeys = ['completedAt', 'CompletedAt', 'completedDate', 'CompletedDate'];
      for (const key of dateKeys) {
        if (item[key] !== undefined && item[key] !== null) {
          const val = String(item[key]).trim();
          if (val && !Number.isNaN(new Date(val).getTime())) {
            completedDate = val;
            break;
          }
        }
      }

      let rating: number | null = null;
      if (item.rating !== undefined && item.rating !== null) {
        rating = item.rating !== '' ? Number(item.rating) : null;
      } else if (item.Rating !== undefined && item.Rating !== null) {
        rating = item.Rating !== '' ? Number(item.Rating) : null;
      }

      let review: string | null = null;
      if (item.comment !== undefined && item.comment !== null) {
        review = String(item.comment).trim() !== '' ? String(item.comment).trim() : null;
      } else if (item.Comment !== undefined && item.Comment !== null) {
        review = String(item.Comment).trim() !== '' ? String(item.Comment).trim() : null;
      } else if (item.review !== undefined && item.review !== null) {
        review = String(item.review).trim() !== '' ? String(item.review).trim() : null;
      } else if (item.Review !== undefined && item.Review !== null) {
        review = String(item.Review).trim() !== '' ? String(item.Review).trim() : null;
      }
      
      const category = item.category !== undefined && item.category !== null && String(item.category).trim() !== ''
        ? String(item.category).trim()
        : (item.Category !== undefined && item.Category !== null && String(item.Category).trim() !== ''
          ? String(item.Category).trim()
          : (item.categoryName !== undefined && item.categoryName !== null && String(item.categoryName).trim() !== ''
            ? String(item.categoryName).trim()
            : (item.CategoryName !== undefined && item.CategoryName !== null && String(item.CategoryName).trim() !== ''
              ? String(item.CategoryName).trim()
              : null)));

      const status = item.status !== undefined && item.status !== null && String(item.status).trim() !== ''
        ? String(item.status).trim()
        : (item.Status !== undefined && item.Status !== null && String(item.Status).trim() !== ''
          ? String(item.Status).trim()
          : (item.projectStatus !== undefined && item.projectStatus !== null && String(item.projectStatus).trim() !== ''
            ? String(item.projectStatus).trim()
            : (item.ProjectStatus !== undefined && item.ProjectStatus !== null && String(item.ProjectStatus).trim() !== ''
              ? String(item.ProjectStatus).trim()
              : null)));

      return { id, title, client, clientAvatar, description, budget, totalPaid, completedDate, rating, review, category, status };
    });

    return { projects, totalCompletedProjects };
  } catch {
    return { projects: [], totalCompletedProjects: 0 };
  }
};

