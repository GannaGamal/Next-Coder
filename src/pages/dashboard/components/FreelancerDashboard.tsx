import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReportModal from '../../../components/feature/ReportModal';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  deleteFreelancerApplication,
  getFreelancerActiveProjects,
  getFreelancerApplicationDetails,
  getFreelancerApplications,
  getFreelancerDashboardSummary,
  submitFreelancerMilestone,
  withdrawFreelancerApplication,
  type FreelancerActiveMilestone,
  type FreelancerActiveProject,
  type FreelancerDeliverable,
  type FreelancerApplication,
} from '../../../services/freelancerDashboard.service';

interface MilestoneComment {
  id: string;
  author: string;
  authorRole: 'freelancer' | 'client';
  text: string;
  date: string;
}

interface ProjectComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface ActiveMilestone extends FreelancerActiveMilestone {
  comments: MilestoneComment[];
  deliverables: FreelancerDeliverable[];
  deadline?: string;
}

interface ActiveProject extends FreelancerActiveProject {
  clientAvatar: string;
  milestones: ActiveMilestone[];
  comments: ProjectComment[];
}

interface CompletedProject {
  id: string;
  title: string;
  description: string;
  client: string;
  clientAvatar: string;
  budget: number;
  status: 'applied' | 'accepted' | 'in-progress' | 'completed' | 'rejected';
  appliedDate: string;
  milestones: Array<{
    id: string;
    title: string;
    deliverables: string;
    amount: number;
    duration: string;
    deadline: string;
    status: 'pending' | 'approved' | 'rejected' | 'submitted' | 'late' | 'finished';
    submittedDate?: string;
    approvedDate?: string;
    finishedDate?: string;
    rejectionComment?: string;
    comments: MilestoneComment[];
  }>;
  totalPaid: number;
  comments: ProjectComment[];
  clientRating?: number;
  myRating?: number;
  category?: string;
  skills?: string[];
  deadline?: string;
  clientEmail?: string;
}

type AppliedProject = FreelancerApplication & {
  clientAvatar: string;
};

interface DashboardStats {
  activeProjects: number;
  totalEarnings: number;
  pendingApplications: number;
  completed: number;
}

