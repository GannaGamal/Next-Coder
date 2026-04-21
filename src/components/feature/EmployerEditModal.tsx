import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface EmployerEditData {
  phoneNumber: string;
  address: string;
  websiteUrl: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: EmployerEditData;
  onSave: (data: EmployerEditData) => Promise<void>;
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
  { key: 'phoneNumber' as keyof EmployerEditData, label: 'Phone Number', icon: 'ri-phone-line', placeholder: '+1 234 567 8900', type: 'tel' },
  { key: 'address' as keyof EmployerEditData, label: 'Address', icon: 'ri-map-pin-line', placeholder: 'City, State / Country' },
  { key: 'websiteUrl' as keyof EmployerEditData, label: 'Website URL', icon: 'ri-global-line', placeholder: 'https://yourwebsite.com' },
];

const EmployerEditModal = ({ isOpen, onClose, data, onSave, accentColor = 'violet' }: Props) => {
  const { isLightMode } = useTheme();
  const [form, setForm] = useState<EmployerEditData>({ ...data });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const cfg = colorConfig[accentColor];

  useEffect(() => {
    if (isOpen) {
      setForm({ ...data });
      setSaveError('');
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'We could not save your contact details right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key: keyof EmployerEditData, value: string) =>
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
            <i className={`ri-contacts-line text-xl ${cfg.icon}`}></i>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>Edit Contact Details</h3>
            <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Update your phone number, address, and website URL</p>
          </div>
        </div>

        {saveError && (
          <div className={`mb-4 rounded-lg border p-3 text-sm ${isLightMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
            {saveError}
          </div>
        )}

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
            disabled={isSaving}
            className={`flex-1 px-5 py-3 ${cfg.btn} text-white font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isSaving ? (
              <><i className="ri-loader-4-line mr-2 animate-spin"></i>Saving...</>
            ) : (
              <><i className="ri-save-line mr-2"></i>Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerEditModal;
