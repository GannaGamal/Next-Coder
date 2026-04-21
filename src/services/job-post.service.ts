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
  companyLogoUrl?: string | null;
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

export type EmployerJobApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interview_scheduled';

export interface EmployerJobApplicantItem {
  id: number;
  name: string;
  avatar: string;
  title: string;
  experience: string;
  matchScore: number | null;
  appliedDate: string;
  status: EmployerJobApplicationStatus;
  interviewDate?: string;
  interviewTime?: string;
  rejectionReason?: string;
}

export interface EmployerJobPostDetailsResult {
  applicants: EmployerJobApplicantItem[];
  counts: {
    all: number;
    pending: number;
    shortlisted: number;
    rejected: number;
    interviewScheduled: number;
  };
}

const buildAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('authToken') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseAuthAwareError = async (response: Response): Promise<string> => {
  if (response.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  if (response.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  return parseApiError(response);
};

const fetchWithNetworkError = async (url: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error('Network connection issue. Please check your internet and try again.');
  }
};

const formatDateOnly = (value: unknown): string => {
  if (!value) return '-';
  const raw = String(value);
  return raw.includes('T') ? raw.split('T')[0] : raw;
};

const mapApplicantStatus = (status: unknown): EmployerJobApplicationStatus => {
  const value = String(status ?? '').trim().toLowerCase();

  if (value.includes('interview')) return 'interview_scheduled';
  if (value.includes('short')) return 'shortlisted';
  if (value.includes('reject')) return 'rejected';
  if (value.includes('review')) return 'reviewed';
  return 'pending';
};

const getDefaultAvatar = (name: string): string => {
  const normalized = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${normalized}&background=6366f1&color=ffffff&size=100`;
};

const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const raw = value as Record<string, unknown>;
  if (Array.isArray(raw.$values)) return raw.$values as unknown[];
  if (Array.isArray(raw.values)) return raw.values as unknown[];
  if (Array.isArray(raw.items)) return raw.items as unknown[];

  return [];
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
      companyLogoUrl: raw.companyLogoUrl ? String(raw.companyLogoUrl) : raw.CompanyLogoUrl ? String(raw.CompanyLogoUrl) : raw.logoUrl ? String(raw.logoUrl) : raw.LogoUrl ? String(raw.LogoUrl) : null,
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

export const closeJobPost = async (id: number): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to close a job post.');
  }

  let response = await fetchWithNetworkError(`${API_BASE}/JobPost/${id}/close`, {
    method: 'PATCH',
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (response.status === 405) {
    response = await fetchWithNetworkError(`${API_BASE}/JobPost/${id}/close`, {
      method: 'POST',
      headers: {
        ...buildAuthHeader(),
      },
    });
  }

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }
};

export const deleteJobPost = async (id: number): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to delete a job post.');
  }

  const response = await fetchWithNetworkError(`${API_BASE}/JobPost/${id}`, {
    method: 'DELETE',
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }
};

export const getJobPostDetails = async (jobPostId: number): Promise<EmployerJobPostDetailsResult> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to view job post details.');
  }

  const response = await fetchWithNetworkError(`${API_BASE}/JobPost/${jobPostId}/jobPostDetails`, {
    method: 'GET',
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }

  const data = await response.json();
  const container = (data?.data ?? data?.result ?? data?.value ?? data) as Record<string, unknown>;
  const rawApplicants: unknown[] = toArray(data)
    .concat(toArray(container?.applicants))
    .concat(toArray(container?.Applicants))
    .concat(toArray(container?.jobApplications))
    .concat(toArray(container?.JobApplications))
    .concat(toArray(container?.applications))
    .concat(toArray(container?.Applications))
    .concat(toArray(container?.items))
    .concat(toArray(container?.Items));

  const applicants: EmployerJobApplicantItem[] = rawApplicants
    .map((item: unknown) => {
      const raw = item as Record<string, unknown>;
      const id = Number(raw.id ?? raw.jobApplicationId ?? raw.applicationId ?? raw.Id ?? raw.JobApplicationId ?? 0);
      const score = Number(raw.matchScore ?? raw.MatchScore);
      const years = Number(raw.yearsOfExperience ?? raw.yearsofExperience ?? raw.YearsOfExperience ?? raw.YearsofExperience);
      const interviewAtRaw = raw.interviewScheduledAt ?? raw.InterviewScheduledAt;
      const interviewDateObj = interviewAtRaw ? new Date(String(interviewAtRaw)) : null;
      const hasInterview = interviewDateObj && !Number.isNaN(interviewDateObj.getTime());
      const name = String(raw.name ?? raw.fullName ?? raw.seekerName ?? raw.jobSeekerName ?? raw.Name ?? raw.FullName ?? 'Job Seeker');

      return {
        id,
        name,
        avatar: String(raw.avatar ?? raw.profileImageUrl ?? raw.imageUrl ?? raw.Avatar ?? raw.ProfileImageUrl ?? raw.ImageUrl ?? getDefaultAvatar(name)),
        title: String(raw.title ?? raw.seekerTitle ?? raw.jobTitle ?? raw.Title ?? raw.SeekerTitle ?? 'Job Seeker'),
        experience: Number.isFinite(years) ? `${years} years` : String(raw.experience ?? raw.Experience ?? 'Not specified'),
        matchScore: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null,
        appliedDate: formatDateOnly(raw.appliedDate ?? raw.appliedAt ?? raw.createdAt ?? raw.AppliedDate ?? raw.AppliedAt ?? raw.CreatedAt),
        status: mapApplicantStatus(raw.status ?? raw.Status),
        interviewDate: hasInterview ? interviewDateObj.toLocaleDateString() : undefined,
        interviewTime: hasInterview ? interviewDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        rejectionReason: String(raw.rejectionReason ?? raw.reason ?? raw.RejectionReason ?? raw.Reason ?? ''),
      };
    })
    .filter((applicant) => applicant.id > 0);

  const countAllRaw = Number(
    container?.allApplicantsCount
      ?? container?.allCount
      ?? container?.AllApplicantsCount
      ?? container?.AllCount
      ?? data?.allApplicantsCount
      ?? data?.allCount
      ?? data?.AllApplicantsCount
      ?? data?.AllCount
  );
  const countPendingRaw = Number(container?.pendingCount ?? container?.PendingCount ?? data?.pendingCount ?? data?.PendingCount);
  const countShortlistedRaw = Number(container?.shortlistedCount ?? container?.ShortlistedCount ?? data?.shortlistedCount ?? data?.ShortlistedCount);
  const countRejectedRaw = Number(container?.rejectedCount ?? container?.RejectedCount ?? data?.rejectedCount ?? data?.RejectedCount);
  const countInterviewRaw = Number(
    container?.interviewScheduledCount
      ?? container?.InterviewScheduledCount
      ?? data?.interviewScheduledCount
      ?? data?.InterviewScheduledCount
  );

  const computed = {
    all: applicants.length,
    pending: applicants.filter((a) => a.status === 'pending').length,
    shortlisted: applicants.filter((a) => a.status === 'shortlisted').length,
    rejected: applicants.filter((a) => a.status === 'rejected').length,
    interviewScheduled: applicants.filter((a) => a.status === 'interview_scheduled').length,
  };

  return {
    applicants,
    counts: {
      all: Number.isFinite(countAllRaw) ? countAllRaw : computed.all,
      pending: Number.isFinite(countPendingRaw) ? countPendingRaw : computed.pending,
      shortlisted: Number.isFinite(countShortlistedRaw) ? countShortlistedRaw : computed.shortlisted,
      rejected: Number.isFinite(countRejectedRaw) ? countRejectedRaw : computed.rejected,
      interviewScheduled: Number.isFinite(countInterviewRaw) ? countInterviewRaw : computed.interviewScheduled,
    },
  };
};

export const rejectJobApplicant = async (jobApplicationId: number, reason?: string): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to reject an applicant.');
  }

  const endpoint = `${API_BASE}/JobPost/${jobApplicationId}/reject`;
  const payload = { reason: (reason ?? '').trim() };

  let response = await fetchWithNetworkError(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 405) {
    response = await fetchWithNetworkError(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }
};

export const scheduleInterviewForApplicant = async (jobApplicationId: number, interviewScheduledAt: string): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to schedule an interview.');
  }

  const endpoint = `${API_BASE}/JobPost/${jobApplicationId}/scheduleInterview`;
  const payload = { interviewScheduledAt };

  let response = await fetchWithNetworkError(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 405) {
    response = await fetchWithNetworkError(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }
};
