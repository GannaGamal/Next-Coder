
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

interface Achievement {
  id: string;
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

const mockAchievements: Achievement[] = [
  {
    id: '1',
    learner: {
      name: 'Alex Thompson',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20male%20developer%20portrait%20friendly%20approachable%20clean%20background%20casual%20tech%20attire%20confident%20smile&width=100&height=100&seq=ach1&orientation=squarish',
      title: 'Full Stack Developer',
    },
    trackTitle: 'Full Stack Web Development',
    trackCategory: 'fullstack',
    completedDate: '2025-01-15',
    githubLink: 'https://github.com/alexthompson/ecommerce-platform',
    projectTitle: 'E-Commerce Platform',
    projectDescription:
      'A full-featured e-commerce platform built with React, Node.js, and PostgreSQL. Includes user authentication, product management, shopping cart, Stripe payments, and admin dashboard.',
    thumbnail:
      'https://readdy.ai/api/search-image?query=modern%20ecommerce%20web%20application%20dashboard%20interface%20showing%20product%20listings%20shopping%20cart%20clean%20minimalist%20design%20with%20teal%20green%20accents%20on%20dark%20background&width=600&height=400&seq=achproj1&orientation=landscape',
    likes: 142,
    liked: false,
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
  },
  {
    id: '2',
    learner: {
      name: 'Sarah Chen',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20female%20software%20engineer%20portrait%20confident%20smile%20modern%20office%20background%20clean%20headshot&width=100&height=100&seq=ach2&orientation=squarish',
      title: 'Frontend Engineer',
    },
    trackTitle: 'Complete React Developer Path',
    trackCategory: 'frontend',
    completedDate: '2025-02-03',
    githubLink: 'https://github.com/sarahchen/task-manager-pro',
    projectTitle: 'Task Manager Pro',
    projectDescription:
      'A collaborative task management app with real-time updates, drag-and-drop boards, team workspaces, and analytics dashboard. Built entirely with React and Firebase.',
    thumbnail:
      'https://readdy.ai/api/search-image?query=modern%20task%20management%20application%20interface%20with%20kanban%20board%20drag%20and%20drop%20cards%20clean%20design%20with%20warm%20orange%20accents%20on%20dark%20background&width=600&height=400&seq=achproj2&orientation=landscape',
    likes: 98,
    liked: false,
    skills: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
  },
  {
    id: '3',
    learner: {
      name: 'James Park',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20male%20DevOps%20engineer%20portrait%20confident%20smile%20tech%20background%20clean%20headshot%20casual%20attire&width=100&height=100&seq=ach3&orientation=squarish',
      title: 'DevOps Engineer',
    },
    trackTitle: 'DevOps Engineering Path',
    trackCategory: 'devops',
    completedDate: '2025-01-28',
    githubLink: 'https://github.com/jamespark/infra-automation',
    projectTitle: 'Infrastructure Automation Suite',
    projectDescription:
      'A comprehensive CI/CD pipeline with automated testing, Docker containerization, Kubernetes orchestration, and monitoring dashboards using Grafana and Prometheus.',
    thumbnail:
      'https://readdy.ai/api/search-image?query=DevOps%20infrastructure%20monitoring%20dashboard%20with%20pipeline%20visualization%20containers%20metrics%20graphs%20clean%20modern%20design%20with%20teal%20accents%20on%20dark%20background&width=600&height=400&seq=achproj3&orientation=landscape',
    likes: 76,
    liked: false,
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
  },
  {
    id: '4',
    learner: {
      name: 'Dr. Lisa Wang',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20female%20data%20scientist%20portrait%20confident%20smile%20academic%20background%20clean%20headshot%20modern%20attire&width=100&height=100&seq=ach4&orientation=squarish',
      title: 'Data Scientist',
    },
    trackTitle: 'Data Science with Python',
    trackCategory: 'data',
    completedDate: '2025-02-10',
    githubLink: 'https://github.com/lisawang/sentiment-analyzer',
    projectTitle: 'Real-Time Sentiment Analyzer',
    projectDescription:
      'An NLP-powered sentiment analysis tool that processes social media feeds in real-time. Features interactive visualizations, trend detection, and exportable reports.',
    thumbnail:
      'https://readdy.ai/api/search-image?query=data%20science%20analytics%20dashboard%20with%20sentiment%20analysis%20charts%20word%20clouds%20trend%20graphs%20clean%20modern%20design%20with%20warm%20coral%20accents%20on%20dark%20background&width=600&height=400&seq=achproj4&orientation=landscape',
    likes: 215,
    liked: false,
    skills: ['Python', 'TensorFlow', 'NLP', 'Pandas'],
  },
  {
    id: '5',
    learner: {
      name: 'Emma Wilson',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20female%20mobile%20developer%20portrait%20smiling%20confident%20modern%20studio%20background%20clean%20headshot&width=100&height=100&seq=ach5&orientation=squarish',
      title: 'Mobile Developer',
    },
    trackTitle: 'React Native Mobile Development',
    trackCategory: 'mobile',
    completedDate: '2025-01-20',
    githubLink: 'https://github.com/emmawilson/fitness-tracker',
    projectTitle: 'FitTrack - Fitness Companion',
    projectDescription:
      'A cross-platform fitness tracking app with workout plans, progress charts, social challenges, and Apple Health/Google Fit integration. Built with React Native and Expo.',
    thumbnail:
      'https://readdy.ai/api/search-image?query=mobile%20fitness%20tracking%20app%20interface%20showing%20workout%20plans%20progress%20charts%20health%20metrics%20clean%20modern%20design%20with%20green%20accents%20on%20dark%20background&width=600&height=400&seq=achproj5&orientation=landscape',
    likes: 163,
    liked: false,
    skills: ['React Native', 'Expo', 'TypeScript', 'GraphQL'],
  },
  {
    id: '6',
    learner: {
      name: 'Maria Garcia',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20female%20UI%20designer%20portrait%20creative%20confident%20smile%20modern%20studio%20background%20clean%20headshot&width=100&height=100&seq=ach6&orientation=squarish',
      title: 'UI/UX Designer',
    },
    trackTitle: 'UI/UX Design Fundamentals',
    trackCategory: 'design',
    completedDate: '2025-02-18',
    githubLink: 'https://github.com/mariagarcia/design-system',
    projectTitle: 'Harmony Design System',
    projectDescription:
      'A comprehensive design system with 50+ reusable components, accessibility guidelines, dark/light themes, and interactive documentation built with Storybook.',
    thumbnail:
      'https://readdy.ai/api/search-image?query=UI%20design%20system%20showcase%20with%20component%20library%20color%20palettes%20typography%20samples%20clean%20modern%20design%20with%20pink%20magenta%20accents%20on%20dark%20background&width=600&height=400&seq=achproj6&orientation=landscape',
    likes: 189,
    liked: false,
    skills: ['Figma', 'React', 'Storybook', 'CSS'],
  },
];

const categoryFilters = [
  { id: 'all', name: 'All Tracks', icon: 'ri-apps-line' },
  { id: 'frontend', name: 'Frontend', icon: 'ri-layout-line' },
  { id: 'backend', name: 'Backend', icon: 'ri-server-line' },
  { id: 'fullstack', name: 'Full Stack', icon: 'ri-stack-line' },
  { id: 'mobile', name: 'Mobile', icon: 'ri-smartphone-line' },
  { id: 'devops', name: 'DevOps', icon: 'ri-cloud-line' },
  { id: 'data', name: 'Data Science', icon: 'ri-bar-chart-box-line' },
  { id: 'design', name: 'UI/UX', icon: 'ri-palette-line' },
];

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const filteredAchievements = achievements
    .filter((a) => {
      const matchesCategory = selectedCategory === 'all' || a.trackCategory === selectedCategory;
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

  const handleLike = (id: string) => {
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 } : a,
      ),
    );
    if (selectedAchievement?.id === id) {
      setSelectedAchievement((prev) =>
        prev ? { ...prev, liked: !prev.liked, likes: prev.liked ? prev.likes - 1 : prev.likes + 1 } : prev,
      );
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
              <div className="text-3xl font-bold text-white">{achievements.length}</div>
              <div className="text-sm text-white/50">Projects</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {achievements.reduce((acc, a) => acc + a.likes, 0)}
              </div>
              <div className="text-sm text-white/50">Total Likes</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {new Set(achievements.map((a) => a.trackCategory)).size}
              </div>
              <div className="text-sm text-white/50">Tracks Covered</div>
            </div>
          </div>

          <Link
            to="/roadmaps"
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <i className="ri-arrow-left-line"></i>
            Back to Roadmaps
          </Link>
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
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {filteredAchievements.length === 0 ? (
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
                    <img
                      src={achievement.thumbnail}
                      alt={achievement.projectTitle}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
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
                      <img
                        src={achievement.learner.avatar}
                        alt={achievement.learner.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
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
                src={selectedAchievement.thumbnail}
                alt={selectedAchievement.projectTitle}
                className="w-full h-full object-cover object-top"
              />
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
                <img
                  src={selectedAchievement.learner.avatar}
                  alt={selectedAchievement.learner.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
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
