import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

// ─── Response wrapper ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// ─── Domain types ────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalCompletedProjects: number;
  totalActiveProjects: number;
  totalOpenProjects: number;
  totalMoneySpent: number;
}

export interface PostedProject {
  id: number;
  title: string;
  status: string;
  proposalCount: number;
  budget: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  senderName: string;
  senderImage: string;
  createdAt: string;
}

export interface deliverable {
  id: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface ProposalMilestone {
  id: number;
  title: string;
  description: string;
  amount: number;
  duration: number;
  durationType: string;
  deliverables: deliverable[];
}

export interface Proposal {
  id: number;
  freelancerName: string;
  freelancerImageUrl: string;
  coverLetter: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  milestones: ProposalMilestone[];
}

export interface ActiveMilestone {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  clientComment: string | null;
  submissionNote: string | null;
  deliverables: deliverable[];
}

export interface ActiveProject {
  id: number;
  title: string;
  totalBudget: number;
  totalPaid: number;
  remainingAmount: number;
  progressPercent: number;
  freelancerName: string;
  freelancerImageUrl: string;
  milestones: ActiveMilestone[];
  comments: Comment[];
}

export interface CompletedProject {
  id: number;
  title: string;
  milestonesCompletedCount: number;
  totalPaid: number;
  freelancerName: string;
  freelancerImageUrl: string;
  freelancerRatingGivenByClient: number | null;
  isRated: boolean;
  clientRatingFromFreelancer: number | null;
  completedAt: string;
}

export type ReportType =
  | 'MissedDeadline'
  | 'PoorQuality'
  | 'UnprofessionalBehavior'
  | 'Fraud'
  | 'Other';

// ─── Helper ──────────────────────────────────────────────────────────────────

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
});

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<ApiResponse<T>>;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export async function postProjectComment(projectId: number, content: string): Promise<void> {
  const res = await fetch(`${API_BASE}/ClientDashboard/projects/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({projectId, content}),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

/**
 * GET /api/ClientDashboard/summary
 * Returns dashboard statistics (totals for completed, active, open projects and money spent).
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/ClientDashboard/summary`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const body = await handleResponse<DashboardSummary>(res);
  return body.data;
}

/**
 * GET /api/ClientDashboard/projects/posted
 * Returns all projects posted by the current client.
 */
export async function getPostedProjects(): Promise<PostedProject[]> {
  const res = await fetch(`${API_BASE}/ClientDashboard/projects/posted`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const body = await handleResponse<PostedProject[]>(res);
  return body.data;
}

/**
 * GET /api/ClientDashboard/projects/:projectId/proposals
 * Returns all proposals submitted for a given project.
 */
export async function getProjectProposals(projectId: number): Promise<Proposal[]> {
  const res = await fetch(
    `${API_BASE}/ClientDashboard/projects/${projectId}/proposals`,
    { method: 'GET', headers: authHeaders() }
  );
  const body = await handleResponse<Proposal[]>(res);
  return body.data;
}

/**
 * POST /api/ClientDashboard/projects/:projectId/proposals/accept
 * Accepts a freelancer proposal for a project.
 */
export async function acceptProposal(
  projectId: number,
  proposalId: number
): Promise<boolean> {
  const res = await fetch(
    `${API_BASE}/ClientDashboard/projects/${projectId}/proposals/accept`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ proposalId }),
    }
  );
  const body = await handleResponse<boolean>(res);
  return body.data;
}

/**
 * DELETE /api/ClientDashboard/projects/:projectId
 * Deletes a project.
 */
export async function deleteProject(projectId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/ClientDashboard/projects/${projectId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

/**
 * GET /api/ClientDashboard/projects/active
 * Returns active projects currently in progress.
 */
export async function getActiveProjects(): Promise<ActiveProject[]> {
  const res = await fetch(`${API_BASE}/ClientDashboard/projects/active`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const body = await handleResponse<ActiveProject[]>(res);
  return body.data;
}

/**
 * POST /api/ClientDashboard/milestones/approve
 * Approves a submitted milestone.
 */
export async function approveMilestone(milestoneId: number,clientComment: string): Promise<void> {
  const res = await fetch(`${API_BASE}/ClientDashboard/milestones/approve`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ milestoneId, clientComment }),
  });
  await handleResponse<unknown>(res);
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

/**
 * POST /api/ClientDashboard/milestones/request-changes
 * Requests changes on a milestone submission.
 */
export async function requestMilestoneChanges(
  milestoneId: number,
  comment: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/ClientDashboard/milestones/request-changes`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ milestoneId, comment }),
    }
  );
  await handleResponse<unknown>(res);
}

/**
 * GET /api/ClientDashboard/projects/completed
 * Returns completed projects.
 */
export async function getCompletedProjects(): Promise<CompletedProject[]> {
  const res = await fetch(`${API_BASE}/ClientDashboard/projects/completed`, {
    headers: authHeaders(),
  });
  const body = await handleResponse<CompletedProject[]>(res);
  return body.data;
}

/**
 * POST /api/ClientDashboard/rate-freelancer
 * Rates a freelancer after project completion (1–5).
 */
export async function rateFreelancer(
  freelancerId: number,
  rating: number,
  comment: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/ClientDashboard/rate-freelancer`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ freelancerId, rating, comment }),
  });
  await handleResponse<unknown>(res);
}

/**
 * POST /api/ClientDashboard/reports  (multipart/form-data)
 * Creates a report against a freelancer / project.
 */
export async function createReport(params: {
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

  // Omit Content-Type so the browser sets the correct multipart boundary automatically.
  const res = await fetch(`${API_BASE}/ClientDashboard/reports`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
    },
    body: form,
  });
  await handleResponse<unknown>(res);
}