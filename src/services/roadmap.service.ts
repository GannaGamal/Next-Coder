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

// ─── Recommendation ───────────────────────────────────────────────────────────

export interface RecommendationPayload {
  python: number;
  java: number;
  cpp: number;
  javaScript: number;
  cSharp: number;
  php: number;
  ruby: number;
  swift: number;
  go: number;
  rust: number;
  softwareDevelopmentExperience: number;
  databaseManagement: number;
  networkingSkills: number;
  webDevelopmentExperience: number;
  communicationSkills: number;
  problemSolvingAbilities: number;
  teamworkCollaboration: number;
  timeManagement: number;
  adaptability: number;
  preferences: 'Coding' | 'Design' | 'Management' | 'Research';
  internshipExperience: boolean;
  certificationsAndTraining: boolean;
  leadershipExperience: boolean;
}

export interface RecommendationResult {
  displayName: string;
  trackName: string;
  confidence: number;
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: RecommendationResult[];
}

/**
 * Submits user skill/experience data and returns ranked track recommendations.
 * POST https://nextcoder.runasp.net/api/recommendation
 */
export const fetchTrackRecommendations = async (
  payload: RecommendationPayload
): Promise<RecommendationResult[]> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('https://nextcoder.runasp.net/api/recommendation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 
    'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data: RecommendationResponse = await response.json();

  if (!data.success || !Array.isArray(data.recommendations)) {
    throw new Error('Invalid recommendation response format');
  }

  return data.recommendations;
};

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

/**
 * Fetches roadmap tracks with pagination support (non-cached).
 * Returns both the tracks and pagination metadata for UI pagination.
 */

export const fetchRoadmapTrackbyname = async (trackName: string): Promise<RoadmapTrack> => {
  const encoded = encodeURIComponent(trackName);
  const response = await fetch(`${API_BASE}/roadmap/${encoded}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }   
  const responseData = await response.json();
  const track: RoadmapTrack = responseData.data;
  if (!track || typeof track !== 'object') {
    throw new Error('Invalid roadmap track response format');
  }
  return track;
}

export const fetchRoadmapTracksWithPagination = async (
  page: number = 1,
  pageSize: number = 9,
  searchQuery: string = ''
): Promise<{ tracks: RoadmapTrack[]; hasNext: boolean; hasPrev: boolean; totalPages: number; pageNumber: number }> => {
  let url = `${API_BASE}/roadmap/tracks-content?Page=${page}&PageSize=${pageSize}`;

  if (searchQuery.trim()) {
    const encodedQuery = encodeURIComponent(searchQuery.trim());
    url = `${API_BASE}/roadmap/search?query=${encodedQuery}&Page=${page}&PageSize=${pageSize}`;
  }
  
  const response = await fetch(url);

  if(response.status === 404) {
    // No results found is treated as empty list with no pagination
    return {
      tracks: [],
      hasNext: false,
      hasPrev: false,
      totalPages: 1,
      pageNumber: page,
    };
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const responseData = await response.json();
  
  // Handle paginated response: extract items and pagination metadata
  const paginatedData: PaginatedRoadmapResponse = responseData.data || {};
  const tracks: RoadmapTrack[] = paginatedData.items || [];
  const meta = paginatedData.meta || {};
  
  if (!Array.isArray(tracks)) {
    throw new Error('Invalid roadmap tracks response format');
  }
  
  return {
    tracks,
    hasNext: meta.hasNextPage ?? false,
    hasPrev: meta.hasPreviousPage ?? false,
    totalPages: meta.totalPages ?? 1,
    pageNumber: page,
  };
};

/**
 * Searches roadmap tracks by query with pagination.
 * GET /api/roadmap/search?query={query}&Page={page}&PageSize={pageSize}
 */


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
  imageUrl: string;
  repoUrl: string;
  submittedAt: string;
}

export interface CommunityAchievement {
  learnerId: number;
  userId: string;
  fullName: string;
  trackName: string;
  projectId: number;
  title: string;
  description: string;
  repoUrl: string;
  imageUrl: string;
  submittedAt: string;
  completedAt: string;
  totalLikes: number;
}

export interface CommunityAchievementsStats {
  totalProjects: number;
  totalLikes: number;
  tracksCovered: number;
  achievements: CommunityAchievement[];
}

export interface SubmitProjectPayload {
  trackName: string;
  title: string;
  description?: string;
  repoUrl?: string;
  /** Optional screenshot / cover image for the project */
  photo?: File | null;
  file?: File | null;
}

/**
 * Submits a project for a given track.
 * POST /roadmap/projects/SubmitProject  (multipart/form-data)
 * Fields: TrackName, Title, Description, RepoUrl, Photo (image)
 */
export const submitProject = async (payload: SubmitProjectPayload): Promise<ProjectSubmission> => {
  const token = localStorage.getItem('authToken');

  const formData = new FormData();
  formData.append('TrackName', payload.trackName);
  formData.append('Title', payload.title);
  formData.append('Description', payload.description ?? '');
  formData.append('RepoUrl', payload.repoUrl ?? '');
  const photo = payload.photo ?? payload.file;
  if (photo) formData.append('Photo', photo);

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

/**
 * Fetches public community achievements with aggregate stats.
 * GET /Achievement
 */
export const fetchCommunityAchievements = async (): Promise<CommunityAchievementsStats> => {
  const response = await fetch(`${API_BASE}/Achievement`, {
    headers: { ...authHeaders() },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const responseData = await response.json();
  const data = responseData.data ?? responseData;

  return {
    totalProjects: Number(data?.totalProjects ?? 0),
    totalLikes: Number(data?.totalLikes ?? 0),
    tracksCovered: Number(data?.tracksCovered ?? 0),
    achievements: Array.isArray(data?.achievements) ? data.achievements : [],
  };
};

const updateProjectLike = async (projectId: number, action: 'like' | 'unlike'): Promise<void> => {
  const response = await fetch(`${API_BASE}/ProjectLike/${action}?projectId=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

export const likeProject = (projectId: number): Promise<void> => updateProjectLike(projectId, 'like');

export const unlikeProject = (projectId: number): Promise<void> => updateProjectLike(projectId, 'unlike');

/**
 * Converts a relative image URL to absolute URL for project images.
 * If the URL is already absolute, it returns it as-is.
 */
export const getProjectImageUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  return `https://nextcoder.runasp.net/${relativeUrl}`;
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