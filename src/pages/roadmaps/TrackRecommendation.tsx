import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useTranslation } from 'react-i18next';

interface Question {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    icon: string;
    tracks: string[];
  }[];
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
  {
    id: 'q1',
    question: 'What interests you most about technology?',
    options: [
      { id: 'a1', text: 'Creating beautiful user interfaces', icon: 'ri-palette-line', tracks: ['frontend', 'design'] },
      { id: 'a2', text: 'Building server logic and APIs', icon: 'ri-server-line', tracks: ['backend', 'fullstack'] },
      { id: 'a3', text: 'Mobile app development', icon: 'ri-smartphone-line', tracks: ['mobile'] },
      { id: 'a4', text: 'Data analysis and insights', icon: 'ri-bar-chart-box-line', tracks: ['data'] },
      { id: 'a5', text: 'Automation and infrastructure', icon: 'ri-cloud-line', tracks: ['devops'] },
    ],
  },
  {
    id: 'q2',
    question: 'What is your current experience level?',
    options: [
      { id: 'b1', text: 'Complete beginner', icon: 'ri-seedling-line', tracks: ['frontend', 'fullstack', 'design'] },
      { id: 'b2', text: 'Some coding experience', icon: 'ri-plant-line', tracks: ['frontend', 'backend', 'mobile'] },
      { id: 'b3', text: 'Intermediate developer', icon: 'ri-leaf-line', tracks: ['backend', 'fullstack', 'devops'] },
      { id: 'b4', text: 'Advanced developer', icon: 'ri-tree-line', tracks: ['devops', 'data', 'fullstack'] },
    ],
  },
  {
    id: 'q3',
    question: 'Which type of projects excite you?',
    options: [
      { id: 'c1', text: 'Interactive websites and web apps', icon: 'ri-window-line', tracks: ['frontend', 'fullstack'] },
      { id: 'c2', text: 'Mobile applications', icon: 'ri-apps-2-line', tracks: ['mobile'] },
      { id: 'c3', text: 'Data-driven applications', icon: 'ri-database-2-line', tracks: ['data', 'backend'] },
      { id: 'c4', text: 'System architecture and scaling', icon: 'ri-stack-line', tracks: ['devops', 'backend'] },
      { id: 'c5', text: 'User experience and design', icon: 'ri-pencil-ruler-2-line', tracks: ['design', 'frontend'] },
    ],
  },
  {
    id: 'q4',
    question: 'What is your preferred working style?',
    options: [
      { id: 'd1', text: 'Visual and creative work', icon: 'ri-brush-line', tracks: ['design', 'frontend'] },
      { id: 'd2', text: 'Problem-solving and logic', icon: 'ri-puzzle-line', tracks: ['backend', 'data'] },
      { id: 'd3', text: 'Building complete solutions', icon: 'ri-tools-line', tracks: ['fullstack'] },
      { id: 'd4', text: 'Optimization and automation', icon: 'ri-settings-3-line', tracks: ['devops'] },
      { id: 'd5', text: 'Cross-platform development', icon: 'ri-device-line', tracks: ['mobile', 'fullstack'] },
    ],
  },
  {
    id: 'q5',
    question: 'Which skill would you like to master?',
    options: [
      { id: 'e1', text: 'React, Vue, or Angular', icon: 'ri-reactjs-line', tracks: ['frontend'] },
      { id: 'e2', text: 'Node.js, Python, or Java', icon: 'ri-code-s-slash-line', tracks: ['backend'] },
      { id: 'e3', text: 'React Native or Flutter', icon: 'ri-smartphone-line', tracks: ['mobile'] },
      { id: 'e4', text: 'Docker, Kubernetes, AWS', icon: 'ri-cloud-line', tracks: ['devops'] },
      { id: 'e5', text: 'Python, ML, Data Analysis', icon: 'ri-line-chart-line', tracks: ['data'] },
      { id: 'e6', text: 'Figma, UI/UX Design', icon: 'ri-palette-line', tracks: ['design'] },
    ],
  },
  {
    id: 'q6',
    question: 'What is your career goal?',
    options: [
      { id: 'f1', text: 'Frontend Developer', icon: 'ri-layout-line', tracks: ['frontend'] },
      { id: 'f2', text: 'Backend Developer', icon: 'ri-server-line', tracks: ['backend'] },
      { id: 'f3', text: 'Full Stack Developer', icon: 'ri-stack-line', tracks: ['fullstack'] },
      { id: 'f4', text: 'Mobile Developer', icon: 'ri-smartphone-line', tracks: ['mobile'] },
      { id: 'f5', text: 'DevOps Engineer', icon: 'ri-cloud-line', tracks: ['devops'] },
      { id: 'f6', text: 'Data Scientist', icon: 'ri-bar-chart-box-line', tracks: ['data'] },
      { id: 'f7', text: 'UI/UX Designer', icon: 'ri-palette-line', tracks: ['design'] },
    ],
  },
];

