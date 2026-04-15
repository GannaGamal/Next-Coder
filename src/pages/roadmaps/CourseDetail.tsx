import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useTranslation } from 'react-i18next';
import rocketImage from '../../assets/space-rocket.png';

type ResourceType = 'video' | 'article' | 'quiz' | 'exercise' | 'project' | 'documentation';

interface Topic {
  id: string;
  title: string;
  resourceType: ResourceType;
  completed: boolean;
}

interface Section {
  id: string;
  title: string;
  topics: Topic[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  image: string;
  instructor: {
    name: string;
    avatar: string;
  };
  sections: Section[];
  graduationProject?: {
    submitted: boolean;
    githubLink: string;
    description: string;
    projectImage?: string;
  };
  userRating?: number;
  userReview?: string;
}

const resourceTypeConfig: Record<ResourceType, { icon: string; label: string; color: string }> = {
  video: { icon: 'ri-video-line', label: 'Video', color: 'text-red-400' },
  article: { icon: 'ri-article-line', label: 'Article', color: 'text-blue-400' },
  quiz: { icon: 'ri-question-line', label: 'Quiz', color: 'text-yellow-400' },
  exercise: { icon: 'ri-code-line', label: 'Exercise', color: 'text-green-400' },
  project: { icon: 'ri-folder-line', label: 'Project', color: 'text-purple-400' },
  documentation: { icon: 'ri-file-text-line', label: 'Docs', color: 'text-cyan-400' },
};

const coursesData: Record<string, CourseData> = {
  '1': {
    id: '1',
    title: 'Complete React Developer Path',
    description: 'Master React from basics to advanced concepts including hooks, context, Redux, and building production-ready applications.',
    image: 'https://readdy.ai/api/search-image?query=modern%20React%20JavaScript%20programming%20concept%20with%20code%20editor%20interface%20showing%20component%20structure%20clean%20minimalist%20design%20with%20purple%20blue%20gradient%20accents%20dark%20background&width=600&height=400&seq=react1&orientation=landscape',
    instructor: { name: 'David Miller', avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20tech%20instructor%20portrait%20friendly%20smile%20clean%20background%20casual%20attire&width=100&height=100&seq=inst1&orientation=squarish' },
    sections: [
      {
        id: 's1',
        title: 'Getting Started with React',
        topics: [
          { id: 't1', title: 'Introduction to React & Setup', resourceType: 'video', completed: false },
          { id: 't2', title: 'Understanding JSX Syntax', resourceType: 'article', completed: false },
          { id: 't3', title: 'Creating Your First Component', resourceType: 'exercise', completed: false },
          { id: 't4', title: 'Props and Component Communication', resourceType: 'video', completed: false },
          { id: 't5', title: 'React Basics Quiz', resourceType: 'quiz', completed: false },
        ],
      },
      {
        id: 's2',
        title: 'React State Management',
        topics: [
          { id: 't6', title: 'Understanding useState Hook', resourceType: 'video', completed: false },
          { id: 't7', title: 'Working with useEffect', resourceType: 'article', completed: false },
          { id: 't8', title: 'useContext for Global State', resourceType: 'documentation', completed: false },
          { id: 't9', title: 'useReducer for Complex State', resourceType: 'video', completed: false },
          { id: 't10', title: 'State Management Exercise', resourceType: 'exercise', completed: false },
        ],
      },
      {
        id: 's3',
        title: 'Advanced React Patterns',
        topics: [
          { id: 't11', title: 'Custom Hooks Development', resourceType: 'video', completed: false },
          { id: 't12', title: 'Higher-Order Components', resourceType: 'article', completed: false },
          { id: 't13', title: 'Render Props Pattern', resourceType: 'documentation', completed: false },
          { id: 't14', title: 'Compound Components', resourceType: 'video', completed: false },
          { id: 't15', title: 'Build a Custom Hook', resourceType: 'project', completed: false },
        ],
      },
      {
        id: 's4',
        title: 'Redux & State Libraries',
        topics: [
          { id: 't16', title: 'Redux Fundamentals', resourceType: 'video', completed: false },
          { id: 't17', title: 'Redux Toolkit Setup', resourceType: 'article', completed: false },
          { id: 't18', title: 'Async Actions with Thunks', resourceType: 'exercise', completed: false },
          { id: 't19', title: 'RTK Query for Data Fetching', resourceType: 'documentation', completed: false },
          { id: 't20', title: 'Redux Knowledge Check', resourceType: 'quiz', completed: false },
        ],
      },
      {
        id: 's5',
        title: 'Testing & Deployment',
        topics: [
          { id: 't21', title: 'Unit Testing with Jest', resourceType: 'video', completed: false },
          { id: 't22', title: 'Component Testing with RTL', resourceType: 'article', completed: false },
          { id: 't23', title: 'E2E Testing Basics', resourceType: 'exercise', completed: false },
          { id: 't24', title: 'Production Build & Deployment', resourceType: 'documentation', completed: false },
        ],
      },
    ],
  },
  '3': {
    id: '3',
    title: 'Full Stack Web Development',
    description: 'Become a complete full stack developer. Learn frontend, backend, databases, and deployment in one comprehensive path.',
    image: 'https://readdy.ai/api/search-image?query=full%20stack%20web%20development%20concept%20showing%20frontend%20backend%20database%20layers%20modern%20clean%20design%20with%20code%20snippets%20purple%20blue%20gradient%20dark%20background&width=600&height=400&seq=fullstack1&orientation=landscape',
    instructor: { name: 'Alex Thompson', avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20developer%20instructor%20portrait%20friendly%20approachable%20clean%20background&width=100&height=100&seq=inst3&orientation=squarish' },
    sections: [
      {
        id: 's1',
        title: 'HTML & CSS Fundamentals',
        topics: [
          { id: 't1', title: 'HTML5 Semantic Elements', resourceType: 'article', completed: true },
          { id: 't2', title: 'CSS Box Model & Layout', resourceType: 'video', completed: true },
          { id: 't3', title: 'Flexbox Deep Dive', resourceType: 'exercise', completed: true },
          { id: 't4', title: 'CSS Grid Mastery', resourceType: 'video', completed: true },
          { id: 't5', title: 'Responsive Design Principles', resourceType: 'article', completed: true },
          { id: 't6', title: 'HTML/CSS Quiz', resourceType: 'quiz', completed: true },
        ],
      },
      {
        id: 's2',
        title: 'JavaScript Essentials',
        topics: [
          { id: 't7', title: 'Variables, Types & Operators', resourceType: 'video', completed: true },
          { id: 't8', title: 'Functions & Scope', resourceType: 'article', completed: true },
          { id: 't9', title: 'Arrays & Objects', resourceType: 'exercise', completed: true },
          { id: 't10', title: 'Async JavaScript & Promises', resourceType: 'video', completed: true },
          { id: 't11', title: 'ES6+ Modern Features', resourceType: 'documentation', completed: true },
        ],
      },
      {
        id: 's3',
        title: 'React Frontend Development',
        topics: [
          { id: 't12', title: 'React Components & JSX', resourceType: 'video', completed: true },
          { id: 't13', title: 'State & Props Management', resourceType: 'article', completed: true },
          { id: 't14', title: 'React Hooks In-Depth', resourceType: 'video', completed: true },
          { id: 't15', title: 'React Router Navigation', resourceType: 'exercise', completed: true },
          { id: 't16', title: 'Form Handling & Validation', resourceType: 'project', completed: true },
        ],
      },
      {
        id: 's4',
        title: 'Node.js Backend',
        topics: [
          { id: 't17', title: 'Node.js Fundamentals', resourceType: 'video', completed: true },
          { id: 't18', title: 'Express.js Framework', resourceType: 'article', completed: true },
          { id: 't19', title: 'RESTful API Design', resourceType: 'documentation', completed: true },
          { id: 't20', title: 'Authentication & JWT', resourceType: 'video', completed: true },
          { id: 't21', title: 'Build a REST API', resourceType: 'project', completed: true },
        ],
      },
      {
        id: 's5',
        title: 'Database & Deployment',
        topics: [
          { id: 't22', title: 'PostgreSQL Fundamentals', resourceType: 'video', completed: true },
          { id: 't23', title: 'Database Design & Relations', resourceType: 'article', completed: true },
          { id: 't24', title: 'Docker Containerization', resourceType: 'exercise', completed: true },
          { id: 't25', title: 'CI/CD Pipeline Setup', resourceType: 'documentation', completed: true },
          { id: 't26', title: 'Cloud Deployment', resourceType: 'video', completed: true },
        ],
      },
    ],
    graduationProject: {
      submitted: true,
      githubLink: 'https://github.com/user/fullstack-ecommerce',
      description: 'A full-stack e-commerce platform with React frontend, Node.js backend, PostgreSQL database, and Docker deployment.',
      projectImage: 'https://readdy.ai/api/search-image?query=modern%20e-commerce%20website%20dashboard%20screenshot%20showing%20product%20listings%20shopping%20cart%20clean%20professional%20UI%20design%20dark%20theme%20with%20purple%20accents&width=800&height=500&seq=proj1&orientation=landscape',
    },
  },
  '6': {
    id: '6',
    title: 'Data Science with Python',
    description: 'Learn data analysis, visualization, machine learning, and AI fundamentals using Python and popular libraries.',
    image: 'https://readdy.ai/api/search-image?query=data%20science%20Python%20programming%20concept%20with%20charts%20graphs%20neural%20network%20visualization%20clean%20modern%20design%20orange%20purple%20gradient%20dark%20background&width=600&height=400&seq=data1&orientation=landscape',
    instructor: { name: 'Dr. Lisa Wang', avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20data%20scientist%20portrait%20confident%20smile%20academic%20background&width=100&height=100&seq=inst6&orientation=squarish' },
    sections: [
      {
        id: 's1',
        title: 'Python Fundamentals',
        topics: [
          { id: 't1', title: 'Python Setup & Environment', resourceType: 'video', completed: true },
          { id: 't2', title: 'Data Types & Variables', resourceType: 'article', completed: true },
          { id: 't3', title: 'Control Flow & Loops', resourceType: 'exercise', completed: false },
          { id: 't4', title: 'Functions & Modules', resourceType: 'documentation', completed: false },
          { id: 't5', title: 'Python Basics Quiz', resourceType: 'quiz', completed: false },
        ],
      },
      {
        id: 's2',
        title: 'Data Analysis with Pandas',
        topics: [
          { id: 't6', title: 'Introduction to Pandas', resourceType: 'video', completed: false },
          { id: 't7', title: 'DataFrames & Series', resourceType: 'article', completed: false },
          { id: 't8', title: 'Data Cleaning Techniques', resourceType: 'exercise', completed: false },
          { id: 't9', title: 'Grouping & Aggregation', resourceType: 'project', completed: false },
        ],
      },
      {
        id: 's3',
        title: 'Data Visualization',
        topics: [
          { id: 't10', title: 'Matplotlib Basics', resourceType: 'video', completed: false },
          { id: 't11', title: 'Seaborn for Statistical Plots', resourceType: 'article', completed: false },
          { id: 't12', title: 'Interactive Visualizations', resourceType: 'exercise', completed: false },
          { id: 't13', title: 'Dashboard Creation', resourceType: 'project', completed: false },
        ],
      },
      {
        id: 's4',
        title: 'Machine Learning Basics',
        topics: [
          { id: 't14', title: 'ML Concepts & Workflow', resourceType: 'video', completed: false },
          { id: 't15', title: 'Supervised Learning', resourceType: 'article', completed: false },
          { id: 't16', title: 'Unsupervised Learning', resourceType: 'documentation', completed: false },
          { id: 't17', title: 'Model Evaluation', resourceType: 'quiz', completed: false },
        ],
      },
      {
        id: 's5',
        title: 'Deep Learning Introduction',
        topics: [
          { id: 't18', title: 'Neural Network Fundamentals', resourceType: 'video', completed: false },
          { id: 't19', title: 'TensorFlow & Keras Setup', resourceType: 'article', completed: false },
          { id: 't20', title: 'Building Your First Model', resourceType: 'exercise', completed: false },
          { id: 't21', title: 'Model Training & Optimization', resourceType: 'project', completed: false },
        ],
      },
    ],
  },
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectData, setProjectData] = useState({ githubLink: '', description: '', projectImage: '' });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [courseRating, setCourseRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [courseReview, setCourseReview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (courseId && coursesData[courseId]) {
      setCourse(coursesData[courseId]);
      const firstIncompleteSection = coursesData[courseId].sections.find(
        s => s.topics.some(t => !t.completed)
      );
      if (firstIncompleteSection) {
        setExpandedSections([firstIncompleteSection.id]);
      }
    }
  }, [courseId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleTopicComplete = (sectionId: string, topicId: string) => {
    if (!course) return;
    
    setCourse(prev => {
      if (!prev) return prev;
      const updatedSections = prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            topics: section.topics.map(topic => {
              if (topic.id === topicId) {
                return { ...topic, completed: !topic.completed };
              }
              return topic;
            }),
          };
        }
        return section;
      });
      return { ...prev, sections: updatedSections };
    });
  };

  const getTotalTopics = () => {
    if (!course) return 0;
    return course.sections.reduce((acc, section) => acc + section.topics.length, 0);
  };

  const getCompletedTopics = () => {
    if (!course) return 0;
    return course.sections.reduce(
      (acc, section) => acc + section.topics.filter(t => t.completed).length,
      0
    );
  };

  const getProgress = () => {
    const total = getTotalTopics();
    if (total === 0) return 0;
    return Math.round((getCompletedTopics() / total) * 100);
  };

  const allTopicsCompleted = () => {
    if (!course) return false;
    return course.sections.every(section => section.topics.every(topic => topic.completed));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setProjectData({ ...projectData, projectImage: reader.result as string });
          setIsUploadingImage(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProject = () => {
    if (!projectData.githubLink || !projectData.description || !projectData.projectImage) return;
    
    setCourse(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        graduationProject: {
          submitted: true,
          githubLink: projectData.githubLink,
          description: projectData.description,
          projectImage: projectData.projectImage,
        },
      };
    });
    setShowProjectModal(false);
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    if (courseRating === 0) return;
    
    setCourse(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        userRating: courseRating,
        userReview: courseReview,
      };
    });
    setShowRatingModal(false);
    setShowCompletionModal(true);
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select rating';
    }
  };

  const getSectionProgress = (section: Section) => {
    const completed = section.topics.filter(t => t.completed).length;
    return Math.round((completed / section.topics.length) * 100);
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0f1225] flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-purple-400 animate-spin mb-4"></i>
          <p className="text-white/60">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1225]">
      <Navbar />

      {/* Course Header */}
      <section className="pt-24 pb-8 px-4 bg-gradient-to-b from-[#1a1f37] to-[#0f1225]">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/roadmaps')} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-all cursor-pointer">
            <i className="ri-arrow-left-line"></i>{t('roadmaps.backToRoadmaps')}
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden flex-shrink-0">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{course.title}</h1>
              <p className="text-white/60 text-sm mb-4">{course.description}</p>
              
              {/* Progress Bar */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">{t('roadmaps.courseProgress')}</span>
                  <span className="text-white font-bold">{getProgress()}%</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      getProgress() === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${getProgress()}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/50">
                  <span>{getCompletedTopics()} {t('roadmaps.topicsCompleted')} {getTotalTopics()} {t('roadmaps.topics')}</span>
                  <span>{course.sections.length} {t('roadmaps.sections')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><i className="ri-book-2-line text-purple-400"></i>{t('roadmaps.courseContent')}</h2>

          <div className="space-y-4">
            {course.sections.map((section, sectionIndex) => {
              const sectionProgress = getSectionProgress(section);
              const isExpanded = expandedSections.includes(section.id);
              const isCompleted = sectionProgress === 100;

              return (
                <div
                  key={section.id}
                  className={`bg-white/5 rounded-xl border transition-all ${
                    isCompleted ? 'border-green-500/30' : 'border-white/10'
                  }`}
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {isCompleted ? (
                          <i className="ri-check-line text-lg"></i>
                        ) : (
                          <span className="font-bold">{sectionIndex + 1}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-semibold">{section.title}</h3>
                        <p className="text-white/50 text-sm">
                          {section.topics.filter(t => t.completed).length}/{section.topics.length} topics • {sectionProgress}% complete
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:block w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCompleted ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${sectionProgress}%` }}
                        ></div>
                      </div>
                      <i className={`ri-arrow-down-s-line text-white/60 text-xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                    </div>
                  </button>

                  {/* Section Topics */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="border-t border-white/10 pt-4 space-y-2">
                        {section.topics.map((topic, topicIndex) => {
                          const resourceConfig = resourceTypeConfig[topic.resourceType];
                          return (
                            <div
                              key={topic.id}
                              className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                                topic.completed ? 'bg-green-500/10' : 'bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              <button
                                onClick={() => toggleTopicComplete(section.id, topic.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                                  topic.completed
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-white/30 hover:border-purple-400'
                                }`}
                              >
                                {topic.completed && <i className="ri-check-line text-sm"></i>}
                              </button>
                              <div className="flex-1">
                                <p className={`font-medium ${topic.completed ? 'text-green-400' : 'text-white'}`}>
                                  {sectionIndex + 1}.{topicIndex + 1} {topic.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`flex items-center gap-1.5 text-sm ${resourceConfig.color}`}>
                                  <i className={resourceConfig.icon}></i>
                                  <span className="text-white/50">{resourceConfig.label}</span>
                                </span>
                                {topic.completed && (
                                  <span className="text-green-400 text-xs font-semibold">
                                    <i className="ri-check-double-line mr-1"></i>{t('roadmaps.done')}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Graduation Project Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><i className="ri-graduation-cap-line text-yellow-400"></i>{t('roadmaps.graduationProject')}</h2>

            {!allTopicsCompleted() ? (
              <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-lock-line text-3xl text-white/40"></i></div>
                <h3 className="text-white font-semibold mb-2">{t('roadmaps.completeAllFirst')}</h3>
                <p className="text-white/50 text-sm mb-4">Finish all {getTotalTopics()} topics to unlock the graduation project submission.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-white/60 text-sm">
                  <i className="ri-checkbox-circle-line"></i>{getCompletedTopics()}/{getTotalTopics()} topics completed
                </div>
              </div>
            ) : course.graduationProject?.submitted ? (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {course.graduationProject.projectImage && (
                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={course.graduationProject.projectImage} 
                        alt="Project" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-green-400 font-bold text-lg">Project Submitted!</h3>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">Course Completed</span>
                    </div>
                    <p className="text-white/70 text-sm mb-4">{course.graduationProject.description}</p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={course.graduationProject.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all cursor-pointer"
                      >
                        <i className="ri-github-fill"></i>{t('roadmaps.viewOnGithub')}<i className="ri-external-link-line text-sm"></i>
                      </a>
                      {course.userRating && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                          <span className="text-sm">{t('roadmaps.yourRating')}:</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`text-sm ${
                                  star <= course.userRating! ? 'ri-star-fill' : 'ri-star-line'
                                }`}
                              ></i>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><img src={rocketImage} alt="rocket" className="w-6 h-6 object-contain" /></div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">{t('roadmaps.readyToGraduate')}</h3>
                    <p className="text-white/60 text-sm">{t('roadmaps.readyToGraduateBody')}</p>
                  </div>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-upload-2-line mr-2"></i>{t('roadmaps.submitProject')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project Submission Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f37] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><i className="ri-graduation-cap-line text-purple-400"></i>{t('roadmaps.submitGradProject')}</h2>
                <button onClick={() => setShowProjectModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all cursor-pointer"><i className="ri-close-line text-white text-xl"></i></button>
              </div>
            </div>
            <div className="p-6">
              {/* Project Photo Upload */}
              <div className="mb-6">
                <label className="block text-white/80 text-sm font-medium mb-2">{t('roadmaps.projectScreenshot')} <span className="text-red-400">*</span></label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {projectData.projectImage ? (
                  <div className="relative group">
                    <img
                      src={projectData.projectImage}
                      alt="Project preview"
                      className="w-full h-48 object-cover rounded-xl border border-white/10"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-image-edit-line mr-2"></i>{t('roadmaps.change')}
                      </button>
                      <button
                        onClick={() => setProjectData({ ...projectData, projectImage: '' })}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line mr-2"></i>{t('roadmaps.remove')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <>
                        <i className="ri-loader-4-line text-4xl text-purple-400 animate-spin"></i>
                        <span className="text-white/60 text-sm">{t('roadmaps.uploading')}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <i className="ri-image-add-line text-2xl text-purple-400"></i>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-medium">{t('roadmaps.uploadProjectImg')}</p>
                          <p className="text-white/50 text-sm">{t('roadmaps.uploadImgHint')}</p>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Project Description */}
              <div className="mb-6">
                <label className="block text-white/80 text-sm font-medium mb-2">{t('roadmaps.projectDescription')} <span className="text-red-400">*</span></label>
                <textarea
                  placeholder={t('roadmaps.projectDescPlaceholder')}
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value.slice(0, 500) })}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 text-sm resize-none"
                ></textarea>
                <p className="text-white/40 text-xs mt-1 text-right">{projectData.description.length}/500</p>
              </div>

              {/* GitHub Link */}
              <div className="mb-6">
                <label className="block text-white/80 text-sm font-medium mb-2">{t('roadmaps.githubLink')} <span className="text-red-400">*</span></label>
                <div className="relative">
                  <i className="ri-github-fill absolute left-4 top-1/2 -translate-y-1/2 text-white/40"></i>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={projectData.githubLink}
                    onChange={(e) => setProjectData({ ...projectData, githubLink: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold text-sm mb-2">{t('roadmaps.projectRequirements')}</h4>
                <ul className="text-white/60 text-sm space-y-1">
                  <li className="flex items-center gap-2"><i className={`ri-check-line ${projectData.projectImage ? 'text-green-400' : 'text-white/30'}`}></i>{t('roadmaps.screenshotReq')}</li>
                  <li className="flex items-center gap-2"><i className={`ri-check-line ${projectData.description.length >= 50 ? 'text-green-400' : 'text-white/30'}`}></i>{t('roadmaps.descReq')}</li>
                  <li className="flex items-center gap-2"><i className={`ri-check-line ${projectData.githubLink.includes('github.com') ? 'text-green-400' : 'text-white/30'}`}></i>{t('roadmaps.githubReq')}</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSubmitProject}
                  disabled={!projectData.githubLink || !projectData.description || !projectData.projectImage}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    projectData.githubLink && projectData.description && projectData.projectImage
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <i className="ri-arrow-right-line mr-2"></i>{t('roadmaps.nextRateCourse')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f37] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><i className="ri-star-line text-yellow-400"></i>{t('roadmaps.rateThisCourse')}</h2>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setShowCompletionModal(true);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                >
                  <i className="ri-close-line text-white text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-trophy-fill text-3xl text-yellow-400"></i></div>
                <h3 className="text-white font-bold text-lg mb-1">{t('roadmaps.congratsCompleted')}</h3>
                <p className="text-white/60 text-sm">{t('roadmaps.howWouldYouRate')}</p>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <div className="flex justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setCourseRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="w-12 h-12 flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                    >
                      <i
                        className={`text-4xl transition-all ${
                          star <= (hoverRating || courseRating)
                            ? 'ri-star-fill text-yellow-400'
                            : 'ri-star-line text-white/30'
                        }`}
                      ></i>
                    </button>
                  ))}
                </div>
                <p className={`text-center font-semibold ${courseRating > 0 ? 'text-yellow-400' : 'text-white/40'}`}>{getRatingLabel(hoverRating || courseRating)}</p>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-white/80 text-sm font-medium mb-2">{t('roadmaps.shareExperience')}</label>
                <textarea
                  placeholder={t('roadmaps.reviewPlaceholder')}
                  value={courseReview}
                  onChange={(e) => setCourseReview(e.target.value.slice(0, 500))}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-500 text-sm resize-none"
                ></textarea>
                <p className="text-white/40 text-xs mt-1 text-right">{courseReview.length}/500</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setShowCompletionModal(true);
                  }}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  {t('roadmaps.skip')}
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={courseRating === 0}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    courseRating > 0
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <i className="ri-send-plane-line mr-2"></i>{t('roadmaps.submitRating')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Celebration Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f37] rounded-2xl max-w-md w-full border border-green-500/30 text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><i className="ri-trophy-fill text-4xl text-white"></i></div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('roadmaps.congrats')}</h2>
            <p className="text-green-400 font-semibold mb-4">{t('roadmaps.courseCompleted')}</p>
            <p className="text-white/60 text-sm mb-6">{t('roadmaps.projectSubmitted')}</p>
            {course?.userRating && (
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <p className="text-white/60 text-sm mb-2">{t('roadmaps.yourRating')}</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (<i key={star} className={`text-2xl ${star <= course.userRating! ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-white/30'}`}></i>))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  navigate('/roadmaps');
                }}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
              >
                {t('roadmaps.backToRoadmaps')}
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all cursor-pointer whitespace-nowrap"><i className="ri-medal-line mr-2"></i>{t('roadmaps.viewCertificate')}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CourseDetail;
