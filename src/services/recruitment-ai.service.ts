import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface CalculateScorePayload {
  jobSeekerId: number;
  jobPostId: number;
}

export interface CalculateScoreResult {
  jobSeekerId: number;
  jobPostId: number;
  score: number;
}

const buildAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('authToken') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Calls POST /api/RecruitmentAi/calculate-score for a single applicant.
 * The backend calculates and persists the match score.
 * Returns the stored score (0–100).
 */
export const calculateMatchScore = async (
  payload: CalculateScorePayload
): Promise<CalculateScoreResult> => {
  const token = localStorage.getItem('authToken') ?? '';
  if (!token) {
    throw new Error('You must be signed in to calculate match scores.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/RecruitmentAi/calculate-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Network error. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    // 204 No Content — treat as success with no score returned
    return { ...payload, score: 0 };
  }

  try {
    const envelope = JSON.parse(rawText) as Record<string, unknown>;

    // API response shape: { success, message, data: { final_score, ... }, errors }
    const dataObj =
      envelope.data && typeof envelope.data === 'object'
        ? (envelope.data as Record<string, unknown>)
        : envelope;

    // Use final_score as the primary field; fall back to other conventions
    const raw =
      dataObj.final_score ??
      dataObj.finalScore ??
      dataObj.FinalScore ??
      envelope.score ??
      envelope.Score ??
      envelope.matchScore ??
      0;

    const score = Number(raw);
    return {
      jobSeekerId: payload.jobSeekerId,
      jobPostId: payload.jobPostId,
      score: Number.isFinite(score) ? Math.round(Math.max(0, Math.min(100, score))) : 0,
    };
  } catch {
    return { ...payload, score: 0 };
  }
};
