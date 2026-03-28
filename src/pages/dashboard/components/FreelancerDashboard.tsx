import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReportModal from '../../../components/feature/ReportModal';
import { useTheme } from '../../../contexts/ThemeContext';

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

interface Project {
  id: string;
  title: string;
  description: string;
  client: string;
  clientAvatar: string;
  budget: number;
  status: 'applied' | 'accepted' | 'in-progress' | 'completed' | 'rejected';
  appliedDate: string;
  milestones: Milestone[];
  totalPaid: number;
  comments: Array<{ id: string; author: string; text: string; date: string }>;
  clientRating?: number;
  myRating?: number;
  category?: string;
  skills?: string[];
  deadline?: string;
  clientEmail?: string;
}

const FreelancerDashboard = () => {
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('applied');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [showSubmitDeliverablesModal, setShowSubmitDeliverablesModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ name: string; avatar: string }>({ name: '', avatar: '' });
  const [projectToRemove, setProjectToRemove] = useState<Project | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState<Milestone | null>(null);
  const [newMilestone, setNewMilestone] = useState({ title: '', deliverables: '', amount: 0, duration: '', deadline: '' });
  const [submitNote, setSubmitNote] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [milestoneComment, setMilestoneComment] = useState('');
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  const [appliedProjects, setAppliedProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'E-commerce Website Development',
      description: 'Build a modern e-commerce platform with product catalog, shopping cart, user authentication, payment integration, and admin dashboard. The platform should be responsive and optimized for mobile devices.',
      client: 'TechStore Inc.',
      clientAvatar: 'https://readdy.ai/api/search-image?query=modern%20tech%20startup%20company%20logo%20minimalist%20design%20clean%20professional%20gradient%20simple%20white%20background&width=200&height=200&seq=client1&orientation=squarish',
      budget: 2500,
      status: 'applied',
      appliedDate: '2024-01-15',
      milestones: [],
      totalPaid: 0,
      comments: [],
      category: 'Web Development',
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      deadline: '2024-03-15',
      clientEmail: 'contact@techstore.com',
    },
    {
      id: '2',
      title: 'Mobile App UI Design',
      description: 'Design UI for fitness mobile app including workout tracking, meal planning, progress charts, and social features.',
      client: 'StartupHub',
      clientAvatar: 'https://readdy.ai/api/search-image?query=startup%20company%20logo%20modern%20colorful%20gradient%20design%20simple%20clean%20background%20professional&width=200&height=200&seq=client2&orientation=squarish',
      budget: 1800,
      status: 'rejected',
      appliedDate: '2024-01-12',
      milestones: [],
      totalPaid: 0,
      comments: [],
      category: 'UI/UX Design',
      skills: ['Figma', 'Adobe XD', 'Prototyping'],
      deadline: '2024-02-28',
      clientEmail: 'projects@startuphub.io',
    },
    {
      id: '10',
      title: 'Brand Identity Design',
      description: 'Complete brand identity package including logo design, color palette, typography, business cards, letterhead, and brand guidelines document.',
      client: 'NewBrand Co.',
      clientAvatar: 'https://readdy.ai/api/search-image?query=brand%20design%20company%20logo%20modern%20elegant%20simple%20clean%20background%20professional&width=200&height=200&seq=client10&orientation=squarish',
      budget: 3000,
      status: 'accepted',
      appliedDate: '2024-01-18',
      milestones: [],
      totalPaid: 0,
      comments: [],
      category: 'Graphic Design',
      skills: ['Illustrator', 'Photoshop', 'Branding'],
      deadline: '2024-04-01',
      clientEmail: 'hello@newbrand.co',
    },
  ]);

  const [activeProjects, setActiveProjects] = useState<Project[]>([
    {
      id: '3',
      title: 'WordPress Blog Setup',
      description: 'Setting up a professional WordPress blog with custom theme',
      client: 'Digital Media Co.',
      clientAvatar: 'https://readdy.ai/api/search-image?query=digital%20media%20company%20logo%20creative%20modern%20design%20colorful%20simple%20background%20professional&width=200&height=200&seq=client3&orientation=squarish',
      budget: 1500,
      status: 'in-progress',
      appliedDate: '2024-01-08',
      milestones: [
        {
          id: 'm1',
          title: 'Initial Setup & Theme Installation',
          deliverables: 'WordPress installed, hosting configured, theme set up and customized with brand colors',
          amount: 500,
          duration: '1 week',
          deadline: '2024-01-15',
          status: 'finished',
          submittedDate: '2024-01-10',
          approvedDate: '2024-01-11',
          finishedDate: '2024-01-12',
          comments: [
            { id: 'mc1', author: 'Digital Media Co.', authorRole: 'client', text: 'Looks great, approved!', date: '2024-01-11' },
          ],
        },
        {
          id: 'm2',
          title: 'Content Migration & Plugin Setup',
          deliverables: 'All existing blog posts migrated, SEO plugin configured, contact form plugin installed',
          amount: 600,
          duration: '1 week',
          deadline: '2024-01-22',
          status: 'submitted',
          submittedDate: '2024-01-18',
          comments: [],
        },
        {
          id: 'm3',
          title: 'Final Testing & Launch',
          deliverables: 'Cross-browser testing complete, performance optimized, site launched on production domain',
          amount: 400,
          duration: '3 days',
          deadline: '2024-01-25',
          status: 'approved',
          approvedDate: '2024-01-20',
          comments: [
            { id: 'mc2', author: 'Digital Media Co.', authorRole: 'client', text: 'Plan looks good, go ahead!', date: '2024-01-20' },
          ],
        },
      ],
      totalPaid: 500,
      comments: [
        { id: 'c1', author: 'Digital Media Co.', text: 'Great work on the initial setup!', date: '2024-01-11' },
      ],
    },
    {
      id: '4',
      title: 'API Integration Project',
      description: 'Integrate third-party APIs into existing platform',
      client: 'FinTech Solutions',
      clientAvatar: 'https://readdy.ai/api/search-image?query=fintech%20company%20logo%20modern%20professional%20green%20gradient%20simple%20clean%20background&width=200&height=200&seq=client4&orientation=squarish',
      budget: 3200,
      status: 'in-progress',
      appliedDate: '2024-01-05',
      milestones: [
        {
          id: 'm4',
          title: 'API Design & Documentation',
          deliverables: 'Complete API specification document, endpoint designs, authentication flow diagrams',
          amount: 800,
          duration: '1 week',
          deadline: '2024-01-12',
          status: 'finished',
          submittedDate: '2024-01-08',
          approvedDate: '2024-01-09',
          finishedDate: '2024-01-10',
          comments: [],
        },
        {
          id: 'm5',
          title: 'Backend Implementation',
          deliverables: 'All API endpoints implemented with authentication, rate limiting, and error handling',
          amount: 1200,
          duration: '2 weeks',
          deadline: '2024-01-26',
          status: 'pending',
          comments: [],
        },
        {
          id: 'm6',
          title: 'Testing & Deployment',
          deliverables: 'Unit tests, integration tests, staging deployment, production deployment',
          amount: 1200,
          duration: '1 week',
          deadline: '2024-02-02',
          status: 'rejected',
          comments: [
            { id: 'mc3', author: 'FinTech Solutions', authorRole: 'client', text: 'Budget is too high for testing phase. Can you reduce to $900?', date: '2024-01-20' },
          ],
          rejectionComment: 'Budget is too high for testing phase. Can you reduce to $900?',
        },
        {
          id: 'm7',
          title: 'Performance Monitoring Setup',
          deliverables: 'APM dashboard, alerting rules, performance baseline documentation',
          amount: 400,
          duration: '3 days',
          deadline: '2024-01-10',
          status: 'late',
          comments: [],
        },
      ],
      totalPaid: 800,
      comments: [
        { id: 'c2', author: 'FinTech Solutions', text: 'The API documentation is excellent.', date: '2024-01-09' },
      ],
    },
  ]);

  const [completedProjects, setCompletedProjects] = useState<Project[]>([
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

  const stats = {
    activeProjects: activeProjects.length,
    totalEarnings:
      activeProjects.reduce((sum, p) => sum + p.totalPaid, 0) +
      completedProjects.reduce((sum, p) => sum + p.totalPaid, 0),
    pendingApplications: appliedProjects.filter((p) => p.status === 'applied').length,
    completed: completedProjects.length,
  };

  const getMilestoneStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: 'ri-time-line', label: t('freelancerDashboard.pendingApproval') },
      approved: { bg: 'bg-green-500/15', text: 'text-green-400', icon: 'ri-check-line', label: t('freelancerDashboard.approved') },
      rejected: { bg: 'bg-red-500/15', text: 'text-red-400', icon: 'ri-close-circle-line', label: t('freelancerDashboard.rejected') },
      submitted: { bg: 'bg-teal-500/15', text: 'text-teal-400', icon: 'ri-upload-2-line', label: t('freelancerDashboard.submitted') },
      late: { bg: 'bg-orange-500/15', text: 'text-orange-400', icon: 'ri-alarm-warning-line', label: t('freelancerDashboard.late') },
      finished: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: 'ri-checkbox-circle-line', label: t('freelancerDashboard.finished') },
    };
    return config[status] || { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: 'ri-question-line', label: status };
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

  const allMilestonesFinished = (project: Project) =>
    project.milestones.length > 0 && project.milestones.every(m => m.status === 'finished');

  const handleViewProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetailModal(true);
  };

  const handleRemoveProject = (project: Project) => {
    setProjectToRemove(project);
    setShowRemoveConfirmModal(true);
  };

  const confirmRemoveProject = () => {
    if (projectToRemove) {
      setAppliedProjects(appliedProjects.filter(p => p.id !== projectToRemove.id));
      setShowRemoveConfirmModal(false);
      setProjectToRemove(null);
    }
  };

  const handleStartProject = (project: Project) => {
    setActiveTab('active');
  };

  const handleAddNewMilestone = () => {
    if (!selectedProject || !newMilestone.title.trim()) return;
    const milestone: Milestone = {
      id: `m-${Date.now()}`,
      title: newMilestone.title,
      deliverables: newMilestone.deliverables,
      amount: newMilestone.amount,
      duration: newMilestone.duration,
      deadline: newMilestone.deadline,
      status: 'pending',
      comments: [],
    };
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id
          ? { ...p, milestones: [...p.milestones, milestone] }
          : p
      )
    );
    setShowMilestoneModal(false);
    setNewMilestone({ title: '', deliverables: '', amount: 0, duration: '', deadline: '' });
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone({ ...milestone });
    setShowEditMilestoneModal(true);
  };

  const handleSaveEditedMilestone = () => {
    if (!editingMilestone || !selectedProject) return;
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id
          ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === editingMilestone.id ? { ...editingMilestone, status: 'pending' as const } : m
              ),
            }
          : p
      )
    );
    setShowEditMilestoneModal(false);
    setEditingMilestone(null);
  };

  const handleOpenSubmitDeliverables = (milestone: Milestone, project: Project) => {
    setSubmittingMilestone(milestone);
    setSelectedProject(project);
    setSubmitNote('');
    setShowSubmitDeliverablesModal(true);
  };

  const handleSubmitDeliverables = () => {
    if (!submittingMilestone || !selectedProject) return;
    const today = new Date().toISOString().split('T')[0];
    setActiveProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id
          ? {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === submittingMilestone.id
                  ? {
                      ...m,
                      status: 'submitted' as const,
                      submittedDate: today,
                      comments: submitNote.trim()
                        ? [...m.comments, { id: `mc-${Date.now()}`, author: 'You', authorRole: 'freelancer' as const, text: submitNote, date: today }]
                        : m.comments,
                    }
                  : m
              ),
            }
          : p
      )
    );
    setShowSubmitDeliverablesModal(false);
    setSubmittingMilestone(null);
    setSubmitNote('');
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

  const handleOpenReport = (name: string, avatar: string) => {
    setReportTarget({ name, avatar });
    setShowReportModal(true);
  };

  const getMilestoneProgress = (milestones: Milestone[]) => {
    if (milestones.length === 0) return 0;
    const finished = milestones.filter(m => m.status === 'finished').length;
    return Math.round((finished / milestones.length) * 100);
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          {appliedProjects.map((project) => (
            <div key={project.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <img src={project.clientAvatar} alt={project.client} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-white/60 text-sm">{t('freelancerDashboard.client')} {project.client}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 ${getStatusColor(project.status)} font-semibold rounded-lg whitespace-nowrap capitalize`}>{project.status}</span>
              </div>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">{project.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.totalBudget')}</span>
                  <p className="text-white font-bold text-lg">${project.budget}</p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.appliedDate')}</span>
                  <p className="text-white font-bold text-lg">{project.appliedDate}</p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.category')}</span>
                  <p className="text-white font-bold text-lg">{project.category || t('freelancerDashboard.noAvailable')}</p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.projectDeadline')}</span>
                  <p className="text-white font-bold text-lg">{project.deadline || t('freelancerDashboard.noAvailable')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                <button onClick={() => handleViewProjectDetails(project)} className="px-4 py-2 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer">
                  <i className="ri-eye-line mr-2"></i>{t('freelancerDashboard.viewDetails')}
                </button>
                {project.status === 'accepted' && (
                  <button onClick={() => handleStartProject(project)} className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                    <i className="ri-play-line mr-2"></i>{t('freelancerDashboard.startProject')}
                  </button>
                )}
                {project.status === 'applied' && (
                  <button onClick={() => handleRemoveProject(project)} className="px-4 py-2 bg-red-500/20 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-colors whitespace-nowrap cursor-pointer">
                    <i className="ri-close-circle-line mr-2"></i>{t('freelancerDashboard.withdrawApplication')}
                  </button>
                )}
                {project.status === 'rejected' && (
                  <button onClick={() => handleRemoveProject(project)} className="px-4 py-2 bg-white/5 text-white/60 font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer">
                    <i className="ri-delete-bin-line mr-2"></i>{t('freelancerDashboard.removeFromList')}
                  </button>
                )}
              </div>
            </div>
          ))}
          {appliedProjects.length === 0 && (
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
          {activeProjects.map((project) => (
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
                    onClick={() => handleOpenReport(project.client, project.clientAvatar)}
                    className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors whitespace-nowrap cursor-pointer text-sm"
                  >
                    <i className="ri-flag-line mr-1"></i>{t('freelancerDashboard.report')}
                  </button>
                  <button
                    onClick={() => { setSelectedProject(project); setShowMilestoneModal(true); }}
                    className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer text-sm"
                  >
                    <i className="ri-add-line mr-1"></i>{t('freelancerDashboard.addMilestone')}
                  </button>
                </div>
              </div>

              {/* Budget & Progress */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.totalBudget')}</span>
                  <p className="text-white font-bold text-xl">${project.budget}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.totalPaid')}</span>
                  <p className="text-green-400 font-bold text-xl">${project.totalPaid}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.remaining')}</span>
                  <p className="text-orange-400 font-bold text-xl">${project.budget - project.totalPaid}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-white/60 text-sm">{t('freelancerDashboard.progress')}</span>
                  <p className="text-teal-400 font-bold text-xl">{getMilestoneProgress(project.milestones)}%</p>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                    <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${getMilestoneProgress(project.milestones)}%` }}></div>
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
                  {project.milestones.map((milestone) => {
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
                                <h5 className="text-white font-semibold">{milestone.title}</h5>
                                <span className={`px-2.5 py-0.5 ${cfg.bg} ${cfg.text} text-xs font-semibold rounded-full whitespace-nowrap`}>
                                  {cfg.label}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm ml-8">
                                <span className="text-green-400 font-semibold">${milestone.amount}</span>
                                <span className="text-white/50"><i className="ri-time-line mr-1"></i>{milestone.duration}</span>
                                <span className="text-white/50"><i className="ri-calendar-line mr-1"></i>{t('freelancerDashboard.dueLabel')} {milestone.deadline}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Action buttons */}
                              {(milestone.status === 'pending' || milestone.status === 'rejected') && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedProject(project); handleEditMilestone(milestone); }}
                                  className="px-3 py-1.5 bg-white/5 text-white text-xs font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <i className="ri-edit-line mr-1"></i>{t('freelancerDashboard.edit')}
                                </button>
                              )}
                              {milestone.status === 'approved' && (
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
                              <p className="text-white/80 text-sm mt-1">{milestone.deliverables}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-white/50">
                              {milestone.submittedDate && <span><i className="ri-upload-line mr-1"></i>{t('freelancerDashboard.submittedLabel')} {milestone.submittedDate}</span>}
                              {milestone.approvedDate && <span className="text-green-400"><i className="ri-check-line mr-1"></i>{t('freelancerDashboard.approvedLabel')} {milestone.approvedDate}</span>}
                              {milestone.finishedDate && <span className="text-emerald-400"><i className="ri-money-dollar-circle-line mr-1"></i>{t('freelancerDashboard.paidLabel')} {milestone.finishedDate}</span>}
                            </div>

                            {milestone.rejectionComment && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <i className="ri-close-circle-line text-red-400 text-sm"></i>
                                  <span className="text-red-400 text-xs font-semibold">{t('freelancerDashboard.rejectionFeedback')}</span>
                                </div>
                                <p className="text-red-300/80 text-sm">{milestone.rejectionComment}</p>
                              </div>
                            )}

                            {milestone.status === 'late' && (
                              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <i className="ri-alarm-warning-line text-orange-400 text-sm"></i>
                                  <span className="text-orange-400 text-sm font-medium">{t('freelancerDashboard.pastDeadline')} ({milestone.deadline})</span>
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
                              {milestone.status !== 'finished' && (
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
                <h4 className="text-lg font-bold text-white mb-4">{t('freelancerDashboard.projectComments')}</h4>
                <div className="space-y-3 mb-4">
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
                  <button onClick={() => handleAddComment(project.id)} className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                    {t('common.send')}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                    onClick={() => handleOpenReport(project.client, project.clientAvatar)}
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
      {showProjectDetailModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProjectDetailModal(false)}></div>
          <div className={`relative rounded-2xl border p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto ${
            isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'
          }`}>
            <button onClick={() => setShowProjectDetailModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="flex items-center gap-4 mb-6">
              <img src={selectedProject.clientAvatar} alt={selectedProject.client} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{selectedProject.title}</h3>
                <p className={isLightMode ? 'text-gray-500' : 'text-white/60'}>by {selectedProject.client}</p>
              </div>
            </div>
            <div className="mb-6">
              <span className={`px-4 py-2 ${getStatusColor(selectedProject.status)} font-semibold rounded-lg whitespace-nowrap capitalize inline-block`}>
                {selectedProject.status}
              </span>
            </div>
            <div className="mb-6">
              <h4 className={`text-lg font-semibold mb-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('freelancerDashboard.projectDescription')}</h4>
              <p className={`leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-white/70'}`}>{selectedProject.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-sm block mb-1 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('freelancerDashboard.totalBudget')}</span>
                <p className={`font-bold text-xl ${isLightMode ? 'text-gray-900' : 'text-white'}`}>${selectedProject.budget}</p>
              </div>
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-sm block mb-1 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('freelancerDashboard.category')}</span>
                <p className={`font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{selectedProject.category || t('freelancerDashboard.noAvailable')}</p>
              </div>
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-sm block mb-1 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('freelancerDashboard.projectDeadline')}</span>
                <p className={`font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{selectedProject.deadline || t('freelancerDashboard.noAvailable')}</p>
              </div>
              <div className={`rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border border-gray-200' : 'bg-white/5'}`}>
                <span className={`text-sm block mb-1 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('freelancerDashboard.appliedDate')}</span>
                <p className={`font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{selectedProject.appliedDate}</p>
              </div>
            </div>
            {selectedProject.skills && selectedProject.skills.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-lg font-semibold mb-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('freelancerDashboard.requiredSkills')}</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-teal-500/20 text-teal-600 text-sm font-medium rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            <div className={`flex gap-3 pt-4 border-t ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
              <button onClick={() => setShowProjectDetailModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {t('common.close')}
              </button>
              {selectedProject.status === 'accepted' && (
                <button onClick={() => { setShowProjectDetailModal(false); handleStartProject(selectedProject); }} className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                  <i className="ri-play-line mr-2"></i>{t('freelancerDashboard.startProject')}
                </button>
              )}
              {(selectedProject.status === 'applied' || selectedProject.status === 'rejected') && (
                <button onClick={() => { setShowProjectDetailModal(false); handleRemoveProject(selectedProject); }} className="flex-1 px-5 py-3 bg-red-500/20 text-red-500 font-semibold rounded-lg hover:bg-red-500/30 transition-colors whitespace-nowrap cursor-pointer">
                  {selectedProject.status === 'applied' ? t('freelancerDashboard.withdrawApplication') : t('freelancerDashboard.removeFromList')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirmModal && projectToRemove && (
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
                {projectToRemove.status === 'applied' ? t('freelancerDashboard.withdrawConfirm') : t('freelancerDashboard.removeConfirm')}
              </h3>
              <p className={isLightMode ? 'text-gray-500' : 'text-white/60'}>
                {projectToRemove.status === 'applied'
                  ? `${t('freelancerDashboard.withdrawConfirmText')} "${projectToRemove.title}"?`
                  : `${t('freelancerDashboard.removeConfirmText')} "${projectToRemove.title}" ${t('freelancerDashboard.fromYourList')}`}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRemoveConfirmModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {t('common.cancel')}
              </button>
              <button onClick={confirmRemoveProject} className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer">
                {projectToRemove.status === 'applied' ? t('freelancerDashboard.withdrawApplication') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showMilestoneModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMilestoneModal(false)}></div>
          <div className={`relative rounded-2xl border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'
          }`}>
            <button onClick={() => setShowMilestoneModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className={`text-2xl font-bold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('freelancerDashboard.createMilestone')}</h3>
            <p className={`text-sm mb-6 ${isLightMode ? 'text-gray-500' : 'text-white/50'}`}>{t('freelancerDashboard.createMilestoneSubtitle')}</p>
            <div className="space-y-4">
              <div>
                <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.milestoneTitle')}</label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder={t('freelancerDashboard.milestoneTitlePlaceholder')}
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                    isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.deliverables_label')}</label>
                <textarea
                  value={newMilestone.deliverables}
                  onChange={(e) => setNewMilestone({ ...newMilestone, deliverables: e.target.value })}
                  rows={3}
                  maxLength={500}
                  placeholder={t('freelancerDashboard.deliverables_placeholder')}
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 resize-none ${
                    isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  }`}
                ></textarea>
                <p className="text-gray-500 text-xs mt-1 text-right">{newMilestone.deliverables.length}/500</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.budget')}</label>
                  <input
                    type="number"
                    value={newMilestone.amount || ''}
                    onChange={(e) => setNewMilestone({ ...newMilestone, amount: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                      isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.duration')}</label>
                  <input
                    type="text"
                    value={newMilestone.duration}
                    onChange={(e) => setNewMilestone({ ...newMilestone, duration: e.target.value })}
                    placeholder={t('freelancerDashboard.durationPlaceholder')}
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                      isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.deadline')}</label>
                <input
                  type="date"
                  value={newMilestone.deadline}
                  onChange={(e) => setNewMilestone({ ...newMilestone, deadline: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                    isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  }`}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowMilestoneModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAddNewMilestone}
                  disabled={!newMilestone.title.trim() || !newMilestone.deliverables.trim() || newMilestone.amount <= 0}
                  className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('freelancerDashboard.submitForApproval')}
                </button>
              </div>
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
              {editingMilestone.status === 'rejected'
                ? 'This milestone was rejected. Update it and resubmit for approval.'
                : 'Changes will require client approval.'}
            </p>

            {editingMilestone.rejectionComment && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-close-circle-line text-red-400 text-sm"></i>
                  <span className="text-red-400 text-xs font-semibold">{t('freelancerDashboard.clientFeedback')}</span>
                </div>
                <p className="text-red-500 text-sm">{editingMilestone.rejectionComment}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.milestoneTitle')}</label>
                <input
                  type="text"
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                    isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>
              <div>
                <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.deliverables_label')}</label>
                <textarea
                  value={editingMilestone.deliverables}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, deliverables: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 resize-none ${
                    isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800' : 'bg-white/5 border-white/10 text-white'
                  }`}
                ></textarea>
                <p className="text-gray-500 text-xs mt-1 text-right">{editingMilestone.deliverables.length}/500</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.budget')}</label>
                  <input
                    type="number"
                    value={editingMilestone.amount}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, amount: Number(e.target.value) })}
                    min="0"
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 ${
                      isLightMode ? 'bg-gray-50 border-gray-300 text-gray-800' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('freelancerDashboard.duration')}</label>
                  <input
                    type="text"
                    value={editingMilestone.duration}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, duration: e.target.value })}
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
                  value={editingMilestone.deadline}
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
              <h4 className={`font-semibold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{submittingMilestone.title}</h4>
              <p className={`text-sm mb-2 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{submittingMilestone.deliverables}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-500 font-semibold">${submittingMilestone.amount}</span>
                <span className={isLightMode ? 'text-gray-400' : 'text-white/50'}>{t('freelancerDashboard.dueLabel')} {submittingMilestone.deadline}</span>
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

            <div className="flex gap-3">
              <button onClick={() => setShowSubmitDeliverablesModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {t('common.cancel')}
              </button>
              <button onClick={handleSubmitDeliverables} className="flex-1 px-5 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-upload-2-line mr-2"></i>{t('freelancerDashboard.submit')}
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

      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} targetName={reportTarget.name} targetAvatar={reportTarget.avatar} reporterRole="freelancer" />
    </>
  );
};

export default FreelancerDashboard;
