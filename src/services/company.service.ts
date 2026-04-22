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

export interface AddCompanyPayload {
  name: string;
  industry: string;
}

interface AddCompanyResponse {
  message?: string;
}

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
          logoUrl: logoUrl ? String(logoUrl) : null,
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
