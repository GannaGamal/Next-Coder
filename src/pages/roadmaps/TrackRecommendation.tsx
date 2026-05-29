import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useTranslation } from 'react-i18next';
import {
  fetchTrackRecommendations,
  fetchRoadmapTrackbyname,
  enrollInTrack,
  type RecommendationPayload,
  type RoadmapTrack,
} from '../../services/roadmap.service';
import TrackDetailModal from './components/TrackDetailModal';

interface Question {
  id: string;
  section?: string;
  question: string;
  type: 'rating' | 'multiSelect' | 'singleSelect' | 'yesNo';
  options?: {
    id: string;
    text: string;
    icon?: string;
    tracks?: string[];
  }[];
  minRating?: number;
  maxRating?: number;
}

interface TrackResult {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  score: number;
}

const questions: Question[] = [
  // 📊 Skills & Experience (Rating 0-9)
  {
    id: 'q1',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Python',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q2',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Java',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q3',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'C++',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q4',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'JavaScript',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q5',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'C#',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q6',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'PHP',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q7',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Ruby',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q8',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Swift',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q9',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Go',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q10',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Rust',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q11',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Software Development Experience',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q12',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Database Management',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q13',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Networking Skills',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q14',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Web Development Experience',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q15',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Communication Skills',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q16',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Problem Solving Abilities',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q17',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Teamwork Collaboration',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q18',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Time Management',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  {
    id: 'q19',
    section: '📊 Skills & Experience (Rate from 0 to 9)',
    question: 'Adaptability',
    type: 'rating',
    minRating: 0,
    maxRating: 9,
  },
  // 📋 Personal Info & Experience
  {
    id: 'q20',
    section: '📋 Personal Info & Experience',
    question: 'What are your preferences? (Select one)',
    type: 'singleSelect',
    options: [
      { id: 'p1', text: 'Coding' },
      { id: 'p2', text: 'Design' },
      { id: 'p3', text: 'Management' },
      { id: 'p4', text: 'Research' },
    ],
  },
  {
    id: 'q21',
    section: '📋 Personal Info & Experience',
    question: 'Internship Experience',
    type: 'yesNo',
    options: [
      { id: 'i1', text: 'Yes' },
      { id: 'i2', text: 'No' },
    ],
  },
  {
    id: 'q22',
    section: '📋 Personal Info & Experience',
    question: 'Certifications & Training',
    type: 'yesNo',
    options: [
      { id: 'c1', text: 'Yes' },
      { id: 'c2', text: 'No' },
    ],
  },
  {
    id: 'q23',
    section: '📋 Personal Info & Experience',
    question: 'Leadership Experience',
    type: 'yesNo',
    options: [
      { id: 'l1', text: 'Yes' },
      { id: 'l2', text: 'No' },
    ],
  },
];


// Split questions into the two steps
const ratingQuestions  = questions.filter(q => q.type === 'rating');
const personalQuestions = questions.filter(q => q.type !== 'rating');

