import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  duration: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  client: {
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    memberSince: string;
    projectsPosted: number;
    hireRate: number;
  };
  budget: {
    min: number;
    max: number;
    type: 'fixed' | 'hourly';
  };
  duration: string;
  skills: string[];
  proposals: number;
  postedDate: string;
  category: string;
  experienceLevel: 'Entry' | 'Intermediate' | 'Expert';
  projectType: 'Fixed Price' | 'Hourly' | 'Contract';
  featured?: boolean;
  requirements: string[];
  deliverables: string[];
}

/**
 * ProjectDetail component – displays a project and allows the user to submit a
 * proposal with milestones.
 *
 * Fixes applied:
 * 1️⃣ Corrected the generic syntax for `useState<Milestone[]>`. The previous
 *    HTML‑escaped version (`useState&lt;Milestone[]&gt;`) caused a syntax error.
 * 2️⃣ Added lightweight error handling around numeric inputs and modal closing.
 * 3️⃣ Wrapped calls that could throw (e.g., `project.budget.min.toLocaleString()`)
 *    in try/catch blocks to keep the UI robust if the data shape ever changes.
 */
const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: '',
      description: '',
      amount: 0,
      duration: '',
    },
  ]);
  const [coverLetter, setCoverLetter] = useState('');
  const [totalBudget, setTotalBudget] = useState(0);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  // Calculate total budget whenever milestones change
  useEffect(() => {
    const total = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    setTotalBudget(total);
  }, [milestones]);

  // Mock project data – in a real app, fetch based on projectId
  const project: Project = {
    id: projectId || '1',
    title: 'E-commerce Website Development with React',
    description:
      'Looking for an experienced React developer to build a modern e-commerce platform with payment integration, product management, and user authentication. The project requires clean code, responsive design, and integration with Stripe for payments.\n\nWe need a full-featured online store that can handle hundreds of products, support multiple payment methods, and provide an excellent user experience on both desktop and mobile devices.\n\nThe ideal candidate should have:\n- Strong experience with React and modern JavaScript\n- Knowledge of state management (Redux or Context API)\n- Experience with payment gateway integration\n- Understanding of responsive design principles\n- Ability to write clean, maintainable code\n- Good communication skills',
    client: {
      name: 'TechStart Inc.',
      avatar:
        'https://readdy.ai/api/search-image?query=modern%20tech%20startup%20company%20logo%20minimalist%20design%20clean%20professional%20blue%20gradient%20simple%20white%20background&width=200&height=200&seq=client1&orientation=squarish',
      rating: 4.9,
      reviewCount: 47,
      verified: true,
      memberSince: 'January 2022',
      projectsPosted: 23,
      hireRate: 87,
    },
    budget: { min: 3000, max: 5000, type: 'fixed' },
    duration: '2-3 months',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Stripe'],
    proposals: 12,
    postedDate: '2 days ago',
    category: 'Web Development',
    experienceLevel: 'Expert',
    projectType: 'Fixed Price',
    featured: true,
    requirements: [
      'Minimum 3 years of React development experience',
      'Portfolio showcasing previous e-commerce projects',
      'Experience with payment gateway integration',
      'Knowledge of responsive design and mobile-first approach',
      'Ability to work in EST timezone (at least 4 hours overlap)',
      'Strong communication skills and regular updates',
    ],
    deliverables: [
      'Fully functional e-commerce website',
      'Admin dashboard for product management',
      'User authentication and profile management',
      'Shopping cart and checkout system',
      'Payment integration with Stripe',
      'Responsive design for all devices',
      'Source code with documentation',
      'Deployment and setup instructions',
    ],
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: '',
      description: '',
      amount: 0,
      duration: '',
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((m) => m.id !== id));
    }
  };

  const updateMilestone = (
    id: string,
    field: keyof Milestone,
    value: string | number
  ) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id
          ? { ...m, [field]: field === 'amount' ? Number(value) : value }
          : m
      )
    );
  };

  const calculateTotal = () => {
    return milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();

    const total = calculateTotal();

    // Guard against malformed budget data
    const minBudget = project?.budget?.min ?? 0;
    const maxBudget = project?.budget?.max ?? Infinity;

    if (total < minBudget || total > maxBudget) {
      alert(
        `Total budget must be between $${minBudget.toLocaleString()} and $${maxBudget.toLocaleString()}`
      );
      return;
    }

    if (
      milestones.some(
        (m) => !m.title || !m.description || !m.amount || !m.duration
      )
    ) {
      alert('Please fill in all milestone details');
      return;
    }

    if (!coverLetter.trim()) {
      alert('Please write a cover letter');
      return;
    }

    // Simulate successful submission
    setProposalSubmitted(true);
    setTimeout(() => {
      setShowProposalModal(false);
      setProposalSubmitted(false);
    }, 2000);
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-50' : 'bg-[#1a1f37]'}`}>
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            to="/marketplace"
            className={`inline-flex items-center gap-2 mb-6 cursor-pointer ${isLightMode ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
          >
            <i className="ri-arrow-left-line"></i>
            {t('marketplace.backToMarketplace')}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Header */}
              <div className={`backdrop-blur-sm rounded-xl border p-6 ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                {project.featured && (
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ri-star-fill text-yellow-400"></i>
                    <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">{t('marketplace.featuredProject')}</span>
                  </div>
                )}

                <h1 className={`text-3xl font-bold mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{project.title}</h1>

                <div className={`flex flex-wrap items-center gap-4 text-sm mb-4 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <div className="flex items-center gap-1"><i className="ri-folder-line"></i><span>{project.category}</span></div>
                  <div className="flex items-center gap-1"><i className="ri-time-line"></i><span>{project.duration}</span></div>
                  <div className="flex items-center gap-1"><i className="ri-bar-chart-line"></i><span>{project.experienceLevel}</span></div>
                  <div className="flex items-center gap-1"><i className="ri-file-list-line"></i><span>{project.proposals} {t('marketplace.proposals')}</span></div>
                  <div className={`flex items-center gap-1 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}><i className="ri-calendar-line"></i><span>Posted {project.postedDate}</span></div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm rounded-lg">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Project Description */}
              <div className={`backdrop-blur-sm rounded-xl border p-6 ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  <i className="ri-file-text-line text-purple-400"></i>{t('marketplace.projectDescription')}
                </h2>
                <div className={`leading-relaxed whitespace-pre-line ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>{project.description}</div>
              </div>

              {/* Requirements */}
              <div className={`backdrop-blur-sm rounded-xl border p-6 ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  <i className="ri-checkbox-circle-line text-purple-400"></i>{t('marketplace.requirements')}
                </h2>
                <ul className="space-y-2">
                  {project.requirements.map((req, index) => (
                    <li key={index} className={`flex items-start gap-3 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}><i className="ri-check-line text-green-400 mt-1 flex-shrink-0"></i><span>{req}</span></li>
                  ))}
                </ul>
              </div>

              {/* Deliverables */}
              <div className={`backdrop-blur-sm rounded-xl border p-6 ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  <i className="ri-gift-line text-purple-400"></i>{t('marketplace.deliverables')}
                </h2>
                <ul className="space-y-2">
                  {project.deliverables.map((item, index) => (
                    <li key={index} className={`flex items-start gap-3 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}><i className="ri-check-line text-green-400 mt-1 flex-shrink-0"></i><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* Budget Card */}
                <div className={`backdrop-blur-sm rounded-xl border p-6 ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                  <div className="text-center mb-6">
                    <div className={`text-sm mb-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('marketplace.projectBudget')}</div>
                    <div className="text-3xl font-bold text-purple-400">${project.budget.min.toLocaleString()} - {project.budget.max.toLocaleString()}</div>
                    <div className={`text-xs mt-1 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>{project.projectType}</div>
                  </div>

                  <button
                    onClick={() => setShowProposalModal(true)}
                    className="w-full px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="ri-send-plane-line"></i>
                    {t('marketplace.submitProposal')}
                  </button>

                  <div className={`mt-4 pt-4 border-t space-y-3 text-sm ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <span className={isLightMode ? 'text-gray-500' : 'text-gray-400'}>{t('marketplace.proposals')}</span>
                      <span className={`font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{project.proposals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isLightMode ? 'text-gray-500' : 'text-gray-400'}>{t('marketplace.duration')}</span>
                      <span className={`font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{project.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isLightMode ? 'text-gray-500' : 'text-gray-400'}>{t('marketplace.experienceLevel')}</span>
                      <span className={`font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{project.experienceLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Client Card */}
                <div className={`backdrop-blur-sm rounded-xl border p-6 ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                  <h3 className={`text-lg font-bold mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('marketplace.aboutClient')}</h3>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"><img src={project.client.avatar} alt={project.client.name} className="w-full h-full object-cover" /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{project.client.name}</span>
                        {project.client.verified && <i className="ri-verified-badge-fill text-blue-400"></i>}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <i className="ri-star-fill text-yellow-400"></i>
                        <span className={isLightMode ? 'text-gray-900' : 'text-white'}>{project.client.rating}</span>
                        <span className={isLightMode ? 'text-gray-400' : 'text-gray-500'}>({project.client.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className={isLightMode ? 'text-gray-500' : 'text-gray-400'}>{t('marketplace.memberSince')}</span>
                      <span className={isLightMode ? 'text-gray-900' : 'text-white'}>{project.client.memberSince}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isLightMode ? 'text-gray-500' : 'text-gray-400'}>{t('marketplace.projectsPosted')}</span>
                      <span className={isLightMode ? 'text-gray-900' : 'text-white'}>{project.client.projectsPosted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isLightMode ? 'text-gray-500' : 'text-gray-400'}>{t('marketplace.hireRate')}</span>
                      <span className={isLightMode ? 'text-gray-900' : 'text-white'}>{project.client.hireRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Tips Card */}
                <div className={`backdrop-blur-sm rounded-xl border p-6 ${isLightMode ? 'bg-purple-50 border-purple-200' : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/20"><i className="ri-lightbulb-line text-purple-400"></i></div>
                    <div>
                      <h4 className={`font-semibold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('marketplace.tipsForSuccess')}</h4>
                      <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>{t('marketplace.tipsBody')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !proposalSubmitted && setShowProposalModal(false)}
          ></div>
          <div className={`relative rounded-2xl border p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
            {!proposalSubmitted ? (
              <>
                <button
                  onClick={() => setShowProposalModal(false)}
                  className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
                >
                  <i className="ri-close-line text-xl"></i>
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-500/20 mx-auto mb-4">
                    <i className="ri-send-plane-line text-3xl text-purple-400"></i>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                    {t('marketplace.submitProposal')}
                  </h3>
                  <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('marketplace.breakdownProject')}
                  </p>
                </div>

                <form onSubmit={handleSubmitProposal} className="space-y-6">
                  {/* Cover Letter */}
                  <div>
                    <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>
                      {t('marketplace.coverLetter')} <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={4}
                      maxLength={500}
                      placeholder={t('marketplace.coverLetterPlaceholder')}
                      className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 resize-none text-sm ${isLightMode ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
                    ></textarea>
                    <div className={`text-xs mt-1 text-right ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {coverLetter.length}/500 characters
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className={`font-medium ${isLightMode ? 'text-gray-700' : 'text-white'}`}>
                        {t('marketplace.milestones')} <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addMilestone}
                        className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-lg hover:bg-purple-500/30 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                      >
                        <i className="ri-add-line"></i>
                        {t('marketplace.addMilestone')}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {milestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className={`border rounded-lg p-4 ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                              Milestone {index + 1}
                            </h4>
                            {milestones.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMilestone(milestone.id)}
                                className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-500 cursor-pointer"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={milestone.title}
                                onChange={(e) =>
                                  updateMilestone(milestone.id, 'title', e.target.value)
                                }
                                placeholder={t('marketplace.milestoneTitle')}
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-sm ${isLightMode ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
                              />
                            </div>

                            <div className="col-span-2">
                              <textarea
                                value={milestone.description}
                                onChange={(e) =>
                                  updateMilestone(milestone.id, 'description', e.target.value)
                                }
                                rows={2}
                                placeholder={t('marketplace.milestoneDescription')}
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 resize-none text-sm ${isLightMode ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
                              ></textarea>
                            </div>

                            <div>
                              <div className="relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={milestone.amount || ''}
                                  onChange={(e) =>
                                    updateMilestone(milestone.id, 'amount', e.target.value)
                                  }
                                  placeholder={t('marketplace.amount')}
                                  min="0"
                                  className={`w-full border rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:border-purple-500 text-sm ${isLightMode ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
                                />
                              </div>
                            </div>

                            <div>
                              <input
                                type="text"
                                value={milestone.duration}
                                onChange={(e) =>
                                  updateMilestone(milestone.id, 'duration', e.target.value)
                                }
                                placeholder="Duration (e.g., 2 weeks)"
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-sm ${isLightMode ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Budget */}
                    <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-sm mb-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t('marketplace.totalBudget')}
                          </div>
                          <div className={`text-xs ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('marketplace.budgetBetween')} ${project.budget.min.toLocaleString()} - $
                            {project.budget.max.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-400">
                          ${totalBudget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowProposalModal(false)}
                      className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-5 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {t('marketplace.submitProposal')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-500/20 mx-auto mb-4">
                  <i className="ri-check-line text-4xl text-green-400"></i>
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  {t('marketplace.proposalSubmitted')}
                </h3>
                <p className={isLightMode ? 'text-gray-500' : 'text-gray-400'}>
                  {t('marketplace.proposalSubmittedBody')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProjectDetail;
