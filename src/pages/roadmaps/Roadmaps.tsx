import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import RoleGateModal from '../../components/feature/RoleGateModal';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import BrowsePaths from './components/BrowsePaths';
import {
  getUserEnrollments,
  unenrollFromTrack,
  EnrollmentDetail,
} from '../../services/roadmap.service';

// ─── Accent palette (deterministic per track name) ────────────────────────────
const ACCENT_COLORS = [
  { gradient: 'from-purple-500 to-pink-500',   card: 'border-purple-500/30 bg-purple-500/10',  text: 'text-purple-400'  },
  { gradient: 'from-cyan-500 to-blue-500',     card: 'border-cyan-500/30 bg-cyan-500/10',      text: 'text-cyan-400'    },
  { gradient: 'from-emerald-500 to-teal-500',  card: 'border-emerald-500/30 bg-emerald-500/10',text: 'text-emerald-400' },
  { gradient: 'from-orange-500 to-yellow-500', card: 'border-orange-500/30 bg-orange-500/10',  text: 'text-orange-400'  },
  { gradient: 'from-pink-500 to-rose-500',     card: 'border-pink-500/30 bg-pink-500/10',      text: 'text-pink-400'    },
];
const getAccent = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
};

// ─── Enrollment status helpers ────────────────────────────────────────────────
const getEnrollmentStatus = (e: EnrollmentDetail): 'completed' | 'in-progress' | 'not-started' => {
  if (e.isCompleted) return 'completed';
  if (e.progressPercent > 0) return 'in-progress';
  return 'not-started';
};

const formatEnrolledDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const EnrollmentSkeleton = () => (
  <div className="bg-white/5 rounded-2xl border border-white/10 p-4 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-14 h-14 bg-white/10 rounded-xl flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 bg-white/10 rounded-full w-1/2 mb-2"></div>
        <div className="h-3 bg-white/10 rounded-full w-1/3"></div>
      </div>
    </div>
    <div className="h-2 bg-white/10 rounded-full mb-2"></div>
    <div className="flex gap-2 mt-4">
      <div className="h-9 bg-white/10 rounded-xl flex-1"></div>
      <div className="h-9 bg-white/10 rounded-xl w-20"></div>
    </div>
  </div>
);

// ─── Enrollment Card ──────────────────────────────────────────────────────────
interface EnrollmentCardProps {
  enrollment: EnrollmentDetail;
  onContinue: () => void;
  onUnenroll: () => void;
  unenrolling: boolean;
}

