import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import { assignNewRole, getPublicRoles } from '../../services/role.service';
import { normalizeUserRole } from '../../utils/dashboard';

interface RoleGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRole: UserRole;
  roleLabel: string;
  actionLabel: string;
  onRoleAdded?: () => void;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  file: File | null;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  documents: File[];
}

const roleColors: Record<UserRole, { bg: string; border: string; text: string; btn: string; btnHover: string; iconBg: string; uploadHover: string }> = {
  freelancer: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    btn: 'bg-purple-500',
    btnHover: 'hover:bg-purple-600',
    iconBg: 'bg-purple-500/20',
    uploadHover: 'hover:border-purple-500/50 hover:bg-purple-500/5',
  },
  client: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    btn: 'bg-pink-500',
    btnHover: 'hover:bg-pink-600',
    iconBg: 'bg-pink-500/20',
    uploadHover: 'hover:border-pink-500/50 hover:bg-pink-500/5',
  },
  employer: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    btn: 'bg-teal-500',
    btnHover: 'hover:bg-teal-600',
    iconBg: 'bg-teal-500/20',
    uploadHover: 'hover:border-teal-500/50 hover:bg-teal-500/5',
  },
  applicant: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    btn: 'bg-emerald-500',
    btnHover: 'hover:bg-emerald-600',
    iconBg: 'bg-emerald-500/20',
    uploadHover: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
  },
  learner: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    btn: 'bg-amber-500',
    btnHover: 'hover:bg-amber-600',
    iconBg: 'bg-amber-500/20',
    uploadHover: 'hover:border-amber-500/50 hover:bg-amber-500/5',
  },
  admin: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    btn: 'bg-blue-500',
    btnHover: 'hover:bg-blue-600',
    iconBg: 'bg-blue-500/20',
    uploadHover: 'hover:border-blue-500/50 hover:bg-blue-500/5',
  }
};

const roleIcons: Record<UserRole, string> = {
  freelancer: 'ri-code-s-slash-line',
  client: 'ri-briefcase-line',
  employer: 'ri-building-line',
  applicant: 'ri-file-user-line',
  learner: 'ri-graduation-cap-line',
  admin: 'ri-shield-line',
};

const requiresSetup: Record<UserRole, boolean> = {
  freelancer: true,
  client: true,
  employer: true,
  applicant: true,
  learner: false,
  admin: false,
};

const PORTFOLIO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const PORTFOLIO_MAX_SIZE_MB = 10;
const portfolioCategories = [
  'webDevelopment',
  'mobileDevelopment',
  'uiUX',
  'dataScience',
  'machineLearning',
  'devOps',
  'cyberSecurity',
  'gameDevelopment',
  'graphicDesign',
  'contentWriting',
  'digitalMarketing',
  'videoEditing',
  'other',
];

const portfolioCategoryLabels: Record<string, string> = {
  webDevelopment: 'Web Development',
  mobileDevelopment: 'Mobile Development',
  uiUX: 'UI/UX',
  dataScience: 'Data Science',
  machineLearning: 'Machine Learning',
  devOps: 'DevOps',
  cyberSecurity: 'Cyber Security',
  gameDevelopment: 'Game Development',
  graphicDesign: 'Graphic Design',
  contentWriting: 'Content Writing',
  digitalMarketing: 'Digital Marketing',
  videoEditing: 'Video Editing',
  other: 'Other',
};

