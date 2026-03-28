import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

const getToken = () => localStorage.getItem('authToken') ?? '';

/**
 * POST /AppUser/userImage
 * Uploads a new profile photo. Returns the URL of the uploaded image.
 */
export const uploadUserImage = async (file: File): Promise<string> => {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/AppUser/userImage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  const rawText = await response.text();
  try {
    const data = JSON.parse(rawText);
    return (data.imageUrl ?? data.url ?? data.image ?? data) as string;
  } catch {
    return rawText.trim();
  }
};

/**
 * GET /AppUser/userImage
 * Returns the authenticated user's profile photo URL.
 * Returns empty string if no photo is set (404).
 */
export const getUserImage = async (): Promise<string> => {
  const token = getToken();
  if (!token) return '';

  const response = await fetch(`${API_BASE}/AppUser/userImage`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) return '';

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  const rawText = await response.text();
  try {
    const data = JSON.parse(rawText);
    return (data.imageUrl ?? data.url ?? data.image ?? data ?? '') as string;
  } catch {
    return rawText.trim();
  }
};

/**
 * DELETE /AppUser/deleteImage
 * Removes the authenticated user's profile photo.
 */
export const deleteUserImage = async (): Promise<void> => {
  const token = getToken();

  const response = await fetch(`${API_BASE}/AppUser/deleteImage`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }
};