const trackInfo: Record<string, { name: string; description: string; icon: string; color: string }> = {
  frontend: {
    name: 'Frontend Development',
    description: 'Build beautiful, interactive user interfaces with React, TypeScript, and modern CSS frameworks.',
    icon: 'ri-layout-line',
    color: 'from-blue-500 to-cyan-500',
  },
  backend: {
    name: 'Backend Development',
    description: 'Create robust server-side applications, APIs, and databases with Node.js and modern frameworks.',
    icon: 'ri-server-line',
    color: 'from-green-500 to-emerald-500',
  },
  fullstack: {
    name: 'Full Stack Development',
    description: 'Master both frontend and backend to build complete web applications from start to finish.',
    icon: 'ri-stack-line',
    color: 'from-purple-500 to-pink-500',
  },
  mobile: {
    name: 'Mobile Development',
    description: 'Develop cross-platform mobile apps for iOS and Android using React Native or Flutter.',
    icon: 'ri-smartphone-line',
    color: 'from-orange-500 to-red-500',
  },
  devops: {
    name: 'DevOps Engineering',
    description: 'Learn CI/CD, containerization, cloud infrastructure, and automation for scalable systems.',
    icon: 'ri-cloud-line',
    color: 'from-indigo-500 to-blue-500',
  },
  data: {
    name: 'Data Science',
    description: 'Analyze data, build machine learning models, and create insights with Python and AI tools.',
    icon: 'ri-bar-chart-box-line',
    color: 'from-yellow-500 to-orange-500',
  },
  design: {
    name: 'UI/UX Design',
    description: 'Design beautiful user experiences with Figma, prototyping, and user research methodologies.',
    icon: 'ri-palette-line',
    color: 'from-pink-500 to-rose-500',
  },
};

const TrackRecommendation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<TrackResult[]>([]);

  const handleAnswer = (questionId: string, optionId: string, tracks: string[]) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers: Record<string, string>) => {
    const trackScores: Record<string, number> = {};

    questions.forEach((question) => {
      const answerId = finalAnswers[question.id];
      const selectedOption = question.options.find((opt) => opt.id === answerId);
      
      if (selectedOption) {
        selectedOption.tracks.forEach((track) => {
          trackScores[track] = (trackScores[track] || 0) + 1;
        });
      }
    });

    const sortedResults = Object.entries(trackScores)
      .map(([id, score]) => ({
        id,
        ...trackInfo[id],
        score,
      }))
      .sort((a, b) => b.score - a.score);

    setResults(sortedResults);
    setShowResults(true);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults([]);
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0f1225]">
      <Navbar />

      {!showResults ? (
        <>
          {/* Hero Section */}
          <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-[#1a1f37] to-[#0f1225]">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="ri-compass-3-line text-3xl text-white"></i>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('roadmaps.findYourPath').split(t('roadmaps.findYourPathHighlight'))[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{t('roadmaps.findYourPathHighlight')}</span>
              </h1>
              <p className="text-lg text-white/60 mb-8">{t('roadmaps.findPathSubtitle')}</p>
              <div className="bg-white/5 rounded-full h-3 overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-white/40 text-sm">{t('roadmaps.question')} {currentQuestion + 1} {t('roadmaps.of')} {questions.length}</p>
            </div>
          </section>

          {/* Question Section */}
          <section className="pb-20 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-8 md:p-10">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center"><span className="text-purple-400 font-bold">{currentQuestion + 1}</span></div>
                    <h2 className="text-2xl font-bold text-white flex-1">{questions[currentQuestion].question}</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option) => {
                    const isSelected = answers[questions[currentQuestion].id] === option.id;
                    return (
                      <button key={option.id} onClick={() => handleAnswer(questions[currentQuestion].id, option.id, option.tracks)} className={`w-full p-5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-center gap-4 group ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 group-hover:bg-purple-500/20 group-hover:text-purple-400'}`}>
                          <i className={`${option.icon} text-2xl`}></i>
                        </div>
                        <span className={`font-medium text-lg ${isSelected ? 'text-white' : 'text-white/80'}`}>{option.text}</span>
                        {isSelected && <i className="ri-check-line text-purple-400 text-xl ml-auto"></i>}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3 mt-8">
                  {currentQuestion > 0 && (
                    <button onClick={goBack} className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap">
                      <i className="ri-arrow-left-line mr-2"></i>{t('roadmaps.back')}
                    </button>
                  )}
                  <button onClick={() => navigate('/roadmaps')} className="ml-auto px-6 py-3 bg-white/10 text-white/60 rounded-xl font-semibold hover:bg-white/20 hover:text-white transition-all cursor-pointer whitespace-nowrap">
                    {t('roadmaps.skipQuiz')}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Results Hero */}
          <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-[#1a1f37] to-[#0f1225]">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="ri-trophy-line text-4xl text-white"></i>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('roadmaps.yourRecommendedPaths').split(t('roadmaps.recommendedHighlight'))[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{t('roadmaps.recommendedHighlight')}</span>
              </h1>
              <p className="text-lg text-white/60 mb-8">{t('roadmaps.basedOnAnswers')}</p>
            </div>
          </section>

          {/* Results Section */}
          <section className="pb-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {results.map((result, index) => {
                  const percentage = Math.round((result.score / questions.length) * 100);
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
                            <button onClick={() => navigate('/roadmaps')} className={`px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${isTopMatch ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                              <i className="ri-book-open-line mr-2"></i>{isTopMatch ? t('roadmaps.startThisPath') : t('roadmaps.viewCourses')}
                            </button>
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
            </div>
          </section>
        </>
      )}
      <Footer />
    </div>
  );
};

export default TrackRecommendation;
