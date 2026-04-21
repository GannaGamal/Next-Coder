
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { createJobApplication } from '../../services/job-application.service';
import { getJobPosts, type JobPostItem } from '../../services/job-post.service';

interface JobSummary {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  applicants: number;
}

const JobApplication = () => {
  const { jobId } = useParams();
  const todayLocalIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fileError, setFileError] = useState('');
  const [job, setJob] = useState<JobSummary | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [jobLoadError, setJobLoadError] = useState('');
  const [formData, setFormData] = useState({
    seekerTitle: '',
    availableDate: '',
    yearsExperience: '',
    minExpectedSalary: '',
    maxExpectedSalary: '',
  });

  const mapApiJobToSummary = (item: JobPostItem): JobSummary => {
    const hasMin = typeof item.minSalary === 'number';
    const hasMax = typeof item.maxSalary === 'number';
    const salary = hasMin && hasMax
      ? `$${item.minSalary!.toLocaleString()} - $${item.maxSalary!.toLocaleString()}`
      : hasMin
        ? `From $${item.minSalary!.toLocaleString()}`
        : hasMax
          ? `Up to $${item.maxSalary!.toLocaleString()}`
          : 'Not specified';

    return {
      id: String(item.id),
      title: item.title,
      company: item.companyName,
      companyLogo: 'https://readdy.ai/api/search-image?query=modern%20company%20logo%20minimalist%20clean%20branding%20on%20white%20background&width=100&height=100&seq=job-app-real&orientation=squarish',
      location: item.location || 'Remote',
      type: item.jobType || 'Not specified',
      salary,
      experience: item.experienceLevel || 'Not specified',
      applicants: item.jobSeekersCount ?? 0,
    };
  };

  useEffect(() => {
    const loadJob = async () => {
      setIsLoadingJob(true);
      setJobLoadError('');

      const numericJobId = Number(jobId);
      if (!Number.isFinite(numericJobId) || numericJobId <= 0) {
        setJob(null);
        setJobLoadError('Invalid job id in URL. Please open application from the jobs list.');
        setIsLoadingJob(false);
        return;
      }

      try {
        const result = await getJobPosts();
        const matched = result.items.find((item) => item.id === numericJobId);

        if (!matched) {
          setJob(null);
          setJobLoadError('Job not found or no longer available.');
        } else {
          setJob(mapApiJobToSummary(matched));
        }
      } catch (err: unknown) {
        setJob(null);
        setJobLoadError(err instanceof Error ? err.message : 'We could not load job details right now. Please try again.');
      } finally {
        setIsLoadingJob(false);
      }
    };

    loadJob();
  }, [jobId]);

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
      const file = e.dataTransfer.files[0];
      const isSupported = file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx');
      if (!isSupported) {
        setFileError('Please upload PDF, DOC, or DOCX file only.');
        return;
      }

      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setFileError('CV file is too large. Maximum allowed size is 5MB.');
        return;
      }

      setFileError('');
      setUploadedCV(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isSupported = file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx');
      if (!isSupported) {
        setFileError('Please upload PDF, DOC, or DOCX file only.');
        return;
      }

      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setFileError('CV file is too large. Maximum allowed size is 5MB.');
        return;
      }

      setFileError('');
      setUploadedCV(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!uploadedCV) {
      setFileError('CV file is required.');
      return;
    }

    const numericJobId = Number(jobId);
    if (!Number.isFinite(numericJobId) || numericJobId <= 0) {
      setSubmitError('Invalid job id. Please open this page from a valid job offer.');
      return;
    }

    if (!job) {
      setSubmitError('Cannot submit because job details are not loaded.');
      return;
    }

    const yearsOfExperience = Number(formData.yearsExperience);
    if (!Number.isFinite(yearsOfExperience) || yearsOfExperience < 0 || !Number.isInteger(yearsOfExperience)) {
      setSubmitError('Years of experience must be a non-negative whole number.');
      return;
    }

    const minExpectedSalary = formData.minExpectedSalary ? Number(formData.minExpectedSalary) : undefined;
    const maxExpectedSalary = formData.maxExpectedSalary ? Number(formData.maxExpectedSalary) : undefined;

    if (typeof minExpectedSalary === 'number' && !Number.isFinite(minExpectedSalary)) {
      setSubmitError('Minimum expected salary must be a valid number.');
      return;
    }

    if (typeof maxExpectedSalary === 'number' && !Number.isFinite(maxExpectedSalary)) {
      setSubmitError('Maximum expected salary must be a valid number.');
      return;
    }

    if (
      typeof minExpectedSalary === 'number' &&
      typeof maxExpectedSalary === 'number' &&
      minExpectedSalary > maxExpectedSalary
    ) {
      setSubmitError('Minimum expected salary cannot be greater than maximum expected salary.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createJobApplication({
        jobPostId: numericJobId,
        yearsOfExperience,
        availableStartDate: formData.availableDate ? new Date(formData.availableDate).toISOString() : undefined,
        minExpectedSalary,
        maxExpectedSalary,
        coverLetter: coverLetter.trim() || undefined,
        seekerTitle: formData.seekerTitle.trim() || undefined,
        cvFile: uploadedCV,
      });

      setIsSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'We could not submit your application right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'Part-time': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'Contract': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      case 'Remote': return 'text-teal-400 bg-teal-400/10 border-teal-400/30';
      case 'Internship': return 'text-pink-400 bg-pink-400/10 border-pink-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#1a1f37]">
        <Navbar />
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 sm:p-12">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <i className="ri-check-line text-4xl text-emerald-400"></i>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Application Submitted!</h1>
              <p className="text-gray-400 mb-8">
                Your application for <span className="text-white font-semibold">{job?.title ?? 'this job'}</span> at{' '}
                <span className="text-purple-400">{job?.company ?? 'this company'}</span> has been successfully submitted.
              </p>
              <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
                <h3 className="text-white font-semibold mb-4">What happens next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-xs font-bold">1</span>
                    </div>
                    The hiring team will review your application within 3-5 business days.
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-xs font-bold">2</span>
                    </div>
                    If your profile matches, you will receive an email to schedule an interview.
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-xs font-bold">3</span>
                    </div>
                    You can track your application status in your dashboard.
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/jobs"
                  className="px-6 py-3 bg-white/5 text-white font-semibold rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Browse More Jobs
                </Link>
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f37]">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            Back to Jobs
          </Link>

          {/* Job Summary Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
            {isLoadingJob && (
              <p className="text-sm text-blue-300">Loading real job details...</p>
            )}

            {!isLoadingJob && jobLoadError && (
              <p className="text-sm text-red-300">{jobLoadError}</p>
            )}

            {!isLoadingJob && !jobLoadError && job && (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 mx-auto sm:mx-0">
                  <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">{job.title}</h1>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getTypeColor(job.type)} mx-auto sm:mx-0`}>
                      {job.type}
                    </span>
                  </div>
                  <p className="text-purple-400 font-medium mb-3">{job.company}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <i className="ri-map-pin-line"></i>
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-money-dollar-circle-line"></i>
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-briefcase-line"></i>
                      {job.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-user-line"></i>
                      {job.applicants} job seekers
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 text-sm">
                {submitError}
              </div>
            )}

            {/* CV Upload Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <i className="ri-file-user-line text-purple-400"></i>
                Upload Your CV
                <span className="text-red-400">*</span>
              </h2>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : uploadedCV
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-white/20 hover:border-purple-500/50'
                }`}
              >
                {uploadedCV ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-emerald-500/20">
                      <i className="ri-file-text-line text-3xl text-emerald-400"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">{uploadedCV.name}</p>
                      <p className="text-gray-400 text-sm">{(uploadedCV.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedCV(null)}
                      className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-xl"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-500/20 mx-auto mb-4">
                      <i className="ri-upload-cloud-2-line text-3xl text-purple-400"></i>
                    </div>
                    <p className="text-white font-semibold mb-2">Drag & drop your CV here</p>
                    <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
                    <label className="inline-block px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap">
                      <i className="ri-folder-open-line mr-2"></i>
                      Browse Files
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-xs mt-4">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                  </>
                )}
              </div>
              {fileError && (
                <p className="text-red-300 text-xs mt-3">{fileError}</p>
              )}
            </div>

            {/* API Parameters */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <i className="ri-user-3-line text-purple-400"></i>
                Application Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    name="seekerTitle"
                    value={formData.seekerTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Frontend Developer"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Years of Experience <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 3"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Minimum Expected Salary
                  </label>
                  <input
                    type="number"
                    name="minExpectedSalary"
                    value={formData.minExpectedSalary}
                    onChange={handleInputChange}
                    placeholder="120000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Maximum Expected Salary
                  </label>
                  <input
                    type="number"
                    name="maxExpectedSalary"
                    value={formData.maxExpectedSalary}
                    onChange={handleInputChange}
                    placeholder="150000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">
                    Available Start Date
                  </label>
                  <input
                    type="date"
                    name="availableDate"
                    value={formData.availableDate}
                    onChange={handleInputChange}
                    min={todayLocalIso}
                    className="w-full bg-[#1a1f37] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <i className="ri-file-text-line text-purple-400"></i>
                Cover Letter
              </h2>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value.slice(0, 500))}
                placeholder="Tell us why you're the perfect fit for this role..."
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              ></textarea>
              <div className="flex justify-end mt-2">
                <span className={`text-xs ${coverLetter.length >= 500 ? 'text-red-400' : 'text-gray-500'}`}>
                  {coverLetter.length}/500 characters
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Link
                to="/jobs"
                className="px-6 py-3 bg-white/5 text-white font-semibold rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!uploadedCV || isSubmitting || isLoadingJob || !job || !!jobLoadError}
                className={`px-8 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                  uploadedCV && !isSubmitting && !isLoadingJob && !!job && !jobLoadError
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line"></i>
                    Submit Application
                  </>
                )}
              </button>
            </div>

            {/* Notice */}
            <p className="text-center text-gray-500 text-sm">
              By submitting this application, you agree to our{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300 cursor-pointer">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300 cursor-pointer">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobApplication;
