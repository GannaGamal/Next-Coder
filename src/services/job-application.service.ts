import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export type ApplicationStatus = 'Under Review' | 'Interview Scheduled' | 'Rejected' | 'Accepted';

export interface JobApplicationDashboardItem {
  jobId: number;
  applicationId: number;
  jobTitle: string;
  companyName: string;
  location: string;
  minSalary: number | null;
  maxSalary: number | null;
  jobType: string;
  status: ApplicationStatus;
  reason: string;
  appliedDate: string;
  interviewScheduledAt: string | null;
  matchPercentage: number;
}

export interface JobApplicationDashboardResult {
  totalAppliedCount: number;
  underReviewCount: number;
  interviewsCount: number;
  rejectedCount: number;
  items: JobApplicationDashboardItem[];
}

export interface CreateJobApplicationPayload {
  jobPostId: number;
  yearsOfExperience: number;
  Age: number;
  Address?: string;
  SkillsExtracted?: string;
  EducationDetailsExtracted?: string;
  HighestEducation?: string;
  availableStartDate?: string;
  minExpectedSalary?: number;
  maxExpectedSalary?: number;
  coverLetter?: string;
  FullText?: string;
  seekerTitle?: string;
  cvFile: File;
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
  if (response.status === 404) {
    return 'This application could not be found. It may have already been removed.';
  }
  return parseApiError(response);
};

const fetchWithNetworkError = async (url: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    const isLikelyNetworkOrCors = /failed to fetch|networkerror|load failed/i.test(message);

    if (isLikelyNetworkOrCors) {
      throw new Error('Request failed before reaching the server. Check your connection or CORS settings.');
    }

    throw new Error('Unexpected error while sending the request. Please try again.');
  }
};

export const formatSalary = (minSalary: number | null | undefined, maxSalary: number | null | undefined): string => {
  if (typeof minSalary === 'number' && typeof maxSalary === 'number') {
    return `$${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()}`;
  }
  if (typeof minSalary === 'number') {
    return `From $${minSalary.toLocaleString()}`;
  }
  if (typeof maxSalary === 'number') {
    return `Up to $${maxSalary.toLocaleString()}`;
  }
  return 'Not specified';
};

const mapApiStatus = (value: unknown): ApplicationStatus => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'under review' || normalized === 'underreview' || normalized === 'pending') {
    return 'Under Review';
  }
  if (normalized === 'interview scheduled' || normalized === 'interviewscheduled') {
    return 'Interview Scheduled';
  }
  if (normalized === 'accepted' || normalized === 'approved') {
    return 'Accepted';
  }
  if (normalized === 'rejected') {
    return 'Rejected';
  }
  return 'Under Review';
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

