import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface ClientEditData {
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
  bio: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ClientEditData;
  onSave: (data: ClientEditData) => void;
  accentColor?: 'violet' | 'purple' | 'pink' | 'orange' | 'emerald' | 'teal';
}

const colorConfig = {
  violet:  { btn: 'bg-violet-500 hover:bg-violet-600',  icon: 'text-violet-400',  border: 'focus:border-violet-500'  },
  purple:  { btn: 'bg-purple-500 hover:bg-purple-600',  icon: 'text-purple-400',  border: 'focus:border-purple-500'  },
  pink:    { btn: 'bg-pink-500 hover:bg-pink-600',      icon: 'text-pink-400',    border: 'focus:border-pink-500'    },
  orange:  { btn: 'bg-orange-500 hover:bg-orange-600',  icon: 'text-orange-400',  border: 'focus:border-orange-500'  },
  emerald: { btn: 'bg-emerald-500 hover:bg-emerald-600',icon: 'text-emerald-400', border: 'focus:border-emerald-500' },
  teal:    { btn: 'bg-teal-500 hover:bg-teal-600',      icon: 'text-teal-400',    border: 'focus:border-teal-500'    },
};

const contactFields = [
  { key: 'phone' as keyof ClientEditData,    label: 'Phone',       icon: 'ri-phone-line',        placeholder: '+1 234 567 8900',         type: 'tel'  },
  { key: 'location' as keyof ClientEditData, label: 'Location',    icon: 'ri-map-pin-line',       placeholder: 'City, State / Country'               },
  { key: 'website' as keyof ClientEditData,  label: 'Website',     icon: 'ri-global-line',        placeholder: 'https://yourwebsite.com'             },
  { key: 'linkedin' as keyof ClientEditData, label: 'LinkedIn',    icon: 'ri-linkedin-box-line',  placeholder: 'linkedin.com/in/username'            },
  { key: 'github' as keyof ClientEditData,   label: 'GitHub',      icon: 'ri-github-fill',        placeholder: 'github.com/username'                },
  { key: 'twitter' as keyof ClientEditData,  label: 'Twitter / X', icon: 'ri-twitter-x-line',     placeholder: '@username'                          },
];

const ClientEditModal = ({ isOpen, onClose, data, onSave, accentColor = 'orange' }: Props) => {
  const { isLightMode } = useTheme();
  const [form, setForm] = useState<ClientEditData>({ ...data });
  const cfg = colorConfig[accentColor];

  useEffect(() => {
    if (isOpen) setForm({ ...data });
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const set = (key: keyof ClientEditData, value: string) =>
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
            <h3 className={`text-xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>Edit Client Profile</h3>
            <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Update your contact info and profile description</p>
          </div>
        </div>

        <div className="space-y-4">
          {contactFields.map(field => (
            <div key={field.key}>
              <label className={`flex items-center gap-2 text-sm mb-1.5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <i className={`${field.icon} ${cfg.icon}`}></i>
                {field.label}
              </label>
              <input
                type={field.type || 'text'}
                value={form[field.key]}
                onChange={e => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none ${cfg.border} transition-colors ${isLightMode ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'}`}
              />
            </div>
          ))}

          <div className={`border-t pt-4 ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>About</p>
            <div>
              <label className={`flex items-center gap-2 text-sm mb-1.5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <i className={`ri-file-text-line ${cfg.icon}`}></i>
                About / Bio
              </label>
              <textarea
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                placeholder="Tell freelancers about yourself and your projects..."
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

export default ClientEditModal;