const ModalShell = ({
  children,
  onClose,
  wide = false,
  scrollable = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  scrollable?: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
    <div className={`relative bg-[#252b42] rounded-2xl border border-white/10 p-6 sm:p-8 w-full ${wide ? 'max-w-lg' : 'max-w-md'} animate-[fadeInScale_0.2s_ease-out] ${scrollable ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
      {children}
    </div>
  </div>
);

const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors">
    <i className="ri-close-line text-xl"></i>
  </button>
);

const RoleGateModal = ({ isOpen, onClose, requiredRole, roleLabel, actionLabel, onRoleAdded }: RoleGateModalProps) => {
  const { user, isAuthenticated, addRole } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<'check' | 'confirm' | 'upload' | 'success'>('check');

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [portfolioFileError, setPortfolioFileError] = useState('');
  const [addRoleError, setAddRoleError] = useState('');
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [publicRoleApiNames, setPublicRoleApiNames] = useState<Record<UserRole, string>>({} as Record<UserRole, string>);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) {
      return;
    }

    const loadPublicRoles = async () => {
      try {
        const roles = await getPublicRoles();
        const mapped = roles.reduce((acc, roleName) => {
          const normalized = normalizeUserRole(roleName);
          if (normalized) {
            acc[normalized] = roleName;
          }
          return acc;
        }, {} as Record<UserRole, string>);
        setPublicRoleApiNames(mapped);
      } catch (err) {
        console.warn('Failed to load public roles for role gate', err);
      }
    };

    void loadPublicRoles();
  }, [isAuthenticated, isOpen]);

  if (!isOpen) return null;

  const colors = roleColors[requiredRole];
  const roleIcon = roleIcons[requiredRole];
  const needsSetup = requiresSetup[requiredRole];
  const needsLogin = !isAuthenticated;
  const hasRole = user?.roles.includes(requiredRole);

  const handleLoginRedirect = () => { onClose(); navigate('/login'); };

  const resetState = () => {
    setStep('check');
    setPortfolioItems([]);
    setCvFile(null);
    setCompanies([]);
    setCountry('');
    setPhoneNumber('');
    setHourlyRate('');
    setPortfolioFileError('');
    setAddRoleError('');
    setIsAddingRole(false);
  };

  const handleAddRole = () => {
    if (needsSetup) { setStep('upload'); } else { void completeRoleAddition(); }
  };

  const completeRoleAddition = async () => {
    setAddRoleError('');

    if (requiredRole === 'freelancer') {
      if (!country.trim() || !phoneNumber.trim() || !hourlyRate.trim()) {
        setAddRoleError('Please complete all required freelancer fields');
        return;
      }

      if (portfolioItems.length === 0) {
        setAddRoleError('Please add at least one portfolio item');
        return;
      }

      const incompleteItem = portfolioItems.find(
        (item) => !item.title.trim() || !item.description.trim() || !item.category.trim() || !item.file,
      );
      if (incompleteItem) {
        setAddRoleError('Please complete all portfolio fields and upload a file');
        return;
      }

      const invalidItem = portfolioItems.find((item) => validatePortfolioFile(item.file ?? undefined));
      if (invalidItem) {
        const error = validatePortfolioFile(invalidItem.file ?? undefined);
        setPortfolioFileError(error);
        setAddRoleError(error);
        return;
      }
    }

    if (requiredRole === 'client' && (!country.trim() || !phoneNumber.trim())) {
      setAddRoleError('Please enter your country and phone number');
      return;
    }

    if (requiredRole === 'applicant' && !cvFile) {
      setAddRoleError('Please upload your CV');
      return;
    }

    if (requiredRole === 'employer' && companies.length === 0) {
      setAddRoleError('Please add at least one company');
      return;
    }

    const formData = new FormData();
    formData.append('RoleName', getRoleApiName(requiredRole));

    if (requiredRole === 'applicant' && cvFile) {
      formData.append('CvFile', cvFile);
    }

    if (requiredRole === 'client') {
      formData.append('country', country.trim());
      formData.append('phoneNumber', phoneNumber.trim());
    }

    if (requiredRole === 'freelancer') {
      formData.append('country', country.trim());
      formData.append('phoneNumber', phoneNumber.trim());
      formData.append('hourlyRate', hourlyRate.trim());

      const portfolioItem = portfolioItems.find((item) => item.file instanceof File);
      if (portfolioItem?.file) {
        formData.append('portfolioFile.title', portfolioItem.title.trim());
        formData.append('portfolioFile.description', portfolioItem.description.trim());
        formData.append('portfolioFile.category', portfolioItem.category.trim());
        formData.append('portfolioFile.file', portfolioItem.file);
      }
    }

    if (requiredRole === 'employer') {
      const payload = companies.map((company) => ({
        name: company.name,
        industry: company.industry,
        logoUrl: '',
        documents: company.documents.map((doc) => doc.name),
      }));
      formData.append('Companies', JSON.stringify(payload));
    }

    try {
      setIsAddingRole(true);
      await assignNewRole(formData);
      await addRole(requiredRole);
      setStep('success');
      setTimeout(() => { resetState(); onClose(); if (onRoleAdded) onRoleAdded(); }, 1500);
    } catch (err) {
      setAddRoleError(
        err instanceof Error
          ? err.message
          : 'We could not add this role right now. Please try again.',
      );
    } finally {
      setIsAddingRole(false);
    }
  };

  const handleClose = () => { resetState(); onClose(); };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCvFile(file);
    e.target.value = '';
  };

  const handleCompanyDocUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (files) {
      setCompanies(prev => prev.map((c, i) => i === index ? { ...c, documents: [...c.documents, ...Array.from(files)] } : c));
    }
    e.target.value = '';
  };

  const removeCompanyDoc = (companyIndex: number, docIndex: number) => {
    setCompanies(prev => prev.map((c, i) =>
      i === companyIndex ? { ...c, documents: c.documents.filter((_, di) => di !== docIndex) } : c
    ));
  };

  const addCompany = () => {
    setCompanies(prev => [...prev, { id: Date.now().toString(), name: '', industry: '', documents: [] }]);
  };

  const removeCompany = (index: number) => {
    if (companies.length > 1) {
      setCompanies(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateCompany = (index: number, field: 'name' | 'industry', value: string) => {
    setCompanies(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addPortfolioItem = () => {
    setPortfolioItems(prev => [
      ...prev,
      { id: Date.now().toString(), title: '', description: '', category: '', file: null },
    ]);
  };

  const updatePortfolioItem = (id: string, field: keyof PortfolioItem, value: string | File | null) => {
    setPortfolioItems(prev => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const removePortfolioItem = (id: string) => {
    setPortfolioItems(prev => prev.filter((item) => item.id !== id));
  };

  const validatePortfolioFile = (file: File | undefined): string => {
    if (!file) return 'Portfolio file is required.';
    if (!PORTFOLIO_ALLOWED_TYPES.includes(file.type)) {
      return 'Portfolio file must be JPG, PNG, WEBP, or PDF.';
    }
    const maxBytes = PORTFOLIO_MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Portfolio file must be ${PORTFOLIO_MAX_SIZE_MB}MB or less.`;
    }
    return '';
  };

  const canSubmitUpload = () => {
    if (requiredRole === 'freelancer') return portfolioItems.length > 0 && country.trim() && phoneNumber.trim() && hourlyRate.trim();
    if (requiredRole === 'client') return country.trim() && phoneNumber.trim();
    if (requiredRole === 'applicant') return cvFile !== null;
    if (requiredRole === 'employer') return companies.length > 0;
    return true;
  };

  const getRoleDescription = (role: UserRole): string => t(`roleGate.${role}Desc`);

  const getRoleApiName = (role: UserRole): string => {
    if (publicRoleApiNames[role]) {
      return publicRoleApiNames[role];
    }
    if (role === 'applicant') {
      return 'Job Seeker';
    }
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // ─── Not logged in ─────────────────────────────────────────────────────────
  if (needsLogin) {
    return (
      <ModalShell onClose={handleClose}>
        <CloseButton onClose={handleClose} />
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-500/20 mx-auto mb-4">
            <i className="ri-lock-line text-3xl text-amber-400"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('roleGate.loginRequired')}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {t('roleGate.loginMessage', { action: actionLabel.toLowerCase() })}
          </p>
          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 px-5 py-3 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer">
              {t('roleGate.cancel')}
            </button>
            <button onClick={handleLoginRedirect} className="flex-1 px-5 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap cursor-pointer">
              <i className="ri-login-box-line mr-2"></i>{t('roleGate.signIn')}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-4">
            {t('roleGate.dontHaveAccount')}{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); navigate('/register'); }}
              className="text-purple-400 hover:text-purple-300 cursor-pointer">
              {t('roleGate.registerHere')}
            </a>
          </p>
        </div>
      </ModalShell>
    );
  }

  if (hasRole) return null;

  // ─── Success ───────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative bg-[#252b42] rounded-2xl border border-white/10 p-6 sm:p-8 w-full max-w-md animate-[fadeInScale_0.2s_ease-out]">
          <div className="text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500/20 mx-auto mb-4">
              <i className="ri-check-double-line text-3xl text-green-400"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('roleGate.roleAddedSuccess')}</h3>
            <p className="text-gray-400 text-sm">
              {t('roleGate.roleAddedDesc', { role: roleLabel })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Upload step ───────────────────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <ModalShell onClose={handleClose} wide scrollable>
        <CloseButton onClose={handleClose} />
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${colors.iconBg}`}>
              <i className={`${roleIcon} text-xl ${colors.text}`}></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('roleGate.completeProfile', { role: roleLabel })}</h3>
              <p className="text-gray-500 text-xs">{t('roleGate.uploadRequiredDocs')}</p>
            </div>
          </div>
        </div>

        {addRoleError && (
          <div className="mb-4 p-3 rounded-lg text-sm border bg-red-500/10 border-red-500/30 text-red-300">
            {addRoleError}
          </div>
        )}

        {/* Client Contact Details */}
        {requiredRole === 'client' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <p className="text-gray-500 text-xs">Add your contact details to enable the client role.</p>
          </div>
        )}

        {/* Freelancer Setup */}
        {requiredRole === 'freelancer' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
              <input
                type="number"
                min="0"
                placeholder="Hourly rate"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white">
                  <i className={`ri-folder-image-line mr-1 ${colors.text}`}></i>
                  Portfolio items <span className="text-red-400">*</span>
                </label>
                <button onClick={addPortfolioItem} className={`text-xs ${colors.text} cursor-pointer flex items-center gap-1 hover:opacity-80`}>
                  <i className="ri-add-line"></i> Add item
                </button>
              </div>

              <div className="space-y-4">
                {portfolioItems.map((item, index) => (
                  <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${colors.text}`}>Portfolio Item {index + 1}</span>
                      <button onClick={() => removePortfolioItem(item.id)} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                        <i className="ri-delete-bin-line mr-1"></i>Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Project title"
                      value={item.title}
                      onChange={(e) => updatePortfolioItem(item.id, 'title', e.target.value)}
                      className="w-full mb-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                    <textarea
                      placeholder="Project description"
                      value={item.description}
                      onChange={(e) => updatePortfolioItem(item.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full mb-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                    <select
                      value={item.category}
                      onChange={(e) => updatePortfolioItem(item.id, 'category', e.target.value)}
                      className="w-full mb-3 bg-[#252b42] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="">Select category</option>
                      {portfolioCategories.map((category) => (
                        <option key={category} value={category}>
                          {portfolioCategoryLabels[category] ?? category}
                        </option>
                      ))}
                    </select>
                    <input
                      type="file"
                      id={`role-gate-portfolio-${item.id}`}
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        const validation = validatePortfolioFile(file ?? undefined);
                        setPortfolioFileError(validation);
                        if (!validation) {
                          updatePortfolioItem(item.id, 'file', file);
                        }
                      }}
                    />
                    <label
                      htmlFor={`role-gate-portfolio-${item.id}`}
                      className={`flex items-center justify-center w-full border border-dashed border-white/20 rounded-lg p-3 cursor-pointer ${colors.uploadHover} transition-all`}
                    >
                      <span className="text-xs text-gray-400">
                        <i className="ri-upload-line mr-1"></i>
                        {item.file ? `${item.file.name} (${formatFileSize(item.file.size)})` : 'Upload file'}
                      </span>
                    </label>
                    {portfolioFileError && (
                      <p className="text-xs text-red-400 flex items-center gap-1 mt-2">
                        <i className="ri-error-warning-line"></i>
                        {portfolioFileError}
                      </p>
                    )}
                  </div>
                ))}
                {portfolioItems.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
                    No portfolio items added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Applicant Upload */}
        {requiredRole === 'applicant' && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <i className={`ri-file-user-line mr-1 ${colors.text}`}></i>
              {t('roleGate.cvResume')} <span className="text-red-400">*</span>
            </label>
            <p className="text-gray-500 text-xs mb-3">{t('roleGate.cvUploadDesc')}</p>
            <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleSingleFileUpload} />
            {!cvFile ? (
              <div onClick={() => cvInputRef.current?.click()} className={`border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer ${colors.uploadHover} transition-all`}>
                <i className="ri-upload-cloud-2-line text-3xl text-gray-400 mb-2"></i>
                <p className="text-sm text-gray-400">{t('roleGate.clickToUploadCV')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('roleGate.cvFormats')}</p>
              </div>
            ) : (
              <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${colors.iconBg}`}>
                      <i className={`ri-file-text-line text-xl ${colors.text}`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{cvFile.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(cvFile.size)}</p>
                    </div>
                  </div>
                  <button onClick={() => setCvFile(null)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 cursor-pointer">
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Employer Upload */}
        {requiredRole === 'employer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">
                <i className={`ri-building-line mr-1 ${colors.text}`}></i>
                {t('roleGate.companiesWorkWith')} <span className="text-red-400">*</span>
              </label>
              <button onClick={addCompany} className={`text-xs ${colors.text} cursor-pointer flex items-center gap-1 hover:opacity-80`}>
                <i className="ri-add-line"></i> {t('roleGate.addCompany')}
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-3">{t('roleGate.companiesDesc')}</p>
            <div className="space-y-4">
              {companies.map((company, index) => (
                <div key={company.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium ${colors.text}`}>{t('roleGate.company')} {index + 1}</span>
                    {companies.length > 1 && (
                      <button onClick={() => removeCompany(index)} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                        <i className="ri-delete-bin-line mr-1"></i>{t('roleGate.removeCompany')}
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t('roleGate.companyName')}</label>
                      <input type="text" value={company.name} onChange={(e) => updateCompany(index, 'name', e.target.value)}
                        placeholder={t('roleGate.companyNamePlaceholder')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Industry</label>
                      <input type="text" value={company.industry} onChange={(e) => updateCompany(index, 'industry', e.target.value)}
                        placeholder="Company industry"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t('roleGate.verificationDocs')}</label>
                      <div onClick={() => {
                        setTimeout(() => {
                          const input = document.createElement('input');
                          input.type = 'file'; input.multiple = true; input.accept = '.pdf,.doc,.docx';
                          input.onchange = (e) => handleCompanyDocUpload(e as unknown as React.ChangeEvent<HTMLInputElement>, index);
                          input.click();
                        }, 0);
                      }} className={`border border-dashed border-white/20 rounded-lg p-3 text-center cursor-pointer ${colors.uploadHover} transition-all`}>
                        <i className="ri-upload-2-line text-gray-400 mr-1"></i>
                        <span className="text-xs text-gray-400">{t('roleGate.uploadDocs')}</span>
                      </div>
                      {company.documents.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {company.documents.map((doc, docIndex) => (
                            <div key={docIndex} className={`flex items-center justify-between ${colors.bg} rounded-lg px-2 py-1.5`}>
                              <div className="flex items-center gap-2 min-w-0">
                                <i className={`ri-file-line ${colors.text} text-sm`}></i>
                                <span className="text-xs text-white truncate">{doc.name}</span>
                              </div>
                              <button onClick={() => removeCompanyDoc(index, docIndex)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-400 cursor-pointer">
                                <i className="ri-close-line text-sm"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={() => setStep('confirm')} className="flex-1 px-5 py-3 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-arrow-left-line mr-1"></i>{t('roleGate.back')}
          </button>
          <button onClick={() => void completeRoleAddition()} disabled={!canSubmitUpload() || isAddingRole}
            className={`flex-1 px-5 py-3 ${colors.btn} text-white font-semibold rounded-lg ${colors.btnHover} transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}>
            <i className={isAddingRole ? 'ri-loader-4-line animate-spin mr-1' : 'ri-check-line mr-1'}></i>
            {isAddingRole ? 'Saving...' : t('roleGate.completeSetup')}
          </button>
        </div>
      </ModalShell>
    );
  }

  // ─── Role confirmation ─────────────────────────────────────────────────────
  return (
    <ModalShell onClose={handleClose}>
      <CloseButton onClose={handleClose} />
      <div className="text-center">
        <div className={`w-16 h-16 flex items-center justify-center rounded-full ${colors.iconBg} mx-auto mb-4`}>
          <i className={`${roleIcon} text-3xl ${colors.text}`}></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{t('roleGate.addRoleTitle', { role: roleLabel })}</h3>
        <p className="text-gray-400 text-sm mb-4">
          {t('roleGate.toDoAction', { action: actionLabel.toLowerCase() })}{' '}
          <span className={`font-semibold ${colors.text}`}>{roleLabel}</span>{' '}
          {t('roleGate.roleOnAccount')}
        </p>

        <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 mb-4 text-left`}>
          <p className={`text-sm ${colors.text}`}>
            <i className="ri-information-line mr-1"></i>
            {getRoleDescription(requiredRole)}
          </p>
        </div>

        {needsSetup && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-left">
            <p className="text-xs font-medium text-white mb-2">
              <i className="ri-list-check-3 mr-1 text-amber-400"></i>
              Required setup
            </p>
            {requiredRole === 'freelancer' && (
              <ul className="text-xs text-gray-400 space-y-1">
                <li><i className={`ri-checkbox-circle-line ${colors.text} mr-1`}></i>Country, phone number, and hourly rate</li>
                <li><i className={`ri-checkbox-circle-line ${colors.text} mr-1`}></i>At least one portfolio item with title, description, category, and file</li>
              </ul>
            )}
            {requiredRole === 'client' && (
              <ul className="text-xs text-gray-400 space-y-1">
                <li><i className={`ri-checkbox-circle-line ${colors.text} mr-1`}></i>Country and phone number</li>
              </ul>
            )}
            {requiredRole === 'applicant' && (
              <ul className="text-xs text-gray-400 space-y-1">
                <li><i className={`ri-checkbox-circle-line ${colors.text} mr-1`}></i>{t('roleGate.cvResumeReq')}</li>
              </ul>
            )}
            {requiredRole === 'employer' && (
              <ul className="text-xs text-gray-400 space-y-1">
                <li><i className={`ri-checkbox-circle-line ${colors.text} mr-1`}></i>{t('roleGate.companyInfoReq')}</li>
                <li><i className={`ri-checkbox-circle-line ${colors.text} mr-1`}></i>{t('roleGate.companyVerificationReq')}</li>
              </ul>
            )}
          </div>
        )}

        <p className="text-gray-400 text-sm mb-6">
          {t('roleGate.wouldYouLikeToAdd')}{' '}
          <span className={`font-semibold ${colors.text}`}>{roleLabel}</span>{' '}
          {t('roleGate.roleToAccount')}
        </p>

        <div className="flex gap-3">
          <button onClick={handleClose} className="flex-1 px-5 py-3 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer">
            {t('roleGate.cancel')}
          </button>
          <button onClick={handleAddRole} className={`flex-1 px-5 py-3 ${colors.btn} text-white font-semibold rounded-lg ${colors.btnHover} transition-colors whitespace-nowrap cursor-pointer`}>
            {needsSetup ? (
              <><i className="ri-arrow-right-line mr-1"></i>{t('roleGate.continue')}</>
            ) : (
              <><i className="ri-add-line mr-1"></i>{t('roleGate.addRole')}</>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default RoleGateModal;
