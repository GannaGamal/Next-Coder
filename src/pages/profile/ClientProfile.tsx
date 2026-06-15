import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProfilePhotoModal from '../../components/feature/ProfilePhotoModal';
import ClientEditModal from '../../components/feature/ClientEditModal';
import type { ClientEditData } from '../../components/feature/ClientEditModal';
import useProfilePhoto from '../../hooks/useProfilePhoto';
import {
  getClientProfile,
  getClientReports,
  updateClientProfile,
  type ClientProfileDto,
  type ClientReport,
} from '../../services/client.service';

const ClientProfile = () => {
  const { user } = useAuth();
  const { handlePhotoUpload, handlePhotoRemove } = useProfilePhoto();
  const [activeTab, setActiveTab] = useState<'profile' | 'reports'>('profile');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
  const [contactInfo, setContactInfo] = useState({
    phoneNumber: '',
    country: '',
    websiteUrl: '',
  });

  const [profile, setProfile] = useState({
    bio: '',
    totalSpent: 0,
    postedProjects: 0,
    completedProjects: 0,
    rating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setFetchError(null);

    getClientProfile()
      .then((data) => {
        if (!active) return;
        setClientProfile(data);
        setContactInfo((prev) => ({
          ...prev,
          phoneNumber: data.phoneNumber ?? '',
          country: data.country ?? '',
          websiteUrl: data.websiteUrl ?? '',
        }));
        setProfile({
          bio: data.bio ?? '',
          totalSpent: data.totalSpent,
          postedProjects: data.totalProjectsPosted,
          completedProjects: data.totalProjectsCompleted,
          rating: data.averageRating,
          totalReviews: data.totalReviews,
        });

      })
      .catch((error: unknown) => {
        if (!active) return;
        setFetchError(error instanceof Error ? error.message : 'Unable to load client profile.');
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setReportsLoading(true);
    setReportsError('');

    getClientReports()
      .then((data) => {
        if (!active) return;
        setReports(data);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setReportsError(error instanceof Error ? error.message : 'We could not load your reports right now. Please try again.');
      })
      .finally(() => {
        if (!active) return;
        setReportsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const applyClientProfile = (data: ClientProfileDto) => {
    setClientProfile((prev) => (prev ? { ...prev, ...data } : data));
    setContactInfo({
      phoneNumber: data.phoneNumber ?? '',
      country: data.country ?? '',
      websiteUrl: data.websiteUrl ?? '',
    });
    setProfile((prev) => ({
      ...prev,
      bio: data.bio ?? '',
      totalSpent: data.totalSpent || prev.totalSpent,
      postedProjects: data.totalProjectsPosted || prev.postedProjects,
      completedProjects: data.totalProjectsCompleted || prev.completedProjects,
      rating: data.averageRating || prev.rating,
      totalReviews: data.totalReviews || prev.totalReviews,
    }));
  };

  const handleSaveEdit = async (data: ClientEditData) => {
    setSaveError(null);
    try {
      const updated = await updateClientProfile({
        phoneNumber: data.phoneNumber.trim(),
        country: data.country.trim(),
        websiteUrl: data.websiteUrl.trim(),
        bio: data.bio.trim(),
      });
      applyClientProfile({
        ...updated,
        fullName: updated.fullName || clientProfile?.fullName || user?.name || '',
        email: updated.email || clientProfile?.email || user?.email || '',
        totalSpent: updated.totalSpent || clientProfile?.totalSpent || profile.totalSpent,
        totalProjectsPosted: updated.totalProjectsPosted || clientProfile?.totalProjectsPosted || profile.postedProjects,
        totalProjectsCompleted: updated.totalProjectsCompleted || clientProfile?.totalProjectsCompleted || profile.completedProjects,
        averageRating: updated.averageRating || clientProfile?.averageRating || profile.rating,
        totalReviews: updated.totalReviews || clientProfile?.totalReviews || profile.totalReviews,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to update client profile.';
      setSaveError(message);
      throw error;
    }
  };

  const editData: ClientEditData = {
    phoneNumber: contactInfo.phoneNumber,
    country: contactInfo.country,
    websiteUrl: contactInfo.websiteUrl,
    bio: profile.bio,
  };
  const displayName = clientProfile?.fullName || user?.name || 'Client';
  const displayEmail = clientProfile?.email || user?.email || '';
  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  const formatReportText = (value: string) =>
    value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

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
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex-shrink-0 cursor-pointer relative group"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={displayName} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <i className="ri-user-line text-4xl sm:text-5xl lg:text-6xl text-white"></i>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i className="ri-camera-line text-2xl text-white"></i>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{displayName}</h1>
                  <button
                    onClick={() => {
                      setSaveError(null);
                      setShowContactModal(true);
                    }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Edit
                  </button>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-2 break-all">{displayEmail}</p>
                {isLoading && (
                  <p className="text-xs text-orange-300 mb-2 flex items-center gap-1.5">
                    <i className="ri-loader-4-line animate-spin"></i>
                    Loading client profile...
                  </p>
                )}
                {fetchError && (
                  <p className="text-xs text-red-300 mb-2 flex items-center gap-1.5">
                    <i className="ri-error-warning-line"></i>
                    {fetchError}
                  </p>
                )}
                {saveError && (
                  <p className="text-xs text-red-300 mb-2 flex items-center gap-1.5">
                    <i className="ri-error-warning-line"></i>
                    {saveError}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {contactInfo.phoneNumber && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-phone-line text-orange-400"></i>{contactInfo.phoneNumber}</span>}
                  {contactInfo.country && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-map-pin-line text-orange-400"></i>{contactInfo.country}</span>}
                  {contactInfo.websiteUrl && <a href={contactInfo.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-global-line text-orange-400"></i>{contactInfo.websiteUrl}</a>}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <i className="ri-star-fill text-yellow-400 text-lg sm:text-xl"></i>
                    <span className="text-sm sm:text-base text-white font-semibold">{profile.rating}</span>
                    <span className="text-xs sm:text-sm text-gray-400">({profile.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-money-dollar-circle-line text-green-400 text-lg sm:text-xl"></i>
                    <span className="text-sm sm:text-base text-white font-semibold">${profile.totalSpent.toLocaleString()} spent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-xl bg-orange-500/20 flex-shrink-0">
                  <i className="ri-briefcase-line text-2xl sm:text-3xl text-orange-400"></i>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Projects Posted</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{profile.postedProjects}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-xl bg-green-500/20 flex-shrink-0">
                  <i className="ri-checkbox-circle-line text-2xl sm:text-3xl text-green-400"></i>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{profile.completedProjects}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-xl bg-purple-500/20 flex-shrink-0">
                  <i className="ri-money-dollar-circle-line text-2xl sm:text-3xl text-purple-400"></i>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Total Spent</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">${profile.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'profile'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <i className="ri-user-line mr-2"></i>
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'reports'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <i className="ri-shield-user-line mr-2"></i>
              Reports Against Me
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">About Me</h2>
              </div>
              {profile.bio ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{profile.bio}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Tell us about yourself!</p>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <i className="ri-shield-user-line text-red-400"></i>
                    Reports Against Me
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Only you can see this section</p>
                </div>
                {!reportsLoading && !reportsError && (
                  <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 font-semibold">{reports.length} Report{reports.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {reportsLoading && (
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-orange-300"></i>
                  Loading reports...
                </div>
              )}

              {reportsError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                  <i className="ri-error-warning-line"></i>
                  {reportsError}
                </div>
              )}

              {!reportsLoading && !reportsError && reports.length === 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-shield-check-line text-3xl text-green-400"></i>
                  </div>
                  <h3 className="text-lg text-white font-semibold mb-2">No Reports Found</h3>
                  <p className="text-gray-500 text-sm">You have no reports filed against your account.</p>
                </div>
              )}

              {!reportsLoading && !reportsError && reports.length > 0 && (
                <div className="space-y-4">
                  {reports.map((report) => {
                    const isExpanded = expandedReportId === report.reportId;
                    const statusColors: Record<string, string> = {
                      Pending: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
                      UnderReview: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
                      Resolved: 'bg-green-500/20 border-green-500/30 text-green-400',
                      Dismissed: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
                    };
                    const statusClass = statusColors[report.status] ?? 'bg-white/10 border-white/20 text-gray-300';

                    return (
                      <div
                        key={report.reportId}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-red-500/30 transition-all overflow-hidden"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs font-medium">
                                {formatReportText(report.reportType)}
                              </span>
                              <span className={`px-3 py-1 border rounded-lg text-xs font-medium ${statusClass}`}>
                                {report.status === 'UnderReview' ? 'Under Review' : report.status}
                              </span>
                            </div>
                            <span className="text-gray-400 text-xs flex items-center gap-1 flex-shrink-0">
                              <i className="ri-calendar-line"></i>
                              {formatDate(report.createdAt)}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4">{report.description}</p>

                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <i className="ri-user-line text-orange-400"></i>
                            <span>Reported by <span className="text-white font-medium">{report.reportedBy}</span></span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedReportId(isExpanded ? null : report.reportId)}
                            className="mt-4 flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                          >
                            <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-sm`}></i>
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-white/10 p-4 sm:p-6 space-y-4">
                            {report.actions && report.actions.length > 0 && (
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold mb-2">Admin Actions Taken</p>
                                <div className="flex flex-wrap gap-2">
                                  {report.actions.map((action) => (
                                    <span
                                      key={action}
                                      className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 text-xs font-medium"
                                    >
                                      {formatReportText(action)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(report.resolvedAt || report.resolutionNote) && (
                              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-2">
                                <p className="text-[11px] uppercase tracking-wide text-green-400 font-bold flex items-center gap-1.5">
                                  <i className="ri-check-double-line"></i>
                                  Resolution
                                </p>
                                {report.resolvedAt && (
                                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <i className="ri-time-line text-green-400"></i>
                                    Resolved on <span className="text-gray-200">{formatDate(report.resolvedAt)}</span>
                                  </p>
                                )}
                                {report.resolutionNote && (
                                  <p className="text-sm text-gray-300 leading-relaxed">{report.resolutionNote}</p>
                                )}
                              </div>
                            )}

                            {!report.resolvedAt && !report.resolutionNote && (
                              <p className="text-xs text-gray-500 italic">No resolution note available yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
        accentColor="orange"
      />

      <ClientEditModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setSaveError(null);
        }}
        data={editData}
        onSave={handleSaveEdit}
        error={saveError}
        accentColor="orange"
      />
    </div>
  );
};

export default ClientProfile;
