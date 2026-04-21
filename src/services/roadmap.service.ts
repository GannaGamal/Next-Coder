import { API_BASE } from './api.config';
import { parseApiError } from './api.utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnrollmentDetail {
  trackId: number;
  trackName: string;
  userId: string;
  learnerId: number;
  enrolledAt: string;
  completedTopics: number;
  totalTopics: number;
  progressPercent: number;
  isCompleted: boolean;
  hasSubmittedProject: boolean;
  completedNodeIds: string[];
}

export interface RoadmapLink {
  title: string;
  url: string;
  type: string;
}

export interface RoadmapSubtopic {
  nodeId: string;
  title: string;
  description: string;
  links: RoadmapLink[];
}

export interface RoadmapTopic {
  nodeId: string;
  title: string;
  description: string;
  links: RoadmapLink[];
  subtopics: RoadmapSubtopic[];
}

export interface RoadmapTrack {
  id: number;
  trackName: string;
  displayName: string;
  imageUrl: string | null;
  categoryDisplayName: string;
  totalTopics: number;
  enrolledUsersCount: number;
  topics: RoadmapTopic[];
}

export interface PaginationMeta {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedRoadmapResponse {
  items: RoadmapTrack[];
  meta: PaginationMeta;
}

// ─── In-memory cache (heavy payload — fetch once per session) ─────────────────

let cachedTracks: RoadmapTrack[] | null = null;
let cachedPaginationMeta: PaginationMeta | null = null;
let fetchPromise: Promise<RoadmapTrack[]> | null = null;

/**
 * Fetches roadmap tracks from the API with pagination.
 * Results are cached in-memory so the heavy payload is only downloaded once.
 * Default: Page 1, PageSize 100 to load all available tracks in one request
 */
export const fetchRoadmapTracks = async (page: number = 1, pageSize: number = 100): Promise<RoadmapTrack[]> => {
  if (cachedTracks) return cachedTracks;

  // Deduplicate concurrent calls — return the same in-flight promise
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const response = await fetch(
      `${API_BASE}/roadmap/tracks-content?Page=${page}&PageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const responseData = await response.json();
    
    // Handle paginated response: extract items and pagination metadata
    const paginatedData: PaginatedRoadmapResponse = responseData.data || {};
    const data: RoadmapTrack[] = paginatedData.items || [];
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid roadmap tracks response format');
    }
    
    cachedTracks = data;
    cachedPaginationMeta = paginatedData.meta || null;
    
    return data;
  })();

  try {
    return await fetchPromise;
  } finally {
    // Clear the in-flight promise once settled so error states can be retried
    fetchPromise = null;
  }
};

/** Get pagination metadata from the last fetch */
export const getRoadmapPaginationMeta = (): PaginationMeta | null => {
  return cachedPaginationMeta;
};

/** Clears the in-memory cache (useful for manual refresh) */
export const clearRoadmapCache = () => {
  cachedTracks = null;
  cachedPaginationMeta = null;
  fetchPromise = null;
};

// ─── Enrollment count cache (per-track, fetched individually) ─────────────────

const enrollmentCountCache = new Map<string, number>();

/**
 * Fetches the total enrollment count for a given track.
 * Results are cached in-memory per track name.
 * API: GET /roadmap/enrollments/{trackName}/count
 */
export const fetchTrackEnrollmentCount = async (trackName: string): Promise<number> => {
  if (enrollmentCountCache.has(trackName)) {
    return enrollmentCountCache.get(trackName)!;
  }
  const encoded = encodeURIComponent(trackName);
  const response = await fetch(`${API_BASE}/roadmap/enrollments/${encoded}/count`);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const data = await response.json();
  // API may return a plain number or { count: number }
  const count: number = typeof data === 'number' ? data : (data?.count ?? 0);
  enrollmentCountCache.set(trackName, count);
  return count;
};

/**
 * Enrolls the current user in a track.
 * POST /roadmap/enrollments/enrollTrack  { trackName }
 */
export const enrollInTrack = async (trackName: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE}/roadmap/enrollments/enrollTrack`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ trackName }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  // Optimistically bump the cached count
  const current = enrollmentCountCache.get(trackName) ?? 0;
  enrollmentCountCache.set(trackName, current + 1);
};

// ─── User enrollment management ───────────────────────────────────────────────

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

/**
 * Fetches all enrollments for the current authenticated user.
 * GET /roadmap/enrollments
 */
export const getUserEnrollments = async (): Promise<EnrollmentDetail[]> => {
  const response = await fetch(`${API_BASE}/roadmap/enrollments`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const responseData = await response.json();
  // Extract data array from wrapped response
  const enrollments: EnrollmentDetail[] = responseData.data || [];
  if (!Array.isArray(enrollments)) {
    throw new Error('Invalid enrollments response format');
  }
  return enrollments;
};

/**
 * Fetches detailed progress for a specific enrolled track.
 * GET /roadmap/enrollments/{trackName}
 * The API wraps the result in { success, message, data: EnrollmentDetail }.
 */
export const getTrackEnrollmentDetail = async (trackName: string): Promise<EnrollmentDetail> => {
  const encoded = encodeURIComponent(trackName);
  const response = await fetch(`${API_BASE}/roadmap/enrollments/${encoded}`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const responseData = await response.json();
  // Unwrap the API envelope: { success, message, data: EnrollmentDetail }
  return (responseData.data ?? responseData) as EnrollmentDetail;
};

/**
 * Marks a node (topic or subtopic) as completed or uncompleted for the current user.
 * POST /roadmap/enrollments/progress  { trackName, nodeId, isCompleted }
 *
 * The API rejects marking a topic complete if not all its subtopics are done first.
 * Callers should catch the thrown error and display it to the user.
 */
export const updateNodeProgress = async (
  trackName: string,
  nodeId: string,
  isCompleted: boolean
): Promise<void> => {
  const response = await fetch(`${API_BASE}/roadmap/enrollments/progress`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ trackName, nodeId, isCompleted }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

/**
 * Unenrolls the current user from a track.
 * DELETE /roadmap/enrollments/unenroll/{trackName}
 */
export const unenrollFromTrack = async (trackName: string): Promise<void> => {
  const encoded = encodeURIComponent(trackName);
  const response = await fetch(`${API_BASE}/roadmap/enrollments/unenroll/${encoded}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  // Decrement cached enrollment count
  const cur = enrollmentCountCache.get(trackName) ?? 0;
  if (cur > 0) enrollmentCountCache.set(trackName, cur - 1);
};

// ─── Project submission ───────────────────────────────────────────────────────

export interface ProjectSubmission {
  id: number;
  trackName: string;
  userId: string;
  title: string;
  description: string;
  fileUrl: string;
  repoUrl: string;
  submittedAt: string;
}

export interface SubmitProjectPayload {
  trackName: string;
  title: string;
  description?: string;
  repoUrl?: string;
  /** Optional screenshot / cover image for the project */
  file?: File | null;
}

/**
 * Submits a project for a given track.
 * POST /roadmap/projects/SubmitProject  (multipart/form-data)
 * Fields: TrackName, Title, Description, RepoUrl, file (image)
 */
export const submitProject = async (payload: SubmitProjectPayload): Promise<ProjectSubmission> => {
  const token = localStorage.getItem('authToken');

  const formData = new FormData();
  formData.append('TrackName', payload.trackName);
  formData.append('Title', payload.title);
  if (payload.description) formData.append('Description', payload.description);
  if (payload.repoUrl)     formData.append('RepoUrl', payload.repoUrl);
  if (payload.file)        formData.append('file', payload.file);

  const response = await fetch(`${API_BASE}/roadmap/projects/SubmitProject`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type — the browser sets it with the boundary for multipart
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const responseData = await response.json();
  // Unwrap API envelope: { success, message, data: ProjectSubmission }
  return (responseData.data ?? responseData) as ProjectSubmission;
};

/**
 * Fetches the submitted project for the current user on a given track.
 * GET /roadmap/projects/MyProjects/{trackName}
 * Returns null if the user has not submitted a project yet (404 treated as null).
 */
export const getMyProject = async (trackName: string): Promise<ProjectSubmission | null> => {
  const token = localStorage.getItem('authToken');
  const encoded = encodeURIComponent(trackName);
  const response = await fetch(`${API_BASE}/roadmap/projects/MyProjects/${encoded}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const responseData = await response.json();
  return (responseData.data ?? responseData) as ProjectSubmission;
};

/**
 * Deletes the current user's submitted project for a given track.
 * DELETE /roadmap/projects/MyProjects/{trackName}
 */
export const deleteMyProject = async (trackName: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  const encoded = encodeURIComponent(trackName);
  const response = await fetch(`${API_BASE}/roadmap/projects/MyProjects/${encoded}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

/** Returns the link icon class for a given link type */
export const getLinkTypeIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'video':
    case 'youtube':
      return 'ri-youtube-line';
    case 'article':
    case 'blog':
    case 'post':
      return 'ri-article-line';
    case 'documentation':
    case 'docs':
    case 'doc':
      return 'ri-book-2-line';
    case 'course':
      return 'ri-graduation-cap-line';
    case 'github':
    case 'repo':
      return 'ri-github-line';
    default:
      return 'ri-link-line';
  }
};

/** Returns a colour class for the link type badge */
export const getLinkTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'video':
    case 'youtube':
      return 'text-red-400 bg-red-500/10';
    case 'article':
    case 'blog':
    case 'post':
      return 'text-emerald-400 bg-emerald-500/10';
    case 'documentation':
    case 'docs':
    case 'doc':
      return 'text-sky-400 bg-sky-500/10';
    case 'course':
      return 'text-yellow-400 bg-yellow-500/10';
    case 'github':
    case 'repo':
      return 'text-white/70 bg-white/10';
    default:
      return 'text-purple-400 bg-purple-500/10';
  }
};