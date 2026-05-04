import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

const buildAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('authToken') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getPublicRoles = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE}/Role/publicRoles`, {
    method: 'GET',
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data.map((role) => String(role));
  }

  if (Array.isArray(data?.data)) {
    return data.data.map((role: unknown) => String(role));
  }

  return [];
};

export const assignNewRole = async (formData: FormData): Promise<void> => {
  const response = await fetch(`${API_BASE}/Role/assignNewRole`, {
    method: 'POST',
    headers: {
      ...buildAuthHeader(),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

export const unassignRole = async (roleName: string): Promise<void> => {
  const normalized = roleName.trim();
  if (!normalized) {
    throw new Error('Role name is required.');
  }

  const response = await fetch(`${API_BASE}/Role/unassignRole/${encodeURIComponent(normalized)}`, {
    method: 'DELETE',
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
