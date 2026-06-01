import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchRoadmapTracksWithPagination,
  fetchRoadmapTrackbyname,
  enrollInTrack,
  clearRoadmapCache,
  getUserEnrollments,
} from '../../../services/roadmap.service';
import { useAuth } from '../../../contexts/AuthContext';
import type { RoadmapTrack } from '../../../services/roadmap.service';
import TrackDetailModal from './TrackDetailModal';

// ─── Accent palette (deterministic per track name) ───────────────────────────

const ACCENT_COLORS = [
  { bg: 'from-purple-500/20 to-pink-500/20',   border: 'border-purple-500/30',  badge: 'bg-purple-500/20 text-purple-400',  icon: 'text-purple-400',  enroll: 'bg-purple-500 hover:bg-purple-600' },
  { bg: 'from-cyan-500/20 to-blue-500/20',     border: 'border-cyan-500/30',    badge: 'bg-cyan-500/20 text-cyan-400',      icon: 'text-cyan-400',    enroll: 'bg-cyan-500 hover:bg-cyan-600' },
  { bg: 'from-emerald-500/20 to-teal-500/20',  border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-400',icon: 'text-emerald-400', enroll: 'bg-emerald-500 hover:bg-emerald-600' },
  { bg: 'from-orange-500/20 to-yellow-500/20', border: 'border-orange-500/30',  badge: 'bg-orange-500/20 text-orange-400',  icon: 'text-orange-400',  enroll: 'bg-orange-500 hover:bg-orange-600' },
  { bg: 'from-pink-500/20 to-rose-500/20',     border: 'border-pink-500/30',    badge: 'bg-pink-500/20 text-pink-400',      icon: 'text-pink-400',    enroll: 'bg-pink-500 hover:bg-pink-600' },
  { bg: 'from-indigo-500/20 to-violet-500/20', border: 'border-indigo-500/30',  badge: 'bg-indigo-500/20 text-indigo-400',  icon: 'text-indigo-400',  enroll: 'bg-indigo-500 hover:bg-indigo-600' },
];

const getAccent = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
};

// ─── Category Mapping ───────────────────────────────────────────────────────

