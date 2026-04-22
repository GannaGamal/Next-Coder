import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

/**
 * Represents a company returned by the API
 */
export interface CompanyInfo {
  id: string;
  name: string;
  industry: string | null;
  logoUrl: string | null;
}

export interface CompanyDocumentInfo {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export interface CompanyDetailsInfo {
  id: string;
  name: string;
  industry: string | null;
  logoUrl: string | null;
  documents: CompanyDocumentInfo[];
}

export interface AddCompanyPayload {
  name: string;
  industry: string;
}

interface AddCompanyResponse {
  message?: string;
}

interface StoredUserAuth {
  roles: string[];
  employerId: string;
}

const API_ORIGIN = API_BASE.replace(/\/api\/?$/i, '');

const toNonEmptyString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const encodePathSegments = (path: string): string =>
  path
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join('/');

const getStoredUserAuth = (): StoredUserAuth => {
  const storedUserRaw = localStorage.getItem('user');
  if (!storedUserRaw) {
    return { roles: [], employerId: '' };
  }

  try {
    const parsed = JSON.parse(storedUserRaw) as { roles?: unknown; employerId?: unknown };
    const roles = Array.isArray(parsed.roles)
      ? parsed.roles
          .filter((role): role is string => typeof role === 'string')
          .map((role) => role.toLowerCase().trim())
      : [];
    const employerId = String(parsed.employerId ?? '').trim();
    return { roles, employerId };
  } catch {
    return { roles: [], employerId: '' };
  }
};

/**
 * Builds a full file URL from a relative backend path.
 * Example: "Company Logo/a b.jpg" -> "https://nextcoder.runasp.net/Company%20Logo/a%20b.jpg"
 */
export const buildCompanyAssetUrl = (relativePath: string | null | undefined): string | null => {
  const normalized = toNonEmptyString(relativePath);
  if (!normalized) return null;

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const slashNormalized = normalized.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!slashNormalized) {
    return null;
  }

  return `${API_ORIGIN}/${encodePathSegments(slashNormalized)}`;
};

/**
 * Fetches all companies for the given employer ID
 * API Endpoint: GET /api/Employer/myCompanies/{employerId}
 */
export const getEmployerCompanies = async (employerId: string | null | undefined): Promise<CompanyInfo[]> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to fetch your companies.');
  }

  const normalizedId = String(employerId ?? '').trim();
  if (normalizedId.length === 0) {
    throw new Error('Invalid employer ID.');
  }

  try {
    const response = await fetch(`${API_BASE}/Employer/myCompanies/${normalizedId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = await response.json();

    // Handle different API response formats
    const rawItems = Array.isArray(data)
      ? data
      : Array.isArray(data?.value)
        ? data.value
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.companies)
            ? data.companies
            : [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return [];
    }

    // Parse and validate each company item
    const companies: CompanyInfo[] = rawItems
      .map((item: unknown) => {
        const raw = item as Record<string, unknown>;

        const id = raw.id ?? raw.Id ?? raw.companyId ?? raw.CompanyId;
        const name = raw.name ?? raw.Name ?? raw.companyName ?? raw.CompanyName ?? '';
        const industry = raw.industry ?? raw.Industry ?? raw.companyIndustry ?? raw.CompanyIndustry ?? null;
        const logoUrl = raw.logoUrl ?? raw.LogoUrl ?? raw.logo ?? raw.Logo ?? null;

        return {
          id: String(id),
          name: String(name).trim(),
          industry: industry ? String(industry).trim() : null,
          logoUrl: buildCompanyAssetUrl(logoUrl ? String(logoUrl) : null),
        };
      })
      .filter(
        (company): company is CompanyInfo =>
          company.name.length > 0 && String(company.id).trim().length > 0
      );

    return companies;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to load employer companies. Please try again.');
  }
};

/**
 * Adds a new company for the currently authenticated employer.
 * API Endpoint: POST /api/Company/addCompany
 */
export const addCompany = async (payload: AddCompanyPayload): Promise<string> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in as an employer to add a company.');
  }

  const { roles: userRoles, employerId } = getStoredUserAuth();

  if (!userRoles.includes('employer') || employerId.length === 0) {
    throw new Error('Only employers can add a company for their own account.');
  }

  const name = payload.name.trim();
  const industry = payload.industry.trim();

  if (!name || !industry) {
    throw new Error('Company name and industry are required.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Company/addCompany`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, industry }),
    });
  } catch {
    throw new Error('We could not add your company right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return 'Company added successfully';
  }

  try {
    const parsed = JSON.parse(rawText) as AddCompanyResponse;
    if (parsed.message && parsed.message.trim()) {
      return parsed.message.trim();
    }
  } catch {
    // If backend returns plain text, keep default success message.
  }

  return 'Company added successfully';
};

/**
 * Uploads or updates a company logo for the authenticated employer's own company.
 * API Endpoint: POST /api/Company/companyLogo/{companyId}
 */
