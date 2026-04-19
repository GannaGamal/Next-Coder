import type { AdminTopic, AdminSubtopic } from '../../../services/admin.roadmap.service';
import LinkEditor from './LinkEditor';
import SubtopicEditor from './SubtopicEditor';

interface TopicEditorProps {
  topic: AdminTopic;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (updated: AdminTopic) => void;
  onDelete: () => void;
}

const makeSubtopic = (): AdminSubtopic => ({
  nodeId: `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  title: '',
  description: '',
  links: [],
});

const TopicEditor = ({ topic, index, expanded, onToggle, onChange, onDelete }: TopicEditorProps) => {
  const update = (field: keyof AdminTopic, value: unknown) =>
    onChange({ ...topic, [field]: value });

  const updateSubtopic = (nodeId: string, updated: AdminSubtopic) =>
    onChange({ ...topic, subtopics: topic.subtopics.map(s => s.nodeId === nodeId ? updated : s) });

  const deleteSubtopic = (nodeId: string) =>
    onChange({ ...topic, subtopics: topic.subtopics.filter(s => s.nodeId !== nodeId) });

  const addSubtopic = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ ...topic, subtopics: [...topic.subtopics, makeSubtopic()] });
  };

  const totalLinks = topic.links.length + topic.subtopics.reduce((acc, s) => acc + s.links.length, 0);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* ── Topic header row ── */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none hover:bg-white/5 transition-all"
        onClick={onToggle}
      >
        <div className="w-5 h-5 flex items-center justify-center text-white/40 flex-shrink-0">
          <i
            className={`ri-arrow-right-s-line text-sm transition-transform ${expanded ? 'rotate-90' : ''}`}
          ></i>
        </div>

        <span className="w-5 h-5 flex items-center justify-center bg-teal-500/20 rounded text-teal-400 text-xs font-bold flex-shrink-0">
          {index + 1}
        </span>

        <input
          type="text"
          placeholder="Topic title..."
          value={topic.title}
          onChange={e => { e.stopPropagation(); update('title', e.target.value); }}
          onClick={e => e.stopPropagation()}
          className="flex-1 min-w-0 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
        />

        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {topic.subtopics.length > 0 && (
            <span className="flex items-center gap-0.5 text-white/40 text-xs">
              <i className="ri-git-branch-line text-[10px]"></i>
              {topic.subtopics.length}
            </span>
          )}
          {totalLinks > 0 && (
            <span className="flex items-center gap-0.5 text-teal-400/60 text-xs">
              <i className="ri-links-line text-[10px]"></i>
              {totalLinks}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="w-7 h-7 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer flex-shrink-0"
        >
          <i className="ri-delete-bin-line text-sm"></i>
        </button>
      </div>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Description */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Topic description (optional)..."
              value={topic.description}
              onChange={e => update('description', e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          {/* Topic-level links */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Topic Resources
            </label>
            <div className="bg-white/5 rounded-xl px-3 py-3 border border-white/5">
              <LinkEditor links={topic.links} onChange={links => update('links', links)} />
            </div>
          </div>

          {/* Subtopics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <i className="ri-git-branch-line"></i>
                Subtopics
                {topic.subtopics.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/10 rounded-full text-white/40 font-normal">
                    {topic.subtopics.length}
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={addSubtopic}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line"></i>Add Subtopic
              </button>
            </div>

            {topic.subtopics.length === 0 ? (
              <div className="text-center py-4 text-white/20 text-xs border border-dashed border-white/5 rounded-xl">
                No subtopics yet — click "Add Subtopic" to start
              </div>
            ) : (
              <div className="space-y-1.5">
                {topic.subtopics.map((sub, si) => (
                  <SubtopicEditor
                    key={sub.nodeId}
                    subtopic={sub}
                    index={si}
                    onChange={updated => updateSubtopic(sub.nodeId, updated)}
                    onDelete={() => deleteSubtopic(sub.nodeId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicEditor;
