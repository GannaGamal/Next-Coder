import { API_BASE } from './api.config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnrollmentDetail {
  id: number;
  trackName: string;
  userId: string;
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
  trackName: string;
  topics: RoadmapTopic[];
}

// ─── In-memory cache (heavy payload — fetch once per session) ─────────────────

let cachedTracks: RoadmapTrack[] | null = null;
let fetchPromise: Promise<RoadmapTrack[]> | null = null;

/**
 * Fetches all roadmap tracks from the API.
 * Results are cached in-memory so the heavy payload is only downloaded once.
 */
export const fetchRoadmapTracks = async (): Promise<RoadmapTrack[]> => {
  if (cachedTracks) return cachedTracks;

  // Deduplicate concurrent calls — return the same in-flight promise
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const response = await fetch(`${API_BASE}/roadmap/tracks-content`);
    if (!response.ok) {
      throw new Error(`Failed to fetch roadmap tracks (${response.status})`);
    }
    const data: RoadmapTrack[] = await response.json();
    cachedTracks = data;
    return data;
  })();

  try {
    return await fetchPromise;
  } finally {
    // Clear the in-flight promise once settled so error states can be retried
    fetchPromise = null;
  }
};

/** Clears the in-memory cache (useful for manual refresh) */
export const clearRoadmapCache = () => {
  cachedTracks = null;
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
    throw new Error(`Failed to fetch enrollment count for "${trackName}" (${response.status})`);
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
    let message = `Enrollment failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
      else if (typeof data === 'string') message = data;
    } catch { /* ignore parse errors */ }
    throw new Error(message);
  }

  // Optimistically bump the cached count
  const current = enrollmentCountCache.get(trackName) ?? 0;
  enrollmentCountCache.set(trackName, current + 1);
};

// ─── User enrollment management ───────────────────────────────────────────────

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    throw new Error(`Failed to fetch enrollments (${response.status})`);
  }
  return response.json();
};

/**
 * Fetches detailed progress for a specific enrolled track.
 * GET /roadmap/enrollments/{trackName}
 */
export const getTrackEnrollmentDetail = async (trackName: string): Promise<EnrollmentDetail> => {
  const encoded = encodeURIComponent(trackName);
  const response = await fetch(`${API_BASE}/roadmap/enrollments/${encoded}`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch enrollment detail (${response.status})`);
  }
  return response.json();
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
    let message = `Failed to unenroll (${response.status})`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  // Decrement cached enrollment count
  const cur = enrollmentCountCache.get(trackName) ?? 0;
  if (cur > 0) enrollmentCountCache.set(trackName, cur - 1);
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
