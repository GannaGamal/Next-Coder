
import { useState } from 'react';

interface ProfileSettingsSectionProps {
  accentColor?: string;
}

const ProfileSettingsSection = ({ accentColor = 'purple' }: ProfileSettingsSectionProps) => {
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const colorClasses: Record<string, { bg: string; hover: string; border: string; text: string }> = {
    purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', border: 'focus:border-purple-500', text: 'text-purple-400' },
    pink: { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', border: 'focus:border-pink-500', text: 'text-pink-400' },
    orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', border: 'focus:border-orange-500', text: 'text-orange-400' },
    violet: { bg: 'bg-violet-500', hover: 'hover:bg-violet-600', border: 'focus:border-violet-500', text: 'text-violet-400' },
    emerald: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', border: 'focus:border-emerald-500', text: 'text-emerald-400' },
  };

  const colors = colorClasses[accentColor] || colorClasses.purple;

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('New password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
      showSuccess('Password updated successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
          <i className="ri-checkbox-circle-fill text-green-400 text-xl"></i>
          <span className="text-green-400 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Password Change Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white">Password & Security</h3>
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
          >
            {showPasswordSection ? (
              <>
                <i className="ri-close-line mr-2"></i>Cancel
              </>
            ) : (
              <>
                <i className="ri-lock-password-line mr-2"></i>Change Password
              </>
            )}
          </button>
        </div>

        {showPasswordSection && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-white/80 text-xs sm:text-sm mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-sm sm:text-base text-white placeholder-white/40 focus:outline-none ${colors.border}`}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-white/80 text-xs sm:text-sm mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-sm sm:text-base text-white placeholder-white/40 focus:outline-none ${colors.border}`}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div>
              <label className="block text-white/80 text-xs sm:text-sm mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-sm sm:text-base text-white placeholder-white/40 focus:outline-none ${colors.border}`}
                placeholder="Confirm new password"
              />
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={saving}
              className={`w-full px-4 sm:px-6 py-2 sm:py-3 ${colors.bg} text-white text-sm sm:text-base font-semibold rounded-lg ${colors.hover} transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer`}
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Updating Password...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <i className="ri-save-line mr-2"></i>
                  Update Password
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettingsSection;
