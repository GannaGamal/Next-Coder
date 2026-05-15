import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

export interface LearnerEnrollmentDto {
  enrollmentId: number;
  trackName: string;
  completedTopics: number;
  totalTopics: number;
  progressPercent: number;
  isCompleted: boolean;
  enrolledAt: string;
}

export interface LearnerProjectDto {
  projectId: number;
  trackName: string;
  title: string;
  description: string;
  repoUrl: string;
  fileUrl: string;
  submittedAt: string;
}

export interface LearnerProfileDto {
  learnerId: number;
  userId: string;
  fullName: string;
  email: string;
  imageUrl: string | null;
  bio: string | null;
  learningGoals: string | null;
  interests: string[];
  activeRoadmaps: number;
  projectsCompleted: number;
  totalSteps: number;
  completedSteps: number;
  enrollments: LearnerEnrollmentDto[];
  projects: LearnerProjectDto[];
}

export interface UpdateLearnerProfilePayload {
  bio: string;
  learningGoals: string;
}

const API_ORIGIN = API_BASE.replace(/\/api\/?$/i, '');
const getToken = () => localStorage.getItem('authToken') ?? '';

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (item === null || item === undefined ? '' : String(item).trim()))
    .filter((item) => item.length > 0);
};

export const buildLearnerImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;

  const normalized = String(imageUrl).trim();
  if (!normalized || normalized === '/' || normalized === './') return null;

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const slashNormalized = normalized.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!slashNormalized) return null;

  return `${API_ORIGIN}/${slashNormalized}`;
};

const parseLearnerProfileData = (payload: Record<string, unknown>): LearnerProfileDto => ({
  learnerId: Number(payload.learnerId ?? payload.LearnerId ?? 0),
  userId: String(payload.userId ?? payload.UserId ?? ''),
  fullName: String(payload.fullName ?? payload.FullName ?? ''),
  email: String(payload.email ?? payload.Email ?? ''),
  imageUrl: toNullableString(payload.imageUrl ?? payload.ImageUrl),
  bio: toNullableString(payload.bio ?? payload.Bio),
  learningGoals: toNullableString(payload.learningGoals ?? payload.LearningGoals),
  interests: normalizeStringArray(payload.interests ?? payload.Interests),
  activeRoadmaps: Number(payload.activeRoadmaps ?? payload.ActiveRoadmaps ?? 0),
  projectsCompleted: Number(payload.projectsCompleted ?? payload.ProjectsCompleted ?? 0),
  totalSteps: Number(payload.totalSteps ?? payload.TotalSteps ?? 0),
  completedSteps: Number(payload.completedSteps ?? payload.CompletedSteps ?? 0),
  enrollments: (() => {
    const raw = payload.enrollments ?? payload.Enrollments;
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        enrollmentId: Number(entry.enrollmentId ?? entry.EnrollmentId ?? 0),
        trackName: String(entry.trackName ?? entry.TrackName ?? ''),
        completedTopics: Number(entry.completedTopics ?? entry.CompletedTopics ?? 0),
        totalTopics: Number(entry.totalTopics ?? entry.TotalTopics ?? 0),
        progressPercent: Number(entry.progressPercent ?? entry.ProgressPercent ?? 0),
        isCompleted: Boolean(entry.isCompleted ?? entry.IsCompleted ?? false),
        enrolledAt: String(entry.enrolledAt ?? entry.EnrolledAt ?? ''),
      };
    });
  })(),
  projects: (() => {
    const raw = payload.projects ?? payload.Projects;
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        projectId: Number(entry.projectId ?? entry.ProjectId ?? 0),
        trackName: String(entry.trackName ?? entry.TrackName ?? ''),
        title: String(entry.title ?? entry.Title ?? ''),
        description: String(entry.description ?? entry.Description ?? ''),
        repoUrl: String(entry.repoUrl ?? entry.RepoUrl ?? ''),
        fileUrl: String(entry.fileUrl ?? entry.FileUrl ?? ''),
        submittedAt: String(entry.submittedAt ?? entry.SubmittedAt ?? ''),
      };
    });
  })(),
});

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'We could not load your learner profile right now. Please try again.';
};

