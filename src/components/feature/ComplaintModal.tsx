import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetAvatar: string;
  targetType: 'freelancer' | 'client';
}

const ComplaintModal = ({ isOpen, onClose, targetName, targetAvatar, targetType }: ComplaintModalProps) => {
  const { isLightMode } = useTheme();
  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const complaintTypes = targetType === 'freelancer'
    ? [
        'Poor Quality Work',
        'Missed Deadline',
        'Unprofessional Behavior',
        'Communication Issues',
        'Fraudulent Activity',
        'Contract Violation',
        'Plagiarism',
        'Other'
      ]
    : [
        'Non-Payment',
        'Scope Creep',
        'Unprofessional Behavior',
        'Communication Issues',
        'Fraudulent Activity',
        'Contract Violation',
        'Harassment',
        'Other'
      ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newEvidence = Array.from(files).map(file => file.name);
      setEvidence(prev => [...prev, ...newEvidence]);
    }
  };

  const removeEvidence = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintType || !description.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleClose = () => {
    setComplaintType('');
    setDescription('');
    setEvidence([]);
    setIsSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  const cardBg = isLightMode ? 'bg-white border-gray-200' : 'bg-[#1e2442] border-white/10';
  const titleText = isLightMode ? 'text-gray-900' : 'text-white';
  const subText = isLightMode ? 'text-gray-500' : 'text-gray-400';
  const mutedText = isLightMode ? 'text-gray-400' : 'text-gray-500';
  const closeBtn = isLightMode ? 'text-gray-400 hover:text-gray-900' : 'text-gray-400 hover:text-white';
  const infoCard = isLightMode ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10';
  const inputBase = isLightMode
    ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500'
    : 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-teal-500';
  const selectBase = isLightMode
    ? 'bg-gray-100 border-gray-200 text-gray-900 focus:border-teal-500'
    : 'bg-white/5 border-white/10 text-white focus:border-teal-500';
  const optionBg = isLightMode ? 'bg-white' : 'bg-[#1e2442]';
  const fileItem = isLightMode ? 'bg-gray-100' : 'bg-white/5';
  const cancelBtn = isLightMode
    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    : 'bg-white/5 text-white hover:bg-white/10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
      <div className={`relative ${cardBg} rounded-2xl border p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${closeBtn} cursor-pointer`}
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-500/20 mx-auto mb-6">
              <i className="ri-check-line text-4xl text-green-400"></i>
            </div>
            <h3 className={`text-2xl font-bold ${titleText} mb-3`}>Complaint Submitted</h3>
            <p className={`${subText} mb-6`}>
              Your complaint against <span className={`${titleText} font-medium`}>{targetName}</span> has been submitted successfully. Our team will review it within 24-48 hours.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-500/20 mx-auto mb-4">
                <i className="ri-error-warning-line text-3xl text-red-400"></i>
              </div>
              <h3 className={`text-2xl font-bold ${titleText} mb-2`}>File a Complaint</h3>
              <p className={`${subText} text-sm`}>Report an issue with this {targetType}</p>
            </div>

            <div className={`flex items-center gap-4 p-4 ${infoCard} rounded-xl border mb-6`}>
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${titleText} font-semibold truncate`}>{targetName}</p>
                <p className={`${subText} text-sm capitalize`}>{targetType}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block ${titleText} font-medium mb-2`}>
                  Complaint Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none cursor-pointer ${selectBase}`}
                  required
                >
                  <option value="" className={optionBg}>Select complaint type</option>
                  {complaintTypes.map(type => (
                    <option key={type} value={type} className={optionBg}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block ${titleText} font-medium mb-2`}>
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Please describe the issue in detail..."
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none resize-none ${inputBase}`}
                  required
                ></textarea>
                <p className={`${mutedText} text-xs mt-1 text-right`}>{description.length}/500</p>
              </div>

              <div>
                <label className={`block ${titleText} font-medium mb-2`}>
                  Supporting Evidence <span className={`${mutedText} text-sm font-normal`}>(Optional)</span>
                </label>
                <div className={`border-2 border-dashed ${isLightMode ? 'border-gray-300 hover:border-teal-500/70' : 'border-white/20 hover:border-teal-500/50'} rounded-xl p-4 text-center transition-colors`}>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="evidence-upload"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="evidence-upload" className="cursor-pointer">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} mx-auto mb-3`}>
                      <i className={`ri-upload-cloud-line text-2xl ${subText}`}></i>
                    </div>
                    <p className={`${subText} text-sm mb-1`}>Click to upload files</p>
                    <p className={`${mutedText} text-xs`}>Screenshots, documents, or other evidence</p>
                  </label>
                </div>

                {evidence.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {evidence.map((file, index) => (
                      <div key={index} className={`flex items-center justify-between p-2 ${fileItem} rounded-lg`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <i className="ri-file-line text-teal-400"></i>
                          <span className={`${titleText} text-sm truncate`}>{file}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEvidence(index)}
                          className={`w-6 h-6 flex items-center justify-center ${subText} hover:text-red-400 cursor-pointer flex-shrink-0`}
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <i className="ri-information-line text-amber-400 text-lg flex-shrink-0 mt-0.5"></i>
                <p className="text-amber-600 text-xs">
                  False complaints may result in account suspension. Please ensure all information provided is accurate and truthful.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`flex-1 px-5 py-3 ${cancelBtn} font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !complaintType || !description.trim()}
                  className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-line"></i>
                      Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ComplaintModal;
