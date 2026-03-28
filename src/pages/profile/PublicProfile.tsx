import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import UserRatingModal from './components/UserRatingModal';

interface PublicUserData {
  id: string;
  name: string;
  avatar: string;
  roles: string[];
  skills: string[];
  rating: number;
  totalRatings: number;
  completedProjects: number;
  location: string;
  hourlyRate?: number;
  bio: string;
  email: string;
  phone?: string;
  linkedin?: string;
  experience?: string;
  education?: string;
  interests?: string[];
  goals?: string;
  experienceLevel?: string;
  totalSpent?: number;
  activeProjects?: number;
  companies?: { id: string; name: string; industry: string; logo: string }[];
  portfolio?: { id: string; title: string; description: string; image: string; category: string; completedDate: string }[];
  completedWork?: { id: string; title: string; client: string; clientAvatar: string; description: string; budget: number; completedDate: string; rating: number; review: string; category: string }[];
  roadmaps?: { id: string; title: string; progress: number; totalSteps: number; completedSteps: number; category: string }[];
  courseProjects?: { id: string; courseName: string; projectTitle: string; description: string; githubLink: string; completedDate: string; technologies: string[] }[];
  appliedJobsCount?: number;
}

const mockPublicUsers: Record<string, PublicUserData> = {
  '1': {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20young%20woman%20headshot%20portrait%20smiling%20confident%20business%20casual%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user1&orientation=squarish',
    roles: ['freelancer'],
    skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design'],
    rating: 4.9,
    totalRatings: 38,
    completedProjects: 47,
    location: 'San Francisco, USA',
    hourlyRate: 85,
    bio: 'Full-stack developer with 6+ years of experience building scalable web applications. Passionate about clean code and user-centric design.',
    email: 'sarah.j@example.com',
    portfolio: [
      {
        id: '1',
        title: 'E-commerce Platform',
        description: 'Built a full-featured e-commerce platform with payment integration',
        image: 'https://readdy.ai/api/search-image?query=modern%20ecommerce%20website%20interface%20showing%20product%20grid%20shopping%20cart%20checkout%20process%20clean%20white%20background%20professional%20design%20minimalist%20layout%20high%20quality&width=800&height=600&seq=pub-port1&orientation=landscape',
        category: 'Web Development',
        completedDate: '2024-01-15'
      },
      {
        id: '2',
        title: 'Mobile Banking App',
        description: 'Developed a secure mobile banking application with biometric auth',
        image: 'https://readdy.ai/api/search-image?query=mobile%20banking%20app%20interface%20showing%20account%20dashboard%20transaction%20history%20payment%20features%20modern%20ui%20design%20clean%20white%20background%20professional%20fintech%20application&width=800&height=600&seq=pub-port2&orientation=landscape',
        category: 'Mobile Development',
        completedDate: '2023-11-20'
      }
    ],
    completedWork: [
      {
        id: '1',
        title: 'E-commerce Website Redesign',
        client: 'TechStart Inc.',
        clientAvatar: 'https://readdy.ai/api/search-image?query=professional%20business%20person%20portrait%20corporate%20headshot%20clean%20white%20background%20friendly%20smile&width=100&height=100&seq=pub-client1&orientation=squarish',
        description: 'Complete redesign and development of an e-commerce platform.',
        budget: 4500,
        completedDate: '2024-01-10',
        rating: 5,
        review: 'Excellent work! Delivered on time with exceptional quality.',
        category: 'Web Development'
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20asian%20man%20headshot%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user2&orientation=squarish',
    roles: ['freelancer', 'employer'],
    skills: ['Python', 'Machine Learning', 'Data Science', 'TensorFlow'],
    rating: 4.8,
    totalRatings: 25,
    completedProjects: 32,
    location: 'New York, USA',
    hourlyRate: 120,
    bio: 'AI/ML specialist helping companies leverage data for business growth. Also running a small AI consultancy.',
    email: 'michael.c@example.com',
    companies: [
      {
        id: '1',
        name: 'AI Solutions Lab',
        industry: 'Artificial Intelligence',
        logo: 'https://readdy.ai/api/search-image?query=modern%20tech%20company%20logo%20abstract%20geometric%20design%20teal%20gradient%20professional%20corporate%20branding%20clean%20white%20background&width=200&height=200&seq=pub-comp1&orientation=squarish'
      }
    ],
    portfolio: [
      {
        id: '1',
        title: 'ML Pipeline Dashboard',
        description: 'Real-time ML model monitoring and management dashboard',
        image: 'https://readdy.ai/api/search-image?query=machine%20learning%20dashboard%20interface%20showing%20model%20metrics%20charts%20graphs%20data%20visualization%20modern%20dark%20theme%20professional%20analytics%20tool&width=800&height=600&seq=pub-port3&orientation=landscape',
        category: 'Data Science',
        completedDate: '2024-02-01'
      }
    ],
    completedWork: []
  },
  '3': {
    id: '3',
    name: 'Emma Williams',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20blonde%20woman%20headshot%20portrait%20friendly%20smile%20business%20professional%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user3&orientation=squarish',
    roles: ['client'],
    skills: ['Project Management', 'Agile', 'Scrum'],
    rating: 4.7,
    totalRatings: 12,
    completedProjects: 15,
    location: 'London, UK',
    bio: 'Startup founder looking for talented developers to build innovative products.',
    email: 'emma.w@example.com',
    totalSpent: 45000,
    activeProjects: 3
  },
  '4': {
    id: '4',
    name: 'David Rodriguez',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20hispanic%20man%20headshot%20portrait%20confident%20smile%20casual%20business%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user4&orientation=squarish',
    roles: ['freelancer', 'learner'],
    skills: ['Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android'],
    rating: 4.6,
    totalRatings: 20,
    completedProjects: 28,
    location: 'Austin, USA',
    hourlyRate: 75,
    bio: 'Mobile app developer passionate about creating seamless user experiences. Currently learning advanced backend development.',
    email: 'david.r@example.com',
    interests: ['Mobile Development', 'Backend Systems', 'Cloud Architecture'],
    goals: 'Become a full-stack mobile developer',
    experienceLevel: 'Intermediate',
    portfolio: [
      {
        id: '1',
        title: 'Fitness Tracker App',
        description: 'Cross-platform fitness tracking app with social features',
        image: 'https://readdy.ai/api/search-image?query=fitness%20tracking%20mobile%20app%20interface%20showing%20workout%20stats%20health%20metrics%20progress%20charts%20modern%20design%20clean%20white%20background%20professional%20health%20application&width=800&height=600&seq=pub-port4&orientation=landscape',
        category: 'Mobile Development',
        completedDate: '2024-01-20'
      }
    ],
    roadmaps: [
      {
        id: '1',
        title: 'Backend Development Mastery',
        progress: 45,
        totalSteps: 20,
        completedSteps: 9,
        category: 'Backend'
      }
    ],
    courseProjects: [
      {
        id: '1',
        courseName: 'React Native Advanced',
        projectTitle: 'Social Media App',
        description: 'A full-featured social media app with real-time messaging and stories.',
        githubLink: 'https://github.com/david/social-app',
        completedDate: '2023-12-10',
        technologies: ['React Native', 'Firebase', 'Redux']
      }
    ]
  },
  '5': {
    id: '5',
    name: 'Lisa Thompson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20red%20hair%20headshot%20portrait%20warm%20smile%20creative%20professional%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user5&orientation=squarish',
    roles: ['employer'],
    skills: ['HR Management', 'Recruitment', 'Team Building'],
    rating: 4.9,
    totalRatings: 8,
    completedProjects: 0,
    location: 'Toronto, Canada',
    bio: 'HR Director at TechCorp seeking top talent for our growing engineering team.',
    email: 'lisa.t@example.com',
    companies: [
      {
        id: '1',
        name: 'TechCorp',
        industry: 'Software Development',
        logo: 'https://readdy.ai/api/search-image?query=modern%20software%20company%20logo%20geometric%20design%20warm%20orange%20gradient%20professional%20corporate%20branding%20clean%20white%20background&width=200&height=200&seq=pub-comp2&orientation=squarish'
      }
    ]
  },
  '6': {
    id: '6',
    name: 'James Wilson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20american%20man%20headshot%20portrait%20confident%20business%20suit%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user6&orientation=squarish',
    roles: ['applicant', 'learner'],
    skills: ['JavaScript', 'HTML', 'CSS', 'Vue.js'],
    rating: 4.2,
    totalRatings: 5,
    completedProjects: 5,
    location: 'Chicago, USA',
    bio: 'Junior developer eager to learn and grow in the tech industry.',
    email: 'james.w@example.com',
    experience: '1 year of frontend development experience',
    education: 'Bachelor of Science in Computer Science',
    interests: ['Web Development', 'Open Source', 'UI Design'],
    goals: 'Land a full-time frontend developer role',
    experienceLevel: 'Beginner',
    roadmaps: [
      {
        id: '1',
        title: 'Frontend Web Development',
        progress: 70,
        totalSteps: 15,
        completedSteps: 11,
        category: 'Frontend'
      }
    ]
  },
  '7': {
    id: '7',
    name: 'Anna Kowalski',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20eastern%20european%20woman%20headshot%20portrait%20elegant%20smile%20business%20professional%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user7&orientation=squarish',
    roles: ['freelancer'],
    skills: ['Graphic Design', 'Branding', 'Adobe Creative Suite', 'Figma'],
    rating: 4.95,
    totalRatings: 72,
    completedProjects: 89,
    location: 'Berlin, Germany',
    hourlyRate: 65,
    bio: 'Award-winning graphic designer specializing in brand identity and visual storytelling.',
    email: 'anna.k@example.com',
    portfolio: [
      {
        id: '1',
        title: 'Brand Identity - Luxe',
        description: 'Complete brand identity for a luxury fashion brand',
        image: 'https://readdy.ai/api/search-image?query=luxury%20fashion%20brand%20identity%20design%20showing%20logo%20business%20cards%20packaging%20elegant%20minimalist%20style%20gold%20accents%20clean%20white%20background%20professional%20branding%20mockup&width=800&height=600&seq=pub-port5&orientation=landscape',
        category: 'Branding',
        completedDate: '2024-02-05'
      },
      {
        id: '2',
        title: 'App UI Kit',
        description: 'Comprehensive UI kit for mobile applications',
        image: 'https://readdy.ai/api/search-image?query=mobile%20app%20ui%20kit%20design%20showing%20multiple%20screens%20components%20buttons%20icons%20modern%20clean%20design%20system%20professional%20interface%20elements%20white%20background&width=800&height=600&seq=pub-port6&orientation=landscape',
        category: 'UI Design',
        completedDate: '2024-01-18'
      }
    ]
  },
  '8': {
    id: '8',
    name: 'Robert Kim',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20korean%20man%20headshot%20portrait%20friendly%20smile%20tech%20casual%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user8&orientation=squarish',
    roles: ['freelancer', 'client'],
    skills: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    rating: 4.85,
    totalRatings: 33,
    completedProjects: 41,
    location: 'Seattle, USA',
    hourlyRate: 110,
    bio: 'DevOps engineer helping teams ship faster with modern infrastructure.',
    email: 'robert.k@example.com',
    totalSpent: 12000,
    activeProjects: 2
  },
  '9': {
    id: '9',
    name: 'Maria Garcia',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20latina%20woman%20headshot%20portrait%20confident%20smile%20business%20casual%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user9&orientation=squarish',
    roles: ['applicant'],
    skills: ['Marketing', 'SEO', 'Content Writing', 'Social Media'],
    rating: 4.5,
    totalRatings: 10,
    completedProjects: 12,
    location: 'Miami, USA',
    bio: 'Digital marketing specialist with a passion for growth hacking.',
    email: 'maria.g@example.com',
    experience: '4 years in digital marketing',
    education: 'MBA in Marketing, University of Miami',
    appliedJobsCount: 8
  },
  '10': {
    id: '10',
    name: 'Thomas Anderson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20glasses%20headshot%20portrait%20intellectual%20smile%20business%20casual%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user10&orientation=squarish',
    roles: ['freelancer', 'learner'],
    skills: ['Blockchain', 'Solidity', 'Web3', 'Smart Contracts'],
    rating: 4.7,
    totalRatings: 15,
    completedProjects: 19,
    location: 'Amsterdam, Netherlands',
    hourlyRate: 150,
    bio: 'Blockchain developer building the decentralized future.',
    email: 'thomas.a@example.com',
    interests: ['Blockchain', 'DeFi', 'NFTs', 'Web3'],
    goals: 'Build a successful Web3 startup',
    experienceLevel: 'Advanced'
  }
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    freelancer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    client: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    employer: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    applicant: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    learner: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  };
  return colors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

const getRoleIcon = (role: string) => {
  const icons: Record<string, string> = {
    freelancer: 'ri-briefcase-line',
    client: 'ri-user-star-line',
    employer: 'ri-building-line',
    applicant: 'ri-file-user-line',
    learner: 'ri-graduation-cap-line'
  };
  return icons[role] || 'ri-user-line';
};

const getRoleAccent = (role: string) => {
  const accents: Record<string, string> = {
    freelancer: 'emerald',
    client: 'orange',
    employer: 'violet',
    applicant: 'pink',
    learner: 'cyan'
  };
  return accents[role] || 'gray';
};

const getRoleGradient = (role: string) => {
  const gradients: Record<string, string> = {
    freelancer: 'from-emerald-500 to-teal-500',
    client: 'from-orange-500 to-amber-500',
    employer: 'from-violet-500 to-purple-500',
    applicant: 'from-pink-500 to-rose-500',
    learner: 'from-cyan-500 to-sky-500'
  };
  return gradients[role] || 'from-gray-500 to-gray-600';
};

const ROLE_LABELS: Record<string, string> = {
  freelancer: 'Freelancer',
  client: 'Client',
  employer: 'Employer',
  applicant: 'Job Seeker',
  learner: 'Learner',
  admin: 'Admin',
};

const getRoleDisplayName = (role: string) =>
  ROLE_LABELS[role] ?? (role.charAt(0).toUpperCase() + role.slice(1));

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<PublicUserData | null>(null);
  const [activeRole, setActiveRole] = useState<string>('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const id = userId || '';
    const userData = mockPublicUsers[id];
    if (userData) {
      setProfileUser(userData);
      const roleParam = searchParams.get('role');
      if (roleParam && userData.roles.includes(roleParam)) {
        setActiveRole(roleParam);
      } else {
        setActiveRole(userData.roles[0]);
      }
    }
  }, [userId, searchParams]);

  useEffect(() => {
    setActiveTab('overview');
  }, [activeRole]);

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#0f1225]">
        <Navbar />
        <div className="pt-32 pb-16 text-center">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-white/5 rounded-full">
            <i className="ri-user-search-line text-4xl text-gray-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-gray-400 mb-6">The profile you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            to="/search"
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Back to Search
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const accent = getRoleAccent(activeRole);
  const gradient = getRoleGradient(activeRole);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`${i < Math.round(rating) ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-500'} text-sm`}
      ></i>
    ));
  };

  const getTabsForRole = (role: string) => {
    switch (role) {
      case 'freelancer':
        return ['overview', 'portfolio', 'completed'];
      case 'client':
        return ['overview'];
      case 'employer':
        return ['overview', 'companies'];
      case 'applicant':
        return ['overview'];
      case 'learner':
        return ['overview', 'roadmaps', 'projects'];
      default:
        return ['overview'];
    }
  };

  const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
      overview: 'Overview',
      portfolio: 'Portfolio',
      completed: 'Completed Projects',
      companies: 'Companies',
      roadmaps: 'Roadmaps',
      projects: 'Course Projects'
    };
    return labels[tab] || tab;
  };

  const tabs = getTabsForRole(activeRole);

  return (
    <div className="min-h-screen bg-[#0f1225]">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-2xl bg-gradient-to-br ${gradient} overflow-hidden`}>
                {profileUser.avatar ? (
                  <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-user-line text-5xl text-white"></i>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{profileUser.name}</h1>
                    <p className="text-gray-400 text-sm flex items-center gap-2 mb-3">
                      <i className="ri-map-pin-line"></i>
                      {profileUser.location}
                    </p>

                    {/* Role Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profileUser.roles.map(role => (
                        <span
                          key={role}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${getRoleColor(role)}`}
                        >
                          <i className={getRoleIcon(role)}></i>
                          <span>{getRoleDisplayName(role)}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rating & Rate Button */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <div className="flex items-center gap-1">{renderStars(profileUser.rating)}</div>
                      <span className="text-yellow-400 font-bold text-lg">{profileUser.rating}</span>
                      <span className="text-gray-500 text-sm">({profileUser.totalRatings})</span>
                    </div>

                    {!isOwnProfile && (
                      <button
                        onClick={() => setShowRatingModal(true)}
                        className={`px-5 py-2.5 bg-gradient-to-r ${gradient} text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap flex items-center gap-2`}
                      >
                        <i className="ri-star-line"></i>
                        Rate This User
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {profileUser.completedProjects > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-checkbox-circle-line text-green-400"></i>
                      <span className="text-gray-300">{profileUser.completedProjects} projects</span>
                    </div>
                  )}
                  {profileUser.hourlyRate && (
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-money-dollar-circle-line text-green-400"></i>
                      <span className="text-gray-300">${profileUser.hourlyRate}/hr</span>
                    </div>
                  )}
                  {profileUser.totalSpent && activeRole === 'client' && (
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-money-dollar-circle-line text-orange-400"></i>
                      <span className="text-gray-300">
                        ${profileUser.totalSpent.toLocaleString()} spent
                      </span>
                    </div>
                  )}
                  {profileUser.activeProjects !== undefined && activeRole === 'client' && (
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-briefcase-line text-orange-400"></i>
                      <span className="text-gray-300">{profileUser.activeProjects} active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Role Switcher (only if multiple roles) */}
          {profileUser.roles.length > 1 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm px-3 whitespace-nowrap">View as:</span>
                {profileUser.roles.map(role => (
                  <button
                    key={role}
                    onClick={() => setActiveRole(role)}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                      activeRole === role
                        ? `bg-gradient-to-r ${getRoleGradient(role)} text-white`
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <i className={getRoleIcon(role)}></i>
                    <span>{getRoleDisplayName(role)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          {tabs.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? `bg-gradient-to-r ${gradient} text-white`
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {getTabLabel(tab)}
                </button>
              ))}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Bio */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-3">About</h2>
                <p className="text-gray-300 leading-relaxed">{profileUser.bio}</p>
              </div>

              {/* Skills */}
              {profileUser.skills.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applicant-specific: Experience & Education */}
              {(activeRole === 'applicant') && (profileUser.experience || profileUser.education) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileUser.experience && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-white mb-3">Experience</h2>
                      <p className="text-gray-300">{profileUser.experience}</p>
                    </div>
                  )}
                  {profileUser.education && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-white mb-3">Education</h2>
                      <p className="text-gray-300">{profileUser.education}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Learner-specific: Interests & Goals */}
              {activeRole === 'learner' && (
                <>
                  {profileUser.interests && profileUser.interests.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-white mb-4">Interests</h2>
                      <div className="flex flex-wrap gap-2">
                        {profileUser.interests.map(interest => (
                          <span
                            key={interest}
                            className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profileUser.goals && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-white mb-3">Learning Goals</h2>
                      <p className="text-gray-300">{profileUser.goals}</p>
                    </div>
                  )}
                  {profileUser.experienceLevel && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-white mb-3">Experience Level</h2>
                      <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 font-medium">
                        {profileUser.experienceLevel}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Client-specific stats */}
              {activeRole === 'client' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-500/20">
                        <i className="ri-briefcase-line text-2xl text-orange-400"></i>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Active Projects</p>
                        <p className="text-2xl font-bold text-white">{profileUser.activeProjects || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-500/20">
                        <i className="ri-checkbox-circle-line text-2xl text-green-400"></i>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Completed</p>
                        <p className="text-2xl font-bold text-white">{profileUser.completedProjects}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-500/20">
                        <i className="ri-money-dollar-circle-line text-2xl text-amber-400"></i>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Total Spent</p>
                        <p className="text-2xl font-bold text-white">
                          ${profileUser.totalSpent?.toLocaleString() ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Tab (Freelancer) */}
          {activeTab === 'portfolio' && profileUser.portfolio && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profileUser.portfolio.map(item => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all"
                >
                  <div className="w-full h-52 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium">
                        {item.category}
                      </span>
                      <span className="text-gray-400 text-xs">{item.completedDate}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
              {profileUser.portfolio.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <i className="ri-folder-line text-5xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400">No portfolio items yet</p>
                </div>
              )}
            </div>
          )}

          {/* Completed Projects Tab (Freelancer) */}
          {activeTab === 'completed' && profileUser.completedWork && (
            <div className="space-y-4">
              {profileUser.completedWork.map(project => (
                <div
                  key={project.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium">
                          {project.category}
                        </span>
                        <span className="text-gray-400 text-sm">
                          <i className="ri-calendar-line mr-1"></i>
                          {new Date(project.completedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-400 mb-4">{project.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-semibold">
                          <i className="ri-money-dollar-circle-line text-green-400 mr-1"></i>
                          ${project.budget.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1">{renderStars(project.rating)}</div>
                      </div>
                    </div>
                    <div className="lg:w-72 bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img src={project.clientAvatar} alt={project.client} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm">{project.client}</h4>
                          <p className="text-gray-400 text-xs">Client</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm italic">&quot;{project.review}&quot;</p>
                    </div>
                  </div>
                </div>
              ))}
              {profileUser.completedWork.length === 0 && (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <i className="ri-folder-line text-5xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400">No completed projects yet</p>
                </div>
              )}
            </div>
          )}

          {/* Companies Tab (Employer) */}
          {activeTab === 'companies' && profileUser.companies && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileUser.companies.map(company => (
                <div
                  key={company.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-violet-500/50 transition-all"
                >
                  <div className="w-16 h-16 rounded-lg bg-white/10 mb-4 overflow-hidden">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-building-line text-3xl text-violet-400"></i>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{company.name}</h3>
                  <p className="text-gray-400 text-sm">{company.industry}</p>
                </div>
              ))}
            </div>
          )}

          {/* Roadmaps Tab (Learner) */}
          {activeTab === 'roadmaps' && profileUser.roadmaps && (
            <div className="space-y-4">
              {profileUser.roadmaps.map(roadmap => (
                <div key={roadmap.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{roadmap.title}</h3>
                      <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs font-medium">
                        {roadmap.category}
                      </span>
                    </div>
                    <span className="text-cyan-400 font-semibold">{roadmap.progress}%</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>
                        {roadmap.completedSteps}/{roadmap.totalSteps} steps
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full"
                        style={{ width: `${roadmap.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {profileUser.roadmaps.length === 0 && (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <i className="ri-road-map-line text-5xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400">No active roadmaps</p>
                </div>
              )}
            </div>
          )}

          {/* Course Projects Tab (Learner) */}
          {activeTab === 'projects' && profileUser.courseProjects && (
            <div className="space-y-4">
              {profileUser.courseProjects.map(project => (
                <div key={project.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs font-medium">
                      {project.courseName}
                    </span>
                    <span className="text-gray-500 text-xs">
                      <i className="ri-calendar-line mr-1"></i>
                      {new Date(project.completedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{project.projectTitle}</h3>
                  <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-white/10 rounded-full text-white/70 text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <i className="ri-github-fill"></i>
                    View on GitHub
                    <i className="ri-external-link-line text-xs"></i>
                  </a>
                </div>
              ))}
              {profileUser.courseProjects.length === 0 && (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <i className="ri-folder-line text-5xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400">No course projects yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Rating Modal */}
      <UserRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        userName={profileUser.name}
        userId={profileUser.id}
        userAvatar={profileUser.avatar}
      />
    </div>
  );
};

export default PublicProfile;
