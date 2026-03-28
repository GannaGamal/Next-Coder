import { useState } from 'react';

interface LoginActivity {
  id: number;
  user: string;
  email: string;
  ipAddress: string;
  location: string;
  device: string;
  timestamp: string;
  status: 'success' | 'failed';
}

const SecuritySettings = () => {
  const [activeTab, setActiveTab] = useState<'activities' | 'settings'>('activities');
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const [loginActivities] = useState<LoginActivity[]>([
    {
      id: 1,
      user: 'John Smith',
      email: 'john.smith@example.com',
      ipAddress: '192.168.1.100',
      location: 'New York, USA',
      device: 'Chrome on Windows',
      timestamp: '2024-03-15 14:32:15',
      status: 'success',
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      ipAddress: '192.168.1.105',
      location: 'London, UK',
      device: 'Safari on MacOS',
      timestamp: '2024-03-15 13:45:22',
      status: 'success',
    },
    {
      id: 3,
      user: 'Michael Chen',
      email: 'michael.chen@example.com',
      ipAddress: '192.168.1.110',
      location: 'Tokyo, Japan',
      device: 'Firefox on Linux',
      timestamp: '2024-03-15 12:18:45',
      status: 'failed',
    },
    {
      id: 4,
      user: 'Emily Davis',
      email: 'emily.davis@example.com',
      ipAddress: '192.168.1.115',
      location: 'Sydney, Australia',
      device: 'Chrome on Android',
      timestamp: '2024-03-15 11:05:33',
      status: 'success',
    },
  ]);

  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    ipWhitelist: false,
    emailNotifications: true,
  });

  const handleResetPassword = () => {
    if (selectedUser) {
      alert(`Password reset link sent to ${selectedUser}`);
      setShowResetModal(false);
      setSelectedUser('');
    }
  };

  const updateSetting = (key: string, value: boolean | number) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'activities'
              ? 'bg-teal-500 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <i className="ri-shield-check-line mr-2"></i>
          Login Activities
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-teal-500 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <i className="ri-settings-3-line mr-2"></i>
          Security Settings
        </button>
      </div>

      {/* Login Activities Tab */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Login Activities</h2>
                <p className="text-white/60 text-sm mt-1">Monitor user login attempts and activities</p>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap font-semibold"
              >
                <i className="ri-lock-password-line mr-2"></i>
                Reset Password
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">IP Address</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Device</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Timestamp</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loginActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{activity.user}</p>
                          <p className="text-white/60 text-sm">{activity.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm font-mono">{activity.ipAddress}</td>
                      <td className="px-6 py-4 text-white/60 text-sm">{activity.location}</td>
                      <td className="px-6 py-4 text-white/60 text-sm">{activity.device}</td>
                      <td className="px-6 py-4 text-white/60 text-sm">{activity.timestamp}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            activity.status === 'success'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Platform Security Settings</h2>

            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h3 className="text-white font-semibold mb-1">Two-Factor Authentication</h3>
                  <p className="text-white/60 text-sm">Require 2FA for all admin accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>

              {/* Password Expiry */}
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Password Expiry</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => updateSetting('passwordExpiry', parseInt(e.target.value))}
                    className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                  />
                  <span className="text-white/60 text-sm">days</span>
                </div>
                <p className="text-white/60 text-sm mt-2">Users must change password after this period</p>
              </div>

              {/* Max Login Attempts */}
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Maximum Login Attempts</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                    className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                  />
                  <span className="text-white/60 text-sm">attempts</span>
                </div>
                <p className="text-white/60 text-sm mt-2">Account locked after exceeding this limit</p>
              </div>

              {/* Session Timeout */}
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Session Timeout</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                  />
                  <span className="text-white/60 text-sm">minutes</span>
                </div>
                <p className="text-white/60 text-sm mt-2">Auto logout after inactivity period</p>
              </div>

              {/* IP Whitelist */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h3 className="text-white font-semibold mb-1">IP Whitelist</h3>
                  <p className="text-white/60 text-sm">Restrict admin access to specific IP addresses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.ipWhitelist}
                    onChange={(e) => updateSetting('ipWhitelist', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h3 className="text-white font-semibold mb-1">Email Notifications</h3>
                  <p className="text-white/60 text-sm">Send alerts for suspicious activities</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap">
              <i className="ri-save-line mr-2"></i>
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Reset User Password</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">User Email</label>
                <input
                  type="email"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="Enter user email..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500 text-sm"
                />
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="ri-alert-line text-orange-400 text-xl mt-0.5"></i>
                  <div>
                    <p className="text-orange-400 font-semibold text-sm mb-1">Warning</p>
                    <p className="text-white/60 text-sm">
                      A password reset link will be sent to the user's email address. The current password will remain valid until the user sets a new one.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={!selectedUser}
                className="w-full py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-mail-send-line mr-2"></i>
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;