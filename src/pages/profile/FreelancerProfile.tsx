import { useEffect, useMemo, useState } from 'react';
import { PREDEFINED_SKILLS } from '../../constants/skills';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProfilePhotoModal from '../../components/feature/ProfilePhotoModal';
import FreelancerEditModal from '../../components/feature/FreelancerEditModal';
import type { FreelancerEditData } from '../../components/feature/FreelancerEditModal';
import useProfilePhoto from '../../hooks/useProfilePhoto';
import CustomSelect from '../../components/base/CustomSelect';
import {
  getFreelancerProfile,
  updateFreelancerProfile,
  getFreelancerCompletedProjects,
  getMyReports,
  type FreelancerProfileDto,
  type FreelancerReport,
} from '../../services/freelancer-profile.service';
import {
  addFreelancerSkill,
  deleteFreelancerSkill,
  getFreelancerSkills,
  type FreelancerSkill,
} from '../../services/freelancer-skills.service';
import {
  addFreelancerPortfolio,
  deleteFreelancerPortfolio,
  getFreelancerPortfolioCategories,
  getFreelancerPortfolios,
  type PortfolioCategoryOption,
  type FreelancerPortfolioDto,
} from '../../services/freelancer-portfolio.service';
import {
  deleteFreelancerDocument,
  getFreelancerDocuments,
  uploadFreelancerDocument,
  type FreelancerDocumentDto,
} from '../../services/freelancer-documents.service';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  pdfName: string;
  pdfUrl: string;
  pdfSize?: number;
  category: string;
  completedDate: string;
}

interface Document {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface CompletedProject {
  id: string;
  title: string | null;
  client: string | null;
  clientAvatar: string | null;
  description: string | null;
  budget: number | null;
  totalPaid: number | null;
  completedDate: string | null;
  rating: number | null;
  review: string | null;
  category: string | null;
  status: string | null;
}

const formatPortfolioCategoryLabel = (value: string): string =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();

const resolvePortfolioFileExtension = (url: string): string => {
  if (!url) return '';
  const noQuery = url.split('?')[0];
  const last = noQuery.split('/').pop() || '';
  const dot = last.lastIndexOf('.');
  return dot > -1 ? last.slice(dot) : '';
};

const formatPortfolioDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const date = parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const time = parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${date} at ${time}`;
};

const formatDocumentDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const date = parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const time = parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${date}, ${time}`;
};

const toPortfolioItem = (item: FreelancerPortfolioDto): PortfolioItem => ({
  id: String(item.id),
  title: item.title,
  description: item.description,
  pdfName: `${item.title || 'Portfolio'}${resolvePortfolioFileExtension(item.portfolioUrl) || '.pdf'}`,
  pdfUrl: item.portfolioUrl,
  category: item.categoryName ? formatPortfolioCategoryLabel(item.categoryName) : 'Uncategorized',
  completedDate: formatPortfolioDate(item.uploadedAt),
});

const toDocumentItem = (item: FreelancerDocumentDto): Document => ({
  id: String(item.id),
  name: item.documentName,
  url: item.documentUrl,
  uploadedAt: formatDocumentDate(item.uploadedAt),
});

const FreelancerProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'completed' | 'documents' | 'reports'>('profile');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [freelancerProfile, setFreelancerProfile] = useState<FreelancerEditData>({
    title: '',
    hourlyRate: 0,
    country: '',
    phoneNumber: '',
    yearsOfExperience: 0,
    isAvailable: false,
    websiteUrl: '',
    bio: '',
    linkedInUrl: '',
    gitHubUrl: '',
  });
  const [profileMeta, setProfileMeta] = useState({
    rating: 0,
    completedProjects: 0,
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [saveStatus, setSaveStatus] = useState<null | { type: 'success' | 'error'; message: string }>(null);

  const [skills, setSkills] = useState<FreelancerSkill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState('');
  const [skillsActionError, setSkillsActionError] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [deletingSkillId, setDeletingSkillId] = useState<number | null>(null);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState('');
  const [portfolioActionError, setPortfolioActionError] = useState('');
  const [portfolioActionLoading, setPortfolioActionLoading] = useState(false);
  const [portfolioDeleteError, setPortfolioDeleteError] = useState('');
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<string | null>(null);
  const [portfolioCategories, setPortfolioCategories] = useState<PortfolioCategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [completedProjects, setCompletedProjects] = useState<{
    projects: CompletedProject[];
    totalCompletedProjects: number;
  }>({
    projects: [],
    totalCompletedProjects: 0,
  });
  const [completedProjectsLoading, setCompletedProjectsLoading] = useState(true);
  const [completedProjectsError, setCompletedProjectsError] = useState('');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState('');
  const [documentStatus, setDocumentStatus] = useState<null | { type: 'success' | 'error'; message: string }>(
    null
  );
  const [isDocumentUploading, setIsDocumentUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const [reports, setReports] = useState<FreelancerReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);

  const [newSkill, setNewSkill] = useState('');
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [newPortfolioPdf, setNewPortfolioPdf] = useState<File | null>(null);

  const portfolioCategoryOptions = useMemo(
    () =>
      portfolioCategories.map((category) => ({
        value: category.value,
        label: category.label || formatPortfolioCategoryLabel(category.value),
      })),
    [portfolioCategories]
  );

  const handleAddSkill = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed) {
      setSkillsActionError('Enter a skill name before adding.');
      return;
    }

    if (skills.some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkillsActionError('This skill already exists.');
      return;
    }

    try {
      setSkillsActionError('');
      setIsAddingSkill(true);
      await addFreelancerSkill(trimmed);
      const refreshed = await getFreelancerSkills();
      setSkills(refreshed);
      setNewSkill('');
    } catch (error) {
      setSkillsActionError(
        error instanceof Error
          ? error.message
          : 'We could not update your skills right now. Please try again.'
      );
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      setSkillsActionError('');
      setDeletingSkillId(skillId);
      await deleteFreelancerSkill(skillId);
      setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
    } catch (error) {
      setSkillsActionError(
        error instanceof Error
          ? error.message
          : 'We could not update your skills right now. Please try again.'
      );
    } finally {
      setDeletingSkillId(null);
    }
  };

  const handleAddPortfolio = async () => {
    if (!newPortfolio.title.trim() || !newPortfolio.description.trim() || !newPortfolio.category || !newPortfolioPdf) {
      setPortfolioActionError('Please complete the title, description, category, and file before submitting.');
      return;
    }

    setPortfolioActionError('');
    setPortfolioActionLoading(true);

    try {
      await addFreelancerPortfolio({
        title: newPortfolio.title,
        description: newPortfolio.description,
        category: newPortfolio.category,
        file: newPortfolioPdf,
      });
      const refreshed = await getFreelancerPortfolios();
      setPortfolio(refreshed.map(toPortfolioItem));
      setNewPortfolio({ title: '', description: '', category: '' });
      setNewPortfolioPdf(null);
      setShowPortfolioForm(false);
    } catch (error) {
      setPortfolioActionError(
        error instanceof Error
          ? error.message
          : 'We could not add your portfolio right now. Please try again.'
      );
    } finally {
      setPortfolioActionLoading(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;

    setPortfolioDeleteError('');
    setDeletingPortfolioId(portfolioId);

    try {
      await deleteFreelancerPortfolio(portfolioId);
      const refreshed = await getFreelancerPortfolios();
      setPortfolio(refreshed.map(toPortfolioItem));
    } catch (error) {
      setPortfolioDeleteError(
        error instanceof Error
          ? error.message
          : 'We could not delete this portfolio right now. Please try again.'
      );
    } finally {
      setDeletingPortfolioId(null);
    }
  };

  const refreshDocuments = async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setDocumentsLoading(true);
    }
    setDocumentsError('');

    try {
      const data = await getFreelancerDocuments();
      setDocuments(data.map(toDocumentItem));
    } catch (error) {
      setDocumentsError(
        error instanceof Error
          ? error.message
          : 'We could not load your documents right now. Please try again.'
      );
    } finally {
      if (!options?.silent) {
        setDocumentsLoading(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setDocumentStatus({ type: 'error', message: 'Please select a file to upload.' });
      return;
    }

    setDocumentStatus(null);
    setIsDocumentUploading(true);

    try {
      const result = await uploadFreelancerDocument({
        documentName: file.name,
        file,
      });
      await refreshDocuments({ silent: true });
      setDocumentStatus({ type: 'success', message: result.message });
    } catch (error) {
      setDocumentStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'We could not upload your document right now. Please try again.',
      });
    } finally {
      setIsDocumentUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setDocumentStatus(null);
    setDeletingDocumentId(id);

    try {
      await deleteFreelancerDocument(id);
      await refreshDocuments({ silent: true });
      setDocumentStatus({ type: 'success', message: 'Document deleted successfully.' });
    } catch (error) {
      setDocumentStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'We could not delete this document right now. Please try again.',
      });
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const { handlePhotoUpload, handlePhotoRemove } = useProfilePhoto();

  const toEditData = (data: FreelancerProfileDto): FreelancerEditData => ({
    title: data.title ?? '',
    hourlyRate: data.hourlyRate ?? 0,
    country: data.country ?? '',
    phoneNumber: data.phoneNumber ?? '',
    yearsOfExperience: data.yearsOfExperience ?? 0,
    isAvailable: data.isAvailable ?? false,
    websiteUrl: data.websiteUrl ?? '',
    bio: data.bio ?? '',
    linkedInUrl: data.linkedInUrl ?? '',
    gitHubUrl: data.gitHubUrl ?? '',
  });

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError('');

      try {
        const data = await getFreelancerProfile();
        if (!isMounted) return;
        setFreelancerProfile(toEditData(data));
      } catch (error) {
        if (!isMounted) return;
        setProfileError(
          error instanceof Error
            ? error.message
            : 'We could not load your profile right now. Please try again.'
        );
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDocuments = async () => {
      setDocumentsLoading(true);
      setDocumentsError('');

      try {
        const data = await getFreelancerDocuments();
        if (!isMounted) return;
        setDocuments(data.map(toDocumentItem));
      } catch (error) {
        if (!isMounted) return;
        setDocumentsError(
          error instanceof Error
            ? error.message
            : 'We could not load your documents right now. Please try again.'
        );
      } finally {
        if (isMounted) setDocumentsLoading(false);
      }
    };

    loadDocuments();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPortfolios = async () => {
      setPortfolioLoading(true);
      setPortfolioError('');

      try {
        const data = await getFreelancerPortfolios();
        if (!isMounted) return;
        setPortfolio(data.map(toPortfolioItem));
      } catch (error) {
        if (!isMounted) return;
        setPortfolioError(
          error instanceof Error
            ? error.message
            : 'We could not load your portfolios right now. Please try again.'
        );
      } finally {
        if (isMounted) setPortfolioLoading(false);
      }
    };

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError('');

      try {
        const data = await getFreelancerPortfolioCategories();
        if (!isMounted) return;
        setPortfolioCategories(data);
      } catch (error) {
        if (!isMounted) return;
        setCategoriesError(
          error instanceof Error
            ? error.message
            : 'We could not load categories right now. Please try again.'
        );
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    };

    loadPortfolios();
    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadSkills = async () => {
      setSkillsLoading(true);
      setSkillsError('');

      try {
        const data = await getFreelancerSkills();
        if (!isMounted) return;
        setSkills(data);
      } catch (error) {
        if (!isMounted) return;
        setSkillsError(
          error instanceof Error
            ? error.message
            : 'We could not load your skills right now. Please try again.'
        );
      } finally {
        if (isMounted) setSkillsLoading(false);
      }
    };

    loadSkills();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadReports = async () => {
      setReportsLoading(true);
      setReportsError('');
      try {
        const data = await getMyReports();
        if (!isMounted) return;
        setReports(data);
      } catch (error) {
        if (!isMounted) return;
        setReportsError(
          error instanceof Error
            ? error.message
            : 'We could not load your reports right now. Please try again.'
        );
      } finally {
        if (isMounted) setReportsLoading(false);
      }
    };
    loadReports();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadCompletedProjects = async () => {
      setCompletedProjectsLoading(true);
      setCompletedProjectsError('');

      try {
        const data = await getFreelancerCompletedProjects();
        if (!isMounted) return;
        setCompletedProjects(data);

        // Compute average rating from projects that have reviews/ratings
        const projectsArray = data?.projects || [];
        const ratedProjects = projectsArray.filter(p => p.rating !== null && p.rating !== undefined && p.rating > 0);
        const avgRating = ratedProjects.length > 0
          ? Number((ratedProjects.reduce((acc, p) => acc + (p.rating || 0), 0) / ratedProjects.length).toFixed(1))
          : 0;

        setProfileMeta({
          rating: avgRating || 0,
          completedProjects: data?.totalCompletedProjects || 0
        });
      } catch (error) {
        if (!isMounted) return;
        setCompletedProjectsError(
          error instanceof Error
            ? error.message
            : 'We could not load your completed projects right now. Please try again.'
        );
      } finally {
        if (isMounted) setCompletedProjectsLoading(false);
      }
    };

    loadCompletedProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveEdit = async (data: FreelancerEditData) => {
    setSaveStatus(null);

    try {
      const result = await updateFreelancerProfile(data);
      setFreelancerProfile(result.profile);
      setSaveStatus({ type: 'success', message: result.message });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not update your profile right now. Please try again.';
      setSaveStatus({ type: 'error', message });
      throw error;
    }
  };

  const editData: FreelancerEditData = freelancerProfile;

  const renderStars = (rating: number | null) => {
    const val = rating ?? 0;
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`${i < val ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-500'} text-sm`}
      ></i>
    ));
  };

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const prettyUrlText = (value: string) =>
    value
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/$/, '');

  const prettyEmailText = (value: string) => value.trim();

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {profileLoading && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 flex items-center gap-2">
              <i className="ri-loader-4-line animate-spin text-purple-300"></i>
              Loading your profile...
            </div>
          )}
          {profileError && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {profileError}
            </div>
          )}
          {saveStatus && (
            <div
              className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${saveStatus.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-red-500/30 bg-red-500/10 text-red-200'
                }`}
            >
              {saveStatus.message}
            </div>
          )}
          {/* Profile Header */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div
                onClick={() => setShowPhotoModal(true)}
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 cursor-pointer relative group"
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
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3 ">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{user?.name || 'Profile'}</h1>
                      <div className="flex items-center gap-2 mt-2">
                        <i className="ri-award-fill text-yellow-400 text-lg sm:text-xl"></i>
                        <span className="text-sm sm:text-base text-white font-semibold">{profileMeta.rating}</span>
                        <span className="text-xs sm:text-sm text-gray-400">({profileMeta.completedProjects} projects)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <i className="ri-money-dollar-circle-line text-green-400 text-lg sm:text-xl"></i>
                        <span className="text-sm sm:text-base text-white font-semibold">${freelancerProfile.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowContactModal(true)}
                    disabled={profileLoading || Boolean(profileError)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <i className="ri-edit-line"></i>
                    Edit
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                  {freelancerProfile.title && (
                    <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <i className="ri-briefcase-4-line text-purple-400 mt-0.5"></i>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Title</p>
                        <p className="text-xs sm:text-sm text-gray-200 truncate">{freelancerProfile.title}</p>
                      </div>
                    </div>
                  )}
                  {freelancerProfile.phoneNumber && (
                    <a
                      href={`tel:${freelancerProfile.phoneNumber}`}
                      className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-purple-500/40 transition-colors"
                    >
                      <i className="ri-phone-line text-purple-400 mt-0.5"></i>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Phone</p>
                        <p className="text-xs sm:text-sm text-gray-200 truncate">{freelancerProfile.phoneNumber}</p>
                      </div>
                    </a>
                  )}
                  {user?.email && (
                    <a
                      href={`mailto:${user.email}`}
                      className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-purple-500/40 transition-colors"
                    >
                      <i className="ri-mail-line text-purple-400 mt-0.5"></i>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Email</p>
                        <p className="text-xs sm:text-sm text-gray-200 truncate">{prettyEmailText(user.email)}</p>
                      </div>
                    </a>
                  )}
                  {freelancerProfile.country && (
                    <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <i className="ri-map-pin-line text-purple-400 mt-0.5"></i>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Country</p>
                        <p className="text-xs sm:text-sm text-gray-200 truncate">{freelancerProfile.country}</p>
                      </div>
                    </div>
                  )}
                  {freelancerProfile.yearsOfExperience > 0 && (
                    <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <i className="ri-time-line text-purple-400 mt-0.5"></i>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Experience</p>
                        <p className="text-xs sm:text-sm text-gray-200 truncate">{freelancerProfile.yearsOfExperience} years</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <i className="ri-verified-badge-line text-purple-400 mt-0.5"></i>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Availability</p>
                      <p className="text-xs sm:text-sm text-gray-200 truncate">
                        {freelancerProfile.isAvailable ? 'Available' : 'Not available'}
                      </p>
                    </div>
                  </div>
                  {freelancerProfile.websiteUrl && (
                    <a
                      href={normalizeUrl(freelancerProfile.websiteUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-purple-500/40 transition-colors"
                    >
                      <i className="ri-global-line text-purple-400 mt-0.5"></i>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Website</p>
                        <p className="text-xs sm:text-sm text-gray-200 truncate">{prettyUrlText(freelancerProfile.websiteUrl)}</p>
                      </div>
                    </a>
                  )}
                  {freelancerProfile.linkedInUrl && (
                    <a
                      href={normalizeUrl(freelancerProfile.linkedInUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-purple-500/40 transition-colors"
                    >
                      <i className="ri-linkedin-box-line text-purple-400 mt-0.5"></i>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">LinkedIn</p>
                        <p className="text-xs sm:text-sm text-gray-200 truncate">{prettyUrlText(freelancerProfile.linkedInUrl)}</p>
                      </div>
                    </a>
                  )}
                  {freelancerProfile.gitHubUrl && (
                    <a
                      href={normalizeUrl(freelancerProfile.gitHubUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-purple-500/40 transition-colors"
                    >
                      <i className="ri-github-fill text-purple-400 mt-0.5"></i>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">GitHub</p>
                        <p className="text-xs sm:text-sm text-gray-200 truncate">{prettyUrlText(freelancerProfile.gitHubUrl)}</p>
                      </div>
                    </a>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'profile'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'portfolio'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'completed'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              Completed Projects
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'documents'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'reports'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              <i className="ri-shield-user-line mr-1.5"></i>
              Reports
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Bio */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">About Me</h2>
                  
                </div>
                {freelancerProfile.bio ? (
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{freelancerProfile.bio}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No bio added yet. Click Edit to add yours.</p>
                )}
              </div>

              {/* Skills */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Skills</h2>
                <p className="text-xs text-gray-400 mb-4">Click a skill to add or remove it. Use the search to filter, or type a custom skill below.</p>

                {skillsLoading && (
                  <div className="mb-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                    <i className="ri-loader-4-line animate-spin text-purple-300"></i>
                    Loading skills...
                  </div>
                )}
                {skillsError && (
                  <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {skillsError}
                  </div>
                )}
                {skillsActionError && (
                  <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {skillsActionError}
                  </div>
                )}

                {/* Selected Skills */}
                {skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold mb-2">Selected ({skills.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <button
                          key={skill.id}
                          onClick={() => handleRemoveSkill(skill.id)}
                          disabled={deletingSkillId === skill.id || isAddingSkill}
                          title="Click to remove"
                          className="group flex items-center gap-1.5 bg-purple-500 border border-purple-400 rounded-lg px-3 py-1.5 text-sm text-white font-medium transition-all hover:bg-red-500 hover:border-red-400 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deletingSkillId === skill.id
                            ? <i className="ri-loader-4-line animate-spin text-xs"></i>
                            : <i className="ri-check-line text-xs group-hover:hidden"></i>
                          }
                          <i className="ri-close-line text-xs hidden group-hover:inline"></i>
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Predefined skill chips */}
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1 mb-4 thin-scrollbar">
                  {PREDEFINED_SKILLS.map((skillName) => {
                    const isSelected = skills.some(
                      (s) => s.name.toLowerCase() === skillName.toLowerCase()
                    );
                    return (
                      <button
                        key={skillName}
                        onClick={() => {
                          if (isSelected) {
                            const match = skills.find(
                              (s) => s.name.toLowerCase() === skillName.toLowerCase()
                            );
                            if (match) handleRemoveSkill(match.id);
                          } else {
                            setNewSkill(skillName);
                            // Immediately trigger add with the predefined name
                            const trimmed = skillName.trim();
                            if (!trimmed) return;
                            if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
                            setSkillsActionError('');
                            setIsAddingSkill(true);
                            addFreelancerSkill(trimmed)
                              .then(() => getFreelancerSkills())
                              .then((refreshed) => {
                                setSkills(refreshed);
                                setNewSkill('');
                              })
                              .catch((err) => {
                                setSkillsActionError(
                                  err instanceof Error ? err.message : 'Could not update skills. Please try again.'
                                );
                              })
                              .finally(() => setIsAddingSkill(false));
                          }
                        }}
                        disabled={isAddingSkill || (deletingSkillId !== null)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${isSelected
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-purple-500/15 hover:border-purple-500/40 hover:text-purple-200'
                          }`}
                      >
                        {isSelected && <i className="ri-check-line mr-1 text-xs"></i>}
                        {skillName}
                      </button>
                    );
                  })}
                </div>

                {/* Custom skill input */}
                <div className="border-t border-white/5 pt-4">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold mb-2">Add a custom skill</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => {
                        setNewSkill(e.target.value);
                        if (skillsActionError) setSkillsActionError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="e.g. Rust, Figma, Blender..."
                    />
                    <button
                      onClick={handleAddSkill}
                      disabled={isAddingSkill || skillsLoading || !newSkill.trim()}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isAddingSkill
                        ? <><i className="ri-loader-4-line animate-spin"></i> Adding...</>
                        : <><i className="ri-add-line"></i> Add</>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Hourly Rate */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Hourly Rate</h2>
                  
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-white">${freelancerProfile.hourlyRate}</span>
                  <span className="text-base sm:text-lg text-gray-400 pb-1">/hour</span>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white">My Portfolio</h2>
                <button
                  onClick={() => setShowPortfolioForm(!showPortfolioForm)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Portfolio
                </button>
              </div>

              {portfolioLoading && (
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-purple-300"></i>
                  Loading portfolio...
                </div>
              )}
              {portfolioError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {portfolioError}
                </div>
              )}
              {portfolioDeleteError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {portfolioDeleteError}
                </div>
              )}

              {showPortfolioForm && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Add New Portfolio</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <input
                      type="text"
                      value={newPortfolio.title}
                      onChange={(e) => {
                        setNewPortfolio({ ...newPortfolio, title: e.target.value });
                        if (portfolioActionError) setPortfolioActionError('');
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Portfolio Title"
                    />
                    <textarea
                      value={newPortfolio.description}
                      onChange={(e) => {
                        setNewPortfolio({ ...newPortfolio, description: e.target.value });
                        if (portfolioActionError) setPortfolioActionError('');
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                      rows={3}
                      placeholder="Portfolio Description"
                    />
                    <div className="space-y-2">
                      <CustomSelect
                        value={newPortfolio.category}
                        onChange={(value) => {
                          setNewPortfolio({ ...newPortfolio, category: value });
                          if (portfolioActionError) setPortfolioActionError('');
                        }}
                        options={portfolioCategoryOptions}
                        placeholder={categoriesLoading ? 'Loading categories...' : 'Select category'}
                        className="w-full"
                      />
                      {categoriesError && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <i className="ri-error-warning-line"></i>{categoriesError}
                        </p>
                      )}
                    </div>
                    {/* PDF Upload */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Portfolio PDF File</label>
                      {newPortfolioPdf ? (
                        <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500/20 flex-shrink-0">
                            <i className="ri-file-pdf-line text-xl text-purple-400"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{newPortfolioPdf.name}</p>
                            <p className="text-gray-400 text-xs">{(newPortfolioPdf.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <button
                            onClick={() => setNewPortfolioPdf(null)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <i className="ri-close-line text-sm"></i>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/20 rounded-lg hover:border-purple-500/50 transition-colors cursor-pointer group">
                          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-purple-500/10 transition-colors">
                            <i className="ri-file-pdf-line text-2xl text-gray-400 group-hover:text-purple-400 transition-colors"></i>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-white font-medium">Upload Portfolio PDF</p>
                            <p className="text-xs text-gray-500 mt-1">Click to browse your PDF file</p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              setNewPortfolioPdf(e.target.files?.[0] || null);
                              if (portfolioActionError) setPortfolioActionError('');
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {portfolioActionError && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                        {portfolioActionError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAddPortfolio}
                        disabled={portfolioActionLoading || categoriesLoading || !newPortfolioPdf}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {portfolioActionLoading ? 'Adding...' : 'Add Portfolio'}
                      </button>
                      <button
                        onClick={() => {
                          setShowPortfolioForm(false);
                          setNewPortfolioPdf(null);
                          setPortfolioActionError('');
                        }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white/5 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {portfolio.map((item) => (
                  <div key={item.id} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                    {/* PDF Preview Area */}
                    <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-b border-white/10 flex flex-col items-center justify-center gap-3 relative">
                      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/30">
                        <i className="ri-file-pdf-line text-4xl text-purple-400"></i>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-white text-sm font-medium truncate max-w-xs">{item.pdfName}</p>
                        {item.pdfSize && (
                          <p className="text-gray-500 text-xs mt-0.5">{item.pdfSize} MB</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => item.pdfUrl && window.open(item.pdfUrl, '_blank', 'noopener,noreferrer')}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-purple-500/30 border border-white/10 hover:border-purple-500/40 text-gray-300 hover:text-purple-300 transition-all cursor-pointer"
                        title="Download PDF"
                      >
                        <i className="ri-download-line text-sm"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePortfolio(item.id)}
                        disabled={deletingPortfolioId === item.id}
                        className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/30 border border-white/10 hover:border-red-500/40 text-gray-300 hover:text-red-300 transition-all cursor-pointer disabled:opacity-60"
                        title="Delete Portfolio"
                      >
                        {deletingPortfolioId === item.id ? (
                          <i className="ri-loader-4-line animate-spin text-sm"></i>
                        ) : (
                          <i className="ri-delete-bin-line text-sm"></i>
                        )}
                      </button>
                    </div>

                    {/* Card Info */}
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs sm:text-sm font-medium">
                          {item.category}
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm">{item.completedDate}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm sm:text-base text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!portfolioLoading && portfolio.length === 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-file-pdf-line text-3xl text-white/40"></i>
                  </div>
                  <h3 className="text-lg text-white font-semibold mb-2">No Portfolios Yet</h3>
                  <p className="text-gray-500 text-sm">Click &ldquo;Add Portfolio&rdquo; to upload your first PDF portfolio.</p>
                </div>
              )}
            </div>
          )}

          {/* Completed Projects Tab */}
          {activeTab === 'completed' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  <i className="ri-checkbox-circle-fill text-green-400"></i>
                  Completed Projects
                </h2>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <span className="text-green-400 font-semibold">{(completedProjects?.totalCompletedProjects || 0)} Projects</span>
                  </div>
                  <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                    <span className="text-purple-400 font-semibold">${(completedProjects?.projects || []).reduce((acc, p) => acc + (p.budget || 0), 0).toLocaleString()} Earned</span>
                  </div>
                </div>
              </div>

              {completedProjectsLoading && (
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-purple-300"></i>
                  Loading completed projects...
                </div>
              )}

              {completedProjectsError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {completedProjectsError}
                </div>
              )}

              {!completedProjectsLoading && !completedProjectsError && (
                <>
                  {(completedProjects?.projects || []).length > 0 ? (
                    <div className="space-y-4">
                      {completedProjects.projects.map((project) => (
                        <div key={project.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/30 transition-all">
                          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                            {/* Project Info */}
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium">
                                    {project.category || 'Uncategorized'}
                                  </span>
                                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs font-medium">
                                    {project.status || 'Unknown Status'}
                                  </span>
                                </div>
                                {project.completedDate && !Number.isNaN(new Date(project.completedDate).getTime()) ? (
                                  <span className="text-gray-400 text-sm">
                                    <i className="ri-calendar-line mr-1"></i>
                                    {new Date(project.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-sm italic">
                                    <i className="ri-calendar-line mr-1"></i>
                                    Unknown completion date
                                  </span>
                                )}
                              </div>

                              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{project.title || 'Untitled Project'}</h3>
                              <p className="text-sm sm:text-base text-gray-400 mb-4">{project.description || 'No description provided'}</p>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <i className="ri-money-dollar-circle-line text-green-400"></i>
                                  <span className="text-white font-semibold">
                                    ${project.budget !== null && project.budget !== undefined ? project.budget.toLocaleString() : '0'}
                                  </span>
                                </div>
                                {project.rating !== null && project.rating !== undefined && project.rating > 0 ? (
                                  <div className="flex items-center gap-1">
                                    {renderStars(project.rating)}
                                    <span className="text-white font-semibold ml-1">{project.rating}.0</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-xs italic">No rating yet</span>
                                )}
                              </div>
                            </div>

                            {/* Client Review */}
                            <div className="lg:w-80 bg-white/5 rounded-xl p-4 border border-white/10">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                  <img
                                    src={project.clientAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client || 'Unknown Client')}&background=7c3aed&color=fff&bold=true`}
                                    alt={project.client || 'Unknown Client'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client || 'Unknown Client')}&background=7c3aed&color=fff&bold=true`;
                                      if (target.src !== fallback) {
                                        target.src = fallback;
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold text-sm">{project.client || 'Unknown Client'}</h4>
                                  <p className="text-gray-400 text-xs">Client</p>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm italic">
                                {project.review ? `"${project.review}"` : 'No feedback provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-folder-line text-3xl text-white/40"></i>
                      </div>
                      <h3 className="text-lg text-white font-semibold mb-2">No Completed Projects Yet</h3>
                      <p className="text-gray-500 text-sm">Your completed freelance projects will appear here.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white">My Documents</h2>
                <label className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer text-center">
                  <i className="ri-upload-line mr-2"></i>
                  {isDocumentUploading ? 'Uploading...' : 'Upload Document'}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.zip"
                    disabled={isDocumentUploading}
                  />
                </label>
              </div>

              {documentsLoading && (
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-purple-300"></i>
                  Loading documents...
                </div>
              )}
              {documentsError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {documentsError}
                </div>
              )}
              {documentStatus && (
                <div
                  className={`rounded-lg border px-3 py-2 text-xs ${documentStatus.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-red-500/30 bg-red-500/10 text-red-200'
                    }`}
                >
                  {documentStatus.message}
                </div>
              )}

              {documents.length > 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                  {documents.map((doc, index) => (
                    <div
                      key={doc.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-5 lg:p-6 ${index !== documents.length - 1 ? 'border-b border-white/10' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-purple-500/20 flex-shrink-0">
                          <i className="ri-file-text-line text-xl sm:text-2xl text-purple-400"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base text-white font-semibold truncate">{doc.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-400">Uploaded on {doc.uploadedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => doc.url && window.open(doc.url, '_blank', 'noopener,noreferrer')}
                        >
                          <i className="ri-download-line text-lg sm:text-xl text-white"></i>
                        </button>
                        <button
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors cursor-pointer"
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={deletingDocumentId === doc.id}
                        >
                          {deletingDocumentId === doc.id ? (
                            <i className="ri-loader-4-line animate-spin text-lg sm:text-xl text-white"></i>
                          ) : (
                            <i className="ri-delete-bin-line text-lg sm:text-xl text-white hover:text-red-400"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !documentsLoading ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                  <i className="ri-folder-open-line text-5xl sm:text-6xl text-gray-500 mb-4"></i>
                  <p className="text-base sm:text-lg text-gray-400">No documents uploaded yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">Click the upload button to add your first document</p>
                </div>
              ) : null}
            </div>
          )}

          {/* ── Reports Against Me Tab ─────────────────────────────────────────── */}
          {activeTab === 'reports' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <i className="ri-shield-user-line text-red-400"></i>
                    Reports
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Only you can see this section</p>
                </div>
                {!reportsLoading && !reportsError && (
                  <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 font-semibold">{reports.length} Report{reports.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Loading */}
              {reportsLoading && (
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-purple-300"></i>
                  Loading reports...
                </div>
              )}

              {/* Error */}
              {reportsError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                  <i className="ri-error-warning-line"></i>
                  {reportsError}
                </div>
              )}

              {/* Empty State */}
              {!reportsLoading && !reportsError && reports.length === 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-shield-check-line text-3xl text-green-400"></i>
                  </div>
                  <h3 className="text-lg text-white font-semibold mb-2">No Reports Found</h3>
                </div>
              )}

              {/* Report Cards */}
              {!reportsLoading && !reportsError && reports.length > 0 && (
                <div className="space-y-4">
                  {reports.map((report) => {
                    const isExpanded = expandedReportId === report.reportId;
                    const statusColors: Record<string, string> = {
                      Pending:     'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
                      UnderReview: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
                      Resolved:    'bg-green-500/20 border-green-500/30 text-green-400',
                      Dismissed:   'bg-gray-500/20 border-gray-500/30 text-gray-400',
                    };
                    const statusCls = statusColors[report.status] ?? 'bg-white/10 border-white/20 text-gray-300';

                    const formatDate = (iso: string | null) => {
                      if (!iso) return null;
                      const d = new Date(iso);
                      if (Number.isNaN(d.getTime())) return iso;
                      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
                        ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    };

                    const formatReportType = (t: string) =>
                      t.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

                    const formatAction = (a: string) =>
                      a.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

                    return (
                      <div
                        key={report.reportId}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-red-500/30 transition-all overflow-hidden"
                      >
                        {/* Card Header — always visible */}
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs font-medium">
                                {formatReportType(report.reportType)}
                              </span>
                              <span className={`px-3 py-1 border rounded-lg text-xs font-medium ${statusCls}`}>
                                {report.status === 'UnderReview' ? 'Under Review' : report.status}
                              </span>
                            </div>
                            <span className="text-gray-400 text-xs flex items-center gap-1 flex-shrink-0">
                              <i className="ri-calendar-line"></i>
                              {formatDate(report.createdAt)}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4">{report.description}</p>

                          {/* Reported By */}
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <i className="ri-user-line text-purple-400"></i>
                            <span>Reported by <span className="text-white font-medium">{report.reportedBy}</span></span>
                            <i className="ri-arrow-right-s-line text-gray-500"></i>
                            <span>Complaint against <span className="text-white font-medium">{report.complaintAgainst}</span></span>
                          </div>

                          {/* Expand / Collapse toggle */}
                          <button
                            type="button"
                            onClick={() => setExpandedReportId(isExpanded ? null : report.reportId)}
                            className="mt-4 flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                          >
                            <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-sm`}></i>
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </button>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-white/10 p-4 sm:p-6 space-y-4">
                            {/* Admin Actions */}
                            {report.actions && report.actions.length > 0 && (
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold mb-2">Admin Actions Taken</p>
                                <div className="flex flex-wrap gap-2">
                                  {report.actions.map((action) => (
                                    <span
                                      key={action}
                                      className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 text-xs font-medium"
                                    >
                                      {formatAction(action)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Resolution Info */}
                            {(report.resolvedAt || report.resolutionNote) && (
                              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-2">
                                <p className="text-[11px] uppercase tracking-wide text-green-400 font-bold flex items-center gap-1.5">
                                  <i className="ri-check-double-line"></i>
                                  Resolution
                                </p>
                                {report.resolvedAt && (
                                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <i className="ri-time-line text-green-400"></i>
                                    Resolved on <span className="text-gray-200">{formatDate(report.resolvedAt)}</span>
                                  </p>
                                )}
                                {report.resolutionNote && (
                                  <p className="text-sm text-gray-300 leading-relaxed">{report.resolutionNote}</p>
                                )}
                              </div>
                            )}

                            {/* No resolution yet */}
                            {!report.resolvedAt && !report.resolutionNote && (
                              <p className="text-xs text-gray-500 italic">No resolution note available yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Password & Security moved to Settings page */}
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
        accentColor="purple"
      />

      <FreelancerEditModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        data={editData}
        onSave={handleSaveEdit}
        accentColor="purple"
      />
    </div>
  );
};

export default FreelancerProfile;