export const getJobApplicationDashboard = async (): Promise<JobApplicationDashboardResult> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to view job applications.');
  }

  const response = await fetchWithNetworkError(`${API_BASE}/JobApplication/dashboard`, {
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
  const rawItems: unknown[] = toArray(data)
    .concat(toArray(container?.appliedJobs))
    .concat(toArray(container?.AppliedJobs))
    .concat(toArray(container?.applications))
    .concat(toArray(container?.Applications))
    .concat(toArray(container?.jobApplications))
    .concat(toArray(container?.JobApplications))
    .concat(toArray(container?.items))
    .concat(toArray(container?.Items));

  const totalAppliedCount = Number(container?.totalAppliedCount ?? 0);
  const underReviewCount = Number(container?.underReviewCount ?? 0);
  const interviewsCount = Number(container?.interviewsCount ?? 0);
  const rejectedCount = Number(container?.rejectedCount ?? 0);

  const items: JobApplicationDashboardItem[] = rawItems
    .map((item: unknown) => {
      const raw = item as Record<string, unknown>;
      const matchPercentageRaw = Number(raw.matchPercentage ?? raw.MatchPercentage ?? raw.matchScore ?? raw.MatchScore ?? 0);
      const minSal = Number(raw.minSalary ?? raw.MinSalary);
      const maxSal = Number(raw.maxSalary ?? raw.MaxSalary);

      return {
        jobId: Number(raw.jobId ?? raw.JobId ?? 0),
        applicationId: Number(raw.applicationId ?? raw.ApplicationId ?? raw.id ?? raw.Id ?? 0),
        jobTitle: String(raw.jobTitle ?? raw.JobTitle ?? raw.position ?? raw.title ?? ''),
        companyName: String(raw.companyName ?? raw.CompanyName ?? raw.company ?? ''),
        location: String(raw.location ?? raw.Location ?? 'Remote'),
        minSalary: Number.isFinite(minSal) ? minSal : null,
        maxSalary: Number.isFinite(maxSal) ? maxSal : null,
        jobType: String(raw.jobType ?? raw.JobType ?? 'Not specified'),
        status: mapApiStatus(raw.status ?? raw.Status),
        reason: String(raw.reason ?? raw.Reason ?? raw.notes ?? raw.note ?? ''),
        appliedDate: String(raw.appliedDate ?? raw.AppliedDate ?? raw.appliedAt ?? raw.createdAt ?? ''),
        interviewScheduledAt: raw.interviewScheduledAt ? String(raw.interviewScheduledAt) : null,
        matchPercentage: Number.isFinite(matchPercentageRaw) ? Math.max(0, Math.min(100, matchPercentageRaw)) : 0,
      };
    })
    .filter((item) => item.applicationId > 0 && item.jobTitle.length > 0);

  return { totalAppliedCount, underReviewCount, interviewsCount, rejectedCount, items };
};

export const createJobApplication = async (payload: CreateJobApplicationPayload): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to apply for a job.');
  }

  if (!Number.isFinite(payload.jobPostId) || payload.jobPostId <= 0) {
    throw new Error('Invalid job id. Please open the application from a valid job post.');
  }

  const formData = new FormData();
  formData.append('JobPostId', String(payload.jobPostId));
  formData.append('YearsofExperience', String(payload.yearsOfExperience));
  formData.append('Age', String(payload.Age));
  if (payload.Address?.trim()) formData.append('Address', payload.Address.trim());
  if (payload.SkillsExtracted?.trim()) formData.append('SkillsExtracted', payload.SkillsExtracted.trim());
  if (payload.EducationDetailsExtracted?.trim()) {
    formData.append('EducationDetailsExtracted', payload.EducationDetailsExtracted.trim());
  }
  if (payload.HighestEducation?.trim()) formData.append('HighestEducation', payload.HighestEducation.trim());
  if (payload.availableStartDate) formData.append('AvailableStartDate', payload.availableStartDate);
  if (typeof payload.minExpectedSalary === 'number') {
    formData.append('MinExpectedSalary', String(payload.minExpectedSalary));
  }
  if (typeof payload.maxExpectedSalary === 'number') {
    formData.append('MaxExpectedSalary', String(payload.maxExpectedSalary));
  }
  if (payload.coverLetter?.trim()) formData.append('CoverLetter', payload.coverLetter.trim());
  if (payload.FullText?.trim()) formData.append('FullText', payload.FullText.trim());
  if (payload.seekerTitle?.trim()) formData.append('SeekerTitle', payload.seekerTitle.trim());
  formData.append('CvFile', payload.cvFile);

  const requestUrl = `${API_BASE}/JobApplication`;
  const response = await fetchWithNetworkError(requestUrl, {
    method: 'POST',
    headers: {
      ...buildAuthHeader(),
    },
    body: formData,
  });

  if (!response.ok) {
    const rawBody = await response.clone().text();
    if (import.meta.env.DEV) {
      console.error('Job application request failed.', {
        url: requestUrl,
        status: response.status,
        response: rawBody,
      });
    }
    throw new Error(await parseAuthAwareError(response));
  }
};

export const withdrawJobApplication = async (applicationId: number | string): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to withdraw a job application.');
  }

  const encodedApplicationId = encodeURIComponent(String(applicationId));
  const endpoint = `${API_BASE}/JobApplication/${encodedApplicationId}/withdraw`;

  const makeRequest = (method: 'DELETE' | 'POST') => fetchWithNetworkError(endpoint, {
    method,
    headers: {
      ...buildAuthHeader(),
    },
  });

  let response = await makeRequest('DELETE');

  // Some backends expose withdraw as POST action endpoint.
  if (!response.ok && response.status === 405) {
    response = await makeRequest('POST');
  }

  if (!response.ok) {
    throw new Error(await parseAuthAwareError(response));
  }
};
