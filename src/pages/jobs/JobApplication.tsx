
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const JobApplication = () => {
  const { jobId } = useParams();
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    expectedSalary: '',
    availableDate: '',
    yearsExperience: ''
  });

  // Mock job data
  const job = {
    id: jobId || '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    companyLogo: 'https://readdy.ai/api/search-image?query=modern%20tech%20company%20logo%20minimalist%20design%20with%20letter%20T%20in%20teal%20gradient%20on%20white%20background%20clean%20corporate%20branding&width=100&height=100&seq=jobapp1&orientation=squarish',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $160k',
    experience: '5+ years',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    postedDate: '2 days ago',
    description: 'We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building and maintaining our web applications using React and TypeScript.',
    applicants: 45
  };

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
      if (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        setUploadedCV(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedCV(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedCV) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
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
                Your application for <span className="text-white font-semibold">{job.title}</span> at{' '}
                <span className="text-purple-400">{job.company}</span> has been successfully submitted.
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
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>

            {/* Personal Information */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <i className="ri-user-3-line text-purple-400"></i>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="linkedin.com/in/johndoe"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    placeholder="www.johndoe.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Years of Experience <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1a1f37] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="" className="bg-[#1a1f37]">Select experience</option>
                    <option value="0-1" className="bg-[#1a1f37]">0-1 years</option>
                    <option value="1-3" className="bg-[#1a1f37]">1-3 years</option>
                    <option value="3-5" className="bg-[#1a1f37]">3-5 years</option>
                    <option value="5-7" className="bg-[#1a1f37]">5-7 years</option>
                    <option value="7+" className="bg-[#1a1f37]">7+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Expected Salary
                  </label>
                  <input
                    type="text"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                    placeholder="$120,000 - $150,000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Available Start Date
                  </label>
                  <input
                    type="date"
                    name="availableDate"
                    value={formData.availableDate}
                    onChange={handleInputChange}
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
                disabled={!uploadedCV || isSubmitting}
                className={`px-8 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                  uploadedCV && !isSubmitting
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
