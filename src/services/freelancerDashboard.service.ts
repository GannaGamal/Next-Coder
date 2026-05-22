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