const EnrollmentCard = ({ enrollment, onContinue, onUnenroll, unenrolling }: EnrollmentCardProps) => {
  const accent = getAccent(enrollment.trackName);
  const status = getEnrollmentStatus(enrollment);
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);

  return (
    <div className={`bg-white/5 rounded-2xl border ${status === 'completed' ? 'border-green-500/30' : 'border-white/10'} overflow-hidden hover:border-purple-500/40 transition-all`}>
      <div className="p-4">
        {/* Track icon + name */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 flex items-center justify-center bg-gradient-to-br ${accent.gradient} rounded-xl flex-shrink-0`}>
            <i className="ri-road-map-line text-xl text-white"></i>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold capitalize text-base leading-snug truncate">{enrollment.trackName}</h3>
            <p className="text-white/40 text-xs mt-0.5">
              Enrolled {formatEnrolledDate(enrollment.enrolledAt)}
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
            status === 'completed'   ? 'bg-green-500/20 text-green-400' :
            status === 'in-progress' ? 'bg-purple-500/20 text-purple-400' :
                                       'bg-white/10 text-white/40'
          }`}>
            {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Not Started'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-white/50">{enrollment.completedTopics} / {enrollment.totalTopics} topics</span>
          <span className={accent.text + ' font-bold'}>{enrollment.progressPercent}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${accent.gradient} transition-all duration-500`}
            style={{ width: `${enrollment.progressPercent}%` }}
          ></div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap mb-4">
          {enrollment.isCompleted && (
            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
              <i className="ri-trophy-line"></i>Completed
            </span>
          )}
          {enrollment.hasSubmittedProject && (
            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full flex items-center gap-1">
              <i className="ri-upload-cloud-2-line"></i>Project Submitted
            </span>
          )}
        </div>

        {/* Actions */}
        {confirmUnenroll ? (
          <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-xs flex-1">Unenroll from this track?</p>
            <button
              onClick={() => { onUnenroll(); setConfirmUnenroll(false); }}
              disabled={unenrolling}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-70"
            >
              {unenrolling ? <i className="ri-loader-4-line animate-spin"></i> : 'Yes, Unenroll'}
            </button>
            <button
              onClick={() => setConfirmUnenroll(false)}
              className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onContinue}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap text-white bg-gradient-to-r ${accent.gradient} hover:opacity-90`}
            >
              <i className={`mr-1.5 ${status === 'completed' ? 'ri-eye-line' : status === 'in-progress' ? 'ri-play-line' : 'ri-flag-line'}`}></i>
              {status === 'completed' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start'}
            </button>
            <button
              onClick={() => setConfirmUnenroll(true)}
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer whitespace-nowrap text-sm"
              title="Unenroll"
            >
              <i className="ri-user-unfollow-line"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const Roadmaps = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const [showRoleGateModal, setShowRoleGateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-courses'>('browse');

  // ── Enrollments ──────────────────────────────────────────────────────────────
  const [enrollments, setEnrollments] = useState<EnrollmentDetail[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [unenrollingSet, setUnenrollingSet] = useState<Set<string>>(new Set());

  const loadEnrollments = useCallback(async () => {
    if (!isAuthenticated) return;
    setEnrollLoading(true);
    setEnrollError(null);
    try {
      const data = await getUserEnrollments();
      setEnrollments(data);
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Failed to load your courses.');
    } finally {
      setEnrollLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'my-courses') {
      loadEnrollments();
    }
  }, [activeTab, loadEnrollments]);

  const handleUnenroll = async (trackName: string) => {
    setUnenrollingSet(prev => new Set(prev).add(trackName));
    try {
      await unenrollFromTrack(trackName);
      setEnrollments(prev => prev.filter(e => e.trackName !== trackName));
    } catch {
      // silently fail — user stays enrolled
    } finally {
      setUnenrollingSet(prev => { const s = new Set(prev); s.delete(trackName); return s; });
    }
  };

  const checkLearnerRole = () => {
    if (!isAuthenticated || !user?.roles.includes('learner')) {
      setShowRoleGateModal(true);
      return false;
    }
    return true;
  };

  const handleMyCoursesClick = () => {
    if (!checkLearnerRole()) return;
    setActiveTab('my-courses');
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const completedCount  = enrollments.filter(e => e.isCompleted).length;
  const inProgressCount = enrollments.filter(e => !e.isCompleted && e.progressPercent > 0).length;
  const totalTopicsDone = enrollments.reduce((acc, e) => acc + e.completedTopics, 0);

  // ── Grouped ──────────────────────────────────────────────────────────────────
  const inProgress  = enrollments.filter(e => getEnrollmentStatus(e) === 'in-progress');
  const notStarted  = enrollments.filter(e => getEnrollmentStatus(e) === 'not-started');
  const completed   = enrollments.filter(e => getEnrollmentStatus(e) === 'completed');

  return (
    <div className="min-h-screen bg-[#0f1225]">
      <Navbar />

      <RoleGateModal
        isOpen={showRoleGateModal}
        onClose={() => setShowRoleGateModal(false)}
        requiredRole="learner"
        roleLabel="Learner"
        actionLabel="Start Learning"
        onRoleAdded={() => { setShowRoleGateModal(false); setActiveTab('my-courses'); }}
      />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-[#1a1f37] to-[#0f1225]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('roadmaps.title').split(' ').slice(0, 2).join(' ')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {t('roadmaps.title').split(' ').slice(2).join(' ')}
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-6">{t('roadmaps.subtitle')}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div
                onClick={() => navigate('/roadmaps/recommendation')}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl px-6 py-4 cursor-pointer hover:border-purple-500/60 hover:from-purple-500/30 hover:to-pink-500/30 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i className="ri-compass-3-line text-2xl text-white"></i>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">{t('roadmaps.notSureTitle')}</h3>
                  <p className="text-white/60 text-sm">{t('roadmaps.notSureSubtitle')}</p>
                </div>
                <i className="ri-arrow-right-line text-purple-400 text-xl group-hover:translate-x-1 transition-transform"></i>
              </div>

              <div
                onClick={() => navigate('/roadmaps/achievements')}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl px-6 py-4 cursor-pointer hover:border-yellow-500/60 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i className="ri-trophy-line text-2xl text-white"></i>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">{t('roadmaps.communityTitle')}</h3>
                  <p className="text-white/60 text-sm">{t('roadmaps.communitySubtitle')}</p>
                </div>
                <i className="ri-arrow-right-line text-yellow-400 text-xl group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 rounded-full p-1 flex gap-1">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'browse' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <i className="ri-compass-3-line mr-2"></i>{t('roadmaps.browsePaths')}
              </button>
              <button
                onClick={handleMyCoursesClick}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'my-courses' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <i className="ri-book-mark-line mr-2"></i>{t('roadmaps.myCourses')}
                {enrollments.length > 0 && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{enrollments.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* Stats (my-courses) */}
          {activeTab === 'my-courses' && !enrollLoading && enrollments.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">{enrollments.length}</div>
                <div className="text-sm text-white/60">{t('roadmaps.enrolledCourses')}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                <div className="text-sm text-white/60">{t('roadmaps.completed')}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-purple-400">{inProgressCount}</div>
                <div className="text-sm text-white/60">{t('roadmaps.inProgress')}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-cyan-400">{totalTopicsDone}</div>
                <div className="text-sm text-white/60">{t('roadmaps.lessonsCompleted')}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main content */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'browse' ? (
            <BrowsePaths />
          ) : (
            <>
              {/* Loading */}
              {enrollLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => <EnrollmentSkeleton key={i} />)}
                </div>
              )}

              {/* Error */}
              {!enrollLoading && enrollError && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 flex items-center justify-center bg-red-500/10 rounded-2xl mx-auto mb-4">
                    <i className="ri-error-warning-line text-3xl text-red-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Couldn&apos;t load your courses</h3>
                  <p className="text-white/50 text-sm mb-6">{enrollError}</p>
                  <button
                    onClick={loadEnrollments}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-refresh-line mr-2"></i>Try Again
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!enrollLoading && !enrollError && enrollments.length === 0 && (
                <div className="text-center py-16">
                  <i className="ri-book-open-line text-6xl text-white/20 mb-4 block"></i>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('roadmaps.noCourseYet')}</h3>
                  <p className="text-white/60 mb-6">{t('roadmaps.noCourseSubtitle')}</p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {t('roadmaps.browseCourses')}
                  </button>
                </div>
              )}

              {/* Grouped course lists */}
              {!enrollLoading && !enrollError && enrollments.length > 0 && (
                <div className="space-y-10">

                  {/* Continue Learning */}
                  {inProgress.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                        <i className="ri-play-circle-line text-purple-400"></i>
                        {t('roadmaps.continuelearning')}
                        <span className="text-sm font-normal text-white/40 ml-1">({inProgress.length})</span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inProgress.map((e) => (
                          <EnrollmentCard
                            key={e.id}
                            enrollment={e}
                            onContinue={() => navigate(`/roadmaps/learn/${e.trackName}`)}
                            onUnenroll={() => handleUnenroll(e.trackName)}
                            unenrolling={unenrollingSet.has(e.trackName)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Not Started */}
                  {notStarted.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                        <i className="ri-bookmark-line text-white/40"></i>
                        {t('roadmaps.notStarted')}
                        <span className="text-sm font-normal text-white/40 ml-1">({notStarted.length})</span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notStarted.map((e) => (
                          <EnrollmentCard
                            key={e.id}
                            enrollment={e}
                            onContinue={() => navigate(`/roadmaps/learn/${e.trackName}`)}
                            onUnenroll={() => handleUnenroll(e.trackName)}
                            unenrolling={unenrollingSet.has(e.trackName)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed */}
                  {completed.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                        <i className="ri-trophy-line text-green-400"></i>
                        {t('roadmaps.completedSection')}
                        <span className="text-sm font-normal text-white/40 ml-1">({completed.length})</span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completed.map((e) => (
                          <EnrollmentCard
                            key={e.id}
                            enrollment={e}
                            onContinue={() => navigate(`/roadmaps/learn/${e.trackName}`)}
                            onUnenroll={() => handleUnenroll(e.trackName)}
                            unenrolling={unenrollingSet.has(e.trackName)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Roadmaps;
