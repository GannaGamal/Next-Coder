
import { useState } from 'react';
import CustomSelect from '../../../components/base/CustomSelect';

type ContentType = 'all' | 'portfolio' | 'cv' | 'job' | 'project';

interface PostedContent {
  id: number;
  type: 'portfolio' | 'cv' | 'job' | 'project';
  title: string;
  author: string;
  authorEmail: string;
  category: string;
  postedDate: string;
  status: 'active' | 'inactive' | 'pending';
  views: number;
  image?: string;
}

const PostedContentManagement = () => {
  const [contentFilter, setContentFilter] = useState<ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<PostedContent | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [contents, setContents] = useState<PostedContent[]>([
    // Portfolios
    {
      id: 1,
      type: 'portfolio',
      title: 'Creative UI/UX Design Portfolio',
      author: 'Sarah Johnson',
      authorEmail: 'sarah.j@email.com',
      category: 'UI/UX Design',
      postedDate: '2024-03-15',
      status: 'active',
      views: 1245,
      image: 'https://readdy.ai/api/search-image?query=modern%20minimalist%20UI%20UX%20design%20portfolio%20showcase%20with%20clean%20interface%20mockups%20and%20creative%20digital%20artwork%20on%20gradient%20background&width=400&height=250&seq=port1&orientation=landscape',
    },
    {
      id: 2,
      type: 'portfolio',
      title: 'Full Stack Developer Showcase',
      author: 'Michael Chen',
      authorEmail: 'michael.c@email.com',
      category: 'Web Development',
      postedDate: '2024-03-12',
      status: 'active',
      views: 892,
      image: 'https://readdy.ai/api/search-image?query=professional%20web%20developer%20portfolio%20with%20code%20snippets%20and%20modern%20website%20designs%20displayed%20on%20multiple%20screens%20dark%20theme&width=400&height=250&seq=port2&orientation=landscape',
    },
    {
      id: 3,
      type: 'portfolio',
      title: 'Brand Identity Design Collection',
      author: 'Emily Davis',
      authorEmail: 'emily.d@email.com',
      category: 'Graphic Design',
      postedDate: '2024-03-10',
      status: 'active',
      views: 567,
      image: 'https://readdy.ai/api/search-image?query=brand%20identity%20design%20portfolio%20with%20logos%20business%20cards%20and%20corporate%20branding%20materials%20on%20clean%20white%20background&width=400&height=250&seq=port3&orientation=landscape',
    },
    // CVs
    {
      id: 4,
      type: 'cv',
      title: 'Senior Software Engineer CV',
      author: 'David Wilson',
      authorEmail: 'david.w@email.com',
      category: 'Software Engineering',
      postedDate: '2024-03-14',
      status: 'active',
      views: 432,
      image: 'https://readdy.ai/api/search-image?query=professional%20resume%20CV%20document%20with%20clean%20modern%20layout%20showing%20work%20experience%20and%20skills%20on%20desk%20with%20laptop&width=400&height=250&seq=cv1&orientation=landscape',
    },
    {
      id: 5,
      type: 'cv',
      title: 'Marketing Manager Resume',
      author: 'Jessica Brown',
      authorEmail: 'jessica.b@email.com',
      category: 'Marketing',
      postedDate: '2024-03-13',
      status: 'active',
      views: 321,
      image: 'https://readdy.ai/api/search-image?query=creative%20marketing%20professional%20resume%20with%20infographic%20elements%20and%20colorful%20design%20on%20modern%20workspace&width=400&height=250&seq=cv2&orientation=landscape',
    },
    {
      id: 6,
      type: 'cv',
      title: 'Data Scientist Profile',
      author: 'Alex Thompson',
      authorEmail: 'alex.t@email.com',
      category: 'Data Science',
      postedDate: '2024-03-11',
      status: 'pending',
      views: 189,
      image: 'https://readdy.ai/api/search-image?query=data%20scientist%20resume%20with%20charts%20graphs%20and%20analytics%20visualizations%20professional%20document%20layout&width=400&height=250&seq=cv3&orientation=landscape',
    },
    // Jobs
    {
      id: 7,
      type: 'job',
      title: 'Senior React Developer',
      author: 'TechCorp Inc.',
      authorEmail: 'hr@techcorp.com',
      category: 'Web Development',
      postedDate: '2024-03-16',
      status: 'active',
      views: 2156,
      image: 'https://readdy.ai/api/search-image?query=modern%20tech%20company%20office%20with%20developers%20working%20on%20computers%20collaborative%20workspace%20bright%20interior&width=400&height=250&seq=job1&orientation=landscape',
    },
    {
      id: 8,
      type: 'job',
      title: 'Product Designer',
      author: 'DesignHub Agency',
      authorEmail: 'careers@designhub.com',
      category: 'Design',
      postedDate: '2024-03-15',
      status: 'active',
      views: 1543,
      image: 'https://readdy.ai/api/search-image?query=creative%20design%20agency%20office%20with%20designers%20working%20on%20projects%20modern%20colorful%20workspace&width=400&height=250&seq=job2&orientation=landscape',
    },
    {
      id: 9,
      type: 'job',
      title: 'DevOps Engineer',
      author: 'CloudSystems Ltd.',
      authorEmail: 'jobs@cloudsystems.com',
      category: 'DevOps',
      postedDate: '2024-03-14',
      status: 'inactive',
      views: 876,
      image: 'https://readdy.ai/api/search-image?query=server%20room%20with%20cloud%20infrastructure%20and%20network%20equipment%20modern%20data%20center%20blue%20lighting&width=400&height=250&seq=job3&orientation=landscape',
    },
    // Projects
    {
      id: 10,
      type: 'project',
      title: 'E-commerce Platform Development',
      author: 'StartupX',
      authorEmail: 'projects@startupx.com',
      category: 'Web Development',
      postedDate: '2024-03-17',
      status: 'active',
      views: 1876,
      image: 'https://readdy.ai/api/search-image?query=ecommerce%20website%20development%20project%20with%20shopping%20cart%20interface%20and%20product%20catalog%20on%20multiple%20devices&width=400&height=250&seq=proj1&orientation=landscape',
    },
    {
      id: 11,
      type: 'project',
      title: 'Mobile App UI Redesign',
      author: 'AppVentures',
      authorEmail: 'hello@appventures.com',
      category: 'Mobile Development',
      postedDate: '2024-03-16',
      status: 'active',
      views: 1234,
      image: 'https://readdy.ai/api/search-image?query=mobile%20app%20UI%20design%20project%20with%20smartphone%20mockups%20showing%20modern%20interface%20screens%20on%20gradient%20background&width=400&height=250&seq=proj2&orientation=landscape',
    },
    {
      id: 12,
      type: 'project',
      title: 'AI Chatbot Integration',
      author: 'InnovateTech',
      authorEmail: 'contact@innovatetech.com',
      category: 'AI/ML',
      postedDate: '2024-03-15',
      status: 'pending',
      views: 654,
      image: 'https://readdy.ai/api/search-image?query=AI%20chatbot%20interface%20with%20conversation%20bubbles%20and%20artificial%20intelligence%20visualization%20futuristic%20design&width=400&height=250&seq=proj3&orientation=landscape',
    },
  ]);

  const typeOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'portfolio', label: 'Portfolios' },
    { value: 'cv', label: 'CVs' },
    { value: 'job', label: 'Jobs' },
    { value: 'project', label: 'Projects' },
  ];

  const filteredContents = contents.filter((content) => {
    const matchesType = contentFilter === 'all' || content.type === contentFilter;
    const matchesSearch =
      searchQuery === '' ||
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDelete = (content: PostedContent) => {
    setSelectedContent(content);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedContent) {
      setContents(contents.filter((c) => c.id !== selectedContent.id));
      setShowDeleteModal(false);
      setSelectedContent(null);
    }
  };

  const viewDetails = (content: PostedContent) => {
    setSelectedContent(content);
    setShowDetailModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'portfolio':
        return 'ri-gallery-line';
      case 'cv':
        return 'ri-file-user-line';
      case 'job':
        return 'ri-briefcase-line';
      case 'project':
        return 'ri-folder-open-line';
      default:
        return 'ri-file-line';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'portfolio':
        return 'from-pink-500 to-rose-600';
      case 'cv':
        return 'from-teal-500 to-cyan-600';
      case 'job':
        return 'from-amber-500 to-orange-600';
      case 'project':
        return 'from-indigo-500 to-violet-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getContentCounts = () => {
    return {
      all: contents.length,
      portfolio: contents.filter((c) => c.type === 'portfolio').length,
      cv: contents.filter((c) => c.type === 'cv').length,
      job: contents.filter((c) => c.type === 'job').length,
      project: contents.filter((c) => c.type === 'project').length,
    };
  };

  const counts = getContentCounts();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <i className="ri-stack-line text-xl text-white"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{counts.all}</p>
              <p className="text-xs text-white/60">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <i className="ri-gallery-line text-xl text-white"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{counts.portfolio}</p>
              <p className="text-xs text-white/60">Portfolios</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <i className="ri-file-user-line text-xl text-white"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{counts.cv}</p>
              <p className="text-xs text-white/60">CVs</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <i className="ri-briefcase-line text-xl text-white"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{counts.job}</p>
              <p className="text-xs text-white/60">Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <i className="ri-folder-open-line text-xl text-white"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{counts.project}</p>
              <p className="text-xs text-white/60">Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-white/60 text-sm mb-2">Search</label>
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/40"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-white/60 text-sm mb-2">Filter by Type</label>
            <CustomSelect
              options={typeOptions}
              value={contentFilter}
              onChange={(value) => setContentFilter(value as ContentType)}
              placeholder="Select type"
            />
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 sm:px-6 py-4 text-white/60 text-sm font-semibold">Content</th>
                <th className="text-left px-4 sm:px-6 py-4 text-white/60 text-sm font-semibold hidden md:table-cell">Type</th>
                <th className="text-left px-4 sm:px-6 py-4 text-white/60 text-sm font-semibold hidden lg:table-cell">Author</th>
                <th className="text-left px-4 sm:px-6 py-4 text-white/60 text-sm font-semibold hidden sm:table-cell">Status</th>
                <th className="text-left px-4 sm:px-6 py-4 text-white/60 text-sm font-semibold hidden lg:table-cell">Views</th>
                <th className="text-left px-4 sm:px-6 py-4 text-white/60 text-sm font-semibold hidden xl:table-cell">Posted</th>
                <th className="text-right px-4 sm:px-6 py-4 text-white/60 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContents.map((content) => (
                <tr key={content.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={content.image}
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate max-w-[200px]">{content.title}</p>
                        <p className="text-white/40 text-xs md:hidden capitalize">{content.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTypeColor(content.type)} flex items-center justify-center`}>
                        <i className={`${getTypeIcon(content.type)} text-white text-sm`}></i>
                      </div>
                      <span className="text-white/80 text-sm capitalize">{content.type}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                    <div>
                      <p className="text-white text-sm">{content.author}</p>
                      <p className="text-white/40 text-xs">{content.authorEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(content.status)}`}>
                      {content.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-white/60 text-sm">
                      <i className="ri-eye-line"></i>
                      <span>{content.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden xl:table-cell">
                    <span className="text-white/60 text-sm">{content.postedDate}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => viewDetails(content)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                        title="View Details"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(content)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContents.length === 0 && (
          <div className="p-12 text-center">
            <i className="ri-file-search-line text-5xl text-white/20 mb-4 block"></i>
            <p className="text-white/40">No content found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Content Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={selectedContent.image}
                  alt={selectedContent.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTypeColor(selectedContent.type)} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${getTypeIcon(selectedContent.type)} text-2xl text-white`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-white mb-1">{selectedContent.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm capitalize">{selectedContent.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadge(selectedContent.status)}`}>
                      {selectedContent.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-xs mb-1">Author</p>
                  <p className="text-white text-sm font-semibold">{selectedContent.author}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-xs mb-1">Category</p>
                  <p className="text-white text-sm font-semibold">{selectedContent.category}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-xs mb-1">Views</p>
                  <p className="text-white text-sm font-semibold">{selectedContent.views.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-xs mb-1">Posted Date</p>
                  <p className="text-white text-sm font-semibold">{selectedContent.postedDate}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/40 text-xs mb-1">Author Email</p>
                <p className="text-white text-sm font-semibold">{selectedContent.authorEmail}</p>
              </div>

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleDelete(selectedContent);
                }}
                className="w-full py-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg font-semibold hover:bg-red-500/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Delete Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-md w-full border border-white/10">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-3xl text-red-400"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Content?</h3>
              <p className="text-white/60 text-sm mb-6">
                Are you sure you want to delete "<span className="text-white">{selectedContent.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostedContentManagement;
