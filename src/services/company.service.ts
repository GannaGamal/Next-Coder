import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

/**
 * Represents a company returned by the API
 */
export interface CompanyInfo {
  id: string;
  name: string;
  logoUrl: string | null;
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
        const logoUrl = raw.logoUrl ?? raw.LogoUrl ?? raw.logo ?? raw.Logo ?? null;

        return {
          id: String(id),
          name: String(name).trim(),
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
