import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/feature/Navbar";
import Footer from "../../components/feature/Footer";
import ReportModal from "../../components/feature/ReportModal";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import {
  downloadCvById,
  getAllPublicCvs,
  viewCvById,
  type PublicCvInfo,
} from "../../services/public-cv.service";

interface CV {
  id: string;
  jobSeekerId: string;
  fileName: string;
  name: string;
  avatar: string;
  title?: string;
}

const getDisplayValue = (
  value: string | null | undefined,
  fallback: string,
) => {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : fallback;
};

const mapPublicCvToCard = (cv: PublicCvInfo, index: number): CV => {
  const raw = cv as unknown as Record<string, unknown>;
  const name = getDisplayValue(
    (raw.fullName as string | undefined) ?? (raw.name as string | undefined),
    "Job Seeker",
  );
  const title = String(cv.jobTitle ?? "").trim();
  const avatar = getDisplayValue(
    raw.avatar as string | undefined,
    `https://readdy.ai/api/search-image?query=professional%20job%20seeker%20portrait%20neutral%20background%20headshot%20modern%20style&width=200&height=200&seq=publiccv${index + 1}&orientation=squarish`,
  );

  return {
    id: cv.id || `public-cv-${index}`,
    jobSeekerId: cv.jobSeekerId || "",
    fileName: getDisplayValue(cv.fileName, "CV.pdf"),
    name,
    avatar,
    ...(title ? { title } : {}),
  };
};

const PublicCVs = () => {
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<{
    name: string;
    avatar: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [publicCvs, setPublicCvs] = useState<PublicCvInfo[]>([]);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState("");

  const loadPublicCvs = async (query: string) => {
    setCvLoading(true);
    setCvError("");

    try {
      const data = await getAllPublicCvs(query);
      setPublicCvs(data);
    } catch (err: unknown) {
      setCvError(
        err instanceof Error
          ? err.message
          : "We could not load public CVs right now.",
      );
    } finally {
      setCvLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPublicCvs(searchQuery);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const handleRefresh = () => {
      void loadPublicCvs(searchQuery);
    };

    window.addEventListener("public-cv-updated", handleRefresh);
    return () => window.removeEventListener("public-cv-updated", handleRefresh);
  }, [searchQuery]);

  const cvs = useMemo(() => publicCvs.map(mapPublicCvToCard), [publicCvs]);

  const handleOpenReport = (name: string, avatar: string) => {
    setSelectedApplicant({ name, avatar });
    setShowReportModal(true);
  };

  const handleViewCv = async (cvId: string) => {
    setCvError("");
    try {
      await viewCvById(cvId);
    } catch (err: unknown) {
      setCvError(
        err instanceof Error
          ? err.message
          : "We could not open this CV right now.",
      );
    }
  };

  const handleDownloadCv = async (cvId: string, fileName: string) => {
    setCvError("");
    try {
      await downloadCvById(cvId, fileName);
    } catch (err: unknown) {
      setCvError(
        err instanceof Error
          ? err.message
          : "We could not download this CV right now.",
      );
    }
  };

  const handleViewProfile = (jobSeekerId: string) => {
    if (!jobSeekerId) {
      return;
    }

    navigate(`/profile/job-seeker/${jobSeekerId}`);
  };

  return (
    <div
      className={`min-h-screen ${isLightMode ? "bg-gray-50" : "bg-[#1a1f37]"}`}
    >
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${isLightMode ? "text-gray-900" : "text-white"}`}
            >
              {t("cvs.title")}
            </h1>
            <p
              className={`text-sm sm:text-base ${isLightMode ? "text-gray-500" : "text-gray-400"}`}
            >
              {t("cvs.subtitle")}
            </p>
          </div>

          {(cvLoading || cvError) && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${cvError ? "border-red-400/40 bg-red-500/10 text-red-300" : "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"}`}
            >
              {cvLoading ? "Loading public CVs..." : cvError}
            </div>
          )}

          <div
            className={`backdrop-blur-sm rounded-xl border p-3 sm:p-4 mb-6 ${isLightMode ? "bg-white border-gray-200" : "bg-white/5 border-white/10"}`}
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("cvs.searchPlaceholder")}
                  className={`w-full border rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 focus:outline-none focus:border-purple-500 text-sm ${isLightMode ? "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400" : "bg-white/5 border-white/10 text-white placeholder-gray-500"}`}
                />
              </div>
            </div>
          </div>

          {/* CV List */}
          <div className="space-y-4">
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 transition-all group ${isLightMode ? "bg-white border-gray-200 hover:border-purple-400" : "bg-white/5 border-white/10 hover:border-purple-500/50"}`}
              >
                <div className="mb-3 pb-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/20">
                        <i className="ri-file-text-line text-purple-400 text-sm"></i>
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${isLightMode ? "text-gray-900" : "text-white"}`}
                        >
                          {cv.fileName}
                        </p>
                        {/* <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}></p> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  {/* Avatar */}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title + Actions in same row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      {/* Title */}
                      <div className="text-center sm:text-left">
                        {cv.title && (
                          <button
                            type="button"
                            onClick={() => handleViewCv(cv.id)}
                            className="cursor-pointer hover:underline"
                          >
                            <h3
                              className={`text-base sm:text-lg font-bold transition-colors ${
                                isLightMode
                                  ? "text-gray-900 hover:text-purple-500"
                                  : "text-white hover:text-purple-400"
                              }`}
                            >
                              {cv.title}
                            </h3>
                          </button>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => handleViewCv(cv.id)}
                          className="px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap"
                        >
                          {t("cvs.viewCV")}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadCv(cv.id, cv.fileName)}
                          className={`px-4 py-2 border text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            isLightMode
                              ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                          }`}
                        >
                          {t("download CV")}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleViewProfile(cv.jobSeekerId)}
                          disabled={!cv.jobSeekerId}
                          className={`px-4 py-2 border text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            cv.jobSeekerId
                              ? isLightMode
                                ? "border-purple-200 text-purple-600 hover:bg-purple-50"
                                : "border-purple-500/40 text-purple-200 hover:bg-purple-500/10"
                              : isLightMode
                                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                : "border-white/10 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {cvs.length === 0 && !cvLoading && (
            <div
              className={`text-center py-12 sm:py-16 rounded-xl border ${isLightMode ? "bg-white border-gray-200" : "bg-white/5 border-white/10"}`}
            >
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full mx-auto mb-4 ${isLightMode ? "bg-gray-100" : "bg-white/5"}`}
              >
                <i
                  className={`ri-file-search-line text-2xl sm:text-3xl ${isLightMode ? "text-gray-400" : "text-gray-400"}`}
                ></i>
              </div>
              <h3
                className={`text-base sm:text-lg font-bold mb-2 ${isLightMode ? "text-gray-900" : "text-white"}`}
              >
                {t("cvs.noCVsFound")}
              </h3>
              <p
                className={`text-xs sm:text-sm mb-4 px-4 ${isLightMode ? "text-gray-500" : "text-gray-400"}`}
              >
                {t("cvs.noCVsSubtitle")}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {/* Report Modal */}
      {selectedApplicant && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedApplicant(null);
          }}
          targetName={selectedApplicant.name}
          targetAvatar={selectedApplicant.avatar}
          reporterRole="client"
        />
      )}
    </div>
  );
};

export default PublicCVs;
