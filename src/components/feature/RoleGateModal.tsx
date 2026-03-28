import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface RoleGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRole: UserRole;
  roleLabel: string;
  actionLabel: string;
  onRoleAdded?: () => void;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface Company {
  name: string;
  position: string;
  documents: UploadedFile[];
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
};

const roleIcons: Record<UserRole, string> = {
  freelancer: 'ri-code-s-slash-line',
  client: 'ri-briefcase-line',
  employer: 'ri-building-line',
  applicant: 'ri-file-user-line',
  learner: 'ri-graduation-cap-line',
};

const requiresUpload: Record<UserRole, boolean> = {
  freelancer: true,
  client: false,
  employer: true,
  applicant: true,
  learner: false,
};

const RoleGateModal = ({ isOpen, onClose, requiredRole, roleLabel, actionLabel, onRoleAdded }: RoleGateModalProps) => {
  const { user, isAuthenticated, addRole } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<'check' | 'confirm' | 'upload' | 'success'>('check');

  const [portfolioFiles, setPortfolioFiles] = useState<UploadedFile[]>([]);
  const [freelancerDocuments, setFreelancerDocuments] = useState<UploadedFile[]>([]);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const freelancerDocsInputRef = useRef<HTMLInputElement>(null);

  const [cvFile, setCvFile] = useState<UploadedFile | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [companies, setCompanies] = useState<Company[]>([{ name: '', position: '', documents: [] }]);
  const [activeCompanyIndex, setActiveCompanyIndex] = useState(0);

  if (!isOpen) return null;

  const colors = roleColors[requiredRole];
  const roleIcon = roleIcons[requiredRole];
  const needsUpload = requiresUpload[requiredRole];
  const needsLogin = !isAuthenticated;
  const hasRole = user?.roles.includes(requiredRole);

  const handleLoginRedirect = () => { onClose(); navigate('/login'); };

  const resetState = () => {
    setStep('check');
    setPortfolioFiles([]);
    setFreelancerDocuments([]);
    setCvFile(null);
    setCompanies([{ name: '', position: '', documents: [] }]);
    setActiveCompanyIndex(0);
  };

  const handleAddRole = () => {
    if (needsUpload) { setStep('upload'); } else { completeRoleAddition(); }
  };

  const completeRoleAddition = () => {
    addRole(requiredRole);
    setStep('success');
    setTimeout(() => { resetState(); onClose(); if (onRoleAdded) onRoleAdded(); }, 1500);
  };

  const handleClose = () => { resetState(); onClose(); };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }));
      setter(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCvFile({ name: file.name, size: file.size, type: file.type });
    e.target.value = '';
  };

  const handleCompanyDocUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }));
      setCompanies(prev => prev.map((c, i) => i === index ? { ...c, documents: [...c.documents, ...newFiles] } : c));
    }
    e.target.value = '';
  };

  const removeFile = (index: number, setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const removeCompanyDoc = (companyIndex: number, docIndex: number) => {
    setCompanies(prev => prev.map((c, i) =>
      i === companyIndex ? { ...c, documents: c.documents.filter((_, di) => di !== docIndex) } : c
    ));
  };

  const addCompany = () => {
    setCompanies(prev => [...prev, { name: '', position: '', documents: [] }]);
    setActiveCompanyIndex(companies.length);
  };

  const removeCompany = (index: number) => {
    if (companies.length > 1) {
      setCompanies(prev => prev.filter((_, i) => i !== index));
      if (activeCompanyIndex >= index && activeCompanyIndex > 0) setActiveCompanyIndex(activeCompanyIndex - 1);
    }
  };

  const updateCompany = (index: number, field: 'name' | 'position', value: string) => {
    setCompanies(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const canSubmitUpload = () => {
    if (requiredRole === 'freelancer') return portfolioFiles.length > 0 && freelancerDocuments.length > 0;
    if (requiredRole === 'applicant') return cvFile !== null;
    if (requiredRole === 'employer') return companies.every(c => c.name.trim() && c.position.trim() && c.documents.length > 0);
    return true;
  };

  const getRoleDescription = (role: UserRole): string => t(`roleGate.${role}Desc`);

  // ─── Shared modal shell ────────────────────────────────────────────────────
  const Shell = ({ children, wide = false, scrollable = false }: { children: React.ReactNode; wide?: boolean; scrollable?: boolean }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
      <div className={`relative bg-[#252b42] rounded-2xl border border-white/10 p-6 sm:p-8 w-full ${wide ? 'max-w-lg' : 'max-w-md'} animate-[fadeInScale_0.2s_ease-out] ${scrollable ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
        {children}
      </div>
    </div>
  );

  const CloseBtn = () => (
    <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors">
      <i className="ri-close-line text-xl"></i>
    </button>
  );

  // ─── Not logged in ─────────────────────────────────────────────────────────
  if (needsLogin) {
    return (
      <Shell>
        <CloseBtn />
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
      </Shell>
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
      <Shell wide scrollable>
        <CloseBtn />
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

        {/* Freelancer Upload */}
        {requiredRole === 'freelancer' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <i className={`ri-folder-image-line mr-1 ${colors.text}`}></i>
                {t('roleGate.portfolioFiles')} <span className="text-red-400">*</span>
              </label>
              <p className="text-gray-500 text-xs mb-3">{t('roleGate.portfolioUploadDesc')}</p>
              <input ref={portfolioInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUpload(e, setPortfolioFiles)} />
              <div onClick={() => portfolioInputRef.current?.click()} className={`border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer ${colors.uploadHover} transition-all`}>
                <i className="ri-upload-cloud-2-line text-2xl text-gray-400 mb-1"></i>
                <p className="text-sm text-gray-400">{t('roleGate.clickToUploadPortfolio')}</p>
              </div>
              {portfolioFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {portfolioFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <i className={`ri-file-line ${colors.text}`}></i>
                        <span className="text-sm text-white truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button onClick={() => removeFile(index, setPortfolioFiles)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-400 cursor-pointer">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <i className={`ri-file-text-line mr-1 ${colors.text}`}></i>
                {t('roleGate.verificationDocuments')} <span className="text-red-400">*</span>
              </label>
              <p className="text-gray-500 text-xs mb-3">{t('roleGate.verificationUploadDesc')}</p>
              <input ref={freelancerDocsInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUpload(e, setFreelancerDocuments)} />
              <div onClick={() => freelancerDocsInputRef.current?.click()} className={`border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer ${colors.uploadHover} transition-all`}>
                <i className="ri-upload-cloud-2-line text-2xl text-gray-400 mb-1"></i>
                <p className="text-sm text-gray-400">{t('roleGate.clickToUploadDocs')}</p>
              </div>
              {freelancerDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {freelancerDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <i className={`ri-file-text-line ${colors.text}`}></i>
                        <span className="text-sm text-white truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button onClick={() => removeFile(index, setFreelancerDocuments)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-400 cursor-pointer">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
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
                      <label className="block text-xs text-gray-400 mb-1">{t('roleGate.yourPosition')}</label>
                      <input type="text" value={company.position} onChange={(e) => updateCompany(index, 'position', e.target.value)}
                        placeholder={t('roleGate.positionPlaceholder')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">{t('roleGate.verificationDocs')}</label>
                      <div onClick={() => {
                        setActiveCompanyIndex(index);
                        setTimeout(() => {
                          const input = document.createElement('input');
                          input.type = 'file'; input.multiple = true; input.accept = 'image/*,.pdf,.doc,.docx';
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
          <button onClick={completeRoleAddition} disabled={!canSubmitUpload()}
            className={`flex-1 px-5 py-3 ${colors.btn} text-white font-semibold rounded-lg ${colors.btnHover} transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}>
            <i className="ri-check-line mr-1"></i>{t('roleGate.completeSetup')}
          </button>
        </div>
      </Shell>
    );
  }

  // ─── Role confirmation ─────────────────────────────────────────────────────
  return (
    <Shell>
      <CloseBtn />
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

        {needsUpload && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-left">
            <p className="text-xs font-medium text-white mb-2">
              <i className="ri-upload-cloud-line mr-1 text-amber-400"></i>
              {t('roleGate.requiredDocuments')}
            </p>
            {requiredRole === 'freelancer' && (
              <ul className="text-xs text-gray-400 space-y-1">
                <li><i className={`ri-checkbox-circle-line ${colors.text} mr-1`}></i>{t('roleGate.portfolioFilesReq')}</li>
                <li><i className={`ri-checkbox-circle-line ${colors.text} mr-1`}></i>{t('roleGate.verificationDocsReq')}</li>
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
            {needsUpload ? (
              <><i className="ri-arrow-right-line mr-1"></i>{t('roleGate.continue')}</>
            ) : (
              <><i className="ri-add-line mr-1"></i>{t('roleGate.addRole')}</>
            )}
          </button>
        </div>
      </div>
    </Shell>
  );
};

export default RoleGateModal;
