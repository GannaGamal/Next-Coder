import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface JobSkill {
  id: number;
  name: string;
}

export interface JobPostItem {
  id: number;
  title: string;
  companyName: string;
  location: string;
  minSalary?: number;
  maxSalary?: number;
  jobType: string;
  experienceLevel: string;
  description: string;
  createdAt?: string;
  skills: string[];
  employerId?: string;
  jobSeekersCount?: number;
}

export interface GetJobPostsParams {
  SearchTerm?: string;
  JobType?: string;
  ExperienceLevel?: string;
  MinSalary?: number;
  MaxSalary?: number;
  SkillIds?: number[];
  SortBy?: string;
}

export interface GetJobPostsResult {
  items: JobPostItem[];
  count: number;
}

export interface CreateJobPostPayload {
  title: string;
  location: string;
  companyName: string;
  jobType: string;
  experienceLevel: string;
  minSalary?: number;
  maxSalary?: number;
  description: string;
  skillIds: number[];
}

export interface EmployerDashboardJobPostItem {
  id: number;
  title: string;
  companyName: string;
  location: string;
  minSalary?: number;
  maxSalary?: number;
  postedDate?: string;
  status?: string;
  jobSeekersCount?: number;
}

export interface EmployerDashboardResult {
  totalJobSeekersCount: number;
  activeJobsCount: number;
  closedJobsCount: number;
  jobPostings: EmployerDashboardJobPostItem[];
}

const buildAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('authToken') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseAuthAwareError = async (response: Response): Promise<string> => {
  if (response.status === 401) {
    return 'You are not authorized. Please sign in again.';
  }
  if (response.status === 403) {
    return 'Access denied by backend policy (403). Your account cannot access this endpoint.';
  }
  return parseApiError(response);
};

const fetchWithNetworkError = async (url: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error('Network error: cannot reach API. Check internet connection, CORS policy, and backend availability.');
  }
};

export const getJobSkills = async (): Promise<JobSkill[]> => {
  const response = await fetch(`${API_BASE}/JobSkill`, {
    method: 'GET',
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data
    .map((item: unknown) => {
      const raw = item as Record<string, unknown>;
      const id = Number(raw.id ?? raw.skillId ?? raw.Id ?? raw.SkillId);
      const name = String(raw.name ?? raw.skillName ?? raw.Name ?? raw.SkillName ?? '');
      return { id, name };
    })
    .filter((s) => Number.isFinite(s.id) && s.id > 0 && s.name.trim().length > 0);
};

export const createJobPost = async (payload: CreateJobPostPayload): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to post a job.');
  }

  const response = await fetch(`${API_BASE}/JobPost/addJobPost`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }
};

export const getJobPosts = async (params: GetJobPostsParams = {}): Promise<GetJobPostsResult> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to view job posts.');
  }

  const query = new URLSearchParams();
  if (params.SearchTerm) query.set('SearchTerm', params.SearchTerm);
  if (params.JobType) query.set('JobType', params.JobType);
  if (params.ExperienceLevel) query.set('ExperienceLevel', params.ExperienceLevel);
  if (typeof params.MinSalary === 'number') query.set('MinSalary', String(params.MinSalary));
  if (typeof params.MaxSalary === 'number') query.set('MaxSalary', String(params.MaxSalary));
  if (params.SortBy) query.set('SortBy', params.SortBy);
  (params.SkillIds ?? []).forEach((id) => query.append('SkillIds', String(id)));

  const queryString = query.toString();
  const response = await fetch(
    `${API_BASE}/JobPost/getJobPosts${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
      headers: {
        ...buildAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }

  const data = await response.json();
  const rawItems: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.value)
      ? data.value
      : Array.isArray(data?.items)
        ? data.items
        : [];

  const items: JobPostItem[] = rawItems.map((item) => {
    const raw = item as Record<string, unknown>;
    const minSalary = Number(raw.minSalary ?? raw.MinSalary);
    const maxSalary = Number(raw.maxSalary ?? raw.MaxSalary);

    return {
      id: Number(raw.id ?? raw.Id ?? 0),
      title: String(raw.title ?? raw.Title ?? ''),
      companyName: String(raw.companyName ?? raw.CompanyName ?? ''),
      location: String(raw.location ?? raw.Location ?? ''),
      minSalary: Number.isFinite(minSalary) ? minSalary : undefined,
      maxSalary: Number.isFinite(maxSalary) ? maxSalary : undefined,
      jobType: String(raw.jobType ?? raw.JobType ?? ''),
      experienceLevel: String(raw.experienceLevel ?? raw.ExperienceLevel ?? ''),
      description: String(raw.description ?? raw.Description ?? ''),
      createdAt: raw.createdAt ? String(raw.createdAt) : raw.CreatedAt ? String(raw.CreatedAt) : undefined,
      skills: Array.isArray(raw.skills) ? raw.skills.map((s) => String(s)) : [],
      employerId: raw.employerId ? String(raw.employerId) : raw.EmployerId ? String(raw.EmployerId) : undefined,
      jobSeekersCount: Number(raw.jobSeekersCount ?? raw.JobSeekersCount ?? 0),
    };
  }).filter((item) => item.id > 0 && item.title.length > 0);

  const countCandidate = Number(data?.count ?? data?.Count ?? items.length);
  const count = Number.isFinite(countCandidate) ? countCandidate : items.length;

  return { items, count };
};

export const getEmployerDashboard = async (): Promise<EmployerDashboardResult> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to view employer dashboard.');
  }

  const response = await fetchWithNetworkError(`${API_BASE}/JobPost/employerDashboard`, {
    method: 'GET',
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }

  const data = await response.json();
  const rawJobPostings: unknown[] = Array.isArray(data?.jobPostings) ? data.jobPostings : [];

  const jobPostings: EmployerDashboardJobPostItem[] = rawJobPostings
    .map((item: unknown) => {
      const raw = item as Record<string, unknown>;
      const minSalary = Number(raw.minSalary ?? raw.MinSalary);
      const maxSalary = Number(raw.maxSalary ?? raw.MaxSalary);

      return {
        id: Number(raw.id ?? raw.Id ?? 0),
        title: String(raw.title ?? raw.Title ?? ''),
        companyName: String(raw.companyName ?? raw.CompanyName ?? ''),
        location: String(raw.location ?? raw.Location ?? ''),
        minSalary: Number.isFinite(minSalary) ? minSalary : undefined,
        maxSalary: Number.isFinite(maxSalary) ? maxSalary : undefined,
        postedDate: raw.postedDate ? String(raw.postedDate) : raw.PostedDate ? String(raw.PostedDate) : undefined,
        status: raw.status ? String(raw.status) : raw.Status ? String(raw.Status) : undefined,
        jobSeekersCount: Number(raw.jobSeekersCount ?? raw.JobSeekersCount ?? 0),
      };
    })
    .filter((item: EmployerDashboardJobPostItem) => item.id > 0 && item.title.length > 0);

  return {
    totalJobSeekersCount: Number(data?.totalJobSeekersCount ?? data?.TotalJobSeekersCount ?? 0),
    activeJobsCount: Number(data?.activeJobsCount ?? data?.ActiveJobsCount ?? 0),
    closedJobsCount: Number(data?.closedJobsCount ?? data?.ClosedJobsCount ?? 0),
    jobPostings,
  };
};
