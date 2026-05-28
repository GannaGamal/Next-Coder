import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

const imgBase = "https://nextcoder.runasp.net/";
const token = localStorage.getItem('authToken') ?? '';

export interface PublicProfileSummary {
  userId: string;
  fullName: string;
  email: string;
  imageUrl?: string | null;
  roles: string[];
  jobSeekerId?: string | null;
  employerId?: string | null;
  learnerId?: string | null;
  clientId?: string | null;
  freelancerId?: string | null;
}

export interface ClientPublicProfile{
  id: string;
  appUserId: string;
  fullName: string;
  email: string;
  imageUrl?: string | null;
  bio: string;
  country: string;
  phoneNumber: string;
  websiteUrl?: string | null;
  totalSpent: number;
  totalProjectsPosted: number;
  totalProjectsCompleted: number;
  averageRating: number;
  totalReviews: number;
}

export interface EmployerCV {
  id: string;
  cvUrl: string;
  fileName: string;
  contentType: string;
  uploadedAt: string;
  jobTitle: string;
  isPublic: boolean;
  jobSeekerId: string;
}

export interface jobSeekerPublicProfile {
  fullName: string;
  email: string;
  imageUrl?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  gitHubUrl?: string | null;
  websiteUrl?: string | null;
  education?: string | null;
  experience?: string | null;
  cv?: EmployerCV | null;
}

export interface Portoflio{
  id: string;
  title: string;
  portfolioUrl: string;
  categoryId: number;
  categoryName?: string | null;
  description?: string | null;
  uploadedAt: string;
}

export interface FreelancerDocument {
  id?: string;
  title?: string | null;
  fileName?: string | null;
  documentUrl?: string | null;
  fileUrl?: string | null;
  uploadedAt?: string | null;
  contentType?: string | null;
}

export interface completedProject {
  projectId: string;
  title: string | null;
  description: string | null;
  category: string | null;
  status: string | null;
  budget: number | null;
  totalPaid: number | null;
  completedAt: string | null;
  clientName: string | null;
  clientImageUrl: string | null;
  rating?: number | null;
  comment?: string | null;
}

export interface FreelancerPublicProfile {
  id: string;
  appUserId: string;
  fullName: string;
  email: string;
  imageUrl?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  title?: string | null;
  hourlyRate: number;
  country: string;
  phoneNumber: string;
  yearsOfExperience?: number | null;
  isAvailable: boolean;
  completedProjectsCount: number;
  averageRating: number;
  totalReviews: number;
  gitHubUrl?: string | null;
  completedProjects?: completedProject[];
  skills: string[];
  portfolios: Portoflio[];
  documents?: FreelancerDocument[];
}

export interface Enrollment {
  enrollmentId: string;
  trackName: string;
  completedTopics: number;
  totalTopics: number;
  progressPercent: number;
  isCompleted: boolean;
  enrolledAt: string;
}

export interface Project {
  projectId: string;
  trackName: string;
  title: string;
  description: string;
  repoUrl: string;
  imageUrl: string;
  submittedAt: string;
}

export interface LearnerPublicProfile {
  learnerId: string;
  userId: string;
  address?: string | null;
  fullName: string;
  email: string;
  imageUrl?: string | null;
  bio?: string | null;
  learningGoals?: string | null;
  interests: string[];
  activeRoadmaps: number;
  projectsCompleted: number;
  totalSteps: number;
  completedSteps: number;
  enrollments: Enrollment[];
  projects: Project[];
}

export interface Company {
  id: string;
  name: string;
  industry?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  description?: string | null;
}

