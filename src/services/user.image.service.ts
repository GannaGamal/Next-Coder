import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

const getToken = () => localStorage.getItem('authToken') ?? '';

/**
 * Helper function to build full image URL from API response
 * @param imagePath The image path returned from API (e.g., "UserImage/6194a3f5..." or "/")
 * @returns Full URL to the image, or empty string if no image
 */
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath || imagePath === '/' || imagePath.trim() === '') return '';
  
  // If it already has the protocol, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it already has the domain, prepend protocol
  if (imagePath.startsWith('nextcoder.runasp.net')) {
    return `https://${imagePath}`;
  }
  
  // Otherwise, prepend the full base URL
  const baseUrl = 'https://nextcoder.runasp.net';
  return `${baseUrl}/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
};

/**
 * POST /AppUser/sharedUserImage
 * Uploads a new profile photo using the shared endpoint. Returns the relative image path.
 * Response: { "success": true, "message": "Image uploaded successfully.", "data": "UserImage/..." }
 */
export const uploadSharedUserImage = async (file: File): Promise<string> => {
  const token = getToken();
  const formData = new FormData();
  formData.append('ImageUrl', file);

  const response = await fetch(`${API_BASE}/AppUser/sharedUserImage`, {
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
    // Extract the image path from the data field
    const imagePath = data.data ?? data.imageUrl ?? data.url ?? data.image ?? data;
    return buildImageUrl(imagePath as string);
  } catch {
    return buildImageUrl(rawText.trim());
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

  const response = await fetch(`${API_BASE}/AppUser/sharedUserImage`, {
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
    const imagePath = data.imageUrl ?? data.url ?? data.image ?? data ?? '';
    return buildImageUrl(imagePath as string);
  } catch {
    return buildImageUrl(rawText.trim());
  }
};

/**
 * DELETE /AppUser/deleteSharedImage
 * Removes the authenticated user's profile photo.
 * Response: { "success": true, "message": "User Image deleted successfully.", "data": null }
 */
export const deleteUserImage = async (): Promise<void> => {
  const token = getToken();

  const response = await fetch(`${API_BASE}/AppUser/deleteSharedImage`, {
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
