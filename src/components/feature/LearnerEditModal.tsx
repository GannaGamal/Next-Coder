import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface LearnerEditData {
  bio: string;
  address: string;
  goals: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: LearnerEditData;
  onSave: (data: LearnerEditData) => void;
  accentColor?: 'violet' | 'purple' | 'pink' | 'orange' | 'emerald' | 'teal';
}

const colorConfig = {
  violet:  { btn: 'bg-violet-500 hover:bg-violet-600',  icon: 'text-violet-400',  border: 'focus:border-violet-500', ring: 'text-violet-400 bg-violet-500/20 border-violet-500/30'  },
  purple:  { btn: 'bg-purple-500 hover:bg-purple-600',  icon: 'text-purple-400',  border: 'focus:border-purple-500', ring: 'text-purple-400 bg-purple-500/20 border-purple-500/30'  },
  pink:    { btn: 'bg-pink-500 hover:bg-pink-600',      icon: 'text-pink-400',    border: 'focus:border-pink-500',   ring: 'text-pink-400 bg-pink-500/20 border-pink-500/30'        },
  orange:  { btn: 'bg-orange-500 hover:bg-orange-600',  icon: 'text-orange-400',  border: 'focus:border-orange-500', ring: 'text-orange-400 bg-orange-500/20 border-orange-500/30'  },
  emerald: { btn: 'bg-emerald-500 hover:bg-emerald-600',icon: 'text-emerald-400', border: 'focus:border-emerald-500',ring: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'},
  teal:    { btn: 'bg-teal-500 hover:bg-teal-600',      icon: 'text-teal-400',    border: 'focus:border-teal-500',   ring: 'text-teal-400 bg-teal-500/20 border-teal-500/30'        },
};

const LearnerEditModal = ({ isOpen, onClose, data, onSave, accentColor = 'emerald' }: Props) => {
  const { isLightMode } = useTheme();
  const [form, setForm] = useState<LearnerEditData>({ ...data });
  const cfg = colorConfig[accentColor];

  useEffect(() => {
    if (isOpen) { setForm({ ...data }); }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const setField = (key: keyof LearnerEditData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative rounded-2xl border p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto thin-scrollbar ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${isLightMode ? 'bg-gray-100' : 'bg-white/10'}`}>
            <i className={`ri-user-settings-line text-xl ${cfg.icon}`}></i>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>Edit Learner Profile</h3>
            <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Update your information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`border-t pt-4 ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>Learning Profile</p>

            <div className="mb-4">
              <label className={`flex items-center gap-2 text-sm mb-1.5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <i className={`ri-file-text-line ${cfg.icon}`}></i>
                Address
              </label>
              <textarea
                value={form.address}
                onChange={e => setField('address', e.target.value)}
                placeholder="Enter your address..."
                rows={4}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none resize-none ${cfg.border} transition-colors ${isLightMode ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
              />
            </div>

            <div className="mb-4">
              <label className={`flex items-center gap-2 text-sm mb-1.5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <i className={`ri-file-text-line ${cfg.icon}`}></i>
                About Me
              </label>
              <textarea
                value={form.bio}
                onChange={e => setField('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none resize-none ${cfg.border} transition-colors ${isLightMode ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
              />
            </div>

            <div>
              <label className={`flex items-center gap-2 text-sm mb-1.5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <i className={`ri-flag-line ${cfg.icon}`}></i>
                Learning Goals
              </label>
              <textarea
                value={form.goals}
                onChange={e => setField('goals', e.target.value)}
                placeholder="What do you want to achieve?"
                rows={4}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none resize-none ${cfg.border} transition-colors ${isLightMode ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 px-5 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 px-5 py-3 ${cfg.btn} text-white font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap`}
          >
            <i className="ri-save-line mr-2"></i>Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnerEditModal;
