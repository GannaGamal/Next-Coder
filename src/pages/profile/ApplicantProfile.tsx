import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProfilePhotoModal from '../../components/feature/ProfilePhotoModal';
import ContactInfoModal from '../../components/feature/ContactInfoModal';
import type { ContactInfo } from '../../components/feature/ContactInfoModal';
import useProfilePhoto from '../../hooks/useProfilePhoto';
import {
  buildJobSeekerImageUrl,
  canCurrentUserEditJobSeekerProfile,
  getJobSeekerProfile,
  updateJobSeekerProfile,
} from '../../services/job-seeker-profile.service';
import {
  downloadCvById,
  getJobSeekerCv,
  replaceCurrentUserCv,
  toggleCvPrivacy,
  viewCvById,
  type PublicCvInfo,
} from '../../services/public-cv.service';

const NOT_PROVIDED = 'Not provided';

const getDisplayValue = (value: string): string => {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : NOT_PROVIDED;
};

const formatCvDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) {
    return 'Unknown upload date';
  }

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown upload date';
  }

  return parsed.toLocaleDateString();
};

const ApplicantProfile = () => {
  const { user, updateUser } = useAuth();
  const { jobSeekerId: routeJobSeekerId } = useParams<{ jobSeekerId?: string }>();
  const [cvInfo, setCvInfo] = useState<PublicCvInfo | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvPrivacyUpdating, setCvPrivacyUpdating] = useState(false);
  const [cvError, setCvError] = useState('');
  const [cvSuccessMessage, setCvSuccessMessage] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  const [profileOwnerId, setProfileOwnerId] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phoneNumber: '',
    address: '',
    websiteUrl: '',
    gitHubUrl: '',
    experience: '',
    education: '',
  });

  const [profile, setProfile] = useState({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    skills: ['JavaScript', 'React', 'Python', 'SQL', 'Git'],
  });

  const [newSkill, setNewSkill] = useState('');

  const viewedJobSeekerId = String(routeJobSeekerId ?? user?.jobSeekerId ?? '').trim();
  const loggedInJobSeekerId = String(user?.jobSeekerId ?? '').trim();
  const hasJobSeekerRole = Array.isArray(user?.roles)
    ? user.roles.some((role) => String(role).toLowerCase().trim() === 'applicant')
    : false;

  const canEditProfile = canCurrentUserEditJobSeekerProfile(profileOwnerId || viewedJobSeekerId);
  const canToggleCvPrivacy = canEditProfile && hasJobSeekerRole;
  const isReadOnlyView = !canEditProfile;

  const loadProfile = async () => {
    if (!viewedJobSeekerId) {
      setProfileError('No job seeker ID was provided to load this profile.');
      return;
    }

    setProfileLoading(true);
    setProfileError('');

    try {
      const data = await getJobSeekerProfile(viewedJobSeekerId);

      const ownerId = String(data.id ?? viewedJobSeekerId).trim();
      setProfileOwnerId(ownerId);

      setProfile((prev) => ({
        ...prev,
        fullName: String(data.fullName ?? '').trim(),
        email: String(data.email ?? '').trim(),
      }));

      setContactInfo({
        phoneNumber: String(data.phoneNumber ?? '').trim(),
        address: String(data.address ?? '').trim(),
        websiteUrl: String(data.websiteUrl ?? '').trim(),
        gitHubUrl: String(data.gitHubUrl ?? '').trim(),
        experience: String(data.experience ?? ''),
        education: String(data.education ?? ''),
      });

      setImageLoadFailed(false);
      setProfileImageUrl(buildJobSeekerImageUrl(data.imageUrl));

      const updatedName = String(data.fullName ?? '').trim();
      const updatedEmail = String(data.email ?? '').trim();
      if (updatedName || updatedEmail) {
        updateUser({
          ...(updatedName ? { name: updatedName } : {}),
          ...(updatedEmail ? { email: updatedEmail } : {}),
        });
      }
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'We could not load your profile right now. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    void loadCv();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedJobSeekerId]);

  useEffect(() => {
    if (!profileSuccessMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setProfileSuccessMessage(''), 2500);
    return () => window.clearTimeout(timeout);
  }, [profileSuccessMessage]);

  useEffect(() => {
    if (!cvSuccessMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setCvSuccessMessage(''), 2500);
    return () => window.clearTimeout(timeout);
  }, [cvSuccessMessage]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const loadCv = async () => {
    if (!viewedJobSeekerId) {
      setCvInfo(null);
      setCvError('');
      return;
    }

    setCvLoading(true);
    setCvError('');

    try {
      const currentCv = await getJobSeekerCv(viewedJobSeekerId);
      setCvInfo(currentCv);
    } catch (err: unknown) {
      setCvInfo(null);
      setCvError(err instanceof Error ? err.message : 'We could not load CV data right now. Please try again.');
    } finally {
      setCvLoading(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0] ?? null;
    input.value = '';

    if (!file) {
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setCvError('Only PDF files are allowed for CV upload.');
      return;
    }

    setCvUploading(true);
    setCvError('');
    setCvSuccessMessage('');

    try {
      await replaceCurrentUserCv(file, profileOwnerId || viewedJobSeekerId);
      setCvSuccessMessage(cvInfo ? 'CV replaced successfully.' : 'CV uploaded successfully.');
      await loadCv();
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : 'We could not upload your CV right now. Please try again.');
    } finally {
      setCvUploading(false);
    }
  };

  const handleViewCv = async () => {
    if (!cvInfo?.id) {
      return;
    }

    setCvError('');
    try {
      await viewCvById(cvInfo.id);
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : 'We could not open this CV right now. Please try again.');
    }
  };

  const handleDownloadCv = async () => {
    if (!cvInfo?.id) {
      return;
    }

    setCvError('');
    try {
      await downloadCvById(cvInfo.id, cvInfo.fileName);
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : 'We could not download this CV right now. Please try again.');
    }
  };

  const handleCvPrivacyToggle = async () => {
    if (!cvInfo?.id) {
      return;
    }

    if (!canToggleCvPrivacy) {
      setCvError('Only the CV owner can update CV privacy.');
      return;
    }

    setCvError('');
    setCvSuccessMessage('');

    const isCurrentlyPublic = Boolean(cvInfo.isPublic);
    let jobTitle: string | null | undefined = cvInfo.jobTitle ?? '';

    if (!isCurrentlyPublic) {
      const promptValue = window.prompt('Enter the job title for this CV:', jobTitle ?? '');
      if (!promptValue || !promptValue.trim()) {
        setCvError('Job title is required to make the CV public.');
        return;
      }
      jobTitle = promptValue.trim();
    } else {
      jobTitle = undefined;
    }

    setCvPrivacyUpdating(true);

    try {
      const updatedCv = await toggleCvPrivacy(cvInfo.id, jobTitle);
      const nextIsPublic = !isCurrentlyPublic;
      setCvInfo((prev) => {
        if (!prev) {
          return prev;
        }
        return updatedCv ?? {
          ...prev,
          isPublic: nextIsPublic,
          jobTitle: nextIsPublic ? (jobTitle ?? prev.jobTitle ?? null) : prev.jobTitle ?? null,
        };
      });
      setCvSuccessMessage(nextIsPublic ? 'CV is now public.' : 'CV is now private.');
      window.dispatchEvent(new Event('public-cv-updated'));
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : 'We could not update CV privacy right now. Please try again.');
    } finally {
      setCvPrivacyUpdating(false);
    }
  };

  const { handlePhotoUpload, handlePhotoRemove } = useProfilePhoto();

  const handleSaveContact = async (updatedContactInfo: ContactInfo) => {
    if (!hasJobSeekerRole) {
      throw new Error('Only job seekers can edit job seeker profiles.');
    }

    if (!canCurrentUserEditJobSeekerProfile(profileOwnerId || viewedJobSeekerId)) {
      throw new Error('You can only edit your own profile.');
    }

    await updateJobSeekerProfile(updatedContactInfo, profileOwnerId || viewedJobSeekerId);

    setProfileSuccessMessage('Profile updated successfully');
    await loadProfile();
  };

  const headerName = getDisplayValue(profile.fullName || user?.name || '');
  const headerEmail = getDisplayValue(profile.email || user?.email || '');

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      
      <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            {(profileLoading || profileError || profileSuccessMessage) && (
              <div className={`mb-4 p-3 rounded-lg text-sm border ${profileError ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'}`}>
                {profileLoading ? 'Loading your profile...' : profileError || profileSuccessMessage}
              </div>
            )}
            {isReadOnlyView && (
              <div className="mb-4 p-3 rounded-lg text-sm border bg-yellow-500/10 border-yellow-500/30 text-yellow-300">
                {hasJobSeekerRole && loggedInJobSeekerId
                  ? 'You can view this profile, but only the profile owner can edit it.'
                  : 'Read-only mode. Only job seekers can edit their own profiles.'}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div 
                onClick={() => canEditProfile && setShowPhotoModal(true)}
                className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex-shrink-0 relative group ${canEditProfile ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {profileImageUrl && !imageLoadFailed ? (
                  <img
                    src={profileImageUrl}
                    alt={headerName}
                    onError={() => setImageLoadFailed(true)}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <i className="ri-user-line text-4xl sm:text-5xl lg:text-6xl text-white"></i>
                )}
                {canEditProfile && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <i className="ri-camera-line text-2xl text-white"></i>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{headerName}</h1>
                  {canEditProfile && (
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-edit-line"></i>
                      Edit Contact
                    </button>
                  )}
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-3 break-all">{headerEmail}</p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                    <i className="ri-phone-line text-pink-400"></i>{getDisplayValue(contactInfo.phoneNumber)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                    <i className="ri-map-pin-line text-pink-400"></i>{getDisplayValue(contactInfo.address)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                    <i className="ri-github-fill text-pink-400"></i>{getDisplayValue(contactInfo.gitHubUrl)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                    <i className="ri-global-line text-pink-400"></i>{getDisplayValue(contactInfo.websiteUrl)}
                  </span>
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
            {(cvLoading || cvError || cvSuccessMessage) && (
              <div className={`mb-4 p-3 rounded-lg text-sm border ${cvError ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'}`}>
                {cvLoading ? 'Loading CV...' : cvError || cvSuccessMessage}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm text-gray-400 mb-3">Current CV</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg bg-pink-500/20 flex-shrink-0">
                    <i className="ri-file-pdf-line text-2xl sm:text-3xl text-pink-400"></i>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base text-white font-semibold">{cvInfo?.fileName || 'No CV uploaded yet'}</h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {cvInfo
                        ? `Uploaded on ${formatCvDate(cvInfo.uploadedAt)}`
                        : 'Upload your CV as a PDF file.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleViewCv}
                    disabled={!cvInfo?.id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <i className="ri-eye-line mr-2"></i>View
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCv}
                    disabled={!cvInfo?.id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <i className="ri-download-line mr-2"></i>Download
                  </button>
                  {canToggleCvPrivacy && (
                    <button
                      type="button"
                      onClick={handleCvPrivacyToggle}
                      disabled={!cvInfo?.id || cvPrivacyUpdating || cvLoading}
                      className="flex-1 sm:flex-none px-4 py-2 bg-pink-500/20 text-pink-200 text-sm rounded-lg hover:bg-pink-500/30 transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <i className="ri-lock-line mr-2"></i>
                      {cvPrivacyUpdating
                        ? 'Updating...'
                        : cvInfo?.isPublic
                          ? 'Make CV Private'
                          : 'Make CV Public'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {canEditProfile ? (
              <div>
                <h3 className="text-sm text-gray-400 mb-3">Upload Updated CV</h3>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 sm:p-8 text-center hover:border-pink-500/50 transition-all">
                  <i className="ri-upload-cloud-line text-4xl sm:text-5xl text-gray-400 mb-3"></i>
                  <h4 className="text-base sm:text-lg text-white font-semibold mb-2">Replace Your CV (PDF)</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    {cvInfo ? 'Uploading a new PDF will replace your current CV.' : 'Upload your first CV as a PDF file.'}
                  </p>
                  <label className={`inline-block px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-pink-600 transition-colors whitespace-nowrap ${cvUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                    {cvUploading ? 'Uploading...' : cvInfo ? 'Replace CV' : 'Upload CV'}
                    <input type="file" accept="application/pdf,.pdf" onChange={handleCvUpload} className="hidden" disabled={cvUploading} />
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Only the profile owner can replace this CV.</p>
            )}
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
                {canEditProfile && (
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Edit
                  </button>
                )}
              </div>
              {contactInfo.experience.trim().length > 0 ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line">{contactInfo.experience}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Not provided</p>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Education</h2>
                {canEditProfile && (
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Edit
                  </button>
                )}
              </div>
              {contactInfo.education.trim().length > 0 ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line">{contactInfo.education}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Not provided</p>
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
        currentPhoto={profileImageUrl ?? user?.avatar}
        userName={headerName}
        onUpload={handlePhotoUpload}
        onRemove={handlePhotoRemove}
        accentColor="pink"
      />

      <ContactInfoModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contactInfo={contactInfo}
        onSave={handleSaveContact}
        accentColor="pink"
      />
    </div>
  );
};

export default ApplicantProfile;
