import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReportModal from '../../../components/feature/ReportModal';
import { useTheme } from '../../../contexts/ThemeContext';

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
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'Tech Solutions Inc.',
      companyId: '1',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $160k',
      postedDate: '2024-01-10',
      status: 'active',
      applicantsCount: 45,
      matchingCalculated: true,
      applicants: [
        { id: '1', name: 'Sarah Johnson', avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20software%20developer%20portrait%20confident%20smile%20clean%20white%20background%20business%20casual&width=100&height=100&seq=app1&orientation=squarish', title: 'Full Stack Developer', experience: '5 years', matchScore: 95, appliedDate: '2024-01-12', status: 'shortlisted' },
        { id: '2', name: 'Michael Chen', avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20frontend%20developer%20portrait%20friendly%20smile%20clean%20white%20background%20casual%20professional&width=100&height=100&seq=app2&orientation=squarish', title: 'Frontend Developer', experience: '3 years', matchScore: 88, appliedDate: '2024-01-13', status: 'interview_scheduled', interviewDate: '2024-01-25', interviewTime: '10:00 AM' },
        { id: '3', name: 'Emily Rodriguez', avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20backend%20engineer%20portrait%20confident%20clean%20white%20background%20business%20casual&width=100&height=100&seq=app3&orientation=squarish', title: 'React Developer', experience: '4 years', matchScore: 82, appliedDate: '2024-01-14', status: 'rejected', rejectionReason: 'Insufficient experience with required technologies' },
        { id: '4', name: 'David Kim', avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20developer%20portrait%20friendly%20modern%20office%20clean%20white%20background&width=100&height=100&seq=app4&orientation=squarish', title: 'UI Developer', experience: '2 years', matchScore: 75, appliedDate: '2024-01-15', status: 'pending' }
      ]
    },
    {
      id: '2',
      title: 'Backend Engineer',
      company: 'Tech Solutions Inc.',
      companyId: '1',
      location: 'Remote',
      type: 'Full-time',
      salary: '$100k - $140k',
      postedDate: '2024-01-08',
      status: 'active',
      applicantsCount: 32,
      matchingCalculated: false,
      applicants: [
        { id: '5', name: 'James Wilson', avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20full%20stack%20developer%20portrait%20confident%20clean%20white%20background%20business%20casual&width=100&height=100&seq=app5&orientation=squarish', title: 'Backend Developer', experience: '6 years', matchScore: null, appliedDate: '2024-01-09', status: 'pending' },
        { id: '6', name: 'Amanda Foster', avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20cloud%20architect%20portrait%20confident%20smile%20clean%20white%20background%20elegant%20business&width=100&height=100&seq=app6&orientation=squarish', title: 'Python Developer', experience: '4 years', matchScore: null, appliedDate: '2024-01-10', status: 'pending' },
        { id: '7', name: 'Ryan Thompson', avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20developer%20portrait%20friendly%20smile%20modern%20workspace%20clean%20white%20background&width=100&height=100&seq=app7&orientation=squarish', title: 'Node.js Developer', experience: '3 years', matchScore: null, appliedDate: '2024-01-11', status: 'pending' }
      ]
    },
    {
      id: '3',
      title: 'Digital Marketing Manager',
      company: 'Digital Marketing Pro',
      companyId: '2',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$80k - $110k',
      postedDate: '2024-01-05',
      status: 'active',
      applicantsCount: 28,
      matchingCalculated: true,
      applicants: [
        { id: '8', name: 'Rachel Green', avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20marketing%20manager%20portrait%20creative%20smile%20clean%20white%20background%20stylish%20casual&width=100&height=100&seq=app8&orientation=squarish', title: 'Marketing Specialist', experience: '5 years', matchScore: 91, appliedDate: '2024-01-06', status: 'interview_scheduled', interviewDate: '2024-01-28', interviewTime: '2:00 PM' },
        { id: '9', name: 'Alex Martinez', avatar: 'https://readdy.ai/api/search-image?query=professional%20marketing%20professional%20portrait%20friendly%20smile%20clean%20white%20background%20business%20casual&width=100&height=100&seq=app9&orientation=squarish', title: 'Digital Marketer', experience: '4 years', matchScore: 85, appliedDate: '2024-01-07', status: 'rejected', rejectionReason: 'Position filled by another candidate' }
      ]
    },
    {
      id: '4',
      title: 'UI/UX Designer',
      company: 'Tech Solutions Inc.',
      companyId: '1',
      location: 'San Francisco, CA',
      type: 'Contract',
      salary: '$70/hr - $90/hr',
      postedDate: '2024-01-02',
      status: 'closed',
      applicantsCount: 56,
      matchingCalculated: true,
      applicants: []
    }
  ]);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [jobFilter, setJobFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'pending' | 'shortlisted' | 'interview_scheduled' | 'rejected'>('all');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [interviewDetails, setInterviewDetails] = useState({ date: '', time: '' });
  const [rejectionReason, setRejectionReason] = useState('');

  const stats = {
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalApplicants: jobs.reduce((sum, j) => sum + j.applicantsCount, 0),
    interviewsScheduled: jobs.reduce((sum, j) => sum + j.applicants.filter(a => a.status === 'interview_scheduled').length, 0),
    closedJobs: jobs.filter(j => j.status === 'closed').length,
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

  const handleScheduleInterview = () => {
    if (!selectedApplicant || !interviewDetails.date || !interviewDetails.time || !selectedJob) return;
    const updatedApplicants = selectedJob.applicants.map(app =>
      app.id === selectedApplicant.id
        ? { ...app, status: 'interview_scheduled' as const, interviewDate: interviewDetails.date, interviewTime: interviewDetails.time }
        : app
    );
    setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, applicants: updatedApplicants } : j));
    setSelectedJob({ ...selectedJob, applicants: updatedApplicants });
    setShowInterviewModal(false);
    setSelectedApplicant(null);
    setInterviewDetails({ date: '', time: '' });
  };

  const handleRejectApplicant = () => {
    if (!selectedApplicant || !selectedJob) return;
    const updatedApplicants = selectedJob.applicants.map(app =>
      app.id === selectedApplicant.id
        ? { ...app, status: 'rejected' as const, rejectionReason: rejectionReason || 'Application not selected' }
        : app
    );
    setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, applicants: updatedApplicants } : j));
    setSelectedJob({ ...selectedJob, applicants: updatedApplicants });
    setShowRejectModal(false);
    setSelectedApplicant(null);
    setRejectionReason('');
  };

  const handleRemoveJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (selectedJob?.id === id) setSelectedJob(null);
    setJobToDelete(null);
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
          {filteredJobs.map(job => (
            <div key={job.id} onClick={() => { setSelectedJob(job); setApplicantFilter('all'); }}
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
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{t('employerDashboard.interviewDate')}</label>
                <input type="date" value={interviewDetails.date} onChange={(e) => setInterviewDetails({ ...interviewDetails, date: e.target.value })} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`} />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{t('employerDashboard.interviewTime')}</label>
                <input type="time" value={interviewDetails.time} onChange={(e) => setInterviewDetails({ ...interviewDetails, time: e.target.value })} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowInterviewModal(false)} className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>{t('employerDashboard.cancel')}</button>
                <button onClick={handleScheduleInterview} disabled={!interviewDetails.date || !interviewDetails.time} className="flex-1 px-4 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap">{t('employerDashboard.schedule')}</button>
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
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{t('employerDashboard.rejectionReason')}</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 resize-none ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white'}`} rows={3} placeholder={t('employerDashboard.rejectionPlaceholder')} maxLength={500} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowRejectModal(false)} className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>{t('employerDashboard.cancel')}</button>
                <button onClick={handleRejectApplicant} className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap">{t('employerDashboard.reject')}</button>
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
              <button onClick={() => handleRemoveJob(jobToDelete.id)} className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-delete-bin-line mr-2"></i>{t('employerDashboard.remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerDashboard;
