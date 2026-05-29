import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface PublicFreelancerPortfolioItem {
  portfolioId: number;
  coverImageUrl: string;
  jobTitleName: string;
  freelancerProfileId: number;
  freelancerName: string;
  freelancerImageUrl: string;
  freelancerTitle: string;
  bio: string;
  skills: string[];
  averageRating: number;
  totalCompletedProjects: number;
  totalReviews: number;
}

export interface PublicFreelancerPortfolioListResponse {
  items: PublicFreelancerPortfolioItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  hasPrevious: boolean;
}

export interface PublicFreelancerPortfolioQuery {
  Search?: string;
  Category?: string;
  Skill?: string;
  SortBy?: 'HighestRating' | 'MostCompletedProjects';
  PageNumber?: number;
  PageSize?: number;
}

export interface CreatePublicFreelancerPortfolioPayload {
  JobTitle: string;
  CoverImage: File;
}

const getToken = () => localStorage.getItem('authToken') ?? '';

const toTrimmedString = (value: unknown): string => (value == null ? '' : String(value).trim());

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => toTrimmedString(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildAbsoluteUrl = (value: unknown): string => {
  const url = toTrimmedString(value);
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://nextcoder.runasp.net/${url.replace(/^\/+/, '')}`;
};

const isPortfolioSortBy = (value: string): value is 'HighestRating' | 'MostCompletedProjects' =>
  value === 'HighestRating' || value === 'MostCompletedProjects';

const unwrapData = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object') return payload;
  const record = payload as Record<string, unknown>;
  return record.data ?? record.items ?? record.results ?? record.value ?? payload;
};

const toPortfolioItem = (raw: Record<string, unknown>): PublicFreelancerPortfolioItem | null => {
  const portfolioId = toNumber(raw.portfolioId ?? raw.PortfolioId ?? raw.id ?? raw.Id);
  const freelancerProfileId = toNumber(
    raw.freelancerProfileId ?? raw.FreelancerProfileId ?? raw.freelancerId ?? raw.FreelancerId
  );
  const jobTitleName = toTrimmedString(
    raw.jobTitleName ?? raw.JobTitleName ?? raw.jobTitle ?? raw.JobTitle ?? raw.categoryName ?? raw.CategoryName
  );
  const coverImageUrl = buildAbsoluteUrl(raw.coverImageUrl ?? raw.CoverImageUrl ?? raw.portfolioUrl ?? raw.PortfolioUrl);
  const freelancerName = toTrimmedString(raw.freelancerName ?? raw.FreelancerName ?? raw.fullName ?? raw.FullName);
  const freelancerImageUrl = buildAbsoluteUrl(
    raw.freelancerImageUrl ?? raw.FreelancerImageUrl ?? raw.imageUrl ?? raw.ImageUrl
  );
  const freelancerTitle = toTrimmedString(raw.freelancerTitle ?? raw.FreelancerTitle ?? raw.title ?? raw.Title);
  const bio = toTrimmedString(raw.bio ?? raw.Bio ?? raw.description ?? raw.Description);
  const skills = toStringArray(raw.skills ?? raw.Skills);
  const averageRating = toNumber(raw.averageRating ?? raw.AverageRating ?? raw.rating ?? raw.Rating);
  const totalCompletedProjects = toNumber(
    raw.totalCompletedProjects ?? raw.TotalCompletedProjects ?? raw.completedProjects ?? raw.CompletedProjects
  );
  const totalReviews = toNumber(raw.totalReviews ?? raw.TotalReviews ?? raw.reviewsCount ?? raw.ReviewsCount);

  if (!Number.isFinite(portfolioId) || !Number.isFinite(freelancerProfileId) || !coverImageUrl) {
    return null;
  }

  return {
    portfolioId,
    coverImageUrl,
    jobTitleName: jobTitleName || 'Uncategorized',
    freelancerProfileId,
    freelancerName,
    freelancerImageUrl,
    freelancerTitle,
    bio,
    skills,
    averageRating,
    totalCompletedProjects,
    totalReviews,
  };
};

