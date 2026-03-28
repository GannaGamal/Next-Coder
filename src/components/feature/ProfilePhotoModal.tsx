import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto?: string;
  userName?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  accentColor?: string;
}

const ProfilePhotoModal = ({
  isOpen,
  onClose,
  currentPhoto,
  userName,
  onUpload,
  onRemove,
  accentColor = 'purple'
}: ProfilePhotoModalProps) => {
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLightMode } = useTheme();

  const colorClasses: Record<string, { bg: string; hover: string }> = {
    purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600' },
    pink: { bg: 'bg-pink-500', hover: 'hover:bg-pink-600' },
    orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
    violet: { bg: 'bg-violet-500', hover: 'hover:bg-violet-600' },
    emerald: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
  };

  const colors = colorClasses[accentColor] || colorClasses.purple;

  useEffect(() => {
    if (!isOpen) {
      setShowFullPhoto(false);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      onUpload(file);
      onClose();
    }
  };

  if (!isOpen) return null;

  if (showFullPhoto && currentPhoto) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFullPhoto(false)}></div>
        <div className="relative max-w-3xl max-h-[90vh]">
          <button
            onClick={() => setShowFullPhoto(false)}
            className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center text-white hover:text-gray-300 cursor-pointer"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
          <img
            src={currentPhoto}
            alt={userName || 'Profile'}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative rounded-2xl border p-6 w-full max-w-sm ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10'}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer ${isLightMode ? 'text-gray-400 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        <h3 className={`text-xl font-bold mb-6 text-center ${isLightMode ? 'text-gray-900' : 'text-white'}`}>Profile Photo</h3>

        <div className="space-y-3">
          {currentPhoto && (
            <button
              onClick={() => setShowFullPhoto(true)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isLightMode ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${isLightMode ? 'bg-gray-200' : 'bg-white/10'}`}>
                <i className={`ri-eye-line text-xl ${isLightMode ? 'text-gray-600' : 'text-white'}`}></i>
              </div>
              <span className={`font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>View Profile Photo</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex items-center gap-4 p-4 ${colors.bg} rounded-xl ${colors.hover} transition-all cursor-pointer`}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20">
              <i className="ri-upload-cloud-line text-xl text-white"></i>
            </div>
            <span className="text-white font-medium">Upload New Photo</span>
          </button>

          {currentPhoto && (
            <button
              onClick={() => { onRemove(); onClose(); }}
              className="w-full flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/20">
                <i className="ri-delete-bin-line text-xl text-red-400"></i>
              </div>
              <span className="text-red-400 font-medium">Remove Photo</span>
            </button>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  );
};

export default ProfilePhotoModal;
