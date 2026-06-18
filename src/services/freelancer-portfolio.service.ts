import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface FreelancerPortfolioDto {
  id: number;
  title: string;
  portfolioUrl: string;
  categoryId?: number | null;
  categoryName: string;
  description: string;
  uploadedAt: string;
}

export interface PortfolioCategoryOption {
  value: string;
  label?: string;
}

const getToken = () => localStorage.getItem('authToken') ?? '';

const toPortfolioDto = (raw: Record<string, unknown>): FreelancerPortfolioDto | null => {
  const id = Number(raw.id ?? raw.Id);
  const title = String(raw.title ?? raw.Title ?? '').trim();
  const portfolioUrl = String(raw.portfolioUrl ?? raw.PortfolioUrl ?? '').trim();
  const categoryId = raw.categoryId ?? raw.CategoryId;
  const categoryName = String(raw.categoryName ?? raw.CategoryName ?? '').trim();
  const description = String(raw.description ?? raw.Description ?? '').trim();
  const uploadedAt = String(raw.uploadedAt ?? raw.UploadedAt ?? '').trim();

  if (!Number.isFinite(id) || !title) {
    return null;
  }

  return {
    id,
    title,
    portfolioUrl,
    categoryId: Number.isFinite(Number(categoryId)) ? Number(categoryId) : null,
    categoryName,
    description,
    uploadedAt,
  };
};

const parsePortfolioList = (raw: unknown): FreelancerPortfolioDto[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (item && typeof item === 'object' ? toPortfolioDto(item as Record<string, unknown>) : null))
    .filter((item): item is FreelancerPortfolioDto => Boolean(item));
};

export const getFreelancerPortfolios = async (): Promise<FreelancerPortfolioDto[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to view your portfolios.');
  }

  const response = await fetch(`${API_BASE}/Freelancer/portfolio`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) return [];

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const data = parsed?.data ?? parsed;
    return parsePortfolioList(data);
  } catch {
    return [];
  }
};

export const addFreelancerPortfolio = async (payload: {
  title: string;
  description: string;
  category: string;
  file: File;
}): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to add a portfolio item.');
  }

  const formData = new FormData();
  formData.append('title', String(payload.title ?? '').trim());
  const desc = String(payload.description ?? '').trim();
  if (desc) {
    formData.append('description', desc);
  }
  formData.append('category', String(payload.category ?? '').trim());
  formData.append('file', payload.file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Freelancer/portfolio`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error('We could not upload your portfolio item right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

export const deleteFreelancerPortfolio = async (id: number | string): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to delete a portfolio item.');
  }

  const response = await fetch(`${API_BASE}/Freelancer/portfolio/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

const normalizeCategoryOption = (item: unknown): PortfolioCategoryOption | null => {
  if (typeof item === 'string') {
    const value = item.trim();
    return value ? { value } : null;
  }

  if (!item || typeof item !== 'object') return null;

  const record = item as Record<string, unknown>;
  const rawValue =
    record.value ??
    record.enumValue ??
    record.rawValue ??
    record.originalValue ??
    record.code ??
    record.key ??
    record.enum ??
    record.category ??
    record.categoryName;
  const labelCandidate = record.label ?? record.displayName ?? record.title ?? record.name;

  const value = typeof rawValue === 'string' ? rawValue.trim() : '';
  const label = typeof labelCandidate === 'string' ? labelCandidate.trim() : undefined;
  if (!value && !label) return null;

  if (!value && label) {
    const normalized = label.replace(/\s+/g, '');
    return normalized ? { value: normalized, label } : null;
  }

  return label ? { value, label } : { value };
};

export const getFreelancerPortfolioCategories = async (): Promise<PortfolioCategoryOption[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to view portfolio categories.');
  }

  const response = await fetch(`${API_BASE}/Freelancer/portfolio-categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) return [];

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const data = parsed?.data ?? parsed;
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as Record<string, unknown>)?.categories)
      ? (data as Record<string, unknown>).categories
      : [];

    if (!Array.isArray(list)) return [];

    return list
      .map((item) => normalizeCategoryOption(item))
      .filter((item): item is PortfolioCategoryOption => Boolean(item));
  } catch {
    return [];
  }
};
