import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { createReport, type ReportType } from '../../services/clientDashboard.service';
import { createFreelancerReport } from '../../services/freelancerDashboard.service';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetAvatar: string;
  projectId: number;
  reporterRole: 'freelancer' | 'client';
}

const ReportModal = ({ isOpen, onClose, targetName, targetAvatar, projectId, reporterRole }: ReportModalProps) => {
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mapping from UI report types to API ReportType
  const reportTypeMapping: { [key: string]: ReportType } = {
    'missed-deadline': 'MissedDeadline',
    'poor-quality': 'PoorQuality',
    'unprofessional': 'UnprofessionalBehavior',
    'fraud': 'Fraud',
    'other': 'Other',
  };

  const clientReportTypes = [
    { value: 'missed-deadline', label: 'Deadline Missed' },
    { value: 'poor-quality', label: 'Poor Quality' },
    { value: 'unprofessional', label: 'Unprofessional Behavior' },
    { value: 'fraud', label: 'Fraud' },
    { value: 'other', label: 'Other' },
  ];

  const freelancerReportTypes = [
    { value: 'unprofessional', label: 'Unprofessional Behavior' },
    { value: 'fraud', label: 'Fraud' },
    { value: 'other', label: 'Other' },
  ];

  const reportTypes = reporterRole === 'freelancer' ? freelancerReportTypes : clientReportTypes;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setEvidenceFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeEvidence = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportType || !description.trim()) return;
    if (!Number.isFinite(projectId) || projectId <= 0) {
      setSubmitError('Invalid project. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const apiReportType = reportTypeMapping[reportType] as ReportType;
      
      const submitReport = reporterRole === 'freelancer' ? createFreelancerReport : createReport;

      await submitReport({
        projectId,
        reportType: apiReportType,
        description: description.trim(),
        evidence: evidenceFiles.length > 0 ? evidenceFiles[0] : undefined,
      });

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportType('');
    setDescription('');
    setEvidenceFiles([]);
    setIsSubmitted(false);
    setSubmitError(null);
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
  const fileItem = isLightMode ? 'bg-gray-100' : 'bg-white/5';
  const cancelBtn = isLightMode
    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    : 'bg-white/5 text-white hover:bg-white/10';
  const avatarSrc = targetAvatar
    ? (targetAvatar.startsWith('http') ? targetAvatar : `https://nextcoder.runasp.net/${targetAvatar}`)
    : '';

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
            <h3 className={`text-2xl font-bold ${titleText} mb-3`}>{t('report.submitted')}</h3>
            <p className={`${subText} mb-6`}>
              {t('report.submittedDesc')} <span className={`${titleText} font-medium`}>{targetName}</span> {t('report.submittedEnd')}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('report.close')}
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-500/20 mx-auto mb-4">
                <i className="ri-flag-line text-3xl text-red-400"></i>
              </div>
              <h3 className={`text-2xl font-bold ${titleText} mb-2`}>{t('report.title')}</h3>
              <p className={`${subText} text-sm`}>{t('report.subtitle')}</p>
            </div>

            <div className={`flex items-center gap-4 p-4 ${infoCard} rounded-xl border mb-6`}>
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                {avatarSrc && (
                  <img src={avatarSrc} alt={targetName} className="w-full h-full object-cover" />
                )}
                {!targetAvatar && (
                  <img src="https://readdy.ai/api/search-image?query=professional%20default%20user%20avatar%20icon%20simple%20clean%20minimal%20design%20on%20dark%20background&width=100&height=100&seq=avatar1&orientation=squarish" alt={targetName} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${titleText} font-semibold truncate`}>{targetName}</p>
                <p className={`${subText} text-sm capitalize`}>
                  {reporterRole === 'freelancer' ? t('report.clientRole') : t('report.freelancerRole')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block ${titleText} font-medium mb-3`}>
                  {t('report.reportType')} <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {reportTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setReportType(type.value)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                        reportType === type.value
                          ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : isLightMode
                            ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {type.value === 'missed-deadline' && <i className="ri-time-line mr-2"></i>}
                      {type.value === 'poor-quality' && <i className="ri-spam-line mr-2"></i>}
                      {type.value === 'unprofessional' && <i className="ri-shield-user-line mr-2"></i>}
                      {type.value === 'fraud' && <i className="ri-alert-line mr-2"></i>}
                      {type.value === 'other' && <i className="ri-more-line mr-2"></i>}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block ${titleText} font-medium mb-2`}>
                  {t('report.description')} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder={t('report.descriptionPlaceholder')}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none resize-none text-sm ${inputBase}`}
                  required
                ></textarea>
                <p className={`${mutedText} text-xs mt-1 text-right`}>{description.length}/500</p>
              </div>

              <div>
                <label className={`block ${titleText} font-medium mb-2`}>
                  {t('report.evidence')} <span className={`${mutedText} text-sm font-normal`}>{t('report.evidenceOptional')}</span>
                </label>
                <div className={`border-2 border-dashed ${isLightMode ? 'border-gray-300 hover:border-teal-500/70' : 'border-white/20 hover:border-teal-500/50'} rounded-xl p-4 text-center transition-colors`}>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="report-evidence-upload"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="report-evidence-upload" className="cursor-pointer">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} mx-auto mb-3`}>
                      <i className={`ri-upload-cloud-line text-2xl ${subText}`}></i>
                    </div>
                    <p className={`${subText} text-sm mb-1`}>{t('report.clickToUpload')}</p>
                    <p className={`${mutedText} text-xs`}>{t('report.evidenceTypes')}</p>
                  </label>
                </div>

                {evidenceFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {evidenceFiles.map((file, index) => (
                      <div key={index} className={`flex items-center justify-between p-2 ${fileItem} rounded-lg`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <i className="ri-file-line text-teal-400"></i>
                          <span className={`${titleText} text-sm truncate`}>{file.name}</span>
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

              {submitError && (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <i className="ri-alert-line text-red-400 text-lg flex-shrink-0 mt-0.5"></i>
                  <p className="text-red-600 dark:text-red-500 text-xs">{submitError}</p>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <i className="ri-information-line text-amber-400 text-lg flex-shrink-0 mt-0.5"></i>
                <p className="text-amber-600 dark:text-amber-500 text-xs">{t('report.warningText')}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`flex-1 px-5 py-3 ${cancelBtn} font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer`}
                >
                  {t('report.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !reportType || !description.trim()}
                  className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      {t('report.submitting')}
                    </>
                  ) : (
                    <>
                      <i className="ri-flag-line"></i>
                      {t('report.submit')}
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

export default ReportModal;
