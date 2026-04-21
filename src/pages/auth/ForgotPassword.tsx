import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resendOtp, resetPassword } from '../../services/auth.service';
import rocketImage from '../../assets/space-rocket.png';

type Stage = 'email' | 'reset' | 'success';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('email');

  // Stage 1
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Stage 2 – reset
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pwErrors, setPwErrors] = useState<string[]>([]);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Password validation
  const validatePassword = (pw: string): string[] => {
    const errs: string[] = [];
    if (pw.length < 6) errs.push('At least 6 characters');
    if (!/[a-zA-Z]/.test(pw)) errs.push('At least 1 letter');
    if (!/\d/.test(pw)) errs.push('At least 1 number');
    if (!/[^a-zA-Z0-9]/.test(pw)) errs.push('At least 1 special character');
    return errs;
  };

  // --- Stage 1: Send OTP ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    if (!email.trim()) { setEmailError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email address.'); return; }

    setEmailLoading(true);
    try {
      await forgotPassword(email);
      setStage('reset');
      startCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setEmailError(err instanceof Error ? err.message : 'We could not send a reset code right now. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  // --- OTP input helpers ---
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setResetError('');
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length) {
      const next = [...otp];
      digits.split('').forEach((d, i) => { if (i < 6) next[i] = d; });
      setOtp(next);
      otpRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  // --- Resend OTP ---
  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResetError('');
    try {
      await resendOtp(email);
      setOtp(['', '', '', '', '', '']);
      startCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : 'We could not resend the code right now. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // --- Stage 2: Reset Password ---
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    const otpString = otp.join('');
    if (otpString.length < 6) { setResetError('Please enter the complete 6-digit code.'); return; }

    const pwErrs = validatePassword(newPassword);
    if (pwErrs.length) { setPwErrors(pwErrs); return; }

    if (newPassword !== confirmPassword) { setResetError('Passwords do not match.'); return; }

    setResetLoading(true);
    try {
      await resetPassword({
        email,
        otp: otpString,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      setStage('success');
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : 'We could not reset your password right now. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const pwReqs = [
    { label: 'At least 6 characters', met: newPassword.length >= 6 },
    { label: 'At least 1 letter', met: /[a-zA-Z]/.test(newPassword) },
    { label: 'At least 1 number', met: /\d/.test(newPassword) },
    { label: 'At least 1 special character', met: /[^a-zA-Z0-9]/.test(newPassword) },
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left Side */}
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

          {/* ── STAGE 1: Email ── */}
          {stage === 'email' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
                <p className="text-white/60 text-sm">No worries — we'll send you a reset code.</p>
              </div>

              {emailError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                  <i className="ri-error-warning-line text-red-400 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                  <span className="text-sm text-red-400">{emailError}</span>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="ri-mail-line text-white/40 text-lg"></i>
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-white placeholder-white/40"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {emailLoading ? (
                    <span className="flex items-center justify-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>Sending code...
                    </span>
                  ) : 'Send reset code'}
                </button>
              </form>
            </>
          )}

          {/* ── STAGE 2: OTP + New Password ── */}
          {stage === 'reset' && (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 flex items-center justify-center bg-purple-500/20 rounded-2xl mb-4">
                  <i className="ri-lock-password-line text-purple-400 text-2xl"></i>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Reset your password</h1>
                <p className="text-white/60 text-sm">
                  Enter the 6-digit code sent to{' '}
                  <span className="text-white font-medium">{email}</span>{' '}
                  and choose a new password.
                </p>
              </div>

              {resetError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                  <i className="ri-error-warning-line text-red-400 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                  <span className="text-sm text-red-400">{resetError}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-5">
                {/* OTP boxes */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Verification code</label>
                  <div className="flex gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-full aspect-square text-center text-xl font-bold bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-white"
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-white/40">Didn't get the code?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || resendLoading}
                      className="text-xs font-medium text-purple-400 hover:text-purple-300 disabled:text-white/30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      {resendLoading ? (
                        <span className="flex items-center"><i className="ri-loader-4-line animate-spin mr-1"></i>Resending...</span>
                      ) : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">New password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="ri-lock-line text-white/40 text-lg"></i>
                    </div>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPwErrors([]); setResetError(''); }}
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-white placeholder-white/40"
                      placeholder="Create a new password"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                      <i className={`${showNew ? 'ri-eye-off-line' : 'ri-eye-line'} text-white/40 text-lg hover:text-white/60`}></i>
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {pwReqs.map((req) => (
                        <div key={req.label} className="flex items-center gap-1.5">
                          <i className={`text-xs ${req.met ? 'ri-checkbox-circle-fill text-emerald-400' : 'ri-circle-line text-white/30'}`}></i>
                          <span className={`text-xs ${req.met ? 'text-emerald-400' : 'text-white/40'}`}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {pwErrors.length > 0 && (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      {pwErrors.map((e) => <p key={e} className="text-xs text-red-400">{e}</p>)}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Confirm new password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="ri-lock-2-line text-white/40 text-lg"></i>
                    </div>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setResetError(''); }}
                      className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-white placeholder-white/40 ${
                        confirmPassword && newPassword !== confirmPassword ? 'border-red-500/50' : 'border-white/10'
                      }`}
                      placeholder="Repeat your new password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                      <i className={`${showConfirm ? 'ri-eye-off-line' : 'ri-eye-line'} text-white/40 text-lg hover:text-white/60`}></i>
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`mt-1.5 text-xs flex items-center gap-1 ${newPassword === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                      <i className={newPassword === confirmPassword ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'}></i>
                      {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || otp.join('').length < 6}
                  className="w-full py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {resetLoading ? (
                    <span className="flex items-center justify-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>Resetting password...
                    </span>
                  ) : 'Reset password'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setStage('email')}
                className="mt-6 inline-flex items-center text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-line mr-2"></i>Use a different email
              </button>
            </>
          )}

          {/* ── STAGE 3: Success ── */}
          {stage === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-emerald-500/20 rounded-full mx-auto mb-6">
                <i className="ri-shield-check-fill text-emerald-400 text-4xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Password reset!</h1>
              <p className="text-white/60 text-sm mb-8">
                Your password has been updated successfully.<br />
                You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all whitespace-nowrap"
              >
                Back to login
              </button>
            </div>
          )}

          {/* Back link (stages 1 & 2 only) */}
          {stage !== 'success' && (
            <div className="mt-8">
              <Link to="/login" className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
                <i className="ri-arrow-left-line mr-2"></i>Back to login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-violet-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-violet-600/90"></div>
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8">
            <div className="w-24 h-24 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-3xl mx-auto mb-6">
              <i className="ri-lock-unlock-line text-6xl text-white"></i>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Secure Password Reset</h2>
            <p className="text-lg text-white/90 leading-relaxed">
              We take your security seriously. Enter the code from your email and set a strong new password to regain access.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-8 mt-12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg">
                <i className="ri-shield-check-line text-white text-xl"></i>
              </div>
              <span className="text-white/90 text-sm">Encrypted</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg">
                <i className="ri-time-line text-white text-xl"></i>
              </div>
              <span className="text-white/90 text-sm">OTP Based</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg">
                <i className="ri-lock-password-line text-white text-xl"></i>
              </div>
              <span className="text-white/90 text-sm">Secure</span>
            </div>
          </div>
        </div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
