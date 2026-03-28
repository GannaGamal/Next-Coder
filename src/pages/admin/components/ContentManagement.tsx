import { useState } from 'react';

interface Content {
  id: number;
  type: 'roadmap' | 'project' | 'course';
  title: string;
  author: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  createdDate: string;
  views: number;
}

const ContentManagement = () => {
  const [contentFilter, setContentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);

  const [contents, setContents] = useState<Content[]>([
    {
      id: 1,
      type: 'roadmap',
      title: 'Full Stack Web Development Roadmap',
      author: 'John Smith',
      category: 'Web Development',
      status: 'approved',
      createdDate: '2024-03-10',
      views: 1245,
    },
    {
      id: 2,
      type: 'project',
      title: 'E-commerce Platform with React',
      author: 'Sarah Johnson',
      category: 'Web Development',
      status: 'pending',
      createdDate: '2024-03-15',
      views: 342,
    },
    {
      id: 3,
      type: 'course',
      title: 'Advanced JavaScript Concepts',
      author: 'Michael Chen',
      category: 'Programming',
      status: 'approved',
      createdDate: '2024-03-08',
      views: 2156,
    },
    {
      id: 4,
      type: 'roadmap',
      title: 'UI/UX Design Career Path',
      author: 'Emily Davis',
      category: 'Design',
      status: 'pending',
      createdDate: '2024-03-14',
      views: 567,
    },
    {
      id: 5,
      type: 'project',
      title: 'Mobile App Development Guide',
      author: 'David Wilson',
      category: 'Mobile Development',
      status: 'rejected',
      createdDate: '2024-03-12',
      views: 189,
    },
  ]);

  const filteredContents = contents.filter((content) => {
    const matchesType = contentFilter === 'all' || content.type === contentFilter;
    const matchesStatus = statusFilter === 'all' || content.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const approveContent = (contentId: number) => {
    setContents(
      contents.map((content) =>
        content.id === contentId ? { ...content, status: 'approved' } : content
      )
    );
    setShowContentModal(false);
  };

  const rejectContent = (contentId: number) => {
    setContents(
      contents.map((content) =>
        content.id === contentId ? { ...content, status: 'rejected' } : content
      )
    );
    setShowContentModal(false);
  };

  const deleteContent = (contentId: number) => {
    if (confirm('Are you sure you want to delete this content?')) {
      setContents(contents.filter((content) => content.id !== contentId));
      setShowContentModal(false);
    }
  };

  const viewContentDetails = (content: Content) => {
    setSelectedContent(content);
    setShowContentModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'roadmap':
        return 'ri-route-line';
      case 'project':
        return 'ri-folder-open-line';
      case 'course':
        return 'ri-book-open-line';
      default:
        return 'ri-file-line';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'roadmap':
        return 'from-purple-500 to-purple-600';
      case 'project':
        return 'from-teal-500 to-teal-600';
      case 'course':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Filter by Type</label>
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500 cursor-pointer text-sm"
            >
              <option value="all">All Types</option>
              <option value="roadmap">Roadmaps</option>
              <option value="project">Projects</option>
              <option value="course">Courses</option>
            </select>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500 cursor-pointer text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContents.map((content) => (
          <div
            key={content.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(
                  content.type
                )} flex items-center justify-center`}
              >
                <i className={`${getTypeIcon(content.type)} text-2xl text-white`}></i>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  content.status === 'approved'
                    ? 'bg-green-500/20 text-green-400'
                    : content.status === 'rejected'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}
              >
                {content.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{content.title}</h3>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <i className="ri-user-line"></i>
                <span>{content.author}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <i className="ri-price-tag-3-line"></i>
                <span>{content.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <i className="ri-eye-line"></i>
                <span>{content.views} views</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <i className="ri-calendar-line"></i>
                <span>{content.createdDate}</span>
              </div>
            </div>

            <button
              onClick={() => viewContentDetails(content)}
              className="w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-semibold cursor-pointer whitespace-nowrap"
            >
              Manage
            </button>
          </div>
        ))}
      </div>

      {filteredContents.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
          <i className="ri-file-search-line text-5xl text-white/20 mb-4 block"></i>
          <p className="text-white/40">No content found</p>
        </div>
      )}

      {/* Content Details Modal */}
      {showContentModal && selectedContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Content Management</h3>
              <button
                onClick={() => setShowContentModal(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor(
                    selectedContent.type
                  )} flex items-center justify-center flex-shrink-0`}
                >
                  <i className={`${getTypeIcon(selectedContent.type)} text-3xl text-white`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-2">{selectedContent.title}</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      selectedContent.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : selectedContent.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    {selectedContent.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Type</p>
                  <p className="text-white font-semibold capitalize">{selectedContent.type}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Category</p>
                  <p className="text-white font-semibold">{selectedContent.category}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Author</p>
                  <p className="text-white font-semibold">{selectedContent.author}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Views</p>
                  <p className="text-white font-semibold">{selectedContent.views}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-1">Created Date</p>
                <p className="text-white font-semibold">{selectedContent.createdDate}</p>
              </div>

              <div className="space-y-3">
                {selectedContent.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveContent(selectedContent.id)}
                      className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-check-line mr-2"></i>
                      Approve Content
                    </button>
                    <button
                      onClick={() => rejectContent(selectedContent.id)}
                      className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-close-line mr-2"></i>
                      Reject Content
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteContent(selectedContent.id)}
                  className="w-full py-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg font-semibold hover:bg-red-500/30 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  Delete Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;