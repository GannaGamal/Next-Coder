import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

/**
 * Employer profile information returned from API
 */
export interface EmployerProfileData {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  bio?: string | null;
  company?: string | null;
  companies?: CompanyData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateEmployerContactPayload {
  phoneNumber: string;
  address: string;
  websiteUrl: string;
}

/**
 * Company data within employer profile
 */
export interface CompanyData {
  id: string;
  name: string;
  industry?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  description?: string | null;
}

/**
 * Fetches an employer's profile data
 * API Endpoint: GET /api/Employer/profile/{employerId}
 * Accessible by: Job Seekers and Employers
 */
export const getEmployerProfile = async (employerId: string | null | undefined): Promise<EmployerProfileData> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to view employer profiles.');
  }

  const normalizedId = String(employerId ?? '').trim();
  if (normalizedId.length === 0) {
    throw new Error('Invalid employer ID.');
  }

  try {
    const response = await fetch(`${API_BASE}/Employer/profile/${normalizedId}`, {
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
    if (!data) {
      throw new Error('Employer profile not found.');
    }

    // Parse employer profile with flexible property names
    const raw = data as Record<string, unknown>;

    const profile: EmployerProfileData = {
      id: String(raw.id ?? raw.Id ?? raw.employerId ?? raw.EmployerId ?? ''),
      userId: String(raw.userId ?? raw.UserId ?? raw.id ?? raw.Id ?? ''),
      name: String(raw.name ?? raw.Name ?? ''),
      email: String(raw.email ?? raw.Email ?? ''),
      avatar: raw.avatar ? String(raw.avatar) : raw.Avatar ? String(raw.Avatar) : null,
      phoneNumber: raw.phoneNumber ? String(raw.phoneNumber) : raw.PhoneNumber ? String(raw.PhoneNumber) : raw.phone ? String(raw.phone) : raw.Phone ? String(raw.Phone) : null,
      address: raw.address ? String(raw.address) : raw.Address ? String(raw.Address) : raw.location ? String(raw.location) : raw.Location ? String(raw.Location) : null,
      websiteUrl: raw.websiteUrl ? String(raw.websiteUrl) : raw.WebsiteUrl ? String(raw.WebsiteUrl) : raw.website ? String(raw.website) : raw.Website ? String(raw.Website) : null,
      bio: raw.bio ? String(raw.bio) : raw.Bio ? String(raw.Bio) : null,
      company: raw.company ? String(raw.company) : raw.Company ? String(raw.Company) : null,
      createdAt: raw.createdAt ? String(raw.createdAt) : raw.CreatedAt ? String(raw.CreatedAt) : undefined,
      updatedAt: raw.updatedAt ? String(raw.updatedAt) : raw.UpdatedAt ? String(raw.UpdatedAt) : undefined,
    };

    // Parse companies array if present
    const companiesRaw = Array.isArray(raw.companies)
      ? raw.companies
      : Array.isArray(raw.Companies)
        ? raw.Companies
        : [];

    if (Array.isArray(companiesRaw) && companiesRaw.length > 0) {
      profile.companies = companiesRaw
        .map((item: unknown) => {
          const companyRaw = item as Record<string, unknown>;
          return {
            id: String(companyRaw.id ?? companyRaw.Id ?? companyRaw.companyId ?? companyRaw.CompanyId ?? ''),
            name: String(companyRaw.name ?? companyRaw.Name ?? companyRaw.companyName ?? companyRaw.CompanyName ?? ''),
            industry: companyRaw.industry ? String(companyRaw.industry) : companyRaw.Industry ? String(companyRaw.Industry) : null,
            logoUrl: companyRaw.logoUrl ? String(companyRaw.logoUrl) : companyRaw.LogoUrl ? String(companyRaw.LogoUrl) : null,
            website: companyRaw.website ? String(companyRaw.website) : companyRaw.Website ? String(companyRaw.Website) : null,
            description: companyRaw.description ? String(companyRaw.description) : companyRaw.Description ? String(companyRaw.Description) : null,
          };
        })
        .filter(
          (company): company is CompanyData =>
            company.id.length > 0 && company.name.length > 0
        );
    }

    return profile;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to load employer profile. Please try again.');
  }
};

/**
 * Updates logged-in employer contact data.
 * API Endpoint: PUT /api/Employer/profile
 * Only employers can update their own profile.
 */
export const updateEmployerProfile = async (payload: UpdateEmployerContactPayload): Promise<UpdateEmployerContactPayload> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to update your profile.');
  }

  const body: UpdateEmployerContactPayload = {
    phoneNumber: String(payload.phoneNumber ?? '').trim(),
    address: String(payload.address ?? '').trim(),
    websiteUrl: String(payload.websiteUrl ?? '').trim(),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Employer/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Network connection issue. Please check your internet and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = await response.json();
  const raw = (data ?? {}) as Record<string, unknown>;

  return {
    phoneNumber: String(raw.phoneNumber ?? raw.PhoneNumber ?? body.phoneNumber),
    address: String(raw.address ?? raw.Address ?? body.address),
    websiteUrl: String(raw.websiteUrl ?? raw.WebsiteUrl ?? body.websiteUrl),
  };
};
