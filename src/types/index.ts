export type UserRole = 'freelancer' | 'client' | 'employer' | 'applicant' | 'learner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  avatar?: string;
  createdAt: string;
  // Role-specific IDs from API
  jobSeekerId?: string | null;
  employerId?: string | null;
  learnerId?: string | null;
  clientId?: string | null;
  freeLancerId?: string | null;
  refreshTokenExpiration?: string | null;
}

export interface FreelancerProfile {
  userId: string;
  portfolio: PortfolioItem[];
  documents: Document[];
  rating: number;
  completedProjects: number;
  skills: string[];
  bio: string;
  hourlyRate?: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  completedDate: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface ApplicantProfile {
  userId: string;
  cvUrl: string;
  cvFormat: 'standard' | 'custom';
  skills: string[];
  experience: string;
  education: string;
}

export interface EmployerProfile {
  userId: string;
  companies: Company[];
  postedJobs: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  documents: Document[];
  logo?: string;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  applicants: TaskApplicant[];
  assignedFreelancerId?: string;
  createdAt: string;
}

export interface TaskApplicant {
  freelancerId: string;
  freelancerName: string;
  freelancerRating: number;
  proposal: string;
  appliedAt: string;
}

export interface Project {
  id: string;
  taskId: string;
  clientId: string;
  freelancerId: string;
  title: string;
  totalBudget: number;
  milestones: Milestone[];
  status: 'planning' | 'in-progress' | 'completed';
  clientRating?: number;
  freelancerRating?: number;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected' | 'paid';
  submittedAt?: string;
  clientComment?: string;
  deliverables?: string[];
}

export interface JobPosting {
  id: string;
  employerId: string;
  companyName: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  deadline: string;
  status: 'open' | 'closed' | 'filtering';
  applications: JobApplication[];
  createdAt: string;
}

export interface JobApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  cvUrl: string;
  coverLetter: string;
  matchScore?: number;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
  progress: number;
  createdAt: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  resources: string[];
  completed: boolean;
  order: number;
}
