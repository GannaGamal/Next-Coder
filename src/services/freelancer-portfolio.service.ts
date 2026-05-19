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

const getToken = () => localStorage.getItem('authToken') ?? '';

const toPortfolioDto = (raw: Record<string, unknown>): FreelancerPortfolioDto | null => {
  const id = Number(raw.id ?? raw.Id);
  const title = String(raw.title ?? raw.Title ?? '').trim();
  const portfolioUrl = String(raw.portfolioUrl ?? raw.PortfolioUrl ?? '').trim();
  const categoryId = raw.categoryId ?? raw.CategoryId;
  const categoryName = String(raw.categoryName ?? raw.CategoryName ?? '').trim();
  const description = String(raw.description ?? raw.Description ?? '').trim();
  const uploadedAt = String(raw.uploadedAt ?? raw.UploadedAt ?? '').trim();

  if (!Number.isFinite(id) || !title || !portfolioUrl || !description || !uploadedAt) {
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
  formData.append('portfolioFile.title', String(payload.title ?? '').trim());
  formData.append('portfolioFile.description', String(payload.description ?? '').trim());
  formData.append('portfolioFile.category', String(payload.category ?? '').trim());
  formData.append('portfolioFile.file', payload.file);

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