export const uploadCompanyLogo = async (
  companyId: string | number | null | undefined,
  file: File
): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in as an employer to update your company logo.');
  }

  const { roles, employerId } = getStoredUserAuth();
  if (!roles.includes('employer') || employerId.length === 0) {
    throw new Error('Only employers can upload or update company logos.');
  }

  const normalizedCompanyId = String(companyId ?? '').trim();
  if (!normalizedCompanyId) {
    throw new Error('Invalid company ID.');
  }

  const ownedCompanies = await getEmployerCompanies(employerId);
  const ownsCompany = ownedCompanies.some((company) => company.id === normalizedCompanyId);
  if (!ownsCompany) {
    throw new Error('You can only update the logo for your own company.');
  }

  const formData = new FormData();
  formData.append('logoUrl', file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Company/companyLogo/${encodeURIComponent(normalizedCompanyId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error('We could not upload your company logo right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

/**
 * Uploads a company document for the authenticated employer's own company.
 * API Endpoint: POST /api/Company/uploadDocument/{companyId}
 * Form-data key: File
 */
export const uploadCompanyDocument = async (
  companyId: string | number | null | undefined,
  file: File
): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in as an employer to upload company documents.');
  }

  const { roles, employerId } = getStoredUserAuth();
  if (!roles.includes('employer') || employerId.length === 0) {
    throw new Error('Only employers can upload company documents.');
  }

  const normalizedCompanyId = String(companyId ?? '').trim();
  if (!normalizedCompanyId) {
    throw new Error('Invalid company ID.');
  }

  const ownedCompanies = await getEmployerCompanies(employerId);
  const ownsCompany = ownedCompanies.some((company) => company.id === normalizedCompanyId);
  if (!ownsCompany) {
    throw new Error('You can only upload documents for your own company.');
  }

  const formData = new FormData();
  formData.append('File', file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Company/uploadDocument/${encodeURIComponent(normalizedCompanyId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error('We could not upload your company document right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

/**
 * Fetches a single company details payload by company ID.
 * API Endpoint: GET /api/Company/{companyId}
 */
export const getCompanyDetails = async (
  companyId: string | number | null | undefined
): Promise<CompanyDetailsInfo> => {
  const normalizedId = String(companyId ?? '').trim();
  if (!normalizedId) {
    throw new Error('Invalid company ID.');
  }

  const token = localStorage.getItem('authToken') ?? '';
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Company/${encodeURIComponent(normalizedId)}`, {
      method: 'GET',
      headers,
    });
  } catch {
    throw new Error('We could not load company details right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as Record<string, unknown>;

  const id = payload.id ?? payload.Id ?? normalizedId;
  const name = payload.name ?? payload.Name;
  const industry = payload.industry ?? payload.Industry;
  const logoUrl = payload.logoUrl ?? payload.LogoUrl ?? payload.logo ?? payload.Logo;

  const rawDocuments = Array.isArray(payload.documents)
    ? payload.documents
    : Array.isArray(payload.Documents)
      ? payload.Documents
      : [];

  const documents: CompanyDocumentInfo[] = rawDocuments
    .map((item: unknown, index: number) => {
      const raw = item as Record<string, unknown>;
      const documentId = raw.id ?? raw.Id ?? `${normalizedId}-doc-${index}`;
      const fileName = raw.fileName ?? raw.FileName ?? raw.name ?? raw.Name;
      const filePath = raw.filePath ?? raw.FilePath ?? raw.path ?? raw.Path;
      const uploadedAt = raw.uploadedAt ?? raw.UploadedAt ?? raw.createdAt ?? raw.CreatedAt;

      return {
        id: String(documentId),
        fileName: toNonEmptyString(fileName) ?? 'Document',
        filePath: buildCompanyAssetUrl(toNonEmptyString(filePath)) ?? '',
        uploadedAt: toNonEmptyString(uploadedAt) ?? '',
      };
    })
    .filter((document) => document.filePath.length > 0);

  const parsedName = toNonEmptyString(name);
  if (!parsedName) {
    throw new Error('Company details response is missing a valid company name.');
  }

  return {
    id: String(id),
    name: parsedName,
    industry: toNonEmptyString(industry),
    logoUrl: buildCompanyAssetUrl(toNonEmptyString(logoUrl)),
    documents,
  };
};

/**
 * Downloads a company document by triggering browser download.
 * API Endpoint: GET /api/CompanyDocument/download/{id}
 * Accessible by Job Seekers and Employers.
 */
export const downloadCompanyDocument = async (documentId: string | null | undefined): Promise<void> => {
  const normalizedId = String(documentId ?? '').trim();
  if (!normalizedId) {
    throw new Error('Invalid document ID.');
  }

  const token = localStorage.getItem('authToken') ?? '';
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/CompanyDocument/download/${encodeURIComponent(normalizedId)}`, {
      headers,
    });
  } catch {
    throw new Error('We could not download the document right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  // Extract filename from Content-Disposition header if available
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'document';
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=(?:(['"]).*?\1|[^;\n]*)/);
    if (filenameMatch && filenameMatch[0]) {
      filename = filenameMatch[0].replace(/filename[^;=\n]*=(['"]?)(.+?)\1/i, '$2');
    }
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Deletes a company document for the authenticated employer's own company.
 * API Endpoint: DELETE /api/CompanyDocument/{id}
 * Only Employers can delete documents.
 */
export const deleteCompanyDocument = async (documentId: string | null | undefined): Promise<void> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to delete documents.');
  }

  const { roles } = getStoredUserAuth();
  if (!roles.includes('employer')) {
    throw new Error('Only employers can delete company documents.');
  }

  const normalizedId = String(documentId ?? '').trim();
  if (!normalizedId) {
    throw new Error('Invalid document ID.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/CompanyDocument/${encodeURIComponent(normalizedId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error('We could not delete the document right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
