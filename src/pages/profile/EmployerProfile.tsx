import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProfilePhotoModal from '../../components/feature/ProfilePhotoModal';
import EmployerEditModal from '../../components/feature/EmployerEditModal';
import type { EmployerEditData } from '../../components/feature/EmployerEditModal';
import useProfilePhoto from '../../hooks/useProfilePhoto';
import { getEmployerProfile, updateEmployerProfile } from '../../services/employer.service';
import {
  addCompany,
  deleteCompanyDocument,
  downloadCompanyDocument,
  getCompanyDetails,
  getEmployerCompanies,
  uploadCompanyDocument,
  uploadCompanyLogo,
} from '../../services/company.service';
import { getDashboardPathForUser } from '../../utils/dashboard';

interface Company {
  id: string;
  name: string;
  industry: string;
  logo?: string;
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

const DEFAULT_COMPANY_LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#1F2A44"/><rect x="22" y="28" width="84" height="72" rx="8" fill="#2F3B58"/><rect x="34" y="42" width="24" height="44" fill="#8B5CF6"/><rect x="66" y="52" width="28" height="10" fill="#C4B5FD"/><rect x="66" y="68" width="22" height="8" fill="#A78BFA"/></svg>'
)}`;

const formatUploadedAt = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) {
    return 'Unknown date';
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const handleLogoImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.src !== DEFAULT_COMPANY_LOGO) {
    image.src = DEFAULT_COMPANY_LOGO;
  }
};

const getMappedCompanies = (
  apiCompanies: Awaited<ReturnType<typeof getEmployerCompanies>>
): Company[] =>
  apiCompanies.map((comp) => ({
    id: comp.id,
    name: comp.name,
    industry: comp.industry || 'Not specified',
    logo: comp.logoUrl || undefined,
    documents: [],
  }));

const EmployerProfile = () => {
  const { user } = useAuth();
  const { handlePhotoUpload, handlePhotoRemove } = useProfilePhoto();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [contactSaveMessage, setContactSaveMessage] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('');
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [addCompanyError, setAddCompanyError] = useState('');
  const [addCompanySuccessMessage, setAddCompanySuccessMessage] = useState('');
  const [isLoadingCompanyDetails, setIsLoadingCompanyDetails] = useState(false);
  const [companyDetailsError, setCompanyDetailsError] = useState('');
  const [logoUploadError, setLogoUploadError] = useState('');
  const [documentUploadError, setDocumentUploadError] = useState('');
  const [uploadingLogoByCompany, setUploadingLogoByCompany] = useState<Record<string, boolean>>({});
  const [uploadingDocumentByCompany, setUploadingDocumentByCompany] = useState<Record<string, boolean>>({});
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [documentDeleteError, setDocumentDeleteError] = useState('');
  
  const [contactInfo, setContactInfo] = useState<EmployerEditData>({
    phoneNumber: '',
    address: '',
    websiteUrl: '',
  });
  const [companies, setCompanies] = useState<Company[]>([]);

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const hasEmployerRole = Array.isArray(user?.roles)
    ? user.roles.some((role) => String(role).toLowerCase().trim() === 'employer')
    : false;
  const dashboardPath = getDashboardPathForUser(user, 'employer');
  const canManageCompanies = Boolean(
    hasEmployerRole && String(user?.employerId ?? '').trim().length > 0
  );

  const isLogoUploading = (companyId: string) => Boolean(uploadingLogoByCompany[companyId]);
  const isDocumentUploading = (companyId: string) => Boolean(uploadingDocumentByCompany[companyId]);

  // Fetch employer profile from API on component mount
  useEffect(() => {
    const loadEmployerProfile = async () => {
      if (!user?.employerId) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        setProfileError('');
        const profile = await getEmployerProfile(user.employerId);

        // Update contact info from API
        setContactInfo({
          phoneNumber: profile.phoneNumber || '',
          address: profile.address || '',
          websiteUrl: profile.websiteUrl || '',
        });

        const apiCompanies = await getEmployerCompanies(user.employerId);
        const mappedCompanies = getMappedCompanies(apiCompanies);

        setCompanies(mappedCompanies);
        setSelectedCompany(null);
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : 'Failed to load employer profile.');
        console.error('Error loading employer profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadEmployerProfile();
  }, [user?.employerId]);

  useEffect(() => {
    if (!selectedCompany) {
      setCompanyDetailsError('');
      return;
    }

    let isActive = true;

    const loadCompanyDetails = async () => {
      try {
        setIsLoadingCompanyDetails(true);
        setCompanyDetailsError('');

        const details = await getCompanyDetails(selectedCompany);

        if (!isActive) {
          return;
        }

        setCompanies((prevCompanies) =>
          prevCompanies.map((company) =>
            company.id === selectedCompany
              ? {
                  ...company,
                  name: details.name,
                  industry: details.industry || 'Not specified',
                  logo: details.logoUrl || undefined,
                  documents: details.documents.map((doc) => ({
                    id: doc.id,
                    name: doc.fileName,
                    url: doc.filePath,
                    uploadedAt: formatUploadedAt(doc.uploadedAt),
                  })),
                }
              : company
          )
        );
      } catch (err) {
        if (!isActive) {
          return;
        }
        setCompanyDetailsError(
          err instanceof Error ? err.message : 'Failed to load company details. Please try again.'
        );
      } finally {
        if (isActive) {
          setIsLoadingCompanyDetails(false);
        }
      }
    };

    loadCompanyDetails();

    return () => {
      isActive = false;
    };
  }, [selectedCompany]);

  const handleSaveContact = async (data: EmployerEditData) => {
    if (!hasEmployerRole) {
      throw new Error('Only employers can update their own profile.');
    }

    const updated = await updateEmployerProfile({
      phoneNumber: data.phoneNumber,
      address: data.address,
      websiteUrl: data.websiteUrl,
    });

    setContactInfo({
      phoneNumber: updated.phoneNumber,
      address: updated.address,
      websiteUrl: updated.websiteUrl,
    });

    setContactSaveMessage('Contact details updated successfully.');
    window.setTimeout(() => setContactSaveMessage(''), 2500);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, companyId?: string) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file || !companyId) {
      return;
    }

    if (!canManageCompanies) {
      setLogoUploadError('Only authenticated employers can upload or update company logos.');
      return;
    }

    const canUpdateThisCompany = companies.some((company) => company.id === companyId);
    if (!canUpdateThisCompany) {
      setLogoUploadError('You can only update logos for companies linked to your account.');
      return;
    }

    setLogoUploadError('');

    setUploadingLogoByCompany((prev) => ({
      ...prev,
      [companyId]: true,
    }));

    try {
      await uploadCompanyLogo(companyId, file);
      const details = await getCompanyDetails(companyId);

      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === companyId
            ? {
                ...company,
                name: details.name,
                industry: details.industry || 'Not specified',
                logo: details.logoUrl || undefined,
                documents: details.documents.map((doc) => ({
                  id: doc.id,
                  name: doc.fileName,
                  url: doc.filePath,
                  uploadedAt: formatUploadedAt(doc.uploadedAt),
                })),
              }
            : company
        )
      );
    } catch (error) {
      setLogoUploadError(
        error instanceof Error
          ? error.message
          : 'Failed to upload company logo. Please try again.'
      );
    } finally {
      setUploadingLogoByCompany((prev) => ({
        ...prev,
        [companyId]: false,
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, companyId: string) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) {
      return;
    }

    if (!canManageCompanies) {
      setDocumentUploadError('Only authenticated employers can upload company documents.');
      return;
    }

    const canUploadToThisCompany = companies.some((company) => company.id === companyId);
    if (!canUploadToThisCompany) {
      setDocumentUploadError('You can only upload documents for companies linked to your account.');
      return;
    }

    const existingDocumentIds = new Set(
      (companies.find((company) => company.id === companyId)?.documents ?? []).map((doc) => doc.id)
    );

    setDocumentUploadError('');
    setUploadingDocumentByCompany((prev) => ({
      ...prev,
      [companyId]: true,
    }));

    void (async () => {
      try {
        await uploadCompanyDocument(companyId, file);

        let details = await getCompanyDetails(companyId);
        const uploadAppearsInList = details.documents.some(
          (doc) => doc.fileName === file.name || !existingDocumentIds.has(doc.id)
        );

        // Retry once to handle eventual-consistency delays after upload.
        if (!uploadAppearsInList) {
          try {
            details = await getCompanyDetails(companyId);
          } catch {
            // Keep first successful details payload if retry fails.
          }
        }

        setCompanies((prevCompanies) =>
          prevCompanies.map((company) =>
            company.id === companyId
              ? {
                  ...company,
                  name: details.name,
                  industry: details.industry || 'Not specified',
                  logo: details.logoUrl || undefined,
                  documents: details.documents.map((doc) => ({
                    id: doc.id,
                    name: doc.fileName,
                    url: doc.filePath,
                    uploadedAt: formatUploadedAt(doc.uploadedAt),
                  })),
                }
              : company
          )
        );
      } catch (error) {
        setDocumentUploadError(
          error instanceof Error
            ? error.message
            : 'Failed to upload company document. Please try again.'
        );
      } finally {
        setUploadingDocumentByCompany((prev) => ({
          ...prev,
          [companyId]: false,
        }));
      }
    })();
  };

  const handleDeleteDocument = async (docId: string, companyId: string) => {
    setDocumentDeleteError('');

    if (!hasEmployerRole) {
      setDocumentDeleteError('Only employers can delete company documents.');
      return;
    }

    setDeletingDocumentId(docId);

    try {
      await deleteCompanyDocument(docId);

      // Remove document from UI immediately after successful deletion
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === companyId
            ? { ...company, documents: company.documents.filter((doc) => doc.id !== docId) }
            : company
        )
      );
    } catch (error) {
      setDocumentDeleteError(
        error instanceof Error ? error.message : 'Failed to delete document. Please try again.'
      );
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const handleDownloadDocument = async (docId: string) => {
    try {
      await downloadCompanyDocument(docId);
    } catch (error) {
      setDocumentDeleteError(
        error instanceof Error ? error.message : 'Failed to download document. Please try again.'
      );
    }
  };

  const handleAddCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setAddCompanyError('');
    setAddCompanySuccessMessage('');

    const name = newCompanyName.trim();
    const industry = newCompanyIndustry.trim();

    if (!canManageCompanies || !user?.employerId) {
      setAddCompanyError('Only authenticated employers can add companies.');
      return;
    }

    if (!name || !industry) {
      setAddCompanyError('Company name and industry are required.');
      return;
    }

    try {
      setIsAddingCompany(true);
      const successMessage = await addCompany({ name, industry });

      const apiCompanies = await getEmployerCompanies(user.employerId);
      const mappedCompanies = getMappedCompanies(apiCompanies);

      setCompanies(mappedCompanies);

      const newlyAddedCompany = mappedCompanies.find(
        (company) =>
          company.name.toLowerCase() === name.toLowerCase() &&
          company.industry.toLowerCase() === industry.toLowerCase()
      );

      setSelectedCompany(newlyAddedCompany?.id || null);
      setNewCompanyName('');
      setNewCompanyIndustry('');
      setAddCompanySuccessMessage(successMessage || 'Company added successfully.');
      window.setTimeout(() => setAddCompanySuccessMessage(''), 2500);
    } catch (err) {
      setAddCompanyError(err instanceof Error ? err.message : 'Failed to add company. Please try again.');
    } finally {
      setIsAddingCompany(false);
    }
  };

  const selectedCompanyData = companies.find((c) => c.id === selectedCompany);

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
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex-shrink-0 cursor-pointer relative group"
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
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{user?.name || 'Employer'}</h1>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-violet-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line"></i>
                    Edit Contact
                  </button>
                </div>
                <p className="text-sm sm:text-base text-gray-400 mb-2 break-all">{user?.email}</p>
                {isLoadingProfile && (
                  <p className="text-xs text-gray-400 mb-2">Loading profile details...</p>
                )}
                {profileError && (
                  <p className="text-xs text-red-300 mb-2">{profileError}</p>
                )}
                {contactSaveMessage && (
                  <p className="text-xs text-emerald-300 mb-2">{contactSaveMessage}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {contactInfo.phoneNumber && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-phone-line text-violet-400"></i>{contactInfo.phoneNumber}</span>}
                  {contactInfo.address && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-map-pin-line text-violet-400"></i>{contactInfo.address}</span>}
                  {contactInfo.websiteUrl && <span className="flex items-center gap-1.5 text-xs text-gray-300"><i className="ri-global-line text-violet-400"></i>{contactInfo.websiteUrl}</span>}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <i className="ri-building-line text-violet-400 text-lg sm:text-xl"></i>
                    <span className="text-sm sm:text-base text-white font-semibold">{companies.length} Companies</span>
                  </div>
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-dashboard-line text-violet-400 text-lg"></i>
                    <span className="text-sm text-violet-300 font-semibold">View Job Postings Dashboard</span>
                    <i className="ri-arrow-right-line text-violet-400 text-sm"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Companies List */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">My Companies</h2>
            </div>

            <form onSubmit={handleAddCompany} className="mb-5 sm:mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  <label htmlFor="company-name" className="block text-xs text-gray-300 mb-1">Company Name</label>
                  <input
                    id="company-name"
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60"
                    maxLength={120}
                    disabled={!canManageCompanies || isAddingCompany}
                  />
                </div>
                <div className="lg:col-span-2">
                  <label htmlFor="company-industry" className="block text-xs text-gray-300 mb-1">Industry</label>
                  <input
                    id="company-industry"
                    type="text"
                    value={newCompanyIndustry}
                    onChange={(e) => setNewCompanyIndustry(e.target.value)}
                    placeholder="Enter company industry"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60"
                    maxLength={120}
                    disabled={!canManageCompanies || isAddingCompany}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!canManageCompanies || isAddingCompany}
                    className="w-full h-[42px] px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingCompany ? 'Adding...' : 'Add Company'}
                  </button>
                </div>
              </div>

              {!canManageCompanies && (
                <p className="text-xs text-amber-300 mt-3">Only authenticated employers can add companies.</p>
              )}
              {addCompanyError && (
                <p className="text-xs text-red-300 mt-3">{addCompanyError}</p>
              )}
              {addCompanySuccessMessage && (
                <p className="text-xs text-emerald-300 mt-3">{addCompanySuccessMessage}</p>
              )}
              {logoUploadError && (
                <p className="text-xs text-red-300 mt-3">{logoUploadError}</p>
              )}
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => {
                    setCompanyDetailsError('');
                    setSelectedCompany((prev) => (prev === company.id ? null : company.id));
                  }}
                  className={`bg-white/5 rounded-lg p-4 sm:p-5 lg:p-6 border-2 transition-all cursor-pointer ${
                    selectedCompany === company.id ? 'border-violet-500' : 'border-white/10 hover:border-violet-500/50'
                  }`}
                >
                  <div className="relative group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg bg-white/10 mb-3 sm:mb-4 overflow-hidden">
                      <img
                        src={company.logo || DEFAULT_COMPANY_LOGO}
                        alt={company.name}
                        className="w-full h-full object-cover"
                        onError={handleLogoImageError}
                      />
                    </div>
                    {canManageCompanies && (
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <div className="text-center">
                          <i className="ri-camera-line text-xl text-white"></i>
                          <p className="text-xs text-white/80">{isLogoUploading(company.id) ? 'Uploading...' : 'Change'}</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, company.id)}
                          className="hidden"
                          disabled={isLogoUploading(company.id)}
                        />
                      </label>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 truncate">{company.name}</h3>
                  <p className="text-sm sm:text-base text-gray-400 mb-3 truncate">{company.industry}</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <i className="ri-file-text-line"></i>
                    <span>{company.documents.length} documents</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Details */}
          {selectedCompanyData && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="relative group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                    <img
                      src={selectedCompanyData.logo || DEFAULT_COMPANY_LOGO}
                      alt={selectedCompanyData.name}
                      className="w-full h-full object-cover"
                      onError={handleLogoImageError}
                    />
                  </div>
                  {canManageCompanies && (
                    <label className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="text-center">
                        <i className="ri-camera-line text-2xl text-white"></i>
                        <p className="text-xs text-white/80">
                          {isLogoUploading(selectedCompanyData.id) ? 'Uploading...' : 'Change Logo'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, selectedCompanyData.id)}
                        className="hidden"
                        disabled={isLogoUploading(selectedCompanyData.id)}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 truncate">{selectedCompanyData.name}</h2>
                  <p className="text-sm sm:text-base text-gray-400 truncate">{selectedCompanyData.industry}</p>
                  {isLoadingCompanyDetails && (
                    <p className="text-xs text-gray-400 mt-2">Loading company details...</p>
                  )}
                  {companyDetailsError && (
                    <p className="text-xs text-red-300 mt-2">{companyDetailsError}</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Company Documents</h3>
                  <label className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-violet-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-violet-600 transition-colors whitespace-nowrap cursor-pointer text-center">
                    <i className="ri-upload-line mr-2"></i>
                    {isDocumentUploading(selectedCompanyData.id) ? 'Uploading...' : 'Upload Document'}
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, selectedCompanyData.id)}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      disabled={isDocumentUploading(selectedCompanyData.id)}
                    />
                  </label>
                </div>
                {documentUploadError && (
                  <p className="text-xs text-red-300 mb-3">{documentUploadError}</p>
                )}
                {documentDeleteError && (
                  <p className="text-xs text-red-300 mb-3">{documentDeleteError}</p>
                )}

                {selectedCompanyData.documents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCompanyData.documents.map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-violet-500/20 flex-shrink-0">
                            <i className="ri-file-text-line text-xl sm:text-2xl text-violet-400"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base text-white font-semibold truncate">{doc.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-400">Uploaded on {doc.uploadedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleDownloadDocument(doc.id)}
                            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download document"
                          >
                            <i className="ri-download-line text-lg sm:text-xl text-white"></i>
                          </button>
                          {canManageCompanies && (
                            <button
                              onClick={() => handleDeleteDocument(doc.id, selectedCompanyData.id)}
                              disabled={deletingDocumentId === doc.id}
                              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete document"
                            >
                              <i className={`text-lg sm:text-xl text-white hover:text-red-400 ${
                                deletingDocumentId === doc.id ? 'ri-loader-4-line animate-spin' : 'ri-delete-bin-line'
                              }`}></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 border-2 border-dashed border-white/20 rounded-lg">
                    <i className="ri-file-line text-5xl sm:text-6xl text-gray-400 mb-3 sm:mb-4"></i>
                    <p className="text-sm sm:text-base text-gray-400">No documents available</p>
                  </div>
                )}
              </div>
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
        accentColor="violet"
      />

      <EmployerEditModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        data={contactInfo}
        onSave={handleSaveContact}
        accentColor="violet"
      />
    </div>
  );
};

export default EmployerProfile;
