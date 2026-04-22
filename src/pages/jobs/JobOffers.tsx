import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import RoleGateModal from '../../components/feature/RoleGateModal';
import ReportModal from '../../components/feature/ReportModal';
import CustomSelect from '../../components/base/CustomSelect';
import CompanySelect from '../../components/base/CompanySelect';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { createJobPost, getJobPostDetails, getJobPosts, getJobSkills } from '../../services/job-post.service';
import type { JobPostItem, JobSkill } from '../../services/job-post.service';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  employerId: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  salary: string;
  experience: string;
  skills: string[];
  postedDate: string;
  description: string;
  applicants: number;
  featured: boolean;
}

const COMPANY_ASSET_BASE_URL = 'https://nextcoder.runasp.net';
const DEFAULT_COMPANY_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="Company placeholder logo"><rect width="96" height="96" rx="14" fill="#E5E7EB"/><path d="M25 68h46V36H25v32Zm8-8v-6h6v6h-6Zm12 0v-6h6v6h-6Zm12 0v-6h6v6h-6Zm-24-14v-6h6v6h-6Zm12 0v-6h6v6h-6Zm12 0v-6h6v6h-6Z" fill="#9CA3AF"/><rect x="40" y="24" width="16" height="8" rx="2" fill="#9CA3AF"/></svg>';
const DEFAULT_COMPANY_LOGO = `data:image/svg+xml,${encodeURIComponent(DEFAULT_COMPANY_LOGO_SVG)}`;

const buildCompanyLogoUrl = (logoUrl: string | null | undefined): string => {
  const normalizedLogoPath = String(logoUrl ?? '').trim();
  if (!normalizedLogoPath) {
    return DEFAULT_COMPANY_LOGO;
  }

  if (/^https?:\/\//i.test(normalizedLogoPath)) {
    return normalizedLogoPath;
  }

  const slashNormalizedPath = normalizedLogoPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!slashNormalizedPath) {
    return DEFAULT_COMPANY_LOGO;
  }

  return `${COMPANY_ASSET_BASE_URL}/${encodeURI(slashNormalizedPath)}`;
};