const CATEGORY_MAPPING: Record<string, { name: string; icon: string; tracks: string[] }> = {
  languages: {
    name: 'Languages',
    icon: 'ri-code-line',
    tracks: ['python', 'javascript', 'typescript', 'java', 'cpp', 'rust', 'php', 'sql'],
  },
  frontend: {
    name: 'Frontend',
    icon: 'ri-layout-grid-line',
    tracks: ['react', 'angular', 'vue', 'frontend', 'design-system', 'ux-design'],
  },
  mobile: {
    name: 'Mobile',
    icon: 'ri-smartphone-line',
    tracks: ['android', 'ios', 'flutter', 'react-native'],
  },
  backend: {
    name: 'Backend',
    icon: 'ri-server-line',
    tracks: ['backend', 'nodejs', 'spring-boot', 'aspnet-core', 'graphql', 'api-design'],
  },
  databases: {
    name: 'Databases',
    icon: 'ri-database-2-line',
    tracks: ['postgresql-dba', 'mongodb', 'redis'],
  },
  'devops-cloud': {
    name: 'DevOps & Cloud',
    icon: 'ri-cloud-line',
    tracks: ['devops', 'aws', 'kubernetes', 'terraform', 'cloudflare', 'linux'],
  },
  'ai-data': {
    name: 'AI & Data',
    icon: 'ri-lightbulb-flash-line',
    tracks: ['ai-agents', 'ai-data-scientist', 'ai-engineer', 'ai-red-teaming', 'mlops', 'data-analyst'],
  },
  'cs-fundamentals': {
    name: 'CS Fundamentals',
    icon: 'ri-function-line',
    tracks: ['computer-science', 'datastructures-and-algorithms', 'software-design-architecture', 'system-design', 'software-architect'],
  },
  specialized: {
    name: 'Specialized',
    icon: 'ri-vip-crown-line',
    tracks: ['blockchain', 'cyber-security', 'game-developer', 'server-side-game-developer', 'git-github'],
  },
  roles: {
    name: 'Roles & Soft Skills',
    icon: 'ri-team-line',
    tracks: ['engineering-manager', 'product-manager', 'devrel', 'technical-writer', 'qa', 'full-stack'],
  },
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

const TrackCardSkeleton = () => (
  <div className="bg-white/5 rounded-2xl border border-white/10 p-5 animate-pulse">
    <div className="h-4 bg-white/10 rounded-full w-3/4 mb-3"></div>
    <div className="h-3 bg-white/10 rounded-full w-1/2 mb-4"></div>
    <div className="flex gap-2 mb-5">
      <div className="h-6 w-20 bg-white/10 rounded-full"></div>
      <div className="h-6 w-24 bg-white/10 rounded-full"></div>
      <div className="h-6 w-28 bg-white/10 rounded-full"></div>
    </div>
    <div className="space-y-2 mb-5">
      {[1,2,3].map(i => <div key={i} className="h-3 bg-white/10 rounded-full w-full"></div>)}
    </div>
    <div className="flex gap-2">
      <div className="h-10 bg-white/10 rounded-xl flex-1"></div>
      <div className="h-10 bg-white/10 rounded-xl flex-1"></div>
    </div>
  </div>
);

// ─── Component ───────────────────────────────────────────────────────────────

interface BrowsePathsProps {
  onRequireRole?: () => void;
}

const BrowsePaths = ({ onRequireRole }: BrowsePathsProps) => {
  const [tracks, setTracks]                             = useState<RoadmapTrack[]>([]);
  const [loading, setLoading]                           = useState(true);
  const [error, setError]                               = useState<string | null>(null);
  const [searchQuery, setSearchQuery]                   = useState('');
  const [selectedCategory, setSelectedCategory]        = useState('all');
  const [selectedTrack, setSelectedTrack]               = useState<RoadmapTrack | null>(null);
  
  // Pagination states
  const [pageNumber, setPageNumber]                     = useState(1);
  const [pageSize] = useState(9);
  const [hasNext, setHasNext]                           = useState(false);
  const [hasPrev, setHasPrev]                           = useState(false);
  const [totalPages, setTotalPages]                     = useState(0);

  // enrollment counts: trackName → number (now directly from API)
  const [enrollCounts, setEnrollCounts]                 = useState<Map<string, number>>(new Map());
  // enrolling in progress: Set of track names currently awaiting POST
  const [enrollingSet, setEnrollingSet]                 = useState<Set<string>>(new Set());
  // enrolled: Set of track names the user has enrolled in this session
  const [enrolledSet, setEnrolledSet]                   = useState<Set<string>>(new Set());
  // per-card enroll error message
  const [enrollErrors, setEnrollErrors]                 = useState<Map<string, string>>(new Map());

  // ── Load tracks ────────────────────────────────────────────────────────────
  const loadTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTracks([]);
    if (searchQuery.trim()) {
      setPageNumber(1); // reset to first page on new search
    }
    try {
      if (selectedCategory !== 'all' && !searchQuery.trim()) {
        const categoryTrackNames = CATEGORY_MAPPING[selectedCategory]?.tracks ?? [];
        const settled = await Promise.allSettled(
          categoryTrackNames.map((name) => fetchRoadmapTrackbyname(name))
        );
        const fetchedTracks = settled
          .filter((result): result is PromiseFulfilledResult<RoadmapTrack> => result.status === 'fulfilled')
          .map((result) => result.value);
        setTracks(fetchedTracks);
        setHasNext(false);
        setHasPrev(false);
        setTotalPages(1);

        const enrollCountMap = new Map<string, number>();
        fetchedTracks.forEach((t) => enrollCountMap.set(t.trackName, t.enrolledUsersCount));
        setEnrollCounts(enrollCountMap);
      } else {
        const result = await fetchRoadmapTracksWithPagination(pageNumber, pageSize, searchQuery);
        if (searchQuery.trim()) {
          let newTracks: RoadmapTrack[] | undefined;
          for (const track of result.tracks) {
            const curr = await fetchRoadmapTrackbyname(track.trackName);
            newTracks = [...(newTracks ?? []), curr];
          }
          setTracks(newTracks ?? []);
        } else {
          setTracks(result.tracks);
        }
        setHasNext(result.hasNext);
        setHasPrev(result.hasPrev);
        setTotalPages(result.totalPages);

        const enrollCountMap = new Map<string, number>();
        result.tracks.forEach((t) => {
          enrollCountMap.set(t.trackName, t.enrolledUsersCount);
        });
        setEnrollCounts(enrollCountMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not load roadmap tracks right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, searchQuery, selectedCategory]);

  useEffect(() => { loadTracks(); }, [loadTracks]);

  const categoryFilters = useMemo(() => {
    return [
      { id: 'all', name: 'All Tracks', icon: 'ri-apps-line' },
      ...Object.entries(CATEGORY_MAPPING).map(([key, value]) => ({
        id: key,
        name: value.name,
        icon: value.icon,
      })),
    ];
  }, []);

  // Load user's current enrollments to mark already-enrolled tracks
  const { isAuthenticated, user } = useAuth();
  useEffect(() => {
    if (!isAuthenticated || !user?.roles.includes('learner')) return;
    let active = true;
    const loadUserEnrollments = async () => {
      try {
        const data = await getUserEnrollments();
        if (!active) return;
        const set = new Set<string>();
        data.forEach(e => set.add(e.trackName));
        setEnrolledSet(set);
      } catch (err) {
        // silently ignore; user can still enroll
      }
    };

    loadUserEnrollments();
    return () => { active = false; };
  }, [isAuthenticated, user]);

  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchesCategory = selectedCategory === 'all' 
        ? true 
        : CATEGORY_MAPPING[selectedCategory]?.tracks.some(
            (catTrack) => track.trackName.toLowerCase() === catTrack.toLowerCase()
          ) ?? false;
      return matchesCategory;
    });
  }, [tracks, selectedCategory]);

  const handleRetry = () => { clearRoadmapCache(); loadTracks(); };

  const handleNextPage = () => {
    if (hasNext) {
      setPageNumber(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrev) {
      setPageNumber(prev => prev - 1);
    }
  };


  // ── Enroll ─────────────────────────────────────────────────────────────────
  const handleEnroll = useCallback(async (e: React.MouseEvent, trackName: string) => {
    e.stopPropagation(); // don't open modal
    if (!isAuthenticated || !user?.roles.includes('learner')) {
      onRequireRole?.();
      return;
    }
    if (enrollingSet.has(trackName) || enrolledSet.has(trackName)) return;

    setEnrollingSet(prev => new Set(prev).add(trackName));
    setEnrollErrors(prev => { const m = new Map(prev); m.delete(trackName); return m; });
    try {
      await enrollInTrack(trackName);
      setEnrolledSet(prev => new Set(prev).add(trackName));
      // bump displayed count optimistically
      setEnrollCounts(prev => {
        const next = new Map(prev);
        const cur = next.get(trackName);
        if (typeof cur === 'number') next.set(trackName, cur + 1);
        return next;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      // If the API says the user is already enrolled, treat it silently as success
      if (msg.includes('already') || msg.includes('enrolled') || msg.includes('exists')) {
        setEnrolledSet(prev => new Set(prev).add(trackName));
      } else {
        setEnrollErrors(prev => new Map(prev).set(trackName, 'We could not enroll you right now. Please try again.'));
      }
    } finally {
      setEnrollingSet(prev => { const s = new Set(prev); s.delete(trackName); return s; });
    }
  }, [enrollingSet, enrolledSet, isAuthenticated, user, onRequireRole]);


  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Category Pills */}
      {!error && (
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {categoryFilters.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setPageNumber(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <i className={cat.icon}></i>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Search + refresh */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
          <input
            type="text"
            placeholder="Search roadmap tracks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
        {!loading && tracks.length > 0 && (
          <button
            onClick={handleRetry}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap text-sm"
          >
            <i className="ri-refresh-line mr-2"></i>Refresh
          </button>
        )}
      </div>

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <TrackCardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 flex items-center justify-center bg-red-500/10 rounded-2xl mx-auto mb-4">
            <i className="ri-error-warning-line text-3xl text-red-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Couldn&apos;t load roadmaps</h3>
          <p className="text-white/50 mb-6 text-sm max-w-md mx-auto">{error}</p>
          <button onClick={handleRetry} className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all cursor-pointer whitespace-nowrap">
            <i className="ri-refresh-line mr-2"></i>Try Again
          </button>
        </div>
      )}

      {/* Track grid */}
      {!loading && !error && (
        <>
          {filteredTracks.length === 0 && !loading ? (
            <div className="text-center py-16">
              <i className="ri-search-line text-6xl text-white/20 mb-4 block"></i>
              <h3 className="text-xl font-semibold text-white mb-2">No tracks found</h3>
              <p className="text-white/60">Try a different search term or category.</p>
            </div>
          ) : (
            <>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTracks.map((track, idx) => {
                  const accent        = getAccent(track.trackName);
                  const totalSub      = track.topics.reduce((a, t) => a + t.subtopics.length, 0);
                  const previewTopics = track.topics.slice(0, 4);
                  const countVal      = enrollCounts.get(track.trackName);
                  const isEnrolling   = enrollingSet.has(track.trackName);
                  const isEnrolled    = enrolledSet.has(track.trackName);
                  const enrollErr     = enrollErrors.get(track.trackName);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedTrack(track)}
                      className={`bg-gradient-to-br ${accent.bg} rounded-2xl border ${accent.border} p-5 flex flex-col hover:scale-[1.02] transition-all duration-200 group cursor-pointer`}
                    >
                      {/* Header row: icon + name + enrollment pill */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 flex items-center justify-center ${accent.badge} rounded-xl flex-shrink-0`}>
                          <i className={`${track.imageUrl || 'ri-road-map-line'} text-xl ${accent.icon}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-base leading-snug">{track.displayName}</h3>
                        <div className="mt-1 h-4">
                            {typeof countVal === 'number' && (
                              <span className="text-xs text-white/50 flex items-center gap-1">
                                <i className="ri-user-follow-line"></i>
                                <strong className="text-white/70">{countVal.toLocaleString()}</strong> enrolled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats badges */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${accent.badge}`}>
                          <i className="ri-node-tree mr-1"></i>{track.topics.length} topics
                        </span>
                        {totalSub > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">
                            <i className="ri-git-branch-line mr-1"></i>{totalSub} subtopics
                          </span>
                        )}
                      </div>

                      {/* Preview topics */}
                      <div className="flex-1 space-y-1.5 mb-5">
                        {previewTopics.map((topic, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2 text-xs text-white/50">
                            <i className="ri-checkbox-blank-circle-fill text-[5px] flex-shrink-0"></i>
                            <span className="truncate">{topic.title}</span>
                          </div>
                        ))}
                        {track.topics.length > 4 && (
                          <div className="text-xs text-white/30 pl-3">+{track.topics.length - 4} more topics</div>
                        )}
                      </div>

                      {/* Enroll error */}
                      {enrollErr && (
                        <p className="text-xs text-red-400 mb-2 text-center">{enrollErr}</p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        {/* View roadmap */}
                        <button
                          onClick={() => setSelectedTrack(track)}
                          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${accent.badge} hover:brightness-125 cursor-pointer`}
                        >
                          <i className="ri-eye-line mr-1.5"></i>View
                        </button>

                        {/* Enroll */}
                        <button
                          onClick={e => handleEnroll(e, track.trackName)}
                          disabled={isEnrolling || isEnrolled}
                          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer text-white disabled:opacity-70 disabled:cursor-not-allowed
                            ${isEnrolled
                              ? 'bg-green-500/30 text-green-400'
                              : `${accent.enroll}`
                            }`}
                        >
                          {isEnrolling ? (
                            <><i className="ri-loader-4-line animate-spin mr-1.5"></i>Enrolling...</>
                          ) : isEnrolled ? (
                            <><i className="ri-check-line mr-1.5"></i>Enrolled</>
                          ) : (
                            <><i className="ri-user-add-line mr-1.5"></i>Enroll</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {(filteredTracks.length > 0) && (
                <div className="mt-12 flex items-center justify-center gap-2 sm:gap-4">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!hasPrev || loading}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center gap-2 ${
                      hasPrev && !loading
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <i className="ri-arrow-left-s-line"></i>
                    <span className="hidden sm:inline"></span>
                  </button>

                  <div className="px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base bg-white/5 text-white">
                    {pageNumber} / {totalPages}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={!hasNext || loading}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center gap-2 ${
                      hasNext && !loading
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="hidden sm:inline"></span>
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Detail modal */}
      {selectedTrack && (
        <TrackDetailModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
      )}
    </>
  );
};

export default BrowsePaths;