import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface FreelancerDocumentDto {
  id: number;
  documentName: string;
  documentUrl: string;
  uploadedAt: string;
}

export interface UploadFreelancerDocumentResult {
  message: string;
  document: FreelancerDocumentDto | null;
}

const getToken = () => localStorage.getItem('authToken') ?? '';

const API_ORIGIN = API_BASE.replace(/\/api\/?$/i, '');

const buildDocumentUrl = (url: string | null | undefined): string => {
  const normalized = String(url ?? '').trim();
  if (!normalized) return '';
  if (/^https?:\/\//i.test(normalized)) return normalized;

  const slashNormalized = normalized.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!slashNormalized) return '';

  return `${API_ORIGIN}/${slashNormalized}`;
};

const toDocumentDto = (raw: Record<string, unknown>): FreelancerDocumentDto | null => {
  const id = Number(raw.id ?? raw.Id);
  const documentName = String(raw.documentName ?? raw.DocumentName ?? '').trim();
  const documentUrlRaw = String(raw.documentUrl ?? raw.DocumentUrl ?? '').trim();
  const uploadedAt = String(raw.uploadedAt ?? raw.UploadedAt ?? '').trim();

  if (!Number.isFinite(id) || !documentName || !uploadedAt) {
    return null;
  }

  return {
    id,
    documentName,
    documentUrl: buildDocumentUrl(documentUrlRaw),
    uploadedAt,
  };
};

const parseDocumentList = (raw: unknown): FreelancerDocumentDto[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => (item && typeof item === 'object' ? toDocumentDto(item as Record<string, unknown>) : null))
    .filter((item): item is FreelancerDocumentDto => Boolean(item));
};

export const getFreelancerDocuments = async (): Promise<FreelancerDocumentDto[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to view your documents.');
  }

  const response = await fetch(`${API_BASE}/Freelancer/documents`, {
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
    return parseDocumentList(data);
  } catch {
    return [];
  }
};

export const uploadFreelancerDocument = async (payload: {
  documentName: string;
  file: File;
}): Promise<UploadFreelancerDocumentResult> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to upload documents.');
  }

  const documentName = String(payload.documentName ?? '').trim();
  if (!documentName) {
    throw new Error('Document name is required.');
  }

  if (!payload.file) {
    throw new Error('Please select a file to upload.');
  }

  const formData = new FormData();
  formData.append('DocumentName', documentName);
  formData.append('File', payload.file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Freelancer/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error('We could not upload your document right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    return { message: 'Document uploaded successfully.', document: null };
  }

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const message = typeof parsed.message === 'string'
      ? parsed.message
      : 'Document uploaded successfully.';
    const data = parsed?.data ?? parsed;
    const document = data && typeof data === 'object'
      ? toDocumentDto(data as Record<string, unknown>)
      : null;

    return { message, document };
  } catch {
    return { message: 'Document uploaded successfully.', document: null };
  }
};

export const deleteFreelancerDocument = async (documentId: number | string): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to delete documents.');
  }

  const normalizedId = String(documentId ?? '').trim();
  if (!normalizedId) {
    throw new Error('Invalid document ID.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Freelancer/documents/${encodeURIComponent(normalizedId)}`, {
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
