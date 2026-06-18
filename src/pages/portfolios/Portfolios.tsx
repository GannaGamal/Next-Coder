import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import RoleGateModal from '../../components/feature/RoleGateModal';
import CustomSelect from '../../components/base/CustomSelect';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  createFreelancerPublicPortfolio,
  getFreelancerPublicPortfolios,
  type PublicFreelancerPortfolioItem,
} from '../../services/freelancer-public-portfolio.service';

const DEFAULT_JOB_TITLE_OPTIONS = [
  { value: 'WebDevelopment', label: 'Web Development' },
  { value: 'MobileDevelopment', label: 'Mobile Development' },
  { value: 'UIUX', label: 'UI/UX' },
  { value: 'GraphicDesign', label: 'Graphic Design' },
  { value: 'DataScience', label: 'Data Science' },
  { value: 'MachineLearning', label: 'Machine Learning' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'CyberSecurity', label: 'Cyber Security' },
  { value: 'GameDevelopment', label: 'Game Development' },
  { value: 'ContentWriting', label: 'Content Writing' },
  { value: 'DigitalMarketing', label: 'Digital Marketing' },
  { value: 'VideoEditing', label: 'Video Editing' },
  { value: 'Other', label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'HighestRating', label: 'Highest Rated' },
  { value: 'MostCompletedProjects', label: 'Most Completed Projects' },
];

const PORTFOLIO_PAGE_SIZE = 10;

