import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../contexts/ThemeContext';
import { closeJobPost, deleteJobPost, getEmployerDashboard, getJobPostDetails, rejectJobApplicant, scheduleInterviewForApplicant, type EmployerDashboardJobPostItem } from '../../../services/job-post.service';

interface Applicant {
  id: string;
  name: string;
  avatar: string;
  title: string;
  experience: string;
  matchScore: number | null;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interview_scheduled';
  interviewDate?: string;
  interviewTime?: string;
  rejectionReason?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  status: 'active' | 'closed' | 'draft';
  applicantsCount: number;
  applicants: Applicant[];
  matchingCalculated: boolean;
}

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardStats, setDashboardStats] = useState<{ activeJobs: number; totalApplicants: number; closedJobs: number } | null>(null);

  const mapStatusToUi = (status?: string): Job['status'] => {
    const value = String(status ?? '').trim().toLowerCase();
    if (value === 'closed') return 'closed';
    if (value === 'draft') return 'draft';
    return 'active';
  };

  const formatSalary = (minSalary?: number, maxSalary?: number): string => {
    if (typeof minSalary === 'number' && typeof maxSalary === 'number') {
      return `$${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()}`;
    }
    if (typeof minSalary === 'number') {
      return `From $${minSalary.toLocaleString()}`;
    }
    if (typeof maxSalary === 'number') {
      return `Up to $${maxSalary.toLocaleString()}`;
    }
    return 'Not specified';
  };

  const mapApiJobToUi = (item: EmployerDashboardJobPostItem): Job => {
    const postedDate = item.postedDate ? String(item.postedDate).split('T')[0] : '-';

    return {
      id: String(item.id),
      title: item.title,
      company: item.companyName,
      companyId: '0',
      location: item.location,
      type: 'Not specified',
      salary: formatSalary(item.minSalary, item.maxSalary),
      postedDate,
      status: mapStatusToUi(item.status),
      applicantsCount: item.jobSeekersCount ?? 0,
      applicants: [],
      matchingCalculated: false,
    };
  };

  useEffect(() => {
    let isMounted = true;

    const loadEmployerDashboard = async () => {
      setIsLoadingDashboard(true);
      setDashboardError('');

      try {
        const data = await getEmployerDashboard();
        if (!isMounted) return;

        const mappedJobs = data.jobPostings.map(mapApiJobToUi);
        setJobs(mappedJobs);
        setDashboardStats({
          activeJobs: data.activeJobsCount,
          totalApplicants: data.totalJobSeekersCount,
          closedJobs: data.closedJobsCount,
        });
        setSelectedJob((prev) => (prev ? mappedJobs.find((j) => j.id === prev.id) ?? null : null));
      } catch (err: unknown) {
        if (!isMounted) return;

        setJobs([]);
        setDashboardStats(null);
        setDashboardError(err instanceof Error ? err.message : 'Failed to load employer dashboard data.');
      } finally {
        if (isMounted) {
          setIsLoadingDashboard(false);
        }
      }
    };

    loadEmployerDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [jobFilter, setJobFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'pending' | 'shortlisted' | 'interview_scheduled' | 'rejected'>('all');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [interviewDetails, setInterviewDetails] = useState({ date: '', time: '' });
  const [rejectionReason, setRejectionReason] = useState('');
  const [closingJobId, setClosingJobId] = useState<string | null>(null);
  const [closeJobError, setCloseJobError] = useState('');
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [deleteJobError, setDeleteJobError] = useState('');
  const [isLoadingJobDetails, setIsLoadingJobDetails] = useState(false);
  const [jobDetailsError, setJobDetailsError] = useState('');
  const [rejectApplicantError, setRejectApplicantError] = useState('');
  const [rejectingApplicantId, setRejectingApplicantId] = useState<string | null>(null);
  const [scheduleInterviewError, setScheduleInterviewError] = useState('');
  const [schedulingApplicantId, setSchedulingApplicantId] = useState<string | null>(null);

  const getTodayLocalDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayLocalDate();

  const stats = {
    activeJobs: dashboardStats?.activeJobs ?? jobs.filter(j => j.status === 'active').length,
    totalApplicants: dashboardStats?.totalApplicants ?? jobs.reduce((sum, j) => sum + j.applicantsCount, 0),
    interviewsScheduled: jobs.reduce((sum, j) => sum + j.applicants.filter(a => a.status === 'interview_scheduled').length, 0),
    closedJobs: dashboardStats?.closedJobs ?? jobs.filter(j => j.status === 'closed').length,
  };

  const filteredJobs = jobs.filter(job => {
    if (jobFilter === 'all') return true;
    return job.status === jobFilter;
  });

  const getFilteredApplicants = (applicants: Applicant[]) => {
    if (applicantFilter === 'all') return applicants;
    return applicants.filter(app => app.status === applicantFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'closed': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'draft': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getApplicantStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'reviewed': return 'text-violet-400 bg-violet-400/10 border-violet-400/30';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'interview_scheduled': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    }
  };

  const getApplicantStatusLabel = (status: string) => {
    switch (status) {
      case 'interview_scheduled': return 'Interview Scheduled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-500';
    if (score >= 80) return 'from-violet-500 to-pink-500';
    if (score >= 70) return 'from-amber-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getApplicantCounts = (applicants: Applicant[]) => ({
    all: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    interview_scheduled: applicants.filter(a => a.status === 'interview_scheduled').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  });

  const handleCalculateMatching = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const updatedApplicants = job.applicants.map(applicant => ({
        ...applicant,
        matchScore: applicant.matchScore ?? Math.floor(Math.random() * 30) + 70,
      }));
      return { ...job, matchingCalculated: true, applicants: updatedApplicants };
    }));

    if (selectedJob?.id === jobId) {
      const base = jobs.find(j => j.id === jobId);
      if (base) {
        const updatedApplicants = base.applicants.map(applicant => ({
          ...applicant,
          matchScore: applicant.matchScore ?? Math.floor(Math.random() * 30) + 70,
        }));
        setSelectedJob({ ...base, matchingCalculated: true, applicants: updatedApplicants });
      }
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplicant || !interviewDetails.date || !interviewDetails.time || !selectedJob) return;

    if (interviewDetails.date < todayDate) {
      setScheduleInterviewError('Interview date must be today or a future date.');
      return;
    }

    const interviewDateTime = new Date(`${interviewDetails.date}T${interviewDetails.time}`);
    if (Number.isNaN(interviewDateTime.getTime())) {
      setScheduleInterviewError('Invalid interview date or time.');
      return;
    }

    setScheduleInterviewError('');
    setSchedulingApplicantId(selectedApplicant.id);

    try {
      await scheduleInterviewForApplicant(Number(selectedApplicant.id), interviewDateTime.toISOString());

      const updatedApplicants = selectedJob.applicants.map((app) => (
        app.id === selectedApplicant.id
          ? { ...app, status: 'interview_scheduled' as const, interviewDate: interviewDetails.date, interviewTime: interviewDetails.time }
          : app
      ));

      setJobs((prev) => prev.map((j) => (j.id === selectedJob.id ? { ...j, applicants: updatedApplicants } : j)));
      setSelectedJob({ ...selectedJob, applicants: updatedApplicants });
      setShowInterviewModal(false);
      setSelectedApplicant(null);
      setInterviewDetails({ date: '', time: '' });
    } catch (err: unknown) {
      setScheduleInterviewError(err instanceof Error ? err.message : 'Failed to schedule interview.');
    } finally {
      setSchedulingApplicantId(null);
    }
  };

  const handleRejectApplicant = async () => {
    if (!selectedApplicant || !selectedJob) return;

    setRejectApplicantError('');
    setRejectingApplicantId(selectedApplicant.id);

    try {
      await rejectJobApplicant(Number(selectedApplicant.id), rejectionReason || undefined);

      const updatedApplicants = selectedJob.applicants.map((app) => (
        app.id === selectedApplicant.id
          ? { ...app, status: 'rejected' as const, rejectionReason: rejectionReason || 'Application not selected' }
          : app
      ));

      setJobs((prev) => prev.map((j) => (j.id === selectedJob.id ? { ...j, applicants: updatedApplicants } : j)));
      setSelectedJob({ ...selectedJob, applicants: updatedApplicants });
      setShowRejectModal(false);
      setSelectedApplicant(null);
      setRejectionReason('');
    } catch (err: unknown) {
      setRejectApplicantError(err instanceof Error ? err.message : 'Failed to reject applicant.');
    } finally {
      setRejectingApplicantId(null);
    }
  };

  const handleRemoveJob = (id: string) => {
    const targetJob = jobs.find((j) => j.id === id);
    if (!targetJob) {
      setJobToDelete(null);
      return;
    }

    setJobs(prev => prev.filter(j => j.id !== id));
    if (selectedJob?.id === id) setSelectedJob(null);
    setDashboardStats((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        activeJobs: targetJob.status === 'active' ? Math.max(0, prev.activeJobs - 1) : prev.activeJobs,
        closedJobs: targetJob.status === 'closed' ? Math.max(0, prev.closedJobs - 1) : prev.closedJobs,
        totalApplicants: Math.max(0, prev.totalApplicants - targetJob.applicantsCount),
      };
    });
    setJobToDelete(null);
  };

  const handleDeleteJob = async (jobId: string) => {
    setDeleteJobError('');
    setDeletingJobId(jobId);

    try {
      await deleteJobPost(Number(jobId));
      handleRemoveJob(jobId);
    } catch (err: unknown) {
      setDeleteJobError(err instanceof Error ? err.message : 'Failed to delete this job post.');
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleCloseJob = async (jobId: string) => {
    setCloseJobError('');
    setClosingJobId(jobId);

    try {
      await closeJobPost(Number(jobId));

      setJobs((prev) => prev.map((job) => (
        job.id === jobId ? { ...job, status: 'closed' } : job
      )));

      setSelectedJob((prev) => {
        if (!prev || prev.id !== jobId) return prev;
        return { ...prev, status: 'closed' };
      });

      setDashboardStats((prev) => {
        if (!prev) return prev;
        const nextActive = Math.max(0, prev.activeJobs - 1);
        const nextClosed = prev.closedJobs + 1;
        return {
          ...prev,
          activeJobs: nextActive,
          closedJobs: nextClosed,
        };
      });
    } catch (err: unknown) {
      setCloseJobError(err instanceof Error ? err.message : 'Failed to close this job post.');
    } finally {
      setClosingJobId(null);
    }
  };

  const openJobDetails = async (job: Job) => {
    setApplicantFilter('all');
    setSelectedJob(job);
    setJobDetailsError('');
    setIsLoadingJobDetails(true);

    try {
      const details = await getJobPostDetails(Number(job.id));

      const mappedApplicants: Applicant[] = details.applicants.map((applicant) => ({
        id: String(applicant.id),
        name: applicant.name,
        avatar: applicant.avatar,
        title: applicant.title,
        experience: applicant.experience,
        matchScore: applicant.matchScore,
        appliedDate: applicant.appliedDate,
        status: applicant.status,
        interviewDate: applicant.interviewDate,
        interviewTime: applicant.interviewTime,
        rejectionReason: applicant.rejectionReason,
      }));

      const nextApplicantsCount = details.counts.all;
      const hasMatching = mappedApplicants.some((applicant) => applicant.matchScore !== null);

      setJobs((prev) => prev.map((item) => (
        item.id === job.id
          ? {
            ...item,
            applicants: mappedApplicants,
            applicantsCount: nextApplicantsCount,
            matchingCalculated: hasMatching,
          }
          : item
      )));

      setSelectedJob((prev) => {
        if (!prev || prev.id !== job.id) return prev;
        return {
          ...prev,
          applicants: mappedApplicants,
          applicantsCount: nextApplicantsCount,
          matchingCalculated: hasMatching,
        };
      });

      setDashboardStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalApplicants: Math.max(0, prev.totalApplicants - job.applicantsCount + nextApplicantsCount),
        };
      });
    } catch (err: unknown) {
      setJobDetailsError(err instanceof Error ? err.message : 'Failed to load job details.');
    } finally {
      setIsLoadingJobDetails(false);
    }
  };

  const { isLightMode } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('employerDashboard.activeJobs')}</span>
            <div className="w-8 h-8 flex items-center justify-center"><i className="ri-briefcase-4-line text-violet-400 text-xl"></i></div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.activeJobs}</div>
          <div className="text-white/50 text-sm mt-1">{t('employerDashboard.currentlyHiring')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('employerDashboard.totalApplicants')}</span>
            <div className="w-8 h-8 flex items-center justify-center"><i className="ri-group-line text-emerald-400 text-xl"></i></div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalApplicants}</div>
          <div className="text-white/50 text-sm mt-1">{t('employerDashboard.acrossAllJobs')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('employerDashboard.interviewsScheduled')}</span>
            <div className="w-8 h-8 flex items-center justify-center"><i className="ri-calendar-check-line text-sky-400 text-xl"></i></div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.interviewsScheduled}</div>
          <div className="text-white/50 text-sm mt-1">{t('employerDashboard.scheduledLabel')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('employerDashboard.closedJobs')}</span>
            <div className="w-8 h-8 flex items-center justify-center"><i className="ri-close-circle-line text-red-400 text-xl"></i></div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.closedJobs}</div>
          <div className="text-white/50 text-sm mt-1">{t('employerDashboard.filledEnded')}</div>
        </div>
      </div>

      {/* Job Postings Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">{t('employerDashboard.myJobPostings')}</h2>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'closed'] as const).map(f => (
              <button key={f} onClick={() => setJobFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                jobFilter === f
                  ? f === 'active' ? 'bg-emerald-500 text-white' : f === 'closed' ? 'bg-red-500 text-white' : 'bg-violet-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>
                {t(`employerDashboard.${f === 'all' ? 'all' : f === 'active' ? 'active' : 'closed'}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {isLoadingDashboard && (
            <div className={`rounded-lg p-3 text-sm border ${isLightMode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'}`}>
              Loading employer dashboard from API...
            </div>
          )}

          {dashboardError && (
            <div className={`rounded-lg p-3 text-sm border ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
              {dashboardError}
            </div>
          )}

          {closeJobError && (
            <div className={`rounded-lg p-3 text-sm border ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
              {closeJobError}
            </div>
          )}

          {deleteJobError && (
            <div className={`rounded-lg p-3 text-sm border ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
              {deleteJobError}
            </div>
          )}

          {filteredJobs.map(job => (
            <div key={job.id} onClick={() => { void openJobDetails(job); }}
              className={`bg-white/5 rounded-xl p-4 sm:p-5 border transition-all cursor-pointer ${selectedJob?.id === job.id ? 'border-violet-500' : 'border-white/10 hover:border-violet-500/50'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(job.status)}`}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><i className="ri-building-line"></i>{job.company}</span>
                    <span className="flex items-center gap-1"><i className="ri-map-pin-line"></i>{job.location}</span>
                    <span className="flex items-center gap-1"><i className="ri-money-dollar-circle-line"></i>{job.salary}</span>
                    <span className="flex items-center gap-1"><i className="ri-calendar-line"></i>{job.postedDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{job.applicantsCount}</div>
                    <div className="text-xs text-gray-400">{t('employerDashboard.applicants')}</div>
                  </div>
                  {job.status === 'active' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleCloseJob(job.id);
                      }}
                      disabled={closingJobId === job.id}
                      className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm font-medium"
                      title={t('common.close')}
                    >
                      {closingJobId === job.id ? 'Closing...' : t('common.close')}
                    </button>
                  )}
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${job.matchingCalculated ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                    <i className={`text-xl ${job.matchingCalculated ? 'ri-check-line text-emerald-400' : 'ri-time-line text-amber-400'}`}></i>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setJobToDelete(job); }} className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer flex-shrink-0" title={t('employerDashboard.removeJob')}>
                    <i className="ri-delete-bin-line text-base"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
              <i className="ri-briefcase-line text-5xl text-gray-400 mb-4"></i>
              <p className="text-gray-400">{t('employerDashboard.noJobsFound')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedJob(null)}></div>
          <div className={`relative rounded-2xl border p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
            <button onClick={() => setSelectedJob(null)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{selectedJob.title}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(selectedJob.status)}`}>{selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}</span>
              </div>
              <div className={`flex flex-wrap items-center gap-4 text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <span className="flex items-center gap-1"><i className="ri-building-line"></i>{selectedJob.company}</span>
                <span className="flex items-center gap-1"><i className="ri-map-pin-line"></i>{selectedJob.location}</span>
                <span className="flex items-center gap-1"><i className="ri-briefcase-line"></i>{selectedJob.type}</span>
                <span className="flex items-center gap-1"><i className="ri-money-dollar-circle-line"></i>{selectedJob.salary}</span>
              </div>
            </div>

            {isLoadingJobDetails && (
              <div className={`rounded-lg p-3 text-sm border mb-4 ${isLightMode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'}`}>
                Loading job details from API...
              </div>
            )}

            {jobDetailsError && (
              <div className={`rounded-lg p-3 text-sm border mb-4 ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                {jobDetailsError}
              </div>
            )}

            {selectedJob.matchingCalculated ? (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h4 className={`text-lg font-semibold flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                    <i className="ri-bar-chart-grouped-line text-violet-400"></i>{t('employerDashboard.matchingScores')}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const counts = getApplicantCounts(selectedJob.applicants);
                      return (
                        <>
                          <button onClick={() => setApplicantFilter('all')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${applicantFilter === 'all' ? 'bg-violet-500 text-white' : isLightMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{t('employerDashboard.allCount')} ({counts.all})</button>
                          <button onClick={() => setApplicantFilter('pending')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${applicantFilter === 'pending' ? 'bg-amber-500 text-white' : isLightMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{t('employerDashboard.pending')} ({counts.pending})</button>
                          <button onClick={() => setApplicantFilter('shortlisted')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${applicantFilter === 'shortlisted' ? 'bg-emerald-500 text-white' : isLightMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{t('employerDashboard.shortlisted')} ({counts.shortlisted})</button>
                          <button onClick={() => setApplicantFilter('interview_scheduled')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${applicantFilter === 'interview_scheduled' ? 'bg-sky-500 text-white' : isLightMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{t('employerDashboard.interviewScheduled')} ({counts.interview_scheduled})</button>
                          <button onClick={() => setApplicantFilter('rejected')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${applicantFilter === 'rejected' ? 'bg-red-500 text-white' : isLightMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{t('employerDashboard.rejected')} ({counts.rejected})</button>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="space-y-3">
                  {getFilteredApplicants(selectedJob.applicants).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).map(applicant => (
                    <div key={applicant.id} className={`rounded-lg p-4 border transition-all ${isLightMode ? 'bg-gray-50 border-gray-200 hover:border-violet-400' : 'bg-white/5 border-white/10 hover:border-violet-500/50'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className={`font-semibold truncate ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{applicant.name}</h5>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getApplicantStatusColor(applicant.status)}`}>{getApplicantStatusLabel(applicant.status)}</span>
                          </div>
                          <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{applicant.title} • {applicant.experience}</p>
                          {applicant.status === 'interview_scheduled' && applicant.interviewDate && (
                            <div className="mt-2 flex items-center gap-2 text-sky-500 text-sm">
                              <i className="ri-calendar-check-line"></i>
                              <span>{applicant.interviewDate} at {applicant.interviewTime}</span>
                            </div>
                          )}
                          {applicant.status === 'rejected' && applicant.rejectionReason && (
                            <div className="mt-2 flex items-start gap-2 text-red-400 text-sm">
                              <i className="ri-information-line mt-0.5"></i>
                              <span>{t('employerDashboard.reasonLabel')} {applicant.rejectionReason}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`text-2xl font-bold bg-gradient-to-r ${getMatchScoreColor(applicant.matchScore || 0)} bg-clip-text text-transparent`}>{applicant.matchScore}%</div>
                            <div className={`text-xs ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('common.match')}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors cursor-pointer"><i className="ri-eye-line"></i></button>
                            {applicant.status !== 'rejected' && applicant.status !== 'interview_scheduled' && (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedApplicant(applicant); setShowInterviewModal(true); }} className="w-10 h-10 flex items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors cursor-pointer" title={t('employerDashboard.scheduleInterview')}><i className="ri-calendar-schedule-line"></i></button>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedApplicant(applicant); setShowRejectModal(true); }} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer" title={t('employerDashboard.reject')}><i className="ri-close-circle-line"></i></button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className={`h-2 rounded-full overflow-hidden ${isLightMode ? 'bg-gray-200' : 'bg-white/10'}`}>
                          <div className={`h-full bg-gradient-to-r ${getMatchScoreColor(applicant.matchScore || 0)} rounded-full transition-all`} style={{ width: `${applicant.matchScore}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getFilteredApplicants(selectedJob.applicants).length === 0 && (
                    <div className={`text-center py-8 border-2 border-dashed rounded-lg ${isLightMode ? 'border-gray-200' : 'border-white/20'}`}>
                      <i className={`ri-user-search-line text-4xl mb-3 ${isLightMode ? 'text-gray-300' : 'text-gray-400'}`}></i>
                      <p className={isLightMode ? 'text-gray-400' : 'text-gray-400'}>{t('employerDashboard.noApplicants')}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-semibold flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                    <i className="ri-user-line text-violet-400"></i>{t('employerDashboard.appliedApplicants')}
                  </h4>
                  <button onClick={() => handleCalculateMatching(selectedJob.id)} className="px-4 py-2 bg-violet-500 text-white text-sm font-semibold rounded-lg hover:bg-violet-600 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-calculator-line mr-2"></i>{t('employerDashboard.calculateMatching')}
                  </button>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <i className="ri-information-line text-amber-400 text-xl mt-0.5"></i>
                    <div>
                      <p className="text-amber-400 font-medium">{t('employerDashboard.matchingNotCalculated')}</p>
                      <p className={`text-sm mt-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('employerDashboard.matchingNotCalcDesc')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedJob.applicants.map(applicant => (
                    <div key={applicant.id} className={`rounded-lg p-4 border transition-all ${isLightMode ? 'bg-gray-50 border-gray-200 hover:border-violet-400' : 'bg-white/5 border-white/10 hover:border-violet-500/50'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className={`font-semibold truncate ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{applicant.name}</h5>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getApplicantStatusColor(applicant.status)}`}>{getApplicantStatusLabel(applicant.status)}</span>
                          </div>
                          <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{applicant.title} • {applicant.experience}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`text-sm ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('employerDashboard.appliedDate')}</div>
                            <div className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{applicant.appliedDate}</div>
                          </div>
                          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors cursor-pointer"><i className="ri-eye-line"></i></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedApplicant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInterviewModal(false)}></div>
          <div className={`relative rounded-2xl border p-6 w-full max-w-md ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
            <button onClick={() => setShowInterviewModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}><i className="ri-close-line text-xl"></i></button>
            <h3 className={`text-xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('employerDashboard.scheduleInterview')}</h3>
            <p className={`text-sm mb-6 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('employerDashboard.scheduleWith')} {selectedApplicant.name}</p>
            {scheduleInterviewError && (
              <div className={`rounded-lg p-3 text-sm border mb-4 ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                {scheduleInterviewError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{t('employerDashboard.interviewDate')}</label>
                <input type="date" min={todayDate} value={interviewDetails.date} onChange={(e) => setInterviewDetails({ ...interviewDetails, date: e.target.value })} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`} />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{t('employerDashboard.interviewTime')}</label>
                <input type="time" value={interviewDetails.time} onChange={(e) => setInterviewDetails({ ...interviewDetails, time: e.target.value })} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowInterviewModal(false)} disabled={schedulingApplicantId === selectedApplicant.id} className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>{t('employerDashboard.cancel')}</button>
                <button onClick={() => void handleScheduleInterview()} disabled={!interviewDetails.date || !interviewDetails.time || schedulingApplicantId === selectedApplicant.id} className="flex-1 px-4 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap">{schedulingApplicantId === selectedApplicant.id ? 'Scheduling...' : t('employerDashboard.schedule')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Applicant Modal */}
      {showRejectModal && selectedApplicant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className={`relative rounded-2xl border p-6 w-full max-w-md ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
            <button onClick={() => setShowRejectModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}><i className="ri-close-line text-xl"></i></button>
            <h3 className={`text-xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('employerDashboard.rejectApplicant')}</h3>
            <p className={`text-sm mb-6 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('employerDashboard.rejectConfirm')} {selectedApplicant.name}&apos;s {t('employerDashboard.application')}</p>
            {rejectApplicantError && (
              <div className={`rounded-lg p-3 text-sm border mb-4 ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                {rejectApplicantError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{t('employerDashboard.rejectionReason')}</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 resize-none ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white'}`} rows={3} placeholder={t('employerDashboard.rejectionPlaceholder')} maxLength={500} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowRejectModal(false)} disabled={rejectingApplicantId === selectedApplicant.id} className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>{t('employerDashboard.cancel')}</button>
                <button onClick={() => void handleRejectApplicant()} disabled={rejectingApplicantId === selectedApplicant.id} className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">{rejectingApplicantId === selectedApplicant.id ? 'Rejecting...' : t('employerDashboard.reject')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Job Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setJobToDelete(null)}></div>
          <div className={`relative rounded-2xl border p-6 w-full max-w-md ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
            <button onClick={() => setJobToDelete(null)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}><i className="ri-close-line text-xl"></i></button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500/20 mx-auto mb-4">
                <i className="ri-delete-bin-line text-2xl text-red-400"></i>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('employerDashboard.removeJobTitle')}</h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('employerDashboard.removeJobConfirm')} <span className={`font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>&quot;{jobToDelete.title}&quot;</span>? {t('employerDashboard.allDataLost')}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setJobToDelete(null)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>{t('employerDashboard.cancel')}</button>
              <button
                onClick={() => void handleDeleteJob(jobToDelete.id)}
                disabled={deletingJobId === jobToDelete.id}
                className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-delete-bin-line mr-2"></i>{deletingJobId === jobToDelete.id ? 'Removing...' : t('employerDashboard.remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerDashboard;