const TrackRecommendation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 'ratings' → one page of all sliders | 'personal' → one-at-a-time selects
  const [step, setStep] = useState<'ratings' | 'personal'>('ratings');
  const [currentPersonalQ, setCurrentPersonalQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<TrackResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track detail modal
  const [selectedTrack, setSelectedTrack] = useState<RoadmapTrack | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  // Enrollment
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrollError, setEnrollError] = useState<string | null>(null);

  /** Called by each slider on the ratings page */
  const handleRatingChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  /** Advance from ratings page → personal questions */
  const continueToPersonal = () => {
    setStep('personal');
  };

  /** Called when a personal (select / yesNo) question is answered */
  const handlePersonalAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (currentPersonalQ < personalQuestions.length - 1) {
      setTimeout(() => setCurrentPersonalQ(q => q + 1), 300);
    } else {
      submitToApi(newAnswers);
    }
  };

  /** Fetches full track data by name and opens the detail modal */
  const handleViewDetails = async (trackName: string) => {
    setLoadingDetailId(trackName);
    try {
      const track = await fetchRoadmapTrackbyname(trackName);
      setSelectedTrack(track);
    } catch {
      // silently ignore — button returns to normal state
    } finally {
      setLoadingDetailId(null);
    }
  };

  /** Enrolls the user in a track and marks it as enrolled */
  const handleEnroll = async (trackName: string) => {
    if (enrolledIds.has(trackName)) return;
    setEnrollingId(trackName);
    setEnrollError(null);
    try {
      await enrollInTrack(trackName);
      setEnrolledIds(prev => new Set(prev).add(trackName));
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Enrollment failed. Please try again.');
    } finally {
      setEnrollingId(null);
    }
  };

  /** Maps quiz answers to the recommendation API payload and fetches results. */
  const submitToApi = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    setShowResults(true); // show loading screen immediately

    // ── Preference mapping ────────────────────────────────────────────────────
    const preferenceMap: Record<string, RecommendationPayload['preferences']> = {
      p1: 'Coding',
      p2: 'Design',
      p3: 'Management',
      p4: 'Research',
    };

    const payload: RecommendationPayload = {
      python:                       Number(finalAnswers['q1'])  || 0,
      java:                         Number(finalAnswers['q2'])  || 0,
      cpp:                          Number(finalAnswers['q3'])  || 0,
      javaScript:                   Number(finalAnswers['q4'])  || 0,
      cSharp:                       Number(finalAnswers['q5'])  || 0,
      php:                          Number(finalAnswers['q6'])  || 0,
      ruby:                         Number(finalAnswers['q7'])  || 0,
      swift:                        Number(finalAnswers['q8'])  || 0,
      go:                           Number(finalAnswers['q9'])  || 0,
      rust:                         Number(finalAnswers['q10']) || 0,
      softwareDevelopmentExperience: Number(finalAnswers['q11']) || 0,
      databaseManagement:           Number(finalAnswers['q12']) || 0,
      networkingSkills:             Number(finalAnswers['q13']) || 0,
      webDevelopmentExperience:     Number(finalAnswers['q14']) || 0,
      communicationSkills:          Number(finalAnswers['q15']) || 0,
      problemSolvingAbilities:      Number(finalAnswers['q16']) || 0,
      teamworkCollaboration:        Number(finalAnswers['q17']) || 0,
      timeManagement:               Number(finalAnswers['q18']) || 0,
      adaptability:                 Number(finalAnswers['q19']) || 0,
      preferences:                  preferenceMap[finalAnswers['q20']] ?? 'Coding',
      internshipExperience:         finalAnswers['q21'] === 'i1',
      certificationsAndTraining:    finalAnswers['q22'] === 'c1',
      leadershipExperience:         finalAnswers['q23'] === 'l1',
    };

    try {
      const recommendations = await fetchTrackRecommendations(payload);

      const mapped: TrackResult[] = recommendations.map((rec) => {
        const info = {
          name: rec.displayName,
          description: `Explore the ${rec.displayName} learning path.`,
          icon: 'ri-compass-3-line',
          color: 'from-purple-500 to-pink-500',
        };
        return {
          id: rec.trackName,
          name: info.name,
          description: info.description,
          icon: info.icon,
          color: info.color,
          score: rec.confidence, // API already returns 0-100
        };
      });

      setResults(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const restartQuiz = () => {
    setStep('ratings');
    setCurrentPersonalQ(0);
    setAnswers({});
    setShowResults(false);
    setResults([]);
    setIsLoading(false);
    setError(null);
    setEnrolledIds(new Set());
    setEnrollError(null);
    setSelectedTrack(null);
  };

  const goBackPersonal = () => {
    if (currentPersonalQ > 0) {
      setCurrentPersonalQ(q => q - 1);
    } else {
      setStep('ratings');
    }
  };

  // Progress: ratings = 0–50 %, personal = 50–100 %
  const progress = step === 'ratings'
    ? 50
    : 50 + ((currentPersonalQ + 1) / personalQuestions.length) * 50;

  // Total visual step count shown in the subtitle
  const stepLabel = step === 'ratings'
    ? `${t('roadmaps.question')} 1 ${t('roadmaps.of')} 2`
    : `${t('roadmaps.question')} 2 ${t('roadmaps.of')} 2 — ${t('roadmaps.question')} ${currentPersonalQ + 1} ${t('roadmaps.of')} ${personalQuestions.length}`;

  return (
    <div className="min-h-screen bg-[#0f1225]">
      <Navbar />

      {!showResults ? (
        <>
          {/* Hero / Progress */}
          <section className="pt-28 pb-10 px-4 bg-gradient-to-b from-[#1a1f37] to-[#0f1225]">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="ri-compass-3-line text-3xl text-white"></i>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('roadmaps.findYourPath').split(t('roadmaps.findYourPathHighlight'))[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {t('roadmaps.findYourPathHighlight')}
                </span>
              </h1>
              <p className="text-lg text-white/60 mb-8">{t('roadmaps.findPathSubtitle')}</p>
              <div className="bg-white/5 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/40 text-sm">{stepLabel}</p>
            </div>
          </section>

          {/* ── STEP 1 — All rating sliders on one page ── */}
          {step === 'ratings' && (
            <section className="pb-20 px-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/5 rounded-2xl border border-white/10 p-8 md:p-10">
                  <div className="mb-8 pb-4 border-b border-white/10">
                    <p className="text-white/60 text-sm font-medium">📊 Skills &amp; Experience (Rate from 0 to 9)</p>
                    <p className="text-white/40 text-xs mt-1">Drag each slider to reflect your current level — 0 means no experience, 9 means expert.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    {ratingQuestions.map((q) => {
                      const val = Number(answers[q.id] ?? 0);
                      return (
                        <div key={q.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{q.question}</span>
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${val >= 7 ? 'bg-purple-500/30 text-purple-300' : val >= 4 ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-white/50'}`}>
                              {val}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={q.minRating ?? 0}
                            max={q.maxRating ?? 9}
                            value={val}
                            onChange={(e) => handleRatingChange(q.id, e.target.value)}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                          <div className="flex justify-between text-white/30 text-xs mt-1">
                            <span>0</span>
                            <span>9</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 mt-10">
                    <button
                      onClick={() => navigate('/roadmaps')}
                      className="px-6 py-3 bg-white/10 text-white/60 rounded-xl font-semibold hover:bg-white/20 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                    >
                      {t('roadmaps.skipQuiz')}
                    </button>
                    <button
                      onClick={continueToPersonal}
                      className="ml-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {t('roadmaps.back') ? 'Continue' : 'Continue'} <i className="ri-arrow-right-line ml-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── STEP 2 — Personal questions one at a time ── */}
          {step === 'personal' && (
            <section className="pb-20 px-4">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white/5 rounded-2xl border border-white/10 p-8 md:p-10">
                  {personalQuestions[currentPersonalQ].section && (
                    <div className="mb-6 pb-4 border-b border-white/10">
                      <p className="text-white/60 text-sm font-medium">{personalQuestions[currentPersonalQ].section}</p>
                    </div>
                  )}

                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 font-bold">{currentPersonalQ + 1}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white flex-1">{personalQuestions[currentPersonalQ].question}</h2>
                    </div>
                  </div>

                  {/* Yes/No */}
                  {personalQuestions[currentPersonalQ].type === 'yesNo' && (
                    <div className="space-y-3">
                      {personalQuestions[currentPersonalQ].options?.map((option) => {
                        const isSelected = answers[personalQuestions[currentPersonalQ].id] === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handlePersonalAnswer(personalQuestions[currentPersonalQ].id, option.id)}
                            className={`w-full p-5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-center gap-4 group ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-purple-500' : 'bg-white/10 group-hover:bg-purple-500/20'}`}>
                              {isSelected && <i className="ri-check-line text-white text-sm"></i>}
                            </div>
                            <span className={`font-medium text-lg ${isSelected ? 'text-white' : 'text-white/80'}`}>{option.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Single Select */}
                  {personalQuestions[currentPersonalQ].type === 'singleSelect' && (
                    <div className="space-y-3">
                      {personalQuestions[currentPersonalQ].options?.map((option) => {
                        const isSelected = answers[personalQuestions[currentPersonalQ].id] === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handlePersonalAnswer(personalQuestions[currentPersonalQ].id, option.id)}
                            className={`w-full p-5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-center gap-4 group ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'}`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-purple-500' : 'bg-white/10 group-hover:bg-purple-500/20'}`}>
                              {isSelected && <i className="ri-check-line text-white text-sm"></i>}
                            </div>
                            <span className={`font-medium text-lg ${isSelected ? 'text-white' : 'text-white/80'}`}>{option.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={goBackPersonal}
                      className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-arrow-left-line mr-2"></i>{t('roadmaps.back')}
                    </button>
                    <button
                      onClick={() => navigate('/roadmaps')}
                      className="ml-auto px-6 py-3 bg-white/10 text-white/60 rounded-xl font-semibold hover:bg-white/20 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                    >
                      {t('roadmaps.skipQuiz')}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          {/* Results Hero */}
          <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-[#1a1f37] to-[#0f1225]">
            <div className="max-w-4xl mx-auto text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isLoading ? 'bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse' : error ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
                <i className={`text-4xl text-white ${isLoading ? 'ri-loader-4-line animate-spin' : error ? 'ri-error-warning-line' : 'ri-trophy-line'}`}></i>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isLoading
                  ? 'Analyzing your answers…'
                  : error
                  ? 'Something went wrong'
                  : <>{t('roadmaps.yourRecommendedPaths').split(t('roadmaps.recommendedHighlight'))[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{t('roadmaps.recommendedHighlight')}</span></>
                }
              </h1>
              <p className="text-lg text-white/60 mb-8">
                {isLoading
                  ? 'Our AI is matching your skills to the best learning paths…'
                  : error
                  ? error
                  : t('roadmaps.basedOnAnswers')
                }
              </p>
            </div>
          </section>

          {/* Results Section */}
          <section className="pb-20 px-4">
            <div className="max-w-4xl mx-auto">

              {/* Loading skeleton */}
              {isLoading && (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-8 animate-pulse">
                      <div className="flex gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-white/10 rounded w-1/3" />
                          <div className="h-3 bg-white/10 rounded w-2/3" />
                          <div className="h-2.5 bg-white/10 rounded-full w-full mt-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {!isLoading && error && (
                <div className="text-center py-12">
                  <button
                    onClick={restartQuiz}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer"
                  >
                    <i className="ri-refresh-line mr-2"></i>Try Again
                  </button>
                </div>
              )}

              {/* Results list */}
              {!isLoading && !error && (
                <>
                  <div className="space-y-6">
                    {results.map((result, index) => {
                      const percentage = Math.round(result.score); // confidence is already 0–100
                      const isTopMatch = index === 0;
                      return (
                        <div key={result.id} className={`bg-white/5 rounded-2xl border overflow-hidden transition-all ${isTopMatch ? 'border-green-500/50' : 'border-white/10'}`}>
                          <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${result.color} flex items-center justify-center flex-shrink-0`}>
                                <i className={`${result.icon} text-3xl text-white`}></i>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-xl font-bold text-white">{result.name}</h3>
                                      {isTopMatch && (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                                          <i className="ri-star-fill mr-1"></i>{t('roadmaps.bestMatch')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-white/60 text-sm">{result.description}</p>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-white/60 text-sm">{t('roadmaps.matchScore')}</span>
                                    <span className="text-white font-bold">{percentage}%</span>
                                  </div>
                                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${result.color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                  </div>
                                </div>
                                {/* Enrollment error for this card */}
                                {enrollError && enrollingId === null && !enrolledIds.has(result.id) && (
                                  <p className="text-red-400 text-xs mb-3">
                                    <i className="ri-error-warning-line mr-1"></i>{enrollError}
                                  </p>
                                )}

                                <div className="flex flex-wrap gap-3">
                                  {/* Start Learning / Enrolled button */}
                                  <button
                                    onClick={() => handleEnroll(result.id)}
                                    disabled={enrollingId === result.id || enrolledIds.has(result.id)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 disabled:cursor-not-allowed
                                      ${enrolledIds.has(result.id)
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-60'
                                      }`}
                                  >
                                    {enrollingId === result.id ? (
                                      <><i className="ri-loader-4-line animate-spin"></i>Enrolling…</>
                                    ) : enrolledIds.has(result.id) ? (
                                      <><i className="ri-check-double-line"></i>Enrolled</>
                                    ) : (
                                      <><i className="ri-book-open-line"></i>{t('roadmaps.startThisPath')}</>
                                    )}
                                  </button>

                                  {/* View Details button */}
                                  <button
                                    onClick={() => handleViewDetails(result.id)}
                                    disabled={loadingDetailId === result.id}
                                    className="px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-purple-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {loadingDetailId === result.id ? (
                                      <><i className="ri-loader-4-line animate-spin"></i>Loading…</>
                                    ) : (
                                      <><i className="ri-map-2-line"></i>View Details</>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={restartQuiz} className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap">
                      <i className="ri-refresh-line mr-2"></i>{t('roadmaps.retakeQuiz')}
                    </button>
                    <button onClick={() => navigate('/roadmaps')} className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer whitespace-nowrap">
                      <i className="ri-compass-3-line mr-2"></i>{t('roadmaps.browseAllPaths')}
                    </button>
                  </div>
                </>
              )}

            </div>
          </section>
        </>
      )}
      {selectedTrack && (
        <TrackDetailModal
          track={selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default TrackRecommendation;