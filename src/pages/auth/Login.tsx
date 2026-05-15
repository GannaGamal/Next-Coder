import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { resendOtp, confirmEmailOtp } from '../../services/auth.service';
import rocketImage from '../../assets/space-rocket.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP verification state
  const [showOtpPanel, setShowOtpPanel] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerResend = async (silent = false) => {
    setResendLoading(true);
    if (!silent) setOtpError('');
    try {
      await resendOtp(email);
      startCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      // silent fail for auto-send
    } finally {
      setResendLoading(false);
    }
  };

  const handleLoginApiError = (message: string) => {
    const lower = message.toLowerCase();
    if (
      lower.includes('email is not confirmed') ||
      lower.includes('not confirmed') ||
      lower.includes('email not confirmed') ||
      lower.includes('confirm your email') ||
      lower.includes('unconfirmed')
    ) {
      setShowOtpPanel(true);
      setError('');
      triggerResend(true);
    } else {
      setError(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (!password) { setError('Password is required.'); return; }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'We could not sign you in. Please check your details and try again.';
      handleLoginApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Please enter the full 6-digit code.'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      const data = await confirmEmailOtp(email, code);

      // Persist token if present
      if (data.token) localStorage.setItem('authToken', data.token);

      setVerifySuccess(true);
      if (cooldownRef.current) clearInterval(cooldownRef.current);

      setTimeout(async () => {
        try {
          await login(email, password, rememberMe);
          navigate('/dashboard');
        } catch {
          navigate('/login');
        }
      }, 1500);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : 'That verification code is invalid or expired. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg">
              <img
                src={rocketImage}
                alt="rocket"
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white">Next Coder</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('auth.welcomeBack')}</h1>
            <p className="text-white/60 text-sm">{t('auth.loginSubtitle')}</p>
          </div>

          {/* Error */}
          {error && !showOtpPanel && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* OTP Verification Panel */}
          {showOtpPanel && (
            <div className="mb-6 p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              {verifySuccess ? (
                <div className="flex flex-col items-center py-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-green-500/20 rounded-full mb-3">
                    <i className="ri-checkbox-circle-line text-green-400 text-2xl"></i>
                  </div>
                  <p className="text-green-400 font-semibold text-sm">Email verified! Signing you in...</p>
                  <i className="ri-loader-4-line animate-spin text-green-400 text-lg mt-2"></i>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-mail-check-line text-amber-400 text-xl flex-shrink-0"></i>
                    <div>
                      <p className="text-amber-300 font-semibold text-sm">Email Verification Required</p>
                      <p className="text-white/50 text-xs mt-0.5">
                        We sent a 6-digit code to <span className="text-white/70 font-medium">{email}</span>
                      </p>
                    </div>
                  </div>

                  {/* OTP Boxes */}
                  <div className="flex gap-2 justify-center my-4">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-10 h-12 text-center text-lg font-bold bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                      />
                    ))}
                  </div>

                  {/* OTP Error */}
                  {otpError && (
                    <p className="text-red-400 text-xs text-center mb-3">{otpError}</p>
                  )}

                  {/* Verify Button */}
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.join('').length < 6}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-all whitespace-nowrap"
                  >
                    {otpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="ri-loader-4-line animate-spin"></i> Verifying...
                      </span>
                    ) : 'Verify Email'}
                  </button>

                  {/* Resend */}
                  <div className="flex items-center justify-center mt-3 gap-1 text-xs">
                    <span className="text-white/40">Didn&apos;t get the code?</span>
                    {resendCooldown > 0 ? (
                      <span className="text-white/40">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        onClick={() => triggerResend(false)}
                        disabled={resendLoading}
                        className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      >
                        {resendLoading ? 'Sending...' : 'Resend code'}
                      </button>
                    )}
                  </div>

                  {/* Back to form */}
                  <button
                    onClick={() => { setShowOtpPanel(false); setOtp(['','','','','','']); setOtpError(''); }}
                    className="w-full mt-3 text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer"
                  >
                    &larr; Back to sign in form
                  </button>
                </>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ri-mail-line text-white/40 text-lg"></i>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setShowOtpPanel(false); }}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-white placeholder-white/40"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-white/40 text-lg"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-white placeholder-white/40"
                  placeholder={t('auth.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                >
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-white/40 text-lg hover:text-white/60`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-white/60 group-hover:text-white/80">{t('auth.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  {t('auth.signingIn')}
                </span>
              ) : t('auth.loginBtn')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-navy-900 text-white/50">{t('auth.newToNextCoder')}</span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-white/10 rounded-lg font-semibold text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all whitespace-nowrap"
            >
              {t('auth.createAccountLink')}
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-violet-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-violet-600/90"></div>
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8">
            <div className="w-24 h-24 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-3xl mx-auto mb-6">
              <i className="ri-rocket-line text-6xl text-white"></i>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">{t('auth.rightPanelTitle')}</h2>
            <p className="text-lg text-white/90 leading-relaxed">{t('auth.rightPanelSubtitle')}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">5K+</div>
              <div className="text-sm text-white/80">{t('auth.freelancersCount')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">2.5K+</div>
              <div className="text-sm text-white/80">{t('auth.projectsCount')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">1.2K+</div>
              <div className="text-sm text-white/80">{t('auth.companiesCount')}</div>
            </div>
          </div>
        </div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Login;
