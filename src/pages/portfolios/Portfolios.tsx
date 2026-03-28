import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ComplaintModal from '../../components/feature/ComplaintModal';
import RoleGateModal from '../../components/feature/RoleGateModal';
import CustomSelect from '../../components/base/CustomSelect';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Portfolio {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  projectImages: string[];
  skills: string[];
  likes: number;
  views: number;
  rating: number;
  completedProjects: number;
  hourlyRate: string;
  isVerified: boolean;
}

const Portfolios = () => {
  const { user, isAuthenticated } = useAuth();
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showRoleGateModal, setShowRoleGateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<{ name: string; avatar: string } | null>(null);
  const [likedPortfolios, setLikedPortfolios] = useState<Set<string>>(new Set());

  const toggleLikePortfolio = (portfolioId: string) => {
    setLikedPortfolios(prev => {
      const next = new Set(prev);
      if (next.has(portfolioId)) {
        next.delete(portfolioId);
      } else {
        next.add(portfolioId);
      }
      return next;
    });
  };

  const categories = [
    'All Categories',
    'Web Development',
    'Mobile Apps',
    'UI/UX Design',
    'Graphic Design',
    'Data Science',
    'DevOps',
    'Blockchain',
    'Game Development'
  ];

  const allSkills = [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java',
    'Swift', 'Kotlin', 'Flutter', 'Figma', 'Adobe XD', 'Photoshop',
    'AWS', 'Docker', 'Kubernetes', 'TensorFlow', 'Solidity', 'Unity'
  ];

  const portfolios: Portfolio[] = [
    {
      id: '1',
      freelancerId: '1',
      freelancerName: 'Sarah Johnson',
      freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20female%20web%20developer%20portrait%20confident%20smile%20modern%20tech%20office%20clean%20white%20background%20business%20casual%20attire&width=100&height=100&seq=port1&orientation=squarish',
      title: 'E-Commerce Platform Redesign',
      category: 'Web Development',
      description: 'Complete redesign and development of a modern e-commerce platform with React and Node.js. Implemented real-time inventory management and seamless checkout experience.',
      coverImage: 'https://readdy.ai/api/search-image?query=modern%20ecommerce%20website%20dashboard%20design%20sleek%20interface%20purple%20accent%20colors%20dark%20theme%20professional%20web%20application%20mockup%20on%20desktop%20screen&width=600&height=400&seq=portcover1&orientation=landscape',
      projectImages: [],
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      likes: 234,
      views: 1520,
      rating: 4.9,
      completedProjects: 47,
      hourlyRate: '$80-100',
      isVerified: true
    },
    {
      id: '2',
      freelancerId: '2',
      freelancerName: 'Michael Chen',
      freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20male%20ui%20ux%20designer%20portrait%20friendly%20smile%20creative%20workspace%20clean%20white%20background%20casual%20professional%20attire&width=100&height=100&seq=port2&orientation=squarish',
      title: 'Finance App UI Design',
      category: 'UI/UX Design',
      description: 'Designed a comprehensive mobile banking app with intuitive navigation, dark mode support, and accessibility features. Created over 50 unique screens.',
      coverImage: 'https://readdy.ai/api/search-image?query=mobile%20banking%20app%20ui%20design%20finance%20application%20interface%20dark%20theme%20purple%20gradients%20modern%20sleek%20design%20multiple%20screens%20showcase&width=600&height=400&seq=portcover2&orientation=landscape',
      projectImages: [],
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      likes: 189,
      views: 1230,
      rating: 4.8,
      completedProjects: 32,
      hourlyRate: '$70-90',
      isVerified: true
    },
    {
      id: '3',
      freelancerId: '4',
      freelancerName: 'Emily Rodriguez',
      freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20female%20mobile%20developer%20portrait%20confident%20tech%20office%20environment%20clean%20white%20background%20business%20casual&width=100&height=100&seq=port3&orientation=squarish',
      title: 'Fitness Tracking Mobile App',
      category: 'Mobile Apps',
      description: 'Built a cross-platform fitness app with workout tracking, nutrition logging, and social features. Integrated with wearable devices for real-time health monitoring.',
      coverImage: 'https://readdy.ai/api/search-image?query=fitness%20tracking%20mobile%20app%20interface%20workout%20application%20design%20modern%20ui%20purple%20accent%20colors%20health%20dashboard%20multiple%20phone%20screens&width=600&height=400&seq=portcover3&orientation=landscape',
      projectImages: [],
      skills: ['React Native', 'Firebase', 'HealthKit', 'Redux'],
      likes: 312,
      views: 2100,
      rating: 5.0,
      completedProjects: 28,
      hourlyRate: '$75-95',
      isVerified: true
    },
    {
      id: '4',
      freelancerId: '2',
      freelancerName: 'David Kim',
      freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20male%20data%20scientist%20portrait%20friendly%20modern%20office%20clean%20white%20background%20casual%20attire&width=100&height=100&seq=port4&orientation=squarish',
      title: 'AI-Powered Analytics Dashboard',
      category: 'Data Science',
      description: 'Developed an intelligent analytics platform with predictive modeling, automated reporting, and interactive data visualizations for enterprise clients.',
      coverImage: 'https://readdy.ai/api/search-image?query=data%20analytics%20dashboard%20design%20ai%20machine%20learning%20visualization%20charts%20graphs%20dark%20theme%20purple%20accents%20modern%20business%20intelligence%20interface&width=600&height=400&seq=portcover4&orientation=landscape',
      projectImages: [],
      skills: ['Python', 'TensorFlow', 'D3.js', 'PostgreSQL'],
      likes: 156,
      views: 980,
      rating: 4.7,
      completedProjects: 19,
      hourlyRate: '$90-120',
      isVerified: false
    },
    {
      id: '5',
      freelancerId: '7',
      freelancerName: 'Jessica Taylor',
      freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20female%20graphic%20designer%20portrait%20creative%20smile%20design%20studio%20clean%20white%20background%20stylish%20attire&width=100&height=100&seq=port5&orientation=squarish',
      title: 'Brand Identity System',
      category: 'Graphic Design',
      description: 'Created a complete brand identity including logo design, color palette, typography system, and comprehensive brand guidelines for a tech startup.',
      coverImage: 'https://readdy.ai/api/search-image?query=brand%20identity%20design%20system%20logo%20mockup%20business%20cards%20stationery%20modern%20minimalist%20purple%20accent%20colors%20professional%20branding%20presentation&width=600&height=400&seq=portcover5&orientation=landscape',
      projectImages: [],
      skills: ['Illustrator', 'Photoshop', 'InDesign', 'Branding'],
      likes: 278,
      views: 1650,
      rating: 4.9,
      completedProjects: 56,
      hourlyRate: '$60-80',
      isVerified: true
    },
    {
      id: '6',
      freelancerId: '4',
      freelancerName: 'Alex Martinez',
      freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20male%20devops%20engineer%20portrait%20confident%20smile%20tech%20workspace%20clean%20white%20background%20professional%20attire&width=100&height=100&seq=port6&orientation=squarish',
      title: 'Cloud Infrastructure Setup',
      category: 'DevOps',
      description: 'Architected and implemented a scalable cloud infrastructure on AWS with automated CI/CD pipelines, monitoring, and disaster recovery solutions.',
      coverImage: 'https://readdy.ai/api/search-image?query=cloud%20infrastructure%20diagram%20aws%20architecture%20devops%20pipeline%20visualization%20dark%20theme%20technical%20diagram%20modern%20design%20purple%20accents&width=600&height=400&seq=portcover6&orientation=landscape',
      projectImages: [],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      likes: 145,
      views: 890,
      rating: 4.8,
      completedProjects: 23,
      hourlyRate: '$100-130',
      isVerified: true
    },
    {
      id: '7',
      freelancerId: '10',
      freelancerName: 'Ryan Thompson',
      freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20male%20blockchain%20developer%20portrait%20friendly%20smile%20modern%20workspace%20clean%20white%20background%20smart%20casual%20attire&width=100&height=100&seq=port7&orientation=squarish',
      title: 'NFT Marketplace Platform',
      category: 'Blockchain',
      description: 'Built a full-featured NFT marketplace with minting, trading, and auction capabilities. Implemented smart contracts on Ethereum with gas optimization.',
      coverImage: 'https://readdy.ai/api/search-image?query=nft%20marketplace%20website%20design%20blockchain%20platform%20interface%20dark%20theme%20purple%20gradients%20digital%20art%20gallery%20modern%20web3%20application&width=600&height=400&seq=portcover7&orientation=landscape',
      projectImages: [],
      skills: ['Solidity', 'Web3.js', 'React', 'IPFS'],
      likes: 198,
      views: 1340,
      rating: 4.6,
      completedProjects: 15,
      hourlyRate: '$110-140',
      isVerified: false
    },
    {
      id: '8',
      freelancerId: '1',
      freelancerName: 'Amanda Foster',
      freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20female%20game%20developer%20portrait%20confident%20smile%20creative%20office%20clean%20white%20background%20casual%20professional%20attire&width=100&height=100&seq=port8&orientation=squarish',
      title: 'Mobile Puzzle Game',
      category: 'Game Development',
      description: 'Developed an addictive puzzle game with 200+ levels, achievements system, and social leaderboards. Over 500K downloads on App Store and Play Store.',
      coverImage: 'https://readdy.ai/api/search-image?query=mobile%20puzzle%20game%20interface%20colorful%20game%20design%20casual%20gaming%20app%20screenshots%20multiple%20levels%20purple%20theme%20modern%20game%20ui&width=600&height=400&seq=portcover8&orientation=landscape',
      projectImages: [],
      skills: ['Unity', 'C#', 'Game Design', 'Firebase'],
      likes: 267,
      views: 1890,
      rating: 4.9,
      completedProjects: 12,
      hourlyRate: '$85-110',
      isVerified: true
    },
    {
      id: '9',
      freelancerId: '8',
      freelancerName: 'Chris Anderson',
      freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20male%20frontend%20developer%20portrait%20friendly%20smile%20modern%20tech%20office%20clean%20white%20background%20business%20casual&width=100&height=100&seq=port9&orientation=squarish',
      title: 'SaaS Dashboard Suite',
      category: 'Web Development',
      description: 'Designed and developed a comprehensive SaaS dashboard with real-time analytics, team collaboration features, and customizable widgets.',
      coverImage: 'https://readdy.ai/api/search-image?query=saas%20dashboard%20design%20admin%20panel%20interface%20modern%20web%20application%20dark%20theme%20purple%20accents%20analytics%20charts%20data%20visualization%20professional&width=600&height=400&seq=portcover9&orientation=landscape',
      projectImages: [],
      skills: ['Vue.js', 'TypeScript', 'GraphQL', 'Tailwind'],
      likes: 203,
      views: 1420,
      rating: 4.8,
      completedProjects: 34,
      hourlyRate: '$75-95',
      isVerified: true
    }
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSkills([]);
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesSearch = portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         portfolio.freelancerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         portfolio.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         portfolio.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || portfolio.category === selectedCategory;
    
    const matchesSkills = selectedSkills.length === 0 ||
                         selectedSkills.some(skill => portfolio.skills.includes(skill));
    
    return matchesSearch && matchesCategory && matchesSkills;
  });

  const sortedPortfolios = [...filteredPortfolios].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'recent') return b.completedProjects - a.completedProjects;
    return 0;
  });

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedSkills.length > 0
  ].filter(Boolean).length;

  const handleOpenComplaint = (freelancerName: string, freelancerAvatar: string) => {
    setSelectedFreelancer({ name: freelancerName, avatar: freelancerAvatar });
    setShowComplaintModal(true);
  };

  const handleCreatePortfolio = () => {
    if (!isAuthenticated || !user?.roles.includes('freelancer')) {
      setShowRoleGateModal(true);
      return;
    }
    navigate('/profile/freelancer');
  };

  return (
    <div className="min-h-screen bg-[#1a1f37]">
      <Navbar />
      
      {/* Role Gate Modal */}
      <RoleGateModal
        isOpen={showRoleGateModal}
        onClose={() => setShowRoleGateModal(false)}
        requiredRole="freelancer"
        roleLabel="Freelancer"
        actionLabel={t('portfolios.createPortfolio')}
        onRoleAdded={() => navigate('/profile/freelancer')}
      />

      {/* Complaint Modal */}
      {selectedFreelancer && (
        <ComplaintModal
          isOpen={showComplaintModal}
          onClose={() => { setShowComplaintModal(false); setSelectedFreelancer(null); }}
          targetName={selectedFreelancer.name}
          targetAvatar={selectedFreelancer.avatar}
          targetType="freelancer"
        />
      )}
      
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{t('portfolios.title')}</h1>
            <p className="text-sm sm:text-base text-gray-400">{t('portfolios.subtitle')}</p>
          </div>

          {/* Featured Banner */}
          <div className="mb-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 flex-shrink-0">
                  <i className="ri-gallery-line text-2xl sm:text-3xl text-purple-400"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{t('portfolios.showcaseWork')}</h2>
                  <p className="text-gray-300 text-xs sm:text-sm">{t('portfolios.showcaseSubtitle')}</p>
                </div>
              </div>
              <button
                onClick={handleCreatePortfolio}
                className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="ri-add-line"></i>
                {t('portfolios.createPortfolio')}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-72 flex-shrink-0`}>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-5 lg:sticky lg:top-28">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <i className="ri-filter-3-line"></i>
                    {t('portfolios.filters')}
                    {activeFiltersCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">{activeFiltersCount}</span>
                    )}
                  </h2>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearAllFilters} className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer whitespace-nowrap">
                      {t('common.clearAll')}
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-5">
                  <label className="block text-white text-sm font-medium mb-2">{t('portfolios.category')}</label>
                  <CustomSelect
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={[
                      { value: 'all', label: t('portfolios.allCategories') },
                      ...categories.slice(1).map(cat => ({ value: cat, label: cat }))
                    ]}
                    placeholder={t('portfolios.allCategories')}
                  />
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    {t('portfolios.skills')} {selectedSkills.length > 0 && <span className="text-purple-400">({selectedSkills.length})</span>}
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {allSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                          selectedSkills.includes(skill)
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Search and Sort Bar */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-4 mb-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Toggle Filters Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-filter-3-line"></i>
                    {showFilters ? t('portfolios.hideFilters') : t('portfolios.showFilters')}
                    {activeFiltersCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">{activeFiltersCount}</span>
                    )}
                  </button>

                  {/* Search */}
                  <div className="flex-1 relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base"></i>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('portfolios.searchPlaceholder')}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  {/* View Mode Toggle and Sort */}
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm whitespace-nowrap">{t('portfolios.sort')}</span>
                    <div className="relative flex-1 min-w-[150px]">
                      <CustomSelect
                        value={sortBy}
                        onChange={setSortBy}
                        options={[
                          { value: 'popular', label: t('portfolios.mostPopular') },
                          { value: 'views', label: t('portfolios.mostViewed') },
                          { value: 'rating', label: t('portfolios.highestRated') },
                          { value: 'recent', label: t('portfolios.mostProjects') }
                        ]}
                        placeholder={t('portfolios.sortPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-xs sm:text-sm">
                  {t('portfolios.showing')} <span className="text-white font-semibold">{sortedPortfolios.length}</span> {t('portfolios.portfoliosCount')}
                </p>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="hidden lg:flex items-center gap-2 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap"
                >
                  <i className={`ri-layout-${showFilters ? 'right' : 'left'}-2-line`}></i>
                  {showFilters ? t('portfolios.hideFilters') : t('portfolios.showFilters')}
                </button>
              </div>

              {/* Portfolio Grid */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {sortedPortfolios.map(portfolio => (
                    <div
                      key={portfolio.id}
                      className={`backdrop-blur-sm rounded-xl border overflow-hidden hover:border-purple-500/50 transition-all group ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}
                    >
                      {/* Cover Image */}
                      <div className="relative h-40 sm:h-48 overflow-hidden">
                        <img
                          src={portfolio.coverImage}
                          alt={portfolio.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            onClick={() => handleOpenComplaint(portfolio.freelancerName, portfolio.freelancerAvatar)}
                            className="w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                            title={t('common.report')}
                          >
                            <i className="ri-flag-line text-sm"></i>
                          </button>
                          <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                            {portfolio.category}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <Link to={`/user/${portfolio.freelancerId}`} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-white/30">
                              <img src={portfolio.freelancerAvatar} alt={portfolio.freelancerName} className="w-full h-full object-cover" />
                            </div>
                            <p className={`text-white text-xs sm:text-sm font-semibold flex items-center gap-1 ${isLightMode ? 'hover:underline' : 'hover:underline'}`}>
                              <span className="truncate max-w-[100px] sm:max-w-none">{portfolio.freelancerName}</span>
                              {portfolio.isVerified && <i className="ri-verified-badge-fill text-purple-400 text-xs"></i>}
                            </p>
                          </Link>
                          <div className="flex items-center gap-2 sm:gap-3 text-white/80 text-xs">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikePortfolio(portfolio.id);
                              }}
                              className={`flex items-center gap-1 cursor-pointer transition-all ${likedPortfolios.has(portfolio.id) ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'}`}
                            >
                              <i className={`${likedPortfolios.has(portfolio.id) ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                              {portfolio.likes + (likedPortfolios.has(portfolio.id) ? 1 : 0)}
                            </button>
                            <span className="flex items-center gap-1">
                              <i className="ri-eye-fill"></i>
                              {portfolio.views}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5">
                        <Link to={`/portfolio/${portfolio.id}`}>
                          <h3 className={`text-base sm:text-lg font-bold mb-2 group-hover:text-purple-500 transition-colors line-clamp-1 cursor-pointer ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                            {portfolio.title}
                          </h3>
                        </Link>
                        <p className={`text-xs sm:text-sm mb-4 line-clamp-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{portfolio.description}</p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {portfolio.skills.slice(0, 4).map(skill => (
                            <span
                              key={skill}
                              className={`px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-400 ${isLightMode ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border border-white/10'}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className={`flex items-center justify-between pt-4 border-t ${isLightMode ? 'border-gray-100' : 'border-white/10'}`}>
                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                            <span className="flex items-center gap-1 text-amber-400">
                              <i className="ri-star-fill"></i>
                              {portfolio.rating}
                            </span>
                            <span className={isLightMode ? 'text-gray-400' : 'text-gray-400'}>
                              {portfolio.completedProjects} projects
                            </span>
                          </div>
                          <Link
                            to={`/portfolio/${portfolio.id}`}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            View Work
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {sortedPortfolios.map(portfolio => (
                    <div
                      key={portfolio.id}
                      className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 hover:border-purple-500/50 transition-all group ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                        {/* Cover Image */}
                        <div className="flex-shrink-0 w-full sm:w-48 h-32 rounded-lg overflow-hidden relative">
                          <img
                            src={portfolio.coverImage}
                            alt={portfolio.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Report Button for List View */}
                          <button
                            onClick={() => handleOpenComplaint(portfolio.freelancerName, portfolio.freelancerAvatar)}
                            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                            title={t('common.report')}
                          >
                            <i className="ri-flag-line text-sm"></i>
                          </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <div className="text-center sm:text-left">
                              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-1">
                                <span className={`px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 ${isLightMode ? 'bg-purple-500/20 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
                                  {portfolio.category}
                                </span>
                              </div>
                              <Link to={`/portfolio/${portfolio.id}`}>
                                <h3 className={`text-lg font-bold group-hover:text-purple-500 transition-colors cursor-pointer hover:underline ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                                  {portfolio.title}
                                </h3>
                              </Link>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start gap-3 text-sm">
                              <button
                                onClick={() => toggleLikePortfolio(portfolio.id)}
                                className={`flex items-center gap-1 cursor-pointer transition-all ${likedPortfolios.has(portfolio.id) ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'}`}
                              >
                                <i className={`${likedPortfolios.has(portfolio.id) ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                                {portfolio.likes + (likedPortfolios.has(portfolio.id) ? 1 : 0)}
                              </button>
                              <span className="flex items-center gap-1 text-gray-400">
                                <i className="ri-eye-fill"></i>
                                {portfolio.views}
                              </span>
                            </div>
                          </div>

                          <p className={`text-xs sm:text-sm mb-3 line-clamp-2 text-center sm:text-left ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{portfolio.description}</p>

                          {/* Freelancer Info & Skills */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                              <Link to={`/user/${portfolio.freelancerId}`} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group/name">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden">
                                  <img src={portfolio.freelancerAvatar} alt={portfolio.freelancerName} className="w-full h-full object-cover" />
                                </div>
                                <span className={`text-xs sm:text-sm font-medium flex items-center gap-1 group-hover/name:text-purple-500 transition-colors ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                                  <span className="truncate max-w-[120px] sm:max-w-none hover:underline">{portfolio.freelancerName}</span>
                                  {portfolio.isVerified && <i className="ri-verified-badge-fill text-purple-400 text-xs"></i>}
                                </span>
                              </Link>
                              <span className="flex items-center gap-1 text-amber-400 text-xs sm:text-sm">
                                <i className="ri-star-fill"></i>
                                {portfolio.rating}
                              </span>
                              <span className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-400' : 'text-gray-400'}`}>{portfolio.hourlyRate}/hr</span>
                            </div>
                            <Link
                              to={`/portfolio/${portfolio.id}`}
                              className="w-full sm:w-auto px-4 sm:px-5 py-1.5 sm:py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 text-center"
                            >
                              View Work
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {sortedPortfolios.length === 0 && (
                <div className="text-center py-12 sm:py-16 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-4">
                    <i className="ri-gallery-line text-2xl sm:text-3xl text-gray-400"></i>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">{t('portfolios.noPortfoliosFound')}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-4 px-4">{t('portfolios.noPortfoliosSubtitle')}</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {t('portfolios.clearAllFilters')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Portfolios;
