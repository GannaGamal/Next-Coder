import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface FreelancerSkill {
  id: number;
  name: string;
}

const getToken = () => localStorage.getItem('authToken') ?? '';

const toSkill = (raw: Record<string, unknown>): FreelancerSkill | null => {
  const id = Number(raw.id ?? raw.Id);
  const name = String(raw.name ?? raw.Name ?? '').trim();

  if (!Number.isFinite(id) || !name) return null;
  return { id, name };
};

const parseSkillList = (raw: unknown): FreelancerSkill[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => (item && typeof item === 'object' ? toSkill(item as Record<string, unknown>) : null))
    .filter((item): item is FreelancerSkill => Boolean(item));
};

export const getFreelancerSkills = async (): Promise<FreelancerSkill[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to view your skills.');
  }

  const response = await fetch(`${API_BASE}/Freelancer/skills`, {
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
    return parseSkillList(data);
  } catch {
    return [];
  }
};

export const addFreelancerSkill = async (name: string): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to update your skills.');
  }

  const body = { name: String(name ?? '').trim() };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Freelancer/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('We could not update your skills right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

export const deleteFreelancerSkill = async (skillId: number): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to update your skills.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/Freelancer/skills/${skillId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error('We could not update your skills right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
