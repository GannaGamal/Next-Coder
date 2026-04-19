import { useState, useEffect } from 'react';
import type { AdminTrack, AdminTopic } from '../../../services/admin.roadmap.service';
import TopicEditor from './TopicEditor';

interface TrackFormModalProps {
  mode: 'add' | 'edit';
  track?: AdminTrack | null;
  onSave: (name: string, topics: AdminTopic[]) => Promise<void>;
  onClose: () => void;
}

const makeTopic = (): AdminTopic => ({
  nodeId: `topic-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  title: '',
  description: '',
  links: [],
  subtopics: [],
});

const TrackFormModal = ({ mode, track, onSave, onClose }: TrackFormModalProps) => {
  const [trackName, setTrackName] = useState('');
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // ── Seed form when opening ─────────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'edit' && track) {
      setTrackName(track.trackName);
      // Deep clone so edits don't mutate the parent's reference
      const cloned: AdminTopic[] = track.topics.map(t => ({
        ...t,
        links: t.links.map(l => ({ ...l })),
        subtopics: t.subtopics.map(s => ({
          ...s,
          links: s.links.map(l => ({ ...l })),
        })),
      }));
      setTopics(cloned);
      setExpandedTopics(new Set());
    } else {
      const first = makeTopic();
      setTrackName('');
      setTopics([first]);
      setExpandedTopics(new Set([first.nodeId]));
    }
  }, [mode, track]);

  // ── Topic list helpers ────────────────────────────────────────────────────
  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const addTopic = () => {
    const t = makeTopic();
    setTopics(prev => [...prev, t]);
    setExpandedTopics(prev => new Set(prev).add(t.nodeId));
    setTimeout(() => {
      document.getElementById('topics-scroll-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const updateTopic = (nodeId: string, updated: AdminTopic) =>
    setTopics(prev => prev.map(t => t.nodeId === nodeId ? updated : t));

  const deleteTopic = (nodeId: string) =>
    setTopics(prev => prev.filter(t => t.nodeId !== nodeId));

  // ── Stats ────────────────────────────────────────────────────────────────
  const validTopics = topics.filter(t => t.title.trim());
  const totalSubtopics = topics.reduce((a, t) => a + t.subtopics.filter(s => s.title.trim()).length, 0);
  const totalLinks = topics.reduce(
    (a, t) => a + t.links.length + t.subtopics.reduce((b, s) => b + s.links.length, 0),
    0
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!trackName.trim()) { setError('Track name is required.'); return; }
    if (validTopics.length === 0) { setError('Add at least one topic with a title.'); return; }
    setError('');
    setSaving(true);
    try {
      await onSave(trackName.trim(), validTopics);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#13182e] rounded-2xl w-full max-w-3xl max-h-[94vh] flex flex-col border border-white/10 shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'add' ? 'Add New Track' : `Edit Track`}
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              {mode === 'add'
                ? 'Build the full learning path with topics, subtopics and resources'
                : `Editing "${trackName || track?.trackName}"`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer transition-all"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* ── Stats bar ── */}
        <div className="flex gap-4 px-6 py-2.5 border-b border-white/5 bg-white/3 flex-shrink-0">
          {[
            { icon: 'ri-node-tree', label: 'Topics', val: validTopics.length },
            { icon: 'ri-git-branch-line', label: 'Subtopics', val: totalSubtopics },
            { icon: 'ri-links-line', label: 'Resources', val: totalLinks },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-1.5 text-white/40 text-xs">
              <i className={`${stat.icon} text-teal-400/60`}></i>
              <span className="text-white/70 font-semibold">{stat.val}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Track Name */}
          <div>
            <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
              Track Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={trackName}
              onChange={e => setTrackName(e.target.value)}
              placeholder="e.g. Frontend Development"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-teal-500 text-sm"
            />
          </div>

          {/* Topics section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                Topics
                <span className="ml-2 text-white/30 font-normal normal-case">
                  ({validTopics.length} valid of {topics.length})
                </span>
              </label>
              <button
                type="button"
                onClick={addTopic}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line"></i>Add Topic
              </button>
            </div>

            <div className="space-y-2">
              {topics.map((topic, idx) => (
                <TopicEditor
                  key={topic.nodeId}
                  topic={topic}
                  index={idx}
                  expanded={expandedTopics.has(topic.nodeId)}
                  onToggle={() => toggleTopic(topic.nodeId)}
                  onChange={updated => updateTopic(topic.nodeId, updated)}
                  onDelete={() => deleteTopic(topic.nodeId)}
                />
              ))}

              {topics.length === 0 && (
                <div className="text-center py-8 text-white/25 text-sm border border-dashed border-white/10 rounded-xl">
                  No topics yet — click "Add Topic" to start building the track
                </div>
              )}

              <div id="topics-scroll-anchor" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <i className="ri-error-warning-line flex-shrink-0"></i>{error}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/10 flex-shrink-0">
          <div className="flex-1 flex items-center text-white/30 text-xs gap-1">
            <i className="ri-information-line"></i>
            Add / Edit / Delete are simulated
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/15 transition-all cursor-pointer whitespace-nowrap text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            {saving ? (
              <><i className="ri-loader-4-line animate-spin"></i>Saving...</>
            ) : mode === 'add' ? (
              <><i className="ri-add-circle-line"></i>Create Track</>
            ) : (
              <><i className="ri-save-line"></i>Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackFormModal;
