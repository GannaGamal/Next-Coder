import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ComplaintModal from '../../components/feature/ComplaintModal';
import RoleGateModal from '../../components/feature/RoleGateModal';
import CustomSelect from '../../components/base/CustomSelect';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

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
    clientId: string;
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
}

const FreelanceMarketplace = () => {
  const { user, isAuthenticated } = useAuth();
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showRoleGateModal, setShowRoleGateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [deliverables, setDeliverables] = useState<string[]>(['']);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ name: string; avatar: string } | null>(null);

  const handlePostProject = () => {
    if (!isAuthenticated || !user?.roles.includes('client')) {
      setShowRoleGateModal(true);
      return;
    }
    setShowPostModal(true);
  };

  const allSkills = [
    'JavaScript',
    'React',
    'Python',
    'Java',
    'Node.js',
    'TypeScript',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'SEO',
    'Mobile Development',
    'WordPress',
    'Shopify',
    'Video Editing',
    'Social Media',
    'Data Analysis',
    'Machine Learning',
    'AWS',
  ];

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'DevOps',
    'Video & Animation',
  ];

  const projects: Project[] = [
    {
      id: '1',
      title: 'E-commerce Website Development with React',
      description:
        'Looking for an experienced React developer to build a modern e-commerce platform with payment integration, product management, and user authentication. The project requires clean code, responsive design, and integration with Stripe for payments.',
      client: {
        name: 'TechStart Inc.',
        avatar:
          'https://readdy.ai/api/search-image?query=modern%20tech%20startup%20company%20logo%20minimalist%20design%20clean%20professional%20blue%20gradient%20simple%20white%20background&width=200&height=200&seq=client1&orientation=squarish',
        rating: 4.9,
        reviewCount: 47,
        verified: true,
        clientId: '3',
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
    },
    {
      id: '2',
      title: 'Mobile App UI/UX Design for Fitness Platform',
      description:
        'Need a talented UI/UX designer to create modern, intuitive designs for our fitness tracking mobile app. Must include user flows, wireframes, and high-fidelity mockups for iOS and Android.',
      client: {
        name: 'FitLife Studios',
        avatar:
          'https://readdy.ai/api/search-image?query=fitness%20wellness%20company%20logo%20energetic%20design%20vibrant%20colors%20modern%20athletic%20simple%20white%20background&width=200&height=200&seq=client2&orientation=squarish',
        rating: 4.7,
        reviewCount: 32,
        verified: true,
        clientId: '8',
      },
      budget: { min: 2000, max: 3500, type: 'fixed' },
      duration: '1-2 months',
      skills: ['UI/UX Design', 'Figma', 'Mobile Design', 'Prototyping'],
      proposals: 18,
      postedDate: '1 day ago',
      category: 'Design',
      experienceLevel: 'Intermediate',
      projectType: 'Fixed Price',
      featured: true,
    },
    {
      id: '3',
      title: 'Python Data Analysis and Visualization',
      description:
        'Seeking a data analyst to process and visualize large datasets. Create interactive dashboards and generate insights from sales data. Experience with Pandas, NumPy, and visualization libraries required.',
      client: {
        name: 'DataViz Corp',
        avatar:
          'https://readdy.ai/api/search-image?query=data%20analytics%20company%20logo%20abstract%20geometric%20design%20professional%20blue%20purple%20gradient%20simple%20white%20background&width=200&height=200&seq=client3&orientation=squarish',
        rating: 4.8,
        reviewCount: 28,
        verified: false,
        clientId: '3',
      },
      budget: { min: 50, max: 80, type: 'hourly' },
      duration: '1 month',
      skills: ['Python', 'Data Analysis', 'Pandas', 'Matplotlib', 'SQL'],
      proposals: 9,
      postedDate: '3 days ago',
      category: 'Data Science',
      experienceLevel: 'Intermediate',
      projectType: 'Hourly',
    },
    {
      id: '4',
      title: 'Content Writing for Tech Blog - 20 Articles',
      description:
        'Looking for an experienced tech writer to create 20 SEO-optimized articles about software development, AI, and cloud computing. Each article should be 1500-2000 words with proper research and citations.',
      client: {
        name: 'Tech Insights Media',
        avatar:
          'https://readdy.ai/api/search-image?query=media%20publishing%20company%20logo%20modern%20typography%20design%20professional%20elegant%20simple%20white%20background&width=200&height=200&seq=client4&orientation=squarish',
        rating: 4.6,
        reviewCount: 54,
        verified: true,
        clientId: '5',
      },
      budget: { min: 1500, max: 2500, type: 'fixed' },
      duration: '1 month',
      skills: ['Content Writing', 'SEO', 'Technical Writing', 'Research'],
      proposals: 24,
      postedDate: '5 days ago',
      category: 'Writing',
      experienceLevel: 'Intermediate',
      projectType: 'Fixed Price',
    },
    {
      id: '5',
      title: 'WordPress Website Customization and Plugin Development',
      description:
        'Need a WordPress expert to customize an existing theme and develop custom plugins for enhanced functionality. Must have experience with PHP, WordPress hooks, and custom post types.',
      client: {
        name: 'Digital Solutions LLC',
        avatar:
          'https://readdy.ai/api/search-image?query=digital%20agency%20company%20logo%20creative%20design%20colorful%20modern%20professional%20simple%20white%20background&width=200&height=200&seq=client5&orientation=squarish',
        rating: 4.5,
        reviewCount: 19,
        verified: false,
        clientId: '8',
      },
      budget: { min: 40, max: 65, type: 'hourly' },
      duration: '2-3 weeks',
      skills: ['WordPress', 'PHP', 'JavaScript', 'CSS', 'MySQL'],
      proposals: 15,
      postedDate: '1 week ago',
      category: 'Web Development',
      experienceLevel: 'Intermediate',
      projectType: 'Hourly',
    },
    {
      id: '6',
      title: 'Social Media Marketing Campaign for Product Launch',
      description:
        'Seeking a social media expert to plan and execute a comprehensive marketing campaign across Instagram, Facebook, and LinkedIn for our new product launch. Includes content creation and ad management.',
      client: {
        name: 'BrandBoost Marketing',
        avatar:
          'https://readdy.ai/api/search-image?query=marketing%20agency%20company%20logo%20dynamic%20design%20vibrant%20colors%20creative%20professional%20simple%20white%20background&width=200&height=200&seq=client6&orientation=squarish',
        rating: 4.9,
        reviewCount: 63,
        verified: true,
        clientId: '3',
      },
      budget: { min: 2500, max: 4000, type: 'fixed' },
      duration: '2 months',
      skills: ['Social Media', 'Marketing', 'Content Creation', 'Facebook Ads'],
      proposals: 21,
      postedDate: '4 days ago',
      category: 'Marketing',
      experienceLevel: 'Expert',
      projectType: 'Fixed Price',
    },
    {
      id: '7',
      title: 'iOS and Android Mobile App Development',
      description:
        'Build a cross-platform mobile app for restaurant ordering and delivery. Features include menu browsing, cart management, payment processing, and real-time order tracking. React Native preferred.',
      client: {
        name: 'FoodHub Technologies',
        avatar:
          'https://readdy.ai/api/search-image?query=food%20delivery%20tech%20company%20logo%20modern%20minimalist%20design%20orange%20red%20colors%20simple%20white%20background&width=200&height=200&seq=client7&orientation=squarish',
        rating: 4.7,
        reviewCount: 41,
        verified: true,
        clientId: '5',
      },
      budget: { min: 8000, max: 12000, type: 'fixed' },
      duration: '3-4 months',
      skills: ['React Native', 'Mobile Development', 'Firebase', 'Payment Integration'],
      proposals: 8,
      postedDate: '2 days ago',
      category: 'Mobile Development',
      experienceLevel: 'Expert',
      projectType: 'Fixed Price',
      featured: true,
    },
    {
      id: '8',
      title: 'Video Editing for YouTube Channel - 10 Videos',
      description:
        'Looking for a skilled video editor to edit 10 educational YouTube videos. Includes cutting, color grading, adding graphics, transitions, and background music. Each video is 10-15 minutes long.',
      client: {
        name: 'EduTube Creators',
        avatar:
          'https://readdy.ai/api/search-image?query=education%20content%20creator%20logo%20playful%20design%20colorful%20modern%20friendly%20simple%20white%20background&width=200&height=200&seq=client8&orientation=squarish',
        rating: 4.8,
        reviewCount: 36,
        verified: false,
        clientId: '3',
      },
      budget: { min: 800, max: 1200, type: 'fixed' },
      duration: '3 weeks',
      skills: ['Video Editing', 'Adobe Premiere', 'After Effects', 'Color Grading'],
      proposals: 19,
      postedDate: '6 days ago',
      category: 'Video & Animation',
      experienceLevel: 'Intermediate',
      projectType: 'Fixed Price',
    },
    {
      id: '9',
      title: 'DevOps Engineer for AWS Infrastructure Setup',
      description:
        'Need an experienced DevOps engineer to set up and configure AWS infrastructure including EC2, RDS, S3, CloudFront, and CI/CD pipelines. Must have Terraform and Docker experience.',
      client: {
        name: 'CloudScale Systems',
        avatar:
          'https://readdy.ai/api/search-image?query=cloud%20computing%20company%20logo%20abstract%20tech%20design%20blue%20gradient%20modern%20professional%20simple%20white%20background&width=200&height=200&seq=client9&orientation=squarish',
        rating: 4.9,
        reviewCount: 52,
        verified: true,
        clientId: '8',
      },
      budget: { min: 80, max: 120, type: 'hourly' },
      duration: '1-2 months',
      skills: ['AWS', 'DevOps', 'Docker', 'Terraform', 'CI/CD'],
      proposals: 7,
      postedDate: '1 day ago',
      category: 'DevOps',
      experienceLevel: 'Expert',
      projectType: 'Hourly',
      featured: true,
    },
    {
      id: '10',
      title: 'Shopify Store Setup and Customization',
      description:
        'Set up a complete Shopify store for fashion brand including theme customization, product uploads, payment gateway integration, and SEO optimization. Experience with Liquid templating required.',
      client: {
        name: 'Fashion Forward Co.',
        avatar:
          'https://readdy.ai/api/search-image?query=fashion%20brand%20company%20logo%20elegant%20design%20minimalist%20chic%20black%20white%20simple%20white%20background&width=200&height=200&seq=client10&orientation=squarish',
        rating: 4.6,
        reviewCount: 25,
        verified: false,
        clientId: '5',
      },
      budget: { min: 1500, max: 2500, type: 'fixed' },
      duration: '3-4 weeks',
      skills: ['Shopify', 'E-commerce', 'Liquid', 'CSS', 'SEO'],
      proposals: 16,
      postedDate: '1 week ago',
      category: 'Web Development',
      experienceLevel: 'Intermediate',
      projectType: 'Fixed Price',
    },
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setBudgetFilter('all');
    setExperienceFilter('all');
    setCategoryFilter('all');
    setProjectTypeFilter('all');
  };

  const filteredProjects = projects.filter((project) => {
    const lowerSearch = searchQuery.toLowerCase();
    const matchesSearch =
      project.title.toLowerCase().includes(lowerSearch) ||
      project.description.toLowerCase().includes(lowerSearch) ||
      project.skills.some((skill) => skill.toLowerCase().includes(lowerSearch));

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) => project.skills.includes(skill));

    const matchesBudget =
      budgetFilter === 'all' ||
      (budgetFilter === 'under1000' && project.budget.type === 'fixed' && project.budget.max < 1000) ||
      (budgetFilter === '1000-5000' &&
        project.budget.type === 'fixed' &&
        project.budget.min >= 1000 &&
        project.budget.max <= 5000) ||
      (budgetFilter === 'over5000' && project.budget.type === 'fixed' && project.budget.min > 5000) ||
      (budgetFilter === 'hourly' && project.budget.type === 'hourly');

    const matchesExperience = experienceFilter === 'all' || project.experienceLevel === experienceFilter;
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    const matchesProjectType = projectTypeFilter === 'all' || project.projectType === projectTypeFilter;

    return (
      matchesSearch &&
      matchesSkills &&
      matchesBudget &&
      matchesExperience &&
      matchesCategory &&
      matchesProjectType
    );
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'newest') {
      // postedDate is a human readable string; fallback to index order if parsing fails
      const dateA = new Date(a.postedDate).getTime() || 0;
      const dateB = new Date(b.postedDate).getTime() || 0;
      return dateB - dateA;
    }
    if (sortBy === 'budget') {
      const aMax = a.budget.type === 'fixed' ? a.budget.max : a.budget.max * 160; // approximate monthly hrs
      const bMax = b.budget.type === 'fixed' ? b.budget.max : b.budget.max * 160;
      return bMax - aMax;
    }
    if (sortBy === 'proposals') {
      return a.proposals - b.proposals; // fewest first
    }
    return 0;
  });

  const featuredProjects = sortedProjects.filter((p) => p.featured);
  const regularProjects = sortedProjects.filter((p) => !p.featured);

  const activeFiltersCount = [
    selectedSkills.length > 0,
    budgetFilter !== 'all',
    experienceFilter !== 'all',
    categoryFilter !== 'all',
    projectTypeFilter !== 'all',
  ].filter(Boolean).length;

  const formatBudget = (budget: Project['budget']) => {
    if (budget.type === 'hourly') {
      return `$${budget.min}-${budget.max}/hr`;
    }
    return `$${budget.min.toLocaleString()}-${budget.max.toLocaleString()}`;
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const updateDeliverable = (index: number, value: string) => {
    const updated = [...deliverables];
    updated[index] = value;
    setDeliverables(updated);
  };

  const handleOpenComplaint = (clientName: string, clientAvatar: string) => {
    setSelectedClient({ name: clientName, avatar: clientAvatar });
    setShowComplaintModal(true);
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-50' : 'bg-[#1a1f37]'}`}>
      <Navbar />
      {/* Complaint Modal */}
      {selectedClient && (
        <ComplaintModal isOpen={showComplaintModal} onClose={() => { setShowComplaintModal(false); setSelectedClient(null); }} targetName={selectedClient.name} targetAvatar={selectedClient.avatar} targetType="client" />
      )}
      <RoleGateModal isOpen={showRoleGateModal} onClose={() => setShowRoleGateModal(false)} requiredRole="client" roleLabel="Client" actionLabel={t('marketplace.postProject')} onRoleAdded={() => setShowPostModal(true)} />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('marketplace.title')}</h1>
            <p className={`text-sm sm:text-base ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('marketplace.subtitle')}</p>
          </div>

          {/* Post Project Card */}
          <div className={`mb-8 backdrop-blur-sm rounded-xl border p-4 sm:p-6 ${isLightMode ? 'bg-purple-50 border-purple-200' : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl border flex-shrink-0 ${isLightMode ? 'bg-purple-100 border-purple-200' : 'bg-purple-500/20 border-purple-500/30'}`}>
                  <i className="ri-briefcase-line text-2xl sm:text-3xl text-purple-500"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-lg sm:text-xl font-bold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('marketplace.haveProject')}</h2>
                  <p className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{t('marketplace.haveProjectSubtitle')}</p>
                </div>
              </div>
              <button onClick={handlePostProject} className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
                <i className="ri-add-line"></i>{t('marketplace.postProject')}
              </button>
            </div>
          </div>

          {/* Post Project Modal */}
          {showPostModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPostModal(false)}></div>
              <div className={`relative rounded-2xl border p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
                <button onClick={() => setShowPostModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
                  <i className="ri-close-line text-xl"></i>
                </button>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-500/20 mx-auto mb-4">
                    <i className="ri-briefcase-line text-3xl text-purple-400"></i>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('marketplace.postNewProject')}</h3>
                  <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('marketplace.fillDetails')}</p>
                </div>
                <form className="space-y-5">
                  <div>
                    <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.projectTitle')}</label>
                    <input type="text" placeholder={t('marketplace.projectTitlePlaceholder')} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`} />
                  </div>
                  <div>
                    <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.description')}</label>
                    <textarea rows={4} placeholder={t('marketplace.descriptionPlaceholder')} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 resize-none ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}></textarea>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`block font-medium ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.requirements')}</label>
                      <button type="button" onClick={addRequirement} className="flex items-center gap-1 text-purple-500 hover:text-purple-400 text-sm cursor-pointer whitespace-nowrap"><i className="ri-add-line"></i>{t('marketplace.addRequirement')}</button>
                    </div>
                    <div className="space-y-2">
                      {requirements.map((req, index) => (
                        <div key={index} className="flex gap-2">
                          <input type="text" value={req} onChange={(e) => updateRequirement(index, e.target.value)} placeholder={`Requirement ${index + 1}`} className={`flex-1 border rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`} />
                          {requirements.length > 1 && <button type="button" onClick={() => removeRequirement(index)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"><i className="ri-delete-bin-line"></i></button>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`block font-medium ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.deliverables')}</label>
                      <button type="button" onClick={addDeliverable} className="flex items-center gap-1 text-purple-500 hover:text-purple-400 text-sm cursor-pointer whitespace-nowrap"><i className="ri-add-line"></i>{t('marketplace.addDeliverable')}</button>
                    </div>
                    <div className="space-y-2">
                      {deliverables.map((del, index) => (
                        <div key={index} className="flex gap-2">
                          <input type="text" value={del} onChange={(e) => updateDeliverable(index, e.target.value)} placeholder={`Deliverable ${index + 1}`} className={`flex-1 border rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`} />
                          {deliverables.length > 1 && <button type="button" onClick={() => removeDeliverable(index)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"><i className="ri-delete-bin-line"></i></button>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.category')}</label>
                      <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={[{ value: 'all', label: t('marketplace.allCategories') }, ...categories.map(cat => ({ value: cat, label: cat }))]} placeholder={t('marketplace.allCategories')} />
                    </div>
                    <div>
                      <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.experienceLevel')}</label>
                      <CustomSelect value={experienceFilter} onChange={setExperienceFilter} options={[{ value: 'all', label: 'Select level' }, { value: 'Entry', label: t('marketplace.entry') }, { value: 'Intermediate', label: t('marketplace.intermediate') }, { value: 'Expert', label: t('marketplace.expert') }]} placeholder="Select level" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.budget')}</label>
                      <CustomSelect value={budgetFilter} onChange={setBudgetFilter} options={[{ value: 'fixed', label: t('marketplace.fixedPrice') }, { value: 'hourly', label: t('marketplace.hourlyRate') }]} placeholder="Budget type" />
                    </div>
                    <div>
                      <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.duration')}</label>
                      <input type="text" placeholder={t('marketplace.durationPlaceholder')} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.minBudget')}</label>
                      <input type="number" placeholder="1000" className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`} />
                    </div>
                    <div>
                      <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.maxBudget')}</label>
                      <input type="number" placeholder="5000" className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`} />
                    </div>
                  </div>
                  <div>
                    <label className={`block font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.requiredSkills')}</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {allSkills.slice(0, 10).map((skill) => (
                        <button key={skill} type="button" className={`px-3 py-1.5 text-sm rounded-lg hover:bg-purple-500 hover:text-white transition-colors cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-white/5 text-gray-400'}`}>{skill}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowPostModal(false)} className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>{t('common.cancel')}</button>
                    <button type="submit" className="flex-1 px-5 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer">{t('marketplace.postProject')}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-72 flex-shrink-0`}>
              <div className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 lg:sticky lg:top-28 overflow-y-auto max-h-[calc(100vh-8rem)] thin-scrollbar ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className={`font-semibold flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                    <i className="ri-filter-3-line"></i>
                    {t('marketplace.filters')}
                    {activeFiltersCount > 0 && <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">{activeFiltersCount}</span>}
                  </h2>
                  {activeFiltersCount > 0 && <button onClick={clearAllFilters} className="text-xs text-purple-500 hover:text-purple-400 cursor-pointer whitespace-nowrap">{t('common.clearAll')}</button>}
                </div>
                <div className="mb-5">
                  <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.category')}</label>
                  <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={[{ value: 'all', label: t('marketplace.allCategories') }, ...categories.map(cat => ({ value: cat, label: cat }))]} placeholder={t('marketplace.allCategories')} />
                </div>
                <div className="mb-5">
                  <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.projectType')}</label>
                  <CustomSelect value={projectTypeFilter} onChange={setProjectTypeFilter} options={[{ value: 'all', label: t('marketplace.allTypes') }, { value: 'Fixed Price', label: t('marketplace.fixedPrice') }, { value: 'Hourly', label: t('marketplace.hourlyRate') }, { value: 'Contract', label: t('marketplace.contract') }]} placeholder={t('marketplace.allTypes')} />
                </div>
                <div className="mb-5">
                  <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.budget')}</label>
                  <CustomSelect value={budgetFilter} onChange={setBudgetFilter} options={[{ value: 'all', label: t('marketplace.anyBudget') }, { value: 'under1000', label: t('marketplace.under1000') }, { value: '1000-5000', label: t('marketplace.range1000to5000') }, { value: 'over5000', label: t('marketplace.over5000') }, { value: 'hourly', label: t('marketplace.hourlyProjects') }]} placeholder={t('marketplace.anyBudget')} />
                </div>
                <div className="mb-5">
                  <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('marketplace.experienceLevel')}</label>
                  <CustomSelect value={experienceFilter} onChange={setExperienceFilter} options={[{ value: 'all', label: t('marketplace.allLevels') }, { value: 'Entry', label: t('marketplace.entry') }, { value: 'Intermediate', label: t('marketplace.intermediate') }, { value: 'Expert', label: t('marketplace.expert') }]} placeholder={t('marketplace.allLevels')} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>
                    {t('marketplace.skills')} {selectedSkills.length > 0 && <span className="text-purple-500">({selectedSkills.length})</span>}
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {allSkills.map((skill) => (
                      <button key={skill} onClick={() => toggleSkill(skill)} className={`px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${selectedSkills.includes(skill) ? 'bg-purple-500 text-white' : isLightMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>{skill}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className={`backdrop-blur-sm rounded-xl border p-3 sm:p-4 mb-6 ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <button onClick={() => setShowFilters(!showFilters)} className={`lg:hidden flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-white'}`}>
                    <i className="ri-filter-3-line"></i>
                    {showFilters ? t('common.hideFilters') : t('common.showFilters')}
                    {activeFiltersCount > 0 && <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">{activeFiltersCount}</span>}
                  </button>
                  <div className="flex-1 relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base"></i>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('marketplace.searchPlaceholder')} className={`w-full border rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 focus:outline-none focus:border-purple-500 text-sm ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`} />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`text-xs sm:text-sm whitespace-nowrap ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('marketplace.sortBy')}</span>
                    <div className="relative flex-1 sm:flex-initial sm:min-w-[160px]">
                      <CustomSelect value={sortBy} onChange={setSortBy} options={[{ value: 'newest', label: t('marketplace.newest') }, { value: 'budget', label: t('marketplace.highestBudget') }, { value: 'proposals', label: t('marketplace.fewestProposals') }]} placeholder="Sort by" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('marketplace.showing')} <span className={`font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{sortedProjects.length}</span> {t('marketplace.projectsCount')}
                </p>
                <button onClick={() => setShowFilters(!showFilters)} className={`hidden lg:flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
                  <i className={`ri-layout-${showFilters ? 'right' : 'left'}-2-line`}></i>
                  {showFilters ? t('marketplace.hideFilters') : t('marketplace.showFilters')}
                </button>
              </div>

              {featuredProjects.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ri-star-line text-yellow-400 text-lg sm:text-xl"></i>
                    <h2 className={`text-lg sm:text-xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('marketplace.featuredProjects')}</h2>
                  </div>
                  <div className="space-y-4">
                    {featuredProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} selectedSkills={selectedSkills} formatBudget={formatBudget} onReportClient={handleOpenComplaint} isLightMode={isLightMode} t={t} />
                    ))}
                  </div>
                </div>
              )}

              {regularProjects.length > 0 && (
                <div>
                  {featuredProjects.length > 0 && <h2 className={`text-lg sm:text-xl font-bold mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('marketplace.allProjects')}</h2>}
                  <div className="space-y-4">
                    {regularProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} selectedSkills={selectedSkills} formatBudget={formatBudget} onReportClient={handleOpenComplaint} isLightMode={isLightMode} t={t} />
                    ))}
                  </div>
                </div>
              )}

              {sortedProjects.length === 0 && (
                <div className={`text-center py-12 sm:py-16 rounded-xl border ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full mx-auto mb-4 ${isLightMode ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <i className={`ri-search-line text-2xl sm:text-3xl ${isLightMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('marketplace.noProjectsFound')}</h3>
                  <p className={`text-xs sm:text-sm mb-4 px-4 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('marketplace.noProjectsSubtitle')}</p>
                  <button onClick={clearAllFilters} className="px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap">{t('marketplace.clearAllFilters')}</button>
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

interface ProjectCardProps {
  project: Project;
  selectedSkills: string[];
  formatBudget: (budget: Project['budget']) => string;
  onReportClient: (clientName: string, clientAvatar: string) => void;
  isLightMode: boolean;
  t: (key: string) => string;
}

const ProjectCard = ({ project, selectedSkills, formatBudget, onReportClient, isLightMode, t }: ProjectCardProps) => (
  <div className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 transition-all group ${project.featured ? isLightMode ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-400' : 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/5 to-transparent' : isLightMode ? 'bg-white border-gray-200 hover:border-purple-400' : 'bg-white/5 border-white/10 hover:border-purple-500/50'}`}>
    {project.featured && (
      <div className="flex items-center gap-2 mb-3">
        <i className="ri-star-fill text-yellow-400 text-sm sm:text-base"></i>
        <span className="text-yellow-500 text-xs font-semibold uppercase tracking-wide">{t('marketplace.featuredProject')}</span>
      </div>
    )}
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
      <div className="flex-shrink-0 mx-auto sm:mx-0 relative">
        <Link to={`/user/${project.client.clientId}`} className="block w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer">
          <img src={project.client.avatar} alt={project.client.name} className="w-full h-full object-cover" />
        </Link>
        <button onClick={() => onReportClient(project.client.name, project.client.avatar)} className={`absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center border rounded-full text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1a1f37] border-white/10'}`}>
          <i className="ri-flag-line text-xs"></i>
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
          <div className="flex-1 text-center sm:text-left">
            <h3 className={`text-base sm:text-lg font-bold group-hover:text-purple-500 transition-colors mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{project.title}</h3>
            <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className="flex items-center gap-1">
                <Link to={`/user/${project.client.clientId}`} className={`font-medium truncate max-w-[120px] sm:max-w-none hover:underline hover:text-purple-500 transition-colors ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{project.client.name}</Link>
                {project.client.verified && <i className="ri-verified-badge-fill text-blue-400"></i>}
              </div>
              <div className="flex items-center gap-1">
                <i className="ri-star-fill text-yellow-400"></i>
                <span>{project.client.rating}</span>
                <span className={isLightMode ? 'text-gray-400' : 'text-gray-500'}>({project.client.reviewCount})</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-3 flex-shrink-0">
            <div className="text-center sm:text-right">
              <div className="text-lg sm:text-xl font-bold text-purple-500">{formatBudget(project.budget)}</div>
              <div className={`text-xs ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>{project.budget.type === 'fixed' ? t('marketplace.fixedPrice') : t('marketplace.hourlyRate')}</div>
            </div>
          </div>
        </div>
        <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm mb-3 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <span className="flex items-center gap-1"><i className="ri-folder-line"></i>{project.category}</span>
          <span className="flex items-center gap-1"><i className="ri-time-line"></i>{project.duration}</span>
          <span className="flex items-center gap-1"><i className="ri-bar-chart-line"></i>{project.experienceLevel}</span>
          <span className="flex items-center gap-1"><i className="ri-file-list-line"></i>{project.proposals} {t('marketplace.proposals')}</span>
          <span className={`flex items-center gap-1 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}><i className="ri-calendar-line"></i>{project.postedDate}</span>
        </div>
        <p className={`text-xs sm:text-sm mb-3 line-clamp-2 text-center sm:text-left ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{project.description}</p>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 flex-1">
            {project.skills.map((skill) => (
              <span key={skill} className={`px-2 py-0.5 rounded text-xs ${selectedSkills.includes(skill) ? 'bg-purple-500/30 border border-purple-500/50 text-purple-500' : isLightMode ? 'bg-gray-100 border border-gray-200 text-gray-500' : 'bg-white/5 border border-white/10 text-gray-400'}`}>{skill}</span>
            ))}
          </div>
          <Link to={`/marketplace/${project.id}`} className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 text-center">
            {t('marketplace.viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default FreelanceMarketplace;
