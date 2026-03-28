import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useTranslation } from 'react-i18next';

const PortfolioDetail = () => {
  const { portfolioId } = useParams();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  // Mock portfolio data
  const portfolio = {
    id: portfolioId || '1',
    freelancerName: 'Sarah Johnson',
    freelancerAvatar: 'https://readdy.ai/api/search-image?query=professional%20female%20web%20developer%20portrait%20confident%20smile%20modern%20tech%20office%20clean%20white%20background%20business%20casual%20attire&width=200&height=200&seq=portdetail1&orientation=squarish',
    title: 'E-Commerce Platform Redesign',
    category: 'Web Development',
    description: 'Complete redesign and development of a modern e-commerce platform with React and Node.js. Implemented real-time inventory management, seamless checkout experience, and advanced analytics dashboard. The project involved creating a responsive design that works flawlessly across all devices.',
    coverImage: 'https://readdy.ai/api/search-image?query=modern%20ecommerce%20website%20dashboard%20design%20sleek%20interface%20purple%20accent%20colors%20dark%20theme%20professional%20web%20application%20mockup%20on%20desktop%20screen&width=800&height=500&seq=portdetailcover1&orientation=landscape',
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe', 'TypeScript', 'Tailwind CSS'],
    likes: 234,
    views: 1520,
    rating: 4.9,
    completedProjects: 47,
    hourlyRate: '$80-100',
    isVerified: true,
    location: 'San Francisco, CA',
    memberSince: 'January 2021',
    responseTime: '< 2 hours',
    languages: ['English', 'Spanish'],
    bio: 'Experienced full-stack developer with 8+ years of experience building scalable web applications. Passionate about clean code, user experience, and delivering projects on time. I specialize in React, Node.js, and cloud technologies.',
    projects: [
      {
        id: '1',
        title: 'E-Commerce Dashboard',
        description: 'Admin dashboard for managing products, orders, and customers with real-time analytics.',
        image: 'https://readdy.ai/api/search-image?query=ecommerce%20admin%20dashboard%20design%20dark%20theme%20purple%20accents%20analytics%20charts%20product%20management%20interface%20modern%20web%20application&width=600&height=400&seq=proj1&orientation=landscape',
        tags: ['React', 'Node.js', 'MongoDB']
      },
      {
        id: '2',
        title: 'Product Catalog',
        description: 'Responsive product listing with advanced filtering, search, and sorting capabilities.',
        image: 'https://readdy.ai/api/search-image?query=product%20catalog%20website%20design%20grid%20layout%20modern%20ecommerce%20purple%20theme%20dark%20mode%20shopping%20interface%20clean%20minimal&width=600&height=400&seq=proj2&orientation=landscape',
        tags: ['React', 'TypeScript', 'Tailwind']
      },
      {
        id: '3',
        title: 'Checkout Flow',
        description: 'Streamlined checkout process with multiple payment options and order tracking.',
        image: 'https://readdy.ai/api/search-image?query=checkout%20page%20design%20ecommerce%20payment%20flow%20modern%20interface%20dark%20theme%20purple%20accents%20credit%20card%20form%20shopping%20cart&width=600&height=400&seq=proj3&orientation=landscape',
        tags: ['Stripe', 'React', 'Node.js']
      },
      {
        id: '4',
        title: 'Mobile App Design',
        description: 'Companion mobile app design for iOS and Android platforms.',
        image: 'https://readdy.ai/api/search-image?query=mobile%20app%20design%20ecommerce%20shopping%20application%20dark%20theme%20purple%20gradients%20multiple%20screens%20showcase%20modern%20ui%20ux&width=600&height=400&seq=proj4&orientation=landscape',
        tags: ['React Native', 'Figma']
      },
      {
        id: '5',
        title: 'Analytics Dashboard',
        description: 'Real-time sales analytics with interactive charts and export functionality.',
        image: 'https://readdy.ai/api/search-image?query=analytics%20dashboard%20design%20data%20visualization%20charts%20graphs%20dark%20theme%20purple%20accents%20business%20intelligence%20modern%20interface&width=600&height=400&seq=proj5&orientation=landscape',
        tags: ['D3.js', 'React', 'PostgreSQL']
      },
      {
        id: '6',
        title: 'Inventory Management',
        description: 'Stock management system with automated alerts and supplier integration.',
        image: 'https://readdy.ai/api/search-image?query=inventory%20management%20system%20dashboard%20design%20warehouse%20stock%20tracking%20dark%20theme%20purple%20accents%20modern%20web%20application&width=600&height=400&seq=proj6&orientation=landscape',
        tags: ['Node.js', 'MongoDB', 'Redis']
      }
    ],
    reviews: [
      {
        id: '1',
        clientName: 'John Smith',
        clientAvatar: 'https://readdy.ai/api/search-image?query=professional%20businessman%20portrait%20friendly%20smile%20clean%20white%20background%20business%20attire&width=100&height=100&seq=rev1&orientation=squarish',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Sarah delivered exceptional work on our e-commerce platform. Her attention to detail and communication throughout the project was outstanding. Highly recommended!'
      },
      {
        id: '2',
        clientName: 'Emily Davis',
        clientAvatar: 'https://readdy.ai/api/search-image?query=professional%20businesswoman%20portrait%20confident%20smile%20clean%20white%20background%20elegant%20attire&width=100&height=100&seq=rev2&orientation=squarish',
        rating: 5,
        date: '1 month ago',
        comment: 'Working with Sarah was a pleasure. She understood our requirements perfectly and delivered ahead of schedule. The code quality is excellent.'
      },
      {
        id: '3',
        clientName: 'Michael Brown',
        clientAvatar: 'https://readdy.ai/api/search-image?query=professional%20male%20entrepreneur%20portrait%20friendly%20smile%20clean%20white%20background%20casual%20business%20attire&width=100&height=100&seq=rev3&orientation=squarish',
        rating: 4,
        date: '2 months ago',
        comment: 'Great developer with strong technical skills. Made some excellent suggestions that improved our original design. Would work with again.'
      }
    ]
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`${i < Math.floor(rating) ? 'ri-star-fill' : i < rating ? 'ri-star-half-fill' : 'ri-star-line'} text-amber-400`}
      ></i>
    ));
  };

  return (
    <div className="min-h-screen bg-[#1a1f37]">
      <Navbar />

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white hover:text-gray-300 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <i className="ri-close-line text-3xl"></i>
          </button>
          <img
            src={selectedImage}
            alt="Project preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            to="/portfolios"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            {t('portfolios.backToPortfolios')}
          </Link>

          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <div className="h-64 sm:h-80 lg:h-96">
              <img
                src={portfolio.coverImage}
                alt={portfolio.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f37] via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span className="px-3 py-1 bg-purple-500/80 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
                {portfolio.category}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3">{portfolio.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4">{t('portfolios.aboutProject')}</h2>
                <p className="text-gray-300 leading-relaxed">{portfolio.description}</p>
                
                <div className="mt-6">
                  <h3 className="text-white font-semibold mb-3">{t('portfolios.technologiesUsed')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'projects'
                        ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <i className="ri-gallery-line mr-2"></i>
                    {t('portfolios.projectsTab')} ({portfolio.projects.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'reviews'
                        ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <i className="ri-star-line mr-2"></i>
                    {t('portfolios.reviewsTab')} ({portfolio.reviews.length})
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {portfolio.projects.map(project => (
                        <div
                          key={project.id}
                          className="group rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                          onClick={() => setSelectedImage(project.image)}
                        >
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <i className="ri-zoom-in-line text-3xl text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </div>
                          </div>
                          <div className="p-4 bg-white/5">
                            <h4 className="text-white font-semibold mb-1">{project.title}</h4>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{project.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {project.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-4">
                      {portfolio.reviews.map(review => (
                        <div key={review.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                              <img src={review.clientAvatar} alt={review.clientName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="text-white font-semibold">{review.clientName}</h4>
                                <span className="text-gray-500 text-sm">{review.date}</span>
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {renderStars(review.rating)}
                              </div>
                              <p className="text-gray-300 text-sm">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Freelancer Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-purple-500/30">
                    <img src={portfolio.freelancerAvatar} alt={portfolio.freelancerName} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    {portfolio.freelancerName}
                    {portfolio.isVerified && <i className="ri-verified-badge-fill text-purple-400"></i>}
                  </h3>
                  <p className="text-purple-400 text-sm">{portfolio.category} Expert</p>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-amber-400">
                      {renderStars(portfolio.rating)}
                    </div>
                    <span className="text-gray-400 text-xs">{portfolio.rating} rating</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('portfolios.location')}</span>
                    <span className="text-white">{portfolio.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('portfolios.hourlyRate')}</span>
                    <span className="text-white">{portfolio.hourlyRate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('portfolios.projectsDone')}</span>
                    <span className="text-white">{portfolio.completedProjects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('portfolios.responseTime')}</span>
                    <span className="text-white">{portfolio.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('portfolios.memberSince')}</span>
                    <span className="text-white">{portfolio.memberSince}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full px-5 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-message-3-line mr-2"></i>
                    {t('portfolios.contactFreelancer')}
                  </button>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`w-full px-5 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      isLiked
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <i className={`${isLiked ? 'ri-heart-fill' : 'ri-heart-line'} mr-2`}></i>
                    {isLiked ? t('portfolios.savedPortfolio') : t('portfolios.savePortfolio')}
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4">{t('portfolios.portfolioStats')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-pink-400">{portfolio.likes}</div>
                    <div className="text-gray-400 text-sm">{t('portfolios.likes')}</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{portfolio.views}</div>
                    <div className="text-gray-400 text-sm">{t('portfolios.views')}</div>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4">{t('portfolios.languages')}</h3>
                <div className="flex flex-wrap gap-2">
                  {portfolio.languages.map(lang => (
                    <span key={lang} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PortfolioDetail;
