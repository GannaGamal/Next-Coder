import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export type ApplicationStatus = 'Under Review' | 'Interview Scheduled' | 'Rejected' | 'Accepted';

export interface JobApplicationDashboardItem {
  id: number;
  position: string;
  company: string;
  location: string;
  salary: string;
  appliedDate: string;
  status: ApplicationStatus;
  matchScore: number;
  jobType: string;
  interviewDate?: string;
  interviewTime?: string;
  notes?: string;
}

export interface JobApplicationDashboardResult {
  items: JobApplicationDashboardItem[];
}

export interface CreateJobApplicationPayload {
  jobPostId: number;
  yearsOfExperience: number;
  availableStartDate?: string;
  minExpectedSalary?: number;
  maxExpectedSalary?: number;
  coverLetter?: string;
  seekerTitle?: string;
  cvFile: File;
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
    return 'Access denied by backend policy (403). Your account cannot withdraw this application.';
  }
  if (response.status === 404) {
    return 'Application was not found. It may already be withdrawn or deleted.';
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

const formatSalary = (minSalary?: number, maxSalary?: number): string => {
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
  const rawItems: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.applications)
      ? data.applications
      : Array.isArray(data?.jobApplications)
        ? data.jobApplications
        : Array.isArray(data?.items)
          ? data.items
          : [];

  const items: JobApplicationDashboardItem[] = rawItems
    .map((item: unknown) => {
      const raw = item as Record<string, unknown>;
      const id = Number(raw.id ?? raw.applicationId ?? raw.Id ?? raw.ApplicationId ?? 0);
      const minSalary = Number(raw.minSalary ?? raw.MinSalary);
      const maxSalary = Number(raw.maxSalary ?? raw.MaxSalary);
      const score = Number(raw.matchScore ?? raw.MatchScore ?? raw.fitScore ?? raw.FitScore ?? 0);
      const interviewAtRaw = raw.interviewScheduledAt ?? raw.InterviewScheduledAt;
      const interviewDateObj = interviewAtRaw ? new Date(String(interviewAtRaw)) : null;
      const hasInterviewDate = interviewDateObj && !Number.isNaN(interviewDateObj.getTime());

      return {
        id,
        position: String(raw.position ?? raw.title ?? raw.jobTitle ?? raw.jobPostTitle ?? raw.Position ?? raw.Title ?? ''),
        company: String(raw.company ?? raw.companyName ?? raw.Company ?? raw.CompanyName ?? ''),
        location: String(raw.location ?? raw.Location ?? 'Remote'),
        salary: formatSalary(
          Number.isFinite(minSalary) ? minSalary : undefined,
          Number.isFinite(maxSalary) ? maxSalary : undefined
        ),
        appliedDate: String(raw.appliedDate ?? raw.appliedAt ?? raw.createdAt ?? raw.AppliedDate ?? raw.AppliedAt ?? raw.CreatedAt ?? ''),
        status: mapApiStatus(raw.status ?? raw.Status),
        matchScore: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0,
        jobType: String(raw.jobType ?? raw.JobType ?? 'Not specified'),
        interviewDate: hasInterviewDate ? interviewDateObj.toLocaleDateString() : undefined,
        interviewTime: hasInterviewDate ? interviewDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        notes: String(raw.notes ?? raw.note ?? raw.rejectionReason ?? raw.Notes ?? raw.Note ?? raw.RejectionReason ?? ''),
      };
    })
    .filter((item) => item.id > 0 && item.position.length > 0);

  return { items };
};

export const createJobApplication = async (payload: CreateJobApplicationPayload): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to apply for a job.');
  }

  if (!Number.isFinite(payload.jobPostId) || payload.jobPostId <= 0) {
    throw new Error('Invalid job id. Please open the application from a valid job post.');
  }

  const query = new URLSearchParams();
  query.set('JobPostId', String(payload.jobPostId));
  query.set('YearsofExperience', String(payload.yearsOfExperience));
  if (payload.availableStartDate) query.set('AvailableStartDate', payload.availableStartDate);
  if (typeof payload.minExpectedSalary === 'number') query.set('MinExpectedSalary', String(payload.minExpectedSalary));
  if (typeof payload.maxExpectedSalary === 'number') query.set('MaxExpectedSalary', String(payload.maxExpectedSalary));
  if (payload.coverLetter?.trim()) query.set('CoverLetter', payload.coverLetter.trim());
  if (payload.seekerTitle?.trim()) query.set('SeekerTitle', payload.seekerTitle.trim());

  const formData = new FormData();
  formData.append('CvFile', payload.cvFile);

  const response = await fetchWithNetworkError(`${API_BASE}/JobApplication?${query.toString()}`, {
    method: 'POST',
    headers: {
      ...buildAuthHeader(),
    },
    body: formData,
  });

  if (!response.ok) {
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
