import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import UserRatingModal from './components/UserRatingModal';
import {
  type PublicProfileSummary,
  getClientPublicProfile,
  getEmployerPublicProfile,
  getFreelancerPublicProfile,
  getJobSeekerPublicProfile,
  getLearnerPublicProfile,
  getProfileSummary,
} from '../../services/publicProfile.service';

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
  title?: string | null;
  bio: string;
  learningGoals?: string | null;
  email: string;
  phone?: string | null;
  linkedin?: string | null;
  website?: string | null;
  gitHubUrl?: string | null;
  experience?: string | null;
  education?: string | null;
  interests?: string[];
  goals?: string | null;
  experienceLevel?: string | null;
  totalSpent?: number;
  activeProjects?: number;
  isAvailable:boolean;
  companies?: { id: string; name: string; industry: string; logo?: string }[];
  portfolio?: {  id: string;
  title?: string | null;
  portfolioUrl: string;
  categoryId: number;
  categoryName?: string | null;
  description?: string | null;
  uploadedAt: string; }[];
  documents?: { id: string; title: string; fileName: string; documentUrl: string; uploadedAt?: string | null; contentType?: string | null }[];
  completedWork?: { id: string; title: string; clientName: string; clientImageUrl: string; description: string; completedAt: string; rating: number; comment?: string | null; category: string }[];
  roadmaps?: { id: string; title: string; progress: number; totalSteps: number; completedSteps: number; category: string }[];
  courseProjects?: { id: string; courseName: string; projectTitle: string; description: string; githubLink: string; completedDate: string; technologies: string[] }[];
  appliedJobsCount?: number;
  cv?: {cvUrl: string;contentType: string;jobTitle: string;isPublic: boolean; fileName: string; uploadedAt: string };
  completedProjectsCount?: number;
}

const normalizeRole = (role: string) => {
  const normalized = role.toLowerCase().replace(/[\s_-]/g, '');
  if (normalized === 'jobseeker' || normalized === 'applicant') return 'applicant';
  return normalized;
};

const normalizeRoles = (roles: string[]) =>
  Array.from(new Set((roles ?? []).map(normalizeRole).filter(Boolean)));

const getRoleProfileId = (summary: PublicProfileSummary, role: string) => {
  switch (role) {
    case 'freelancer':
      return summary.freelancerId;
    case 'client':
      return summary.clientId;
    case 'employer':
      return summary.employerId;
    case 'applicant':
      return summary.jobSeekerId;
    case 'learner':
      return summary.learnerId;
    default:
      return null;
  }
};

const buildBaseProfile = (summary: PublicProfileSummary): PublicUserData => ({
  id: summary.userId,
  name: summary.fullName,
  avatar: summary.imageUrl || '',
  roles: normalizeRoles(summary.roles),
  skills: [],
  rating: 0,
  totalRatings: 0,
  completedProjects: 0,
  title: '',
  isAvailable: true,
  location: 'Not specified',
  bio: '',
  email: summary.email,
  portfolio: [],
  documents: [],
  completedWork: [],
  roadmaps: [],
  courseProjects: [],
  companies: [],
});

