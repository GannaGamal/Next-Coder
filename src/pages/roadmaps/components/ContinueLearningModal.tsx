import { useState, useEffect, useRef } from 'react';
import {
  getTrackEnrollmentDetail,
  fetchRoadmapTracks,
  updateNodeProgress,
} from '../../../services/roadmap.service';
import type { EnrollmentDetail, RoadmapTrack } from '../../../services/roadmap.service';

interface Props {
  trackName: string;
  onClose: () => void;
  onProgressUpdate?: (updated: EnrollmentDetail) => void;
}

type Section = 'checklist' | 'project' | 'rate';

const CIRCLE_R = 44;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R;

const ProgressRing = ({ pct }: { pct: number }) => {
  const offset = CIRCLE_C - (pct / 100) * CIRCLE_C;
  return (
    <svg width="120" height="120" className="-rotate-90">
      <circle cx="60" cy="60" r={CIRCLE_R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={CIRCLE_R} fill="none"
        stroke={pct >= 100 ? '#22c55e' : '#a855f7'}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={CIRCLE_C}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
};

const ContinueLearningModal = ({ trackName, onClose, onProgressUpdate }: Props) => {
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [track, setTrack] = useState<RoadmapTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * All completed node IDs (topics + subtopics) from the API.
   * The modal only exposes topic-level checkboxes so only topic IDs are toggled here,
   * but the full list is kept to avoid overwriting subtopic progress on re-render.
   */
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<Section>('checklist');

  // Upload project state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [projectUrl, setProjectUrl] = useState('');
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState(false);
  const [projectError, setProjectError] = useState('');

  // Rate state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [rateComment, setRateComment] = useState('');
  const [rateLoading, setRateLoading] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);
  const [rateError, setRateError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detail, allTracks] = await Promise.all([
          getTrackEnrollmentDetail(trackName),
          fetchRoadmapTracks(),
        ]);
        setEnrollment(detail);
        setCompletedNodeIds(detail.completedNodeIds ?? []);
        const found = allTracks.find(
          (t) => t.trackName.toLowerCase() === trackName.toLowerCase()
        );
        setTrack(found ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'We could not load track details right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [trackName]);

  // Count only topic-level completions for the progress ring
  const completedCount = track
    ? track.topics.filter((t) => completedNodeIds.includes(t.nodeId)).length
    : (enrollment?.completedTopics ?? 0);

  const totalTopics = enrollment?.totalTopics ?? track?.topics.length ?? 0;
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const handleToggleTopic = async (nodeId: string) => {
    if (togglingId) return;
    const wasCompleted = completedNodeIds.includes(nodeId);
    const newIsCompleted = !wasCompleted;

    setTogglingId(nodeId);
    setToggleError(null);

    // Optimistic update
    setCompletedNodeIds((prev) =>
      wasCompleted ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );

    try {
      await updateNodeProgress(trackName, nodeId, newIsCompleted);

      // Notify parent with updated enrollment snapshot
      if (enrollment && onProgressUpdate) {
        const newCompleted = wasCompleted
          ? completedNodeIds.filter((id) => id !== nodeId)
          : [...completedNodeIds, nodeId];
        // Recalculate using only topic IDs for the count
        const topicCompletedCount = track
          ? track.topics.filter((t) => newCompleted.includes(t.nodeId)).length
          : newCompleted.length;
        const newPct = totalTopics > 0 ? Math.round((topicCompletedCount / totalTopics) * 100) : 0;
        onProgressUpdate({
          ...enrollment,
          completedNodeIds: newCompleted,
          completedTopics: topicCompletedCount,
          progressPercent: newPct,
          isCompleted: newPct >= 100,
        });
      }
    } catch (err) {
      // Revert optimistic update
      setCompletedNodeIds((prev) =>
        wasCompleted ? [...prev, nodeId] : prev.filter((id) => id !== nodeId)
      );
      setToggleError(
        err instanceof Error
          ? err.message
          : 'Failed to update progress. Please try again.'
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFile && !projectUrl.trim()) {
      setProjectError('Please attach a file or provide a project URL.');
      return;
    }
    setProjectLoading(true);
    setProjectError('');
    setProjectSuccess(false);
    try {
      // Fake API — replace with real endpoint when available
      await new Promise<void>((res) => setTimeout(res, 800));
      setProjectSuccess(true);
      setProjectFile(null);
      setProjectUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setProjectError('We could not submit your project right now. Please try again.');
    } finally {
      setProjectLoading(false);
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setRateError('Please select a star rating.'); return; }
    setRateLoading(true);
    setRateError('');
    setRateSuccess(false);
    try {
      // Fake API — replace with real endpoint when available
      await new Promise<void>((res) => setTimeout(res, 600));
      setRateSuccess(true);
      setRating(0);
      setRateComment('');
    } catch {
      setRateError('We could not submit your rating right now. Please try again.');
    } finally {
      setRateLoading(false);
    }
  };

  const sectionTabs: { id: Section; label: string; icon: string }[] = [
    { id: 'checklist', label: 'Progress Checklist', icon: 'ri-checkbox-multiple-line' },
    { id: 'project',   label: 'Submit Project',      icon: 'ri-upload-cloud-2-line' },
    { id: 'rate',      label: 'Rate This Track',      icon: 'ri-star-line' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12172d] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-white/10 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-purple-500/20 rounded-xl">
              <i className="ri-road-map-line text-purple-400"></i>
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-none capitalize">{trackName}</h2>
              <p className="text-white/40 text-xs mt-0.5">Learning Track</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="ri-loader-4-line text-4xl text-purple-400 animate-spin block mb-3"></i>
              <p className="text-white/50 text-sm">Loading track details...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <i className="ri-error-warning-line text-5xl text-red-400 block mb-3"></i>
              <p className="text-white/70 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!loading && !error && enrollment && (
          <>
            {/* Progress overview */}
            <div className="px-6 py-4 flex items-center gap-6 border-b border-white/10 flex-shrink-0 bg-white/3">
              <div className="relative flex-shrink-0">
                <ProgressRing pct={progressPct} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-lg leading-none">{progressPct}%</span>
                  <span className="text-white/40 text-xs">done</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">{completedCount}</div>
                    <div className="text-white/40 text-xs">Completed Topics</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">{totalTopics}</div>
                    <div className="text-white/40 text-xs">Total Topics</div>
                  </div>
                </div>
                {enrollment.isCompleted && (
                  <div className="mt-2 flex items-center gap-1.5 text-green-400 text-sm">
                    <i className="ri-trophy-line"></i>
                    <span className="font-semibold">Track Completed!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex border-b border-white/10 flex-shrink-0">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    activeSection === tab.id
                      ? 'text-purple-400 border-purple-500 bg-purple-500/5'
                      : 'text-white/40 border-transparent hover:text-white/70'
                  }`}
                >
                  <i className={tab.icon}></i>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Section body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── CHECKLIST ── */}
              {activeSection === 'checklist' && (
                <div className="p-4 space-y-2">

                  {/* Toggle error banner */}
                  {toggleError && (
                    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-2">
                      <i className="ri-error-warning-line text-red-400 mt-0.5 flex-shrink-0"></i>
                      <p className="text-red-400 text-sm flex-1 min-w-0">{toggleError}</p>
                      <button
                        onClick={() => setToggleError(null)}
                        className="text-red-400/50 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <i className="ri-close-line text-base"></i>
                      </button>
                    </div>
                  )}

                  {!track ? (
                    <p className="text-white/40 text-sm text-center py-8">
                      No topic data available for this track.
                    </p>
                  ) : (
                    track.topics.map((topic, idx) => {
                      const nodeId = topic.nodeId || String(idx);
                      const done = completedNodeIds.includes(nodeId);
                      const toggling = togglingId === nodeId;

                      return (
                        <button
                          key={nodeId}
                          onClick={() => handleToggleTopic(nodeId)}
                          disabled={!!togglingId}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer text-left group disabled:opacity-70 ${
                            done
                              ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                              : 'bg-white/5 border-white/10 hover:border-purple-500/40'
                          }`}
                        >
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 border-2 transition-all ${
                            done ? 'bg-green-500 border-green-500' : 'border-white/30 group-hover:border-purple-400'
                          }`}>
                            {toggling ? (
                              <i className="ri-loader-4-line animate-spin text-white text-xs"></i>
                            ) : done ? (
                              <i className="ri-check-line text-white text-xs"></i>
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium ${done ? 'text-green-400 line-through decoration-green-500/50' : 'text-white'}`}>
                              {topic.title}
                            </span>
                            {topic.subtopics.length > 0 && (
                              <p className="text-white/30 text-xs mt-0.5">
                                {topic.subtopics.length} subtopics
                              </p>
                            )}
                          </div>
                          <span className={`text-xs flex-shrink-0 px-2 py-0.5 rounded-full ${
                            done ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/30'
                          }`}>
                            {idx + 1}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {/* ── SUBMIT PROJECT ── */}
              {activeSection === 'project' && (
                <div className="p-6">
                  <div className="mb-5">
                    <h3 className="text-white font-bold text-base mb-1">Submit Your Project</h3>
                    <p className="text-white/50 text-sm">
                      Upload your final project to complete the track and earn your certificate.
                    </p>
                    {enrollment.hasSubmittedProject && (
                      <div className="mt-3 flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                        <i className="ri-checkbox-circle-line text-lg"></i>
                        <span>You&apos;ve already submitted a project for this track.</span>
                      </div>
                    )}
                  </div>

                  {projectSuccess ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 flex items-center justify-center bg-green-500/20 rounded-2xl mx-auto mb-4">
                        <i className="ri-check-double-line text-3xl text-green-400"></i>
                      </div>
                      <h4 className="text-white font-bold text-lg mb-1">Project Submitted!</h4>
                      <p className="text-white/50 text-sm mb-4">Your project has been submitted for review.</p>
                      <button
                        onClick={() => setProjectSuccess(false)}
                        className="px-5 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap text-sm"
                      >
                        Submit Another
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleProjectSubmit} className="space-y-4">
                      {/* File upload */}
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Project File <span className="text-white/30">(zip, pdf, etc.)</span>
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                        >
                          {projectFile ? (
                            <div className="flex items-center justify-center gap-2 text-white">
                              <i className="ri-file-line text-2xl text-purple-400"></i>
                              <span className="text-sm font-medium truncate max-w-[200px]">{projectFile.name}</span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setProjectFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="text-white/40 hover:text-white transition-all cursor-pointer ml-1"
                              >
                                <i className="ri-close-line"></i>
                              </button>
                            </div>
                          ) : (
                            <>
                              <i className="ri-upload-cloud-2-line text-3xl text-white/30 block mb-2"></i>
                              <p className="text-white/50 text-sm">Click to upload file</p>
                              <p className="text-white/30 text-xs mt-1">Max 50 MB</p>
                            </>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={(e) => setProjectFile(e.target.files?.[0] ?? null)}
                        />
                      </div>

                      {/* Or URL */}
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Or Project URL <span className="text-white/30">(GitHub, live demo, etc.)</span>
                        </label>
                        <input
                          type="url"
                          value={projectUrl}
                          onChange={(e) => setProjectUrl(e.target.value)}
                          placeholder="https://github.com/you/project"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm"
                        />
                      </div>

                      {projectError && (
                        <p className="text-red-400 text-sm flex items-center gap-1.5">
                          <i className="ri-error-warning-line"></i>{projectError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={projectLoading}
                        className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {projectLoading ? (
                          <><i className="ri-loader-4-line animate-spin mr-2"></i>Uploading...</>
                        ) : (
                          <><i className="ri-upload-cloud-2-line mr-2"></i>Submit Project</>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ── RATE ── */}
              {activeSection === 'rate' && (
                <div className="p-6">
                  <div className="mb-5">
                    <h3 className="text-white font-bold text-base mb-1">Rate This Track</h3>
                    <p className="text-white/50 text-sm">
                      Share your experience and help other learners find the best paths.
                    </p>
                  </div>

                  {rateSuccess ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 flex items-center justify-center bg-yellow-500/20 rounded-2xl mx-auto mb-4">
                        <i className="ri-star-fill text-3xl text-yellow-400"></i>
                      </div>
                      <h4 className="text-white font-bold text-lg mb-1">Thanks for the feedback!</h4>
                      <p className="text-white/50 text-sm mb-4">Your rating helps the community.</p>
                      <button
                        onClick={() => setRateSuccess(false)}
                        className="px-5 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap text-sm"
                      >
                        Rate Again
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRateSubmit} className="space-y-5">
                      {/* Stars */}
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-3">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="w-10 h-10 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                            >
                              <i className={`ri-star-${(hoverRating || rating) >= star ? 'fill' : 'line'} text-2xl ${
                                (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-white/20'
                              }`}></i>
                            </button>
                          ))}
                          {rating > 0 && (
                            <span className="ml-2 text-white/60 text-sm self-center">
                              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                          Your Review <span className="text-white/30">(optional)</span>
                        </label>
                        <textarea
                          value={rateComment}
                          onChange={(e) => setRateComment(e.target.value.slice(0, 500))}
                          placeholder="What did you like or dislike about this track?"
                          rows={4}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm resize-none"
                        />
                        <p className="text-white/30 text-xs mt-1 text-right">{rateComment.length}/500</p>
                      </div>

                      {rateError && (
                        <p className="text-red-400 text-sm flex items-center gap-1.5">
                          <i className="ri-error-warning-line"></i>{rateError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={rateLoading}
                        className="w-full py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {rateLoading ? (
                          <><i className="ri-loader-4-line animate-spin mr-2"></i>Submitting...</>
                        ) : (
                          <><i className="ri-star-fill mr-2"></i>Submit Rating</>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContinueLearningModal;