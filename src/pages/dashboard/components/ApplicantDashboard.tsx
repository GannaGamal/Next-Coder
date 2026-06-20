import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  getJobApplicationDashboard,
  type JobApplicationDashboardItem,
  withdrawJobApplication,
  formatSalary,
} from '../../../services/job-application.service';

type AppliedJob = JobApplicationDashboardItem;

const ApplicantDashboard = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Under Review' | 'Interview Scheduled' | 'Rejected'>('all');
  const [selectedJob, setSelectedJob] = useState<AppliedJob | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState<AppliedJob | null>(null);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawingApplicationId, setWithdrawingApplicationId] = useState<number | null>(null);
  const { isLightMode } = useTheme();
  const { t } = useTranslation();

  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    underReview: 0,
    interviews: 0,
    accepted: 0,
    rejected: 0,
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadApplications = async () => {
      setIsLoadingApplications(true);
      setApplicationsError('');

      try {
        const dashboard = await getJobApplicationDashboard();
        setAppliedJobs(dashboard.items);
        setDashboardStats({
          total: dashboard.totalAppliedCount || dashboard.items.length,
          underReview: dashboard.underReviewCount || dashboard.items.filter(j => j.status === 'Under Review').length,
          interviews: dashboard.interviewsCount || dashboard.items.filter(j => j.status === 'Interview Scheduled').length,
          rejected: dashboard.rejectedCount || dashboard.items.filter(j => j.status === 'Rejected').length,
          accepted: dashboard.items.filter(j => j.status === 'Accepted').length,
        });
      } catch (err: unknown) {
        setAppliedJobs([]);
        setApplicationsError(err instanceof Error ? err.message : 'We could not load your applications right now. Please try again.');
      } finally {
        setIsLoadingApplications(false);
      }
    };

    loadApplications();
  }, []);

  const stats = dashboardStats;

  const filteredJobs = statusFilter === 'all'
    ? appliedJobs
    : appliedJobs.filter(j => j.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'Interview Scheduled': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      case 'Under Review': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'Rejected': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return 'ri-checkbox-circle-line';
      case 'Interview Scheduled': return 'ri-calendar-check-line';
      case 'Under Review': return 'ri-time-line';
      case 'Rejected': return 'ri-close-circle-line';
      default: return 'ri-question-line';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-500';
    if (score >= 80) return 'from-pink-500 to-rose-500';
    if (score >= 70) return 'from-amber-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const handleWithdraw = async (job: AppliedJob) => {
    setWithdrawError('');
    setWithdrawingApplicationId(job.id);

    try {
      await withdrawJobApplication(job.applicationId);
      setAppliedJobs(prev => prev.filter(j => j.applicationId !== job.applicationId));
      setDashboardStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        underReview: job.status === 'Under Review' ? Math.max(0, prev.underReview - 1) : prev.underReview,
        interviews: job.status === 'Interview Scheduled' ? Math.max(0, prev.interviews - 1) : prev.interviews,
        rejected: job.status === 'Rejected' ? Math.max(0, prev.rejected - 1) : prev.rejected,
        accepted: job.status === 'Accepted' ? Math.max(0, prev.accepted - 1) : prev.accepted,
      }));
      setShowWithdrawConfirm(null);
      if (selectedJob?.applicationId === job.applicationId) setSelectedJob(null);
    } catch (err: unknown) {
      setWithdrawError(err instanceof Error ? err.message : 'We could not withdraw this application right now. Please try again.');
    } finally {
      setWithdrawingApplicationId(null);
    }
  };

  const openWithdrawConfirm = (job: AppliedJob) => {
    setWithdrawError('');
    setShowWithdrawConfirm(job);
  };

  const closeWithdrawConfirm = () => {
    setWithdrawError('');
    setShowWithdrawConfirm(null);
  };

  const filterButtons: { label: string; value: typeof statusFilter; color: string }[] = [
    { label: `${t('applicantDashboard.all')} (${stats.total})`, value: 'all', color: 'bg-pink-500' },
    { label: `${t('applicantDashboard.underReview')} (${stats.underReview})`, value: 'Under Review', color: 'bg-amber-500' },
    { label: `${t('applicantDashboard.interviews')} (${stats.interviews})`, value: 'Interview Scheduled', color: 'bg-sky-500' },
    { label: `${t('applicantDashboard.rejected')} (${stats.rejected})`, value: 'Rejected', color: 'bg-red-500' },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('applicantDashboard.totalApplied')}</span>
            <div className="w-8 h-8 flex items-center justify-center">
              <i className="ri-send-plane-line text-pink-400 text-xl"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
          <div className="text-white/50 text-sm mt-1">{t('applicantDashboard.applicationsSent')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('applicantDashboard.underReview')}</span>
            <div className="w-8 h-8 flex items-center justify-center">
              <i className="ri-time-line text-amber-400 text-xl"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.underReview}</div>
          <div className="text-white/50 text-sm mt-1">{t('applicantDashboard.awaitingResponse')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('applicantDashboard.interviews')}</span>
            <div className="w-8 h-8 flex items-center justify-center">
              <i className="ri-calendar-check-line text-sky-400 text-xl"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.interviews}</div>
          <div className="text-white/50 text-sm mt-1">{t('applicantDashboard.scheduled')}</div>
        </div>
      </div>

      {/* Applied Jobs Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white">{t('applicantDashboard.appliedJobs')}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {filterButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${statusFilter === btn.value ? `${btn.color} text-white` : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {isLoadingApplications && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${isLightMode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'}`}>
            Loading your real applications from API...
          </div>
        )}

        {applicationsError && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${isLightMode ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
            {applicationsError}
          </div>
        )}

        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div
              key={job.applicationId}
              className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{job.jobTitle}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1 whitespace-nowrap ${getStatusColor(job.status)}`}>
                      <i className={getStatusIcon(job.status)}></i>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><i className="ri-building-line text-pink-400"></i>{job.companyName}</span>
                    <span className="flex items-center gap-1"><i className="ri-map-pin-line text-pink-400"></i>{job.location}</span>
                    <span className="flex items-center gap-1"><i className="ri-money-dollar-circle-line text-pink-400"></i><span className="text-emerald-400 font-medium">{formatSalary(job.minSalary, job.maxSalary)}</span></span>
                    <span className="flex items-center gap-1"><i className="ri-briefcase-line text-pink-400"></i>{job.jobType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${getMatchScoreColor(job.matchPercentage)} bg-clip-text text-transparent`}>
                      {job.matchPercentage}%
                    </div>
                    <div className="text-xs text-gray-500">{t('common.match')}</div>
                  </div>
                </div>
              </div>

              {/* Match score bar */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full bg-gradient-to-r ${getMatchScoreColor(job.matchPercentage)} rounded-full transition-all`}
                  style={{ width: `${job.matchPercentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line"></i>{t('applicantDashboard.applied')} {job.appliedDate}
                  </span>
                  {job.status === 'Interview Scheduled' && job.interviewScheduledAt && (
                    <span className="flex items-center gap-1 text-sky-400">
                      <i className="ri-calendar-check-line"></i>
                      {t('applicantDashboard.interview')} {new Date(job.interviewScheduledAt).toLocaleDateString()} at {new Date(job.interviewScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {job.status === 'Under Review' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openWithdrawConfirm(job); }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-close-line mr-1"></i>{t('applicantDashboard.withdraw')}
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
              <i className="ri-briefcase-line text-5xl text-gray-400 mb-4"></i>
              <p className="text-gray-400">{t('applicantDashboard.noApplications')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedJob(null)}></div>
          <div className={`relative rounded-2xl border p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
            <button onClick={() => setSelectedJob(null)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
              <i className="ri-close-line text-xl"></i>
            </button>

            <div className="mb-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{selectedJob.jobTitle}</h3>
                  <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{selectedJob.companyName}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 whitespace-nowrap ${getStatusColor(selectedJob.status)}`}>
                  <i className={getStatusIcon(selectedJob.status)}></i>
                  {selectedJob.status}
                </span>
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-xs font-medium uppercase tracking-wider ${isLightMode ? 'text-gray-400' : 'text-white/50'}`}>{t('applicantDashboard.location')}</span>
                <p className={`font-semibold mt-1 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  <i className="ri-map-pin-line text-pink-400"></i>{selectedJob.location}
                </p>
              </div>
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-xs font-medium uppercase tracking-wider ${isLightMode ? 'text-gray-400' : 'text-white/50'}`}>{t('applicantDashboard.salary')}</span>
                <p className="text-emerald-500 font-semibold mt-1 flex items-center gap-2">
                  <i className="ri-money-dollar-circle-line"></i>{formatSalary(selectedJob.minSalary, selectedJob.maxSalary)}
                </p>
              </div>
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-xs font-medium uppercase tracking-wider ${isLightMode ? 'text-gray-400' : 'text-white/50'}`}>{t('applicantDashboard.jobType')}</span>
                <p className={`font-semibold mt-1 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  <i className="ri-briefcase-line text-pink-400"></i>{selectedJob.jobType}
                </p>
              </div>
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-xs font-medium uppercase tracking-wider ${isLightMode ? 'text-gray-400' : 'text-white/50'}`}>{t('applicantDashboard.appliedDate')}</span>
                <p className={`font-semibold mt-1 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  <i className="ri-calendar-line text-pink-400"></i>{selectedJob.appliedDate}
                </p>
              </div>
            </div>

            <div className={`rounded-lg p-4 mb-6 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium uppercase tracking-wider ${isLightMode ? 'text-gray-400' : 'text-white/50'}`}>{t('common.matchScore')}</span>
                <span className={`text-2xl font-bold bg-gradient-to-r ${getMatchScoreColor(selectedJob.matchPercentage)} bg-clip-text text-transparent`}>
                  {selectedJob.matchPercentage}%
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isLightMode ? 'bg-gray-200' : 'bg-white/10'}`}>
                <div className={`h-full bg-gradient-to-r ${getMatchScoreColor(selectedJob.matchPercentage)} rounded-full`} style={{ width: `${selectedJob.matchPercentage}%` }}></div>
              </div>
            </div>

            {selectedJob.status === 'Interview Scheduled' && selectedJob.interviewScheduledAt && (
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-calendar-check-line text-sky-400"></i>
                  <span className="text-sky-500 font-semibold text-sm">{t('applicantDashboard.interviewScheduled')}</span>
                </div>
                <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{new Date(selectedJob.interviewScheduledAt).toLocaleDateString()} at {new Date(selectedJob.interviewScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}



            {selectedJob.reason && (
              <div className="mb-6">
                <span className={`text-xs font-medium uppercase tracking-wider ${isLightMode ? 'text-gray-400' : 'text-white/50'}`}>{t('applicantDashboard.notes')}</span>
                <p className={`text-sm mt-2 leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-white/80'}`}>{selectedJob.reason}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSelectedJob(null)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>{t('applicantDashboard.close')}</button>
              {selectedJob.status === 'Under Review' && (
                <button
                  onClick={() => { setSelectedJob(null); openWithdrawConfirm(selectedJob); }}
                  className="flex-1 px-5 py-3 bg-red-500/20 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-close-circle-line mr-2"></i>{t('applicantDashboard.withdrawApplication')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirm Modal */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeWithdrawConfirm}></div>
          <div className={`relative rounded-2xl border p-6 w-full max-w-md ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500/20 mx-auto mb-4">
                <i className="ri-close-circle-line text-2xl text-red-400"></i>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('applicantDashboard.withdrawConfirmTitle')}</h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('applicantDashboard.withdrawConfirmText')} <span className={`font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>{showWithdrawConfirm.jobTitle}</span> {t('applicantDashboard.at')} <span className={`font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>{showWithdrawConfirm.companyName}</span>? {t('applicantDashboard.cannotUndo')}
              </p>
            </div>
            {withdrawError && (
              <div className={`mb-4 p-3 rounded-lg text-sm border ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                {withdrawError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={closeWithdrawConfirm}
                disabled={withdrawingApplicationId === showWithdrawConfirm.applicationId}
                className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                {t('applicantDashboard.cancel')}
              </button>
              <button
                onClick={() => handleWithdraw(showWithdrawConfirm)}
                disabled={withdrawingApplicationId === showWithdrawConfirm.applicationId}
                className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {withdrawingApplicationId === showWithdrawConfirm.applicationId ? 'Withdrawing...' : t('applicantDashboard.withdraw')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicantDashboard;
