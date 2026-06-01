import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface AdminDashboardSummary {
  totalUsers: number;
  activeFreelancers: number;
  activeClients: number;
  postedJobs: number;
  activeProjects: number;
  platformRevenue: number;
}

export interface AdminContentSummary {
  total: number;
  portfolios: number;
  cVs: number;
  jobs: number;
  projects: number;
}

export type ContentType = 'portfolio' | 'job' | 'cv' | 'project';

export interface AdminContentItem {
  contentId: number;
  title: string;
  type: ContentType;
  authorName: string;
  authorEmail: string;
  status: string;
  postedAt: string;
}

export interface AdminContentListParams {
  Search?: string;
  Type?: ContentType;
  PageNumber?: number;
  PageSize?: number;
}

export interface AdminContentList {
  items: AdminContentItem[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getAdminDashboardSummary = async (): Promise<AdminDashboardSummary> => {
  const response = await fetch(`${API_BASE}/Admin/dashboard`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const body = await response.json();
  if (!body?.success || !body?.data) {
    throw new Error('Unable to load admin dashboard summary.');
  }

  return body.data as AdminDashboardSummary;
};

export const getAdminContentSummary = async (): Promise<AdminContentSummary> => {
  const response = await fetch(`${API_BASE}/Admin/content/summary`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const body = await response.json();
  if (!body?.success || !body?.data) {
    throw new Error('Unable to load admin content summary.');
  }

  return body.data as AdminContentSummary;
};

export const getAdminContentList = async (
  params: AdminContentListParams = {},
): Promise<AdminContentList> => {
  const query = new URLSearchParams();
  if (params.Search) query.append('Search', params.Search);
  if (params.Type)  query.append('Type', params.Type);
  if (params.PageNumber !== undefined) query.append('PageNumber', String(params.PageNumber));
  if (params.PageSize !== undefined) query.append('PageSize', String(params.PageSize));

  const response = await fetch(`${API_BASE}/Admin/content?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const body = await response.json();
  if (!body?.success || !body?.data) {
    throw new Error('Unable to load admin content list.');
  }

  return body.data as AdminContentList;
};

export const getAdminContentDetails = async (
  type: ContentType,
  id: number,
): Promise<AdminContentItem> => {
  const pathType = type.charAt(0).toUpperCase() + type.slice(1);
  const response = await fetch(`${API_BASE}/Admin/contentDetails/${pathType}/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const body = await response.json();
  if (!body?.success || !body?.data) {
    throw new Error(`Unable to load ${type} details.`);
  }

  return body.data as AdminContentItem;
};

export const deleteAdminContent = async (type: ContentType, id: number): Promise<void> => {
  const pathType = type.charAt(0).toUpperCase() + type.slice(1);
  const response = await fetch(`${API_BASE}/Admin/contentRemove/${pathType}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};