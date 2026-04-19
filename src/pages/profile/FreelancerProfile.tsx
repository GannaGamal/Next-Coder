import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProfilePhotoModal from '../../components/feature/ProfilePhotoModal';
import FreelancerEditModal from '../../components/feature/FreelancerEditModal';
import type { FreelancerEditData } from '../../components/feature/FreelancerEditModal';
import useProfilePhoto from '../../hooks/useProfilePhoto';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  pdfName: string;
  pdfUrl: string;
  pdfSize?: number;
  category: string;
  completedDate: string;
}

interface Document {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface CompletedProject {
  id: string;
  title: string;
  client: string;
  clientAvatar: string;
  description: string;
  budget: number;
  completedDate: string;
  rating: number;
  review: string;
  category: string;
}

const FreelancerProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'completed' | 'documents'>('profile');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
    website: 'freelancer.example.com',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    twitter: '',
  });
  
  const [profile, setProfile] = useState({
    bio: 'Experienced full-stack developer with 5+ years of expertise in React, Node.js, and cloud technologies.',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'MongoDB'],
    hourlyRate: 50,
    rating: 4.9,
    completedProjects: 47
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    {
      id: '1',
      title: 'E-commerce Platform',
      description: 'Built a full-featured e-commerce platform with payment integration and admin dashboard',
      pdfName: 'E-commerce_Platform_Portfolio.pdf',
      pdfUrl: '#',
      pdfSize: 2.4,
      category: 'Web Development',
      completedDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Mobile Banking App',
      description: 'Developed a secure mobile banking application with biometric authentication',
      pdfName: 'Mobile_Banking_App_Portfolio.pdf',
      pdfUrl: '#',
      pdfSize: 3.1,
      category: 'Mobile Development',
      completedDate: '2023-11-20'
    },
    {
      id: '3',
      title: 'Analytics Dashboard',
      description: 'Created a real-time analytics dashboard with data visualization and reporting',
      pdfName: 'Analytics_Dashboard_Portfolio.pdf',
      pdfUrl: '#',
      pdfSize: 1.8,
      category: 'Data Visualization',
      completedDate: '2023-09-10'
    }
  ]);

  const [completedProjects] = useState<CompletedProject[]>([
    {
      id: '1',
      title: 'E-commerce Website Redesign',
      client: 'TechStart Inc.',
      clientAvatar: 'https://readdy.ai/api/search-image?query=professional%20business%20person%20portrait%20corporate%20headshot%20clean%20white%20background%20friendly%20smile&width=100&height=100&seq=client1&orientation=squarish',
      description: 'Complete redesign and development of an e-commerce platform with modern UI/UX, payment integration, and inventory management system.',
      budget: 4500,
      completedDate: '2024-01-10',
      rating: 5,
      review: 'Excellent work! Delivered on time with exceptional quality. Highly recommended for any web development project.',
      category: 'Web Development'
    },
    {
      id: '2',
      title: 'Mobile App Development',
      client: 'HealthPlus Co.',
      clientAvatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20business%20portrait%20corporate%20headshot%20clean%20white%20background%20confident%20smile&width=100&height=100&seq=client2&orientation=squarish',
      description: 'Developed a cross-platform mobile application for health tracking with real-time sync and push notifications.',
      budget: 8000,
      completedDate: '2023-12-15',
      rating: 5,
      review: 'Outstanding developer! Great communication throughout the project and delivered exactly what we needed.',
      category: 'Mobile Development'
    },
    {
      id: '3',
      title: 'API Integration Project',
      client: 'DataFlow Systems',
      clientAvatar: 'https://readdy.ai/api/search-image?query=professional%20man%20business%20portrait%20corporate%20headshot%20clean%20white%20background%20friendly%20expression&width=100&height=100&seq=client3&orientation=squarish',
      description: 'Integrated multiple third-party APIs including payment gateways, shipping providers, and CRM systems.',
      budget: 3200,
      completedDate: '2023-11-20',
      rating: 4,
      review: 'Good work overall. Met all requirements and was responsive to feedback.',
      category: 'Backend Development'
    },
    {
      id: '4',
      title: 'Dashboard Analytics Tool',
      client: 'MarketPro Agency',
      clientAvatar: 'https://readdy.ai/api/search-image?query=professional%20marketing%20executive%20portrait%20corporate%20headshot%20clean%20white%20background%20warm%20smile&width=100&height=100&seq=client4&orientation=squarish',
      description: 'Built a comprehensive analytics dashboard with real-time data visualization, custom reports, and export functionality.',
      budget: 5500,
      completedDate: '2023-10-05',
      rating: 5,
      review: 'Fantastic experience! The dashboard exceeded our expectations. Will definitely work together again.',
      category: 'Data Visualization'
    }
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Professional Certificate.pdf', url: '#', uploadedAt: '2024-01-10' },
    { id: '2', name: 'Work Samples.zip', url: '#', uploadedAt: '2024-01-05' },
    { id: '3', name: 'References.pdf', url: '#', uploadedAt: '2023-12-20' }
  ]);

  const [newSkill, setNewSkill] = useState('');
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    category: '',
    completedDate: ''
  });
  const [newPortfolioPdf, setNewPortfolioPdf] = useState<File | null>(null);

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const handleAddPortfolio = () => {
    if (newPortfolio.title && newPortfolio.description && newPortfolioPdf) {
      const item: PortfolioItem = {
        id: Date.now().toString(),
        ...newPortfolio,
        pdfName: newPortfolioPdf.name,
        pdfUrl: URL.createObjectURL(newPortfolioPdf),
        pdfSize: parseFloat((newPortfolioPdf.size / (1024 * 1024)).toFixed(2)),
      };
      setPortfolio([...portfolio, item]);
      setNewPortfolio({ title: '', description: '', category: '', completedDate: '' });
      setNewPortfolioPdf(null);
      setShowPortfolioForm(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      setDocuments([...documents, newDoc]);
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const { handlePhotoUpload, handlePhotoRemove } = useProfilePhoto();

  const handleSaveEdit = (data: FreelancerEditData) => {
    setContactInfo({
      phone: data.phone,
      location: data.location,
      website: data.website,
      linkedin: data.linkedin,
      github: data.github,
      twitter: data.twitter,
    });
    setProfile(prev => ({ ...prev, bio: data.bio, hourlyRate: data.hourlyRate }));
  };

  const editData: FreelancerEditData = {
    ...contactInfo,
    bio: profile.bio,
    hourlyRate: profile.hourlyRate,
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`${i < rating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-500'} text-sm`}
      ></i>
    ));
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      
      <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div 
                onClick={() => setShowPhotoModal(true)}
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 cursor-pointer relative group"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <i className="ri-user-line text-4xl sm:text-5xl lg:text-6xl text-white"></i>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i className="ri-camera-line text-2xl text-white"></i>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{user?.name || 'John Doe'}</h1>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Edit Contact
                  </button>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-2 break-all">{user?.email || 'john@example.com'}</p>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {contactInfo.phone && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-phone-line text-purple-400"></i>{contactInfo.phone}</span>}
                  {contactInfo.location && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-map-pin-line text-purple-400"></i>{contactInfo.location}</span>}
                  {contactInfo.website && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-global-line text-purple-400"></i>{contactInfo.website}</span>}
                  {contactInfo.linkedin && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-linkedin-box-line text-purple-400"></i>{contactInfo.linkedin}</span>}
                  {contactInfo.github && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-github-fill text-purple-400"></i>{contactInfo.github}</span>}
                  {contactInfo.twitter && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-twitter-x-line text-purple-400"></i>{contactInfo.twitter}</span>}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <i className="ri-star-fill text-yellow-400 text-lg sm:text-xl"></i>
                    <span className="text-sm sm:text-base text-white font-semibold">{profile.rating}</span>
                    <span className="text-xs sm:text-sm text-gray-400">({profile.completedProjects} projects)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-money-dollar-circle-line text-green-400 text-lg sm:text-xl"></i>
                    <span className="text-sm sm:text-base text-white font-semibold">${profile.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'portfolio'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Completed Projects
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Documents
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Bio */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">About Me</h2>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Edit
                  </button>
                </div>
                {profile.bio ? (
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No bio added yet. Click Edit to add yours.</p>
                )}
              </div>

              {/* Skills */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2"
                    >
                      <span className="text-sm sm:text-base text-white font-medium">{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-white hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <i className="ri-close-line text-sm sm:text-base"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Add a skill..."
                  />
                  <button
                    onClick={handleAddSkill}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Hourly Rate */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Hourly Rate</h2>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Edit
                  </button>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-white">${profile.hourlyRate}</span>
                  <span className="text-base sm:text-lg text-gray-400 pb-1">/hour</span>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white">My Portfolio</h2>
                <button
                  onClick={() => setShowPortfolioForm(!showPortfolioForm)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Portfolio
                </button>
              </div>

              {showPortfolioForm && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Add New Portfolio</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <input
                      type="text"
                      value={newPortfolio.title}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Portfolio Title"
                    />
                    <textarea
                      value={newPortfolio.description}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                      rows={3}
                      placeholder="Portfolio Description"
                    />
                    <input
                      type="text"
                      value={newPortfolio.category}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Category (e.g., Web Development)"
                    />
                    <input
                      type="date"
                      value={newPortfolio.completedDate}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, completedDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500"
                    />

                    {/* PDF Upload */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Portfolio PDF File</label>
                      {newPortfolioPdf ? (
                        <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500/20 flex-shrink-0">
                            <i className="ri-file-pdf-line text-xl text-purple-400"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{newPortfolioPdf.name}</p>
                            <p className="text-gray-400 text-xs">{(newPortfolioPdf.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <button
                            onClick={() => setNewPortfolioPdf(null)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <i className="ri-close-line text-sm"></i>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/20 rounded-lg hover:border-purple-500/50 transition-colors cursor-pointer group">
                          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-purple-500/10 transition-colors">
                            <i className="ri-file-pdf-line text-2xl text-gray-400 group-hover:text-purple-400 transition-colors"></i>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-white font-medium">Upload Portfolio PDF</p>
                            <p className="text-xs text-gray-500 mt-1">Click to browse your PDF file</p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setNewPortfolioPdf(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAddPortfolio}
                        disabled={!newPortfolioPdf}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Add Portfolio
                      </button>
                      <button
                        onClick={() => { setShowPortfolioForm(false); setNewPortfolioPdf(null); }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white/5 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {portfolio.map((item) => (
                  <div key={item.id} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                    {/* PDF Preview Area */}
                    <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-b border-white/10 flex flex-col items-center justify-center gap-3 relative">
                      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/30">
                        <i className="ri-file-pdf-line text-4xl text-purple-400"></i>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-white text-sm font-medium truncate max-w-xs">{item.pdfName}</p>
                        {item.pdfSize && (
                          <p className="text-gray-500 text-xs mt-0.5">{item.pdfSize} MB</p>
                        )}
                      </div>
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-purple-500/30 border border-white/10 hover:border-purple-500/40 text-gray-300 hover:text-purple-300 transition-all cursor-pointer"
                        title="Download PDF"
                      >
                        <i className="ri-download-line text-sm"></i>
                      </a>
                    </div>

                    {/* Card Info */}
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs sm:text-sm font-medium">
                          {item.category}
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm">{item.completedDate}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm sm:text-base text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {portfolio.length === 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-file-pdf-line text-3xl text-white/40"></i>
                  </div>
                  <h3 className="text-lg text-white font-semibold mb-2">No Portfolios Yet</h3>
                  <p className="text-gray-500 text-sm">Click &ldquo;Add Portfolio&rdquo; to upload your first PDF portfolio.</p>
                </div>
              )}
            </div>
          )}

          {/* Completed Projects Tab */}
          {activeTab === 'completed' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  <i className="ri-checkbox-circle-fill text-green-400"></i>
                  Completed Projects
                </h2>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <span className="text-green-400 font-semibold">{completedProjects.length} Projects</span>
                  </div>
                  <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                    <span className="text-purple-400 font-semibold">${completedProjects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()} Earned</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {completedProjects.map((project) => (
                  <div key={project.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/30 transition-all">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                      {/* Project Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium">
                              {project.category}
                            </span>
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs font-medium">
                              Completed
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            <i className="ri-calendar-line mr-1"></i>
                            {new Date(project.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{project.title}</h3>
                        <p className="text-sm sm:text-base text-gray-400 mb-4">{project.description}</p>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <i className="ri-money-dollar-circle-line text-green-400"></i>
                            <span className="text-white font-semibold">${project.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(project.rating)}
                            <span className="text-white font-semibold ml-1">{project.rating}.0</span>
                          </div>
                        </div>
                      </div>

                      {/* Client Review */}
                      <div className="lg:w-80 bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src={project.clientAvatar} alt={project.client} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">{project.client}</h4>
                            <p className="text-gray-400 text-xs">Client</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm italic">&quot;{project.review}&quot;</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {completedProjects.length === 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-folder-line text-3xl text-white/40"></i>
                  </div>
                  <h3 className="text-lg text-white font-semibold mb-2">No Completed Projects Yet</h3>
                  <p className="text-gray-500 text-sm">Your completed freelance projects will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white">My Documents</h2>
                <label className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer text-center">
                  <i className="ri-upload-line mr-2"></i>
                  Upload Document
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt,.zip"
                  />
                </label>
              </div>

              {documents.length > 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                  {documents.map((doc, index) => (
                    <div
                      key={doc.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-5 lg:p-6 ${
                        index !== documents.length - 1 ? 'border-b border-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-purple-500/20 flex-shrink-0">
                          <i className="ri-file-text-line text-xl sm:text-2xl text-purple-400"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base text-white font-semibold truncate">{doc.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-400">Uploaded on {doc.uploadedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button 
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <i className="ri-download-line text-lg sm:text-xl text-white"></i>
                        </button>
                        <button 
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors cursor-pointer"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <i className="ri-delete-bin-line text-lg sm:text-xl text-white hover:text-red-400"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                  <i className="ri-folder-open-line text-5xl sm:text-6xl text-gray-500 mb-4"></i>
                  <p className="text-base sm:text-lg text-gray-400">No documents uploaded yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">Click the upload button to add your first document</p>
                </div>
              )}
            </div>
          )}

          {/* Password & Security moved to Settings page */}
        </div>
      </div>

      <Footer />

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentPhoto={user?.avatar}
        userName={user?.name}
        onUpload={handlePhotoUpload}
        onRemove={handlePhotoRemove}
        accentColor="purple"
      />

      <FreelancerEditModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        data={editData}
        onSave={handleSaveEdit}
        accentColor="purple"
      />
    </div>
  );
};

export default FreelancerProfile;
