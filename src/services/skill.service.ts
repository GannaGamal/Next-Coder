import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface ApplicantSkill {
  id: number;
  name: string;
}

const buildAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('authToken') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const mapApplicantSkill = (raw: Record<string, unknown>): ApplicantSkill | null => {
  const id = Number(raw.id ?? raw.skillId ?? raw.Id ?? raw.SkillId ?? raw.skillID ?? raw.SkillID ?? 0);
  const name = String(raw.name ?? raw.skillName ?? raw.Name ?? raw.SkillName ?? raw.skill ?? '').trim();
  if (!Number.isFinite(id) || id <= 0 || !name) {
    return null;
  }
  return { id, name };
};

export const getApplicantSkills = async (jobSeekerId: string): Promise<ApplicantSkill[]> => {
  const normalizedId = String(jobSeekerId ?? '').trim();
  if (!normalizedId) {
    return [];
  }

  const response = await fetch(`${API_BASE}/Skill/${encodeURIComponent(normalizedId)}`, {
    method: 'GET',
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => mapApplicantSkill(item as Record<string, unknown>))
    .filter((skill): skill is ApplicantSkill => Boolean(skill));
};

export const addApplicantSkill = async (skillName: string): Promise<ApplicantSkill | null> => {
  const name = skillName.trim();
  if (!name) {
    throw new Error('Skill name is required.');
  }

  const baseHeaders = {
    ...buildAuthHeader(),
  };

  const postSkill = async (payload: string, contentType: string) => {
    const headers = {
      ...baseHeaders,
      'Content-Type': contentType,
    };

    console.debug('[skill.service] addApplicantSkill payload', {
      contentType,
      payload,
      headers,
    });

    const response = await fetch(`${API_BASE}/Skill`, {
      method: 'POST',
      headers,
      body: payload,
    });

    if (response.ok) {
      const text = await response.text();
      if (!text) {
        return null;
      }

      try {
        const parsed = JSON.parse(text) as Record<string, unknown>;
        return mapApplicantSkill(parsed);
      } catch {
        return null;
      }
    }

    if (response.status === 400) {
      return undefined;
    }

    throw new Error(await parseApiError(response));
  };

  const payloads: Array<{ body: string; contentType: string }> = [
    { body: JSON.stringify({ name }), contentType: 'application/json' },
    { body: JSON.stringify({ skillName: name }), contentType: 'application/json' },
    { body: JSON.stringify(name), contentType: 'application/json' },
    { body: name, contentType: 'text/plain' },
  ];

  for (const attempt of payloads) {
    const result = await postSkill(attempt.body, attempt.contentType);
    if (result !== undefined) {
      return result;
    }
  }

  throw new Error('We could not add this skill right now. Please check the request format.');
};

export const deleteApplicantSkill = async (skillId: number): Promise<void> => {
  if (!Number.isFinite(skillId) || skillId <= 0) {
    throw new Error('Skill ID is required.');
  }

  const response = await fetch(`${API_BASE}/Skill/${skillId}`, {
    method: 'DELETE',
    headers: {
      ...buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
