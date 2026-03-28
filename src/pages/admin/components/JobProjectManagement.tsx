import { useState } from 'react';

interface Job {
  id: number;
  title: string;
  company: string;
  category: string;
  budget: string;
  status: 'pending' | 'approved' | 'rejected';
  postedDate: string;
  applicants: number;
}

interface Project {
  id: number;
  title: string;
  client: string;
  freelancer: string;
  budget: number;
  paid: number;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  milestones: number;
  completedMilestones: number;
}

const JobProjectManagement = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'projects'>('jobs');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Mock data for jobs
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'Tech Solutions Inc.',
      category: 'Web Development',
      budget: '$80,000 - $120,000',
      status: 'pending',
      postedDate: '2024-03-15',
      applicants: 24,
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'Creative Agency',
      category: 'Design',
      budget: '$60,000 - $90,000',
      status: 'approved',
      postedDate: '2024-03-14',
      applicants: 18,
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'StartUp Co.',
      category: 'Web Development',
      budget: '$70,000 - $100,000',
      status: 'pending',
      postedDate: '2024-03-13',
      applicants: 32,
    },
    {
      id: 4,
      title: 'Marketing Manager',
      company: 'Growth Marketing',
      category: 'Marketing',
      budget: '$65,000 - $85,000',
      status: 'rejected',
      postedDate: '2024-03-12',
      applicants: 15,
    },
  ]);

  // Mock data for projects
  const [projects] = useState<Project[]>([
    {
      id: 1,
      title: 'E-commerce Website Development',
      client: 'John Smith',
      freelancer: 'Sarah Johnson',
      budget: 5000,
      paid: 3000,
      status: 'active',
      progress: 60,
      milestones: 5,
      completedMilestones: 3,
    },
    {
      id: 2,
      title: 'Mobile App Design',
      client: 'David Wilson',
      freelancer: 'Emily Davis',
      budget: 3500,
      paid: 3500,
      status: 'completed',
      progress: 100,
      milestones: 4,
      completedMilestones: 4,
    },
    {
      id: 3,
      title: 'Brand Identity Package',
      client: 'Michael Chen',
      freelancer: 'Alex Turner',
      budget: 2000,
      paid: 1000,
      status: 'active',
      progress: 50,
      milestones: 3,
      completedMilestones: 1,
    },
    {
      id: 4,
      title: 'SEO Optimization',
      client: 'Sarah Johnson',
      freelancer: 'John Smith',
      budget: 1500,
      paid: 0,
      status: 'cancelled',
      progress: 20,
      milestones: 3,
      completedMilestones: 0,
    },
  ]);

  const approveJob = (jobId: number) => {
    setJobs(jobs.map(job => job.id === jobId ? { ...job, status: 'approved' } : job));
    setShowJobModal(false);
  };

  const rejectJob = (jobId: number) => {
    setJobs(jobs.map(job => job.id === jobId ? { ...job, status: 'rejected' } : job));
    setShowJobModal(false);
  };

  const viewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const viewProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        {/* Jobs Tab Button */}
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-teal-500 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <i className="ri-briefcase-line mr-2"></i>
          Job Posts
        </button>

        {/* Projects Tab Button */}
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-teal-500 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <i className="ri-folder-open-line mr-2"></i>
          Projects
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Job Posts Management</h2>
            <p className="text-white/60 text-sm mt-1">Review and approve job postings</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Job Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Budget</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Job Seekers</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{job.title}</span>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">{job.company}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold whitespace-nowrap">
                        {job.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">{job.budget}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          job.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : job.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">{job.applicants}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewJobDetails(job)}
                        className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-all cursor-pointer whitespace-nowrap text-sm font-semibold"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>
                      <i className="ri-user-line mr-1"></i>
                      Client: {project.client}
                    </span>
                    <span>
                      <i className="ri-briefcase-line mr-1"></i>
                      Freelancer: {project.freelancer}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                    project.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : project.status === 'completed'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Budget</p>
                  <p className="text-white font-bold text-lg">${project.budget}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Paid</p>
                  <p className="text-green-400 font-bold text-lg">${project.paid}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Remaining</p>
                  <p className="text-orange-400 font-bold text-lg">${project.budget - project.paid}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Milestones</p>
                  <p className="text-white font-bold text-lg">
                    {project.completedMilestones}/{project.milestones}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Progress</span>
                  <span className="text-white font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => viewProjectDetails(project)}
                className="w-full py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-semibold cursor-pointer whitespace-nowrap"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Job Review</h3>
              <button
                onClick={() => setShowJobModal(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{selectedJob.title}</h4>
                <p className="text-white/60">{selectedJob.company}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Category</p>
                  <p className="text-white font-semibold">{selectedJob.category}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Budget</p>
                  <p className="text-white font-semibold">{selectedJob.budget}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Posted Date</p>
                  <p className="text-white font-semibold">{selectedJob.postedDate}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Job Seekers</p>
                  <p className="text-white font-semibold">{selectedJob.applicants}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-1">Current Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    selectedJob.status === 'approved'
                      ? 'bg-green-500/20 text-green-400'
                      : selectedJob.status === 'rejected'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}
                >
                  {selectedJob.status}
                </span>
              </div>

              {selectedJob.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approveJob(selectedJob.id)}
                    className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-check-line mr-2"></i>
                    Approve Job
                  </button>
                  <button
                    onClick={() => rejectJob(selectedJob.id)}
                    className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Reject Job
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Project Details</h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{selectedProject.title}</h4>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>Client: {selectedProject.client}</span>
                  <span>Freelancer: {selectedProject.freelancer}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Total Budget</p>
                  <p className="text-white font-bold text-lg">${selectedProject.budget}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Amount Paid</p>
                  <p className="text-green-400 font-bold text-lg">${selectedProject.paid}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Remaining</p>
                  <p className="text-orange-400 font-bold text-lg">${selectedProject.budget - selectedProject.paid}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      selectedProject.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : selectedProject.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {selectedProject.status}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Overall Progress</span>
                  <span className="text-white font-semibold">{selectedProject.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all"
                    style={{ width: `${selectedProject.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-2">Milestones</p>
                <p className="text-white font-bold text-2xl">
                  {selectedProject.completedMilestones} / {selectedProject.milestones}
                </p>
                <p className="text-white/60 text-sm mt-1">milestones completed</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobProjectManagement;