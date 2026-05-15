import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProfilePhotoModal from '../../components/feature/ProfilePhotoModal';
import LearnerEditModal from '../../components/feature/LearnerEditModal';
import type { LearnerEditData } from '../../components/feature/LearnerEditModal';
import useProfilePhoto from '../../hooks/useProfilePhoto';
import { getLearnerProfile, updateLearnerProfile, addLearnerInterest, deleteLearnerInterest, type LearnerProfileDto } from '../../services/learner.service';

interface Roadmap {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  category: string;
}

interface CompletedProject {
  id: string;
  courseName: string;
  projectTitle: string;
  description: string;
  githubLink: string;
  completedDate: string;
  technologies: string[];
}

const LearnerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo] = useState({
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
  });
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfileDto | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState({
    bio: '',
    interests: [],
    goals: '',
  });

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setFetchError(null);

    getLearnerProfile()
      .then((data) => {
        if (!active) return;
        setLearnerProfile(data);
        setProfile({
          bio: data.bio ?? '',
          interests: data.interests ?? [],
          goals: data.learningGoals ?? '',
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFetchError(error instanceof Error ? error.message : 'Unable to load learner profile.');
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const [roadmaps] = useState<Roadmap[]>([
    {
      id: '1',
      title: 'Full-Stack Web Development',
      description: 'Master frontend and backend development',
      progress: 65,
      totalSteps: 20,
      completedSteps: 13,
      category: 'Web Development'
    },
    {
      id: '2',
      title: 'Data Science Fundamentals',
      description: 'Learn Python, statistics, and machine learning',
      progress: 30,
      totalSteps: 15,
      completedSteps: 5,
      category: 'Data Science'
    }
  ]);

  const [completedProjects] = useState<CompletedProject[]>([
    {
      id: '1',
      courseName: 'Full Stack Web Development',
      projectTitle: 'E-Commerce Platform',
      description: 'A full-stack e-commerce platform with React frontend, Node.js backend, PostgreSQL database, and Docker deployment. Features include user authentication, product catalog, shopping cart, and payment integration.',
      githubLink: 'https://github.com/user/fullstack-ecommerce',
      completedDate: '2024-01-15',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker']
    },
    {
      id: '2',
      courseName: 'React Developer Path',
      projectTitle: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
      githubLink: 'https://github.com/user/task-manager',
      completedDate: '2023-11-20',
      technologies: ['React', 'Redux', 'Firebase', 'Tailwind CSS']
    }
  ]);

  const [newInterest, setNewInterest] = useState('');
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  const [isDeletingInterest, setIsDeletingInterest] = useState<string | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);

  const learnerRoadmaps: Roadmap[] = learnerProfile?.enrollments?.map((enrollment) => ({
    id: String(enrollment.enrollmentId),
    title: enrollment.trackName || 'Learning Track',
    description: '',
    progress: enrollment.progressPercent || 0,
    totalSteps: enrollment.totalTopics || 0,
    completedSteps: enrollment.completedTopics || 0,
    category: enrollment.trackName || 'Learning',
  })) ?? roadmaps;
  const learnerProjects: CompletedProject[] = learnerProfile?.projects?.map((project) => ({
    id: String(project.projectId),
    courseName: project.trackName || 'Learner Project',
    projectTitle: project.title || 'Project',
    description: project.description || '',
    githubLink: project.repoUrl || project.fileUrl || '#',
    completedDate: project.submittedAt ? new Date(project.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown',
    technologies: [],
  })) ?? completedProjects;
  const totalSteps = learnerProfile?.totalSteps ?? learnerRoadmaps.reduce((acc, item) => acc + item.totalSteps, 0);
  const completedSteps = learnerProfile?.completedSteps ?? learnerRoadmaps.reduce((acc, item) => acc + item.completedSteps, 0);
  const activeRoadmapsCount = learnerProfile?.activeRoadmaps ?? learnerRoadmaps.length;
  const projectsCompletedCount = learnerProfile?.projectsCompleted ?? learnerProjects.length;

  const handleSaveEdit = async (data: LearnerEditData) => {
    try {
      const updated = await updateLearnerProfile({
        bio: data.bio,
        learningGoals: data.goals,
      });

      setLearnerProfile(updated);
      setProfile(prev => ({
        ...prev,
        bio: updated.bio ?? prev.bio,
        goals: updated.learningGoals ?? prev.goals,
      }));
    } catch (error: unknown) {
      console.error('Unable to update learner profile', error);
    }
  };

  const editData: LearnerEditData = {
    bio: learnerProfile?.bio ?? profile.bio,
    goals: learnerProfile?.learningGoals ?? profile.goals,
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim()) return;
    if (profile.interests.includes(newInterest.trim())) {
      setInterestError('This interest already exists.');
      return;
    }

    setIsAddingInterest(true);
    setInterestError(null);
    
    try {
      const updated = await addLearnerInterest(newInterest.trim());
      setLearnerProfile(updated);
      setProfile(prev => ({
        ...prev,
        interests: updated.interests,
      }));
      setNewInterest('');
    } catch (error: unknown) {
      setInterestError(error instanceof Error ? error.message : 'Failed to add interest');
      console.error('Unable to add interest', error);
    } finally {
      setIsAddingInterest(false);
    }
  };

  const handleRemoveInterest = async (interest: string) => {
    setIsDeletingInterest(interest);
    setInterestError(null);
    
    try {
      const updated = await deleteLearnerInterest(interest);
      setLearnerProfile(updated);
      setProfile(prev => ({
        ...prev,
        interests: updated.interests,
      }));
    } catch (error: unknown) {
      setInterestError(error instanceof Error ? error.message : 'Failed to delete interest');
      console.error('Unable to delete interest', error);
    } finally {
      setIsDeletingInterest(null);
    }
  };

  const handleContinueLearning = (trackName: string) => {
    navigate(`/roadmaps/learn/${trackName}`);
  };

  const { handlePhotoUpload, handlePhotoRemove } = useProfilePhoto();

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      
      <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading && (
            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300">
              Loading learner profile...
            </div>
          )}
          {fetchError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-400/20 text-sm text-red-200">
              {fetchError}
            </div>
          )}
          {/* Profile Header */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div 
                onClick={() => setShowPhotoModal(true)}
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex-shrink-0 cursor-pointer relative group"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <i className="ri-user-line text-4xl sm:text-5xl lg:text-6xl text-white"></i>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i className="ri-camera-line text-2xl text-white"></i>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{user?.name}</h1>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Edit
                  </button>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-2 break-all">{user?.email}</p>
                {(contactInfo.phone || contactInfo.location || contactInfo.website || contactInfo.linkedin || contactInfo.github || contactInfo.twitter) && (
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {contactInfo.phone && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-phone-line text-emerald-400"></i>{contactInfo.phone}</span>}
                    {contactInfo.location && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-map-pin-line text-emerald-400"></i>{contactInfo.location}</span>}
                    {contactInfo.website && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-global-line text-emerald-400"></i>{contactInfo.website}</span>}
                    {contactInfo.linkedin && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-linkedin-box-line text-emerald-400"></i>{contactInfo.linkedin}</span>}
                    {contactInfo.github && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-github-fill text-emerald-400"></i>{contactInfo.github}</span>}
                    {contactInfo.twitter && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-twitter-x-line text-emerald-400"></i>{contactInfo.twitter}</span>}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <i className="ri-road-map-line text-emerald-400 text-lg sm:text-xl"></i>
                    <span className="text-sm sm:text-base text-white font-semibold">{activeRoadmapsCount} Active Roadmaps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-folder-check-line text-emerald-400 text-lg sm:text-xl"></i>
                    <span className="text-sm sm:text-base text-white font-semibold">{projectsCompletedCount} Projects Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-emerald-500/20 mb-2 sm:mb-3">
                <i className="ri-book-open-line text-xl sm:text-2xl text-emerald-400"></i>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Steps</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{totalSteps}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-green-500/20 mb-2 sm:mb-3">
                <i className="ri-checkbox-circle-line text-xl sm:text-2xl text-green-400"></i>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{completedSteps}</p>
            </div>
          </div>

          {/* Active Roadmaps */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">My Roadmaps</h2>
            <div className="space-y-4 sm:space-y-6">
              {learnerRoadmaps.map((roadmap) => (
                <div key={roadmap.id} className="bg-white/5 rounded-lg p-4 sm:p-5 lg:p-6 border border-white/10">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{roadmap.title}</h3>
                      <p className="text-sm sm:text-base text-gray-400">{roadmap.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs sm:text-sm font-medium whitespace-nowrap">
                      {roadmap.category}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-xs sm:text-sm">Progress</span>
                      <span className="text-sm sm:text-base text-white font-semibold">{roadmap.completedSteps}/{roadmap.totalSteps} steps</span>
                    </div>
                    <div className="w-full h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all"
                        style={{ width: `${roadmap.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <span className="text-emerald-400 font-semibold text-sm sm:text-base">{roadmap.progress}% Complete</span>
                    <button 
                      onClick={() => handleContinueLearning(roadmap.category)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-emerald-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Continue Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Projects */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <i className="ri-folder-check-line text-emerald-400"></i>
              Completed Course Projects
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {learnerProjects.map((project) => (
                <div key={project.id} className="bg-white/5 rounded-xl p-4 sm:p-5 lg:p-6 border border-white/10">
                  <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium whitespace-nowrap">
                          {project.courseName}
                        </span>
                        <span className="text-gray-500 text-xs sm:text-sm">
                          <i className="ri-calendar-line mr-1"></i>
                          {new Date(project.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{project.projectTitle}</h3>
                      <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                        {project.technologies.map((tech) => (
                          <span key={tech} className="px-2 sm:px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white text-sm sm:text-base hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <i className="ri-github-fill text-base sm:text-lg"></i>
                    View on GitHub
                    <i className="ri-external-link-line text-xs sm:text-sm"></i>
                  </a>
                </div>
              ))}

              {learnerProjects.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <i className="ri-folder-line text-2xl sm:text-3xl text-white/40"></i>
                  </div>
                  <h3 className="text-base sm:text-lg text-white font-semibold mb-2">No Projects Yet</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">Complete a course and submit your graduation project to see it here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* About */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">About Me</h2>
              </div>
              {profile.bio ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{profile.bio}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Tell us about yourself!</p>
              )}
            </div>

            {/* Learning Goals */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Learning Goals</h2>
              </div>
              {profile.goals ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{profile.goals}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Tell us about your learning goals!</p>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Interests</h2>
            {interestError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-400/20 text-sm text-red-200">
                {interestError}
              </div>
            )}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
              {profile.interests.map((interest) => (
                <div
                  key={interest}
                  className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2"
                >
                  <span className="text-sm sm:text-base text-white font-medium">{interest}</span>
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    disabled={isDeletingInterest === interest}
                    className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-white hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingInterest === interest ? (
                      <i className="ri-loader-4-line text-sm sm:text-base animate-spin"></i>
                    ) : (
                      <i className="ri-close-line text-sm sm:text-base"></i>
                    )}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAddingInterest && handleAddInterest()}
                disabled={isAddingInterest}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Add an interest..."
              />
              <button
                onClick={handleAddInterest}
                disabled={isAddingInterest}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-emerald-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingInterest ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Adding...
                  </>
                ) : (
                  'Add Interest'
                )}
              </button>
            </div>
          </div>

          {/* Password & Security - Moved to Settings page */}
        </div>
      </div>

      <Footer />

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentPhoto={user?.avatar}
        userName={user?.name}
        onUpload={handlePhotoUpload}
        onRemove={handlePhotoRemove}
        accentColor="emerald"
      />

      <LearnerEditModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        data={editData}
        onSave={handleSaveEdit}
        accentColor="emerald"
      />
    </div>
  );
};

export default LearnerProfile;