export interface EmployerPublicProfile {
  fullName: string;
  email: string;
  imageUrl?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  companiesCount: number;
  companies: Company[];
}
export async function getProfileSummary(userId: string): Promise<PublicProfileSummary> {
  const response = await fetch(`${API_BASE}/AppUser/profileSummary/${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }

  const responseData = await response.json();
  const raw = unwrapApiData(responseData) as Record<string, unknown>;
  return {
    userId: valueAsString(raw.userId ?? raw.UserId ?? raw.id ?? raw.Id),
    fullName: valueAsString(raw.fullName ?? raw.FullName ?? raw.name ?? raw.Name),
    email: valueAsString(raw.email ?? raw.Email),
    imageUrl: buildAbsoluteUrl(raw.imageUrl ?? raw.ImageUrl),
    roles: Array.isArray(raw.roles ?? raw.Roles)
      ? (raw.roles ?? raw.Roles) as string[]
      : [],
    jobSeekerId: valueAsString(raw.jobSeekerId ?? raw.JobSeekerId) || null,
    employerId: valueAsString(raw.employerId ?? raw.EmployerId) || null,
    learnerId: valueAsString(raw.learnerId ?? raw.LearnerId) || null,
    clientId: valueAsString(raw.clientId ?? raw.ClientId) || null,
    freelancerId: valueAsString(raw.freelancerId ?? raw.FreelancerId) || null,
  };
}


export async function getClientPublicProfile(clientId: string): Promise<ClientPublicProfile> {
  const response = await fetch(`${API_BASE}/Client/profile/${clientId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw await parseApiError(response);
  } 
  const responseData = await response.json();
  const raw = unwrapApiData(responseData) as Record<string, unknown>;
  return {
    id: valueAsString(raw.id ?? raw.Id),
    appUserId: valueAsString(raw.appUserId ?? raw.AppUserId),
    fullName: valueAsString(raw.fullName ?? raw.FullName),
    email: valueAsString(raw.email ?? raw.Email),
    imageUrl: buildAbsoluteUrl(raw.imageUrl ?? raw.ImageUrl),
    bio: valueAsString(raw.bio ?? raw.Bio),
    country: valueAsString(raw.country ?? raw.Country ?? raw.address ?? raw.Address),
    phoneNumber: valueAsString(raw.phoneNumber ?? raw.PhoneNumber),
    websiteUrl: valueAsString(raw.websiteUrl ?? raw.WebsiteUrl) || null,
    totalSpent: valueAsNumber(raw.totalSpent ?? raw.TotalSpent),
    totalProjectsPosted: valueAsNumber(raw.totalProjectsPosted ?? raw.TotalProjectsPosted),
    totalProjectsCompleted: valueAsNumber(raw.totalProjectsCompleted ?? raw.TotalProjectsCompleted ?? raw.completedProjects ?? raw.CompletedProjects),
    averageRating: valueAsNumber(raw.averageRating ?? raw.AverageRating ?? raw.rating ?? raw.Rating),
    totalReviews: valueAsNumber(raw.totalReviews ?? raw.TotalReviews ?? raw.reviewsCount ?? raw.ReviewsCount ?? raw.totalRatings ?? raw.TotalRatings),
  };
}

export async function getFreelancerPublicProfile(freelancerId: string): Promise<FreelancerPublicProfile> {
  const response = await fetch(`${API_BASE}/Freelancer/profile/${freelancerId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  const responseData = await response.json();
  const returnData = unwrapApiData(responseData) as Record<string, unknown>;
  returnData.id = valueAsString(returnData.id ?? returnData.Id);
  returnData.appUserId = valueAsString(returnData.appUserId ?? returnData.AppUserId);
  returnData.fullName = valueAsString(returnData.fullName ?? returnData.FullName);
  returnData.email = valueAsString(returnData.email ?? returnData.Email);
  returnData.imageUrl = buildAbsoluteUrl(returnData.imageUrl ?? returnData.ImageUrl);
  returnData.bio = valueAsString(returnData.bio ?? returnData.Bio) || null;
  returnData.websiteUrl = valueAsString(returnData.websiteUrl ?? returnData.WebsiteUrl) || null;
  returnData.gitHubUrl = valueAsString(returnData.gitHubUrl ?? returnData.GitHubUrl) || null;
  returnData.country = valueAsString(returnData.country ?? returnData.Country ?? returnData.address ?? returnData.Address);
  returnData.phoneNumber = valueAsString(returnData.phoneNumber ?? returnData.PhoneNumber);
  returnData.hourlyRate = valueAsNumber(returnData.hourlyRate ?? returnData.HourlyRate);
  returnData.yearsOfExperience = valueAsNumber(returnData.yearsOfExperience ?? returnData.YearsOfExperience);
  returnData.completedProjectsCount = valueAsNumber(returnData.completedProjectsCount ?? returnData.CompletedProjectsCount ?? returnData.completedProjectsTotal ?? returnData.CompletedProjectsTotal);
  returnData.averageRating = valueAsNumber(returnData.averageRating ?? returnData.AverageRating ?? returnData.rating ?? returnData.Rating);
  returnData.totalReviews = valueAsNumber(returnData.totalReviews ?? returnData.TotalReviews ?? returnData.reviewsCount ?? returnData.ReviewsCount ?? returnData.totalRatings ?? returnData.TotalRatings);
  returnData.skills = Array.isArray(returnData.skills ?? returnData.Skills)
    ? returnData.skills ?? returnData.Skills
    : [];
  returnData.portfolios = Array.isArray(returnData.portfolios ?? returnData.Portfolios)
    ? returnData.portfolios ?? returnData.Portfolios
    : [];
  returnData.documents = Array.isArray(returnData.documents ?? returnData.Documents)
    ? returnData.documents ?? returnData.Documents
    : [];
  returnData.completedProjects = Array.isArray(returnData.completedProjects ?? returnData.CompletedProjects)
    ? returnData.completedProjects ?? returnData.CompletedProjects
    : [];

  for (const portfolio of returnData.portfolios as Record<string, unknown>[]) {
    portfolio.id = valueAsString(portfolio.id ?? portfolio.Id);
    portfolio.title = valueAsString(portfolio.title ?? portfolio.Title);
    portfolio.portfolioUrl = buildAbsoluteUrl(portfolio.portfolioUrl ?? portfolio.PortfolioUrl ?? portfolio.fileUrl ?? portfolio.FileUrl);
    portfolio.categoryId = valueAsNumber(portfolio.categoryId ?? portfolio.CategoryId);
    portfolio.categoryName = valueAsString(portfolio.categoryName ?? portfolio.CategoryName) || null;
    portfolio.description = valueAsString(portfolio.description ?? portfolio.Description) || null;
    portfolio.uploadedAt = valueAsString(portfolio.uploadedAt ?? portfolio.UploadedAt);
  }

  returnData.documents = ((returnData.documents ?? []) as Record<string, unknown>[]).map((document: Record<string, unknown>, index: number) => ({
    id: valueAsString(document.id ?? document.Id) || String(index),
    title: valueAsString(document.title ?? document.Title) || null,
    fileName: valueAsString(document.fileName ?? document.FileName ?? document.name ?? document.Name) || null,
    documentUrl: buildAbsoluteUrl(document.documentUrl ?? document.DocumentUrl ?? document.fileUrl ?? document.FileUrl ?? document.filePath ?? document.FilePath),
    fileUrl: buildAbsoluteUrl(document.fileUrl ?? document.FileUrl ?? document.documentUrl ?? document.DocumentUrl ?? document.filePath ?? document.FilePath),
    uploadedAt: valueAsString(document.uploadedAt ?? document.UploadedAt ?? document.createdAt ?? document.CreatedAt) || null,
    contentType: valueAsString(document.contentType ?? document.ContentType) || null,
  })) as unknown as FreelancerDocument[];

  returnData.completedProjects = ((returnData.completedProjects as Record<string, unknown>[]) ?? []).map((project) => ({
    projectId: valueAsString(project.projectId ?? project.ProjectId ?? project.id ?? project.Id),
    title: valueAsString(project.title ?? project.Title) || null,
    clientName: valueAsString(project.clientName ?? project.ClientName ?? project.client ?? project.Client) || null,
    clientImageUrl: buildAbsoluteUrl(project.clientImageUrl ?? project.ClientImageUrl ?? project.clientAvatar ?? project.ClientAvatar),
    description: valueAsString(project.description ?? project.Description) || null,
    category: valueAsString(project.category ?? project.Category) || null,
    budget: valueAsNumber(project.budget ?? project.Budget),
    totalPaid: valueAsNumber(project.totalPaid ?? project.TotalPaid),
    completedAt: valueAsString(project.completedAt ?? project.CompletedAt ?? project.completedDate ?? project.CompletedDate) || null,
    rating: valueAsNumber(project.rating ?? project.Rating),
    comment: valueAsString(project.comment ?? project.Comment ?? project.review ?? project.Review) || null,
    status: valueAsString(project.status ?? project.Status) || null,
  })) as unknown as completedProject[];

  return returnData as unknown as FreelancerPublicProfile;
}



export async function getLearnerPublicProfile(learnerId: string): Promise<LearnerPublicProfile> {
  const response = await fetch(`${API_BASE}/learner/${learnerId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  const responseData = await response.json();
  const returnData = responseData.data;
  returnData.imageUrl = buildAbsoluteUrl(returnData.imageUrl ?? returnData.ImageUrl);
  return returnData as LearnerPublicProfile;
}

const unwrapApiData = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const record = payload as Record<string, unknown>;
  return record.data ?? record.value ?? payload;
};

const valueAsString = (value: unknown): string => (value == null ? '' : String(value));

const valueAsNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const buildAbsoluteUrl = (url: unknown): string => {
  if(url == '' || url == null || url == undefined || url == '/') return '';
  const value = valueAsString(url).trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return imgBase + value.replace(/^\/+/, '');
};

const normalizeCompany = (raw: Record<string, unknown>): Company => ({
  id: valueAsString(raw.id ?? raw.Id ?? raw.companyId ?? raw.CompanyId ?? raw.name ?? raw.Name),
  name: valueAsString(raw.name ?? raw.Name ?? raw.companyName ?? raw.CompanyName) || 'Company',
  industry: valueAsString(raw.industry ?? raw.Industry ?? raw.industryName ?? raw.IndustryName) || 'Not specified',
  logoUrl: buildAbsoluteUrl(raw.logoUrl ?? raw.LogoUrl ?? raw.logo ?? raw.Logo ?? raw.imageUrl ?? raw.ImageUrl) || null,
  website: valueAsString(raw.website ?? raw.Website ?? raw.websiteUrl ?? raw.WebsiteUrl) || null,
  description: valueAsString(raw.description ?? raw.Description) || null,
});

const extractCompanies = (payload: unknown): Company[] => {
  if (!payload || typeof payload !== 'object') return [];

  const source = unwrapApiData(payload);
  if (Array.isArray(source)) {
    return source
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map(normalizeCompany);
  }

  if (!source || typeof source !== 'object') return [];
  const record = source as Record<string, unknown>;
  const candidates = [
    record.companies,
    record.Companies,
    record.myCompanies,
    record.MyCompanies,
    record.company,
    record.Company,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        .map(normalizeCompany);
    }

    if (candidate && typeof candidate === 'object') {
      return [normalizeCompany(candidate as Record<string, unknown>)];
    }
  }

  return [];
};

export async function getJobSeekerCV(jobSeekerId: string): Promise<EmployerCV | null> {
  const response = await fetch(`${API_BASE}/PublicCv/getCv/${encodeURIComponent(jobSeekerId)}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw await parseApiError(response);
  } 

  const responseData = await response.json();
  const cv = unwrapApiData(responseData);
  if (!cv || typeof cv !== 'object') {
    return null;
  }

  const raw = cv as Record<string, unknown>;
  return {
    id: valueAsString(raw.id ?? raw.Id),
    cvUrl: valueAsString(raw.cvUrl ?? raw.CvUrl ?? raw.fileUrl ?? raw.FileUrl ?? raw.filePath ?? raw.FilePath),
    fileName: valueAsString(raw.fileName ?? raw.FileName ?? raw.name ?? raw.Name) || 'CV.pdf',
    contentType: valueAsString(raw.contentType ?? raw.ContentType) || 'application/pdf',
    uploadedAt: valueAsString(raw.uploadedAt ?? raw.UploadedAt ?? raw.createdAt ?? raw.CreatedAt),
    jobTitle: valueAsString(raw.jobTitle ?? raw.JobTitle ?? raw.title ?? raw.Title),
    isPublic: typeof (raw.isPublic ?? raw.IsPublic) === 'boolean'
      ? Boolean(raw.isPublic ?? raw.IsPublic)
      : true,
    jobSeekerId: valueAsString(raw.jobSeekerId ?? raw.JobSeekerId),
  };
}
export async function getJobSeekerPublicProfile(jobSeekerId: string): Promise<jobSeekerPublicProfile> {
  const response = await fetch(`${API_BASE}/JobSeeker/profile/${jobSeekerId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  const responseData = await response.json();
  const raw = unwrapApiData(responseData) as Record<string, unknown>;
  const imageUrl = valueAsString(raw.imageUrl ?? raw.ImageUrl);
  let cv: EmployerCV | null = null;

  try {
    cv = await getJobSeekerCV(jobSeekerId);
    if (cv?.cvUrl) {
      cv = { ...cv, cvUrl: imgBase + cv.cvUrl };
    }
  } catch {
    cv = null;
  }

  return {
    fullName: valueAsString(raw.fullName ?? raw.FullName),
    email: valueAsString(raw.email ?? raw.Email),
    imageUrl: buildAbsoluteUrl(imageUrl),
    phoneNumber: valueAsString(raw.phoneNumber ?? raw.PhoneNumber) || null,
    address: valueAsString(raw.address ?? raw.Address) || null,
    gitHubUrl: valueAsString(raw.gitHubUrl ?? raw.GitHubUrl) || null,
    websiteUrl: valueAsString(raw.websiteUrl ?? raw.WebsiteUrl) || null,
    education: valueAsString(raw.education ?? raw.Education) || null,
    experience: valueAsString(raw.experience ?? raw.Experience) || null,
    cv,
  };
}


export async function GetEmployerCompanies(employerId: string): Promise<Company[]> {
  const response = await fetch(`${API_BASE}/Employer/myCompanies/${employerId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  const responseData = await response.json();
  return extractCompanies(responseData);
}

export async function getEmployerPublicProfile(employerId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/Employer/profile/${employerId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  const responseData = await response.json();
  const returnData = unwrapApiData(responseData) as Record<string, unknown>;
  returnData.imageUrl = buildAbsoluteUrl(returnData.imageUrl ?? returnData.ImageUrl);
  const profileCompanies = extractCompanies(returnData);
  try {
    const ownedCompanies = await GetEmployerCompanies(employerId);
    returnData.companies = ownedCompanies.length > 0 ? ownedCompanies : profileCompanies;
  } catch {
    returnData.companies = profileCompanies;
  }
  return returnData;
}
