
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import {
  fetchCommunityAchievements,
  likeProject,
  unlikeProject,
  getProjectImageUrl,
  type CommunityAchievementsStats,
  type CommunityAchievement,
} from '../../services/roadmap.service';
import { useParams, useNavigate } from 'react-router-dom';

interface Achievement {
  id: string;
  projectId: number;
  learner: {
    name: string;
    avatar: string;
    title: string;
  };
  trackTitle: string;
  trackCategory: string;
  completedDate: string;
  githubLink: string;
  projectTitle: string;
  projectDescription: string;
  thumbnail: string;
  likes: number;
  liked: boolean;
  skills: string[];
}

const LIKED_PROJECTS_KEY = 'nextcoder:liked-achievement-projects';

const getStoredLikedProjects = (): Set<number> => {
  try {
    const value = localStorage.getItem(LIKED_PROJECTS_KEY);
    return new Set(Array.isArray(JSON.parse(value || '[]')) ? JSON.parse(value || '[]') : []);
  } catch {
    return new Set();
  }
};

const storeLikedProjects = (ids: Set<number>) => {
  localStorage.setItem(LIKED_PROJECTS_KEY, JSON.stringify(Array.from(ids)));
};

const formatTrackName = (trackName: string) =>
  trackName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'NC';

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

const mapAchievement = (achievement: CommunityAchievement, likedProjects: Set<number>): Achievement => ({
  id: String(achievement.projectId),
  projectId: achievement.projectId,
  learner: {
    name: achievement.fullName || 'NextCoder Learner',
    avatar: '',
    title: `${formatTrackName(achievement.trackName)} Learner`,
  },
  trackTitle: formatTrackName(achievement.trackName),
  trackCategory: achievement.trackName,
  completedDate: achievement.completedAt || achievement.submittedAt,
  githubLink: achievement.repoUrl,
  projectTitle: achievement.title,
  projectDescription: achievement.description,
  thumbnail: getProjectImageUrl(achievement.imageUrl),
  likes: achievement.totalLikes ?? 0,
  liked: likedProjects.has(achievement.projectId),
  skills: [formatTrackName(achievement.trackName)],
});

