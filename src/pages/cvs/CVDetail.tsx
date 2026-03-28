import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useTranslation } from 'react-i18next';

const CVDetail = () => {
  const { cvId } = useParams();
  const { t } = useTranslation();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock CV data
  const cv = {
    id: cvId || '1',
    name: 'Sarah Johnson',
    title: 'Senior Full Stack Developer',
    location: 'San Francisco, CA',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    website: 'www.sarahjohnson.dev',
    linkedin: 'linkedin.com/in/sarahjohnson',
    github: 'github.com/sarahjohnson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20software%20developer%20portrait%20confident%20smile%20in%20modern%20tech%20office%20clean%20white%20background%20business%20casual%20attire&width=300&height=300&seq=cvdetail1&orientation=squarish',
    experience: '8 years',
    availability: 'Available',
    hourlyRate: '$80-100',
    matchScore: 95,
    summary: 'Experienced full-stack developer with 8+ years of experience building scalable web applications. Passionate about clean code, user experience, and delivering projects on time. I specialize in React, Node.js, and cloud technologies. Strong background in leading development teams and mentoring junior developers.',
    skills: [
      { name: 'JavaScript', level: 95 },
      { name: 'React', level: 92 },
      { name: 'Node.js', level: 90 },
      { name: 'TypeScript', level: 88 },
      { name: 'Python', level: 75 },
      { name: 'AWS', level: 85 },
      { name: 'MongoDB', level: 82 },
      { name: 'PostgreSQL', level: 80 },
      { name: 'Docker', level: 78 },
      { name: 'Git', level: 95 }
    ],
    softSkills: [
      { name: 'Communication', level: 95 },
      { name: 'Team Leadership', level: 90 },
      { name: 'Problem Solving', level: 92 },
      { name: 'Time Management', level: 88 },
      { name: 'Adaptability', level: 85 },
      { name: 'Critical Thinking', level: 90 },
      { name: 'Collaboration', level: 93 },
      { name: 'Creativity', level: 80 }
    ],
    workExperience: [
      {
        id: '1',
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Inc.',
        companyLogo: 'https://readdy.ai/api/search-image?query=modern%20tech%20company%20logo%20minimalist%20design%20letter%20T%20teal%20gradient%20white%20background%20corporate%20branding&width=80&height=80&seq=comp1&orientation=squarish',
        location: 'San Francisco, CA',
        period: 'Jan 2021 - Present',
        description: 'Lead developer for the main product team, responsible for architecture decisions and code reviews.',
        achievements: [
          'Led a team of 5 developers to deliver a major platform redesign',
          'Reduced page load time by 40% through optimization',
          'Implemented CI/CD pipeline reducing deployment time by 60%'
        ]
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        companyLogo: 'https://readdy.ai/api/search-image?query=startup%20company%20logo%20modern%20minimalist%20geometric%20shapes%20orange%20gradient%20white%20background%20innovative%20branding&width=80&height=80&seq=comp2&orientation=squarish',
        location: 'Remote',
        period: 'Mar 2018 - Dec 2020',
        description: 'Core developer working on multiple client projects and internal tools.',
        achievements: [
          'Built 10+ web applications from scratch',
          'Mentored 3 junior developers',
          'Introduced automated testing increasing code coverage to 85%'
        ]
      },
      {
        id: '3',
        title: 'Junior Developer',
        company: 'WebAgency Pro',
        companyLogo: 'https://readdy.ai/api/search-image?query=web%20agency%20logo%20modern%20minimalist%20W%20letter%20pink%20gradient%20white%20background%20creative%20digital%20branding&width=80&height=80&seq=comp3&orientation=squarish',
        location: 'New York, NY',
        period: 'Jun 2016 - Feb 2018',
        description: 'Started career building websites and web applications for various clients.',
        achievements: [
          'Developed 20+ client websites',
          'Learned modern JavaScript frameworks',
          'Received Employee of the Quarter award'
        ]
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Bachelor of Science in Computer Science',
        school: 'Stanford University',
        location: 'Stanford, CA',
        period: '2012 - 2016',
        gpa: '3.8/4.0',
        achievements: ['Dean\'s List', 'Computer Science Honor Society']
      }
    ],
    certifications: [
      {
        id: '1',
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023',
        credentialId: 'AWS-SAA-123456'
      },
      {
        id: '2',
        name: 'Professional Scrum Master I',
        issuer: 'Scrum.org',
        date: '2022',
        credentialId: 'PSM-789012'
      },
      {
        id: '3',
        name: 'MongoDB Certified Developer',
        issuer: 'MongoDB University',
        date: '2021',
        credentialId: 'MDB-345678'
      }
    ],
    languages: [
      { name: 'English', level: 'Native', proficiency: 100 },
      { name: 'Spanish', level: 'Professional', proficiency: 85 },
      { name: 'French', level: 'Intermediate', proficiency: 60 },
      { name: 'German', level: 'Basic', proficiency: 30 }
    ],
    projects: [
      {
        id: '1',
        name: 'E-Commerce Platform',
        description: 'Built a full-featured e-commerce platform with React and Node.js',
        link: 'github.com/sarahjohnson/ecommerce'
      },
      {
        id: '2',
        name: 'Task Management App',
        description: 'Real-time collaborative task management application',
        link: 'github.com/sarahjohnson/taskmanager'
      }
    ]
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'Busy': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'Not Available': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getLanguageLevelColor = (level: string) => {
    switch (level) {
      case 'Native': return 'from-emerald-500 to-teal-500';
      case 'Professional': return 'from-purple-500 to-pink-500';
      case 'Intermediate': return 'from-amber-500 to-orange-500';
      case 'Basic': return 'from-gray-400 to-gray-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f37]">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link
            to="/cvs"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            {t('cvs.backToCVs')}
          </Link>

          {/* Header Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 mb-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-purple-500/30">
                    <img src={cv.avatar} alt={cv.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {cv.matchScore}
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{cv.name}</h1>
                  <p className="text-purple-400 text-lg font-medium mb-3">{cv.title}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <i className="ri-map-pin-line"></i>
                      {cv.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-briefcase-line"></i>
                      {cv.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-money-dollar-circle-line"></i>
                      {cv.hourlyRate}/hr
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getAvailabilityColor(cv.availability)}`}>
                      {cv.availability === 'Available' ? t('cvs.available') : cv.availability === 'Busy' ? t('cvs.busy') : t('cvs.notAvailable')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-1 flex flex-col sm:flex-row lg:flex-col items-center lg:items-end justify-center gap-3">
                <button className="w-full sm:w-auto lg:w-48 px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-message-3-line mr-2"></i>
                  {t('cvs.contact')}
                </button>
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`w-full sm:w-auto lg:w-48 px-6 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    isBookmarked
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <i className={`${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'} mr-2`}></i>
                  {isBookmarked ? t('cvs.saved') : t('cvs.saveCV')}
                </button>
                <button className="w-full sm:w-auto lg:w-48 px-6 py-3 bg-white/5 text-white font-semibold rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-download-line mr-2"></i>
                  {t('cvs.downloadPDF')}
                </button>
              </div>
            </div>

            {/* Contact Links */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a href={`mailto:${cv.email}`} className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer">
                  <i className="ri-mail-line"></i>
                  <span className="text-sm">{cv.email}</span>
                </a>
                <a href={`tel:${cv.phone}`} className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer">
                  <i className="ri-phone-line"></i>
                  <span className="text-sm">{cv.phone}</span>
                </a>
                <a href={`https://${cv.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer">
                  <i className="ri-linkedin-box-fill"></i>
                  <span className="text-sm">LinkedIn</span>
                </a>
                <a href={`https://${cv.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer">
                  <i className="ri-github-fill"></i>
                  <span className="text-sm">GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="ri-user-line text-purple-400"></i>
                  {t('cvs.professionalSummary')}
                </h2>
                <p className="text-gray-300 leading-relaxed">{cv.summary}</p>
              </div>

              {/* Work Experience */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <i className="ri-briefcase-line text-purple-400"></i>
                  {t('cvs.workExperience')}
                </h2>
                <div className="space-y-6">
                  {cv.workExperience.map((job, index) => (
                    <div key={job.id} className={`relative pl-6 ${index !== cv.workExperience.length - 1 ? 'pb-6 border-l-2 border-purple-500/30' : ''}`}>
                      <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-purple-500 -translate-x-[7px]"></div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                          <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{job.title}</h3>
                          <p className="text-purple-400 text-sm">{job.company}</p>
                          <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm mt-1">
                            <span className="flex items-center gap-1">
                              <i className="ri-map-pin-line"></i>
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-calendar-line"></i>
                              {job.period}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mt-3">{job.description}</p>
                          <ul className="mt-3 space-y-1">
                            {job.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                                <i className="ri-check-line text-emerald-400 mt-0.5"></i>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <i className="ri-graduation-cap-line text-purple-400"></i>
                  {t('cvs.education')}
                </h2>
                {cv.education.map(edu => (
                  <div key={edu.id} className="flex flex-col sm:flex-row gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="ri-school-line text-2xl text-purple-400"></i>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{edu.degree}</h3>
                      <p className="text-purple-400 text-sm">{edu.school}</p>
                      <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <i className="ri-map-pin-line"></i>
                          {edu.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>
                          {edu.period}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-award-line"></i>
                          GPA: {edu.gpa}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {edu.achievements.map((achievement, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="ri-code-box-line text-purple-400"></i>
                  {t('cvs.projects')}
                </h2>
                <div className="space-y-4">
                  {cv.projects.map(project => (
                    <div key={project.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-semibold">{project.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                      <a href={`https://${project.link}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-purple-400 text-sm mt-2 hover:text-purple-300 cursor-pointer">
                        <i className="ri-external-link-line"></i>
                        {project.link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Technical Skills */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="ri-code-s-slash-line text-purple-400"></i>
                  {t('cvs.technicalSkills')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cv.skills.map(skill => (
                    <span
                      key={skill.name}
                      className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="ri-heart-pulse-line text-pink-400"></i>
                  {t('cvs.softSkills')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cv.softSkills.map(skill => (
                    <span
                      key={skill.name}
                      className="px-3 py-1.5 bg-pink-500/20 border border-pink-500/30 rounded-lg text-sm text-pink-300"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="ri-translate-2 text-teal-400"></i>
                  {t('cvs.languages')}
                </h2>
                <div className="space-y-4">
                  {cv.languages.map(lang => (
                    <div key={lang.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300 text-sm">{lang.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          lang.level === 'Native' ? 'bg-emerald-500/20 text-emerald-400' :
                          lang.level === 'Professional' ? 'bg-purple-500/20 text-purple-400' :
                          lang.level === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {lang.level}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getLanguageLevelColor(lang.level)} rounded-full`}
                          style={{ width: `${lang.proficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="ri-award-line text-amber-400"></i>
                  {t('cvs.certifications')}
                </h2>
                <div className="space-y-4">
                  {cv.certifications.map(cert => (
                    <div key={cert.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <h4 className="text-white font-medium text-sm">{cert.name}</h4>
                      <p className="text-gray-400 text-xs mt-1">{cert.issuer}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-purple-400">{cert.date}</span>
                        <span className="text-gray-500">{cert.credentialId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CVDetail;