const JobOffers = () => {
  const { user, isAuthenticated } = useAuth();
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const [showRoleGateModal, setShowRoleGateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<{ name: string; logo: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);

  // Post Job form state
  const [jobFormSkills, setJobFormSkills] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [jobSalaryMin, setJobSalaryMin] = useState('');
  const [jobSalaryMax, setJobSalaryMax] = useState('');
  const [jobExperience, setJobExperience] = useState('Entry');
  const [jobDescription, setJobDescription] = useState('');
  const [jobSubmitted, setJobSubmitted] = useState(false);
  const [jobSubmitError, setJobSubmitError] = useState('');
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [apiSkills, setApiSkills] = useState<JobSkill[]>([]);
  const [skillsLoadError, setSkillsLoadError] = useState('');
  const [jobsFromApi, setJobsFromApi] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [jobsRefreshKey, setJobsRefreshKey] = useState(0);

  const toggleJobFormSkill = (skill: string) => {
    setJobFormSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobSubmitError('');
    setIsPostingJob(true);

    try {
      const mappedSkillIds = jobFormSkills
        .map((selected) => {
          const matched = apiSkills.find(
            (skill) => skill.name.trim().toLowerCase() === selected.trim().toLowerCase()
          );
          return matched?.id;
        })
        .filter((id): id is number => typeof id === 'number');

      const payload = {
        title: jobTitle.trim(),
        location: jobLocation.trim(),
        companyName: jobCompany.trim(),
        jobType,
        experienceLevel: jobExperience,
        minSalary: jobSalaryMin ? Number(jobSalaryMin) : undefined,
        maxSalary: jobSalaryMax ? Number(jobSalaryMax) : undefined,
        description: jobDescription.trim(),
        skillIds: mappedSkillIds,
      };

      await createJobPost(payload);
      setJobsRefreshKey((prev) => prev + 1);

      setJobSubmitted(true);
      setTimeout(() => {
        setShowPostJobModal(false);
        setJobSubmitted(false);
        setJobTitle('');
        setJobCompany('');
        setJobLocation('');
        setJobSalaryMin('');
        setJobSalaryMax('');
        setJobDescription('');
        setJobFormSkills([]);
        setJobType('Full-time');
        setJobExperience('Entry');
      }, 1800);
    } catch (err: unknown) {
      setJobSubmitError(err instanceof Error ? err.message : 'Failed to post job. Please try again.');
    } finally {
      setIsPostingJob(false);
    }
  };

  const toRelativeDate = (isoDate?: string): string => {
    if (!isoDate) return 'Recently';
    const created = new Date(isoDate).getTime();
    if (Number.isNaN(created)) return 'Recently';
    const diffMs = Date.now() - created;
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.max(0, Math.floor(diffMs / dayMs));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const mapApiJobToUi = (item: JobPostItem): Job => {
    const min = typeof item.minSalary === 'number' ? item.minSalary : 0;
    const max = typeof item.maxSalary === 'number' ? item.maxSalary : 0;

    return {
      id: String(item.id),
      title: item.title,
      company: item.companyName,
      companyLogo: buildCompanyLogoUrl(item.companyLogoUrl),
      employerId: item.employerId ?? '0',
      location: item.location,
      type: (['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'].includes(item.jobType)
        ? item.jobType
        : 'Full-time') as Job['type'],
      salary: min || max ? `$${min.toLocaleString()} - $${max.toLocaleString()}` : 'Not specified',
      experience: item.experienceLevel || 'Not specified',
      skills: item.skills,
      postedDate: toRelativeDate(item.createdAt),
      description: item.description,
      applicants: item.jobSeekersCount ?? 0,
      featured: false,
    };
  };

  const mapExperienceFilterToApi = (value: string): string | undefined => {
    if (value === '0-2') return 'Entry (0-2 yrs)';
    if (value === '3-5') return 'Mid (3-5 yrs)';
    if (value === '6+') return 'Senior (6+ yrs)';
    return undefined;
  };

  const mapSalaryFilterToBounds = (value: string): { min?: number; max?: number } => {
    if (value === 'under80k') return { max: 80000 };
    if (value === '80k-120k') return { min: 80000, max: 120000 };
    if (value === 'over120k') return { min: 120000 };
    return {};
  };

  const mapSortToApi = (value: string): string | undefined => {
    if (value === 'newest') return 'Newest';
    if (value === 'salary') return 'Salary';
    if (value === 'company') return 'CompanyName';
    if (value === 'applicants') return 'Applicants';
    return undefined;
  };

  useEffect(() => {
    const loadSkills = async () => {
      if (!isAuthenticated) {
        setApiSkills([]);
        setSkillsLoadError('');
        return;
      }

      try {
        const skills = await getJobSkills();
        setApiSkills(skills);
        setSkillsLoadError('');
      } catch (err: unknown) {
        setApiSkills([]);
        setSkillsLoadError(err instanceof Error ? err.message : 'We could not load skills right now. Please try again.');
      }
    };

    loadSkills();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setJobsFromApi([]);
      setJobsError('Please sign in to view available jobs.');
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setJobsLoading(true);
      setJobsError('');

      try {
        const mappedSkillIds = selectedSkills
          .map((selected) => {
            const matched = apiSkills.find(
              (skill) => skill.name.trim().toLowerCase() === selected.trim().toLowerCase()
            );
            return matched?.id;
          })
          .filter((id): id is number => typeof id === 'number');

        const salaryBounds = mapSalaryFilterToBounds(salaryFilter);
        const result = await getJobPosts({
          SearchTerm: searchQuery.trim() || undefined,
          JobType: typeFilter !== 'all' ? typeFilter : undefined,
          ExperienceLevel: mapExperienceFilterToApi(experienceFilter),
          MinSalary: salaryBounds.min,
          MaxSalary: salaryBounds.max,
          SkillIds: mappedSkillIds,
          SortBy: mapSortToApi(sortBy),
        });

        const jobsWithRealCounts = await Promise.all(
          result.items.map(async (item) => {
            try {
              const details = await getJobPostDetails(item.id);
              const realCount = Number(details.counts?.all ?? details.applicants?.length ?? item.jobSeekersCount ?? 0);

              return {
                ...item,
                jobSeekersCount: Number.isFinite(realCount) && realCount >= 0 ? realCount : (item.jobSeekersCount ?? 0),
              };
            } catch {
              return item;
            }
          })
        );

        setJobsFromApi(jobsWithRealCounts.map(mapApiJobToUi));
      } catch (err: unknown) {
        setJobsFromApi([]);
        setJobsError(err instanceof Error ? err.message : 'We could not load jobs right now. Please try again.');
      } finally {
        setJobsLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, searchQuery, typeFilter, experienceFilter, salaryFilter, selectedSkills, sortBy, apiSkills, jobsRefreshKey]);

  const allSkills = [
    'JavaScript', 'React', 'Python', 'Java', 'Node.js', 'TypeScript',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'Angular', 'Vue.js',
    'PHP', 'C++', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Flutter'
  ];

  const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Remote'];

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

  const jobs: Job[] = jobsFromApi;

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setExperienceFilter('all');
    setTypeFilter('all');
    setLocationFilter('all');
    setSalaryFilter('all');
  };

  const handlePostJob = () => {
    if (!isAuthenticated || !user?.roles.includes('employer')) {
      setShowRoleGateModal(true);
      return;
    }
    setJobSubmitError('');
    setShowPostJobModal(true);
  };

  const handleOpenReport = (companyName: string, companyLogo: string) => {
    setSelectedEmployer({ name: companyName, logo: companyLogo });
    setShowReportModal(true);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.some(skill => job.skills.includes(skill));
    const matchesExperience = experienceFilter === 'all' ||
                             (experienceFilter === '0-2' && (job.experience.includes('0') || job.experience.includes('1') || job.experience.includes('2'))) ||
                             (experienceFilter === '3-5' && (job.experience.includes('3') || job.experience.includes('4') || job.experience.includes('5'))) ||
                             (experienceFilter === '6+' && (job.experience.includes('5+') || job.experience.includes('6') || job.experience.includes('7') || job.experience.includes('8')));
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
    const matchesSalary = salaryFilter === 'all' ||
                         (salaryFilter === 'under80k' && (job.salary.includes('60k') || job.salary.includes('35/hr'))) ||
                         (salaryFilter === '80k-120k' && (job.salary.includes('80k') || job.salary.includes('90k') || job.salary.includes('100k') || job.salary.includes('110k'))) ||
                         (salaryFilter === 'over120k' && (job.salary.includes('120k') || job.salary.includes('130k') || job.salary.includes('150k') || job.salary.includes('180k')));
    return matchesSearch && matchesSkills && matchesExperience && matchesType && matchesLocation && matchesSalary;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest') {
      const daysA = a.postedDate.includes('day') ? parseInt(a.postedDate) : 7;
      const daysB = b.postedDate.includes('day') ? parseInt(b.postedDate) : 7;
      return daysA - daysB;
    }
    if (sortBy === 'applicants') return b.applicants - a.applicants;
    if (sortBy === 'salary') {
      return parseInt(b.salary.replace(/[^0-9]/g, '')) - parseInt(a.salary.replace(/[^0-9]/g, ''));
    }
    if (sortBy === 'company') return a.company.localeCompare(b.company);
    return 0;
  });

  const featuredJobs = sortedJobs.filter(job => job.featured);
  const regularJobs = sortedJobs.filter(job => !job.featured);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'Part-time': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'Contract': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      case 'Remote': return 'text-teal-400 bg-teal-400/10 border-teal-400/30';
      case 'Internship': return 'text-pink-400 bg-pink-400/10 border-pink-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const activeFiltersCount = [
    selectedSkills.length > 0,
    experienceFilter !== 'all',
    typeFilter !== 'all',
    locationFilter !== 'all',
    salaryFilter !== 'all'
  ].filter(Boolean).length;

  const inputCls = isLightMode
    ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'
    : 'bg-white/5 border-white/10 text-white placeholder-gray-500';

  const labelCls = isLightMode ? 'text-gray-700' : 'text-white';
  const subTextCls = isLightMode ? 'text-gray-500' : 'text-gray-400';
  const headingCls = isLightMode ? 'text-gray-900' : 'text-white';
  const cardCls = isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';
  const skillBtnBase = isLightMode
    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white';

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-50' : 'bg-[#1a1f37]'}`}>
      <Navbar />

      {/* Role Gate Modal */}
      <RoleGateModal
        isOpen={showRoleGateModal}
        onClose={() => setShowRoleGateModal(false)}
        requiredRole="employer"
        roleLabel="Employer"
        actionLabel={t('jobs.postJob')}
        onRoleAdded={() => setShowPostJobModal(true)}
      />

      {/* Report Modal */}
      {selectedEmployer && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => { setShowReportModal(false); setSelectedEmployer(null); }}
          targetName={selectedEmployer.name}
          targetAvatar={selectedEmployer.logo}
          reporterRole="freelancer"
        />
      )}

      {/* ── Post Job Modal ── */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPostJobModal(false)}></div>
          <div className={`relative rounded-2xl border p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
            <button onClick={() => setShowPostJobModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
              <i className="ri-close-line text-xl"></i>
            </button>

            {jobSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-500/20 mx-auto mb-4">
                  <i className="ri-checkbox-circle-line text-3xl text-teal-400"></i>
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${headingCls}`}>{t('jobs.jobPosted')}</h3>
                <p className={`text-sm ${subTextCls}`}>{t('jobs.jobPostedSubtitle')}</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-500/20 mx-auto mb-4">
                    <i className="ri-briefcase-line text-3xl text-teal-400"></i>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${headingCls}`}>{t('jobs.postNewJob')}</h3>
                  <p className={`text-sm ${subTextCls}`}>{t('jobs.fillDetails')}</p>
                </div>

                <form onSubmit={handlePostJobSubmit} className="space-y-5">
                  {jobSubmitError && (
                    <div className={`p-3 rounded-lg text-sm border ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                      {jobSubmitError}
                    </div>
                  )}

                  {skillsLoadError && (
                    <div className={`p-3 rounded-lg text-sm border ${isLightMode ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                      {skillsLoadError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-medium mb-2 text-sm ${labelCls}`}>{t('jobs.jobTitle')} *</label>
                      <input type="text" required value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder={t('jobs.jobTitlePlaceholder')} className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${inputCls}`} />
                    </div>
                    <div>
                      <label className={`block font-medium mb-2 text-sm ${labelCls}`}>{t('jobs.companyName')} *</label>
                      <CompanySelect 
                        employerId={user?.employerId}
                        value={jobCompany}
                        onChange={(companyName) => setJobCompany(companyName)}
                        isLightMode={isLightMode}
                        placeholder={t('jobs.companyPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-medium mb-2 text-sm ${labelCls}`}>{t('jobs.jobLocation')} *</label>
                      <input type="text" required value={jobLocation} onChange={e => setJobLocation(e.target.value)} placeholder={t('jobs.locationPlaceholder')} className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${inputCls}`} />
                    </div>
                    <div>
                      <label className={`block font-medium mb-2 text-sm ${labelCls}`}>{t('jobs.jobTypeLabel')}</label>
                      <CustomSelect value={jobType} onChange={setJobType} options={[
                        { value: 'Full-time', label: 'Full-time' },
                        { value: 'Part-time', label: 'Part-time' },
                        { value: 'Contract', label: 'Contract' },
                        { value: 'Remote', label: 'Remote' },
                        { value: 'Internship', label: 'Internship' },
                      ]} placeholder="Select type" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block font-medium mb-2 text-sm ${labelCls}`}>{t('jobs.minSalary')}</label>
                      <input type="number" value={jobSalaryMin} onChange={e => setJobSalaryMin(e.target.value)} placeholder="80" className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${inputCls}`} />
                    </div>
                    <div>
                      <label className={`block font-medium mb-2 text-sm ${labelCls}`}>{t('jobs.maxSalary')}</label>
                      <input type="number" value={jobSalaryMax} onChange={e => setJobSalaryMax(e.target.value)} placeholder="120" className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${inputCls}`} />
                    </div>
                    <div>
                      <label className={`block font-medium mb-2 text-sm ${labelCls}`}>{t('jobs.experienceLabel')}</label>
                      <CustomSelect value={jobExperience} onChange={setJobExperience} options={[
                        { value: 'Entry', label: t('jobs.entry') },
                        { value: 'Mid', label: t('jobs.mid') },
                        { value: 'Senior', label: t('jobs.senior') },
                      ]} placeholder="Select level" />
                    </div>
                  </div>

                  <div>
                    <label className={`block font-medium mb-2 text-sm ${labelCls}`}>{t('jobs.jobDescription')} *</label>
                    <textarea required rows={4} value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder={t('jobs.jobDescPlaceholder')} maxLength={500} className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 resize-none ${inputCls}`} />
                    <p className={`text-xs mt-1 text-right ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>{jobDescription.length}/500</p>
                  </div>

                  <div>
                    <label className={`block font-medium mb-2 text-sm ${labelCls}`}>
                      {t('jobs.requiredSkills')}
                      {jobFormSkills.length > 0 && <span className="text-teal-500">({jobFormSkills.length} {t('jobs.selected')})</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allSkills.map(skill => (
                        <button key={skill} type="button" onClick={() => toggleJobFormSkill(skill)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${jobFormSkills.includes(skill) ? 'bg-teal-500 text-white' : skillBtnBase}`}>
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowPostJobModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" disabled={isPostingJob} className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                      {isPostingJob ? (
                        <><i className="ri-loader-4-line mr-2 animate-spin"></i>Posting...</>
                      ) : (
                        <><i className="ri-send-plane-line mr-2"></i>{t('jobs.postJob')}</>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${headingCls}`}>{t('jobs.title')}</h1>
            <p className={`text-sm sm:text-base ${subTextCls}`}>{t('jobs.subtitle')}</p>
          </div>

          {/* Post Job Banner */}
          <div className={`mb-8 backdrop-blur-sm rounded-xl border p-4 sm:p-6 ${isLightMode ? 'bg-teal-50 border-teal-200' : 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-teal-500/30'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl border flex-shrink-0 ${isLightMode ? 'bg-teal-100 border-teal-200' : 'bg-teal-500/20 border-teal-500/30'}`}>
                  <i className="ri-briefcase-line text-2xl sm:text-3xl text-teal-500"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-lg sm:text-xl font-bold mb-1 ${headingCls}`}>{t('jobs.lookingToHire')}</h2>
                  <p className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{t('jobs.hiringSubtitle')}</p>
                </div>
              </div>
              <button onClick={handlePostJob} className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
                <i className="ri-add-line"></i>{t('jobs.postJob')}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-72 flex-shrink-0`}>
              <div className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 lg:sticky lg:top-28 overflow-y-auto max-h-[calc(100vh-8rem)] thin-scrollbar ${cardCls}`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className={`font-semibold flex items-center gap-2 ${headingCls}`}>
                    <i className="ri-filter-3-line"></i>
                    {t('jobs.filters')}
                    {activeFiltersCount > 0 && <span className="px-1.5 py-0.5 bg-teal-500 text-white text-xs rounded-full">{activeFiltersCount}</span>}
                  </h2>
                  {activeFiltersCount > 0 && <button onClick={clearAllFilters} className="text-xs text-teal-500 hover:text-teal-400 cursor-pointer whitespace-nowrap">{t('common.clearAll')}</button>}
                </div>

                <div className="mb-5">
                  <label className={`block text-sm font-medium mb-2 ${labelCls}`}>{t('jobs.location')}</label>
                  <CustomSelect value={locationFilter} onChange={setLocationFilter}
                    options={[{ value: 'all', label: t('jobs.allLocations') }, ...locations.map(loc => ({ value: loc, label: loc }))]}
                    placeholder={t('jobs.allLocations')} />
                </div>

                <div className="mb-5">
                  <label className={`block text-sm font-medium mb-2 ${labelCls}`}>{t('jobs.jobType')}</label>
                  <div className="space-y-2">
                    {['all', ...jobTypes].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="jobType" checked={typeFilter === type} onChange={() => setTypeFilter(type)} className="w-4 h-4 accent-teal-500" />
                        <span className={`text-sm transition-colors ${isLightMode ? 'text-gray-600 group-hover:text-gray-900' : 'text-gray-300 group-hover:text-white'}`}>
                          {type === 'all' ? t('jobs.allTypes') : type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className={`block text-sm font-medium mb-2 ${labelCls}`}>{t('jobs.experienceLevel')}</label>
                  <CustomSelect value={experienceFilter} onChange={setExperienceFilter}
                    options={[
                      { value: 'all', label: t('jobs.allLevels') },
                      { value: '0-2', label: t('jobs.entryLevel') },
                      { value: '3-5', label: t('jobs.midLevel') },
                      { value: '6+', label: t('jobs.seniorLevel') },
                    ]} placeholder={t('jobs.allLevels')} />
                </div>

                <div className="mb-5">
                  <label className={`block text-sm font-medium mb-2 ${labelCls}`}>{t('jobs.salaryRange')}</label>
                  <CustomSelect value={salaryFilter} onChange={setSalaryFilter}
                    options={[
                      { value: 'all', label: t('jobs.anySalary') },
                      { value: 'under80k', label: t('jobs.under80k') },
                      { value: '80k-120k', label: t('jobs.range80to120k') },
                      { value: 'over120k', label: t('jobs.over120k') },
                    ]} placeholder={t('jobs.anySalary')} />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
                    {t('jobs.skills')} {selectedSkills.length > 0 && <span className="text-teal-500">({selectedSkills.length})</span>}
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {allSkills.map(skill => (
                      <button key={skill} onClick={() => toggleSkill(skill)} className={`px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${selectedSkills.includes(skill) ? 'bg-teal-500 text-white' : skillBtnBase}`}>
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className={`backdrop-blur-sm rounded-xl border p-3 sm:p-4 mb-6 ${cardCls}`}>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <button onClick={() => setShowFilters(!showFilters)} className={`lg:hidden flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-white'}`}>
                    <i className="ri-filter-3-line"></i>
                    {showFilters ? t('jobs.hideFilters') : t('jobs.showFilters')}
                    {activeFiltersCount > 0 && <span className="px-1.5 py-0.5 bg-teal-500 text-white text-xs rounded-full">{activeFiltersCount}</span>}
                  </button>

                  <div className="flex-1 relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base"></i>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('jobs.searchPlaceholder')} className={`w-full border rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 focus:outline-none focus:border-teal-500 text-sm ${inputCls}`} />
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`text-xs sm:text-sm whitespace-nowrap ${subTextCls}`}>{t('jobs.sortBy')}</span>
                    <div className="relative flex-1 sm:flex-initial sm:min-w-[140px]">
                      <CustomSelect value={sortBy} onChange={setSortBy} options={[
                        { value: 'newest', label: t('jobs.newest') },
                        { value: 'salary', label: t('jobs.salary') },
                        { value: 'applicants', label: t('jobs.mostApplied') },
                        { value: 'company', label: t('jobs.company') },
                      ]} placeholder="Sort by" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className={`text-sm ${subTextCls}`}>
                  {t('jobs.showing')} <span className={`font-semibold ${headingCls}`}>{sortedJobs.length}</span> {t('jobs.jobOffers')}
                </p>
                <button onClick={() => setShowFilters(!showFilters)} className={`hidden lg:flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
                  <i className={`ri-layout-${showFilters ? 'right' : 'left'}-2-line`}></i>
                  {showFilters ? t('jobs.hideFiltersLink') : t('jobs.showFiltersLink')}
                </button>
              </div>

              {jobsLoading && (
                <div className={`mb-4 p-3 rounded-lg text-sm border ${isLightMode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'}`}>
                  Loading jobs from database...
                </div>
              )}

              {jobsError && (
                <div className={`mb-4 p-3 rounded-lg text-sm border ${isLightMode ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                  {jobsError}
                </div>
              )}

              {/* Featured Jobs */}
              {featuredJobs.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 ${headingCls}`}>
                    <i className="ri-star-fill text-amber-400"></i>{t('jobs.featuredJobs')}
                  </h2>
                  <div className="space-y-4">
                    {featuredJobs.map(job => (
                      <div key={job.id} className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 transition-all group ${isLightMode ? 'bg-amber-50 border-amber-200 hover:border-amber-400' : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/50'}`}>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                          <div className="flex-shrink-0 mx-auto sm:mx-0 relative">
                            <Link to={`/user/${job.employerId}`} className={`block w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer ${isLightMode ? 'bg-gray-100' : 'bg-white/10'}`}>
                              <img
                                src={job.companyLogo}
                                alt={`${job.company} logo`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                onError={(event) => {
                                  event.currentTarget.onerror = null;
                                  event.currentTarget.src = DEFAULT_COMPANY_LOGO;
                                }}
                              />
                            </Link>
                            <button onClick={() => handleOpenReport(job.company, job.companyLogo)} className={`absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center border rounded-full text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1a1f37] border-white/10'}`} title={t('common.report')}>
                              <i className="ri-flag-line text-xs"></i>
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                              <div className="text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-1">
                                  <h3 className={`text-lg sm:text-xl font-bold group-hover:text-amber-500 transition-colors ${headingCls}`}>{job.title}</h3>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${isLightMode ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-400'}`}>{t('common.featured')}</span>
                                </div>
                                <Link to={`/user/${job.employerId}`} className="text-teal-500 hover:text-teal-400 font-medium text-sm hover:underline transition-colors cursor-pointer">{job.company}</Link>
                              </div>
                              <div className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium border ${getTypeColor(job.type)} mx-auto sm:mx-0`}>{job.type}</div>
                            </div>
                            <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm mb-3 ${subTextCls}`}>
                              <span className="flex items-center gap-1"><i className="ri-map-pin-line"></i>{job.location}</span>
                              <span className="flex items-center gap-1"><i className="ri-money-dollar-circle-line"></i>{job.salary}</span>
                              <span className="flex items-center gap-1"><i className="ri-briefcase-line"></i>{job.experience}</span>
                              <span className="flex items-center gap-1"><i className="ri-time-line"></i>{job.postedDate}</span>
                              <span className="flex items-center gap-1"><i className="ri-user-line"></i>{job.applicants} {t('jobs.applicants')}</span>
                            </div>
                            <p className={`text-sm mb-3 line-clamp-2 text-center sm:text-left ${subTextCls}`}>{job.description}</p>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 flex-1">
                                {job.skills.slice(0, 5).map(skill => (
                                  <span key={skill} className={`px-2 py-0.5 rounded text-xs ${selectedSkills.includes(skill) ? 'bg-teal-500/30 border border-teal-500/50 text-teal-600' : isLightMode ? 'bg-gray-100 border border-gray-200 text-gray-500' : 'bg-white/5 border border-white/10 text-gray-400'}`}>{skill}</span>
                                ))}
                              </div>
                              <Link to={`/job/${job.id}`} className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 text-center">
                                {t('common.applyNow')}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Jobs */}
              <div className="space-y-4">
                {regularJobs.map(job => (
                  <div key={job.id} className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 transition-all group ${isLightMode ? 'bg-white border-gray-200 hover:border-teal-400' : 'bg-white/5 border-white/10 hover:border-teal-500/50'}`}>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                      <div className="flex-shrink-0 mx-auto sm:mx-0 relative">
                        <Link to={`/user/${job.employerId}`} className={`block w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden hover:ring-2 hover:ring-teal-500 transition-all cursor-pointer ${isLightMode ? 'bg-gray-100' : 'bg-white/10'}`}>
                          <img
                            src={job.companyLogo}
                            alt={`${job.company} logo`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = DEFAULT_COMPANY_LOGO;
                            }}
                          />
                        </Link>
                        <button onClick={() => handleOpenReport(job.company, job.companyLogo)} className={`absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center border rounded-full text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1a1f37] border-white/10'}`} title={t('common.report')}>
                          <i className="ri-flag-line text-xs"></i>
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="text-center sm:text-left">
                            <h3 className={`text-lg sm:text-xl font-bold group-hover:text-teal-500 transition-colors ${headingCls}`}>{job.title}</h3>
                            <Link to={`/user/${job.employerId}`} className="text-teal-500 hover:text-teal-400 font-medium text-sm hover:underline transition-colors cursor-pointer">{job.company}</Link>
                          </div>
                          <div className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium border ${getTypeColor(job.type)} mx-auto sm:mx-0`}>{job.type}</div>
                        </div>
                        <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm mb-3 ${subTextCls}`}>
                          <span className="flex items-center gap-1"><i className="ri-map-pin-line"></i>{job.location}</span>
                          <span className="flex items-center gap-1"><i className="ri-money-dollar-circle-line"></i>{job.salary}</span>
                          <span className="flex items-center gap-1"><i className="ri-briefcase-line"></i>{job.experience}</span>
                          <span className="flex items-center gap-1"><i className="ri-time-line"></i>{job.postedDate}</span>
                          <span className="flex items-center gap-1"><i className="ri-user-line"></i>{job.applicants} {t('jobs.applicants')}</span>
                        </div>
                        <p className={`text-sm mb-3 line-clamp-2 text-center sm:text-left ${subTextCls}`}>{job.description}</p>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 flex-1">
                            {job.skills.slice(0, 5).map(skill => (
                              <span key={skill} className={`px-2 py-0.5 rounded text-xs ${selectedSkills.includes(skill) ? 'bg-teal-500/30 border border-teal-500/50 text-teal-600' : isLightMode ? 'bg-gray-100 border border-gray-200 text-gray-500' : 'bg-white/5 border border-white/10 text-gray-400'}`}>{skill}</span>
                            ))}
                          </div>
                          <Link to={`/job/${job.id}`} className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 text-center">
                            {t('common.applyNow')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sortedJobs.length === 0 && (
                <div className={`text-center py-12 sm:py-16 rounded-xl border ${cardCls}`}>
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full mx-auto mb-4 ${isLightMode ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <i className={`ri-briefcase-line text-2xl sm:text-3xl ${subTextCls}`}></i>
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold mb-2 ${headingCls}`}>{t('jobs.noJobsFound')}</h3>
                  <p className={`text-xs sm:text-sm mb-4 px-4 ${subTextCls}`}>{t('jobs.noJobsSubtitle')}</p>
                  <button onClick={clearAllFilters} className="px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap">
                    {t('jobs.clearFilters')}
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

export default JobOffers;
