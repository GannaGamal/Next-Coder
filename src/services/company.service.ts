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

  const storedUserRaw = localStorage.getItem('user');
  let userRoles: string[] = [];
  let employerId = '';

  if (storedUserRaw) {
    try {
      const parsed = JSON.parse(storedUserRaw) as { roles?: unknown; employerId?: unknown };
      userRoles = Array.isArray(parsed.roles)
        ? parsed.roles
            .filter((role): role is string => typeof role === 'string')
            .map((role) => role.toLowerCase().trim())
        : [];
      employerId = String(parsed.employerId ?? '').trim();
    } catch {
      userRoles = [];
      employerId = '';
    }
  }

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