const mergeRoleProfile = async (
  summary: PublicProfileSummary,
  role: string,
  baseProfile: PublicUserData,
): Promise<PublicUserData> => {
  const roleProfileId = getRoleProfileId(summary, role);
  if (!roleProfileId) return baseProfile;

  switch (role) {
    case 'freelancer': {
      const profile = await getFreelancerPublicProfile(roleProfileId);
      return {
        ...baseProfile,
        name: profile.fullName || baseProfile.name,
        avatar: profile.imageUrl || baseProfile.avatar,
        email: profile.email || baseProfile.email,
        bio: profile.bio || baseProfile.bio,
        location: profile.country || baseProfile.location,
        phone: profile.phoneNumber,
        linkedin: profile.websiteUrl || profile.gitHubUrl || undefined,
        hourlyRate: profile.hourlyRate,
        rating: profile.averageRating ?? 0,
        totalRatings: profile.totalReviews ?? 0,
        completedProjects: profile.completedProjectsCount ?? 0,
        experience: profile.yearsOfExperience ? `${profile.yearsOfExperience} years` : undefined,
        skills: profile.skills ?? [],
        isAvailable: profile.isAvailable ?? true,
        portfolio: (profile.portfolios ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          portfolioUrl: item.portfolioUrl,
          categoryId: item.categoryId,
          categoryName: item.categoryName || 'Uncategorized',
          description: item.description || '',
          uploadedAt: item.uploadedAt,
        })),
        documents: (profile.documents ?? []).map((document, index) => ({
          id: document.id || String(index),
          title: document.title || document.fileName || `Document ${index + 1}`,
          fileName: document.fileName || document.title || `Document ${index + 1}`,
          documentUrl: document.documentUrl || document.fileUrl || '',
          uploadedAt: document.uploadedAt || null,
          contentType: document.contentType || null,
        })).filter((document) => document.documentUrl),
        completedWork: (profile.completedProjects ?? []).map((project) => ({
          id: project.projectId,
          title: project.title || 'Untitled project',
          clientName: project.clientName || 'Client',
          clientImageUrl: project.clientImageUrl || '',
          description: project.description || '',
          completedAt: project.completedAt || '',
          rating: project.rating ?? 0,
          comment: project.comment || 'No comment provided.',
          category: project.category || 'Project',
        })),
        title: profile.title || baseProfile.title,
        completedProjectsCount: profile.completedProjectsCount ?? 0,
      };
    }
    case 'client': {
      const profile = await getClientPublicProfile(roleProfileId);
      return {
        ...baseProfile,
        name: profile.fullName || baseProfile.name,
        avatar: profile.imageUrl || baseProfile.avatar,
        email: profile.email || baseProfile.email,
        bio: profile.bio || baseProfile.bio,
        location: profile.country || baseProfile.location,
        phone: profile.phoneNumber,
        linkedin: profile.websiteUrl || undefined,
        rating: profile.averageRating ?? 0,
        totalRatings: profile.totalReviews ?? 0,
        completedProjects: profile.totalProjectsCompleted ?? 0,
        totalSpent: profile.totalSpent ?? 0,
        activeProjects: Math.max((profile.totalProjectsPosted ?? 0) - (profile.totalProjectsCompleted ?? 0), 0),
      };
    }
    case 'employer': {
      const profile = await getEmployerPublicProfile(roleProfileId);
      return {
        ...baseProfile,
        name: profile.fullName || baseProfile.name,
        avatar: profile.imageUrl || baseProfile.avatar,
        email: profile.email || baseProfile.email,
        location: profile.address || baseProfile.location,
        phone: profile.phoneNumber || undefined,
        website : profile.websiteUrl || undefined,
        companies: (profile.companies ?? []).map((company: Record<string, unknown>) => ({
          id: company.id,
          name: company.name,
          industry: company.industry || 'Not specified',
          logo: company.logoUrl || undefined,
        })),
      };
    }
    case 'applicant': {
      const profile = await getJobSeekerPublicProfile(roleProfileId);
      return {
        ...baseProfile,
        name: profile.fullName || baseProfile.name,
        avatar: profile.imageUrl || baseProfile.avatar,
        email: profile.email || baseProfile.email,
        location: profile.address || baseProfile.location,
        phone: profile.phoneNumber || undefined,
        gitHubUrl: profile.gitHubUrl || undefined,
        website : profile.websiteUrl || profile.gitHubUrl || undefined,
        experience: profile.experience || undefined,
        education: profile.education || undefined,
        cv: profile.cv ? {
          cvUrl: profile.cv.cvUrl,
          contentType: profile.cv.contentType,
          jobTitle: profile.cv.jobTitle,
          isPublic: profile.cv.isPublic,
          fileName: profile.cv.fileName,
          uploadedAt: profile.cv.uploadedAt
        } : undefined
      };
    }
    case 'learner': {
      const profile = await getLearnerPublicProfile(roleProfileId);
      return {
        ...baseProfile,
        name: profile.fullName || baseProfile.name,
        avatar: profile.imageUrl || baseProfile.avatar,
        email: profile.email || baseProfile.email,
        bio: profile.bio || baseProfile.bio,
        goals: profile.learningGoals || undefined,
        interests: profile.interests ?? [],
        completedProjects: profile.projectsCompleted ?? 0,
        roadmaps: (profile.enrollments ?? []).map((enrollment) => ({
          id: enrollment.enrollmentId,
          title: enrollment.trackName,
          progress: enrollment.progressPercent,
          totalSteps: enrollment.totalTopics,
          completedSteps: enrollment.completedTopics,
          category: enrollment.isCompleted ? 'Completed' : 'In Progress',
        })),
        courseProjects: (profile.projects ?? []).map((project) => ({
          id: project.projectId,
          courseName: project.trackName,
          projectTitle: project.title,
          description: project.description,
          githubLink: project.repoUrl,
          completedDate: project.submittedAt,
          technologies: [],
        })),
        location: profile.address || baseProfile.location,
        learningGoals: profile.learningGoals || undefined,
      };
    }
    default:
      return baseProfile;
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
  const [profileSummary, setProfileSummary] = useState<PublicProfileSummary | null>(null);
  const [profileUser, setProfileUser] = useState<PublicUserData | null>(null);
  const [activeRole, setActiveRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');


  useEffect(() => {
    let isCurrent = true;
    const loadSummary = async () => {
      const id = String(userId ?? '').trim();
      if (!id) {
        setProfileSummary(null);
        setProfileUser(null);
        setActiveRole('');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const summary = await getProfileSummary(id);
        if (!isCurrent) return;

        const baseProfile = buildBaseProfile(summary);
        const roleParam = normalizeRole(searchParams.get('role') || '');
        const selectedRole = roleParam && baseProfile.roles.includes(roleParam)
          ? roleParam
          : baseProfile.roles[0] || '';

        setProfileSummary(summary);
        setProfileUser(baseProfile);
        setActiveRole(selectedRole);
      } catch {
        if (!isCurrent) return;
        setProfileSummary(null);
        setProfileUser(null);
        setActiveRole('');
        setIsLoading(false);
      }
    };

    loadSummary();

    return () => {
      isCurrent = false;
    };
  }, [userId, searchParams]);

  useEffect(() => {
    let isCurrent = true;

    const loadRoleProfile = async () => {
      if (!profileSummary || !activeRole) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const baseProfile = buildBaseProfile(profileSummary);
        const roleProfile = await mergeRoleProfile(profileSummary, activeRole, baseProfile);
        if (isCurrent) setProfileUser(roleProfile);
      } catch {
        if (isCurrent) setProfileUser(buildBaseProfile(profileSummary));
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadRoleProfile();

    return () => {
      isCurrent = false;
    };
  }, [profileSummary, activeRole]);

  useEffect(() => {
    if(activeRole=='employer')
      setActiveTab('companies');
    else
    setActiveTab('overview');
  }, [activeRole]);


  if (!profileUser) {
      return (
        <div className="min-h-screen bg-[#0f1225]">
          <Navbar />
          <div className="pt-32 pb-16 text-center">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-white/5 rounded-full">
              <i className="ri-loader-4-line text-4xl text-gray-500 animate-spin"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading profile</h2>
            <p className="text-gray-400">Fetching the latest public profile details.</p>
          </div>
          <Footer />
        </div>
      );
  }

  const gradient = getRoleGradient(activeRole);
  const canShowRating = activeRole === 'client' || activeRole === 'freelancer';

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
        return ['overview', 'portfolio', 'completed','documents'];
      case 'client':
        return ['overview'];
      case 'employer':
        return ['companies'];
      case 'applicant':
        return ['overview', 'cv'];
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
      documents: 'Documents',
      companies: 'Companies',
      cv: 'CV',
      roadmaps: 'Roadmaps',
      projects: 'Course Projects'
    };
    return labels[tab] || tab;
  };

  const tabs = getTabsForRole(activeRole);

  const renderLoadingGrid = (count = 3) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
          <div className="h-40 bg-white/10 rounded-lg mb-4"></div>
          <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  const renderLoadingList = (count = 3) => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-white/10 rounded mb-2"></div>
          <div className="h-4 bg-white/10 rounded mb-2 w-5/6"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

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
                    <i className="ri-user-line text-2xl text-white/70"></i>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{profileUser.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                     {profileUser.phone && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-phone-line text-orange-400"></i>{profileUser.phone}</span>}
                     {profileUser.email && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-mail-line text-orange-400"></i>{profileUser.email}</span>}
                     {profileUser.location && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-map-pin-line text-orange-400"></i>{profileUser.location}</span>}
                     {profileUser.website && <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-global-line text-orange-400"></i>{profileUser.website}</a>}
                     {profileUser.gitHubUrl && <a href={profileUser.gitHubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-github-line text-gray-400"></i>{profileUser.gitHubUrl}</a>}
                    
                    </div>
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

                  {/* Rating */}
                  {canShowRating && (
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <div className="flex items-center gap-1">{renderStars(profileUser.rating)}</div>
                        <span className="text-yellow-400 font-bold text-lg">{profileUser.rating}</span>
                        <span className="text-gray-500 text-sm">({profileUser.totalRatings})</span>
                      </div>

                    </div>
                  )}
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

          {/* Loading state when switching roles */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
                <i className="ri-loader-4-line text-3xl text-gray-400 animate-spin"></i>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeRole != 'employer' && activeTab === 'overview' && !isLoading && (
            <div className="space-y-6">
              {profileUser.bio && activeRole !== 'employer' && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-3">About</h2>
                  <p className="text-gray-300 leading-relaxed">{profileUser.bio}</p>
                </div>
              )}

              {activeRole == 'freelancer' && profileUser.title && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-3">Title</h2>
                  <p className="text-gray-300 leading-relaxed">{profileUser.title}</p>
                </div>
              )}


              {/* Skills */}
              {Array.isArray(profileUser.skills) && profileUser.skills.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills.map((skill, index) => {
                      let skillName: string;
                      if (typeof skill === 'string') {
                        skillName = skill;
                      } else if (typeof skill === 'object' && skill !== null) {
                        skillName = (skill as Record<string, any>).name || (skill as Record<string, any>).title || String(skill);
                      } else {
                        skillName = String(skill);
                      }
                      return (
                        <span
                          key={`skill-${index}-${skillName}`}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"
                        >
                          {skillName}
                        </span>
                      );
                    })}
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

              {/* freelancer-specific: Experienc && AvailabilityAvailability */}
              {(activeRole === 'freelancer') && profileUser.experience && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileUser.experience && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-white mb-3">Experience</h2>
                      <p className="text-gray-300">{profileUser.experience}</p>
                    </div>
                  )}
                  {profileUser.isAvailable !== undefined && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-white mb-3">Availability</h2>
                      <p className="text-gray-300">{profileUser.isAvailable ? 'Available' : 'Not Available'}</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  
                </div>
              )}
            </div>
          )}

          {/* Employer Overview Tab */}
          {activeRole === 'employer' && activeTab === 'overview' && !isLoading && (
            <div className="space-y-6">
              {profileUser.bio && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-3">About</h2>
                  <p className="text-gray-300 leading-relaxed">{profileUser.bio}</p>
                </div>
              )}

              {/* Skills */}
              {Array.isArray(profileUser.skills) && profileUser.skills.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills.map((skill, index) => {
                      let skillName: string;
                      if (typeof skill === 'string') {
                        skillName = skill;
                      } else if (typeof skill === 'object' && skill !== null) {
                        skillName = (skill as Record<string, any>).name || (skill as Record<string, any>).title || String(skill);
                      } else {
                        skillName = String(skill);
                      }
                      return (
                        <span
                          key={`skill-${index}-${skillName}`}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"
                        >
                          {skillName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Tab (Freelancer) */}
          {activeTab === 'portfolio' && (
            <>
              {isLoading && renderLoadingGrid(2)}
              {!isLoading && Array.isArray(profileUser.portfolio) && profileUser.portfolio.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {profileUser.portfolio.map((item) => (
                  item && item.id ? (
                    <div key={item.id} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                      {/* PDF Preview Area */}
                      <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-b border-white/10 flex flex-col items-center justify-center gap-3 relative">
                        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/30">
                          <i className="ri-file-pdf-line text-4xl text-purple-400"></i>
                        </div>
                        <div className="text-center px-4">
                          <p className="text-white text-sm font-medium truncate max-w-xs">{item.title || 'Untitled'}</p>
                        </div>
                        {item.portfolioUrl && (
                          <a
                            href={item.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-purple-500/30 border border-white/10 hover:border-purple-500/40 text-gray-300 hover:text-purple-300 transition-all cursor-pointer"
                            title="Download PDF"
                          >
                             <i className="ri-external-link-line text-sm"></i>
                          </a>
                        )}
                      </div>

                    {/* Card Info */}
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs sm:text-sm font-medium">
                          {item.categoryName || 'Uncategorized'}
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm">{item.uploadedAt}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm sm:text-base text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  ) : null
                ))}
              </div>
              )}
              {!isLoading && (!Array.isArray(profileUser.portfolio) || profileUser.portfolio.length === 0) && (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <i className="ri-image-line text-5xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400">No portfolio items yet</p>
                </div>
              )}
            </>
          )}


          {/* Completed Projects Tab (Freelancer) */}
          {activeTab === 'completed' && (
            <>
              {isLoading && renderLoadingList(2)}
              {!isLoading && Array.isArray(profileUser.completedWork) && profileUser.completedWork.length > 0 && (
            <div className="space-y-4">
              {profileUser.completedWork.map(project => (
                project && project.id ? (
                  <div
                    key={project.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium">
                            {project.category || 'Project'}
                          </span>
                          <span className="text-gray-400 text-sm">
                            <i className="ri-calendar-line mr-1"></i>
                            {project.completedAt ? new Date(project.completedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{project.title || 'Untitled'}</h3>
                        <p className="text-gray-400 mb-4">{project.description || ''}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">{renderStars(project.rating || 0)}</div>
                        </div>
                      </div>
                      <div className="lg:w-72 bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                            {project.clientImageUrl ? (
                              <img src={project.clientImageUrl} alt={project.clientName} className="w-full h-full object-cover" />
                            ) : (
                              <i className="ri-user-line text-2xl text-white/70"></i>
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">{project.clientName || 'Client'}</h4>
                            <p className="text-gray-400 text-xs">Client</p>
                          </div>
                        </div>
                      <p className="text-gray-300 text-sm italic">&quot;{project.comment}&quot;</p>
                    </div>
                  </div>
                </div>
                ) : null
              ))}
              {(profileUser.completedWork ?? []).length === 0 && (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <i className="ri-folder-line text-5xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400">No completed projects yet</p>
                </div>
              )}
            </div>
              )}
            </>
          )}

          {/* Documents Tab (Freelancer) */}
          {activeTab === 'documents' && (
            <>
              {isLoading && renderLoadingGrid(2)}
              {!isLoading && Array.isArray(profileUser.documents) && profileUser.documents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {profileUser.documents.map(document => (
                document && document.id ? (
                  <div key={document.id} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/30 transition-all">
                    <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-b border-white/10 flex flex-col items-center justify-center gap-3 relative">
                      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/30">
                        <i className="ri-file-text-line text-4xl text-cyan-400"></i>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-white text-sm font-medium truncate max-w-xs">{document.title || document.fileName || 'Document'}</p>
                      </div>
                      {document.documentUrl && (
                        <a
                          href={document.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-cyan-500/30 border border-white/10 hover:border-cyan-500/40 text-gray-300 hover:text-cyan-300 transition-all cursor-pointer"
                          title="Download Document"
                        >
                          <i className="ri-external-link-line text-sm"></i>
                        </a>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{document.title || document.fileName}</h3>
                      <p className="text-xs sm:text-sm text-gray-400">{document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : 'Date not available'}</p>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
              )}
              {!isLoading && (!Array.isArray(profileUser.documents) || profileUser.documents.length === 0) && (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <i className="ri-file-line text-5xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400">No documents uploaded</p>
                </div>
              )}
            </>
          )}
          {activeTab === 'companies' && (
            <>
              {isLoading && renderLoadingGrid(3)}
              {!isLoading && profileUser.companies && (
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
              {profileUser.companies.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-3 text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <i className="ri-building-line text-5xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400">No companies available</p>
                </div>
              )}
            </div>
              )}
            </>
          )}

          {/* CV Tab (Applicant) */}
          {activeTab === 'cv' && (
            <>
              {isLoading && <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse"><div className="h-20 bg-white/10 rounded mb-4"></div><div className="h-4 bg-white/10 rounded w-1/2"></div></div>}
              {!isLoading && profileUser.cv?.isPublic && activeRole === 'applicant' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              {profileUser.cv?.cvUrl && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-pink-500/20 border border-pink-500/30">
                      <i className="ri-file-pdf-line text-3xl text-pink-400"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{profileUser.cv.fileName || 'CV.pdf'}</h3>
                      <p className="text-gray-400 text-sm">
                        {profileUser.cv.jobTitle || 'Applicant CV'}
                        {profileUser.cv.uploadedAt ? ` • ${new Date(profileUser.cv.uploadedAt).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>
                  <a
                    href={profileUser.cv.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-lg hover:bg-pink-500 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-external-link-line"></i>
                    View CV
                  </a>
                </div>
              )}
            </div>
              )}
            </>
          )}

          {activeTab === 'cv' && !isLoading && (!profileUser.cv || !profileUser.cv.isPublic) && activeRole === 'applicant' && (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
              <i className="ri-file-search-line text-5xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No public CV available</p>
            </div>
          )}

          {/* Roadmaps Tab (Learner) */}
          {activeTab === 'roadmaps' && (
            <>
              {isLoading && renderLoadingList(3)}
              {!isLoading && profileUser.roadmaps && (
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
            </>
          )}

          {/* Course Projects Tab (Learner) */}
          {activeTab === 'projects' && (
            <>
              {isLoading && renderLoadingList(3)}
              {!isLoading && profileUser.courseProjects && (
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
            </>
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
