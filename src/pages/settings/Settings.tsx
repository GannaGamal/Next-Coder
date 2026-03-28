import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../../components/feature/LanguageSwitcher';
import { changePassword } from '../../services/auth.service';

const Settings = () => {
  const { isLightMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // ── Change Password ───────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSave = async () => {
    setPasswordError('');
    if (!passwordData.current || !passwordData.newPass || !passwordData.confirm) {
      setPasswordError(t('settings.errorFillAllFields'));
      return;
    }
    if (passwordData.newPass.length < 8) {
      setPasswordError(t('settings.errorMinLength'));
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      setPasswordError(t('settings.errorPasswordMatch'));
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(passwordData.current, passwordData.newPass, passwordData.confirm);
      setPasswordData({ current: '', newPass: '', confirm: '' });
      setShowPassword(false);
      setPasswordSuccess(t('settings.passwordUpdated'));
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t('settings.errorFillAllFields'));
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Deactivate Account ────────────────────────────────────────────────────
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateInput, setDeactivateInput] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  const handleDeactivate = () => {
    if (deactivateInput !== 'DEACTIVATE') return;
    setDeactivating(true);
    setTimeout(() => {
      setDeactivating(false);
      setShowDeactivateModal(false);
      logout();
      navigate('/');
    }, 1500);
  };

  const passwordFields = [
    {
      key: 'current',
      label: t('settings.currentPassword'),
      placeholder: t('settings.currentPasswordPlaceholder'),
    },
    {
      key: 'newPass',
      label: t('settings.newPassword'),
      placeholder: t('settings.newPasswordPlaceholder'),
    },
    {
      key: 'confirm',
      label: t('settings.confirmNewPassword'),
      placeholder: t('settings.confirmNewPasswordPlaceholder'),
    },
  ];

  return (
    <div className={`min-h-screen bg-navy-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
                <i className="ri-settings-3-line text-white/70"></i>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('settings.title')}</h1>
            </div>
            <p className="text-white/40 text-sm mt-1 ms-13">{t('settings.subtitle')}</p>
          </div>

          {/* Global success toast */}
          {passwordSuccess && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm mb-5">
              <i className="ri-checkbox-circle-fill flex-shrink-0"></i>
              {passwordSuccess}
            </div>
          )}

          <div className="space-y-4">

            {/* ── Appearance ───────────────────────────────────────────── */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 flex items-center justify-center bg-amber-500/20 rounded-xl">
                  <i className="ri-contrast-line text-amber-400"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{t('settings.appearance')}</h2>
                  <p className="text-white/40 text-xs">{t('settings.appearanceDesc')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{t('settings.theme')}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {isLightMode ? t('settings.lightModeOn') : t('settings.darkModeOn')}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap font-medium"
                >
                  <i className={isLightMode ? 'ri-moon-line' : 'ri-sun-line'}></i>
                  {isLightMode ? t('settings.switchToDark') : t('settings.switchToLight')}
                </button>
              </div>
            </div>

            {/* ── Language ─────────────────────────────────────────────── */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 flex items-center justify-center bg-teal-500/20 rounded-xl">
                  <i className="ri-translate-2 text-teal-400"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{t('settings.language')}</h2>
                  <p className="text-white/40 text-xs">{t('settings.languageDesc')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{t('settings.displayLanguage')}</p>
                  <p className="text-white/40 text-xs mt-0.5">{t('settings.displayLanguageDesc')}</p>
                </div>
                <LanguageSwitcher />
              </div>
            </div>

            {/* ── Security ─────────────────────────────────────────────── */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 flex items-center justify-center bg-violet-500/20 rounded-xl">
                  <i className="ri-shield-keyhole-line text-violet-400"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{t('settings.security')}</h2>
                  <p className="text-white/40 text-xs">{t('settings.securityDesc')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{t('settings.password')}</p>
                  <p className="text-white/40 text-xs mt-0.5">{t('settings.passwordDesc')}</p>
                </div>
                <button
                  onClick={() => { setShowPassword(p => !p); setPasswordError(''); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap font-medium"
                >
                  <i className={showPassword ? 'ri-close-line' : 'ri-key-2-line'}></i>
                  {showPassword ? t('settings.cancelBtn') : t('settings.changePassword')}
                </button>
              </div>

              {showPassword && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  {passwordError && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                      <i className="ri-error-warning-line flex-shrink-0"></i>
                      {passwordError}
                    </div>
                  )}
                  {passwordFields.map(field => (
                    <div key={field.key}>
                      <label className="text-white/50 text-xs block mb-1.5">{field.label}</label>
                      <input
                        type="password"
                        value={passwordData[field.key as keyof typeof passwordData]}
                        onChange={e => setPasswordData(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handlePasswordSave}
                    disabled={passwordSaving}
                    className="w-full py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {passwordSaving
                      ? <><i className="ri-loader-4-line animate-spin"></i>{t('settings.updating')}</>
                      : <><i className="ri-save-line"></i>{t('settings.updatePassword')}</>}
                  </button>
                </div>
              )}
            </div>

            {/* ── Account / Danger Zone ─────────────────────────────── */}
            <div className="bg-white/5 rounded-2xl border border-red-500/15 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 flex items-center justify-center bg-red-500/20 rounded-xl">
                  <i className="ri-user-settings-line text-red-400"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{t('settings.account')}</h2>
                  <p className="text-white/40 text-xs">{t('settings.accountDesc')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{t('settings.deactivateAccount')}</p>
                  <p className="text-white/40 text-xs mt-0.5">{t('settings.deactivateDesc')}</p>
                </div>
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap font-medium"
                >
                  <i className="ri-user-unfollow-line"></i>
                  {t('settings.deactivateBtn')}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />

      {/* ── Deactivate Confirmation Modal ───────────────────────────── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-[#13182e] rounded-2xl border border-white/10 max-w-md w-full p-6 shadow-2xl ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="w-14 h-14 flex items-center justify-center bg-red-500/20 rounded-2xl mx-auto mb-4">
              <i className="ri-user-unfollow-line text-red-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">{t('settings.deactivateTitle')}</h3>
            <p className="text-white/50 text-sm text-center mb-1">{t('settings.deactivateBody')}</p>
            <p className="text-white/40 text-xs text-center mb-6">
              {t('settings.deactivateConfirmInstruction', { keyword: 'DEACTIVATE' }).split('DEACTIVATE').map((part, i, arr) => (
                i < arr.length - 1 ? (
                  <span key={i}>{part}<span className="text-white font-mono font-semibold bg-white/10 px-1.5 py-0.5 rounded">DEACTIVATE</span></span>
                ) : <span key={i}>{part}</span>
              ))}
            </p>

            <input
              type="text"
              value={deactivateInput}
              onChange={e => setDeactivateInput(e.target.value)}
              placeholder={t('settings.deactivatePlaceholder')}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-red-500 mb-4 transition-colors text-center font-mono tracking-widest"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeactivateModal(false); setDeactivateInput(''); }}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/15 transition-all cursor-pointer whitespace-nowrap"
              >
                {t('settings.cancelBtn')}
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivateInput !== 'DEACTIVATE' || deactivating}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deactivating
                  ? <><i className="ri-loader-4-line animate-spin"></i>{t('settings.processing')}</>
                  : <><i className="ri-user-unfollow-line"></i>{t('settings.deactivateBtn')}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