export const getLearnerProfile = async (): Promise<LearnerProfileDto> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to view this learner profile.');
  }

  const response = await fetch(`${API_BASE}/learner/profile`, {
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
  if (!rawText.trim()) {
    throw new Error('Empty profile response from server.');
  }

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const payload = (parsed.data ?? parsed) as Record<string, unknown>;

    return {
      learnerId: Number(payload.learnerId ?? payload.LearnerId ?? 0),
      userId: String(payload.userId ?? payload.UserId ?? ''),
      fullName: String(payload.fullName ?? payload.FullName ?? ''),
      email: String(payload.email ?? payload.Email ?? ''),
      imageUrl: toNullableString(payload.imageUrl ?? payload.ImageUrl),
      bio: toNullableString(payload.bio ?? payload.Bio),
      learningGoals: toNullableString(payload.learningGoals ?? payload.LearningGoals),
      interests: normalizeStringArray(payload.interests ?? payload.Interests),
      activeRoadmaps: Number(payload.activeRoadmaps ?? payload.ActiveRoadmaps ?? 0),
      projectsCompleted: Number(payload.projectsCompleted ?? payload.ProjectsCompleted ?? 0),
      totalSteps: Number(payload.totalSteps ?? payload.TotalSteps ?? 0),
      completedSteps: Number(payload.completedSteps ?? payload.CompletedSteps ?? 0),
      enrollments: (() => {
        const raw = payload.enrollments ?? payload.Enrollments;
        if (!Array.isArray(raw)) return [];
        return raw.map((item) => {
          const entry = item as Record<string, unknown>;
          return {
            enrollmentId: Number(entry.enrollmentId ?? entry.EnrollmentId ?? 0),
            trackName: String(entry.trackName ?? entry.TrackName ?? ''),
            completedTopics: Number(entry.completedTopics ?? entry.CompletedTopics ?? 0),
            totalTopics: Number(entry.totalTopics ?? entry.TotalTopics ?? 0),
            progressPercent: Number(entry.progressPercent ?? entry.ProgressPercent ?? 0),
            isCompleted: Boolean(entry.isCompleted ?? entry.IsCompleted ?? false),
            enrolledAt: String(entry.enrolledAt ?? entry.EnrolledAt ?? ''),
          };
        });
      })(),
      projects: (() => {
        const raw = payload.projects ?? payload.Projects;
        if (!Array.isArray(raw)) return [];
        return raw.map((item) => {
          const entry = item as Record<string, unknown>;
          return {
            projectId: Number(entry.projectId ?? entry.ProjectId ?? 0),
            trackName: String(entry.trackName ?? entry.TrackName ?? ''),
            title: String(entry.title ?? entry.Title ?? ''),
            description: String(entry.description ?? entry.Description ?? ''),
            repoUrl: String(entry.repoUrl ?? entry.RepoUrl ?? ''),
            fileUrl: String(entry.fileUrl ?? entry.FileUrl ?? ''),
            submittedAt: String(entry.submittedAt ?? entry.SubmittedAt ?? ''),
          };
        });
      })(),
    };
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const updateLearnerProfile = async (
  payload: UpdateLearnerProfilePayload
): Promise<LearnerProfileDto> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to update your learner profile.');
  }

  const response = await fetch(`${API_BASE}/learner/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    throw new Error('Empty response from server.');
  }

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const data = (parsed.data ?? parsed) as Record<string, unknown>;
    return parseLearnerProfileData(data);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const addLearnerInterest = async (name: string): Promise<LearnerProfileDto> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to add an interest.');
  }

  const response = await fetch(`${API_BASE}/learner/interests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    throw new Error('Empty response from server.');
  }

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const data = (parsed.data ?? parsed) as Record<string, unknown>;
    return parseLearnerProfileData(data);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const deleteLearnerInterest = async (name: string): Promise<LearnerProfileDto> => {
  const token = getToken();
  if (!token) {
    throw new Error('You must be signed in to delete an interest.');
  }

  const response = await fetch(`${API_BASE}/learner/interests`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const rawText = await response.text();
  if (!rawText.trim()) {
    throw new Error('Empty response from server.');
  }

  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const data = (parsed.data ?? parsed) as Record<string, unknown>;
    return parseLearnerProfileData(data);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};
