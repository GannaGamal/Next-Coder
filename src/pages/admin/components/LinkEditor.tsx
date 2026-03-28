import { AdminLink } from '../../../services/admin.roadmap.service';

const LINK_TYPES = ['article', 'video', 'documentation', 'course', 'github', 'other'];

const TYPE_ICONS: Record<string, string> = {
  article: 'ri-article-line',
  video: 'ri-youtube-line',
  documentation: 'ri-book-2-line',
  course: 'ri-graduation-cap-line',
  github: 'ri-github-line',
  other: 'ri-link-line',
};

const TYPE_COLORS: Record<string, string> = {
  article: 'text-emerald-400',
  video: 'text-red-400',
  documentation: 'text-sky-400',
  course: 'text-yellow-400',
  github: 'text-white/60',
  other: 'text-white/40',
};

interface LinkEditorProps {
  links: AdminLink[];
  onChange: (links: AdminLink[]) => void;
  compact?: boolean;
}

const LinkEditor = ({ links, onChange, compact = false }: LinkEditorProps) => {
  const addLink = () =>
    onChange([...links, { title: '', url: '', type: 'article' }]);

  const removeLink = (i: number) =>
    onChange(links.filter((_, idx) => idx !== i));

  const updateLink = (i: number, field: keyof AdminLink, value: string) =>
    onChange(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  return (
    <div className={compact ? '' : 'mt-2'}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
          <i className="ri-links-line"></i>
          Resources & Links
          {links.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/10 rounded-full text-white/50 font-normal">
              {links.length}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i>Add Link
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-white/20 text-xs italic py-1">No resources added yet</p>
      ) : (
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 items-center bg-black/20 rounded-lg p-2">
              {/* Type selector */}
              <div className="relative flex-shrink-0">
                <select
                  value={link.type}
                  onChange={e => updateLink(i, 'type', e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-teal-500 cursor-pointer pr-5 w-[110px]"
                >
                  {LINK_TYPES.map(t => (
                    <option key={t} value={t} className="bg-[#1a1f37]">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
                <i
                  className={`${TYPE_ICONS[link.type] ?? 'ri-link-line'} ${TYPE_COLORS[link.type] ?? 'text-white/40'} absolute right-1.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none`}
                ></i>
              </div>

              {/* Title */}
              <input
                type="text"
                placeholder="Link title..."
                value={link.title}
                onChange={e => updateLink(i, 'title', e.target.value)}
                className="flex-[2] min-w-0 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-teal-500"
              />

              {/* URL */}
              <input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={e => updateLink(i, 'url', e.target.value)}
                className="flex-[3] min-w-0 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-teal-500"
              />

              {/* Preview */}
              {link.url && (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-teal-400 transition-all flex-shrink-0"
                  title="Preview link"
                >
                  <i className="ri-external-link-line text-xs"></i>
                </a>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer flex-shrink-0"
              >
                <i className="ri-delete-bin-line text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkEditor;
