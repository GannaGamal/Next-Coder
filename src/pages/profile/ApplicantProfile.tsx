import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProfilePhotoModal from '../../components/feature/ProfilePhotoModal';
import ContactInfoModal, { ContactInfo } from '../../components/feature/ContactInfoModal';
import useProfilePhoto from '../../hooks/useProfilePhoto';

const ApplicantProfile = () => {
  const { user, updateUser } = useAuth();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const [originalCv] = useState({
    name: 'John_Doe_Resume_2024.pdf',
    uploadedAt: '2024-01-05',
    size: 245
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
    website: '',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    twitter: '',
    experience: '3 years of experience in software development, working on full-stack web applications using React, Node.js and PostgreSQL.',
    education: 'Bachelor of Computer Science, University of Technology (2018–2022). Graduated with honors.',
  });

  const [profile, setProfile] = useState({
    skills: ['JavaScript', 'React', 'Python', 'SQL', 'Git'],
  });

  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setCvFile(file);
    }
  };

  const { handlePhotoUpload, handlePhotoRemove } = useProfilePhoto();

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      
      <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div 
                onClick={() => setShowPhotoModal(true)}
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex-shrink-0 cursor-pointer relative group"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <i className="ri-user-line text-4xl sm:text-5xl lg:text-6xl text-white"></i>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i className="ri-camera-line text-2xl text-white"></i>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{user?.name}</h1>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Edit Contact
                  </button>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 break-all">{user?.email}</p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {contactInfo.phone && (
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                      <i className="ri-phone-line text-pink-400"></i>{contactInfo.phone}
                    </span>
                  )}
                  {contactInfo.location && (
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                      <i className="ri-map-pin-line text-pink-400"></i>{contactInfo.location}
                    </span>
                  )}
                  {contactInfo.linkedin && (
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                      <i className="ri-linkedin-box-line text-pink-400"></i>{contactInfo.linkedin}
                    </span>
                  )}
                  {contactInfo.github && (
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                      <i className="ri-github-fill text-pink-400"></i>{contactInfo.github}
                    </span>
                  )}
                  {contactInfo.website && (
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                      <i className="ri-global-line text-pink-400"></i>{contactInfo.website}
                    </span>
                  )}
                  {contactInfo.twitter && (
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                      <i className="ri-twitter-x-line text-pink-400"></i>{contactInfo.twitter}
                    </span>
                  )}
                </div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-dashboard-line text-pink-400 text-lg"></i>
                  <span className="text-sm text-pink-300 font-semibold">View Applied Jobs Dashboard</span>
                  <i className="ri-arrow-right-line text-pink-400 text-sm"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* CV Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">My CV</h2>

            <div className="mb-6">
              <h3 className="text-sm text-gray-400 mb-3">Current CV</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg bg-pink-500/20 flex-shrink-0">
                    <i className="ri-file-pdf-line text-2xl sm:text-3xl text-pink-400"></i>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base text-white font-semibold">{cvFile ? cvFile.name : originalCv.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {cvFile 
                        ? `${(cvFile.size / 1024).toFixed(2)} KB • Just uploaded`
                        : `${originalCv.size} KB • Uploaded on ${originalCv.uploadedAt}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-eye-line mr-2"></i>View
                  </button>
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-download-line mr-2"></i>Download
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-3">Upload Updated CV</h3>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 sm:p-8 text-center hover:border-pink-500/50 transition-all">
                <i className="ri-upload-cloud-line text-4xl sm:text-5xl text-gray-400 mb-3"></i>
                <h4 className="text-base sm:text-lg text-white font-semibold mb-2">Replace Your CV (PDF)</h4>
                <p className="text-sm text-gray-400 mb-4">Drag and drop or click to browse</p>
                <label className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-pink-600 transition-colors whitespace-nowrap cursor-pointer">
                  Upload Updated CV
                  <input type="file" accept=".pdf" onChange={handleCvUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
              {profile.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2"
                >
                  <span className="text-sm sm:text-base text-white font-medium">{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-white hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-sm sm:text-base"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                placeholder="Add a skill..."
              />
              <button
                onClick={handleAddSkill}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-pink-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Experience</h2>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line"></i>
                  Edit
                </button>
              </div>
              {contactInfo.experience ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{contactInfo.experience}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No experience added yet. Click Edit to add yours.</p>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Education</h2>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line"></i>
                  Edit
                </button>
              </div>
              {contactInfo.education ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{contactInfo.education}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No education added yet. Click Edit to add yours.</p>
              )}
            </div>
          </div>

          {/* Password & Security moved to Settings page */}
        </div>
      </div>

      <Footer />

      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentPhoto={user?.avatar}
        userName={user?.name}
        onUpload={handlePhotoUpload}
        onRemove={handlePhotoRemove}
        accentColor="pink"
      />

      <ContactInfoModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contactInfo={contactInfo}
        onSave={setContactInfo}
        accentColor="pink"
      />
    </div>
  );
};

export default ApplicantProfile;