const getVisiblePageNumbers = (currentPage: number, totalPageCount: number): Array<number | 'ellipsis'> => {
  if (totalPageCount <= 7) {
    return Array.from({ length: totalPageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPageCount, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPageCount) pages.add(currentPage + 1);
  if (currentPage > 3) pages.add(2);
  if (currentPage < totalPageCount - 2) pages.add(totalPageCount - 1);

  return Array.from(pages)
    .sort((left, right) => left - right)
    .flatMap((page, index, pagesList) => {
      const previous = pagesList[index - 1];
      if (index > 0 && previous !== undefined && page - previous > 1) {
        return ['ellipsis' as const, page];
      }

      return [page];
    });
};

const formatLabel = (value: string): string =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();

const Portfolios = () => {
  const { user, isAuthenticated } = useAuth();
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showRoleGateModal, setShowRoleGateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [sortBy, setSortBy] = useState<'HighestRating' | 'MostCompletedProjects'>('HighestRating');
  const [showFilters, setShowFilters] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [portfolios, setPortfolios] = useState<PublicFreelancerPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState<{ jobTitle: string; coverImage: File | null }>({
    jobTitle: '',
    coverImage: null,
  });
  const [coverImagePreviewUrl, setCoverImagePreviewUrl] = useState('');

  const jobTitleOptions = useMemo(() => {
    const merged = [...DEFAULT_JOB_TITLE_OPTIONS];
    portfolios.forEach((item) => {
      const value = item.jobTitleName?.trim();
      if (value && !merged.some((option) => option.value === value)) {
        merged.push({ value, label: formatLabel(value) || value });
      }
    });
    return merged;
  }, [portfolios]);

  const skillOptions = useMemo(() => {
    const unique = new Map<string, string>();
    portfolios.forEach((item) => {
      item.skills.forEach((skill) => {
        const trimmed = skill.trim();
        if (trimmed && !unique.has(trimmed.toLowerCase())) {
          unique.set(trimmed.toLowerCase(), trimmed);
        }
      });
    });
    return Array.from(unique.values());
  }, [portfolios]);

  useEffect(() => {
    if (!createForm.coverImage) {
      setCoverImagePreviewUrl('');
      return;
    }

    const previewUrl = URL.createObjectURL(createForm.coverImage);
    setCoverImagePreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [createForm.coverImage]);

  useEffect(() => {
    let alive = true;

    const loadPortfolios = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await getFreelancerPublicPortfolios({
          Search: searchQuery.trim() || undefined,
          Category: selectedJobTitle !== 'all' ? selectedJobTitle : undefined,
          Skill: selectedSkill.trim() || undefined,
          SortBy: sortBy,
          PageNumber: pageNumber,
          PageSize: PORTFOLIO_PAGE_SIZE,
        });

        if (!alive) return;
        setPortfolios(result.items);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages || 0);
        setHasNext(result.hasNext);
        setHasPrev(result.hasPrev);
        if (result.pageNumber !== pageNumber) {
          setPageNumber(result.pageNumber);
        }
      } catch (loadError) {
        if (!alive) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'We could not load portfolios right now. Please try again.'
        );
        setPortfolios([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadPortfolios();

    return () => {
      alive = false;
    };
  }, [pageNumber, searchQuery, selectedJobTitle, selectedSkill, sortBy]);

  const activeFiltersCount = [
    searchQuery.trim().length > 0,
    selectedJobTitle !== 'all',
    selectedSkill.trim().length > 0,
  ].filter(Boolean).length;

  const handleCreatePortfolio = () => {
    if (!isAuthenticated || !user?.roles.includes('freelancer')) {
      setShowRoleGateModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const handleSubmitCreate = async () => {
    if (!createForm.jobTitle.trim()) {
      setCreateError('Please choose a job title.');
      return;
    }

    if (!createForm.coverImage) {
      setCreateError('Please upload a cover image.');
      return;
    }

    if (!user?.freeLancerId) {
      setCreateError('Your freelancer profile is not synced yet. Please sign out and sign in again, then try again.');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');
      await createFreelancerPublicPortfolio({
        JobTitle: createForm.jobTitle,
        CoverImage: createForm.coverImage,
      });
      setShowCreateModal(false);
      setCreateForm({ jobTitle: '', coverImage: null });
      setCoverImagePreviewUrl('');

      const refreshed = await getFreelancerPublicPortfolios({
        Search: searchQuery.trim() || undefined,
        Category: selectedJobTitle !== 'all' ? selectedJobTitle : undefined,
        Skill: selectedSkill.trim() || undefined,
        SortBy: sortBy,
        PageNumber: pageNumber,
        PageSize: PORTFOLIO_PAGE_SIZE,
      });

      setPortfolios(refreshed.items);
      setTotalCount(refreshed.totalCount);
      setTotalPages(refreshed.totalPages || 0);
    } catch (createPortfolioError) {
      setCreateError(
        createPortfolioError instanceof Error
          ? createPortfolioError.message
          : 'We could not create your portfolio right now. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedJobTitle('all');
    setSelectedSkill('');
    setPageNumber(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPageNumber(1);
  };

  const handleJobTitleChange = (value: string) => {
    setSelectedJobTitle(value);
    setPageNumber(1);
  };

  const handleSkillChange = (value: string) => {
    setSelectedSkill(value);
    setPageNumber(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'HighestRating' | 'MostCompletedProjects');
    setPageNumber(1);
  };

  const handlePreviousPage = () => {
    if (hasPrev) {
      setPageNumber((current) => Math.max(current - 1, 1));
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setPageNumber((current) => Math.min(current + 1, totalPages));
    }
  };

  const renderPortfolioCard = (portfolio: PublicFreelancerPortfolioItem) => (
    <div
      key={portfolio.portfolioId}
      className={`rounded-xl border overflow-hidden ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}
    >
      <div className="relative h-44 sm:h-52 overflow-hidden">
        {portfolio.coverImageUrl ? (
          <img
            src={portfolio.coverImageUrl}
            alt={portfolio.jobTitleName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/50">
            <i className="ri-image-line text-4xl"></i>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {/* <span className="px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-xs font-medium">
            {portfolio.jobTitleName || 'Uncategorized'}
          </span> */}
          <span className="px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-amber-400 text-xs font-medium">
            <i className="ri-star-fill mr-1"></i>
            {portfolio.averageRating.toFixed(1)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/freelancer/profile/${portfolio.freelancerProfileId}`)}
          className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 bg-white/10 flex-shrink-0">
              {portfolio.freelancerImageUrl ? (
                <img
                  src={portfolio.freelancerImageUrl}
                  alt={portfolio.freelancerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70">
                  <i className="ri-user-line"></i>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white text-lg font-semibold truncate">{portfolio.freelancerName || 'Freelancer'}</p>
              <p className="text-white/70 text-xs truncate">{portfolio.freelancerTitle || 'Freelancer profile'}</p>
            </div>
          </div>
          {/* <span className="text-white/80 text-xs whitespace-nowrap">View Work</span> */}
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-white text-lg font-bold truncate">{portfolio.jobTitleName || 'Freelancer'}</p>

        <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'} text-sm sm:text-base mb-4 leading-relaxed`}>
          {portfolio.bio || 'No bio provided.'}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {portfolio.skills.map((skill) => (
            <span
              key={skill}
              className={`px-2 py-0.5 rounded text-xs ${isLightMode ? 'bg-gray-100 border border-gray-200 text-gray-600' : 'bg-white/5 border border-white/10 text-gray-300'}`}
            >
              {skill}
            </span>
          ))}
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t ${isLightMode ? 'border-gray-100' : 'border-white/10'}`}>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1 text-emerald-400">
              <i className="ri-checkbox-circle-line"></i>
              {portfolio.totalCompletedProjects} projects
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <i className="ri-eye-line"></i>
              {portfolio.totalReviews} reviews
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/freelancer/profile/${portfolio.freelancerProfileId}`)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
          >
            View Work
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1f37]">
      <Navbar />

      <RoleGateModal
        isOpen={showRoleGateModal}
        onClose={() => setShowRoleGateModal(false)}
        requiredRole="freelancer"
        roleLabel="Freelancer"
        actionLabel={t('portfolios.createPortfolio')}
        onRoleAdded={() => navigate('/profile/freelancer')}
      />

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className={`relative w-full max-w-lg rounded-2xl border p-6 sm:p-8 ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLightMode ? 'bg-gray-100' : 'bg-white/10'}`}>
                <i className="ri-gallery-add-line text-xl text-emerald-400"></i>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>Create Portfolio</h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Add a new public portfolio entry</p>
              </div>
            </div>

            {createError && (
              <div className={`mb-4 p-3 rounded-lg text-sm border ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>Job Title</label>
                <CustomSelect
                  value={createForm.jobTitle}
                  onChange={(value) => setCreateForm((prev) => ({ ...prev, jobTitle: value }))}
                  options={jobTitleOptions.length > 0 ? jobTitleOptions : DEFAULT_JOB_TITLE_OPTIONS}
                  placeholder="Select job title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>Cover Image</label>
                <div className={`rounded-2xl border p-4 transition-colors ${isLightMode ? 'border-dashed border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50' : 'border-dashed border-white/10 bg-white/5 hover:border-emerald-400/60 hover:bg-white/10'}`}>
                  <input
                    id="portfolio-cover-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setCreateForm((prev) => ({ ...prev, coverImage: file }));
                    }}
                    className="sr-only"
                  />

                  <label
                    htmlFor="portfolio-cover-image"
                    className={`flex cursor-pointer flex-col gap-4 rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${isLightMode ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-[#1e2442]'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                        <i className="ri-upload-cloud-2-line text-2xl"></i>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                          {createForm.coverImage ? 'Image selected' : 'Upload Cover Image'}
                        </div>
                        <p className={`mt-1 text-xs leading-5 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Drag and drop is not required. Click to choose a JPG, PNG, or WebP file.
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                          <i className="ri-image-add-line"></i>
                          {createForm.coverImage ? 'Ready to upload' : 'No file selected'}
                        </div>
                      </div>

                      <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/15">
                        Choose Image
                      </span>
                    </div>

                    {createForm.coverImage && (
                      <div className={`flex items-center gap-3 rounded-xl border p-3 ${isLightMode ? 'border-gray-200 bg-white' : 'border-white/10 bg-black/10'}`}>
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/10">
                          {coverImagePreviewUrl ? (
                            <img src={coverImagePreviewUrl} alt="Selected cover preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/60">
                              <i className="ri-image-line"></i>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                            {createForm.coverImage.name}
                          </p>
                          <p className={`mt-1 text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Selected file preview
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                          <i className="ri-check-line"></i>
                          Selected
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCreate}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Create Portfolio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{t('portfolios.title')}</h1>
            <p className="text-sm sm:text-base text-gray-400">{t('portfolios.subtitle')}</p>
          </div>

          <div className="mb-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl border border-emerald-500/30 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0">
                  <i className="ri-gallery-line text-2xl sm:text-3xl text-emerald-400"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{t('portfolios.showcaseWork')}</h2>
                  <p className="text-gray-300 text-xs sm:text-sm">{t('portfolios.showcaseSubtitle')}</p>
                </div>
              </div>
              <button
                onClick={handleCreatePortfolio}
                className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="ri-add-line"></i>
                {t('portfolios.createPortfolio')}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-72 flex-shrink-0`}>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-5 lg:sticky lg:top-28">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <i className="ri-filter-3-line"></i>
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">{activeFiltersCount}</span>
                    )}
                  </h2>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer whitespace-nowrap">
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Job Title</label>
                    <CustomSelect
                      value={selectedJobTitle}
                      onChange={handleJobTitleChange}
                      options={[{ value: 'all', label: 'All Job Titles' }, ...jobTitleOptions]}
                      placeholder="All Job Titles"
                    />
                  </div>

                  <div>
                    
                    {skillOptions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {skillOptions.slice(0, 20).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillChange(skill)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                              selectedSkill.toLowerCase() === skill.toLowerCase()
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-4 mb-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-filter-3-line"></i>
                    {showFilters ? 'Hide filters' : 'Show filters'}
                    {activeFiltersCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">{activeFiltersCount}</span>
                    )}
                  </button>

                  <div className="flex-1 relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base"></i>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => handleSearchChange(event.target.value)}
                      placeholder={t('portfolios.searchPlaceholder')}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-gray-400 text-sm whitespace-nowrap">Sort by</span>
                    <div className="relative flex-1 min-w-[150px]">
                      <CustomSelect
                        value={sortBy}
                        onChange={handleSortChange}
                        options={SORT_OPTIONS}
                        placeholder="Sort portfolios"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-xs sm:text-sm">
                  Showing <span className="text-white font-semibold">{totalCount}</span> portfolios
                </p>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="hidden lg:flex items-center gap-2 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap"
                >
                  <i className={`ri-layout-${showFilters ? 'right' : 'left'}-2-line`}></i>
                  {showFilters ? 'Hide filters' : 'Show filters'}
                </button>
              </div>

              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-pulse">
                      <div className="h-48 bg-white/10"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                        <div className="h-3 bg-white/10 rounded w-full"></div>
                        <div className="h-3 bg-white/10 rounded w-5/6"></div>
                        <div className="h-8 bg-white/10 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300">
                  {error}
                </div>
              )}

              {!loading && !error && portfolios.length === 0 && (
                <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                  <i className="ri-folder-line text-5xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400">No portfolios found.</p>
                </div>
              )}

              {!loading && !error && portfolios.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {portfolios.map((portfolio) => renderPortfolioCard(portfolio))}
                </div>
              )}

              {!loading && totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-gray-400">
                    Page <span className="text-white font-semibold">{pageNumber}</span> of{' '}
                    <span className="text-white font-semibold">{totalPages}</span>
                  </p>

                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={!hasPrev}
                      className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <i className="ri-arrow-left-s-line text-base"></i>
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {getVisiblePageNumbers(pageNumber, totalPages).map((item, index) =>
                        item === 'ellipsis' ? (
                          <span key={`ellipsis-${index}`} className="px-1 text-gray-500 text-sm select-none">
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setPageNumber(item)}
                            className={`min-w-9 h-9 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors border ${
                              item === pageNumber
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={!hasNext}
                      className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <i className="ri-arrow-right-s-line text-base"></i>
                    </button>
                  </div>
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