const FreelancerDashboard = () => {
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('applied');
  const [selectedProject, setSelectedProject] = useState<CompletedProject | null>(null);
  const [selectedActiveProject, setSelectedActiveProject] = useState<ActiveProject | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<AppliedProject | null>(null);
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [showSubmitDeliverablesModal, setShowSubmitDeliverablesModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ name: string; avatar: string; projectId: number }>({
    name: '',
    avatar: '',
    projectId: 0,
  });
  const [applicationToRemove, setApplicationToRemove] = useState<AppliedProject | null>(null);
  const [isLoadingApplied, setIsLoadingApplied] = useState(true);
  const [appliedError, setAppliedError] = useState<string | null>(null);
  const [isLoadingActive, setIsLoadingActive] = useState(true);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [isLoadingApplicationDetails, setIsLoadingApplicationDetails] = useState(false);
  const [applicationDetailsError, setApplicationDetailsError] = useState<string | null>(null);
  const [appliedActionMessage, setAppliedActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isApplyingAction, setIsApplyingAction] = useState(false);
  const [actionProposalId, setActionProposalId] = useState<number | null>(null);
  const [appliedReloadKey, setAppliedReloadKey] = useState(0);
  const [activeReloadKey, setActiveReloadKey] = useState(0);
  const [editingMilestone, setEditingMilestone] = useState<ActiveMilestone | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState<ActiveMilestone | null>(null);
  const [submitNote, setSubmitNote] = useState('');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitDeliverablesError, setSubmitDeliverablesError] = useState<string | null>(null);
  const [isSubmittingDeliverables, setIsSubmittingDeliverables] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [milestoneComment, setMilestoneComment] = useState('');
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    totalEarnings: 0,
    pendingApplications: 0,
    completed: 0,
  });

  const [appliedProjects, setAppliedProjects] = useState<AppliedProject[]>([]);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);

  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([
    {
      id: '5',
      title: 'Logo Design for Restaurant',
      description: 'Created a modern logo for a restaurant brand',
      client: 'Tasty Bites',
      clientAvatar: 'https://readdy.ai/api/search-image?query=restaurant%20logo%20modern%20elegant%20food%20design%20simple%20clean%20background%20professional&width=200&height=200&seq=client5&orientation=squarish',
      budget: 800,
      status: 'completed',
      appliedDate: '2023-12-20',
      milestones: [
        {
          id: 'm8',
          title: 'Initial Concepts',
          deliverables: '3 initial logo concepts with color variations',
          amount: 300,
          duration: '3 days',
          deadline: '2023-12-23',
          status: 'finished',
          submittedDate: '2023-12-22',
          approvedDate: '2023-12-22',
          finishedDate: '2023-12-23',
          comments: [],
        },
        {
          id: 'm9',
          title: 'Revisions & Final Design',
          deliverables: 'Final logo files in all formats (SVG, PNG, PDF)',
          amount: 500,
          duration: '2 days',
          deadline: '2023-12-27',
          status: 'finished',
          submittedDate: '2023-12-26',
          approvedDate: '2023-12-26',
          finishedDate: '2023-12-27',
          comments: [],
        },
      ],
      totalPaid: 800,
      comments: [
        { id: 'c3', author: 'Tasty Bites', text: 'Absolutely love the final design!', date: '2023-12-27' },
      ],
      clientRating: 5,
      myRating: 5,
    },
  ]);

  useEffect(() => {
    let isMounted = true;

    const toSafeNumber = (value: number | null | undefined): number =>
      typeof value === 'number' && Number.isFinite(value) ? value : 0;

    const loadSummary = async () => {
      setIsLoadingSummary(true);

      try {
        const summary = await getFreelancerDashboardSummary();
        if (!isMounted) return;

        setStats({
          activeProjects: toSafeNumber(summary?.activeProjectsCount),
          totalEarnings: toSafeNumber(summary?.totalEarnings),
          pendingApplications: toSafeNumber(summary?.pendingApplicationsCount),
          completed: toSafeNumber(summary?.completedProjectsCount),
        });
      } catch (error) {
        if (!isMounted) return;

        setStats({
          activeProjects: 0,
          totalEarnings: 0,
          pendingApplications: 0,
          completed: 0,
        });
      } finally {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      }
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      setIsLoadingApplied(true);
      setAppliedError(null);

      try {
        const data = await getFreelancerApplications();
        if (!isMounted) return;

        const mapped = (Array.isArray(data) ? data : []).map((application) => ({
          ...application,
          clientAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(application.clientName || 'Client')}&background=0D8ABC&color=fff&rounded=true`,
        }));

        setAppliedProjects(mapped);
      } catch (error) {
        if (!isMounted) return;

        setAppliedError(error instanceof Error ? error.message : 'We could not load applied projects right now. Please try again.');
        setAppliedProjects([]);
      } finally {
        if (isMounted) setIsLoadingApplied(false);
      }
    };

    void loadApplications();

    return () => {
      isMounted = false;
    };
  }, [appliedReloadKey]);

  useEffect(() => {
    let isMounted = true;

    const loadActiveProjects = async () => {
      setIsLoadingActive(true);
      setActiveError(null);

      try {
        const data = await getFreelancerActiveProjects();
        if (!isMounted) return;

        const mapped: ActiveProject[] = (Array.isArray(data) ? data : []).map((project) => {
          const rawComments = Array.isArray(project.comments) ? project.comments : [];
          const normalizedComments: ProjectComment[] = rawComments.map((comment, index) => {
            const payload = comment as Partial<{ id: string | number; author: string; senderName: string; text: string; content: string; date: string; createdAt: string }>;
            return {
              id: String(payload.id ?? `c-${project.projectId}-${index}`),
              author: payload.author ?? payload.senderName ?? '',
              text: payload.text ?? payload.content ?? '',
              date: payload.date ?? payload.createdAt ?? '',
            };
          });

          return {
            ...project,
            clientAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(project.clientName || 'Client')}&background=0D8ABC&color=fff&rounded=true`,
            milestones: (Array.isArray(project.milestones) ? project.milestones : []).map((milestone) => ({
              ...milestone,
              comments: [],
              deliverables: Array.isArray(milestone.deliverables) ? milestone.deliverables : [],
            })),
            comments: normalizedComments,
          };
        });

        setActiveProjects(mapped);
      } catch (error) {
        if (!isMounted) return;

        setActiveError(error instanceof Error ? error.message : 'We could not load active projects right now. Please try again.');
        setActiveProjects([]);
      } finally {
        if (isMounted) setIsLoadingActive(false);
      }
    };

    void loadActiveProjects();

    return () => {
      isMounted = false;
    };
  }, [activeReloadKey]);

  useEffect(() => {
    if (!appliedActionMessage) return;

    const timeoutId = window.setTimeout(() => {
      setAppliedActionMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appliedActionMessage]);

  const formatCurrency = (value: number | null | undefined) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return t('freelancerDashboard.noAvailable');
    }
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value: number | null | undefined) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return t('freelancerDashboard.noAvailable');
    }
    const normalized = Math.max(0, Math.min(100, value));
    return `${normalized.toFixed(1).replace(/\.0$/, '')}%`;
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return t('freelancerDashboard.noAvailable');
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return t('freelancerDashboard.noAvailable');
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTextValue = (value: string | null | undefined) =>
    value && value.trim() ? value.trim() : t('freelancerDashboard.noAvailable');

  const formatDuration = (duration: number | null | undefined, durationType: string | null | undefined) => {
    if (typeof duration !== 'number' || !Number.isFinite(duration)) return t('freelancerDashboard.noAvailable');
    const unit = durationType?.trim() || '';
    return unit ? `${duration} ${unit}` : `${duration}`;
  };

  const getApplicationStatusKey = (status: string | null | undefined) => {
    const normalized = status?.trim().toLowerCase();
    if (normalized === 'accepted') return 'accepted';
    if (normalized === 'rejected') return 'rejected';
    if (normalized === 'in-progress') return 'in-progress';
    if (normalized === 'completed') return 'completed';
    return 'applied';
  };

  const getApplicationStatusLabel = (status: string | null | undefined) =>
    status?.trim() || t('freelancerDashboard.noAvailable');

  const selectedApplicationStatusKey = selectedApplication
    ? getApplicationStatusKey(selectedApplication.proposalStatus)
    : 'applied';
  const selectedApplicationStatusLabel = selectedApplication
    ? getApplicationStatusLabel(selectedApplication.proposalStatus)
    : t('freelancerDashboard.noAvailable');

  const normalizeMilestoneStatus = (status: string | null | undefined) =>
    status?.toString().trim().replace(/[\s_-]/g, '').toLowerCase() || 'pending';

  const getMilestoneStatusConfig = (status: string | null | undefined) => {
    const key = normalizeMilestoneStatus(status);
    const config: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: 'ri-time-line', label: t('freelancerDashboard.pendingApproval') },
      approved: { bg: 'bg-green-500/15', text: 'text-green-400', icon: 'ri-check-line', label: t('freelancerDashboard.approved') },
      accepted: { bg: 'bg-green-500/15', text: 'text-green-400', icon: 'ri-check-line', label: t('freelancerDashboard.approved') },
      rejected: { bg: 'bg-red-500/15', text: 'text-red-400', icon: 'ri-close-circle-line', label: t('freelancerDashboard.rejected') },
      submitted: { bg: 'bg-teal-500/15', text: 'text-teal-400', icon: 'ri-upload-2-line', label: t('freelancerDashboard.submitted') },
      late: { bg: 'bg-orange-500/15', text: 'text-orange-400', icon: 'ri-alarm-warning-line', label: t('freelancerDashboard.late') },
      finished: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: 'ri-checkbox-circle-line', label: t('freelancerDashboard.finished') },
    };
    return config[key] || { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: 'ri-question-line', label: status || t('freelancerDashboard.noAvailable') };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-amber-500/20 text-amber-400',
      accepted: 'bg-green-500/20 text-green-400',
      'in-progress': 'bg-cyan-500/20 text-cyan-400',
      completed: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const handleViewProjectDetails = async (application: AppliedProject) => {
    if (isLoadingApplicationDetails && selectedApplication?.proposalId === application.proposalId) return;
    setSelectedApplication(application);
    setShowProjectDetailModal(true);
    setIsLoadingApplicationDetails(true);
    setApplicationDetailsError(null);

    try {
      const details = await getFreelancerApplicationDetails(application.proposalId);
      setSelectedApplication((prev) => {
        if (!prev || prev.proposalId !== application.proposalId) return prev;
        return {
          ...prev,
          ...details,
          clientAvatar: prev.clientAvatar,
        };
      });
    } catch (error) {
      setApplicationDetailsError(error instanceof Error ? error.message : 'We could not load application details right now. Please try again.');
    } finally {
      setIsLoadingApplicationDetails(false);
    }
  };

  const handleRemoveProject = (application: AppliedProject) => {
    setApplicationToRemove(application);
    setShowRemoveConfirmModal(true);
  };

  const confirmRemoveProject = async () => {
    if (!applicationToRemove || isApplyingAction) return;

    const statusKey = getApplicationStatusKey(applicationToRemove.proposalStatus);
    setIsApplyingAction(true);
    setActionProposalId(applicationToRemove.proposalId);
    setAppliedActionMessage(null);

    try {
      const message = statusKey === 'rejected'
        ? await deleteFreelancerApplication(applicationToRemove.proposalId)
        : await withdrawFreelancerApplication(applicationToRemove.proposalId);

      setAppliedProjects(prev => prev.filter(p => p.proposalId !== applicationToRemove.proposalId));
      setStats(prev => ({
        ...prev,
        pendingApplications: Math.max(0, prev.pendingApplications - 1),
      }));
      setShowRemoveConfirmModal(false);
      setApplicationToRemove(null);
      setAppliedActionMessage({ type: 'success', text: message || 'Success' });
    } catch (error) {
      setAppliedActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'We could not update this application right now. Please try again.',
      });
    } finally {
      setIsApplyingAction(false);
      setActionProposalId(null);
    }
  };

  const handleStartProject = (_project?: CompletedProject | AppliedProject) => {
    setActiveTab('active');
  };
  const handleEditMilestone = (milestone: ActiveMilestone) => {
    setEditingMilestone({ ...milestone });
    setShowEditMilestoneModal(true);
  };

  const handleSaveEditedMilestone = () => {
    if (!editingMilestone || !selectedActiveProject) return;
    setActiveProjects(prev =>
      prev.map(p =>
        p.projectId === selectedActiveProject.projectId
          ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === editingMilestone.id ? { ...editingMilestone, status: 'Pending' } : m
              ),
            }
          : p
      )
    );
    setShowEditMilestoneModal(false);
    setEditingMilestone(null);
  };

  const handleOpenSubmitDeliverables = (milestone: ActiveMilestone, project: ActiveProject) => {
    setSubmittingMilestone(milestone);
    setSelectedActiveProject(project);
    setSubmitNote('');
    setSubmitFile(null);
    setSubmitDeliverablesError(null);
    setShowSubmitDeliverablesModal(true);
  };

  const handleSubmitDeliverables = async () => {
    if (!submittingMilestone || !selectedActiveProject || isSubmittingDeliverables) return;

    const milestoneId = submittingMilestone.id;
    if (!Number.isFinite(milestoneId) || milestoneId <= 0) {
      setSubmitDeliverablesError('Invalid milestone. Please try again.');
      return;
    }

    if (!submitFile) {
      setSubmitDeliverablesError('Please attach a file before submitting.');
      return;
    }

    setIsSubmittingDeliverables(true);
    setSubmitDeliverablesError(null);

    try {
      const message = await submitFreelancerMilestone({
        milestoneId,
        note: submitNote.trim(),
        file: submitFile,
      });

      setAppliedActionMessage({ type: 'success', text: message || 'Submitted successfully.' });
      setShowSubmitDeliverablesModal(false);
      setSubmittingMilestone(null);
      setSubmitNote('');
      setSubmitFile(null);
      setActiveReloadKey(prev => prev + 1);
    } catch (error) {
      setSubmitDeliverablesError(error instanceof Error ? error.message : 'We could not submit deliverables right now. Please try again.');
    } finally {
      setIsSubmittingDeliverables(false);
    }
  };

  const handleAddMilestoneComment = (projectId: number, milestoneId: number) => {
    if (!milestoneComment.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    setActiveProjects(prev =>
      prev.map(p =>
        p.projectId === projectId
          ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === milestoneId
                  ? {
                      ...m,
                      comments: [...m.comments, { id: `mc-${Date.now()}`, author: 'You', authorRole: 'freelancer' as const, text: milestoneComment, date: today }],
                    }
                  : m
              ),
            }
          : p
      )
    );
    setMilestoneComment('');
  };

  const handleSubmitRating = () => {
    if (!selectedProject || rating === 0) return;
    setCompletedProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id ? { ...p, clientRating: rating } : p
      )
    );
    setShowRatingModal(false);
    setRating(0);
    setRatingComment('');
  };

  const handleAddComment = (projectId: number) => {
    if (!newComment.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    setActiveProjects(prev =>
      prev.map(p =>
        p.projectId === projectId
          ? { ...p, comments: [...p.comments, { id: `c-${Date.now()}`, author: 'You', text: newComment, date: today }] }
          : p
      )
    );
    setNewComment('');
  };

  const handleOpenReport = (name: string, avatar: string, projectId: number) => {
    setReportTarget({
      name,
      avatar,
      projectId: Number.isFinite(projectId) ? projectId : 0,
    });
    setShowReportModal(true);
  };

  const getMilestoneProgress = (milestones: ActiveMilestone[]) => {
    if (milestones.length === 0) return 0;
    const finished = milestones.filter(m => normalizeMilestoneStatus(m.status) === 'finished').length;
    return Math.round((finished / milestones.length) * 100);
  };

  return (
    <>
      {appliedActionMessage && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center gap-2 ${appliedActionMessage.type === 'success' ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'}`}>
          <i className={appliedActionMessage.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
          {appliedActionMessage.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" aria-busy={isLoadingSummary}>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('freelancerDashboard.activeProjects')}</span>
            <i className="ri-briefcase-line text-teal-400 text-xl"></i>
          </div>
          <div className="text-3xl font-bold text-white">{stats.activeProjects}</div>
          <div className="text-green-400 text-sm mt-1">{t('freelancerDashboard.inProgress')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('freelancerDashboard.totalEarnings')}</span>
            <i className="ri-money-dollar-circle-line text-green-400 text-xl"></i>
          </div>
          <div className="text-3xl font-bold text-white">${stats.totalEarnings}</div>
          <div className="text-white/60 text-sm mt-1">{t('freelancerDashboard.allTime')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('freelancerDashboard.pendingApplications')}</span>
            <i className="ri-file-list-line text-amber-400 text-xl"></i>
          </div>
          <div className="text-3xl font-bold text-white">{stats.pendingApplications}</div>
          <div className="text-white/60 text-sm mt-1">{t('freelancerDashboard.awaitingResponse')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">{t('freelancerDashboard.completed')}</span>
            <i className="ri-checkbox-circle-line text-green-400 text-xl"></i>
          </div>
          <div className="text-3xl font-bold text-white">{stats.completed}</div>
          <div className="text-white/60 text-sm mt-1">{t('freelancerDashboard.projectsDone')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 overflow-x-auto">
        {['applied', 'active', 'completed'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab ? 'text-teal-400 border-b-2 border-teal-400' : 'text-white/60 hover:text-white'}`}>
            {tab === 'applied' ? `${t('freelancerDashboard.appliedTab')} (${appliedProjects.length})` : tab === 'active' ? `${t('freelancerDashboard.activeTab')} (${activeProjects.length})` : `${t('freelancerDashboard.completedTab')} (${completedProjects.length})`}
          </button>
        ))}
      </div>

      {/* Applied Projects Tab */}
      {activeTab === 'applied' && (
        <div className="space-y-4">
          {isLoadingApplied && (
            <div className="text-center py-12">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-white/5 rounded-full">
                <i className="ri-loader-4-line text-4xl text-teal-400 animate-spin"></i>
              </div>
              <p className="text-white/60">{t('common.loading')}</p>
            </div>
          )}

          {!isLoadingApplied && appliedError && (
            <div className="text-center py-12">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-red-500/10 rounded-full">
                <i className="ri-error-warning-line text-4xl text-red-400"></i>
              </div>
              <p className="text-white/70 mb-4">{appliedError}</p>
              <button
                onClick={() => setAppliedReloadKey(prev => prev + 1)}
                className="px-5 py-2.5 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-refresh-line mr-2"></i>Retry
              </button>
            </div>
          )}

          {!isLoadingApplied && !appliedError && appliedProjects.map((application) => {
            const statusKey = getApplicationStatusKey(application.proposalStatus);
            const statusLabel = getApplicationStatusLabel(application.proposalStatus);
            const isAccepted = statusKey === 'accepted';
            const isRejected = statusKey === 'rejected';

            return (
              <div key={application.proposalId} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <img src={application.clientAvatar} alt={getTextValue(application.clientName)} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{getTextValue(application.projectTitle)}</h3>
                      <p className="text-white/60 text-sm">{t('freelancerDashboard.client')} {getTextValue(application.clientName)}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 ${getStatusColor(statusKey)} font-semibold rounded-lg whitespace-nowrap capitalize`}>{statusLabel}</span>
                </div>
                <p className="text-white/70 text-sm mb-4 line-clamp-2">{getTextValue(application.description)}</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-white/60 text-sm">{t('freelancerDashboard.totalBudget')}</span>
                    <p className="text-white font-bold text-lg">{formatCurrency(application.budget)}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">{t('freelancerDashboard.appliedDate')}</span>
                    <p className="text-white font-bold text-lg">{formatDate(application.appliedAt)}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">{t('freelancerDashboard.category')}</span>
                    <p className="text-white font-bold text-lg">{getTextValue(application.category)}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">{t('freelancerDashboard.projectDeadline')}</span>
                    <p className="text-white font-bold text-lg">{formatDate(application.projectCreatedAt)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleViewProjectDetails(application)}
                    disabled={isLoadingApplicationDetails && selectedApplication?.proposalId === application.proposalId}
                    className="px-4 py-2 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <i className="ri-eye-line mr-2"></i>{t('freelancerDashboard.viewDetails')}
                  </button>
                  {isAccepted && (
                    <button onClick={() => handleStartProject(application)} className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                      <i className="ri-play-line mr-2"></i>{t('freelancerDashboard.startProject')}
                    </button>
                  )}
                  {!isRejected && !isAccepted && (
                    <button onClick={() => handleRemoveProject(application)} className="px-4 py-2 bg-red-500/20 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-colors whitespace-nowrap cursor-pointer">
                      <i className="ri-close-circle-line mr-2"></i>{t('freelancerDashboard.withdrawApplication')}
                    </button>
                  )}
                  {isRejected && (
                    <button onClick={() => handleRemoveProject(application)} className="px-4 py-2 bg-white/5 text-white/60 font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer">
                      <i className="ri-delete-bin-line mr-2"></i>{t('freelancerDashboard.removeFromList')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!isLoadingApplied && !appliedError && appliedProjects.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-file-list-3-line text-6xl text-white/20 mb-4"></i>
              <p className="text-white/60">{t('freelancerDashboard.noApplied')}</p>
            </div>
          )}
        </div>
      )}

      {/* Active Projects Tab */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {isLoadingActive && (
            <div className="text-center py-12">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-white/5 rounded-full">
                <i className="ri-loader-4-line text-4xl text-teal-400 animate-spin"></i>
              </div>
              <p className="text-white/60">{t('common.loading')}</p>
            </div>
          )}

          {!isLoadingActive && activeError && (
            <div className="text-center py-12">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-red-500/10 rounded-full">
                <i className="ri-error-warning-line text-4xl text-red-400"></i>
              </div>
              <p className="text-white/70 mb-4">{activeError}</p>
              <button
                onClick={() => setActiveReloadKey(prev => prev + 1)}
                className="px-5 py-2.5 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-refresh-line mr-2"></i>Retry
              </button>
            </div>
          )}

          {!isLoadingActive && !activeError && activeProjects.map((project) => {
            const milestones = Array.isArray(project.milestones) ? project.milestones : [];
            const progressPercent = typeof project.progressPercent === 'number'
              ? Math.max(0, Math.min(100, project.progressPercent))
              : getMilestoneProgress(milestones);
            const remainingAmount = typeof project.remainingAmount === 'number'
              ? project.remainingAmount
              : (typeof project.totalBudget === 'number' && typeof project.totalPaid === 'number')
                ? project.totalBudget - project.totalPaid
                : null;

            return (
              <div key={project.projectId} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <img src={project.clientAvatar} alt={getTextValue(project.clientName)} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{getTextValue(project.title)}</h3>
                      <p className="text-white/60 text-sm">{t('freelancerDashboard.client')} {getTextValue(project.clientName)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenReport(getTextValue(project.clientName), project.clientAvatar, project.projectId)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors whitespace-nowrap cursor-pointer text-sm"
                    >
                      <i className="ri-flag-line mr-1"></i>{t('freelancerDashboard.report')}
                    </button>
                  </div>
                </div>

              {/* Budget & Progress */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <span className="text-white/60 text-sm">{t('freelancerDashboard.totalBudget')}</span>
                    <p className="text-white font-bold text-xl">{formatCurrency(project.totalBudget)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <span className="text-white/60 text-sm">{t('freelancerDashboard.totalPaid')}</span>
                    <p className="text-green-400 font-bold text-xl">{formatCurrency(project.totalPaid)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <span className="text-white/60 text-sm">{t('freelancerDashboard.remaining')}</span>
                    <p className="text-orange-400 font-bold text-xl">{formatCurrency(remainingAmount)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <span className="text-white/60 text-sm">{t('freelancerDashboard.progress')}</span>
                    <p className="text-teal-400 font-bold text-xl">{formatPercent(progressPercent)}</p>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                      <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </div>

              {/* Milestone Status Legend */}
              <div className="flex flex-wrap gap-3 mb-4">
                {['pending', 'approved', 'rejected', 'submitted', 'late', 'finished'].map(s => {
                  const cfg = getMilestoneStatusConfig(s);
                  return (
                    <div key={s} className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${cfg.bg} ${cfg.text}`} style={{ backgroundColor: 'currentColor' }}></span>
                      <span className="text-white/50">{cfg.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Milestones */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-4">{t('freelancerDashboard.milestones')}</h4>
                  <div className="space-y-3">
                    {milestones.map((milestone) => {
                      const statusKey = normalizeMilestoneStatus(milestone.status);
                      const cfg = getMilestoneStatusConfig(milestone.status);
                      const isExpanded = expandedMilestone === milestone.id;
                      return (
                        <div key={milestone.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        {/* Milestone Header */}
                        <div
                          className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                          onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-5 h-5 flex items-center justify-center rounded-full ${cfg.bg}`}>
                                  <i className={`${cfg.icon} text-xs ${cfg.text}`}></i>
                                </div>
                                <h5 className="text-white font-semibold">{getTextValue(milestone.title)}</h5>
                                <span className={`px-2.5 py-0.5 ${cfg.bg} ${cfg.text} text-xs font-semibold rounded-full whitespace-nowrap`}>
                                  {cfg.label}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm ml-8">
                                <span className="text-green-400 font-semibold">{formatCurrency(milestone.amount)}</span>
                                <span className="text-white/50"><i className="ri-time-line mr-1"></i>{formatDuration(milestone.duration, milestone.durationType)}</span>
                                <span className="text-white/50"><i className="ri-calendar-line mr-1"></i>{t('freelancerDashboard.dueLabel')} {formatDuration(milestone.duration, milestone.durationType)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Action buttons */}
                              {(statusKey === 'pending' || statusKey === 'rejected') && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedActiveProject(project); handleEditMilestone(milestone); }}
                                  className="px-3 py-1.5 bg-white/5 text-white text-xs font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <i className="ri-edit-line mr-1"></i>{t('freelancerDashboard.edit')}
                                </button>
                              )}
                              {(statusKey === 'approved' || statusKey === 'accepted') && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenSubmitDeliverables(milestone, project); }}
                                  className="px-3 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <i className="ri-upload-2-line mr-1"></i>{t('freelancerDashboard.submitDeliverables')}
                                </button>
                              )}
                              <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-white/40`}></i>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t border-white/10 p-4 space-y-4">
                            <div>
                              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{t('freelancerDashboard.deliverables')}</span>
                              <p className="text-white/80 text-sm mt-1 break-words">{getTextValue(milestone.description)}</p>
                            </div>

                            {Array.isArray(milestone.deliverables) && milestone.deliverables.length > 0 && (
                              <div>
                                <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Files</span>
                                <div className="space-y-2 mt-2">
                                  {milestone.deliverables.map((deliverable) => (
                                    deliverable.fileUrl ? (
                                      <a
                                        key={deliverable.id}
                                        href={`https://nextcoder.runasp.net/${deliverable.fileUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between gap-3 px-3 py-2 bg-teal-500/10 text-teal-400 text-xs rounded-lg hover:bg-teal-500/20 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <i className="ri-attachment-line"></i>
                                          <span className="truncate">{deliverable.note?.trim() || 'Attachment'}</span>
                                        </div>
                                        <span className="text-white/50 whitespace-nowrap">{formatDate(deliverable.uploadedAt)}</span>
                                      </a>
                                    ) : (
                                      <span key={deliverable.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-white/5 text-white/50 text-xs rounded-lg">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <i className="ri-attachment-line"></i>
                                          <span className="truncate">{deliverable.note?.trim() || 'Attachment'}</span>
                                        </div>
                                        <span className="text-white/40 whitespace-nowrap">{formatDate(deliverable.uploadedAt)}</span>
                                      </span>
                                    )
                                  ))}
                                </div>
                              </div>
                            )}

                            {milestone.clientComment && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <i className="ri-close-circle-line text-red-400 text-sm"></i>
                                  <span className="text-red-400 text-xs font-semibold">{t('freelancerDashboard.rejectionFeedback')}</span>
                                </div>
                                <p className="text-red-300/80 text-sm">{milestone.clientComment}</p>
                              </div>
                            )}

                            {statusKey === 'late' && (
                              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <i className="ri-alarm-warning-line text-orange-400 text-sm"></i>
                                  <span className="text-orange-400 text-sm font-medium">{t('freelancerDashboard.pastDeadline')} ({formatDuration(milestone.duration, milestone.durationType)})</span>
                                </div>
                              </div>
                            )}

                            {/* Milestone Comments */}
                            <div>
                              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{t('freelancerDashboard.discussion')}</span>
                              {milestone.comments.length > 0 ? (
                                <div className="space-y-2 mt-2">
                                  {milestone.comments.map(c => (
                                    <div key={c.id} className="flex gap-3 p-2.5 bg-white/[0.03] rounded-lg">
                                      <div className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${c.authorRole === 'client' ? 'bg-cyan-500/20' : 'bg-teal-500/20'}`}>
                                        <i className={`ri-user-line text-xs ${c.authorRole === 'client' ? 'text-cyan-400' : 'text-teal-400'}`}></i>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-white text-xs font-semibold">{c.author}</span>
                                          <span className="text-white/30 text-xs">{c.date}</span>
                                        </div>
                                        <p className="text-white/70 text-sm">{c.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-white/30 text-sm mt-2">{t('common.noCommentsYet')}</p>
                              )}
                              {statusKey !== 'finished' && (
                                <div className="flex gap-2 mt-3">
                                  <input
                                    type="text"
                                    value={expandedMilestone === milestone.id ? milestoneComment : ''}
                                    onChange={(e) => setMilestoneComment(e.target.value)}
                                    placeholder={t('common.addComment')}
                                    className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 ${
                                      isLightMode
                                        ? 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-400'
                                        : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleAddMilestoneComment(project.projectId, milestone.id); }}
                                    className="px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
                                  >
                                    {t('common.send')}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Project Comments */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">{t('freelancerDashboard.projectComments')}</h4>
                  <div className="space-y-3 mb-4">
                    {project.comments.map((comment) => (
                      <div key={comment.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-semibold">{getTextValue(comment.author)}</span>
                          <span className="text-white/60 text-sm">{getTextValue(comment.date)}</span>
                        </div>
                        <p className="text-white/80 break-words">{getTextValue(comment.text)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t('common.addComment')}
                      className={`flex-1 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                        isLightMode
                          ? 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                          : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                      }`}
                    />
                    <button onClick={() => handleAddComment(project.projectId)} className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                      {t('common.send')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!isLoadingActive && !activeError && activeProjects.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-folder-open-line text-6xl text-white/20 mb-4"></i>
              <p className="text-white/60">{t('freelancerDashboard.noApplied')}</p>
            </div>
          )}
        </div>
      )}

      {/* Completed Projects Tab */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          {completedProjects.map((project) => (
            <div key={project.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img src={project.clientAvatar} alt={project.client} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-white/60 text-sm">{t('freelancerDashboard.client')} {project.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenReport(project.client, project.clientAvatar, Number(project.id))}
                    className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors whitespace-nowrap cursor-pointer text-sm"
                  >
                    <i className="ri-flag-line mr-1"></i>{t('freelancerDashboard.report')}
                  </button>
                  <span className="px-4 py-2 bg-green-500/20 text-green-400 font-semibold rounded-lg whitespace-nowrap">
                    {t('freelancerDashboard.completed')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.totalEarned')}</span>
                  <p className="text-green-400 font-bold text-xl">${project.totalPaid}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.milestonesCompleted')}</span>
                  <p className="text-white font-bold text-xl">{project.milestones.length}</p>
                </div>
              </div>

              {/* Ratings - only show after all milestones finished */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-white/60 text-sm mb-2 block">{t('freelancerDashboard.myRatingForClient')}</span>
                  {project.clientRating ? (
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`ri-star-fill text-xl ${i < project.clientRating! ? 'text-yellow-400' : 'text-white/20'}`}></i>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSelectedProject(project); setShowRatingModal(true); }}
                      className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {t('freelancerDashboard.rateClient')}
                    </button>
                  )}
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-white/60 text-sm mb-2 block">{t('freelancerDashboard.ratingFromClient')}</span>
                  {project.myRating ? (
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`ri-star-fill text-xl ${i < project.myRating! ? 'text-yellow-400' : 'text-white/20'}`}></i>
                      ))}
                    </div>
                  ) : (
                    <span className="text-white/40 text-sm">{t('common.awaitingRating')}</span>
                  )}
                </div>
              </div>

              {project.comments.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-white mb-3">{t('freelancerDashboard.projectComments')}</h4>
                  <div className="space-y-3">
                    {project.comments.map((comment) => (
                      <div key={comment.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-semibold">{comment.author}</span>
                          <span className="text-white/60 text-sm">{comment.date}</span>
                        </div>
                        <p className="text-white/80">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {showProjectDetailModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowProjectDetailModal(false);
              setSelectedApplication(null);
              setApplicationDetailsError(null);
            }}
          ></div>
          <div className={`relative rounded-2xl border p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto ${
            isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'
          }`}>
            <button
              onClick={() => {
                setShowProjectDetailModal(false);
                setSelectedApplication(null);
                setApplicationDetailsError(null);
              }}
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            {(isLoadingApplicationDetails || applicationDetailsError) && (
              <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${applicationDetailsError ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-teal-500/10 border-teal-500/30 text-teal-300'}`}>
                {isLoadingApplicationDetails ? t('common.loading') : applicationDetailsError}
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <img src={selectedApplication.clientAvatar} alt={getTextValue(selectedApplication.clientName)} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{getTextValue(selectedApplication.projectTitle)}</h3>
                <p className={isLightMode ? 'text-gray-500' : 'text-white/60'}>by {getTextValue(selectedApplication.clientName)}</p>
              </div>
            </div>
            <div className="mb-6">
              <span className={`px-4 py-2 ${getStatusColor(selectedApplicationStatusKey)} font-semibold rounded-lg whitespace-nowrap capitalize inline-block`}>
                {selectedApplicationStatusLabel}
              </span>
            </div>
            <div className="mb-6">
              <h4 className={`text-lg font-semibold mb-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('freelancerDashboard.projectDescription')}</h4>
              <p className={`leading-relaxed break-words ${isLightMode ? 'text-gray-600' : 'text-white/70'}`}>{getTextValue(selectedApplication.description)}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-sm block mb-1 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('freelancerDashboard.totalBudget')}</span>
                <p className={`font-bold text-xl ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{formatCurrency(selectedApplication.budget)}</p>
              </div>
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-sm block mb-1 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('freelancerDashboard.category')}</span>
                <p className={`font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{getTextValue(selectedApplication.category)}</p>
              </div>
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-sm block mb-1 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('freelancerDashboard.projectDeadline')}</span>
                <p className={`font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{formatDate(selectedApplication.projectCreatedAt)}</p>
              </div>
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-sm block mb-1 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('freelancerDashboard.appliedDate')}</span>
                <p className={`font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{formatDate(selectedApplication.appliedAt)}</p>
              </div>
            </div>
            {Array.isArray(selectedApplication.skills) && selectedApplication.skills.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-lg font-semibold mb-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('freelancerDashboard.requiredSkills')}</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.skills.map((skill, index) => (
                    <span key={`${skill}-${index}`} className="px-3 py-1 bg-teal-500/20 text-teal-600 text-sm font-medium rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            <div className={`flex gap-3 pt-4 border-t ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
              <button
                onClick={() => {
                  setShowProjectDetailModal(false);
                  setSelectedApplication(null);
                  setApplicationDetailsError(null);
                }}
                className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                {t('common.close')}
              </button>
              {selectedApplicationStatusKey === 'accepted' && (
                <button onClick={() => { setShowProjectDetailModal(false); handleStartProject(selectedApplication); }} className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                  <i className="ri-play-line mr-2"></i>{t('freelancerDashboard.startProject')}
                </button>
              )}
              {selectedApplicationStatusKey !== 'rejected' && selectedApplicationStatusKey !== 'accepted' && (
                <button onClick={() => { setShowProjectDetailModal(false); handleRemoveProject(selectedApplication); }} className="flex-1 px-5 py-3 bg-red-500/20 text-red-500 font-semibold rounded-lg hover:bg-red-500/30 transition-colors whitespace-nowrap cursor-pointer">
                  {t('freelancerDashboard.withdrawApplication')}
                </button>
              )}
              {selectedApplicationStatusKey === 'rejected' && (
                <button onClick={() => { setShowProjectDetailModal(false); handleRemoveProject(selectedApplication); }} className="flex-1 px-5 py-3 bg-red-500/20 text-red-500 font-semibold rounded-lg hover:bg-red-500/30 transition-colors whitespace-nowrap cursor-pointer">
                  {t('freelancerDashboard.removeFromList')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirmModal && applicationToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRemoveConfirmModal(false)}></div>
          <div className={`relative rounded-2xl border p-8 w-full max-w-md ${
            isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'
          }`}>
            <button onClick={() => setShowRemoveConfirmModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center bg-red-500/20 rounded-full mx-auto mb-4">
                <i className="ri-error-warning-line text-3xl text-red-400"></i>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                {getApplicationStatusKey(applicationToRemove.proposalStatus) === 'rejected'
                  ? t('freelancerDashboard.removeConfirm')
                  : t('freelancerDashboard.withdrawConfirm')}
              </h3>
              <p className={isLightMode ? 'text-gray-500' : 'text-white/60'}>
                {getApplicationStatusKey(applicationToRemove.proposalStatus) === 'rejected'
                  ? `${t('freelancerDashboard.removeConfirmText')} "${getTextValue(applicationToRemove.projectTitle)}" ${t('freelancerDashboard.fromYourList')}`
                  : `${t('freelancerDashboard.withdrawConfirmText')} "${getTextValue(applicationToRemove.projectTitle)}"?`}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRemoveConfirmModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmRemoveProject}
                disabled={isApplyingAction && actionProposalId === applicationToRemove.proposalId}
                className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isApplyingAction && actionProposalId === applicationToRemove.proposalId
                  ? t('common.loading')
                  : getApplicationStatusKey(applicationToRemove.proposalStatus) === 'rejected'
                  ? t('common.delete')
                  : t('freelancerDashboard.withdrawApplication')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Milestone Modal */}
      {showEditMilestoneModal && editingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditMilestoneModal(false)}></div>
          <div className={`relative rounded-2xl border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'
          }`}>
            <button onClick={() => setShowEditMilestoneModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className={`text-2xl font-bold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('freelancerDashboard.editMilestone')}</h3>
            <p className={`text-sm mb-6 ${isLightMode ? 'text-gray-500' : 'text-white/50'}`}>
              {normalizeMilestoneStatus(editingMilestone.status) === 'rejected'
                ? 'This milestone was rejected. Update it and resubmit for approval.'
                : 'Changes will require client approval.'}
            </p>

            {editingMilestone.clientComment && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-close-circle-line text-red-400 text-sm"></i>
                  <span className="text-red-400 text-xs font-semibold">{t('freelancerDashboard.clientFeedback')}</span>
                </div>
                <p className="text-red-500 text-sm">{editingMilestone.clientComment}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.milestoneTitle')}</label>
                <input
                  type="text"
                  value={editingMilestone.title ?? ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                    isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>
              <div>
                <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.deliverables_label')}</label>
                <textarea
                  value={editingMilestone.description ?? ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 resize-none ${
                    isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800' : 'bg-white/5 border-white/10 text-white'
                  }`}
                ></textarea>
                <p className="text-gray-500 text-xs mt-1 text-right">{(editingMilestone.description ?? '').length}/500</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.budget')}</label>
                  <input
                    type="number"
                    value={editingMilestone.amount ?? ''}
                    onChange={(e) => {
                      const nextValue = e.target.value.trim();
                      setEditingMilestone({
                        ...editingMilestone,
                        amount: nextValue ? Number(nextValue) : null,
                      });
                    }}
                    min="0"
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                      isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.duration')}</label>
                  <input
                    type="number"
                    value={editingMilestone.duration ?? ''}
                    onChange={(e) => {
                      const nextValue = e.target.value.trim();
                      setEditingMilestone({
                        ...editingMilestone,
                        duration: nextValue ? Number(nextValue) : null,
                      });
                    }}
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                      isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.deadline')}</label>
                <input
                  type="date"
                    value={editingMilestone.deadline ?? ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, deadline: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                    isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowEditMilestoneModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                  {t('common.cancel')}
                </button>
                <button onClick={handleSaveEditedMilestone} className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                  {t('freelancerDashboard.resubmitForApproval')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Deliverables Modal */}
      {showSubmitDeliverablesModal && submittingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubmitDeliverablesModal(false)}></div>
          <div className={`relative rounded-2xl border p-8 w-full max-w-2xl ${
            isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'
          }`}>
            <button onClick={() => setShowSubmitDeliverablesModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-500/20 mx-auto mb-4">
                <i className="ri-upload-2-line text-3xl text-teal-400"></i>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('freelancerDashboard.submitDeliverablesTitle')}</h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-white/50'}`}>{t('freelancerDashboard.submitDeliverablesSubtitle')}</p>
            </div>

            <div className={`rounded-lg p-4 mb-6 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
              <h4 className={`font-semibold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{getTextValue(submittingMilestone.title)}</h4>
              <p className={`text-sm mb-2 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{getTextValue(submittingMilestone.description)}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-500 font-semibold">{formatCurrency(submittingMilestone.amount)}</span>
                <span className={isLightMode ? 'text-gray-400' : 'text-white/50'}>{t('freelancerDashboard.dueLabel')} {formatDuration(submittingMilestone.duration, submittingMilestone.durationType)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.submissionNote')}</label>
              <textarea
                value={submitNote}
                onChange={(e) => setSubmitNote(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={t('freelancerDashboard.submissionNotePlaceholder')}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 resize-none ${
                  isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                }`}
              ></textarea>
              <p className="text-gray-500 text-xs mt-1 text-right">{submitNote.length}/500</p>
            </div>

            <div className="mb-6">
              <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>File</label>
              <div className={`border-2 border-dashed ${isLightMode ? 'border-gray-300 hover:border-teal-500/70' : 'border-white/20 hover:border-teal-500/50'} rounded-xl p-4 text-center transition-colors`}>
                <input
                  type="file"
                  onChange={(e) => {
                    setSubmitFile(e.target.files?.[0] ?? null);
                    setSubmitDeliverablesError(null);
                  }}
                  className="hidden"
                  id="milestone-deliverable-upload"
                  accept="image/*,.pdf,.doc,.docx,.zip"
                />
                <label htmlFor="milestone-deliverable-upload" className="cursor-pointer">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} mx-auto mb-3`}>
                    <i className={`ri-upload-cloud-line text-2xl ${isLightMode ? 'text-gray-500' : 'text-white/50'}`}></i>
                  </div>
                  <p className={`${isLightMode ? 'text-gray-500' : 'text-white/50'} text-sm mb-1`}>Click to upload</p>
                  <p className={`${isLightMode ? 'text-gray-400' : 'text-white/40'} text-xs`}>PDF, DOC, images, or ZIP</p>
                </label>
              </div>

              {submitFile && (
                <div className={`mt-3 flex items-center justify-between p-2 ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} rounded-lg`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <i className="ri-file-line text-teal-400"></i>
                    <span className={`${isLightMode ? 'text-gray-900' : 'text-white'} text-sm truncate`}>{submitFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitFile(null)}
                    className={`${isLightMode ? 'text-gray-500' : 'text-white/60'} hover:text-red-400 cursor-pointer flex-shrink-0`}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              )}
            </div>

            {submitDeliverablesError && (
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <i className="ri-alert-line text-red-400 text-lg flex-shrink-0 mt-0.5"></i>
                <p className="text-red-500 text-xs">{submitDeliverablesError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowSubmitDeliverablesModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmitDeliverables}
                disabled={isSubmittingDeliverables}
                className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmittingDeliverables ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>{t('common.loading')}
                  </>
                ) : (
                  <>
                    <i className="ri-upload-2-line mr-2"></i>{t('freelancerDashboard.submit')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRatingModal(false)}></div>
          <div className={`relative rounded-2xl border p-8 w-full max-w-md ${
            isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'
          }`}>
            <button onClick={() => setShowRatingModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className={`text-2xl font-bold mb-6 text-center ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('freelancerDashboard.rateClientTitle')}</h3>
            <div className="text-center mb-6">
              <p className={`mb-4 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('freelancerDashboard.rateClientQuestion')} {selectedProject.client}?</p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="cursor-pointer">
                    <i className={`ri-star-fill text-4xl ${star <= rating ? 'text-yellow-400' : isLightMode ? 'text-gray-200' : 'text-white/20'}`}></i>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.commentOptional')}</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder={t('freelancerDashboard.shareExperience')}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 resize-none ${
                  isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                }`}
              ></textarea>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRatingModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('freelancerDashboard.submitRating')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} targetName={reportTarget.name} targetAvatar={reportTarget.avatar} projectId={reportTarget.projectId} reporterRole="freelancer" />
    </>
  );
};

export default FreelancerDashboard;
