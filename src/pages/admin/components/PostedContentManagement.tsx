import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CustomSelect from '../../../components/base/CustomSelect';
import {
  getAdminContentSummary,
  getAdminContentList,
  getAdminContentDetails,
  deleteAdminContent,
} from '../../../services/admin.service';
import type {
  AdminContentSummary,
  AdminContentItem,
  ContentType as ApiContentType,
} from '../../../services/admin.service';

type FilterType = 'all' | 'portfolio' | 'cv' | 'job' | 'project';

const PostedContentManagement = () => {
  const [contentFilter, setContentFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedContent, setSelectedContent] = useState<AdminContentItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [contentSummary, setContentSummary] = useState<AdminContentSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [contents, setContents] = useState<AdminContentItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;
  const [refreshKey, setRefreshKey] = useState(0);
  const prevFilterRef = useRef({ search: '', filter: 'all' as FilterType });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load summary
  useEffect(() => {
    let active = true;
    const load = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const data = await getAdminContentSummary();
        if (active) setContentSummary(data);
      } catch (err) {
        if (active) setSummaryError(err instanceof Error ? err.message : 'Failed to load content summary.');
      } finally {
        if (active) setSummaryLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  // Load content list
  useEffect(() => {
    let active = true;

    const prev = prevFilterRef.current;
    const filtersChanged = prev.search !== debouncedSearch || prev.filter !== contentFilter;
    const effectivePage = filtersChanged ? 1 : pageNumber;

    if (filtersChanged) {
      prevFilterRef.current = { search: debouncedSearch, filter: contentFilter };
      if (pageNumber !== 1) {
        setPageNumber(1);
        return; // will re-run with pageNumber=1
      }
    }

    setListLoading(true);
    setListError(null);
    setContents([]);

    getAdminContentList({
      Search: debouncedSearch || undefined,
      Type: contentFilter !== 'all' ? contentFilter : undefined,
      PageNumber: effectivePage,
      PageSize: PAGE_SIZE,
    })
      .then((data) => {
        if (!active) return;
        setContents(data.items);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      })
      .catch((err) => {
        if (!active) return;
        setListError(err instanceof Error ? err.message : 'Failed to load content.');
      })
      .finally(() => {
        if (active) setListLoading(false);
      });

    return () => { active = false; };
  }, [debouncedSearch, contentFilter, pageNumber, refreshKey]);

  const typeOptions = [
    { value: 'all',       label: 'All Content' },
    { value: 'portfolio', label: 'Portfolios' },
    { value: 'cv',        label: 'CVs' },
    { value: 'job',       label: 'Jobs' },
    { value: 'project',   label: 'Projects' },
  ];

  const handleViewDetails = async (item: AdminContentItem) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setSelectedContent(item);
    try {
      const detail = await getAdminContentDetails(item.type.toLowerCase() as ApiContentType, item.contentId);
      setSelectedContent(detail);
    } catch {
      // keep the list-level data if detail fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = (item: AdminContentItem) => {
    setSelectedContent(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedContent) return;
    setDeleteLoading(true);
    try {
      await deleteAdminContent(selectedContent.type.toLowerCase() as ApiContentType, selectedContent.contentId);
      setShowDeleteModal(false);
      setShowDetailModal(false);
      setSelectedContent(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete content.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'portfolio': return 'ri-gallery-line';
      case 'cv':        return 'ri-file-user-line';
      case 'job':       return 'ri-briefcase-line';
      case 'project':   return 'ri-folder-open-line';
      default:          return 'ri-file-line';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'portfolio': return 'from-pink-500 to-rose-600';
      case 'cv':        return 'from-teal-500 to-cyan-600';
      case 'job':       return 'from-amber-500 to-orange-600';
      case 'project':   return 'from-indigo-500 to-violet-600';
      default:          return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':    return 'bg-green-500/20 text-green-400';
      case 'inactive':  return 'bg-gray-500/20 text-gray-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'pending':   return 'bg-orange-500/20 text-orange-400';
      case 'inprogress': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected':  return 'bg-red-500/20 text-red-400';
      default:          return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString(); }
    catch { return iso; }
  };

  const summaryStats = contentSummary
    ? [
        { id: 1, label: 'Total',      value: contentSummary.total.toLocaleString(),      icon: 'ri-stack-line',       color: 'from-teal-500 to-teal-600' },
        { id: 2, label: 'Portfolios', value: contentSummary.portfolios.toLocaleString(), icon: 'ri-gallery-line',     color: 'from-pink-500 to-rose-600' },
        { id: 3, label: 'CVs',        value: contentSummary.cVs.toLocaleString(),        icon: 'ri-file-user-line',   color: 'from-teal-500 to-cyan-600' },
        { id: 4, label: 'Jobs',       value: contentSummary.jobs.toLocaleString(),       icon: 'ri-briefcase-line',   color: 'from-amber-500 to-orange-600' },
        { id: 5, label: 'Projects',   value: contentSummary.projects.toLocaleString(),   icon: 'ri-folder-open-line', color: 'from-indigo-500 to-violet-600' },
      ]
    : [];

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`summary-skeleton-${i}`} className="h-24 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
          ))
        ) : summaryError ? (
          <div className="col-span-2 sm:col-span-3 lg:col-span-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            <p className="text-sm font-semibold">{summaryError}</p>
          </div>
        ) : (
          summaryStats.map((stat) => (
            <div key={stat.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${stat.icon} text-lg sm:text-xl text-white`}></i>
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-white leading-none">{stat.value}</p>
                  <p className="text-xs text-white/60 mt-0.5 truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-white/60 text-xs mb-1.5">Search</label>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>
          </div>
          <div className="w-full sm:w-44">
            <label className="block text-white/60 text-xs mb-1.5">Filter by Type</label>
            <CustomSelect
              options={typeOptions}
              value={contentFilter}
              onChange={(value) => setContentFilter(value as FilterType)}
              placeholder="Select type"
            />
          </div>
        </div>
      </div>

      {/* Content — cards on mobile, table on md+ */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">

        {/* Mobile card list */}
        <div className="md:hidden">
          {listLoading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={`skeleton-${i}`} className="p-4 border-b border-white/5">
                <div className="h-14 rounded-lg bg-white/5 animate-pulse" />
              </div>
            ))
          ) : listError ? (
            <div className="p-8 text-center text-red-400 text-sm">{listError}</div>
          ) : contents.length === 0 ? (
            <div className="p-12 text-center">
              <i className="ri-file-search-line text-5xl text-white/20 mb-3 block"></i>
              <p className="text-white/40 text-sm">No content found</p>
            </div>
          ) : (
            contents.map((content) => (
              <div key={`${content.type}-${content.contentId}`} className="p-4 border-b border-white/5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(content.type)} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${getTypeIcon(content.type)} text-white text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{content.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-white/40 text-xs">{content.authorName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(content.status)}`}>
                      {content.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleViewDetails(content)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
                  >
                    <i className="ri-eye-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(content)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-4 text-white/60 text-sm font-semibold">Content</th>
                <th className="text-left px-5 py-4 text-white/60 text-sm font-semibold">Type</th>
                <th className="text-left px-5 py-4 text-white/60 text-sm font-semibold hidden lg:table-cell">Author</th>
                <th className="text-left px-5 py-4 text-white/60 text-sm font-semibold">Status</th>
                <th className="text-left px-5 py-4 text-white/60 text-sm font-semibold hidden xl:table-cell">Posted</th>
                <th className="text-right px-5 py-4 text-white/60 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-white/5">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : listError ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-red-400 text-sm">{listError}</td>
                </tr>
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <i className="ri-file-search-line text-5xl text-white/20 mb-3 block"></i>
                    <p className="text-white/40 text-sm">No content found</p>
                  </td>
                </tr>
              ) : (
                contents.map((content) => (
                  <tr key={`${content.type}-${content.contentId}`} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="px-5 py-4 max-w-[220px]">
                      <p className="text-white font-semibold text-sm truncate">{content.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getTypeColor(content.type)} flex items-center justify-center flex-shrink-0`}>
                          <i className={`${getTypeIcon(content.type)} text-white text-xs`}></i>
                        </div>
                        <span className="text-white/80 text-sm">{content.type}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-white text-sm">{content.authorName}</p>
                      <p className="text-white/40 text-xs truncate max-w-[180px]">{content.authorEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(content.status)}`}>
                        {content.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <span className="text-white/60 text-sm">{formatDate(content.postedAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(content)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!listLoading && !listError && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-4">
            <p className="text-white/40 text-xs sm:text-sm">{totalCount.toLocaleString()} items</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageNumber(1)}
                disabled={pageNumber === 1}
                className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
                title="First page"
              >
                <i className="ri-skip-left-line"></i>
              </button>
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-white/40 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPageNumber(p as number)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          pageNumber === p
                            ? 'bg-teal-500 text-white'
                            : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
              <button
                onClick={() => setPageNumber(totalPages)}
                disabled={pageNumber === totalPages}
                className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
                title="Last page"
              >
                <i className="ri-skip-right-line"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[#1a1f37] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1f37] z-10">
              <h3 className="text-lg font-bold text-white">Content Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {detailLoading ? (
              <div className="p-12 flex items-center justify-center">
                <i className="ri-loader-4-line text-3xl text-white/40 animate-spin"></i>
              </div>
            ) : selectedContent ? (
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${getTypeColor(selectedContent.type)} flex items-center justify-center flex-shrink-0`}>
                    <i className={`${getTypeIcon(selectedContent.type)} text-xl text-white`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-white mb-1 break-words">{selectedContent.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/60 text-sm">{selectedContent.type}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadge(selectedContent.status)}`}>
                        {selectedContent.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-xs mb-1">Author</p>
                    <p className="text-white text-sm font-semibold break-words">{selectedContent.authorName}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-xs mb-1">Type</p>
                    <p className="text-white text-sm font-semibold">{selectedContent.type}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 col-span-2">
                    <p className="text-white/40 text-xs mb-1">Posted Date</p>
                    <p className="text-white text-sm font-semibold">{formatDate(selectedContent.postedAt)}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-xs mb-1">Author Email</p>
                  <p className="text-white text-sm font-semibold break-all">{selectedContent.authorEmail}</p>
                </div>

                <button
                  onClick={() => { setShowDetailModal(false); handleDelete(selectedContent); }}
                  className="w-full py-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg font-semibold hover:bg-red-500/30 transition-all cursor-pointer text-sm"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  Delete Content
                </button>
              </div>
            ) : null}
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedContent && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[#1a1f37] rounded-t-2xl sm:rounded-xl w-full sm:max-w-md border border-white/10">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-2xl text-red-400"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Content?</h3>
              <p className="text-white/60 text-sm mb-6">
                Are you sure you want to delete "<span className="text-white break-words">{selectedContent.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="flex-1 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {deleteLoading && <i className="ri-loader-4-line animate-spin"></i>}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PostedContentManagement;