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


export interface CreateProjectRequest {
  title: string;
  description: string;
  category: string;
  budget: number;
  duration: number;
  experienceLevel: string;
  durationType: string;
  skills: string[];
  requirements: string[];
  deliverables: string[];
}

export interface CreatedProject {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  experienceLevelId: number;
  experienceLevelName: string;
  budget: number;
  duration: number;
  durationTypeId: number;
  durationTypeName: string;
  status: string;
  clientId: number;
  clientAppUserId: string;
  clientImageUrl?: string | null;
  clientName: string;
  clientRate: number;
  clientTotalProjects: number;
  createdAt: string;
  skills: string[];
  requirements: string[];
  deliverables: string[];
  proposalCount: number;
}

export interface ProjectDetail {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  experienceLevelId: number;
  experienceLevelName: string;
  budget: number;
  duration: number;
  durationTypeId: number;
  durationTypeName: string;
  status: string;
  clientId: number;
  clientAppUserId: string;
  clientImageUrl?: string | null;
  clientName: string;
  clientRate: number;
  clientTotalProjects: number;
  createdAt: string;
  skills: string[];
  requirements: string[];
  deliverables: string[];
  proposalCount: number;
}

// ─── Proposal types ──────────────────────────────────────────────────────────

export type DurationType = 'Days' | 'Weeks' | 'Months';

export interface ProposalMilestoneRequest {
  title: string;
  description: string;
  amount: number;
  duration: number;
  durationType: DurationType;
}

export interface SubmitProposalRequest {
  coverLetter: string;
  milestones: ProposalMilestoneRequest[];
}

export interface ProposalMilestone {
  id: number;
  title: string;
  description: string;
  amount: number;
  duration: number;
  durationType: DurationType;
  status: string;
}

export interface SubmittedProposal {
  id: number;
  coverLetter: string;
  status: string;
  projectId: number;
  freelancerId: number;
  freelancerName: string | null;
  totalAmount: number;
  createdAt: string;
  milestones: ProposalMilestone[];
}

// ─── Lookup types ────────────────────────────────────────────────────────────

export interface LookupItem {
  id: number;
  name: string;
  value: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

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

/**
 * POST /api/FreelanceProject/Project
 * Creates a new freelance project.
 */
export async function createFreelanceProject(
  payload: CreateProjectRequest
): Promise<CreatedProject> {
  const res = await fetch(`${API_BASE}/FreelanceProject/Project`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await handleResponse<CreatedProject>(res);
  return body.data;
}

// ─── Lookup endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/FreelanceProject/Project-categories
 * Returns allowed project categories from the API.
 */
export async function getProjectCategories(): Promise<LookupItem[]> {
  const res = await fetch(`${API_BASE}/FreelanceProject/Project-categories`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data: LookupItem[] = await res.json();
  return data;
}

/**
 * GET /api/FreelanceProject/Project-DurationType
 * Returns allowed duration types (Days / Weeks / Months ...).
 */
export async function getDurationTypes(): Promise<LookupItem[]> {
  const res = await fetch(`${API_BASE}/FreelanceProject/Project-DurationType`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data: LookupItem[] = await res.json();
  return data;
}

/**
 * GET /api/FreelanceProject/Project-ExperienceLevel
 * Returns allowed experience levels.
 */
export async function getExperienceLevels(): Promise<LookupItem[]> {
  const res = await fetch(`${API_BASE}/FreelanceProject/Project-ExperienceLevel`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data: LookupItem[] = await res.json();
  return data;
}

/**
 * GET /api/FreelanceProject/Project
 * Fetch paginated projects with optional filters.
 */
export async function getProjects(params?: {
  Search?: string;
  Category?: string;
  ExperienceLevel?: string;
  Skill?: string;
  SortBy?: string;
  PageNumber?: number;
  PageSize?: number;
  Budget?: string;
  ProjectType?: string;
}): Promise<PaginatedResult<CreatedProject>> {

  let qs = new URLSearchParams();

  if (params) {
    if (params.Search?.trim())
      qs.append('Search', params.Search);

    if (params.Category?.trim())
      qs.append('Category', params.Category);

    if (params.ExperienceLevel?.trim())
      qs.append('ExperienceLevel', params.ExperienceLevel);

    if (params.Skill?.trim())
      qs.append('Skill', params.Skill);

    if (params.SortBy?.trim())
      qs.append('SortBy', params.SortBy);

    if (params.PageNumber)
      qs.append('PageNumber', String(params.PageNumber));

    if (params.PageSize)
      qs.append('PageSize', String(params.PageSize));

    if (params.Budget?.trim())
      qs.append('Budget', params.Budget);

    if (params.ProjectType?.trim())
      qs.append('ProjectType', params.ProjectType);
  }

  let url = `${API_BASE}/FreelanceProject/Project`
  if (qs.toString()) {
  url += `?${qs.toString()}`;
  }
  console.log('Fetching projects with URL:', url);
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders(),
  });

  const body =
    await handleResponse<PaginatedResult<CreatedProject>>(res);

  return body.data;
}

/**
 * GET /api/FreelanceProject/{id}
 * Fetch project details by project ID.
 */
export async function getProjectDetails(id: number): Promise<ProjectDetail> {
  const res = await fetch(`${API_BASE}/FreelanceProject/${id}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const body = await handleResponse<ProjectDetail>(res);
  return body.data;
}

/**
 * POST /api/FreelanceProject/Project/{projectId}/proposals
 * Submit a proposal (with milestones) for a freelance project.
 */
export async function submitProposal(
  projectId: number,
  payload: SubmitProposalRequest
): Promise<SubmittedProposal> {
  const res = await fetch(
    `${API_BASE}/FreelanceProject/Project/${projectId}/proposals`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }
  );
  const body = await handleResponse<SubmittedProposal>(res);
  return body.data;
}