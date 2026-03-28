import { useState, useMemo } from 'react';
import { RoadmapTrack, getLinkTypeIcon, getLinkTypeColor } from '../../../services/roadmap.service';

interface TrackDetailModalProps {
  track: RoadmapTrack;
  onClose: () => void;
}

const TrackDetailModal = ({ track, onClose }: TrackDetailModalProps) => {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTopic = (nodeId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
  };

  const toggleSubtopic = (nodeId: string) => {
    setExpandedSubtopics((prev) => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
  };

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return track.topics;
    const q = searchQuery.toLowerCase();
    return track.topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subtopics.some(
          (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        )
    );
  }, [track.topics, searchQuery]);

  const totalTopics = track.topics.length;
  const totalSubtopics = track.topics.reduce((acc, t) => acc + t.subtopics.length, 0);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12172d] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{track.trackName}</h2>
            <div className="flex gap-4 text-sm text-white/50">
              <span><i className="ri-node-tree mr-1"></i>{totalTopics} topics</span>
              <span><i className="ri-git-branch-line mr-1"></i>{totalSubtopics} subtopics</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer flex-shrink-0 ml-4"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
            <input
              type="text"
              placeholder="Search topics or subtopics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>
        </div>

        {/* Topics list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-10 text-white/40">
              <i className="ri-search-line text-4xl mb-2 block"></i>
              No topics match your search.
            </div>
          ) : (
            filteredTopics.map((topic, index) => (
              <div key={topic.nodeId || index} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                {/* Topic header */}
                <button
                  onClick={() => toggleTopic(topic.nodeId || String(index))}
                  className="w-full flex items-start justify-between p-4 text-left hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-7 h-7 flex items-center justify-center bg-purple-500/20 rounded-lg flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-xs font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm">{topic.title}</h3>
                      {topic.description && (
                        <p className="text-white/50 text-xs mt-1 line-clamp-2">{topic.description}</p>
                      )}
                      <div className="flex gap-3 mt-1.5 text-xs text-white/40">
                        {topic.links.length > 0 && (
                          <span><i className="ri-links-line mr-0.5"></i>{topic.links.length} links</span>
                        )}
                        {topic.subtopics.length > 0 && (
                          <span><i className="ri-git-branch-line mr-0.5"></i>{topic.subtopics.length} subtopics</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <i className={`ri-arrow-down-s-line text-white/40 text-lg flex-shrink-0 mt-0.5 transition-transform ${expandedTopics.has(topic.nodeId || String(index)) ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Topic expanded content */}
                {expandedTopics.has(topic.nodeId || String(index)) && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                    {/* Links */}
                    {topic.links.length > 0 && (
                      <div>
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Resources</p>
                        <div className="space-y-1.5">
                          {topic.links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              target="_blank"
                              rel="nofollow noopener noreferrer"
                              className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                            >
                              <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${getLinkTypeColor(link.type)}`}>
                                <i className={`${getLinkTypeIcon(link.type)} text-sm`}></i>
                              </div>
                              <span className="text-white/80 text-sm group-hover:text-white transition-colors flex-1 min-w-0 truncate">{link.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${getLinkTypeColor(link.type)}`}>{link.type}</span>
                              <i className="ri-external-link-line text-white/30 group-hover:text-white/60 flex-shrink-0"></i>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subtopics */}
                    {topic.subtopics.length > 0 && (
                      <div>
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Subtopics</p>
                        <div className="space-y-1.5">
                          {topic.subtopics.map((sub, sIdx) => (
                            <div key={sub.nodeId || sIdx} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                              <button
                                onClick={() => toggleSubtopic(sub.nodeId || `${topic.nodeId}-${sIdx}`)}
                                className="w-full flex items-start justify-between p-3 text-left hover:bg-white/5 transition-all cursor-pointer"
                              >
                                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                  <div className="w-5 h-5 flex items-center justify-center bg-pink-500/20 rounded flex-shrink-0 mt-0.5">
                                    <i className="ri-git-commit-line text-pink-400 text-xs"></i>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white/90 text-sm font-medium">{sub.title}</h4>
                                    {sub.description && (
                                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{sub.description}</p>
                                    )}
                                  </div>
                                </div>
                                {sub.links.length > 0 && (
                                  <i className={`ri-arrow-down-s-line text-white/30 text-base flex-shrink-0 transition-transform ${expandedSubtopics.has(sub.nodeId || `${topic.nodeId}-${sIdx}`) ? 'rotate-180' : ''}`}></i>
                                )}
                              </button>

                              {expandedSubtopics.has(sub.nodeId || `${topic.nodeId}-${sIdx}`) && sub.links.length > 0 && (
                                <div className="px-3 pb-3 space-y-1.5 border-t border-white/10 pt-3">
                                  {sub.links.map((link, llIdx) => (
                                    <a
                                      key={llIdx}
                                      href={link.url}
                                      target="_blank"
                                      rel="nofollow noopener noreferrer"
                                      className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                                    >
                                      <div className={`w-6 h-6 flex items-center justify-center rounded flex-shrink-0 ${getLinkTypeColor(link.type)}`}>
                                        <i className={`${getLinkTypeIcon(link.type)} text-xs`}></i>
                                      </div>
                                      <span className="text-white/70 text-xs group-hover:text-white transition-colors flex-1 min-w-0 truncate">{link.title}</span>
                                      <i className="ri-external-link-line text-white/30 group-hover:text-white/60 flex-shrink-0 text-xs"></i>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackDetailModal;
