import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { registerUser, confirmEmailOtp, resendOtp } from '../../services/auth.service';
import rocketImage from '../../assets/space-rocket.png';

interface Company {
  id: string;
  name: string;
  industry: string;
  image: File | null;
  documents: File[];
}

/* ─── Validation helpers ─── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validatePassword = (pw: string): string | null => {
  if (pw.length < 6) return 'Password must be at least 6 characters.';
  if (!/[a-zA-Z]/.test(pw)) return 'Password must contain at least one letter.';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number.';
  if (!/[^a-zA-Z0-9]/.test(pw)) return 'Password must contain at least one special character.';
  return null;
};

/* ─── Password strength indicator ─── */
const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (/[a-zA-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/5' };
  if (score === 2) return { label: 'Fair', color: 'bg-orange-500', width: 'w-2/5' };
  if (score === 3) return { label: 'Good', color: 'bg-yellow-400', width: 'w-3/5' };
  if (score === 4) return { label: 'Strong', color: 'bg-green-400', width: 'w-4/5' };
  return { label: 'Very Strong', color: 'bg-emerald-400', width: 'w-full' };
};

const RESEND_COOLDOWN = 60; // seconds

const toApiRoleName = (role: UserRole): string => {
  if (role === 'applicant') return 'Job Seeker';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: [] as UserRole[],
  });
  const [error, setError] = useState('');
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ─── OTP state ─── */
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  /* ─── Resend cooldown timer ─── */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  /* ─── Redirect to home after OTP success ─── */
  useEffect(() => {
    if (otpSuccess) {
      const timer = setTimeout(() => navigate('/'), 2500);
      return () => clearTimeout(timer);
    }
  }, [otpSuccess, navigate]);

  const roleOptions = [
    { value: 'freelancer' as UserRole, label: t('auth.roleFreelancer'), icon: 'ri-briefcase-line', description: t('auth.roleDescFreelancer'), requiresUpload: true },
    { value: 'client' as UserRole, label: t('auth.roleClient'), icon: 'ri-user-star-line', description: t('auth.roleDescClient'), requiresUpload: false },
    { value: 'employer' as UserRole, label: t('auth.roleEmployer'), icon: 'ri-building-line', description: t('auth.roleDescEmployer'), requiresUpload: true },
    { value: 'applicant' as UserRole, label: t('auth.roleApplicant'), icon: 'ri-file-user-line', description: t('auth.roleDescApplicant'), requiresUpload: true },
    { value: 'learner' as UserRole, label: t('auth.roleLearner'), icon: 'ri-graduation-cap-line', description: t('auth.roleDescLearner'), requiresUpload: false },
  ];

  const toggleRole = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role],
    }));
  };

  /* ─── Step 1 validation ─── */
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    const pwError = validatePassword(formData.password);
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (pwError) {
      errors.password = pwError;
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setError('');
    setApiErrors([]);
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (formData.roles.length === 0) { setError(t('auth.selectOneRole')); return; }
      const requiresUploads = formData.roles.some(role => ['freelancer', 'applicant', 'employer'].includes(role));
      if (requiresUploads) { setStep(3); } else { handleSubmitApi(); }
    }
  };

  /* ─── Real API Submit ─── */
  const handleSubmitApi = async () => {
    if (formData.roles.includes('applicant') && !cvFile) { setError(t('auth.uploadCVRequired')); return; }
    if (formData.roles.includes('employer') && companies.length === 0) { setError(t('auth.uploadCompanyRequired')); return; }
    if (formData.roles.includes('employer') && companies.some(c => !c.image)) {
      setError('Please upload a company image for each company.');
      return;
    }
    setError('');
    setApiErrors([]);
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('FullName', formData.name.trim());
      payload.append('Email', formData.email.trim());
      payload.append('Password', formData.password);
      payload.append('ConfirmPassword', formData.confirmPassword);
      payload.append('RememberMe', 'false');
      formData.roles.forEach((role) => payload.append('Roles', toApiRoleName(role)));
      if (cvFile) payload.append('CvFile', cvFile);
      companies.forEach((company, index) => {
        payload.append(`Companies[${index}].name`, company.name);
        payload.append(`Companies[${index}].industry`, company.industry);
        if (company.image) {
          // Backend currently validates LogoUrl as required; send the logo file under that key.
          payload.append(`Companies[${index}].LogoUrl`, company.image);
          // Keep compatibility keys for backend variants.
          payload.append(`Companies[${index}].logoUrl`, company.image);
          payload.append(`Companies[${index}].image`, company.image);
        }
        company.documents.forEach(doc => payload.append(`Companies[${index}].documents`, doc));
      });

      await registerUser(payload);

      /* ── Go to OTP verification step ── */
      setStep(4);
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      // registerUser throws string[] on validation errors
      if (Array.isArray(err)) {
        const collected = err as string[];
        const allText = collected.join(' ').toLowerCase();
        if (
          allText.includes('email') &&
          (allText.includes('taken') || allText.includes('exist') || allText.includes('duplicate') || allText.includes('already'))
        ) {
          setFieldErrors(prev => ({ ...prev, email: collected[0] }));
          setStep(1);
        } else if (
          allText.includes('name') &&
          (allText.includes('taken') || allText.includes('exist') || allText.includes('duplicate') || allText.includes('already'))
        ) {
          setFieldErrors(prev => ({ ...prev, name: collected[0] }));
          setStep(1);
        }
        setApiErrors(collected);
      } else {
        setApiErrors(['We could not complete registration right now. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitApi();
  };

  /* ─── OTP input handlers ─── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => { newOtp[i] = char; });
      setOtp(newOtp);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  /* ─── Verify OTP ─── */
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const apiUser = await confirmEmailOtp(formData.email.trim(), otpString);

      // Some backend responses return a token here, but the reliable way to
      // establish a session is to sign in with the verified credentials.
      if (apiUser.token) {
        localStorage.setItem('authToken', apiUser.token);
      }

      await login(formData.email.trim(), formData.password, false);

      setOtpSuccess(true);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : 'That verification code is invalid or expired. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ─── Resend OTP ─── */
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setOtpError('');
    try {
      await resendOtp(formData.email.trim());
      setResendCooldown(RESEND_COOLDOWN);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : 'We could not resend the code right now. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  /* ─── Company helpers ─── */
  const addCompany = () => setCompanies([...companies, { id: Date.now().toString(), name: '', industry: '', image: null, documents: [] }]);
  const updateCompany = (id: string, field: string, value: string) => setCompanies(companies.map(c => c.id === id ? { ...c, [field]: value } : c));
  const updateCompanyImage = (id: string, file: File | null) => setCompanies(companies.map(c => c.id === id ? { ...c, image: file } : c));
  const addCompanyDocument = (id: string, file: File) => setCompanies(companies.map(c => c.id === id ? { ...c, documents: [...c.documents, file] } : c));
  const removeCompanyDocument = (companyId: string, docIndex: number) => setCompanies(companies.map(c => c.id === companyId ? { ...c, documents: c.documents.filter((_, i) => i !== docIndex) } : c));
  const removeCompany = (id: string) => setCompanies(companies.filter(c => c.id !== id));

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg">
              <img
                src={rocketImage}
                alt="rocket"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white">Next Coder</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {step === 4 && otpSuccess ? 'Email Verified!' : step === 4 ? 'Verify Your Email' : t('auth.createAccountTitle')}
            </h1>
            <p className="text-white/60 text-sm">
              {step === 4 && otpSuccess
                ? 'Welcome aboard! Taking you home...'
                : step === 4
                ? `We sent a 6-digit code to ${formData.email}`
                : t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {[1, 2, 3, 4].map((s, i) => (
              <>
                <div
                  key={s}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold transition-all ${step >= s ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/50'}`}
                >
                  {step > s ? <i className="ri-check-line text-xl"></i> : s}
                </div>
                {i < 3 && (
                  <div key={`line-${s}`} className="flex-1 mx-3">
                    <div className={`h-1 rounded-full transition-all ${step > s ? 'bg-purple-500' : 'bg-white/10'}`}></div>
                  </div>
                )}
              </>
            ))}
          </div>

          {/* Global Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
              <i className="ri-error-warning-line text-red-400 text-lg mt-0.5 mr-3 shrink-0"></i>
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* API Errors */}
          {apiErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center mb-2">
                <i className="ri-error-warning-line text-red-400 text-lg mr-2 shrink-0"></i>
                <span className="text-sm font-semibold text-red-400">
                  {apiErrors.length === 1 ? 'Registration failed' : `${apiErrors.length} issues found`}
                </span>
              </div>
              {apiErrors.length === 1 ? (
                <p className="text-sm text-red-300 ml-6">{apiErrors[0]}</p>
              ) : (
                <ul className="ml-6 space-y-1">
                  {apiErrors.map((msg, i) => (
                    <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                      {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ─── Step 1: Account Details ─── */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-5" noValidate>
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">{t('auth.fullName')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="ri-user-line text-white/40 text-lg"></i>
                  </div>
                  <input
                    type="text" id="name" value={formData.name}
                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFieldErrors(prev => ({ ...prev, name: '' })); }}
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-white placeholder-white/40 ${fieldErrors.name ? 'border-red-500/60' : 'border-white/10'}`}
                    placeholder={t('auth.fullNamePlaceholder')}
                  />
                </div>
                {fieldErrors.name && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i className="ri-error-warning-line"></i>{fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">{t('auth.email')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="ri-mail-line text-white/40 text-lg"></i>
                  </div>
                  <input
                    type="email" id="email" value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-white placeholder-white/40 ${fieldErrors.email ? 'border-red-500/60' : 'border-white/10'}`}
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </div>
                {fieldErrors.email && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i className="ri-error-warning-line"></i>{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">{t('auth.password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="ri-lock-line text-white/40 text-lg"></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} id="password" value={formData.password}
                    onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFieldErrors(prev => ({ ...prev, password: '' })); }}
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-white placeholder-white/40 ${fieldErrors.password ? 'border-red-500/60' : 'border-white/10'}`}
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                    <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-white/40 text-lg hover:text-white/60`}></i>
                  </button>
                </div>
                {/* Password strength bar */}
                {formData.password && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/40">Strength</span>
                      <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}></div>
                    </div>
                  </div>
                )}
                {/* Password requirements hint */}
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {[
                    { label: '6+ Characters', ok: formData.password.length >= 6 },
                    { label: 'At least One letter', ok: /[a-zA-Z]/.test(formData.password) },
                    { label: 'At least One number', ok: /[0-9]/.test(formData.password) },
                    { label: 'At least one Special Character', ok: /[^a-zA-Z0-9]/.test(formData.password) },
                  ].map(req => (
                    <div key={req.label} className={`flex items-center gap-1 text-xs transition-colors ${formData.password ? (req.ok ? 'text-green-400' : 'text-white/30') : 'text-white/20'}`}>
                      <i className={req.ok && formData.password ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}></i>
                      {req.label}
                    </div>
                  ))}
                </div>
                {fieldErrors.password && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i className="ri-error-warning-line"></i>{fieldErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="ri-lock-line text-white/40 text-lg"></i>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" value={formData.confirmPassword}
                    onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setFieldErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-white placeholder-white/40 ${fieldErrors.confirmPassword ? 'border-red-500/60' : 'border-white/10'}`}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                    <i className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-white/40 text-lg hover:text-white/60`}></i>
                  </button>
                </div>
                {/* Match indicator */}
                {formData.confirmPassword && (
                  <p className={`mt-1.5 text-xs flex items-center gap-1 ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                    <i className={formData.password === formData.confirmPassword ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'}></i>
                    {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                )}
                {fieldErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i className="ri-error-warning-line"></i>{fieldErrors.confirmPassword}</p>}
              </div>

              <button type="submit" className="w-full py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all whitespace-nowrap shadow-lg shadow-purple-500/25 cursor-pointer">
                {t('auth.continue')}
              </button>
              <div className="text-center pt-4">
                <p className="text-sm text-white/60">
                  {t('auth.alreadyAccount')}{' '}
                  <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">{t('auth.loginLink')}</Link>
                </p>
              </div>
            </form>
          )}

          {/* ─── Step 2: Select Roles ─── */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('auth.chooseRoles')}</h3>
                <p className="text-sm text-white/60 mb-6">{t('auth.chooseRolesDesc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleOptions.map((role) => (
                    <div key={role.value} onClick={() => toggleRole(role.value)}
                      className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all group ${formData.roles.includes(role.value) ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10' : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'}`}>
                      <div className="flex items-start">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${formData.roles.includes(role.value) ? 'bg-gradient-to-br from-purple-500 to-violet-500 shadow-md' : 'bg-white/10 group-hover:bg-purple-500/20'}`}>
                          <i className={`${role.icon} text-2xl ${formData.roles.includes(role.value) ? 'text-white' : 'text-white/60 group-hover:text-purple-400'}`}></i>
                        </div>
                        <div className="flex-1 ml-4">
                          <div className="font-semibold text-white mb-1 flex items-center gap-2">
                            {role.label}
                            {role.requiresUpload && (
                              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{t('auth.requiresUpload')}</span>
                            )}
                          </div>
                          <div className="text-xs text-white/60 leading-relaxed">{role.description}</div>
                        </div>
                        {formData.roles.includes(role.value) && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 flex items-center justify-center bg-purple-500 rounded-full">
                              <i className="ri-check-line text-white text-sm"></i>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setStep(1); setApiErrors([]); }} className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all whitespace-nowrap cursor-pointer">{t('auth.back')}</button>
                <button type="submit" className="flex-1 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all whitespace-nowrap shadow-lg shadow-purple-500/25 cursor-pointer">{t('auth.continue')}</button>
              </div>
            </form>
          )}

          {/* ─── Step 3: Upload Documents ─── */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('auth.uploadDocsTitle')}</h3>
                <p className="text-sm text-white/60 mb-6">{t('auth.uploadDocsDesc')}</p>

                {/* Applicant CV */}
                {formData.roles.includes('applicant') && (
                  <div className="mb-6 p-5 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg mr-3">
                        <i className="ri-file-user-line text-white text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{t('auth.jobSeekerCV')}</h4>
                        <p className="text-xs text-white/60">{t('auth.uploadCurriculumVitae')}</p>
                      </div>
                    </div>
                    <input type="file" id="cv-upload" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] || null)} className="hidden" />
                    <label htmlFor="cv-upload" className="flex items-center justify-center w-full p-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all">
                      {cvFile ? (
                        <div className="flex items-center text-white">
                          <i className="ri-file-text-line text-2xl mr-3 text-purple-400"></i>
                          <div><div className="font-medium text-sm">{cvFile.name}</div><div className="text-xs text-white/60">{(cvFile.size / 1024).toFixed(2)} KB</div></div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <i className="ri-upload-cloud-line text-3xl text-white/40 mb-2"></i>
                          <div className="text-sm text-white/60">{t('auth.clickUploadCV')}</div>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {/* Employer Companies */}
                {formData.roles.includes('employer') && (
                  <div className="mb-6 p-5 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg mr-3">
                          <i className="ri-building-line text-white text-xl"></i>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{t('auth.employerCompaniesLabel')}</h4>
                          <p className="text-xs text-white/60">{t('auth.addCompaniesDesc')}</p>
                        </div>
                      </div>
                      <button type="button" onClick={addCompany} className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-all whitespace-nowrap cursor-pointer">
                        <i className="ri-add-line mr-1"></i>{t('auth.addCompany')}
                      </button>
                    </div>
                    <div className="space-y-4">
                      {companies.map((company, index) => (
                        <div key={company.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white">{t('auth.companyLabel')} {index + 1}</span>
                            <button type="button" onClick={() => removeCompany(company.id)} className="text-red-400 hover:text-red-300 cursor-pointer"><i className="ri-delete-bin-line"></i></button>
                          </div>
                          <input type="text" placeholder={t('auth.companyNamePlaceholder')} value={company.name} onChange={(e) => updateCompany(company.id, 'name', e.target.value)}
                            className="w-full mb-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                          <input type="text" placeholder={t('auth.industryPlaceholder')} value={company.industry} onChange={(e) => updateCompany(company.id, 'industry', e.target.value)}
                            className="w-full mb-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                          <input type="file" id={`company-image-${company.id}`} accept="image/*" onChange={(e) => updateCompanyImage(company.id, e.target.files?.[0] || null)} className="hidden" />
                          <label htmlFor={`company-image-${company.id}`} className="mb-3 flex items-center justify-center w-full p-3 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all">
                            {company.image ? (
                              <div className="flex items-center justify-between w-full text-xs text-white">
                                <div className="flex items-center"><i className="ri-image-line mr-2 text-purple-400"></i>{company.image.name}</div>
                                <span className="text-white/60">{(company.image.size / 1024).toFixed(1)} KB</span>
                              </div>
                            ) : (
                              <div className="text-xs text-white/60"><i className="ri-image-add-line mr-1"></i>Upload company image</div>
                            )}
                          </label>
                          <input type="file" id={`company-docs-${company.id}`} multiple accept=".pdf,.doc,.docx" onChange={(e) => { Array.from(e.target.files || []).forEach(f => addCompanyDocument(company.id, f)); }} className="hidden" />
                          <label htmlFor={`company-docs-${company.id}`} className="flex items-center justify-center w-full p-3 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all">
                            <div className="text-xs text-white/60"><i className="ri-upload-line mr-1"></i>{t('auth.uploadCompanyDocs')}</div>
                          </label>
                          {company.documents.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {company.documents.map((doc, docIndex) => (
                                <div key={docIndex} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                  <div className="flex items-center text-white text-xs"><i className="ri-file-text-line mr-2 text-purple-400"></i>{doc.name}</div>
                                  <button type="button" onClick={() => removeCompanyDocument(company.id, docIndex)} className="text-red-400 hover:text-red-300 cursor-pointer"><i className="ri-close-line"></i></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {companies.length === 0 && <div className="text-center py-8 text-white/40 text-sm">{t('auth.noCompaniesYet')}</div>}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setStep(2); setApiErrors([]); }} className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all whitespace-nowrap cursor-pointer">{t('auth.back')}</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-purple-500/25 cursor-pointer">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2"><i className="ri-loader-4-line animate-spin mr-2"></i>Creating account...</span>
                  ) : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* ─── Step 4: Email OTP Verification ─── */}
          {step === 4 && !otpSuccess && (
            <div className="space-y-6">
              {/* Email icon */}
              <div className="flex justify-center mb-2">
                <div className="w-20 h-20 flex items-center justify-center bg-purple-500/20 rounded-full">
                  <i className="ri-mail-check-line text-4xl text-purple-400"></i>
                </div>
              </div>

              <div className="text-center">
                <p className="text-white/60 text-sm mb-1">Code sent to</p>
                <p className="text-white font-semibold">{formData.email}</p>
              </div>

              {/* OTP input boxes */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-4 text-center">Enter 6-digit verification code</label>
                <div className="flex items-center justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-bold bg-white/5 border-2 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                        otpError ? 'border-red-500/60' : digit ? 'border-purple-500/60' : 'border-white/10'
                      }`}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="mt-3 text-sm text-red-400 flex items-center justify-center gap-2">
                    <i className="ri-error-warning-line"></i>
                    {otpError}
                  </p>
                )}
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.join('').length < 6}
                className="w-full py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-purple-500/25 cursor-pointer"
              >
                {otpLoading ? (
                  <span className="flex items-center justify-center gap-2"><i className="ri-loader-4-line animate-spin mr-2"></i>Verifying...</span>
                ) : 'Verify Email'}
              </button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-sm text-white/50 mb-2">Didn&apos;t receive the code?</p>
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {resendLoading ? (
                    <span className="flex items-center justify-center gap-1"><i className="ri-loader-4-line animate-spin mr-1"></i>Sending...</span>
                  ) : resendCooldown > 0 ? (
                    `Resend code in ${resendCooldown}s`
                  ) : (
                    'Resend code'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── OTP Success Screen ─── */}
          {step === 4 && otpSuccess && (
            <div className="text-center py-8">
              <div className="w-24 h-24 flex items-center justify-center bg-green-500/20 rounded-full mx-auto mb-6">
                <i className="ri-shield-check-line text-5xl text-green-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Email Verified!</h3>
              <p className="text-white/60 mb-6 text-sm leading-relaxed">
                Your account for <strong className="text-white">{formData.email}</strong> is all set.<br />
                Taking you to the home page now.
              </p>
              <div className="flex items-center justify-center gap-2 text-white/40 text-sm mb-8">
                <i className="ri-loader-4-line animate-spin"></i>
                Redirecting...
              </div>
              <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all whitespace-nowrap">
                <i className="ri-home-line"></i>
                Go to Home
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-violet-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-violet-600/90"></div>
        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: 'ri-briefcase-line', label: t('auth.findProjects') },
                { icon: 'ri-team-line', label: t('auth.hireTalent') },
                { icon: 'ri-file-user-line', label: t('auth.applyForJobs') },
                { icon: 'ri-graduation-cap-line', label: t('auth.learnAndGrow') },
              ].map((item) => (
                <div key={item.icon} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <i className={`${item.icon} text-4xl text-white mb-3`}></i>
                  <div className="text-sm text-white/90 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">{t('auth.rightPanelTitle2')}</h2>
            <p className="text-lg text-white/90 leading-relaxed">{t('auth.rightPanelSubtitle2')}</p>
          </div>
          <div className="flex items-center space-x-8 mt-12">
            <div className="text-center"><div className="text-3xl font-bold text-white mb-1">5K+</div><div className="text-sm text-white/80">{t('auth.freelancersCount')}</div></div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center"><div className="text-3xl font-bold text-white mb-1">2.5K+</div><div className="text-sm text-white/80">{t('auth.projectsCount')}</div></div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center"><div className="text-3xl font-bold text-white mb-1">100+</div><div className="text-sm text-white/80">{t('auth.coursesCount')}</div></div>
          </div>
        </div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Register;
