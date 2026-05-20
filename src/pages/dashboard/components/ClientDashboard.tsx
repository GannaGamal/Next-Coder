import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReportModal from '../../../components/feature/ReportModal';
import { useTheme } from '../../../contexts/ThemeContext';
import * as clientDashboardService from '../../../services/clientDashboard.service';

interface MilestoneComment {
  id: string;
  author: string;
  authorRole: 'freelancer' | 'client';
  text: string;
  date: string;
}

interface Milestone {
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
}

interface Freelancer {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  hourlyRate: number;
  skills: string[];
  proposal: string;
  proposedBudget: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'open' | 'in-progress' | 'completed';
  postedDate: string;
  freelancer?: { name: string; avatar: string };
  applicants: Freelancer[];
  milestones: Milestone[];
  totalPaid: number;
  comments: Array<{ id: string; author: string; text: string; date: string }>;
  freelancerRating?: number;
  myRating?: number;
}

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
  const milestoneInner = isLightMode ? 'bg-gray-50' : 'bg-white/[0.03]';
  const commentCard = isLightMode ? 'bg-gray-50' : 'bg-white/5';
  const statCard = isLightMode
    ? 'bg-white border border-gray-200'
    : 'bg-white/5 backdrop-blur-sm border border-white/10';
  const tabBorder = isLightMode ? 'border-gray-200' : 'border-white/10';
  const milestoneHover = isLightMode ? 'hover:bg-gray-50' : 'hover:bg-white/[0.02]';
  const labelSmall = isLightMode ? 'text-gray-400' : 'text-white/50';
  const textLight = isLightMode ? 'text-gray-700' : 'text-white/80';
  const milestoneMiniCard = isLightMode ? 'bg-gray-50 border border-gray-100' : 'bg-white/5';

  const [activeTab, setActiveTab] = useState('posted');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showMilestoneReviewModal, setShowMilestoneReviewModal] = useState(false);
  const [showSubmittedReviewModal, setShowSubmittedReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ name: string; avatar: string }>({ name: '', avatar: '' });
  const [reviewingMilestone, setReviewingMilestone] = useState<Milestone | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [milestoneComment, setMilestoneComment] = useState('');
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Data states
  const [postedProjects, setPostedProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);

  const loadDashboardData = async () => {
    try {
      // Fetch all three project types in parallel
      const [postedData, activeData, completedData] = await Promise.all([
        clientDashboardService.getPostedProjects(),
        clientDashboardService.getActiveProjects(),
        clientDashboardService.getCompletedProjects(),
      ]);

      // Transform PostedProject[] to Project[]
      const transformedPosted: Project[] = await Promise.all(
        postedData.map(async (p) => {
          const proposals = await clientDashboardService.getProjectProposals(p.id);
          return {
            id: String(p.id),
            title: p.title,
            description: '', // Backend doesn't provide description for posted projects
            budget: p.budget,
            status: (p.status.toLowerCase() as 'open' | 'in-progress' | 'completed'),
            postedDate: p.createdAt,
            applicants: proposals.map((proposal) => ({
              id: String(proposal.id),
              name: proposal.freelancerName,
              avatar: proposal.freelancerImageUrl,
              rating: 5, // Backend doesn't provide rating for proposals
              hourlyRate: 0, // Backend doesn't provide hourly rate
              skills: [], // Backend doesn't provide skills
              proposal: proposal.coverLetter,
              proposedBudget: proposal.totalAmount,
            })),
            milestones: [],
            totalPaid: 0,
            comments: [],
          };
        })
      );

      // Transform ActiveProject[] to Project[]
      const transformedActive: Project[] = activeData.map((ap) => ({
        id: String(ap.id),
        title: ap.title,
        description: '', // Backend doesn't provide description
        budget: ap.totalBudget,
        status: 'in-progress',
        postedDate: '', // Backend doesn't provide posted date
        freelancer: ap.freelancerName ? { name: ap.freelancerName, avatar: ap.freelancerImageUrl } : undefined,
        applicants: [],
        milestones: ap.milestones.map((m) => ({
          id: String(m.id),
          title: m.title,
          deliverables: m.description,
          amount: m.amount,
          duration: '', // Backend doesn't provide duration
          deadline: '', // Backend doesn't provide deadline
          status: (m.status.toLowerCase() as any),
          comments: [],
        })),
        totalPaid: ap.totalPaid,
        comments: [],
      }));

      // Transform CompletedProject[] to Project[]
      const transformedCompleted: Project[] = completedData.map((cp) => ({
        id: String(cp.id),
        title: cp.title,
        description: '',
        budget: cp.totalPaid,
        status: 'completed',
        postedDate: cp.completedAt,
        freelancer: cp.freelancerName ? { name: cp.freelancerName, avatar: cp.freelancerImageUrl } : undefined,
        applicants: [],
        milestones: Array(cp.milestonesCompletedCount)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            title: `Milestone ${i + 1}`,
            deliverables: '',
            amount: 0,
            duration: '',
            deadline: '',
            status: 'finished' as const,
            comments: [],
          })),
        totalPaid: cp.totalPaid,
        comments: [],
        freelancerRating: cp.freelancerRatingGivenByClient ?? undefined,
        myRating: cp.clientRatingFromFreelancer ?? undefined,
      }));

      setPostedProjects(transformedPosted);
      setActiveProjects(transformedActive);
      setCompletedProjects(transformedCompleted);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAcceptFreelancer = async (proposalId: string) => {
    if (!selectedProject) return;

    try {
      await clientDashboardService.acceptProposal(Number(selectedProject.id), Number(proposalId));
      setShowApplicantsModal(false);
      setSelectedProject(null);
      await loadDashboardData();
    } catch (err) {
      console.error('Error accepting proposal:', err);
    }
  };

  const stats = {
    activeProjects: activeProjects.length,
    totalSpent:
      activeProjects.reduce((sum, p) => sum + p.totalPaid, 0) +
      completedProjects.reduce((sum, p) => sum + p.totalPaid, 0),
    openPositions: postedProjects.filter((p) => p.status === 'open').length,
    completed: completedProjects.length,
  };

  const getMilestoneStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: 'ri-time-line', label: t('clientDashboard.pendingApproval') },
      approved: { bg: 'bg-green-500/15', text: 'text-green-400', icon: 'ri-check-line', label: t('clientDashboard.approved') },
      rejected: { bg: 'bg-red-500/15', text: 'text-red-400', icon: 'ri-close-circle-line', label: t('clientDashboard.rejected') },
      submitted: { bg: 'bg-teal-500/15', text: 'text-teal-400', icon: 'ri-upload-2-line', label: t('clientDashboard.submittedStatus') },
      late: { bg: 'bg-orange-500/15', text: 'text-orange-400', icon: 'ri-alarm-warning-line', label: t('clientDashboard.late') },
      finished: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: 'ri-checkbox-circle-line', label: t('clientDashboard.finished') },
    };
    return config[status] || { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: 'ri-question-line', label: status };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-teal-500/20 text-teal-400',
      'in-progress': 'bg-cyan-500/20 text-cyan-400',
      completed: 'bg-green-500/20 text-green-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getMilestoneProgress = (milestones: Milestone[]) => {
    if (milestones.length === 0) return 0;
    const finished = milestones.filter(m => m.status === 'finished').length;
    return Math.round((finished / milestones.length) * 100);
  };

  const handleApproveMilestone = () => {
    if (!reviewingMilestone || !selectedProject) return;
    const today = new Date().toISOString().split('T')[0];
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id
          ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === reviewingMilestone.id
                  ? { ...m, status: 'approved' as const, approvedDate: today, rejectionComment: undefined }
                  : m
              ),
            }
          : p
      )
    );
    setShowMilestoneReviewModal(false);
    setReviewingMilestone(null);
    setRejectionComment('');
  };

  const handleRejectMilestone = () => {
    if (!rejectionComment.trim() || !reviewingMilestone || !selectedProject) return;
    const today = new Date().toISOString().split('T')[0];
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id
          ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === reviewingMilestone.id
                  ? {
                      ...m,
                      status: 'rejected' as const,
                      rejectionComment,
                      comments: [...m.comments, { id: `mc-${Date.now()}`, author: 'You', authorRole: 'client' as const, text: rejectionComment, date: today }],
                    }
                  : m
              ),
            }
          : p
      )
    );
    setShowMilestoneReviewModal(false);
    setReviewingMilestone(null);
    setRejectionComment('');
  };

  const handleApproveSubmission = () => {
    if (!reviewingMilestone || !selectedProject) return;
    setShowSubmittedReviewModal(false);
    setReviewingMilestone(reviewingMilestone);
    setSelectedProject(selectedProject);
    setShowPaymentModal(true);
  };

  const handleRejectSubmission = () => {
    if (!rejectionComment.trim() || !reviewingMilestone || !selectedProject) return;
    const today = new Date().toISOString().split('T')[0];
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id
          ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === reviewingMilestone.id
                  ? {
                      ...m,
                      status: 'approved' as const,
                      submittedDate: undefined,
                      comments: [...m.comments, { id: `mc-${Date.now()}`, author: 'You', authorRole: 'client' as const, text: `Submission rejected: ${rejectionComment}`, date: today }],
                    }
                  : m
              ),
            }
          : p
      )
    );
    setShowSubmittedReviewModal(false);
    setReviewingMilestone(null);
    setRejectionComment('');
  };

  const handlePayMilestone = () => {
    if (!reviewingMilestone || !selectedProject) return;
    const today = new Date().toISOString().split('T')[0];
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id
          ? {
              ...p,
              totalPaid: p.totalPaid + reviewingMilestone.amount,
              milestones: p.milestones.map(m =>
                m.id === reviewingMilestone.id
                  ? { ...m, status: 'finished' as const, finishedDate: today }
                  : m
              ),
            }
          : p
      )
    );
    setShowPaymentModal(false);
    setReviewingMilestone(null);
  };

  const handleSubmitRating = () => {
    if (!selectedProject || rating === 0) return;
    setCompletedProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id ? { ...p, freelancerRating: rating } : p
      )
    );
    setShowRatingModal(false);
    setRating(0);
    setRatingComment('');
  };

  const handleAddComment = (projectId: string) => {
    if (!newComment.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, comments: [...p.comments, { id: `c-${Date.now()}`, author: 'You', text: newComment, date: today }] }
          : p
      )
    );
    setNewComment('');
  };

  const handleAddMilestoneComment = (projectId: string, milestoneId: string) => {
    if (!milestoneComment.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === milestoneId
                  ? { ...m, comments: [...m.comments, { id: `mc-${Date.now()}`, author: 'You', authorRole: 'client' as const, text: milestoneComment, date: today }] }
                  : m
              ),
            }
          : p
      )
    );
    setMilestoneComment('');
  };

  const handleOpenReport = (name: string, avatar: string) => {
    setReportTarget({ name, avatar });
    setShowReportModal(true);
  };

  const handleRemovePostedProject = (id: string) => {
    setPostedProjects(prev => prev.filter(p => p.id !== id));
    setProjectToDelete(null);
  };

  return (
    <>
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
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab
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

      {/* ── Posted Projects Tab ─────────────────────────────────────────────── */}
      {activeTab === 'posted' && (
        <div className="space-y-4">
          {postedProjects.map((project) => (
            <div key={project.id} className={`${card} rounded-xl p-6`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{project.title}</h3>
                  <p className={`${textSec} mb-2`}>{project.description}</p>
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
                  <span className={`${textSec} text-sm`}>{t('clientDashboard.postedDate')}</span>
                  <p className={`${textPrimary} font-bold text-lg`}>{project.postedDate}</p>
                </div>
                <div>
                  <span className={`${textSec} text-sm`}>{t('clientDashboard.applicants')}</span>
                  <p className={`${textPrimary} font-bold text-lg`}>{project.applicants.length}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedProject(project); setShowApplicantsModal(true); }}
                className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t('clientDashboard.viewApplicants')} ({project.applicants.length})
              </button>
            </div>
          ))}
          {postedProjects.length === 0 && (
            <div className={`text-center py-12 border-2 border-dashed ${isLightMode ? 'border-gray-200' : 'border-white/20'} rounded-lg`}>
              <i className={`ri-folder-open-line text-5xl ${textMuted} mb-4`}></i>
              <p className={textMuted}>{t('clientDashboard.noPostedProjects')}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Active Projects Tab ─────────────────────────────────────────────── */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activeProjects.map((project) => (
            <div key={project.id} className={`${card} rounded-xl p-6`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  {project.freelancer && (
                    <img src={`https://nextcoder.runasp.net/${project.freelancer.avatar}`} alt={project.freelancer.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary} mb-1`}>{project.title}</h3>
                    {project.freelancer && (
                      <p className={`${textSec} text-sm`}>{t('clientDashboard.freelancer')} {project.freelancer.name}</p>
                    )}
                  </div>
                </div>
                {project.freelancer && (
                  <button
                    onClick={() => handleOpenReport(project.freelancer!.name, project.freelancer!.avatar)}
                    className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors whitespace-nowrap cursor-pointer text-sm"
                  >
                    <i className="ri-flag-line mr-1"></i>{t('clientDashboard.report')}
                  </button>
                )}
              </div>

              {/* Budget & Progress */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: t('clientDashboard.totalBudget'), value: `$${project.budget}`, cls: textPrimary },
                  { label: t('clientDashboard.totalPaid'), value: `$${project.totalPaid}`, cls: 'text-green-400' },
                  { label: t('clientDashboard.remaining'), value: `$${project.budget - project.totalPaid}`, cls: 'text-orange-400' },
                ].map(item => (
                  <div key={item.label} className={`${milestoneMiniCard} rounded-lg p-4`}>
                    <span className={`${labelSmall} text-sm`}>{item.label}</span>
                    <p className={`${item.cls} font-bold text-xl`}>{item.value}</p>
                  </div>
                ))}
                <div className={`${milestoneMiniCard} rounded-lg p-4`}>
                  <span className={`${labelSmall} text-sm`}>{t('clientDashboard.progress')}</span>
                  <p className="text-teal-400 font-bold text-xl">{getMilestoneProgress(project.milestones)}%</p>
                  <div className={`w-full ${isLightMode ? 'bg-gray-200' : 'bg-white/10'} rounded-full h-1.5 mt-2`}>
                    <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${getMilestoneProgress(project.milestones)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap gap-3 mb-4">
                {['pending', 'approved', 'rejected', 'submitted', 'late', 'finished'].map(s => {
                  const cfg = getMilestoneStatusConfig(s);
                  return (
                    <div key={s} className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${cfg.text}`} style={{ backgroundColor: 'currentColor' }}></span>
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
                              <div className="flex flex-wrap items-center gap-4 text-sm ml-8">
                                <span className="text-green-500 font-semibold">${milestone.amount}</span>
                                <span className={labelSmall}><i className="ri-time-line mr-1"></i>{milestone.duration}</span>
                                <span className={labelSmall}><i className="ri-calendar-line mr-1"></i>{t('clientDashboard.dueDate')} {milestone.deadline}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {milestone.status === 'pending' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setReviewingMilestone(milestone); setSelectedProject(project); setShowMilestoneReviewModal(true); }}
                                  className="px-3 py-1.5 bg-amber-500/20 text-amber-500 text-xs font-semibold rounded-lg hover:bg-amber-500/30 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <i className="ri-eye-line mr-1"></i>{t('clientDashboard.review')}
                                </button>
                              )}
                              {milestone.status === 'submitted' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setReviewingMilestone(milestone); setSelectedProject(project); setRejectionComment(''); setShowSubmittedReviewModal(true); }}
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
                            <div>
                              <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.deliverables')}</span>
                              <p className={`${textLight} text-sm mt-1`}>{milestone.deliverables}</p>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs">
                              {milestone.submittedDate && <span className={labelSmall}><i className="ri-upload-line mr-1"></i>{t('clientDashboard.submittedDate')} {milestone.submittedDate}</span>}
                              {milestone.approvedDate && <span className="text-green-500"><i className="ri-check-line mr-1"></i>{t('clientDashboard.approvedDate')} {milestone.approvedDate}</span>}
                              {milestone.finishedDate && <span className="text-emerald-500"><i className="ri-money-dollar-circle-line mr-1"></i>{t('clientDashboard.paidDate')} {milestone.finishedDate}</span>}
                            </div>
                            {milestone.rejectionComment && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <i className="ri-close-circle-line text-red-500 text-sm"></i>
                                  <span className="text-red-500 text-xs font-semibold">{t('clientDashboard.yourRejection')}</span>
                                </div>
                                <p className="text-red-500/80 text-sm">{milestone.rejectionComment}</p>
                              </div>
                            )}
                            {milestone.status === 'late' && (
                              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <i className="ri-alarm-warning-line text-orange-500 text-sm"></i>
                                  <span className="text-orange-500 text-sm font-medium">{t('clientDashboard.pastDeadline')} ({milestone.deadline})</span>
                                </div>
                              </div>
                            )}
                            <div>
                              <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.discussion')}</span>
                              {milestone.comments.length > 0 ? (
                                <div className="space-y-2 mt-2">
                                  {milestone.comments.map(c => (
                                    <div key={c.id} className={`flex gap-3 p-2.5 ${milestoneInner} rounded-lg`}>
                                      <div className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${c.authorRole === 'client' ? 'bg-cyan-500/20' : 'bg-teal-500/20'}`}>
                                        <i className={`ri-user-line text-xs ${c.authorRole === 'client' ? 'text-cyan-500' : 'text-teal-500'}`}></i>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className={`${textPrimary} text-xs font-semibold`}>{c.author}</span>
                                          <span className={`${textMuted} text-xs`}>{c.date}</span>
                                        </div>
                                        <p className={`${textLight} text-sm`}>{c.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className={`${textMuted} text-sm mt-2`}>{t('common.noCommentsYet')}</p>
                              )}
                              {milestone.status !== 'finished' && (
                                <div className="flex gap-2 mt-3">
                                  <input
                                    type="text"
                                    value={expandedMilestone === milestone.id ? milestoneComment : ''}
                                    onChange={(e) => setMilestoneComment(e.target.value)}
                                    placeholder={t('common.addComment')}
                                    className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none ${inputCls}`}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleAddMilestoneComment(project.id, milestone.id); }}
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
                <h4 className={`text-lg font-bold ${textPrimary} mb-4`}>{t('clientDashboard.projectComments')}</h4>
                <div className="space-y-3 mb-4">
                  {project.comments.map((comment) => (
                    <div key={comment.id} className={`${commentCard} rounded-lg p-4`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`${textPrimary} font-semibold`}>{comment.author}</span>
                        <span className={`${textSec} text-sm`}>{comment.date}</span>
                      </div>
                      <p className={textLight}>{comment.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('common.addComment')}
                    className={`flex-1 border rounded-lg px-4 py-3 text-sm outline-none ${inputCls}`}
                  />
                  <button onClick={() => handleAddComment(project.id)} className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                    {t('common.send')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Completed Projects Tab ──────────────────────────────────────────── */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          {completedProjects.map((project) => (
            <div key={project.id} className={`${card} rounded-xl p-6`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  {project.freelancer && (
                    <img src= {project.freelancer.avatar} alt={project.freelancer.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary} mb-1`}>{project.title}</h3>
                    {project.freelancer && (
                      <p className={`${textSec} text-sm`}>{t('clientDashboard.freelancer')} {project.freelancer.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {project.freelancer && (
                    <button
                      onClick={() => handleOpenReport(project.freelancer!.name, project.freelancer!.avatar)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors whitespace-nowrap cursor-pointer text-sm"
                    >
                      <i className="ri-flag-line mr-1"></i>{t('clientDashboard.report')}
                    </button>
                  )}
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
                  <span className={`${textSec} text-sm`}>{t('clientDashboard.milestonesCompleted')}</span>
                  <p className={`${textPrimary} font-bold text-xl`}>{project.milestones.length}</p>
                </div>
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className={`${milestoneMiniCard} rounded-lg p-4`}>
                  <span className={`${textSec} text-sm mb-2 block`}>{t('clientDashboard.myRatingForFreelancer')}</span>
                  {project.freelancerRating ? (
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`ri-star-fill text-xl ${i < project.freelancerRating! ? 'text-yellow-400' : isLightMode ? 'text-gray-200' : 'text-white/20'}`}></i>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSelectedProject(project); setShowRatingModal(true); }}
                      className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {t('clientDashboard.rateFreelancer')}
                    </button>
                  )}
                </div>
                <div className={`${milestoneMiniCard} rounded-lg p-4`}>
                  <span className={`${textSec} text-sm mb-2 block`}>{t('clientDashboard.ratingFromFreelancer')}</span>
                  {project.myRating ? (
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`ri-star-fill text-xl ${i < project.myRating! ? 'text-yellow-400' : isLightMode ? 'text-gray-200' : 'text-white/20'}`}></i>
                      ))}
                    </div>
                  ) : (
                    <span className={`${textMuted} text-sm`}>{t('common.awaitingRating')}</span>
                  )}
                </div>
              </div>

              {project.comments.length > 0 && (
                <div>
                  <h4 className={`text-lg font-bold ${textPrimary} mb-3`}>{t('clientDashboard.projectComments')}</h4>
                  <div className="space-y-3">
                    {project.comments.map((comment) => (
                      <div key={comment.id} className={`${commentCard} rounded-lg p-4`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`${textPrimary} font-semibold`}>{comment.author}</span>
                          <span className={`${textSec} text-sm`}>{comment.date}</span>
                        </div>
                        <p className={textLight}>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* Applicants Modal */}
      {showApplicantsModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowApplicantsModal(false)}></div>
          <div className={`relative ${modalBg} rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <button onClick={() => setShowApplicantsModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className={`text-2xl font-bold ${textPrimary} mb-6`}>{t('clientDashboard.applicantsFor')} {selectedProject.title}</h3>
            <div className="space-y-4">
              {selectedProject.applicants.length === 0 ? (
                <div className="text-center py-12">
                  <i className={`ri-user-search-line text-5xl ${textMuted} mb-4`}></i>
                  <p className={textSec}>{t('clientDashboard.noApplicants')}</p>
                </div>
              ) : (
                selectedProject.applicants.map((freelancer) => (
                  <div key={freelancer.id} className={`${innerCard} rounded-xl p-6`}>
                    <div className="flex items-start gap-4 mb-4">
                      <img src={`https://nextcoder.runasp.net/${freelancer.avatar}`} alt={freelancer.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className={`text-xl font-bold ${textPrimary} mb-1`}>{freelancer.name}</h4>
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <div className="flex items-center gap-1">
                            <i className="ri-star-fill text-yellow-400"></i>
                            <span className={textPrimary}>{freelancer.rating}</span>
                          </div>
                          <span className={textSec}>${freelancer.hourlyRate}/hr</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-teal-500/20 text-teal-500 text-xs rounded">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h5 className={`${textPrimary} font-semibold mb-2`}>{t('clientDashboard.proposal')}</h5>
                      <p className={`${textLight} text-sm`}>{freelancer.proposal}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`${textSec} text-sm`}>{t('clientDashboard.proposedBudget')} </span>
                        <span className="text-green-500 font-bold text-lg">${freelancer.proposedBudget}</span>
                      </div>
                      <button onClick={() => handleAcceptFreelancer(freelancer.id)} className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                        {t('clientDashboard.acceptProposal')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Milestone Review Modal (pending) */}
      {showMilestoneReviewModal && reviewingMilestone && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMilestoneReviewModal(false)}></div>
          <div className={`relative ${modalBg} rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <button onClick={() => setShowMilestoneReviewModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className={`text-2xl font-bold ${textPrimary} mb-2`}>{t('clientDashboard.reviewMilestoneTitle')}</h3>
            <p className={`${textSec} text-sm mb-6`}>{t('clientDashboard.reviewMilestoneSubtitle')}</p>
            <div className={`${innerCard} rounded-xl p-5 mb-6 space-y-4`}>
              <div>
                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.milestone')}</span>
                <p className={`${textPrimary} font-semibold mt-1`}>{reviewingMilestone.title}</p>
              </div>
              <div>
                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.deliverables')}</span>
                <p className={`${textLight} text-sm mt-1`}>{reviewingMilestone.deliverables}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.amount')}</span>
                  <p className="text-green-500 font-bold text-lg mt-1">${reviewingMilestone.amount}</p>
                </div>
                <div>
                  <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('freelancerDashboard.duration')}</span>
                  <p className={`${textPrimary} font-semibold mt-1`}>{reviewingMilestone.duration}</p>
                </div>
                <div>
                  <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('freelancerDashboard.deadline')}</span>
                  <p className={`${textPrimary} font-semibold mt-1`}>{reviewingMilestone.deadline}</p>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className={`block ${textPrimary} font-medium mb-2`}>
                {t('clientDashboard.rejectionComment')} <span className={`${textSec} text-sm`}>{t('clientDashboard.rejectionCommentRequired')}</span>
              </label>
              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={t('clientDashboard.rejectionPlaceholder')}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none resize-none ${inputCls}`}
              ></textarea>
              <p className={`${textMuted} text-xs mt-1 text-right`}>{rejectionComment.length}/500</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectMilestone}
                disabled={!rejectionComment.trim()}
                className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-close-circle-line mr-2"></i>{t('clientDashboard.reject')}
              </button>
              <button onClick={handleApproveMilestone} className="flex-1 px-5 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-check-line mr-2"></i>{t('clientDashboard.approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Deliverables Review Modal */}
      {showSubmittedReviewModal && reviewingMilestone && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubmittedReviewModal(false)}></div>
          <div className={`relative ${modalBg} rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <button onClick={() => setShowSubmittedReviewModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-500/20 mx-auto mb-4">
                <i className="ri-upload-2-line text-3xl text-teal-500"></i>
              </div>
              <h3 className={`text-2xl font-bold ${textPrimary} mb-2`}>{t('clientDashboard.reviewSubmittedTitle')}</h3>
              <p className={`${textSec} text-sm`}>{t('clientDashboard.reviewSubmittedSubtitle')}</p>
            </div>
            <div className={`${innerCard} rounded-xl p-5 mb-6 space-y-4`}>
              <div>
                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.milestone')}</span>
                <p className={`${textPrimary} font-semibold mt-1`}>{reviewingMilestone.title}</p>
              </div>
              <div>
                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.expectedDeliverables')}</span>
                <p className={`${textLight} text-sm mt-1`}>{reviewingMilestone.deliverables}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.amount')}</span>
                  <p className="text-green-500 font-bold text-lg mt-1">${reviewingMilestone.amount}</p>
                </div>
                <div>
                  <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.submitted')}</span>
                  <p className={`${textPrimary} font-semibold mt-1`}>{reviewingMilestone.submittedDate}</p>
                </div>
              </div>
            </div>
            {reviewingMilestone.comments.length > 0 && (
              <div className="mb-6">
                <span className={`${labelSmall} text-xs font-medium uppercase tracking-wider`}>{t('clientDashboard.freelancerNotes')}</span>
                <div className="space-y-2 mt-2">
                  {reviewingMilestone.comments.filter(c => c.authorRole === 'freelancer').slice(-2).map(c => (
                    <div key={c.id} className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                      <p className={`${textLight} text-sm`}>{c.text}</p>
                      <span className={`${textMuted} text-xs mt-1 block`}>{c.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-6">
              <label className={`block ${textPrimary} font-medium mb-2`}>
                {t('clientDashboard.feedback')} <span className={`${textSec} text-sm`}>{t('clientDashboard.feedbackRequired')}</span>
              </label>
              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={t('clientDashboard.feedbackPlaceholder')}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none resize-none ${inputCls}`}
              ></textarea>
              <p className={`${textMuted} text-xs mt-1 text-right`}>{rejectionComment.length}/500</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmission}
                disabled={!rejectionComment.trim()}
                className="flex-1 px-5 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-arrow-go-back-line mr-2"></i>{t('clientDashboard.requestRevision')}
              </button>
              <button onClick={handleApproveSubmission} className="flex-1 px-5 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-check-double-line mr-2"></i>{t('clientDashboard.approveAndPay')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && reviewingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
          <div className={`relative ${modalBg} rounded-2xl p-8 w-full max-w-md`}>
            <button onClick={() => setShowPaymentModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500/20 mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-3xl text-green-500"></i>
              </div>
              <h3 className={`text-2xl font-bold ${textPrimary} mb-2`}>{t('clientDashboard.payMilestoneTitle')}</h3>
              <p className={textSec}>{t('clientDashboard.payMilestoneSubtitle')}</p>
            </div>
            <div className={`${innerCard} rounded-lg p-4 mb-6`}>
              <h4 className={`${textPrimary} font-semibold mb-2`}>{reviewingMilestone.title}</h4>
              <div className="text-3xl font-bold text-green-500 text-center my-4">${reviewingMilestone.amount}</div>
              <p className={`${textSec} text-sm text-center`}>{t('clientDashboard.payMarkFinished')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPaymentModal(false)} className={`flex-1 px-5 py-3 ${cancelBtn} font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer`}>
                {t('clientDashboard.cancel')}
              </button>
              <button onClick={handlePayMilestone} className="flex-1 px-5 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer">
                {t('clientDashboard.confirmPayment')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRatingModal(false)}></div>
          <div className={`relative ${modalBg} rounded-2xl p-8 w-full max-w-md`}>
            <button onClick={() => setShowRatingModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className={`text-2xl font-bold ${textPrimary} mb-6 text-center`}>{t('clientDashboard.rateFreelancerTitle')}</h3>
            <div className="text-center mb-6">
              <p className={`${textSec} mb-4`}>{t('clientDashboard.rateFreelancerQuestion')} {selectedProject.freelancer?.name}?</p>
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
              <button onClick={() => setShowRatingModal(false)} className={`flex-1 px-5 py-3 ${cancelBtn} font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer`}>
                {t('clientDashboard.cancel')}
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('clientDashboard.submitRating')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetName={reportTarget.name}
        targetAvatar={reportTarget.avatar}
        reporterRole="client"
      />

      {/* Remove Project Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setProjectToDelete(null)}></div>
          <div className={`relative ${modalBg} rounded-2xl p-6 w-full max-w-md`}>
            <button onClick={() => setProjectToDelete(null)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500/20 mx-auto mb-4">
                <i className="ri-delete-bin-line text-2xl text-red-500"></i>
              </div>
              <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{t('clientDashboard.removeProject')}</h3>
              <p className={`${textSec} text-sm`}>
                {t('clientDashboard.removeConfirmText')} <span className={`${textPrimary} font-semibold`}>&quot;{projectToDelete.title}&quot;</span>? {t('clientDashboard.removeConfirmEnd')}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setProjectToDelete(null)} className={`flex-1 px-5 py-3 ${cancelBtn} font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap`}>
                {t('clientDashboard.cancel')}
              </button>
              <button onClick={() => handleRemovePostedProject(projectToDelete.id)} className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-delete-bin-line mr-2"></i>{t('clientDashboard.remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientDashboard;
