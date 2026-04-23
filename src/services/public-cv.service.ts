import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface PublicCvInfo {
  id: string;
  jobSeekerId: string;
  fileName: string;
  filePath: string | null;
  fileUrl: string | null;
  uploadedAt: string | null;
}

interface StoredUserAuth {
  roles: string[];
  jobSeekerId: string;
}

const API_ORIGIN = API_BASE.replace(/\/api\/?$/i, '');

const toNonEmptyString = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

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

const getToken = (): string => localStorage.getItem('authToken') ?? '';

const getStoredUserAuth = (): StoredUserAuth => {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return { roles: [], jobSeekerId: '' };
  }

  try {
    const parsed = JSON.parse(raw) as { roles?: unknown; jobSeekerId?: unknown };
    const roles = Array.isArray(parsed.roles)
      ? parsed.roles
          .filter((role): role is string => typeof role === 'string')
          .map((role) => role.toLowerCase().trim())
      : [];

    return {
      roles,
      jobSeekerId: String(parsed.jobSeekerId ?? '').trim(),
    };
  } catch {
    return { roles: [], jobSeekerId: '' };
  }
};

export const canCurrentUserViewJobSeekerCv = (): boolean => {
  const { roles } = getStoredUserAuth();
  return roles.includes('applicant') || roles.includes('employer');
};

export const canCurrentUserReplaceOwnCv = (profileOwnerJobSeekerId: string | null | undefined): boolean => {
  const { roles, jobSeekerId } = getStoredUserAuth();
  const normalizedOwner = String(profileOwnerJobSeekerId ?? '').trim();

  return (
    roles.includes('applicant')
    && jobSeekerId.length > 0
    && normalizedOwner.length > 0
    && jobSeekerId === normalizedOwner
  );
};

export const buildPublicCvFileUrl = (filePath: string | null | undefined): string | null => {
  const normalized = toNonEmptyString(filePath);
  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const slashNormalized = normalized.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!slashNormalized) {
    return null;
  }

  return `${API_ORIGIN}/${encodePathSegments(slashNormalized)}`;
};

const parsePublicCvInfo = (raw: Record<string, unknown>): PublicCvInfo | null => {
  const id = toNonEmptyString(raw.id ?? raw.Id);
  const filePath = toNonEmptyString(raw.filePath ?? raw.FilePath ?? raw.cvPath ?? raw.CvPath);

  if (!id && !filePath) {
    return null;
  }

  const uploadedAtRaw = toNonEmptyString(raw.uploadedAt ?? raw.UploadedAt ?? raw.createdAt ?? raw.CreatedAt);

  return {
    id: id ?? '',
    jobSeekerId: String(raw.jobSeekerId ?? raw.JobSeekerId ?? '').trim(),
    fileName: String(raw.fileName ?? raw.FileName ?? raw.name ?? raw.Name ?? 'CV.pdf').trim(),
    filePath,
    fileUrl: buildPublicCvFileUrl(filePath),
    uploadedAt: uploadedAtRaw,
  };
};

const parsePublicCvResponse = (data: unknown): PublicCvInfo | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const candidate = data as Record<string, unknown>;

  if (candidate.value && typeof candidate.value === 'object' && !Array.isArray(candidate.value)) {
    const parsedValue = parsePublicCvInfo(candidate.value as Record<string, unknown>);
    if (parsedValue) {
      return parsedValue;
    }
  }

  return parsePublicCvInfo(candidate);
};

export const getJobSeekerCv = async (jobSeekerId: string | null | undefined): Promise<PublicCvInfo | null> => {
  if (!canCurrentUserViewJobSeekerCv()) {
    throw new Error('Only job seekers and employers can view CVs.');
  }

  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to view CVs.');
  }

  const normalizedId = String(jobSeekerId ?? '').trim();
  if (!normalizedId) {
    throw new Error('Invalid job seeker ID.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/PublicCv/getCv/${encodeURIComponent(normalizedId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error('We could not load the CV right now. Please check your connection and try again.');
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawText) as unknown;
    return parsePublicCvResponse(parsed);
  } catch {
    return null;
  }
};

export const replaceCurrentUserCv = async (
  file: File,
  profileOwnerJobSeekerId: string | null | undefined
): Promise<void> => {
  if (!canCurrentUserReplaceOwnCv(profileOwnerJobSeekerId)) {
    throw new Error('Only the owning job seeker can replace this CV.');
  }

  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to replace your CV.');
  }

  if (!(file instanceof File) || file.size <= 0) {
    throw new Error('Please select a valid PDF file.');
  }

  const formData = new FormData();
  formData.append('File', file, file.name);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/PublicCv/replaceCv`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error('We could not upload your CV right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

const getAuthorizedCvResponse = async (endpoint: string): Promise<Response> => {
  if (!canCurrentUserViewJobSeekerCv()) {
    throw new Error('Only job seekers and employers can access CV files.');
  }

  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to access CV files.');
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error('We could not access the CV file right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response;
};

const extractFilenameFromDisposition = (contentDisposition: string | null, fallback: string): string => {
  const defaultName = fallback.trim() || 'cv.pdf';
  if (!contentDisposition) {
    return defaultName;
  }

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]).trim() || defaultName;
    } catch {
      return utfMatch[1].trim() || defaultName;
    }
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim() || defaultName;
  }

  return defaultName;
};

export const viewCvById = async (cvId: string | null | undefined): Promise<void> => {
  const normalizedId = String(cvId ?? '').trim();
  if (!normalizedId) {
    throw new Error('Invalid CV ID.');
  }

  const response = await getAuthorizedCvResponse(`${API_BASE}/PublicCv/view/${encodeURIComponent(normalizedId)}`);
  const fileBlob = await response.blob();
  const objectUrl = URL.createObjectURL(fileBlob);
  window.open(objectUrl, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
};

export const downloadCvById = async (
  cvId: string | null | undefined,
  suggestedFileName: string | null | undefined
): Promise<void> => {
  const normalizedId = String(cvId ?? '').trim();
  if (!normalizedId) {
    throw new Error('Invalid CV ID.');
  }

  const response = await getAuthorizedCvResponse(`${API_BASE}/PublicCv/download/${encodeURIComponent(normalizedId)}`);
  const fileBlob = await response.blob();
  const fallbackName = String(suggestedFileName ?? '').trim() || 'cv.pdf';
  const filename = extractFilenameFromDisposition(response.headers.get('content-disposition'), fallbackName);
  const objectUrl = URL.createObjectURL(fileBlob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);
};
