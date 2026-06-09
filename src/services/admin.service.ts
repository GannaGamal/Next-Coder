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

/* content management */

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


/* User management */

export type role = 'Admin' | 'Job Seeker' | 'Employer' | 'Learner' | 'Freelancer' | 'Client';

export type userStatus = 'active' | 'inactive';

export interface AdminUserItem {
  appUserId: string;
  fullName: string;
  email: string;
  profileImageUrl: string;
  roles: role[];
  status: userStatus;
  joinedDate: string;
}

export interface AdminUsersListParams {
  SearchTerm?: string;
  Role?: role;
  Status?: userStatus;
  PageSize?: number;
  Page?: number;
}

export interface AdminUpdateUserRolesRequest {
  appUserId: string;
  roles: role[];
}

export interface AdminUsersListMeta {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminUsersList {
  items: AdminUserItem[];
  meta: AdminUsersListMeta;
}

export const getAdminUsersList = async (
  params: AdminUsersListParams = {},
): Promise<AdminUsersList> => {
  const query = new URLSearchParams();
  if (params.SearchTerm) query.append('SearchTerm', params.SearchTerm);
  if (params.Role) query.append('Role', params.Role);
  if (params.Status) query.append('Status', params.Status);
  if (params.Page !== undefined) query.append('Page', String(params.Page));
  if (params.PageSize !== undefined) query.append('PageSize', String(params.PageSize));

  const response = await fetch(`${API_BASE}/Admin/managementList?${query.toString()}`, {
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
    throw new Error('Unable to load admin users list.');
  }

  return body.data as AdminUsersList;
};

export const getAdminUserDetails = async (
  id: string,
): Promise<AdminUserItem> => {
  const response = await fetch(`${API_BASE}/Admin/userDetails/${id}`, {
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
    throw new Error(`Unable to load user details.`);
  }

  return body.data as AdminUserItem;
};

export const toggleAdminUserStatus = async (
  id: string,
): Promise<void> => {
  const response = await fetch(`${API_BASE}/Admin/toggleStatus/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

export const updateAdminUserRoles = async (
  request: AdminUpdateUserRolesRequest,
): Promise<void> => {
  const response = await fetch(`${API_BASE}/Admin/updateRoles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

/* Complaints management */

export interface AdminComplaintSummary {
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface AdminComplaintItem {
  id: number;
  complaintType: string;
  description: string;
  status: string;
  complainantName: string;
  complainantImageUrl: string | null;
  reportedUserImageUrl: string | null;
  complainantRole: string;
  reportedUserName: string;
  projectId: number | null;
  projectTitle: string | null;
  evidenceUrl: string | null;
  submittedAt: string;
}

export interface AdminComplaintListParams {
  Search?: string;
  Status?: string;
  ComplainantRole?: string;
  ComplaintType?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface AdminComplaintList {
  items: AdminComplaintItem[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getAdminComplaintSummary = async (): Promise<AdminComplaintSummary> => {
  const response = await fetch(`${API_BASE}/Admin/summaryforadminreport`, {
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
    throw new Error('Unable to load complaint summary.');
  }

  return body.data as AdminComplaintSummary;
};

export const getAdminComplaintList = async (
  params: AdminComplaintListParams = {},
): Promise<AdminComplaintList> => {
  const query = new URLSearchParams();
  if (params.Search)         query.append('Search', params.Search);
  if (params.Status)         query.append('Status', params.Status);
  if (params.ComplainantRole) query.append('ComplainantRole', params.ComplainantRole);
  if (params.ComplaintType)  query.append('ComplaintType', params.ComplaintType);
  if (params.PageNumber !== undefined) query.append('PageNumber', String(params.PageNumber));
  if (params.PageSize  !== undefined) query.append('PageSize',  String(params.PageSize));

  const response = await fetch(`${API_BASE}/Admin/adminreport?${query.toString()}`, {
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
    throw new Error('Unable to load complaints list.');
  }

  return body.data as AdminComplaintList;
};

/* Complaint detail */

export interface AdminComplaintUserDetail {
  profileId: number;
  fullName: string;
  email: string;
  role: string;
  imageUrl: string | null;
  totalProjects: number;
  rating: number;
  warningsCount: number;
  joinedAt: string;
}

export interface AdminComplaintProjectDetail {
  id: number;
  title: string;
  budget: number;
  status: string;
}

export interface AdminComplaintDetail {
  id: number;
  reportType: string;
  description: string;
  status: string;
  createdAt: string;
  evidenceUrl: string | null;
  project: AdminComplaintProjectDetail | null;
  complainant: AdminComplaintUserDetail;
  reportedUser: AdminComplaintUserDetail;
}

export const getAdminComplaintDetail = async (
  reportId: number,
): Promise<AdminComplaintDetail> => {
  const response = await fetch(`${API_BASE}/Admin/${reportId}`, {
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
    throw new Error('Unable to load complaint details.');
  }

  return body.data as AdminComplaintDetail;
};
