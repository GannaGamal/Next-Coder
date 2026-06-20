import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  adminCreateTrack,
  adminUpdateTrack,
  adminDeleteTrack,
} from '../../../services/admin.roadmap.service';
import type { AdminTrack, AdminTopic } from '../../../services/admin.roadmap.service';
import { fetchRoadmapTracksWithPagination, clearRoadmapCache } from '../../../services/roadmap.service';
import TrackFormModal from './TrackFormModal';

const TrackManagement = () => {
  const [tracks, setTracks]               = useState<AdminTrack[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [pageNumber, setPageNumber]       = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalCount, setTotalCount]       = useState(0);
  const [pageSize] = useState(10);
  const [formMode, setFormMode]           = useState<'add'>('add');
  const [editTarget, setEditTarget]       = useState<AdminTrack | null>(null);
  const [showForm, setShowForm]           = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<AdminTrack | null>(null);
  const [deleting, setDeleting]           = useState(false);
  const [toast, setToast]                 = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ── Load from real API ─────────────────────────────────────────────────────
  const categorySlugByDisplayName: Record<string, string> = {
    Languages: 'languages',
    Frontend: 'frontend',
    Mobile: 'mobile',
    Backend: 'backend',
    Databases: 'databases',
    'DevOps & Cloud': 'devops-cloud',
    'AI & Data': 'ai-data',
    'CS Fundamentals': 'cs-fundamentals',
    Specialized: 'specialized',
    'Roles & Soft Skills': 'roles',
  };

  const loadTracks = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchRoadmapTracksWithPagination(pageNumber, pageSize, searchQuery);
      const mapped: AdminTrack[] = Array.isArray(data.tracks)
        ? data.tracks.map((t: any) => ({
            id: String(t.trackName ?? t.displayName ?? t.id ?? ''),
            trackName: String(t.displayName ?? t.trackName ?? ''),
            topics: Array.isArray(t.topics) ? t.topics : [],
            imageUrl: typeof t.imageUrl === 'string' ? t.imageUrl : '',
            categorySlug:
              categorySlugByDisplayName[String(t.categoryDisplayName)] || '',
            createdAt: '—',
            updatedAt: '—',
          }))
        : [];
      setTracks(mapped);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch {
      setLoadError('We could not load tracks right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, [pageNumber, searchQuery]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };



  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => tracks, [tracks]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => { setFormMode('add'); setEditTarget(null); setShowForm(true); };

  const handleSave = async (
    name: string,
    imageUrl: string,
    categorySlug: string,
    topics: AdminTopic[]
  ) => {
    setShowForm(false);

    if (formMode === 'add') {
      const created = await adminCreateTrack({ trackName: name, imageUrl, categorySlug, topics });
      setTracks((prev) => [created, ...prev]);
      setTotalCount((prev) => prev + 1);
      setPageNumber(1);
      showToast(`Track "${created.trackName}" created successfully.`);
      return;
    }

    if (editTarget) {
      const updated = await adminUpdateTrack(editTarget.id, { trackName: name, imageUrl, categorySlug, topics });
      setTracks((prev) => prev.map((track) => (track.id === editTarget.id ? updated : track)));
      showToast(`Track "${updated.trackName}" updated.`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteTrack(deleteTarget.id);
      setTracks((prev) => prev.filter((track) => track.id !== deleteTarget.id));
      setTotalCount((prev) => Math.max(prev - 1, 0));
      showToast(`Track "${deleteTarget.trackName}" deleted.`);
    } catch {
      showToast('Delete failed. Please try again.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center gap-2 ${toast.type === 'success' ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'}`}>
          <i className={toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
          {toast.msg}
        </div>
      )}

      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
          <input
            type="text"
            placeholder="Search tracks or topics..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (pageNumber !== 1) setPageNumber(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500 text-sm"
          />
        </div>
        <button
          onClick={openAdd}
          className="px-5 py-3 bg-teal-500 text-white rounded-xl font-semibold text-sm hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <i className="ri-add-line text-base"></i>Add Track
        </button>
      </div>

      {/* API load error */}
      {!loading && loadError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <i className="ri-error-warning-line text-2xl text-red-400 flex-shrink-0"></i>
            <p className="text-red-300 text-sm">{loadError}</p>
          </div>
          <button
            onClick={() => { clearRoadmapCache(); loadTracks(); }}
            className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            <i className="ri-refresh-line mr-1.5"></i>Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/10 animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Track list */}
      {!loading && !loadError && (
        <>
          {filtered.length === 0 ? (
            <div className="bg-white/5 rounded-xl border border-white/10 p-12 text-center">
              <i className="ri-search-line text-5xl text-white/20 mb-3 block"></i>
              <p className="text-white/40">{searchQuery ? 'No tracks match your search.' : 'No tracks yet. Click "Add Track" to create one.'}</p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-white/5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                <div className="col-span-7">Track Name</div>
                <div className="col-span-2 text-center">Topics</div>
                <div className="col-span-2 text-center">Subtopics</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {filtered.map((track) => {
                  const totalSub = track.topics.reduce((a, t) => a + t.subtopics.length, 0);
                  return (
                    <div key={track.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-all">
                      {/* Name */}
                      <div className="col-span-7 flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 flex items-center justify-center bg-teal-500/20 rounded-lg flex-shrink-0">
                          <i className="ri-road-map-line text-teal-400"></i>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{track.trackName}</p>
                        </div>
                      </div>

                      {/* Topic count */}
                      <div className="col-span-2 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                          {track.topics.length}
                        </span>
                      </div>

                      {/* Subtopic count */}
                      <div className="col-span-2 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-400">
                          {totalSub}
                        </span>
                      </div>



                      {/* Actions — delete only */}
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDeleteTarget(track)}
                          title="Delete"
                          className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="px-4 py-3 border-t border-white/10 flex flex-col gap-3 sm:flex-row items-center justify-between bg-white/5">
            <p className="text-white/40 text-xs sm:text-sm">{totalCount.toLocaleString()} items</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageNumber(1)}
                disabled={pageNumber === 1 || loading}
                className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
                title="First page"
              >
                <i className="ri-skip-left-line"></i>
              </button>
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1 || loading}
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
                disabled={pageNumber === totalPages || loading}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
              <button
                onClick={() => setPageNumber(totalPages)}
                disabled={pageNumber === totalPages || loading}
                className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
                title="Last page"
              >
                <i className="ri-skip-right-line"></i>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Form modal */}
      {showForm && (
        <TrackFormModal
          mode={formMode}
          track={editTarget}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f37] rounded-2xl w-full max-w-md border border-white/10 p-6">
            <div className="w-14 h-14 flex items-center justify-center bg-red-500/10 rounded-2xl mx-auto mb-4">
              <i className="ri-delete-bin-line text-3xl text-red-400"></i>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Delete Track</h3>
            <p className="text-white/60 text-sm text-center mb-6">
              Are you sure you want to delete <strong className="text-white">&quot;{deleteTarget.trackName}&quot;</strong>?
              This will remove <strong className="text-white">{deleteTarget.topics.length} topics</strong> as well. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                {deleting ? <><i className="ri-loader-4-line animate-spin mr-2"></i>Deleting...</> : <><i className="ri-delete-bin-line mr-2"></i>Delete</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TrackManagement;