const Achievements = () => {
    const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<CommunityAchievementsStats>({
    totalProjects: 0,
    totalLikes: 0,
    tracksCovered: 0,
    achievements: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeError, setLikeError] = useState('');
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAchievements = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchCommunityAchievements();
        if (!isMounted) return;

        const likedProjects = getStoredLikedProjects();
        setStats(data);
        setAchievements(data.achievements.map((achievement) => mapAchievement(achievement, likedProjects)));
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'We could not load achievements right now.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAchievements();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const filteredAchievements = achievements
    .filter((a) => {
      const matchesCategory = selectedCategory === 'all' 
        ? true 
        : CATEGORY_MAPPING[selectedCategory]?.tracks.some(
            (track) => a.trackCategory.toLowerCase() === track.toLowerCase()
          ) ?? false;
      const matchesSearch =
        a.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.trackTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes;
      return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
    });

  const applyLikeState = (id: string, liked: boolean) => {
    const updateAchievement = (a: Achievement) =>
      a.id === id
        ? { ...a, liked, likes: Math.max(0, a.likes + (liked ? 1 : -1)) }
        : a;

    setAchievements((prev) => prev.map(updateAchievement));
    setSelectedAchievement((prev) => (prev?.id === id ? updateAchievement(prev) : prev));
    setStats((prev) => ({
      ...prev,
      totalLikes: Math.max(0, prev.totalLikes + (liked ? 1 : -1)),
    }));
  };

  const handleLike = async (id: string) => {
    const achievement = achievements.find((item) => item.id === id);
    if (!achievement || pendingLikes.has(id)) return;

    const nextLiked = !achievement.liked;
    setLikeError('');
    setPendingLikes((prev) => new Set(prev).add(id));
    applyLikeState(id, nextLiked);

    try {
      if (nextLiked) {
        await likeProject(achievement.projectId);
      } else {
        await unlikeProject(achievement.projectId);
      }

      const likedProjects = getStoredLikedProjects();
      if (nextLiked) likedProjects.add(achievement.projectId);
      else likedProjects.delete(achievement.projectId);
      storeLikedProjects(likedProjects);
    } catch (err) {
      applyLikeState(id, achievement.liked);
      setLikeError(err instanceof Error ? err.message : 'We could not update this like right now.');
    } finally {
      setPendingLikes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1225]">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-[#1a1f37] to-[#0f1225]">
        <div className="max-w-7xl mx-auto text-center">
           {/* Back button */}
          <button
            onClick={() => navigate('/roadmaps')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-all cursor-pointer mb-6 text-sm group"
          >
            <i className="ri-arrow-left-line group-hover:-translate-x-1 transition-transform"></i>
            Back to Roadmaps
          </button>

          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 mb-6">
            <i className="ri-trophy-line text-yellow-400"></i>
            <span className="text-sm text-yellow-400 font-medium">Learner Achievements</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Community{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Achievements
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
            Explore completed projects from learners who finished their tracks. Get inspired, explore their
            code, and show your appreciation.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.totalProjects || achievements.length}</div>
              <div className="text-sm text-white/50">Projects</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {stats.totalLikes || achievements.reduce((acc, a) => acc + a.likes, 0)}
              </div>
              <div className="text-sm text-white/50">Total Likes</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {stats.tracksCovered || new Set(achievements.map((a) => a.trackCategory)).size}
              </div>
              <div className="text-sm text-white/50">Tracks Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className={cat.icon}></i>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/40"></i>
              <input
                type="text"
                placeholder="Search projects, learners, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-500/50 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  sortBy === 'recent' ? 'bg-yellow-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <i className="ri-time-line mr-1"></i>Recent
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  sortBy === 'popular' ? 'bg-yellow-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <i className="ri-fire-line mr-1"></i>Popular
              </button>
            </div>
          </div>
          {likeError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {likeError}
            </div>
          )}
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                  <div className="h-48 bg-white/10"></div>
                  <div className="p-5 space-y-4">
                    <div className="h-4 w-2/3 bg-white/10 rounded"></div>
                    <div className="h-6 w-4/5 bg-white/10 rounded"></div>
                    <div className="h-16 bg-white/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <i className="ri-error-warning-line text-6xl text-red-400/60 mb-4"></i>
              <h3 className="text-xl font-semibold text-white mb-2">Couldn&apos;t load achievements</h3>
              <p className="text-white/60">{error}</p>
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="text-center py-16">
              <i className="ri-trophy-line text-6xl text-white/20 mb-4"></i>
              <h3 className="text-xl font-semibold text-white mb-2">No achievements found</h3>
              <p className="text-white/60">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-yellow-500/40 transition-all group"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    {achievement.thumbnail ? (
                      <img
                        src={achievement.thumbnail}
                        alt={achievement.projectTitle}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-[#1f2a44] via-[#263154] to-[#15182d] flex items-center justify-center">
                        <i className="ri-code-box-line text-6xl text-yellow-400/70 group-hover:scale-110 transition-transform duration-300"></i>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 backdrop-blur-sm">
                        <i className="ri-trophy-line mr-1"></i>Completed
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-xs text-white/80 bg-white/10 backdrop-blur-sm px-2 py-1 rounded">
                        {achievement.trackTitle}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Learner Info */}
                    <div className="flex items-center gap-3 mb-3">
                      {achievement.learner.avatar ? (
                        <img
                          src={achievement.learner.avatar}
                          alt={achievement.learner.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-300 flex items-center justify-center text-xs font-bold">
                          {getInitials(achievement.learner.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{achievement.learner.name}</div>
                        <div className="text-xs text-white/50">{achievement.learner.title}</div>
                      </div>
                      <span className="text-xs text-white/40">{formatDate(achievement.completedDate)}</span>
                    </div>

                    <h3
                      className="text-lg font-bold text-white mb-2 cursor-pointer hover:text-yellow-400 transition-colors"
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      {achievement.projectTitle}
                    </h3>
                    <p className="text-white/50 text-sm mb-4 line-clamp-2">{achievement.projectDescription}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {achievement.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleLike(achievement.id)}
                        disabled={pendingLikes.has(achievement.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          achievement.liked
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <i className={`${achievement.liked ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                        {achievement.likes}
                      </button>
                      <a
                        href={achievement.githubLink}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer"
                      >
                        <i className="ri-github-fill"></i>
                        View Code
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f37] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            {/* Header Image */}
            <div className="relative h-64">
              <img
                alt={selectedAchievement.projectTitle}
                className="w-full h-full object-cover object-top"
                src={selectedAchievement.thumbnail}
                hidden={!selectedAchievement.thumbnail}
              />
              {!selectedAchievement.thumbnail && (
                <div className="w-full h-full bg-gradient-to-br from-[#1f2a44] via-[#263154] to-[#15182d] flex items-center justify-center">
                  <i className="ri-code-box-line text-7xl text-yellow-400/70"></i>
                </div>
              )}
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a1f37] to-transparent h-24"></div>
            </div>

            <div className="p-6 -mt-8 relative">
              {/* Track Badge */}
              <div className="mb-4">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                  <i className="ri-trophy-line mr-1"></i>
                  {selectedAchievement.trackTitle}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">{selectedAchievement.projectTitle}</h2>

              {/* Learner */}
              <div className="flex items-center gap-3 mb-6">
                {selectedAchievement.learner.avatar ? (
                  <img
                    src={selectedAchievement.learner.avatar}
                    alt={selectedAchievement.learner.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-300 flex items-center justify-center text-sm font-bold">
                    {getInitials(selectedAchievement.learner.name)}
                  </div>
                )}
                <div>
                  <div className="text-white font-medium">{selectedAchievement.learner.name}</div>
                  <div className="text-sm text-white/50">
                    {selectedAchievement.learner.title} &middot; Completed {formatDate(selectedAchievement.completedDate)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">About This Project</h3>
                <p className="text-white/60 leading-relaxed">{selectedAchievement.projectDescription}</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAchievement.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleLike(selectedAchievement.id)}
                  disabled={pendingLikes.has(selectedAchievement.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedAchievement.liked
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <i className={`${selectedAchievement.liked ? 'ri-heart-fill' : 'ri-heart-line'} text-lg`}></i>
                  {selectedAchievement.liked ? 'Liked' : 'Like'} ({selectedAchievement.likes})
                </button>
                <a
                  href={selectedAchievement.githubLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-github-fill text-lg"></i>
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Achievements;
