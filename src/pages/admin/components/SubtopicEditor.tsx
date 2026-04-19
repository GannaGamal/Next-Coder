import { useState } from 'react';
import type { AdminSubtopic } from '../../../services/admin.roadmap.service';
import LinkEditor from './LinkEditor';

interface SubtopicEditorProps {
  subtopic: AdminSubtopic;
  index: number;
  onChange: (updated: AdminSubtopic) => void;
  onDelete: () => void;
}

const SubtopicEditor = ({ subtopic, index, onChange, onDelete }: SubtopicEditorProps) => {
  const [expanded, setExpanded] = useState(false);

  const update = (field: keyof AdminSubtopic, value: unknown) =>
    onChange({ ...subtopic, [field]: value });

  return (
    <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded(p => !p)}
          className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white transition-all cursor-pointer flex-shrink-0"
        >
          <i
            className={`ri-arrow-right-s-line text-sm transition-transform ${expanded ? 'rotate-90' : ''}`}
          ></i>
        </button>

        <span className="w-4 h-4 flex items-center justify-center text-white/30 text-xs flex-shrink-0">
          {index + 1}.
        </span>

        <input
          type="text"
          placeholder="Subtopic title..."
          value={subtopic.title}
          onChange={e => update('title', e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-white/80 text-xs placeholder-white/20 focus:outline-none"
        />

        {/* Link count badge */}
        {subtopic.links.length > 0 && (
          <span className="flex items-center gap-0.5 text-teal-400/70 text-xs flex-shrink-0">
            <i className="ri-links-line text-[10px]"></i>
            {subtopic.links.length}
          </span>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer flex-shrink-0"
        >
          <i className="ri-delete-bin-line text-xs"></i>
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-white/5 pt-3 space-y-3">
          <textarea
            placeholder="Description (optional)..."
            value={subtopic.description}
            onChange={e => update('description', e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 text-xs placeholder-white/20 focus:outline-none focus:border-teal-500 resize-none"
          />
          <LinkEditor
            links={subtopic.links}
            onChange={links => update('links', links)}
            compact
          />
        </div>
      )}
    </div>
  );
};

export default SubtopicEditor;