const toPortfolioList = (raw: unknown): PublicFreelancerPortfolioItem[] => {
  const source = unwrapData(raw);
  const list = Array.isArray(source)
    ? source
    : source && typeof source === 'object'
      ? ((source as Record<string, unknown>).items ??
          (source as Record<string, unknown>).results ??
          (source as Record<string, unknown>).portfolios ??
          (source as Record<string, unknown>).data ??
          [])
      : [];

  if (!Array.isArray(list)) return [];

  return list
    .map((item) => (item && typeof item === 'object' ? toPortfolioItem(item as Record<string, unknown>) : null))
    .filter((item): item is PublicFreelancerPortfolioItem => Boolean(item));
};

const toPagination = (
  raw: unknown,
  fallbackPageNumber: number,
  fallbackPageSize: number,
): PublicFreelancerPortfolioListResponse => {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const pageNumber = toNumber(source.pageNumber ?? source.PageNumber ?? source.page ?? source.Page) || fallbackPageNumber;
  const pageSize = toNumber(source.pageSize ?? source.PageSize ?? source.size ?? source.Size) || fallbackPageSize;
  const totalCount = toNumber(source.totalCount ?? source.TotalCount ?? source.totalItems ?? source.TotalItems);
  const totalPages =
    toNumber(source.totalPages ?? source.TotalPages) ||
    (pageSize > 0 ? Math.max(Math.ceil(totalCount / pageSize), 1) : 1);
  const hasNext = Boolean(source.hasNext ?? source.HasNext ?? (totalPages > 0 ? pageNumber < totalPages : false));
  const hasPrev = Boolean(source.hasPrev ?? source.HasPrev ?? source.hasPrevious ?? source.HasPrevious ?? pageNumber > 1);

  const items = toPortfolioList(raw);

  return {
    items,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    hasPrevious: hasPrev,
  };
};

export const getFreelancerPublicPortfolios = async (
  params: PublicFreelancerPortfolioQuery = {},
): Promise<PublicFreelancerPortfolioListResponse> => {
  const query = new URLSearchParams();

  if (params.Search?.trim()) query.set('Search', params.Search.trim());
  if (params.Category?.trim()) query.set('Category', params.Category.trim());
  if (params.Skill?.trim()) query.set('Skill', params.Skill.trim());
  if (params.SortBy && isPortfolioSortBy(params.SortBy)) query.set('SortBy', params.SortBy);
  if (params.PageNumber) query.set('PageNumber', String(params.PageNumber));
  if (params.PageSize) query.set('PageSize', String(params.PageSize));

  const url = `${API_BASE}/FreelancerPublicPortfolio${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return {
      items: [],
      pageNumber: params.PageNumber ?? 1,
      pageSize: params.PageSize ?? 10,
      totalCount: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
      hasPrevious: false,
    };
  }

  try {
    const parsed = JSON.parse(rawText) as unknown;
    const data = unwrapData(parsed);
    return toPagination(data, params.PageNumber ?? 1, params.PageSize ?? 10);
  } catch {
    return {
      items: [],
      pageNumber: params.PageNumber ?? 1,
      pageSize: params.PageSize ?? 10,
      totalCount: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
      hasPrevious: false,
    };
  }
};

export const createFreelancerPublicPortfolio = async (
  payload: CreatePublicFreelancerPortfolioPayload,
): Promise<PublicFreelancerPortfolioItem> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to create a portfolio item.');
  }

  const formData = new FormData();
  formData.append('JobTitle', String(payload.JobTitle ?? '').trim());
  formData.append('CoverImage', payload.CoverImage);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/FreelancerPublicPortfolio`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error('We could not create your portfolio right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return {
      portfolioId: 0,
      coverImageUrl: '',
      jobTitleName: String(payload.JobTitle).trim(),
      freelancerProfileId: 0,
      freelancerName: '',
      freelancerImageUrl: '',
      freelancerTitle: '',
      bio: '',
      skills: [],
      averageRating: 0,
      totalCompletedProjects: 0,
      totalReviews: 0,
    };
  }

  try {
    const parsed = JSON.parse(rawText) as unknown;
    const data = unwrapData(parsed);
    const list = toPortfolioList(Array.isArray(data) ? data : [data]);
    if (list[0]) return list[0];
  } catch {
    // fall through to default return
  }

  return {
    portfolioId: 0,
    coverImageUrl: '',
    jobTitleName: String(payload.JobTitle).trim(),
    freelancerProfileId: 0,
    freelancerName: '',
    freelancerImageUrl: '',
    freelancerTitle: '',
    bio: '',
    skills: [],
    averageRating: 0,
    totalCompletedProjects: 0,
    totalReviews: 0,
  };
};
