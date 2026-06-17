import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReportModal from '../../../components/feature/ReportModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  getDashboardSummary,
  getPostedProjects,
  getProjectProposals,
  acceptProposal,
  deleteProject,
  getActiveProjects,
  approveMilestone,
  requestMilestoneChanges,
  getCompletedProjects,
  rateFreelancer,
  postProjectComment,
  type DashboardSummary,
  type PostedProject,
  type Proposal,
  type ActiveProject,
  type ActiveMilestone,
  type CompletedProject,
} from '../../../services/clientDashboard.service';

const ClientDashboard = () => {
  const { isLightMode } = useTheme();
  const { t } = useTranslation();

  // ─── Theme helpers ─────────────────────────────────────────────────────────
  const card = isLightMode
    ? 'bg-white border border-gray-200'
    : 'bg-white/5 backdrop-blur-sm border border-white/10';
  const innerCard = isLightMode ? 'bg-gray-50 border border-gray-100' : 'bg-white/5';
  const modalBg = isLightMode ? 'bg-white border border-gray-200' : 'bg-[#1e2442] border border-white/10';
  const textPrimary = isLightMode ? 'text-gray-900' : 'text-white';
  const textSec = isLightMode ? 'text-gray-500' : 'text-white/60';
  const textMuted = isLightMode ? 'text-gray-400' : 'text-white/40';
  const divider = isLightMode ? 'border-gray-200' : 'border-white/10';
  const inputCls = isLightMode
    ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500'
    : 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-teal-500';
  const cancelBtn = isLightMode
    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    : 'bg-white/5 text-white hover:bg-white/10';
  const closeBtn = isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white';
  const milestoneCard = isLightMode
    ? 'bg-white border border-gray-200'
    : 'bg-white/5 border border-white/10';
  const commentCard = isLightMode ? 'bg-gray-50' : 'bg-white/5';
  const statCard = isLightMode
    ? 'bg-white border border-gray-200'
    : 'bg-white/5 backdrop-blur-sm border border-white/10';
  const tabBorder = isLightMode ? 'border-gray-200' : 'border-white/10';
  const milestoneHover = isLightMode ? 'hover:bg-gray-50' : 'hover:bg-white/[0.02]';
  const labelSmall = isLightMode ? 'text-gray-400' : 'text-white/50';
  const textLight = isLightMode ? 'text-gray-700' : 'text-white/80';
  const milestoneMiniCard = isLightMode ? 'bg-gray-50 border border-gray-100' : 'bg-white/5';

  // ─── Remote data ───────────────────────────────────────────────────────────
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [postedProjects, setPostedProjects] = useState<PostedProject[]>([]);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // ─── Loading / error ───────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('posted');
  const [selectedPostedProject, setSelectedPostedProject] = useState<PostedProject | null>(null);
  const [selectedActiveProject, setSelectedActiveProject] = useState<ActiveProject | null>(null);
  const [selectedCompletedProject, setSelectedCompletedProject] = useState<CompletedProject | null>(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showMilestoneReviewModal, setShowMilestoneReviewModal] = useState(false);
  const [showSubmittedReviewModal, setShowSubmittedReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ name: string; avatar: string; projectId: number }>({ name: '', avatar: '', projectId: 0 });
  const [reviewingMilestone, setReviewingMilestone] = useState<ActiveMilestone | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<PostedProject | null>(null);
  const generalAvatar = "https://readdy.ai/api/search-image?query=professional%20default%20user%20avatar%20icon%20simple%20clean%20minimal%20design%20on%20dark%20background&width=100&height=100&seq=avatar1&orientation=squarish"
  // ─── Fetch all data on mount ───────────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setPageError(null);
      try {
        const [summaryData, posted, active, completed] = await Promise.all([
          getDashboardSummary(),
          getPostedProjects(),
          getActiveProjects(),
          getCompletedProjects(),
        ]);
        setSummary(summaryData);
        setPostedProjects(posted);
        setActiveProjects(active);
        setCompletedProjects(completed);
      } catch (e) {
        setPageError(e instanceof Error ? e.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // ─── Stats (driven by API summary) ────────────────────────────────────────
  const stats = {
    activeProjects: summary?.totalActiveProjects ?? 0,
    totalSpent: summary?.totalMoneySpent ?? 0,
    openPositions: summary?.totalOpenProjects ?? 0,
    completed: summary?.totalCompletedProjects ?? 0,
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const normalizeMilestoneStatus = (status: string) =>
    status?.toString().trim().replace(/[\s_-]/g, '').toLowerCase();

  const getMilestoneStatusConfig = (status: string) => {
    const key = normalizeMilestoneStatus(status);
    const config: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      pending: { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: 'ri-alarm-warning-line', label: t('Pending') },
      inprogress: { bg: 'bg-orange-500/15', text: 'text-orange-400', icon: 'ri-alarm-warning-line', label: t('In progress') },
      submitted: { bg: 'bg-teal-500/15', text: 'text-teal-400', icon: 'ri-upload-2-line', label: t('clientDashboard.submittedStatus') },
      accepted: { bg: 'bg-green-500/15', text: 'text-green-400', icon: 'ri-check-line', label: t('Accepted') },
    };
    return config[key] || { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: 'ri-question-line', label: status };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-teal-500/20 text-teal-400',
      'in-progress': 'bg-cyan-500/20 text-cyan-400',
      completed: 'bg-green-500/20 text-green-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const formatDate = (value?: string | null) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDurationLabel = (duration?: number | null, durationType?: string | null) => {
    if (typeof duration !== 'number' || !Number.isFinite(duration)) return 'N/A';
    const unit = durationType?.trim() || '';
    return unit ? `${duration} ${unit}` : `${duration}`;
  };

  const durationToDays = (duration?: number | null, durationType?: string | null) => {
    if (typeof duration !== 'number' || !Number.isFinite(duration)) return 0;
    const key = durationType?.trim().toLowerCase();
    if (key === 'week' || key === 'weeks') return duration * 7;
    if (key === 'month' || key === 'months') return duration * 30;
    if (key === 'year' || key === 'years') return duration * 365;
    return duration;
  };

  const getEstimatedProposalDays = (
    milestones: Array<{ duration?: number | null; durationType?: string | null }>
  ) => milestones.reduce((sum, m) => sum + durationToDays(m.duration, m.durationType), 0);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  /** Open the applicants modal and lazily load proposals for the project. */
  const handleViewApplicants = async (project: PostedProject) => {
    setSelectedPostedProject(project);
    setProposals([]);
    setShowApplicantsModal(true);
    setProposalsLoading(true);
    try {
      const data = await getProjectProposals(project.id);
      setProposals(data);
    } catch {
      setProposals([]);
    } finally {
      setProposalsLoading(false);
    }
  };

  /** Accept a freelancer proposal. */
/** Accept a freelancer proposal. */
const handleAcceptProposal = async (proposalId: number) => {
  if (!selectedPostedProject) return;
  setActionLoading(true);
  try {
    await acceptProposal(selectedPostedProject.id, proposalId);
    setShowApplicantsModal(false);
    // Refresh both lists in parallel so the new active project appears immediately
    const [updatedPosted, updatedActive] = await Promise.all([
      getPostedProjects(),
      getActiveProjects(),
    ]);
    setPostedProjects(updatedPosted);
    setActiveProjects(updatedActive);
    setActiveTab('active');
  } catch (e) {
    setActionError(e instanceof Error ? e.message : 'Failed to accept proposal');
  } finally {
    setActionLoading(false);
  }
};

  /** Delete (remove) a posted project. */
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setActionLoading(true);
    try {
      await deleteProject(projectToDelete.id);
      setPostedProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete project');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Approve a pending milestone plan.
   * Called from the Payment Confirmation modal (after user reviews and confirms payment).
   * Calls /milestones/approve, then optimistically flips status to 'Accepted'.
   */
  const handleApproveMilestone = async () => {
    if (!reviewingMilestone || !selectedActiveProject) return;
    setActionLoading(true);
    try {
      await approveMilestone(reviewingMilestone.id, rejectionComment);
      setActiveProjects(prev =>
        prev.map(p =>
          p.id === selectedActiveProject.id
            ? { ...p, milestones: p.milestones.map(m => m.id === reviewingMilestone.id ? { ...m, status: 'Accepted' } : m) }
            : p
        )
      );
      setShowPaymentModal(false);
      setReviewingMilestone(null);
      setRejectionComment('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to approve milestone');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Reject a pending milestone plan and store the client's comment.
   * Calls request-changes; optimistically flips status to 'rejected'.
   */
  const handleRejectMilestone = async () => {
    if (!rejectionComment.trim() || !reviewingMilestone || !selectedActiveProject) return;
    setActionLoading(true);
    try {
      await requestMilestoneChanges(reviewingMilestone.id, rejectionComment);
      setActiveProjects(prev =>
        prev.map(p =>
          p.id === selectedActiveProject.id
            ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === reviewingMilestone.id
                  ? { ...m, status: 'Rejected', clientComment: rejectionComment }
                  : m
              ),
            }
            : p
        )
      );
      setShowMilestoneReviewModal(false);
      setReviewingMilestone(null);
      setRejectionComment('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to reject milestone');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Approve a submitted deliverable.
   * Calls /milestones/approve, then advances to the payment confirmation modal.
   */
  const handleApproveSubmission = async () => {
    if (!reviewingMilestone || !selectedActiveProject) return;
    setActionLoading(true);
    try {
      await approveMilestone(reviewingMilestone.id, reviewingMilestone.clientComment ?? '');
      setShowSubmittedReviewModal(false);
      setShowPaymentModal(true);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to approve submission');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Request changes on a submitted deliverable.
   * Calls request-changes; optimistically reverts status to 'approved' (back to working).
   */
  const handleRejectSubmission = async () => {
    if (!rejectionComment.trim() || !reviewingMilestone || !selectedActiveProject) return;
    setActionLoading(true);
    try {
      await requestMilestoneChanges(reviewingMilestone.id, rejectionComment);
      setActiveProjects(prev =>
        prev.map(p =>
          p.id === selectedActiveProject.id
            ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === reviewingMilestone.id
                  ? { ...m, status: 'Rejected', submissionNote: null }
                  : m
              ),
            }
            : p
        )
      );
      setShowSubmittedReviewModal(false);
      setReviewingMilestone(null);
      setRejectionComment('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to request revision');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Mark a milestone as paid / finished (local optimistic update).
   * The actual payment was already confirmed server-side in handleApproveSubmission.
   */
  const handlePayMilestone = () => {
    if (!reviewingMilestone || !selectedActiveProject) return;
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === selectedActiveProject.id
          ? {
            ...p,
            totalPaid: p.totalPaid + reviewingMilestone.amount,
            remainingAmount: p.remainingAmount - reviewingMilestone.amount,
            milestones: p.milestones.map(m =>
              m.id === reviewingMilestone.id ? { ...m, status: 'Accepted' } : m
            ),
          }
          : p
      )
    );
    setShowPaymentModal(false);
    setReviewingMilestone(null);
  };

  /**
   * Rate the freelancer after project completion.
   * NOTE: rateFreelancer() expects a freelancerId; CompletedProject does not expose one,
   * so we pass project.id as a surrogate. Update the backend to return freelancerId if needed.
   */
  const handleSubmitRating = async () => {
    if (!selectedCompletedProject || rating === 0) return;
    setActionLoading(true);
    try {
      await rateFreelancer(selectedCompletedProject.id, rating, ratingComment);
      setCompletedProjects(prev =>
        prev.map(p =>
          p.id === selectedCompletedProject.id
            ? { ...p, freelancerRatingGivenByClient: rating, isRated: true }
            : p
        )
      );
      setShowRatingModal(false);
      setRating(0);
      setRatingComment('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to submit rating');
    } finally {
      setActionLoading(false);
    }
  };

  /** Post a comment on an active project (optimistic). */
  const handleAddComment = async (projectId: number) => {
    if (!newComment.trim()) return;
    try {
      await postProjectComment(projectId, newComment);
      setActiveProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c-${Date.now()}`,
                  content: newComment,
                  senderName: 'You',
                  senderImage: '',
                  createdAt: new Date().toISOString().split('T')[0],
                },
              ],
            }
            : p
        )
      );
      setNewComment('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to post comment');
    }
  };

  const handleOpenReport = (name: string, avatar: string, projectId: number) => {
    setReportTarget({ name, avatar, projectId });
    setShowReportModal(true);
  };

  // ─── Full-page loading / error states ─────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-teal-400 mb-4 block"></i>
          <p className={textSec}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <i className="ri-error-warning-line text-4xl text-red-400 mb-4 block"></i>
          <p className="text-red-400 mb-4">{pageError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Action error toast */}
      {actionError && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg shadow-xl">
          <i className="ri-error-warning-line"></i>
          <span className="text-sm">{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-2">
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: t('clientDashboard.activeProjects'), value: stats.activeProjects, sub: t('clientDashboard.inProgress'), icon: 'ri-folder-line', color: 'text-teal-400' },
          { label: t('clientDashboard.totalSpent'), value: `$${stats.totalSpent}`, sub: t('clientDashboard.allTime'), icon: 'ri-money-dollar-circle-line', color: 'text-orange-400' },
          { label: t('clientDashboard.openPositions'), value: stats.openPositions, sub: t('clientDashboard.hiring'), icon: 'ri-briefcase-line', color: 'text-teal-400' },
          { label: t('clientDashboard.completed'), value: stats.completed, sub: t('clientDashboard.projectsDone'), icon: 'ri-checkbox-circle-line', color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className={`${statCard} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${textSec} text-sm`}>{s.label}</span>
              <i className={`${s.icon} ${s.color} text-xl`}></i>
            </div>
            <div className={`text-3xl font-bold ${textPrimary}`}>{s.value}</div>
            <div className={`${textSec} text-sm mt-1`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 mb-6 border-b ${tabBorder} overflow-x-auto`}>
        {['posted', 'active', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab
              ? 'text-teal-400 border-b-2 border-teal-400'
              : `${textSec} hover:text-teal-500`
              }`}
          >
            {tab === 'posted'
              ? `${t('clientDashboard.postedProjectsTab')} (${postedProjects.length})`
              : tab === 'active'
                ? `${t('clientDashboard.activeTab')} (${activeProjects.length})`
                : `${t('clientDashboard.completedTab')} (${completedProjects.length})`}
          </button>
        ))}
      </div>

      {/* ── Posted Projects Tab ──────────────────────────────────────────────── */}
      {activeTab === 'posted' && (
        <div className="space-y-4">
          {postedProjects.map((project) => (
            <div key={project.id} className={`${card} rounded-xl p-6`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{project.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-4 py-2 ${getStatusColor(project.status)} font-semibold rounded-lg whitespace-nowrap capitalize`}>
                    {project.status}
                  </span>
                  <button
                    onClick={() => setProjectToDelete(project)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer flex-shrink-0"
                    title={t('clientDashboard.removeProject')}
                  >
                    <i className="ri-delete-bin-line text-base"></i>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className={`${textSec} text-sm`}>{t('clientDashboard.budget')}</span>
                  <p className={`${textPrimary} font-bold text-lg`}>${project.budget}</p>
                </div>
                <div>
                  {/* Service returns createdAt; mapped as posted date */}
                  <span className={`${textSec} text-sm`}>{t('clientDashboard.postedDate')}</span>
                  <p className={`${textPrimary} font-bold text-lg`}>{formatDate(project.createdAt)}</p>
                </div>
                <div>
                  {/* proposalCount replaces applicants array length */}
                  <span className={`${textSec} text-sm`}>Freelancers</span>
                  <p className={`${textPrimary} font-bold text-lg`}>{project.proposalCount}</p>
                </div>
              </div>
              <button
                onClick={() => handleViewApplicants(project)}
                className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                View Freelancers ({project.proposalCount})
              </button>
            </div>
          ))}
          {postedProjects.length === 0 && (
            <div className={`text-center py-12 border-2 border-dashed ${isLightMode ? 'border-gray-200' : 'border-white/20'} rounded-lg`}>
              <i className={`ri-folder-open-line text-5xl ${textMuted} mb-4 block`}></i>
              <p className={textMuted}>{t('clientDashboard.noPostedProjects')}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Active Projects Tab ──────────────────────────────────────────────── */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activeProjects.map((project) => (
            <div key={project.id} className={`${card} rounded-xl p-6`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  {project.freelancerImageUrl && (
                    <img
                      src={`https://nextcoder.runasp.net/${project.freelancerImageUrl}`}
                      alt={project.freelancerName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  {!project.freelancerImageUrl && (
                    <img
                      src={generalAvatar}
                      alt={project.freelancerName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary} mb-1`}>{project.title}</h3>
                    <p className={`${textSec} text-sm`}>
                      {t('clientDashboard.freelancer')} {project.freelancerName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenReport(project.freelancerName, project.freelancerImageUrl, project.id)}
                  className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors whitespace-nowrap cursor-pointer text-sm"
                >
                  <i className="ri-flag-line mr-1"></i>{t('clientDashboard.report')}
                </button>
              </div>

              {/* Budget & Progress */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: t('clientDashboard.totalBudget'), value: `$${project.totalBudget}`, cls: textPrimary },
                  { label: t('clientDashboard.totalPaid'), value: `$${project.totalPaid}`, cls: 'text-green-400' },
                  { label: t('clientDashboard.remaining'), value: `$${project.remainingAmount}`, cls: 'text-orange-400' },
                ].map((item) => (
                  <div key={item.label} className={`${milestoneMiniCard} rounded-lg p-4`}>
                    <span className={`${labelSmall} text-sm`}>{item.label}</span>
                    <p className={`${item.cls} font-bold text-xl`}>{item.value}</p>
                  </div>
                ))}
                <div className={`${milestoneMiniCard} rounded-lg p-4`}>
                  <span className={`${labelSmall} text-sm`}>{t('clientDashboard.progress')}</span>
                  <p className="text-teal-400 font-bold text-xl">{project.progressPercent}%</p>
                  <div className={`w-full ${isLightMode ? 'bg-gray-200' : 'bg-white/10'} rounded-full h-1.5 mt-2`}>
                    <div
                      className="bg-teal-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${project.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap gap-3 mb-4">
                {['accepted', 'submitted', 'pending', 'inprogress'].map((s) => {
                  const cfg = getMilestoneStatusConfig(s);
                  return (
                    <div key={s} className="flex items-center gap-1.5 text-xs">
                      <span
                        className={`w-2 h-2 rounded-full ${cfg.text}`}
                        style={{ backgroundColor: 'currentColor' }}
                      ></span>
                      <span className={labelSmall}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Milestones */}
              <div className="mb-6">
                <h4 className={`text-lg font-bold ${textPrimary} mb-4`}>{t('clientDashboard.milestones')}</h4>
                <div className="space-y-3">
                  {project.milestones.map((milestone) => {
                    const statusKey = normalizeMilestoneStatus(milestone.status);
                    const cfg = getMilestoneStatusConfig(milestone.status);
                    const isExpanded = expandedMilestone === milestone.id;
                    return (
                      <div key={milestone.id} className={`${milestoneCard} rounded-xl overflow-hidden`}>
                        <div
                          className={`p-4 cursor-pointer ${milestoneHover} transition-colors`}
                          onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-5 h-5 flex items-center justify-center rounded-full ${cfg.bg}`}>
                                  <i className={`${cfg.icon} text-xs ${cfg.text}`}></i>
                                </div>
                                <h5 className={`${textPrimary} font-semibold`}>{milestone.title}</h5>
                                <span className={`px-2.5 py-0.5 ${cfg.bg} ${cfg.text} text-xs font-semibold rounded-full whitespace-nowrap`}>
                                  {cfg.label}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm ml-8">
                                <span className="text-green-500 font-semibold">${milestone.amount}</span>
                                {milestone.description && (
                                  <span className={`${textSec} max-w-2xl`}>{milestone.description}</span>
                                )}
                                {milestone.deliverables && milestone.deliverables.length > 0 && (
                                  <span className="px-2 py-1 bg-teal-500/10 text-teal-400 text-xs font-semibold rounded-full">
                                    {milestone.deliverables.length} {t('clientDashboard.deliverables')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {statusKey === 'submitted' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReviewingMilestone(milestone);
                                    setSelectedActiveProject(project);
                                    setRejectionComment('');
                                    setShowMilestoneReviewModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-amber-500/20 text-amber-500 text-xs font-semibold rounded-lg hover:bg-amber-500/30 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <i className="ri-eye-line mr-1"></i>{t('clientDashboard.review')}
                                </button>
                              )}
                              {statusKey === 'accepted' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReviewingMilestone(milestone);
                                    setSelectedActiveProject(project);
                                    setRejectionComment('');
                                    setShowSubmittedReviewModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <i className="ri-checkbox-circle-line mr-1"></i>{t('clientDashboard.reviewSubmission')}
                                </button>
                              )}
                              <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line ${textMuted}`}></i>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className={`border-t ${divider} p-4 space-y-4`}>
                            {/* description maps to 'deliverables' intent */}
                            <div>
                              <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                                {t('clientDashboard.deliverables')}
                              </span>
                              <p className={`${textLight} text-sm mt-1`}>{milestone.description}</p>
                            </div>

                            {/* submissionNote – freelancer's note when they submitted */}
                            {milestone.submissionNote && (
                              <div>
                                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                                  {t('clientDashboard.submitted')}
                                </span>
                                <p className={`${textLight} text-sm mt-1`}>{milestone.submissionNote}</p>
                              </div>
                            )}

                            {/* Deliverable file links */}
                            {milestone.deliverables && milestone.deliverables.length > 0 && (
                              <div>
                                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                                  Files
                                </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {milestone.deliverables.map((d) => (
                                    <a
                                      key={d.id}
                                      href={`https://nextcoder.runasp.net/${d.fileUrl}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 text-teal-400 text-xs rounded-lg hover:bg-teal-500/20 transition-colors"
                                    >
                                      <i className="ri-attachment-line"></i>
                                      Attachment
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Client rejection / change-request comment */}
                            {milestone.clientComment && milestone.status === 'InProgress' && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <i className="ri-close-circle-line text-red-500 text-sm"></i>
                                  <span className="text-red-500 text-xs font-semibold">
                                    Your Feedback
                                  </span>
                                </div>
                                <p className="text-red-500/80 text-sm">{milestone.clientComment}</p>
                              </div>
                            )}

                            {milestone.clientComment && milestone.status === 'Accepted' && (
                              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <i className="ri-checkbox-circle-line text-green-500 text-sm"></i>
                                  <span className="text-green-500 text-xs font-semibold">
                                    Your Feedback
                                  </span>
                                </div>
                                <p className="text-green-500/80 text-sm">{milestone.clientComment}</p>
                              </div>
                            )}

                            {milestone.status === 'late' && (
                              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <i className="ri-alarm-warning-line text-orange-500 text-sm"></i>
                                  <span className="text-orange-500 text-sm font-medium">
                                    {t('clientDashboard.pastDeadline')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Project Comments */}
              <div>
                <h4 className={`text-lg font-bold ${textPrimary} mb-4`}>{t('clientDashboard.projectComments')}</h4>
                <div className="space-y-3 mb-4">
                  {project.comments.map((comment) => (
                    <div key={comment.id} className={`${commentCard} rounded-lg p-4`}>
                      <div className="flex justify-between items-start mb-2">
                        {/* Service uses senderName / senderImage / content / createdAt */}
                        <span className={`${textPrimary} font-semibold`}>{comment.senderName}</span>
                        <span className={`${textSec} text-sm`}>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className={textLight}>{comment.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(project.id)}
                    placeholder={t('common.addComment')}
                    className={`flex-1 border rounded-lg px-4 py-3 text-sm outline-none ${inputCls}`}
                  />
                  <button
                    onClick={() => handleAddComment(project.id)}
                    className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {t('common.send')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Completed Projects Tab ───────────────────────────────────────────── */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          {completedProjects.map((project) => (
            <div key={project.id} className={`${card} rounded-xl p-6`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  {project.freelancerImageUrl && (
                    <img
                      src={`https://nextcoder.runasp.net/${project.freelancerImageUrl}`}
                      alt={project.freelancerName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  {!project.freelancerImageUrl && (
                    <img
                      src={generalAvatar}
                      alt={project.freelancerName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary} mb-1`}>{project.title}</h3>
                    <p className={`${textSec} text-sm`}>
                      {t('clientDashboard.freelancer')} {project.freelancerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenReport(project.freelancerName, project.freelancerImageUrl, project.id)}
                    className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors whitespace-nowrap cursor-pointer text-sm"
                  >
                    <i className="ri-flag-line mr-1"></i>{t('clientDashboard.report')}
                  </button>
                  <span className="px-4 py-2 bg-green-500/20 text-green-500 font-semibold rounded-lg whitespace-nowrap">
                    {t('clientDashboard.completedLabel')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className={`${milestoneMiniCard} rounded-lg p-4`}>
                  <span className={`${textSec} text-sm`}>{t('clientDashboard.totalPaid')}</span>
                  <p className="text-green-500 font-bold text-xl">${project.totalPaid}</p>
                </div>
                <div className={`${milestoneMiniCard} rounded-lg p-4`}>
                  {/* milestonesCompletedCount replaces milestones array length */}
                  <span className={`${textSec} text-sm`}>{t('clientDashboard.milestonesCompleted')}</span>
                  <p className={`${textPrimary} font-bold text-xl`}>{project.milestonesCompletedCount}</p>
                </div>
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className={`${milestoneMiniCard} rounded-lg p-4`}>
                  <span className={`${textSec} text-sm mb-2 block`}>{t('clientDashboard.myRatingForFreelancer')}</span>
                  {/* isRated / freelancerRatingFromClient from service */}
                  {project.isRated && project.freelancerRatingFromClient != null ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`ri-star-fill text-xl ${i < project.freelancerRatingFromClient! ? 'text-yellow-400' : isLightMode ? 'text-gray-200' : 'text-white/20'
                              }`}
                          ></i>
                        ))}
                      </div>
                      {project.freelancerRatingCommentFromClient && (
                        <p className={`${textSec} text-sm italic`}>"{project.freelancerRatingCommentFromClient}"</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSelectedCompletedProject(project); setShowRatingModal(true); }}
                      className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {t('clientDashboard.rateFreelancer')}
                    </button>
                  )}
                </div>

                <div className={`${milestoneMiniCard} rounded-lg p-4`}>
                  <span className={`${textSec} text-sm mb-2 block`}>{t('clientDashboard.ratingFromFreelancer')}</span>
                  {/* clientRatingFromFreelancer from service */}
                  {project.clientRatingFromFreelancer != null ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`ri-star-fill text-xl ${i < project.clientRatingFromFreelancer! ? 'text-yellow-400' : isLightMode ? 'text-gray-200' : 'text-white/20'
                              }`}
                          ></i>
                        ))}
                      </div>
                      {project.clientRatingCommentFromFreelancer && (
                        <p className={`${textSec} text-sm italic`}>"{project.clientRatingCommentFromFreelancer}"</p>
                      )}
                    </div>
                  ) : (
                    <span className={`${textMuted} text-sm`}>{t('common.awaitingRating')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* Applicants / Proposals Modal */}
      {showApplicantsModal && selectedPostedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowApplicantsModal(false)}></div>
          <div className={`relative ${modalBg} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
            <div className={`flex items-start justify-between gap-4 p-6 border-b ${divider}`}>
              <div>
                <h3 className={`text-2xl font-bold ${textPrimary}`}>
                  Freelancers for {selectedPostedProject.title}
                </h3>
                <p className={`${textSec} text-sm mt-1`}>
                  {proposalsLoading ? 'Loading proposals…' : `${proposals.length} proposal${proposals.length === 1 ? '' : 's'} submitted`}
                </p>
              </div>
              <button
                onClick={() => setShowApplicantsModal(false)}
                className={`w-9 h-9 flex items-center justify-center ${closeBtn} cursor-pointer`}
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {proposalsLoading ? (
              <div className="flex items-center justify-center py-16">
                <i className="ri-loader-4-line animate-spin text-3xl text-teal-400"></i>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-12">
                <i className={`ri-user-search-line text-5xl ${textMuted} mb-4 block`}></i>
                <p className={textSec}>{t('clientDashboard.noApplicants')}</p>
              </div>
            ) : (
              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-96px)]">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className={`${innerCard} rounded-2xl p-6 ${isLightMode ? '' : `border ${divider}`}`}
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {proposal.freelancerImageUrl ? (
                            <Link to={`/user/${proposal.freelancerAppUserId}`} className="block w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer">
                              <img
                                src={`https://nextcoder.runasp.net/${proposal.freelancerImageUrl}`}
                                alt={proposal.freelancerName}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            </Link>
                          ) : (
                            <img
                              src={generalAvatar}
                              alt={proposal.freelancerName}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <Link to={`/user/${proposal.freelancerAppUserId}`} className={`hover:underline ${textPrimary} font-bold text-xl transition-colors`}>
                              {proposal.freelancerName}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                              <span className={`px-2 py-0.5 rounded-full ${isLightMode ? 'bg-teal-500/10 text-teal-600' : 'bg-teal-500/15 text-teal-400'} capitalize`}>
                                {proposal.status}
                              </span>
                              <span className={textSec}>{formatDate(proposal.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`${labelSmall} text-xs`}>{t('clientDashboard.proposedBudget')}</div>
                          <div className="text-green-500 font-bold text-xl">${proposal.totalAmount}</div>
                        </div>
                      </div>

                      <div className={`border-t ${divider}`}></div>

                      {/* Cover letter */}
                      <div>
                        <h5 className={`${textPrimary} font-semibold mb-2 text-sm`}>{t('clientDashboard.proposal')}</h5>
                        <p className={`${textLight} text-sm leading-relaxed`}>{proposal.coverLetter}</p>
                      </div>

                      {/* Milestones summary */}
                      {proposal.milestones.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className={`${textPrimary} font-semibold text-sm`}>Milestones</h5>
                            {(() => {
                              const totalDays = getEstimatedProposalDays(proposal.milestones);
                              if (!totalDays) return null;
                              return (
                                <span className={`${textSec} text-xs`}>Est. {totalDays} days</span>
                              );
                            })()}
                          </div>
                          <div className="space-y-3">
                            {proposal.milestones.map((m) => (
                              <div
                                key={m.id}
                                className={`rounded-xl p-4 ${isLightMode ? 'bg-white border border-gray-200' : 'bg-white/5 border border-white/10'}`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className={`${textLight} text-sm font-semibold`}>{m.title}</div>
                                    <div className={`${textSec} text-xs mt-1`}>{m.description || 'N/A'}</div>
                                    <div className={`${textLight} font-semibold text-xs mt-2`}>{formatDurationLabel(m.duration, m.durationType)}</div>
                                  </div>
                                  <div className="text-green-500 text-sm font-semibold">${m.amount}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {(() => {
                            const totalDays = getEstimatedProposalDays(proposal.milestones);
                            if (!totalDays) return null;
                            return (
                              <p className={`${textSec} text-xs mt-3`}>Estimated project completion: {totalDays} days from proposal acceptance</p>
                            );
                          })()}
                        </div>
                      )}

                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleAcceptProposal(proposal.id)}
                          className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? <i className="ri-loader-4-line animate-spin"></i> : t('clientDashboard.acceptProposal')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Milestone Review Modal (submitted plan — reject or proceed to payment) */}
      {showMilestoneReviewModal && reviewingMilestone && selectedActiveProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMilestoneReviewModal(false)}></div>

          <div className={`relative ${modalBg} rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <button
              onClick={() => setShowMilestoneReviewModal(false)}
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            <h3 className={`text-2xl font-bold ${textPrimary} mb-2`}>
              {t('clientDashboard.reviewMilestoneTitle')}
            </h3>

            <p className={`${textSec} text-sm mb-6`}>
              {t('clientDashboard.reviewMilestoneSubtitle')}
            </p>

            <div className={`${innerCard} rounded-xl p-5 mb-6 space-y-4`}>

              <div>
                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                  {t('clientDashboard.milestone')}
                </span>

                <p className={`${textPrimary} font-semibold mt-1`}>
                  {reviewingMilestone.title}
                </p>
              </div>

              {/* Expected Deliverables Files */}
              {reviewingMilestone.deliverables && reviewingMilestone.deliverables.length > 0 && (
                <div>
                  <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                    {t('clientDashboard.expectedDeliverables')}
                  </span>

                  <div className="space-y-2 mt-2">
                    {reviewingMilestone.deliverables.map((file) => {
                      const fileName = 'https://nextcoder.runasp.net/' + file.fileUrl
                      const uploadedDate = file.uploadedAt
                        ? new Date(file.uploadedAt).toLocaleDateString()
                        : null;
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between px-3 py-2 bg-blue-500/10 rounded-lg"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <i className="ri-file-line text-blue-400 flex-shrink-0"></i>
                            <span className="min-w-0">
                              <span className={`${textLight} text-xs block truncate max-w-[200px]`}>
                                Attachment
                              </span>
                              {uploadedDate && (
                                <span className={`${textSec} text-xs`}>{uploadedDate}</span>
                              )}
                            </span>
                          </span>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={fileName}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs hover:bg-blue-500/30 transition-colors"
                            >
                              View
                            </a>

                            <a
                              href={fileName}
                              download={fileName}
                              className="px-3 py-1 bg-white/10 text-white rounded-md text-xs hover:bg-white/20 transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Freelancer Note */}
              {reviewingMilestone.submissionNote && (
                <div>
                  <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                    Freelancer Note
                  </span>

                  <p className={`${textLight} text-sm mt-1`}>
                    {reviewingMilestone.submissionNote}
                  </p>
                </div>
              )}

              <div>
                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                  {t('clientDashboard.amount')}
                </span>

                <p className="text-green-500 font-bold text-lg mt-1">
                  ${reviewingMilestone.amount}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className={`block ${textPrimary} font-medium mb-2`}>
                {t('clientDashboard.rejectionComment')}

                <span className={`${textSec} text-sm ml-1`}>
                  {t('clientDashboard.rejectionCommentRequired')}
                </span>
              </label>

              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={t('clientDashboard.rejectionPlaceholder')}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none resize-none ${inputCls}`}
              ></textarea>

              <p className={`${textMuted} text-xs mt-1 text-right`}>
                {rejectionComment.length}/500
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectMilestone}
                disabled={!rejectionComment.trim() || actionLoading}
                className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? <i className="ri-loader-4-line animate-spin"></i>
                  : <><i className="ri-close-circle-line mr-2"></i>{t('clientDashboard.reject')}</>
                }
              </button>

              {/* ── Approve: open payment confirmation first ── */}
              <button
                onClick={() => {
                  setShowMilestoneReviewModal(false);
                  setShowPaymentModal(true);
                }}
                disabled={actionLoading || reviewingMilestone.status !== 'Submitted'}
                className="flex-1 px-5 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                <i className="ri-check-line mr-2"></i>{t('clientDashboard.approveAndPay')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Confirmation Modal ─────────────────────────────────────── */}
      {showPaymentModal && reviewingMilestone && selectedActiveProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowPaymentModal(false);
              setShowMilestoneReviewModal(true); // go back if dismissed
            }}
          ></div>

          <div className={`relative ${modalBg} rounded-2xl p-8 w-full max-w-md`}>
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setShowMilestoneReviewModal(true); // go back
              }}
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            {/* Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500/20 mx-auto mb-4">
                <i className="ri-secure-payment-line text-3xl text-green-400"></i>
              </div>
              <h3 className={`text-2xl font-bold ${textPrimary} mb-1`}>
                Confirm Payment
              </h3>
              <p className={`${textSec} text-sm`}>
                Review the details below before releasing payment for this milestone.
              </p>
            </div>

            {/* Summary card */}
            <div className={`${innerCard} rounded-xl p-5 mb-6 space-y-3`}>
              <div className="flex justify-between items-center">
                <span className={`${textSec} text-sm`}>Milestone</span>
                <span className={`${textPrimary} font-semibold text-sm`}>{reviewingMilestone.title}</span>
              </div>
              <div className={`border-t ${divider}`}></div>
              <div className="flex justify-between items-center">
                <span className={`${textSec} text-sm`}>Freelancer</span>
                <span className={`${textPrimary} font-semibold text-sm`}>{selectedActiveProject.freelancerName}</span>
              </div>
              <div className={`border-t ${divider}`}></div>
              <div className="flex justify-between items-center">
                <span className={`${textSec} text-sm`}>Amount to Release</span>
                <span className="text-green-400 font-bold text-xl">${reviewingMilestone.amount}</span>
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-6">
              <i className="ri-information-line text-teal-400 text-base mt-0.5 flex-shrink-0"></i>
              <p className="text-teal-400 text-xs leading-relaxed">
                By confirming, you approve this milestone and authorise the release of the payment to the freelancer. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setShowMilestoneReviewModal(true); // go back to review
                }}
                className={`flex-1 px-5 py-3 ${cancelBtn} font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer`}
              >
                <i className="ri-arrow-left-line mr-2"></i>Back
              </button>

              <button
                onClick={handleApproveMilestone}
                disabled={actionLoading}
                className="flex-1 px-5 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? <i className="ri-loader-4-line animate-spin"></i>
                  : <><i className="ri-check-double-line mr-2"></i>Confirm & Pay</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Deliverables Review Modal */}
      {showSubmittedReviewModal && reviewingMilestone && selectedActiveProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubmittedReviewModal(false)}></div>

          <div className={`relative ${modalBg} rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <button
              onClick={() => setShowSubmittedReviewModal(false)}
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-500/20 mx-auto mb-4">
                <i className="ri-upload-2-line text-3xl text-teal-500"></i>
              </div>

              <h3 className={`text-2xl font-bold ${textPrimary} mb-2`}>
                {t('clientDashboard.reviewSubmittedTitle')}
              </h3>

              <p className={`${textSec} text-sm`}>
                {t('clientDashboard.reviewSubmittedSubtitle')}
              </p>
            </div>

            <div className={`${innerCard} rounded-xl p-5 mb-6 space-y-4`}>

              <div>
                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                  {t('clientDashboard.milestone')}
                </span>

                <p className={`${textPrimary} font-semibold mt-1`}>
                  {reviewingMilestone.title}
                </p>
              </div>

              {/* Freelancer Note */}
              {reviewingMilestone.submissionNote && (
                <div>
                  <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                    Freelancer Note
                  </span>

                  <p className={`${textLight} text-sm mt-1`}>
                    {reviewingMilestone.submissionNote}
                  </p>
                </div>
              )}

              {/* Submitted Deliverables */}
              {reviewingMilestone.deliverables &&
                reviewingMilestone.deliverables.length > 0 && (
                  <div>
                    <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                      Submitted Files
                    </span>

                    <div className="space-y-2 mt-2">
                      {reviewingMilestone.deliverables.map((d) => {
                        const fileName = 'https://nextcoder.runasp.net/' + d.fileUrl;
                        const uploadedDate = d.uploadedAt
                          ? new Date(d.uploadedAt).toLocaleDateString()
                          : null;
                        return (
                          <div
                            key={d.id}
                            className="flex items-center justify-between px-3 py-2 bg-teal-500/10 rounded-lg"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <i className="ri-attachment-line text-teal-400 flex-shrink-0"></i>
                              <span className="min-w-0">
                                <span className={`${textLight} text-xs block truncate max-w-[200px]`}>
                                  Attachment
                                </span>
                                {uploadedDate && (
                                  <span className={`${textSec} text-xs`}>{uploadedDate}</span>
                                )}
                              </span>
                            </span>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <a
                                href={fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-md text-xs hover:bg-teal-500/30 transition-colors"
                              >
                                View
                              </a>

                              <a
                                href={fileName}
                                download={fileName}
                                className="px-3 py-1 bg-white/10 text-white rounded-md text-xs hover:bg-white/20 transition-colors"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div>
                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>
                  {t('clientDashboard.amount')}
                </span>

                <p className="text-green-500 font-bold text-lg mt-1">
                  ${reviewingMilestone.amount}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className={`block ${textPrimary} font-medium mb-2`}>
                {t('clientDashboard.feedback')}

                <span className={`${textSec} text-sm ml-1`}>
                  {t('clientDashboard.feedbackRequired')}
                </span>
              </label>

              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={t('clientDashboard.feedbackPlaceholder')}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none resize-none ${inputCls}`}
              ></textarea>

              <p className={`${textMuted} text-xs mt-1 text-right`}>
                {rejectionComment.length}/500
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmission}
                disabled={actionLoading || reviewingMilestone.status !== 'Submitted'}
                className="flex-1 px-5 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? <i className="ri-loader-4-line animate-spin"></i>
                  : <><i className="ri-arrow-go-back-line mr-2"></i>{t('clientDashboard.requestRevision')}</>
                }
              </button>

              <button
                onClick={handleApproveSubmission}
                disabled={actionLoading || reviewingMilestone.status !== 'Submitted'}
                className="flex-1 px-5 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {actionLoading
                  ? <i className="ri-loader-4-line animate-spin"></i>
                  : <><i className="ri-check-double-line mr-2"></i>{t('clientDashboard.approve')}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedCompletedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRatingModal(false)}></div>
          <div className={`relative ${modalBg} rounded-2xl p-8 w-full max-w-md`}>
            <button
              onClick={() => setShowRatingModal(false)}
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className={`text-2xl font-bold ${textPrimary} mb-6 text-center`}>{t('clientDashboard.rateFreelancerTitle')}</h3>
            <div className="text-center mb-6">
              <p className={`${textSec} mb-4`}>
                {t('clientDashboard.rateFreelancerQuestion')} {selectedCompletedProject.freelancerName}?
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="cursor-pointer">
                    <i className={`ri-star-fill text-4xl ${star <= rating ? 'text-yellow-400' : isLightMode ? 'text-gray-200' : 'text-white/20'}`}></i>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className={`block ${textPrimary} font-medium mb-2`}>{t('clientDashboard.commentOptional')}</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder={t('clientDashboard.shareExperience')}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none resize-none ${inputCls}`}
              ></textarea>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className={`flex-1 px-5 py-3 ${cancelBtn} font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer`}
              >
                {t('clientDashboard.cancel')}
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0 || actionLoading}
                className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? <i className="ri-loader-4-line animate-spin"></i>
                  : t('clientDashboard.submitRating')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetName={reportTarget.name}
        targetAvatar={reportTarget.avatar}
        projectId={reportTarget.projectId}
        reporterRole="client"
      />

      {/* Delete Project Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setProjectToDelete(null)}></div>
          <div className={`relative ${modalBg} rounded-2xl p-6 w-full max-w-md`}>
            <button
              onClick={() => setProjectToDelete(null)}
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500/20 mx-auto mb-4">
                <i className="ri-delete-bin-line text-2xl text-red-500"></i>
              </div>
              <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{t('clientDashboard.removeProject')}</h3>
              <p className={`${textSec} text-sm`}>
                {t('clientDashboard.removeConfirmText')}{' '}
                <span className={`${textPrimary} font-semibold`}>&quot;{projectToDelete.title}&quot;</span>?{' '}
                {t('clientDashboard.removeConfirmEnd')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className={`flex-1 px-5 py-3 ${cancelBtn} font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap`}
              >
                {t('clientDashboard.cancel')}
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={actionLoading}
                className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {actionLoading
                  ? <i className="ri-loader-4-line animate-spin"></i>
                  : <><i className="ri-delete-bin-line mr-2"></i>{t('clientDashboard.remove')}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientDashboard;