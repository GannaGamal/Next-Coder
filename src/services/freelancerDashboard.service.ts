import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface FreelancerDashboardSummary {
  activeProjectsCount: number | null;
  totalEarnings: number | null;
  pendingApplicationsCount: number | null;
  completedProjectsCount: number | null;
}

export interface FreelancerApplication {
  proposalId: number;
  projectId: number;
  projectTitle: string;
  clientName: string;
  description: string | null;
  budget: number | null;
  category: string | null;
  proposalStatus: string | null;
  proposedAmount: number | null;
  skills: string[] | null;
  appliedAt: string | null;
  projectCreatedAt: string | null;
}

export interface FreelancerDeliverable {
  id: number;
  fileUrl: string | null;
  note: string | null;
  uploadedAt: string | null;
}

export interface FreelancerActiveMilestone {
  id: number;
  title: string | null;
  description: string | null;
  amount: number | null;
  duration: number | null;
  durationType: string | null;
  status: string | null;
  clientComment: string | null;
  deliverables: FreelancerDeliverable[] | null;
}

export interface FreelancerActiveProject {
  projectId: number;
  title: string | null;
  clientName: string | null;
  totalBudget: number | null;
  totalPaid: number | null;
  remainingAmount: number | null;
  progressPercent: number | null;
  milestones: FreelancerActiveMilestone[] | null;
  comments: unknown[] | null;
}

export interface FreelancerCompletedProject {
  projectId: number;
  title: string | null;
  status: string | null;
  totalPaid: number | null;
  clientName: string | null;
  clientRatingGivenByFreelancer: number | null;
  clientRatingCommentFromFreelancer: string | null;
  freelancerRatingFromClient: number | null;
  freelancerRatingCommentFromClient: string | null;
  comments: unknown[] | null;
  completedAt: string | null;
}

export type ReportType =
  | 'MissedDeadline'
  | 'PoorQuality'
  | 'UnprofessionalBehavior'
  | 'NonPayment'
  | 'ScopeCreep'
  | 'Unresponsive'
  | 'Harassment'
  | 'UnclearRequirements'
  | 'Fraud'
  | 'Other';

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
});

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  if (res.status === 204) {
    return { success: true, message: '', data: null as T, errors: null };
  }

  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();
  if (!raw.trim()) {
    return { success: true, message: '', data: null as T, errors: null };
  }
  if (!contentType.includes('application/json')) {
    return { success: true, message: '', data: null as T, errors: null };
  }

  return JSON.parse(raw) as ApiResponse<T>;
}

const authMultipartHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
});

/**
 * GET /api/FreelancerDashboard/summary
 * Returns top-level summary statistics for the freelancer dashboard cards.
 */
export async function getFreelancerDashboardSummary(): Promise<FreelancerDashboardSummary> {
  const res = await fetch(`${API_BASE}/FreelancerDashboard/summary`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const body = await handleResponse<FreelancerDashboardSummary>(res);
  return body.data;
}

/**
 * GET /api/FreelancerDashboard/applications
 * Returns all applied projects for the freelancer.
 */
export async function getFreelancerApplications(): Promise<FreelancerApplication[]> {
  const res = await fetch(`${API_BASE}/FreelancerDashboard/applications`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const body = await handleResponse<FreelancerApplication[]>(res);
  return Array.isArray(body.data) ? body.data : [];
}

/**
 * GET /api/FreelancerDashboard/applications/{proposalId}
 * Returns details for a specific application.
 */
export async function getFreelancerApplicationDetails(proposalId: number): Promise<FreelancerApplication> {
  const res = await fetch(`${API_BASE}/FreelancerDashboard/applications/${proposalId}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const body = await handleResponse<FreelancerApplication>(res);
  return body.data;
}

/**
 * GET /api/FreelancerDashboard/projects/active
 * Returns all active freelancer projects.
 */
export async function getFreelancerActiveProjects(): Promise<FreelancerActiveProject[]> {
  const res = await fetch(`${API_BASE}/FreelancerDashboard/projects/active`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const body = await handleResponse<FreelancerActiveProject[]>(res);
  return Array.isArray(body.data) ? body.data : [];
}

/**
 * GET /api/FreelancerDashboard/projects/completed
 * Returns all completed freelancer projects.
 */
export async function getFreelancerCompletedProjects(): Promise<FreelancerCompletedProject[]> {
  const res = await fetch(`${API_BASE}/FreelancerDashboard/projects/completed`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const body = await handleResponse<FreelancerCompletedProject[]>(res);
  return Array.isArray(body.data) ? body.data : [];
}

/**
 * POST /api/FreelancerDashboard/milestones/submit
 * Submits milestone deliverables.
 */
export async function submitFreelancerMilestone(params: {
  milestoneId: number;
  note?: string;
  file: File;
}): Promise<string> {
  const form = new FormData();
  form.append('MilestoneId', String(params.milestoneId));
  form.append('Note', params.note?.trim() ?? '');
  form.append('File', params.file);

  const res = await fetch(`${API_BASE}/FreelancerDashboard/milestones/submit`, {
    method: 'POST',
    headers: authMultipartHeaders(),
    body: form,
  });

  const body = await handleResponse<unknown>(res);
  return body.message || 'Success';
}

/**
 * POST /api/FreelancerDashboard/projects/comments
 * Adds a new comment to an active project.
 */
export async function postFreelancerProjectComment(params: {
  projectId: number;
  content: string;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/FreelancerDashboard/projects/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      projectId: params.projectId,
      content: params.content,
    }),
  });

  const body = await handleResponse<unknown>(res);
  return body.message || 'Success';
}

/**
 * POST /api/FreelancerDashboard/rate-client
 * Submits a freelancer's rating for a client.
 */
export async function rateClient(params: {
  projectId: number;
  rating: number;
  comment: string;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/FreelancerDashboard/rate-client`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      projectId: params.projectId,
      rating: params.rating,
      comment: params.comment,
    }),
  });

  const body = await handleResponse<unknown>(res);
  return body.message || 'Success';
}

/**
 * POST /api/FreelancerDashboard/reports (multipart/form-data)
 * Creates a report against a client / project.
 */
export async function createFreelancerReport(params: {
  projectId: number;
  reportType: ReportType;
  description: string;
  evidence?: File;
}): Promise<void> {
  const form = new FormData();
  form.append('ProjectId', String(params.projectId));
  form.append('ReportType', params.reportType);
  form.append('Description', params.description);
  if (params.evidence) {
    form.append('Evidence', params.evidence);
  }

  const res = await fetch(`${API_BASE}/FreelancerDashboard/reports`, {
    method: 'POST',
    headers: authMultipartHeaders(),
    body: form,
  });

  await handleResponse<unknown>(res);
}

/**
 * DELETE /api/FreelancerDashboard/applications/{proposalId}
 * Removes a rejected application from the list.
 */
export async function deleteFreelancerApplication(proposalId: number): Promise<string> {
  const res = await fetch(`${API_BASE}/FreelancerDashboard/applications/${proposalId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const body = await handleResponse<unknown>(res);
  return body.message || 'Success';
}

/**
 * DELETE /api/FreelancerDashboard/applications/{proposalId}/withdraw
 * Withdraws an application.
 */
export async function withdrawFreelancerApplication(proposalId: number): Promise<string> {
  const res = await fetch(`${API_BASE}/FreelancerDashboard/applications/${proposalId}/withdraw`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const body = await handleResponse<unknown>(res);
  return body.message || 'Success';
}
