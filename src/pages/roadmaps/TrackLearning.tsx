import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import {
  getTrackEnrollmentDetail,
  fetchRoadmapTracks,
  getLinkTypeIcon,
  getLinkTypeColor,
  updateNodeProgress,
  submitProject,
  getMyProject,
  deleteMyProject,
} from '../../services/roadmap.service';
import type { EnrollmentDetail, RoadmapTrack, RoadmapLink, ProjectSubmission } from '../../services/roadmap.service';

type Section = 'checklist' | 'project' | 'rate';

// ── Progress Ring ──────────────────────────────────────────────────────────────
const CIRCLE_R = 52;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R;

const ProgressRing = ({ pct }: { pct: number }) => {
  const offset = CIRCLE_C - (pct / 100) * CIRCLE_C;
  return (
    <svg width="140" height="140" className="-rotate-90">
      <circle cx="70" cy="70" r={CIRCLE_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={CIRCLE_R} fill="none"
        stroke={pct >= 100 ? '#22c55e' : '#a855f7'}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={CIRCLE_C}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
};

// ── Locked Section Banner ──────────────────────────────────────────────────────
const LockedBanner = ({ section }: { section: 'project' | 'rate' }) => (
  <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
    <div className="w-20 h-20 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl mx-auto mb-5">
      <i className="ri-lock-2-line text-4xl text-white/30"></i>
    </div>
    <h3 className="text-white font-bold text-xl mb-2">
      {section === 'project' ? 'Submit Your Project' : 'Rate This Track'}
    </h3>
    <p className="text-white/50 text-sm max-w-sm leading-relaxed mb-6">
      {section === 'project'
        ? 'Complete 100% of the checklist topics to unlock project submission.'
        : 'Finish the entire track to unlock the rating section and share your experience.'}
    </p>
    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-xl px-5 py-3">
      <i className="ri-checkbox-multiple-line text-purple-400"></i>
      <span className="text-purple-400 text-sm font-medium">Complete all topics first</span>
    </div>
  </div>
);

// ── Link Pills ─────────────────────────────────────────────────────────────────
const LinkPills = ({ links }: { links: RoadmapLink[] }) => {
  if (!links || links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80 cursor-pointer ${getLinkTypeColor(link.type)}`}
        >
          <i className={`${getLinkTypeIcon(link.type)} text-xs`}></i>
          <span>{link.title || link.type}</span>
          <i className="ri-external-link-line text-xs opacity-60"></i>
        </a>
      ))}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const TrackLearning = () => {
  const { trackName } = useParams<{ trackName: string }>();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [track, setTrack] = useState<RoadmapTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Single source of truth for all completed node IDs (topics + subtopics).
   * Initialised from the API response and kept in sync via optimistic updates.
   */
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);

  // Which node is currently being toggled (shows spinner on its checkbox)
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Inline error shown when the API rejects a toggle (e.g. subtopics not done)
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Which topic accordions are expanded
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const [activeSection, setActiveSection] = useState<Section>('checklist');

  // Upload project state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState(false);
  const [projectError, setProjectError] = useState('');
  const [submittedProject, setSubmittedProject] = useState<ProjectSubmission | null>(null);
  const [existingProjectLoading, setExistingProjectLoading] = useState(false);
  const [deleteProjectLoading, setDeleteProjectLoading] = useState(false);
  const [deleteProjectError, setDeleteProjectError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Rate state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [rateComment, setRateComment] = useState('');
  const [rateLoading, setRateLoading] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);
  const [rateError, setRateError] = useState('');

  // Which subtopic descriptions are fully expanded
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  // Toggle description expand
  const toggleDescription = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const load = useCallback(async () => {
    if (!trackName) return;
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

      // If the user already submitted a project, fetch its details
      if (detail.hasSubmittedProject) {
        setExistingProjectLoading(true);
        try {
          const existing = await getMyProject(trackName);
          if (existing) setSubmittedProject(existing);
        } catch {
          // Non-fatal — just won't show the details card
        } finally {
          setExistingProjectLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not load track details right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [trackName]);

  useEffect(() => { load(); }, [load]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  // Count only top-level topic IDs so the progress ring matches the API's definition
  const completedCount = track
    ? track.topics.filter((t) => completedNodeIds.includes(t.nodeId)).length
    : (enrollment?.completedTopics ?? 0);

  const totalTopics = enrollment?.totalTopics ?? track?.topics.length ?? 0;
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const isCompleted = totalTopics > 0 && completedCount >= totalTopics;

  const totalSubtopics = track
    ? track.topics.reduce((acc, t) => acc + t.subtopics.length, 0)
    : 0;
  const completedSubtopicsCount = track
    ? track.topics
        .flatMap((t) => t.subtopics)
        .filter((s) => completedNodeIds.includes(s.nodeId))
        .length
    : 0;

  // ── Toggle helpers ─────────────────────────────────────────────────────────

  /**
   * Shared toggle logic for both topics and subtopics.
   * Performs an optimistic update then calls the real API.
   * On failure the optimistic change is reverted and an inline error is shown.
   */
  const handleToggleNode = async (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      await updateNodeProgress(trackName ?? '', nodeId, newIsCompleted);
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

  // Topic toggle — wraps shared handler (kept as separate function for clarity)
  const handleToggleTopic = (nodeId: string, e: React.MouseEvent) =>
    handleToggleNode(nodeId, e);

  // Subtopic toggle — same API, same handler
  const handleToggleSubtopic = (nodeId: string, e: React.MouseEvent) =>
    handleToggleNode(nodeId, e);

  // Toggle accordion expand
  const toggleExpand = (nodeId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setProjectError('Please enter a project title.');
      return;
    }
    if (!projectFile && !projectUrl.trim()) {
      setProjectError('Please attach a file or provide a repository URL.');
      return;
    }
    setProjectLoading(true);
    setProjectError('');
    setProjectSuccess(false);
    try {
      const result = await submitProject({
        trackName: trackName ?? '',
        title: projectTitle.trim(),
        description: projectDescription.trim() || undefined,
        repoUrl: projectUrl.trim() || undefined,
        file: projectFile,
      });
      setSubmittedProject(result);
      setProjectSuccess(true);
      setProjectFile(null);
      setProjectTitle('');
      setProjectDescription('');
      setProjectUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setProjectError(err instanceof Error ? err.message : 'We could not submit your project right now. Please try again.');
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
      await new Promise<void>((res) => setTimeout(res, 600));
      setRateSuccess(true);
      setRating(0);
      setRateComment('');
    } catch {
      setRateError('Submission failed. Please try again.');
    } finally {
      setRateLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!trackName) return;
    setDeleteProjectLoading(true);
    setDeleteProjectError('');
    try {
      await deleteMyProject(trackName);
      // Reset all project state so the form reappears
      setSubmittedProject(null);
      setProjectSuccess(false);
      setShowDeleteConfirm(false);
      // Also update enrollment flag locally
      setEnrollment((prev) => prev ? { ...prev, hasSubmittedProject: false } : prev);
    } catch (err) {
      setDeleteProjectError(err instanceof Error ? err.message : 'Could not delete the project. Please try again.');
    } finally {
      setDeleteProjectLoading(false);
    }
  };

  const sectionTabs: { id: Section; label: string; icon: string; requiresCompletion: boolean }[] = [
    { id: 'checklist', label: 'Progress Checklist', icon: 'ri-checkbox-multiple-line', requiresCompletion: false },
    { id: 'project',   label: 'Submit Project',      icon: 'ri-upload-cloud-2-line',    requiresCompletion: true  },
    { id: 'rate',      label: 'Rate Track',           icon: 'ri-star-line',              requiresCompletion: true  },
  ];

  return (
    <div className="min-h-screen bg-[#0f1225]">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Back button */}
          <button
            onClick={() => navigate('/roadmaps')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-all cursor-pointer mb-6 text-sm group"
          >
            <i className="ri-arrow-left-line group-hover:-translate-x-1 transition-transform"></i>
            Back to My Courses
          </button>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <i className="ri-loader-4-line text-5xl text-purple-400 animate-spin block mb-4"></i>
              <p className="text-white/50">Loading track details...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-red-500/10 rounded-2xl mb-4">
                <i className="ri-error-warning-line text-4xl text-red-400"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Couldn&apos;t load track</h3>
              <p className="text-white/50 mb-6">{error}</p>
              <button
                onClick={load}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line mr-2"></i>Retry
              </button>
            </div>
          )}

          {!loading && !error && enrollment && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ── LEFT: Stats sidebar ─────────────────────────────────── */}
              <div className="lg:col-span-1 space-y-5">

                {/* Track header card */}
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <i className="ri-road-map-line text-xl text-white"></i>
                    </div>
                    <div>
                      <h1 className="text-white font-bold text-xl leading-tight capitalize">{trackName}</h1>
                      <p className="text-white/40 text-xs mt-0.5">Learning Track</p>
                    </div>
                  </div>

                  {/* Progress ring */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <ProgressRing pct={progressPct} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-2xl leading-none">{progressPct}%</span>
                        <span className="text-white/40 text-xs mt-1">Complete</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>

                  {isCompleted && (
                    <div className="flex items-center justify-center gap-2 text-green-400 font-semibold text-sm bg-green-500/10 border border-green-500/30 rounded-xl py-2">
                      <i className="ri-trophy-fill text-lg"></i>
                      Track Completed!
                    </div>
                  )}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{completedCount}</div>
                    <div className="text-white/40 text-xs mt-1">Topics Done</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{totalTopics}</div>
                    <div className="text-white/40 text-xs mt-1">Total Topics</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{totalTopics - completedCount}</div>
                    <div className="text-white/40 text-xs mt-1">Remaining</div>
                  </div>
                  <div className={`border rounded-xl p-4 text-center ${enrollment.hasSubmittedProject ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className={`text-2xl font-bold ${enrollment.hasSubmittedProject ? 'text-cyan-400' : 'text-white/30'}`}>
                      <i className={enrollment.hasSubmittedProject ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}></i>
                    </div>
                    <div className="text-white/40 text-xs mt-1">Project</div>
                  </div>
                </div>

                {/* Subtopics progress card */}
                {totalSubtopics > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
                        <i className="ri-list-check-2 text-xs"></i>
                        Subtopics
                      </p>
                      <span className="text-white/40 text-xs">
                        {completedSubtopicsCount} / {totalSubtopics}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${totalSubtopics > 0 ? Math.round((completedSubtopicsCount / totalSubtopics) * 100) : 0}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-cyan-400">{completedSubtopicsCount}</div>
                        <div className="text-white/30 text-xs">Done</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white/50">{totalSubtopics - completedSubtopicsCount}</div>
                        <div className="text-white/30 text-xs">Left</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{totalSubtopics > 0 ? Math.round((completedSubtopicsCount / totalSubtopics) * 100) : 0}%</div>
                        <div className="text-white/30 text-xs">Rate</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enrolled date */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">Enrolled on</p>
                  <p className="text-white text-sm font-medium">
                    {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Unlock info */}
                {!isCompleted && (
                  <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                    <p className="text-white/40 text-xs mb-3 font-medium uppercase tracking-wide">Unlocks after completion</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/30 text-sm">
                        <i className="ri-lock-2-line text-xs"></i>
                        <span>Submit Project</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/30 text-sm">
                        <i className="ri-lock-2-line text-xs"></i>
                        <span>Rate This Track</span>
                      </div>
                    </div>
                  </div>
                )}

                {isCompleted && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-green-400 text-xs mb-3 font-medium uppercase tracking-wide">Unlocked</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-400 text-sm cursor-pointer hover:text-green-300 transition-colors" onClick={() => setActiveSection('project')}>
                        <i className="ri-upload-cloud-2-line text-xs"></i>
                        <span>Submit Project</span>
                        <i className="ri-arrow-right-s-line ml-auto"></i>
                      </div>
                      <div className="flex items-center gap-2 text-green-400 text-sm cursor-pointer hover:text-green-300 transition-colors" onClick={() => setActiveSection('rate')}>
                        <i className="ri-star-line text-xs"></i>
                        <span>Rate This Track</span>
                        <i className="ri-arrow-right-s-line ml-auto"></i>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Main content ─────────────────────────────────── */}
              <div className="lg:col-span-2">
                <div className="bg-[#12172d] border border-white/10 rounded-2xl overflow-hidden">

                  {/* Section tabs */}
                  <div className="flex border-b border-white/10">
                    {sectionTabs.map((tab) => {
                      const locked = tab.requiresCompletion && !isCompleted;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => !locked && setActiveSection(tab.id)}
                          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap relative ${
                            locked
                              ? 'text-white/20 border-transparent cursor-not-allowed'
                              : activeSection === tab.id
                              ? 'text-purple-400 border-purple-500 bg-purple-500/5 cursor-pointer'
                              : 'text-white/40 border-transparent hover:text-white/70 cursor-pointer'
                          }`}
                        >
                          <i className={tab.icon}></i>
                          <span className="hidden sm:inline">{tab.label}</span>
                          {locked && (
                            <i className="ri-lock-2-line text-xs absolute top-2 right-3 text-white/20"></i>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── CHECKLIST ── */}
                  {activeSection === 'checklist' && (
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-white font-bold text-lg">Topics Checklist</h2>
                        <span className="text-white/40 text-sm">{completedCount} / {totalTopics} done</span>
                      </div>

                      {/* Toggle error banner */}
                      {toggleError && (
                        <div className="mb-4 flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                          <i className="ri-error-warning-line text-red-400 mt-0.5 flex-shrink-0"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-red-400 text-sm">{toggleError}</p>
                          </div>
                          <button
                            onClick={() => setToggleError(null)}
                            className="text-red-400/50 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <i className="ri-close-line text-base"></i>
                          </button>
                        </div>
                      )}

                      {!track ? (
                        <p className="text-white/40 text-sm text-center py-16">
                          No topic data available for this track.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {track.topics.map((topic, idx) => {
                            const nodeId = topic.nodeId || String(idx);
                            const topicDone = completedNodeIds.includes(nodeId);
                            const toggling = togglingId === nodeId;
                            const isExpanded = expandedTopics.has(nodeId);
                            const hasSubtopics = topic.subtopics.length > 0;
                            const hasLinks = topic.links && topic.links.length > 0;
                            const doneSubtopics = topic.subtopics.filter(
                              (s) => completedNodeIds.includes(s.nodeId || `${nodeId}-sub-${s.title}`)
                            ).length;

                            return (
                              <div
                                key={nodeId}
                                className={`rounded-xl border transition-all overflow-hidden ${
                                  topicDone
                                    ? 'bg-green-500/8 border-green-500/25'
                                    : 'bg-white/3 border-white/8 hover:border-white/15'
                                }`}
                              >
                                {/* Topic header row */}
                                <div
                                  className="flex items-start gap-3 p-4 cursor-pointer"
                                  onClick={() => (hasSubtopics || hasLinks) && toggleExpand(nodeId)}
                                >
                                  {/* Checkbox */}
                                  <button
                                    onClick={(e) => handleToggleTopic(nodeId, e)}
                                    disabled={!!togglingId}
                                    className={`mt-0.5 w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md border-2 transition-all cursor-pointer disabled:opacity-70 ${
                                      topicDone
                                        ? 'bg-green-500 border-green-500'
                                        : 'border-white/25 hover:border-purple-400 bg-transparent'
                                    }`}
                                  >
                                    {toggling ? (
                                      <i className="ri-loader-4-line animate-spin text-white text-xs"></i>
                                    ) : topicDone ? (
                                      <i className="ri-check-line text-white text-xs"></i>
                                    ) : null}
                                  </button>

                                  {/* Title + meta */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-sm font-semibold leading-snug ${topicDone ? 'text-green-400 line-through decoration-green-500/50' : 'text-white'}`}>
                                        {topic.title}
                                      </span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${topicDone ? 'bg-green-500/20 text-green-400' : 'bg-white/8 text-white/30'}`}>
                                        {idx + 1}
                                      </span>
                                    </div>

                                    {/* Sub-progress + link count badges */}
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      {hasSubtopics && (
                                        <span className="text-white/35 text-xs flex items-center gap-1">
                                          <i className="ri-list-check-2 text-xs"></i>
                                          {doneSubtopics}/{topic.subtopics.length} subtopics
                                        </span>
                                      )}
                                      {hasLinks && (
                                        <span className="text-white/35 text-xs flex items-center gap-1">
                                          <i className="ri-links-line text-xs"></i>
                                          {topic.links.length} {topic.links.length === 1 ? 'resource' : 'resources'}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Expand arrow */}
                                  {(hasSubtopics || hasLinks) && (
                                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white/30 mt-0.5">
                                      <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-base transition-transform`}></i>
                                    </div>
                                  )}
                                </div>

                                {/* Expanded: topic links + subtopics */}
                                {isExpanded && (
                                  <div className="border-t border-white/8 bg-white/2">

                                    {/* Topic-level links */}
                                    {hasLinks && (
                                      <div className="px-4 pt-3 pb-2">
                                        <p className="text-white/30 text-xs font-medium mb-2 uppercase tracking-wide">Resources</p>
                                        <LinkPills links={topic.links} />
                                      </div>
                                    )}

                                    {/* Subtopics */}
                                    {hasSubtopics && (
                                      <div className={`px-3 pb-3 ${hasLinks ? 'pt-1' : 'pt-3'} space-y-1.5`}>
                                        {hasLinks && <div className="h-px bg-white/8 mb-3"></div>}
                                        {topic.subtopics.map((sub, subIdx) => {
                                          const subNodeId = sub.nodeId || `${nodeId}-sub-${subIdx}`;
                                          const subDone = completedNodeIds.includes(subNodeId);
                                          const subToggling = togglingId === subNodeId;
                                          const subHasLinks = sub.links && sub.links.length > 0;
                                          const isDescExpanded = expandedDescriptions.has(subNodeId);
                                          const isLongDesc = sub.description && sub.description.length > 120;

                                          return (
                                            <div
                                              key={subNodeId}
                                              className={`rounded-lg border p-3 transition-all ${
                                                subDone
                                                  ? 'bg-green-500/8 border-green-500/20'
                                                  : 'bg-white/3 border-white/8 hover:border-white/15'
                                              }`}
                                            >
                                              <div className="flex items-start gap-3">
                                                {/* Subtopic checkbox */}
                                                <button
                                                  onClick={(e) => handleToggleSubtopic(subNodeId, e)}
                                                  disabled={!!togglingId}
                                                  className={`mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded border-2 transition-all cursor-pointer disabled:opacity-70 ${
                                                    subDone
                                                      ? 'bg-green-500 border-green-500'
                                                      : 'border-white/20 hover:border-purple-400 bg-transparent'
                                                  }`}
                                                >
                                                  {subToggling ? (
                                                    <i className="ri-loader-4-line animate-spin text-white" style={{ fontSize: '10px' }}></i>
                                                  ) : subDone ? (
                                                    <i className="ri-check-line text-white" style={{ fontSize: '10px' }}></i>
                                                  ) : null}
                                                </button>

                                                {/* Subtopic content */}
                                                <div className="flex-1 min-w-0">
                                                  <span className={`text-xs font-semibold ${subDone ? 'text-green-400 line-through decoration-green-500/50' : 'text-white/85'}`}>
                                                    {sub.title}
                                                  </span>
                                                  {sub.description && (
                                                    <div className="mt-1">
                                                      <p className={`text-white/40 text-xs leading-relaxed ${!isDescExpanded && isLongDesc ? 'line-clamp-2' : ''}`}>
                                                        {sub.description}
                                                      </p>
                                                      {isLongDesc && (
                                                        <button
                                                          onClick={(e) => toggleDescription(subNodeId, e)}
                                                          className="text-purple-400/70 hover:text-purple-400 text-xs mt-1 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1"
                                                        >
                                                          <i className={`ri-arrow-${isDescExpanded ? 'up' : 'down'}-s-line text-xs`}></i>
                                                          {isDescExpanded ? 'Show less' : 'Read more'}
                                                        </button>
                                                      )}
                                                    </div>
                                                  )}
                                                  {subHasLinks && <LinkPills links={sub.links} />}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isCompleted && (
                        <div className="mt-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                          <i className="ri-trophy-fill text-2xl text-green-400"></i>
                          <div>
                            <p className="text-green-400 font-bold text-sm">All topics completed!</p>
                            <p className="text-green-400/60 text-xs">Project submission and rating are now unlocked.</p>
                          </div>
                          <button
                            onClick={() => setActiveSection('project')}
                            className="ml-auto px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-semibold hover:bg-green-600 transition-all cursor-pointer whitespace-nowrap"
                          >
                            {enrollment?.hasSubmittedProject ? 'View Project' : 'Submit Project'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── SUBMIT PROJECT ── */}
                  {activeSection === 'project' && (
                    isCompleted ? (
                      <div className="p-6">
                        <div className="mb-6">
                          <h2 className="text-white font-bold text-lg mb-1">Submit Your Project</h2>
                          <p className="text-white/50 text-sm">
                            {enrollment.hasSubmittedProject
                              ? 'Your project is submitted. See the details below.'
                              : 'Upload your final project to complete the track and earn your certificate.'}
                          </p>
                        </div>

                        {/* ── Already submitted: show project details card ── */}
                        {enrollment.hasSubmittedProject && !projectSuccess ? (
                          existingProjectLoading ? (
                            <div className="flex items-center justify-center py-20 gap-3 text-white/40">
                              <i className="ri-loader-4-line animate-spin text-xl"></i>
                              <span className="text-sm">Loading your submission…</span>
                            </div>
                          ) : submittedProject ? (
                            <div className="space-y-5">
                              {/* Header badge */}
                              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <div className="w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-xl shrink-0">
                                  <i className="ri-checkbox-circle-fill text-xl text-green-400"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-green-400 font-semibold text-sm">Project Submitted</p>
                                  <p className="text-green-400/60 text-xs">
                                    {new Date(submittedProject.submittedAt).toLocaleDateString(undefined, {
                                      year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                  </p>
                                </div>
                                {/* Delete trigger */}
                                <button
                                  onClick={() => { setShowDeleteConfirm(true); setDeleteProjectError(''); }}
                                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer"
                                  title="Delete project"
                                >
                                  <i className="ri-delete-bin-line text-sm"></i>
                                </button>
                              </div>

                              {/* Delete confirmation dialog */}
                              {showDeleteConfirm && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 space-y-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center bg-red-500/20 rounded-xl shrink-0 mt-0.5">
                                      <i className="ri-error-warning-line text-red-400 text-base"></i>
                                    </div>
                                    <div>
                                      <p className="text-white font-semibold text-sm mb-1">Delete this project?</p>
                                      <p className="text-white/50 text-xs leading-relaxed">
                                        This will permanently remove your submission. You can re-submit a new project afterwards.
                                      </p>
                                    </div>
                                  </div>
                                  {deleteProjectError && (
                                    <p className="text-red-400 text-xs flex items-center gap-1.5">
                                      <i className="ri-error-warning-line"></i>{deleteProjectError}
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => { setShowDeleteConfirm(false); setDeleteProjectError(''); }}
                                      disabled={deleteProjectLoading}
                                      className="flex-1 py-2 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleDeleteProject}
                                      disabled={deleteProjectLoading}
                                      className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                      {deleteProjectLoading ? (
                                        <><i className="ri-loader-4-line animate-spin"></i>Deleting…</>
                                      ) : (
                                        <><i className="ri-delete-bin-line"></i>Yes, Delete</>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Project image */}
                              {submittedProject.fileUrl && (
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 group relative">
                                  <img
                                    src={`https://nextcoder.runasp.net/${submittedProject.fileUrl}`}
                                    alt={submittedProject.title}
                                    className="w-full max-h-64 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    onError={(e) => {
                                      const wrapper = (e.currentTarget as HTMLImageElement).parentElement;
                                      if (wrapper) wrapper.style.display = 'none';
                                    }}
                                  />
                                  <a
                                    href={`https://nextcoder.runasp.net/${submittedProject.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                                  >
                                    <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                      <i className="ri-zoom-in-line"></i>View full image
                                    </span>
                                  </a>
                                </div>
                              )}

                              {/* Title, description & repo */}
                              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                                <h3 className="text-white font-bold text-base">{submittedProject.title}</h3>
                                {submittedProject.description && (
                                  <p className="text-white/50 text-sm leading-relaxed">{submittedProject.description}</p>
                                )}
                                {submittedProject.repoUrl && (
                                  <a
                                    href={submittedProject.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-purple-400 hover:text-purple-300 hover:border-purple-500/40 transition-all"
                                  >
                                    <i className="ri-github-line text-base"></i>
                                    <span className="truncate max-w-[260px]">{submittedProject.repoUrl}</span>
                                    <i className="ri-external-link-line text-xs opacity-60 shrink-0"></i>
                                  </a>
                                )}
                              </div>

                              {/* CTA to rate */}
                              <button
                                onClick={() => setActiveSection('rate')}
                                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                              >
                                <i className="ri-star-line"></i>Rate This Track
                              </button>
                            </div>
                          ) : (
                            /* Fallback if fetch returned null but flag was true */
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                              <i className="ri-file-unknow-line text-4xl text-white/20 mb-3"></i>
                              <p className="text-white/40 text-sm">Could not load submission details.</p>
                            </div>
                          )
                        ) : projectSuccess ? (
                          /* ── Just submitted successfully ── */
                          <div className="space-y-5">
                            {/* Success header */}
                            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                              <div className="w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-xl shrink-0">
                                <i className="ri-check-double-line text-xl text-green-400"></i>
                              </div>
                              <div>
                                <p className="text-green-400 font-semibold text-sm">Project Submitted!</p>
                                {submittedProject && (
                                  <p className="text-green-400/60 text-xs">
                                    {new Date(submittedProject.submittedAt).toLocaleDateString(undefined, {
                                      year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Project image — from API fileUrl */}
                            {submittedProject?.fileUrl && (
                              <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 group relative">
                                <img
                                  src={`https://nextcoder.runasp.net/${submittedProject.fileUrl}`}
                                  alt={submittedProject.title}
                                  className="w-full max-h-64 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                  onError={(e) => {
                                    const wrapper = (e.currentTarget as HTMLImageElement).parentElement;
                                    if (wrapper) wrapper.style.display = 'none';
                                  }}
                                />
                                <a
                                  href={`https://nextcoder.runasp.net/${submittedProject.fileUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                                >
                                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                    <i className="ri-zoom-in-line"></i>View full image
                                  </span>
                                </a>
                              </div>
                            )}

                            {/* Title, description & repo */}
                            {submittedProject && (
                              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                                <h3 className="text-white font-bold text-base">{submittedProject.title}</h3>
                                {submittedProject.description && (
                                  <p className="text-white/50 text-sm leading-relaxed">{submittedProject.description}</p>
                                )}
                                {submittedProject.repoUrl && (
                                  <a
                                    href={submittedProject.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-purple-400 hover:text-purple-300 hover:border-purple-500/40 transition-all"
                                  >
                                    <i className="ri-github-line text-base"></i>
                                    <span className="truncate max-w-[260px]">{submittedProject.repoUrl}</span>
                                    <i className="ri-external-link-line text-xs opacity-60 shrink-0"></i>
                                  </a>
                                )}
                              </div>
                            )}

                            {/* CTA */}
                            <button
                              onClick={() => setActiveSection('rate')}
                              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                            >
                              <i className="ri-star-line"></i>Rate This Track
                            </button>
                          </div>
                        ) : (
                          /* ── Not yet submitted: show form ── */
                          <form onSubmit={handleProjectSubmit} className="space-y-5">

                            {/* Title */}
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2">
                                Project Title <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                placeholder="e.g. AI Chatbot with GPT-4"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm"
                              />
                            </div>

                            {/* Description */}
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2">
                                Description <span className="text-white/30">(optional)</span>
                              </label>
                              <textarea
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value.slice(0, 500))}
                                placeholder="Briefly describe what you built, technologies used, and what you learned..."
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm resize-none"
                              />
                              <p className="text-white/30 text-xs mt-1 text-right">{projectDescription.length}/500</p>
                            </div>

                            <div className="h-px bg-white/8"></div>

                            {/* File upload */}
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2">
                                Project File <span className="text-white/30">(zip, pdf, etc.)</span>
                              </label>
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                              >
                                {projectFile ? (
                                  <div className="flex items-center justify-center gap-3 text-white">
                                    <i className="ri-file-line text-2xl text-purple-400"></i>
                                    <span className="text-sm font-medium truncate max-w-[240px]">{projectFile.name}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setProjectFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                      className="text-white/40 hover:text-white transition-all cursor-pointer"
                                    >
                                      <i className="ri-close-line"></i>
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <i className="ri-upload-cloud-2-line text-4xl text-white/20 block mb-3"></i>
                                    <p className="text-white/50 text-sm font-medium">Click to upload file</p>
                                    <p className="text-white/30 text-xs mt-1">Max 50 MB &mdash; zip, pdf, or any format</p>
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

                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-px bg-white/10"></div>
                              <span className="text-white/30 text-xs font-medium">OR</span>
                              <div className="flex-1 h-px bg-white/10"></div>
                            </div>

                            {/* Repo URL */}
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2">
                                Repository URL <span className="text-white/30">(GitHub, GitLab, etc.)</span>
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
                              <p className="text-red-400 text-sm flex items-center gap-2">
                                <i className="ri-error-warning-line"></i>{projectError}
                              </p>
                            )}

                            <button
                              type="submit"
                              disabled={projectLoading}
                              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all cursor-pointer whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                            >
                              {projectLoading ? (
                                <><i className="ri-loader-4-line animate-spin mr-2"></i>Submitting...</>
                              ) : (
                                <><i className="ri-upload-cloud-2-line mr-2"></i>Submit Project</>
                              )}
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <LockedBanner section="project" />
                    )
                  )}

                  {/* ── RATE ── */}
                  {activeSection === 'rate' && (
                    isCompleted ? (
                      <div className="p-6">
                        <div className="mb-6">
                          <h2 className="text-white font-bold text-lg mb-1">Rate This Track</h2>
                          <p className="text-white/50 text-sm">
                            Share your experience and help other learners find the best paths.
                          </p>
                        </div>

                        {rateSuccess ? (
                          <div className="text-center py-16">
                            <div className="w-20 h-20 flex items-center justify-center bg-yellow-500/20 rounded-2xl mx-auto mb-5">
                              <i className="ri-star-fill text-4xl text-yellow-400"></i>
                            </div>
                            <h4 className="text-white font-bold text-xl mb-2">Thanks for the feedback!</h4>
                            <p className="text-white/50 text-sm mb-6">Your rating helps the community grow.</p>
                            <button
                              onClick={() => setRateSuccess(false)}
                              className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap text-sm font-semibold"
                            >
                              Rate Again
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleRateSubmit} className="space-y-6">
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-4">Your Rating</label>
                              <div className="flex items-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="w-12 h-12 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                                  >
                                    <i className={`ri-star-${(hoverRating || rating) >= star ? 'fill' : 'line'} text-3xl ${
                                      (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-white/20'
                                    }`}></i>
                                  </button>
                                ))}
                                {rating > 0 && (
                                  <span className="ml-2 text-white/60 text-sm font-medium">
                                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2">
                                Your Review <span className="text-white/30">(optional)</span>
                              </label>
                              <textarea
                                value={rateComment}
                                onChange={(e) => setRateComment(e.target.value.slice(0, 500))}
                                placeholder="What did you like or dislike about this track? What would you improve?"
                                rows={5}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500 text-sm resize-none"
                              />
                              <p className="text-white/30 text-xs mt-1 text-right">{rateComment.length}/500</p>
                            </div>

                            {rateError && (
                              <p className="text-red-400 text-sm flex items-center gap-2">
                                <i className="ri-error-warning-line"></i>{rateError}
                              </p>
                            )}

                            <button
                              type="submit"
                              disabled={rateLoading}
                              className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all cursor-pointer whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed text-sm"
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
                    ) : (
                      <LockedBanner section="rate" />
                    )
                  )}

                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrackLearning;