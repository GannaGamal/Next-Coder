import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import RoleGateModal from '../../components/feature/RoleGateModal';
import ReportModal from '../../components/feature/ReportModal';
import CustomSelect from '../../components/base/CustomSelect';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface CV {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  avatar: string;
  skills: string[];
  matchScore: number;
  availability: 'Available' | 'Busy' | 'Not Available';
  hourlyRate?: string;
  education: string;
  summary: string;
  appliedJob: {
    id: string;
    title: string;
    company: string;
    appliedDate: string;
  };
}

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  salary: string;
  type: string;
  location: string;
}

interface Company {
  id: string;
  name: string;
  logo: string;
}

const PublicCVs = () => {
  const { user, isAuthenticated } = useAuth();
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showRoleGateModal, setShowRoleGateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<{ name: string; avatar: string } | null>(null);
  const [likedCVs, setLikedCVs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  const [showFilters, setShowFilters] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const toggleLikeCV = (cvId: string) => {
    setLikedCVs(prev => {
      const next = new Set(prev);
      if (next.has(cvId)) {
        next.delete(cvId);
      } else {
        next.add(cvId);
      }
      return next;
    });
  };

  const allSkills = [
    'JavaScript', 'React', 'Python', 'Java', 'Node.js', 'TypeScript',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'Angular', 'Vue.js',
    'PHP', 'C++', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Flutter'
  ];

  const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Miami, FL', 'Portland, OR'];

  const companies: Company[] = [
    { id: '1', name: 'TechCorp Inc.', logo: 'https://readdy.ai/api/search-image?query=modern%20tech%20company%20logo%20minimalist%20blue%20gradient%20abstract%20geometric%20shape%20professional%20corporate%20identity&width=80&height=80&seq=comp1&orientation=squarish' },
    { id: '2', name: 'StartupXYZ', logo: 'https://readdy.ai/api/search-image?query=startup%20company%20logo%20modern%20orange%20gradient%20abstract%20rocket%20shape%20professional%20brand%20identity&width=80&height=80&seq=comp2&orientation=squarish' },
    { id: '3', name: 'CloudNine Tech', logo: 'https://readdy.ai/api/search-image?query=cloud%20technology%20company%20logo%20modern%20teal%20gradient%20abstract%20cloud%20shape%20professional%20corporate%20identity&width=80&height=80&seq=comp3&orientation=squarish' },
    { id: '4', name: 'DataFlow Systems', logo: 'https://readdy.ai/api/search-image?query=data%20analytics%20company%20logo%20modern%20purple%20gradient%20abstract%20flow%20lines%20professional%20brand%20identity&width=80&height=80&seq=comp4&orientation=squarish' },
    { id: '5', name: 'InnovateLab', logo: 'https://readdy.ai/api/search-image?query=innovation%20lab%20company%20logo%20modern%20green%20gradient%20abstract%20lightbulb%20shape%20professional%20corporate%20identity&width=80&height=80&seq=comp5&orientation=squarish' }
  ];

  const jobs: Job[] = [
    { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp Inc.', description: 'We are looking for an experienced Senior Frontend Developer to join our dynamic team. You will be responsible for building and maintaining high-quality web applications using modern JavaScript frameworks. The ideal candidate has strong experience with React, TypeScript, and modern CSS frameworks.', requirements: ['5+ years of frontend development experience', 'Expert knowledge of React and TypeScript', 'Experience with state management (Redux, MobX)', 'Strong understanding of responsive design', 'Excellent problem-solving skills'], salary: '$120,000 - $160,000', type: 'Full-time', location: 'San Francisco, CA' },
    { id: '2', title: 'Backend Engineer', company: 'TechCorp Inc.', description: 'Join our backend team to build scalable and reliable server-side applications. You will work on designing and implementing APIs, database optimization, and cloud infrastructure. We value clean code, thorough testing, and collaborative development.', requirements: ['4+ years of backend development experience', 'Proficiency in Python or Node.js', 'Experience with PostgreSQL and MongoDB', 'Knowledge of AWS or GCP services', 'Understanding of microservices architecture'], salary: '$110,000 - $150,000', type: 'Full-time', location: 'San Francisco, CA' },
    { id: '3', title: 'Full Stack Developer', company: 'StartupXYZ', description: 'We are a fast-growing startup looking for a versatile Full Stack Developer who can work across the entire technology stack. You will have the opportunity to shape our product from the ground up and make significant technical decisions.', requirements: ['3+ years of full stack development', 'Experience with React and Node.js', 'Database design and optimization skills', 'Startup mentality and adaptability', 'Strong communication skills'], salary: '$100,000 - $140,000', type: 'Full-time', location: 'Austin, TX' },
    { id: '4', title: 'DevOps Engineer', company: 'CloudNine Tech', description: 'We need a skilled DevOps Engineer to help us build and maintain our cloud infrastructure. You will be responsible for CI/CD pipelines, container orchestration, and ensuring high availability of our services.', requirements: ['5+ years of DevOps experience', 'Expert knowledge of AWS and Kubernetes', 'Experience with Terraform and Ansible', 'Strong scripting skills (Python, Bash)', 'On-call rotation participation'], salary: '$130,000 - $170,000', type: 'Full-time', location: 'Seattle, WA' },
    { id: '5', title: 'Data Scientist', company: 'DataFlow Systems', description: 'Join our data science team to build predictive models and extract insights from large datasets. You will work closely with product and engineering teams to implement machine learning solutions that drive business value.', requirements: ['3+ years of data science experience', 'Strong Python and SQL skills', 'Experience with TensorFlow or PyTorch', 'Statistical analysis expertise', 'Excellent data visualization skills'], salary: '$115,000 - $155,000', type: 'Full-time', location: 'New York, NY' },
    { id: '6', title: 'Mobile Developer', company: 'StartupXYZ', description: 'We are looking for a talented Mobile Developer to build our iOS and Android applications. You will be responsible for the entire mobile development lifecycle from concept to deployment.', requirements: ['3+ years of mobile development', 'Experience with React Native or Flutter', 'Published apps on App Store/Play Store', 'Understanding of mobile UI/UX principles', 'API integration experience'], salary: '$95,000 - $135,000', type: 'Full-time', location: 'Austin, TX' },
    { id: '7', title: 'Cloud Architect', company: 'CloudNine Tech', description: 'Design and implement enterprise-scale cloud solutions for our clients. You will be the technical lead on complex cloud migration and modernization projects.', requirements: ['8+ years of IT experience', 'AWS/Azure/GCP certifications', 'Experience with multi-cloud architectures', 'Strong leadership and communication', 'Security best practices knowledge'], salary: '$150,000 - $200,000', type: 'Full-time', location: 'Seattle, WA' },
    { id: '8', title: 'Machine Learning Engineer', company: 'DataFlow Systems', description: 'Build and deploy machine learning models at scale. You will work on cutting-edge AI projects and help establish ML best practices across the organization.', requirements: ['4+ years of ML engineering experience', 'Deep learning framework expertise', 'MLOps and model deployment skills', 'Strong software engineering background', 'Research publication experience a plus'], salary: '$140,000 - $180,000', type: 'Full-time', location: 'New York, NY' },
    { id: '9', title: 'Product Designer', company: 'InnovateLab', description: 'Create beautiful and intuitive user experiences for our innovative products. You will lead the design process from user research to final implementation.', requirements: ['4+ years of product design experience', 'Expert in Figma and design systems', 'Strong portfolio of shipped products', 'User research and testing skills', 'Collaboration with engineering teams'], salary: '$100,000 - $140,000', type: 'Full-time', location: 'Los Angeles, CA' },
    { id: '10', title: 'Security Engineer', company: 'TechCorp Inc.', description: 'Protect our systems and data from security threats. You will conduct security assessments, implement security controls, and respond to security incidents.', requirements: ['5+ years of security experience', 'Security certifications (CISSP, CEH)', 'Penetration testing skills', 'Incident response experience', 'Knowledge of compliance frameworks'], salary: '$125,000 - $165,000', type: 'Full-time', location: 'San Francisco, CA' }
  ];

  const cvs: CV[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Senior Full Stack Developer',
      location: 'San Francisco, CA',
      experience: '5 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20software%20developer%20portrait%20confident%20smile%20in%20modern%20tech%20office%20clean%20white%20background%20business%20casual%20attire&width=200&height=200&seq=cv1&orientation=squarish',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
      matchScore: 95,
      availability: 'Available',
      hourlyRate: '$80-100',
      education: 'BS Computer Science, Stanford University',
      summary: 'Experienced full stack developer with a passion for building scalable web applications. Specialized in React and Node.js ecosystems.',
      appliedJob: { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp Inc.', appliedDate: '2024-01-12' }
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Frontend Developer',
      location: 'New York, NY',
      experience: '3 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20frontend%20developer%20portrait%20friendly%20smile%20in%20creative%20workspace%20clean%20white%20background%20casual%20professional%20attire&width=200&height=200&seq=cv2&orientation=squarish',
      skills: ['React', 'Vue.js', 'TypeScript', 'CSS', 'Git', 'Figma'],
      matchScore: 88,
      availability: 'Busy',
      hourlyRate: '$60-80',
      education: 'BS Software Engineering, MIT',
      summary: 'Creative frontend developer focused on building beautiful and intuitive user interfaces with modern frameworks.',
      appliedJob: { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp Inc.', appliedDate: '2024-01-13' }
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      title: 'Backend Engineer',
      location: 'Austin, TX',
      experience: '4 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20backend%20engineer%20portrait%20confident%20in%20tech%20office%20environment%20clean%20white%20background%20business%20casual&width=200&height=200&seq=cv3&orientation=squarish',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS', 'Redis'],
      matchScore: 92,
      availability: 'Available',
      hourlyRate: '$70-90',
      education: 'MS Computer Science, UC Berkeley',
      summary: 'Backend specialist with expertise in Python and cloud infrastructure. Strong focus on API design and database optimization.',
      appliedJob: { id: '2', title: 'Backend Engineer', company: 'TechCorp Inc.', appliedDate: '2024-01-10' }
    },
    {
      id: '4',
      name: 'David Kim',
      title: 'Mobile Developer',
      location: 'Seattle, WA',
      experience: '3 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20mobile%20developer%20portrait%20friendly%20in%20modern%20office%20clean%20white%20background%20business%20casual%20attire&width=200&height=200&seq=cv4&orientation=squarish',
      skills: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'Firebase'],
      matchScore: 85,
      availability: 'Available',
      hourlyRate: '$65-85',
      education: 'BS Computer Engineering, University of Washington',
      summary: 'Mobile app developer experienced in both native and cross-platform development. Published 10+ apps on App Store and Play Store.',
      appliedJob: { id: '6', title: 'Mobile Developer', company: 'StartupXYZ', appliedDate: '2024-01-14' }
    },
    {
      id: '5',
      name: 'Jessica Taylor',
      title: 'DevOps Engineer',
      location: 'Boston, MA',
      experience: '6 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20devops%20engineer%20portrait%20confident%20smile%20in%20tech%20workspace%20clean%20white%20background%20professional%20attire&width=200&height=200&seq=cv5&orientation=squarish',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Python'],
      matchScore: 90,
      availability: 'Not Available',
      hourlyRate: '$90-110',
      education: 'BS Information Systems, Boston University',
      summary: 'DevOps engineer specializing in cloud infrastructure and CI/CD pipelines. Expert in AWS and containerization technologies.',
      appliedJob: { id: '4', title: 'DevOps Engineer', company: 'CloudNine Tech', appliedDate: '2024-01-08' }
    },
    {
      id: '6',
      name: 'Alex Martinez',
      title: 'Data Scientist',
      location: 'Chicago, IL',
      experience: '4 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20data%20scientist%20portrait%20friendly%20smile%20in%20modern%20office%20clean%20white%20background%20business%20casual%20attire&width=200&height=200&seq=cv6&orientation=squarish',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'R', 'Pandas'],
      matchScore: 87,
      availability: 'Available',
      hourlyRate: '$75-95',
      education: 'MS Data Science, Northwestern University',
      summary: 'Data scientist with strong background in machine learning and statistical analysis. Experience in building predictive models.',
      appliedJob: { id: '5', title: 'Data Scientist', company: 'DataFlow Systems', appliedDate: '2024-01-11' }
    },
    {
      id: '7',
      name: 'Rachel Green',
      title: 'UI/UX Designer & Developer',
      location: 'Los Angeles, CA',
      experience: '5 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20ui%20ux%20designer%20portrait%20creative%20smile%20in%20design%20studio%20clean%20white%20background%20stylish%20casual%20attire&width=200&height=200&seq=cv7&orientation=squarish',
      skills: ['Figma', 'React', 'CSS', 'JavaScript', 'Adobe XD', 'Sketch'],
      matchScore: 91,
      availability: 'Busy',
      hourlyRate: '$70-90',
      education: 'BFA Digital Design, Art Center College of Design',
      summary: 'Designer-developer hybrid with expertise in creating beautiful, user-centered digital experiences from concept to code.',
      appliedJob: { id: '9', title: 'Product Designer', company: 'InnovateLab', appliedDate: '2024-01-09' }
    },
    {
      id: '8',
      name: 'James Wilson',
      title: 'Full Stack Developer',
      location: 'Denver, CO',
      experience: '7 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20full%20stack%20developer%20portrait%20confident%20in%20tech%20office%20clean%20white%20background%20business%20casual%20attire&width=200&height=200&seq=cv8&orientation=squarish',
      skills: ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'Docker', 'AWS'],
      matchScore: 93,
      availability: 'Available',
      hourlyRate: '$85-105',
      education: 'BS Computer Science, University of Colorado',
      summary: 'Versatile full stack developer with strong Java backend expertise. Experience leading development teams on enterprise projects.',
      appliedJob: { id: '3', title: 'Full Stack Developer', company: 'StartupXYZ', appliedDate: '2024-01-07' }
    },
    {
      id: '9',
      name: 'Amanda Foster',
      title: 'Cloud Architect',
      location: 'San Francisco, CA',
      experience: '8 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20cloud%20architect%20portrait%20confident%20smile%20in%20modern%20tech%20office%20clean%20white%20background%20elegant%20business%20attire&width=200&height=200&seq=cv9&orientation=squarish',
      skills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Python'],
      matchScore: 96,
      availability: 'Available',
      hourlyRate: '$120-150',
      education: 'MS Cloud Computing, Carnegie Mellon University',
      summary: 'Senior cloud architect with multi-cloud expertise. Designed and implemented enterprise-scale cloud solutions for Fortune 500 companies.',
      appliedJob: { id: '7', title: 'Cloud Architect', company: 'CloudNine Tech', appliedDate: '2024-01-06' }
    },
    {
      id: '10',
      name: 'Ryan Thompson',
      title: 'Blockchain Developer',
      location: 'New York, NY',
      experience: '4 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20blockchain%20developer%20portrait%20friendly%20smile%20in%20modern%20workspace%20clean%20white%20background%20smart%20casual%20attire&width=200&height=200&seq=cv10&orientation=squarish',
      skills: ['Solidity', 'Web3.js', 'React', 'Node.js', 'Ethereum', 'Smart Contracts'],
      matchScore: 84,
      availability: 'Available',
      hourlyRate: '$100-130',
      education: 'BS Computer Science, Columbia University',
      summary: 'Blockchain specialist focused on DeFi and NFT platforms. Built smart contracts handling over $50M in transactions.',
      appliedJob: { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp Inc.', appliedDate: '2024-01-15' }
    },
    {
      id: '11',
      name: 'Sophia Lee',
      title: 'Machine Learning Engineer',
      location: 'Boston, MA',
      experience: '5 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20machine%20learning%20engineer%20portrait%20confident%20smile%20in%20research%20lab%20clean%20white%20background%20smart%20casual%20attire&width=200&height=200&seq=cv11&orientation=squarish',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Keras', 'SQL', 'Docker'],
      matchScore: 94,
      availability: 'Available',
      hourlyRate: '$95-120',
      education: 'PhD Machine Learning, MIT',
      summary: 'ML engineer with research background in deep learning and NLP. Published papers in top AI conferences.',
      appliedJob: { id: '8', title: 'Machine Learning Engineer', company: 'DataFlow Systems', appliedDate: '2024-01-16' }
    },
    {
      id: '12',
      name: 'Daniel Brown',
      title: 'Security Engineer',
      location: 'San Francisco, CA',
      experience: '6 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20security%20engineer%20portrait%20serious%20confident%20in%20tech%20office%20clean%20white%20background%20professional%20attire&width=200&height=200&seq=cv12&orientation=squarish',
      skills: ['Penetration Testing', 'Python', 'AWS', 'Network Security', 'SIEM', 'Compliance'],
      matchScore: 89,
      availability: 'Busy',
      hourlyRate: '$100-130',
      education: 'MS Cybersecurity, Georgia Tech',
      summary: 'Security professional with expertise in penetration testing and incident response. CISSP and CEH certified.',
      appliedJob: { id: '10', title: 'Security Engineer', company: 'TechCorp Inc.', appliedDate: '2024-01-17' }
    },
    {
      id: '13',
      name: 'Olivia Wang',
      title: 'Frontend Developer',
      location: 'Seattle, WA',
      experience: '4 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20frontend%20developer%20portrait%20friendly%20smile%20in%20modern%20office%20clean%20white%20background%20casual%20professional%20attire&width=200&height=200&seq=cv13&orientation=squarish',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Jest'],
      matchScore: 91,
      availability: 'Available',
      hourlyRate: '$75-95',
      education: 'BS Computer Science, University of Washington',
      summary: 'Frontend specialist passionate about creating accessible and performant web applications with modern technologies.',
      appliedJob: { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp Inc.', appliedDate: '2024-01-18' }
    },
    {
      id: '14',
      name: 'Marcus Johnson',
      title: 'Backend Developer',
      location: 'Austin, TX',
      experience: '5 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20backend%20developer%20portrait%20confident%20smile%20in%20tech%20workspace%20clean%20white%20background%20business%20casual%20attire&width=200&height=200&seq=cv14&orientation=squarish',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
      matchScore: 88,
      availability: 'Available',
      hourlyRate: '$80-100',
      education: 'MS Software Engineering, UT Austin',
      summary: 'Backend developer focused on building scalable microservices and real-time systems. Strong DevOps background.',
      appliedJob: { id: '2', title: 'Backend Engineer', company: 'TechCorp Inc.', appliedDate: '2024-01-19' }
    },
    {
      id: '15',
      name: 'Emma Davis',
      title: 'Product Designer',
      location: 'Los Angeles, CA',
      experience: '6 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20product%20designer%20portrait%20creative%20confident%20in%20design%20studio%20clean%20white%20background%20stylish%20attire&width=200&height=200&seq=cv15&orientation=squarish',
      skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
      matchScore: 93,
      availability: 'Available',
      hourlyRate: '$85-110',
      education: 'MFA Interaction Design, ArtCenter',
      summary: 'Product designer with a track record of shipping successful products. Expert in design systems and user research.',
      appliedJob: { id: '9', title: 'Product Designer', company: 'InnovateLab', appliedDate: '2024-01-20' }
    },
    {
      id: '16',
      name: 'Chris Anderson',
      title: 'DevOps Engineer',
      location: 'Denver, CO',
      experience: '4 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20devops%20engineer%20portrait%20friendly%20in%20modern%20tech%20office%20clean%20white%20background%20casual%20professional%20attire&width=200&height=200&seq=cv16&orientation=squarish',
      skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'CI/CD', 'Python'],
      matchScore: 86,
      availability: 'Busy',
      hourlyRate: '$80-100',
      education: 'BS Computer Science, CU Boulder',
      summary: 'DevOps engineer passionate about automation and infrastructure as code. AWS certified solutions architect.',
      appliedJob: { id: '4', title: 'DevOps Engineer', company: 'CloudNine Tech', appliedDate: '2024-01-21' }
    },
    {
      id: '17',
      name: 'Isabella Martinez',
      title: 'Data Analyst',
      location: 'Miami, FL',
      experience: '3 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20data%20analyst%20portrait%20confident%20smile%20in%20modern%20office%20clean%20white%20background%20business%20casual%20attire&width=200&height=200&seq=cv17&orientation=squarish',
      skills: ['Python', 'SQL', 'Tableau', 'Excel', 'R', 'Power BI'],
      matchScore: 82,
      availability: 'Available',
      hourlyRate: '$55-75',
      education: 'MS Business Analytics, University of Miami',
      summary: 'Data analyst skilled in transforming complex data into actionable insights. Strong visualization and storytelling abilities.',
      appliedJob: { id: '5', title: 'Data Scientist', company: 'DataFlow Systems', appliedDate: '2024-01-22' }
    },
    {
      id: '18',
      name: 'Nathan Park',
      title: 'Full Stack Developer',
      location: 'Portland, OR',
      experience: '4 years',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20full%20stack%20developer%20portrait%20friendly%20smile%20in%20creative%20workspace%20clean%20white%20background%20smart%20casual%20attire&width=200&height=200&seq=cv18&orientation=squarish',
      skills: ['React', 'Node.js', 'MongoDB', 'GraphQL', 'TypeScript', 'AWS'],
      matchScore: 87,
      availability: 'Available',
      hourlyRate: '$70-90',
      education: 'BS Computer Science, Oregon State',
      summary: 'Full stack developer with a passion for building end-to-end solutions. Experience with startups and agile environments.',
      appliedJob: { id: '3', title: 'Full Stack Developer', company: 'StartupXYZ', appliedDate: '2024-01-23' }
    }
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setExperienceFilter('all');
    setAvailabilityFilter('all');
    setLocationFilter('all');
    setCompanyFilter('all');
    setJobFilter('all');
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearchQuery.toLowerCase())
  );

  const filteredJobs = companyFilter === 'all'
    ? jobs
    : jobs.filter(job => job.company === companies.find(c => c.id === companyFilter)?.name);

  const handleCompanyChange = (companyId: string) => {
    setCompanyFilter(companyId);
    setJobFilter('all');
  };

  const filteredCVs = cvs.filter(cv => {
    const matchesSearch = cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.every(skill => cv.skills.includes(skill));

    const matchesExperience = experienceFilter === 'all' ||
      (experienceFilter === '0-2' && parseInt(cv.experience) <= 2) ||
      (experienceFilter === '3-5' && parseInt(cv.experience) >= 3 && parseInt(cv.experience) <= 5) ||
      (experienceFilter === '6+' && parseInt(cv.experience) >= 6);

    const matchesAvailability = availabilityFilter === 'all' || cv.availability === availabilityFilter;
    const matchesLocation = locationFilter === 'all' || cv.location === locationFilter;
    const matchesCompany = companyFilter === 'all' || cv.appliedJob.company === companies.find(c => c.id === companyFilter)?.name;
    const matchesJob = jobFilter === 'all' || cv.appliedJob.id === jobFilter;

    return matchesSearch && matchesSkills && matchesExperience && matchesAvailability && matchesLocation && matchesCompany && matchesJob;
  });

  const sortedCVs = [...filteredCVs].sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore;
    if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'date') {
      return new Date(b.appliedJob.appliedDate).getTime() - new Date(a.appliedJob.appliedDate).getTime();
    }
    return 0;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'Busy': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'Not Available': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-500';
    if (score >= 80) return 'from-purple-500 to-pink-500';
    if (score >= 70) return 'from-amber-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const activeFiltersCount = [
    selectedSkills.length > 0,
    experienceFilter !== 'all',
    availabilityFilter !== 'all',
    locationFilter !== 'all',
    companyFilter !== 'all',
    jobFilter !== 'all'
  ].filter(Boolean).length;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (uploadedFile) {
      setShowUploadModal(false);
      setUploadedFile(null);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const handleJobSelect = (jobId: string) => {
    setJobFilter(jobFilter === jobId ? 'all' : jobId);
  };

  const handleUploadCV = () => {
    if (!isAuthenticated || !user?.roles.includes('applicant')) {
      setShowRoleGateModal(true);
      return;
    }
    setShowUploadModal(true);
  };

  const handleOpenReport = (name: string, avatar: string) => {
    setSelectedApplicant({ name, avatar });
    setShowReportModal(true);
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-50' : 'bg-[#1a1f37]'}`}>
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('cvs.title')}</h1>
            <p className={`text-sm sm:text-base ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('cvs.subtitle')}</p>
          </div>

          {/* Company Filter Cards */}
          <div className="mb-6">
            <h2 className={`font-semibold mb-4 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              <i className="ri-building-line text-purple-400"></i>
              {t('cvs.filterByCompany')}
            </h2>
            {/* Company Search Bar */}
            <div className="relative mb-4">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={companySearchQuery}
                onChange={(e) => setCompanySearchQuery(e.target.value)}
                placeholder={t('cvs.searchCompanies')}
                className={`w-full border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500 text-sm ${isLightMode ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
              />
              {companySearchQuery && (
                <button onClick={() => setCompanySearchQuery('')} className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
                  <i className="ri-close-line"></i>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => handleCompanyChange('all')}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${companyFilter === 'all' ? 'bg-purple-500/20 border-purple-500' : isLightMode ? 'bg-white border-gray-200 hover:border-purple-400' : 'bg-white/5 border-white/10 hover:border-purple-500/50'}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/20">
                    <i className="ri-stack-line text-purple-400 text-sm"></i>
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-semibold text-xs truncate ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('cvs.allCompanies')}</h3>
                  </div>
                </div>
              </button>
              {filteredCompanies.map(company => (
                <button
                  key={company.id}
                  onClick={() => handleCompanyChange(company.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${companyFilter === company.id ? 'bg-purple-500/20 border-purple-500' : isLightMode ? 'bg-white border-gray-200 hover:border-purple-400' : 'bg-white/5 border-white/10 hover:border-purple-500/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-xs truncate ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{company.name}</h3>
                    </div>
                  </div>
                </button>
              ))}
              {filteredCompanies.length === 0 && companySearchQuery && (
                <div className={`col-span-full text-center py-4 text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No companies found matching &quot;{companySearchQuery}&quot;
                </div>
              )}
            </div>
          </div>

          {/* Job Filter Cards */}
          <div className="mb-8">
            <h2 className={`font-semibold mb-4 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              <i className="ri-briefcase-line text-purple-400"></i>
              {t('cvs.filterByJob')}
              {companyFilter !== 'all' && (
                <span className={`text-xs font-normal ${isLightMode ? 'text-gray-400' : 'text-gray-400'}`}>
                  ({t('cvs.showingJobsFrom')} {companies.find(c => c.id === companyFilter)?.name})
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredJobs.map(job => (
                <div
                  key={job.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative group ${jobFilter === job.id ? 'bg-purple-500/20 border-purple-500' : isLightMode ? 'bg-white border-gray-200 hover:border-purple-400' : 'bg-white/5 border-white/10 hover:border-purple-500/50'}`}
                >
                  <div className="flex items-center gap-3" onClick={() => handleJobSelect(job.id)}>
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500/20">
                      <i className="ri-briefcase-line text-purple-400"></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold text-sm truncate ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{job.title}</h3>
                      <p className={`text-xs truncate ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{job.company}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleJobClick(job); }}
                    className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${isLightMode ? 'bg-gray-100 hover:bg-purple-50' : 'bg-white/10 hover:bg-purple-500/30'}`}
                    title={t('cvs.viewJobDescription')}
                  >
                    <i className="ri-information-line text-sm"></i>
                  </button>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <div className={`col-span-full text-center py-6 text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('cvs.noJobsForCompany')}
                </div>
              )}
            </div>
          </div>

          {/* Job Description Modal */}
          {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedJob(null)}></div>
              <div className={`relative rounded-2xl border p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
                <button onClick={() => setSelectedJob(null)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
                  <i className="ri-close-line text-xl"></i>
                </button>

                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-500/20 flex-shrink-0">
                      <i className="ri-briefcase-line text-2xl text-purple-400"></i>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{selectedJob.title}</h3>
                      <p className="text-purple-500 font-medium">{selectedJob.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className={`px-3 py-1.5 border rounded-lg text-sm flex items-center gap-1.5 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                      <i className="ri-map-pin-line text-purple-400"></i>{selectedJob.location}
                    </span>
                    <span className={`px-3 py-1.5 border rounded-lg text-sm flex items-center gap-1.5 ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                      <i className="ri-time-line text-purple-400"></i>{selectedJob.type}
                    </span>
                    <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-500 flex items-center gap-1.5">
                      <i className="ri-money-dollar-circle-line"></i>{selectedJob.salary}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                    <i className="ri-file-text-line text-purple-400"></i>{t('cvs.jobDescription')}
                  </h4>
                  <p className={`text-sm leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>{selectedJob.description}</p>
                </div>

                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                    <i className="ri-checkbox-circle-line text-purple-400"></i>{t('cvs.requirements')}
                  </h4>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className={`flex items-start gap-2 text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                        <i className="ri-check-line text-emerald-500 mt-0.5 flex-shrink-0"></i>{req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setJobFilter(selectedJob.id); setSelectedJob(null); }}
                    className="flex-1 px-5 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer"
                  >{t('cvs.viewApplicants')}</button>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className={`px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  >{t('common.close')}</button>
                </div>
              </div>
            </div>
          )}

          {/* Upload CV Card */}
          <div className={`mb-8 backdrop-blur-sm rounded-xl border p-4 sm:p-6 ${isLightMode ? 'bg-emerald-50 border-emerald-200' : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl border flex-shrink-0 ${isLightMode ? 'bg-emerald-100 border-emerald-200' : 'bg-emerald-500/20 border-emerald-500/30'}`}>
                  <i className="ri-file-upload-line text-2xl sm:text-3xl text-emerald-500"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-lg sm:text-xl font-bold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('cvs.wantToBeDiscovered')}</h2>
                  <p className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{t('cvs.wantToBeDiscoveredSubtitle')}</p>
                </div>
              </div>
              <button onClick={handleUploadCV} className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
                <i className="ri-upload-2-line"></i>{t('cvs.uploadYourCV')}
              </button>
            </div>
          </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
              <div className={`relative rounded-2xl border p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
                <button onClick={() => setShowUploadModal(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
                  <i className="ri-close-line text-xl"></i>
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-500/20 mx-auto mb-4">
                    <i className="ri-file-user-line text-3xl text-emerald-400"></i>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('cvs.uploadCV')}</h3>
                  <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('cvs.shareCV')}</p>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : uploadedFile
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : isLightMode
                          ? 'border-gray-300 hover:border-emerald-400'
                          : 'border-white/20 hover:border-emerald-500/50'
                  }`}
                >
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-emerald-500/20">
                        <i className="ri-file-text-line text-2xl text-emerald-400"></i>
                      </div>
                      <div className="text-left">
                        <p className={`font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{uploadedFile.name}</p>
                        <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button onClick={() => setUploadedFile(null)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300 cursor-pointer">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  ) : (
                    <>
                      <i className={`ri-upload-cloud-2-line text-5xl mb-4 ${isLightMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
                      <p className={`font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('cvs.dragAndDrop')}</p>
                      <p className={`text-sm mb-4 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('cvs.orClickBrowse')}</p>
                      <label className={`inline-block px-5 py-2.5 font-medium rounded-lg transition-colors cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                        {t('cvs.browseFiles')}
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                      </label>
                      <p className={`text-xs mt-4 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('cvs.supportedFormats')}</p>
                    </>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  >{t('common.cancel')}</button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={!uploadedFile}
                    className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${uploadedFile ? 'bg-emerald-500 text-white hover:bg-emerald-600' : isLightMode ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                  >{t('cvs.uploadCV')}</button>
                </div>
                <p className={`text-center text-xs mt-4 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('cvs.termsAgreement')}</p>
              </div>
            </div>
          )}

          {/* Role Gate Modal */}
          <RoleGateModal
            isOpen={showRoleGateModal}
            onClose={() => setShowRoleGateModal(false)}
            requiredRole="applicant"
            roleLabel="Job Seeker"
            actionLabel={t('cvs.uploadYourCV')}
            onRoleAdded={() => setShowUploadModal(true)}
          />

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-72 flex-shrink-0`}>
              <div className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 lg:sticky lg:top-28 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] thin-scrollbar ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                {/* Applicant Filters Section */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className={`font-semibold flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                      <i className="ri-user-search-line text-purple-400"></i>
                      {t('cvs.applicantFilters')}
                      {activeFiltersCount > 0 && <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">{activeFiltersCount}</span>}
                    </h2>
                    {activeFiltersCount > 0 && (
                      <button onClick={clearAllFilters} className="text-xs text-purple-500 hover:text-purple-400 cursor-pointer whitespace-nowrap">{t('common.clearAll')}</button>
                    )}
                  </div>

                  {/* Location Filter */}
                  <div className="mb-5">
                    <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('cvs.location')}</label>
                    <CustomSelect
                      value={locationFilter}
                      onChange={setLocationFilter}
                      options={[
                        { value: 'all', label: t('cvs.allLocations') },
                        ...locations.map(loc => ({ value: loc, label: loc }))
                      ]}
                      placeholder={t('cvs.allLocations')}
                    />
                  </div>

                  {/* Experience Filter */}
                  <div className="mb-5">
                    <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('cvs.experience')}</label>
                    <CustomSelect
                      value={experienceFilter}
                      onChange={setExperienceFilter}
                      options={[
                        { value: 'all', label: t('common.allLevels') },
                        { value: '0-2', label: t('cvs.years02') },
                        { value: '3-5', label: t('cvs.years35') },
                        { value: '6+', label: t('cvs.years6plus') }
                      ]}
                      placeholder={t('common.allLevels')}
                    />
                  </div>

                  {/* Availability Filter */}
                  <div className="mb-5">
                    <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('cvs.availability')}</label>
                    <div className="space-y-2">
                      {['all', 'Available', 'Busy', 'Not Available'].map(status => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="availability"
                            checked={availabilityFilter === status}
                            onChange={() => setAvailabilityFilter(status)}
                            className="w-4 h-4 accent-purple-500"
                          />
                          <span className={`text-sm transition-colors ${isLightMode ? 'text-gray-600 group-hover:text-gray-900' : 'text-gray-300 group-hover:text-white'}`}>
                            {status === 'all' ? t('common.all') : status === 'Available' ? t('cvs.available') : status === 'Busy' ? t('cvs.busy') : t('cvs.notAvailable')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skills Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>
                      {t('cvs.skills')} {selectedSkills.length > 0 && <span className="text-purple-500">({selectedSkills.length})</span>}
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {allSkills.map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                            selectedSkills.includes(skill)
                              ? 'bg-purple-500 text-white'
                              : isLightMode ? 'bg-gray-100 text-gray-600 hover:text-pink-400 hover:border-pink-400' : 'bg-white/5 text-gray-400 hover:text-pink-400 hover:border-pink-500/30'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className={`backdrop-blur-sm rounded-xl border p-3 sm:p-4 mb-6 ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`lg:hidden flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-white'}`}
                  >
                    <i className="ri-filter-3-line"></i>
                    {showFilters ? t('cvs.hideFilters') : t('cvs.showFilters')}
                    {activeFiltersCount > 0 && <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">{activeFiltersCount}</span>}
                  </button>

                  {/* Search */}
                  <div className="flex-1 relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base"></i>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('cvs.searchPlaceholder')}
                      className={`w-full border rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 focus:outline-none focus:border-purple-500 text-sm ${isLightMode ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
                    />
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`text-xs sm:text-sm whitespace-nowrap ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('cvs.sortBy')}</span>
                    <div className="relative flex-1 sm:flex-initial sm:min-w-[140px]">
                      <CustomSelect
                        value={sortBy}
                        onChange={setSortBy}
                        options={[
                          { value: 'match', label: t('cvs.matchScore') },
                          { value: 'date', label: t('cvs.appliedDate') },
                          { value: 'experience', label: t('cvs.experience') },
                          { value: 'name', label: t('cvs.name') }
                        ]}
                        placeholder={t('cvs.sortBy')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-4">
                <p className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('cvs.showing')} <span className={`font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{sortedCVs.length}</span> {t('cvs.candidates')}
                  {companyFilter !== 'all' && <span className="text-purple-500"> from {companies.find(c => c.id === companyFilter)?.name}</span>}
                  {jobFilter !== 'all' && <span className="text-purple-500"> for {jobs.find(j => j.id === jobFilter)?.title}</span>}
                </p>
                <button onClick={() => setShowFilters(!showFilters)} className={`hidden lg:flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
                  <i className={`ri-layout-${showFilters ? 'right' : 'left'}-2-line`}></i>
                  {showFilters ? t('cvs.hideFilters') : t('cvs.showFilters')}
                </button>
              </div>

              {/* CV List */}
              <div className="space-y-4">
                {sortedCVs.map(cv => (
                  <div
                    key={cv.id}
                    className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 transition-all group ${isLightMode ? 'bg-white border-gray-200 hover:border-purple-400' : 'bg-white/5 border-white/10 hover:border-purple-500/50'}`}
                  >
                    {/* Applied Job Badge */}
                    <div className="mb-3 pb-3 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/20">
                            <i className="ri-briefcase-line text-purple-400 text-sm"></i>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('cvs.appliedFor')} {cv.appliedJob.title}</p>
                            <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{cv.appliedJob.company} • {cv.appliedJob.appliedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Like Button */}
                          <button
                            onClick={() => toggleLikeCV(cv.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${likedCVs.has(cv.id) ? 'bg-pink-500/20 border border-pink-500/30 text-pink-400' : isLightMode ? 'bg-gray-100 border border-gray-200 text-gray-500 hover:text-pink-400 hover:border-pink-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-pink-400 hover:border-pink-500/30'}`}
                          >
                            <i className={`${likedCVs.has(cv.id) ? 'ri-heart-fill' : 'ri-heart-line'} text-sm`}></i>
                            <span className="text-xs font-medium">{likedCVs.has(cv.id) ? 'Liked' : 'Like'}</span>
                          </button>
                          <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${getMatchScoreColor(cv.matchScore)}`}>
                            <span className="text-white font-bold text-sm">{cv.matchScore}%</span>
                            <span className="text-white/80 text-xs ml-1">{t('cvs.match')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                      {/* Avatar */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0 relative">
                        <Link to={`/cv/${cv.id}`} className="block w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all">
                          <img src={cv.avatar} alt={cv.name} className="w-full h-full object-cover" />
                        </Link>
                        {/* Report Flag Button */}
                        <button
                          onClick={() => handleOpenReport(cv.name, cv.avatar)}
                          className={`absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center border rounded-full text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1a1f37] border-white/10'}`}
                          title={t('common.report')}
                        >
                          <i className="ri-flag-line text-xs"></i>
                        </button>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-2">
                          <div className="text-center sm:text-left">
                            <Link to={`/cv/${cv.id}`} className="cursor-pointer hover:underline">
                              <h3 className={`text-base sm:text-lg font-bold group-hover:text-purple-500 transition-colors ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{cv.name}</h3>
                            </Link>
                            <p className="text-purple-500 font-medium text-sm">{cv.title}</p>
                          </div>
                          <div className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium border ${getAvailabilityColor(cv.availability)} mx-auto sm:mx-0`}>
                            {cv.availability === 'Available' ? t('cvs.available') : cv.availability === 'Busy' ? t('cvs.busy') : t('cvs.notAvailable')}
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <i className="ri-map-pin-line"></i>
                            <span className="truncate max-w-[120px] sm:max-w-none">{cv.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="ri-briefcase-line"></i>
                            <span>{cv.experience}</span>
                          </div>
                        </div>

                        {/* Summary */}
                        <p className={`text-xs sm:text-sm mb-4 line-clamp-2 text-center sm:text-left ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{cv.summary}</p>

                        {/* Skills and Action */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 flex-1">
                            {cv.skills.slice(0, 5).map(skill => (
                              <span
                                key={skill}
                                className={`px-2 py-0.5 rounded text-xs ${
                                  selectedSkills.includes(skill)
                                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-500'
                                    : isLightMode ? 'bg-gray-100 border border-gray-200 text-gray-500' : 'bg-white/5 border border-white/10 text-gray-400'
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                            {cv.skills.length > 5 && (
                              <span className={`px-2 py-0.5 rounded text-xs ${isLightMode ? 'bg-gray-100 border border-gray-200 text-gray-400' : 'bg-white/5 border border-white/10 text-gray-500'}`}>
                                +{cv.skills.length - 5}
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/cv/${cv.id}`}
                            className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 text-center"
                          >
                            {t('cvs.viewCV')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {sortedCVs.length === 0 && (
                <div className={`text-center py-12 sm:py-16 rounded-xl border ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full mx-auto mb-4 ${isLightMode ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <i className={`ri-file-search-line text-2xl sm:text-3xl ${isLightMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('cvs.noCVsFound')}</h3>
                  <p className={`text-xs sm:text-sm mb-4 px-4 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('cvs.noCVsSubtitle')}</p>
                  <button onClick={clearAllFilters} className="px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap">
                    {t('cvs.clearAllFilters')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {/* Report Modal */}
      {selectedApplicant && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedApplicant(null);
          }}
          targetName={selectedApplicant.name}
          targetAvatar={selectedApplicant.avatar}
          reporterRole="client"
        />
      )}
    </div>
  );
};

export default PublicCVs;
