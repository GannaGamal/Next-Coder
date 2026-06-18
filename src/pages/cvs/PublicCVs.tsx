import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/feature/Navbar";
import Footer from "../../components/feature/Footer";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { getAllPublicCvs, viewCvPublic, downloadCvPublic, type PublicCvInfo } from "../../services/public-cv.service";

// Static asset host — anything returned by the API as a relative path
// (cvUrl, userImage, etc.) needs this prefix to become a usable URL.
const ASSET_BASE_URL = "https://nextcoder.runasp.net/";

interface CV {
  id: string;
  jobSeekerId: string;
  appUserId: string;
  userImage: string;
  name: string;
  cvUrl: string;
  fileUrl: string;
  fileName: string;
  title?: string;
  uploadedAt?: string;
}

const getDisplayValue = (
  value: string | null | undefined,
  fallback: string,
) => {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : fallback;
};

const buildAssetUrl = (path: string | null | undefined) => {
  const value = String(path ?? "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${ASSET_BASE_URL}${value.startsWith("/") ? value.slice(1) : value}`;
};

const formatUploadedDate = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const mapPublicCvToCard = (cv: PublicCvInfo, index: number): CV => {
  // Extract name from various possible field names in the API response
  const name = getDisplayValue(
    cv.jobSeekrName ??
    cv.jobSeekerName ??
    cv.fullName ??
    (cv as any)?.name,
    "Job Seeker",
  );

  const title = String(cv.jobTitle ?? "").trim();
  const appUserId = String(cv.appUserId ?? "").trim();

  // Use userImage from API, fallback to generated avatar
  const userImage = cv.userImage
    ? buildAssetUrl(cv.userImage)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=128`;

  // Use fileUrl from service (it's already built with full URL)
  const fileUrl = cv.fileUrl || "";

  return {
    id: String(cv.id ?? `public-cv-${index}`),
    jobSeekerId: String(cv.jobSeekerId ?? ""),
    appUserId,
    cvUrl: getDisplayValue(cv.fileName, "CV.pdf"),
    fileUrl,
    name,
    userImage,
    fileName: String(cv.fileName ?? "CV.pdf"),
    uploadedAt: formatUploadedDate(cv.uploadedAt),
    ...(title ? { title } : {}),
  };
};

const PublicCVs = () => {
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
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

  const handleViewCv = async (cvId: string) => {
    if (!cvId) return;
    try {
      await viewCvPublic(cvId);
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Failed to view CV");
    }
  };

  const handleDownloadCv = async (cvId: string, fileName: string) => {
    if (!cvId) return;
    try {
      await downloadCvPublic(cvId, fileName);
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Failed to download CV");
    }
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

          {/* ATS Tips Card */}
          <div className={`backdrop-blur-sm rounded-xl border p-6 mb-8 ${isLightMode ? 'bg-purple-50 border-purple-200' : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'}`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-500/20 flex-shrink-0">
                <i className="ri-lightbulb-line text-xl text-purple-400"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-lg font-bold mb-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  {t('common.tipsForSuccess', 'Tips for Success')}
                </h4>
                <div className={`text-sm space-y-4 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  <p>
                    To maximize your chances of passing ATS (Applicant Tracking System) screening, it is highly recommended to use a professional ATS-friendly resume template.
                  </p>
                  <div>
                    <p className={`font-semibold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>Recommended templates:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <a href="https://www.canva.com/ar_eg/templates/EAGHNEVFuCs/" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 hover:underline font-medium transition-colors">
                          Canva ATS Resume Template
                        </a>
                      </li>
                      <li>
                        <a href="https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 hover:underline font-medium transition-colors">
                          Jake's Resume (Overleaf)
                        </a>
                      </li>
                    </ul>
                  </div>
                  <p>
                    Using non-ATS-friendly resume formats may reduce the visibility of your CV during filtering and screening processes. For the best results, use a clean, structured resume similar to the templates above.
                  </p>
                </div>
              </div>
            </div>
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
              <PublicCvCard
                key={cv.id}
                cv={cv}
                isLightMode={isLightMode}
                t={t}
                onView={handleViewCv}
                onDownload={handleDownloadCv}
              />
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
    </div>
  );
};

interface PublicCvCardProps {
  cv: CV;
  isLightMode: boolean;
  t: (key: string) => string;
  onView: (cvId: string) => void;
  onDownload: (cvId: string, fileName: string) => void;
}

const PublicCvCard = ({ cv, isLightMode, t, onView, onDownload }: PublicCvCardProps) => {
  const profileHref = cv.appUserId ? `/user/${cv.appUserId}` : undefined;
  const hasValidCv = Boolean(cv.fileUrl);

  return (
    <div
      className={`backdrop-blur-sm rounded-xl border p-4 sm:p-5 transition-all group ${isLightMode ? "bg-white border-gray-200 hover:border-purple-400" : "bg-white/5 border-white/10 hover:border-purple-500/50"}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Side: Avatar + Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            {profileHref ? (
              <Link
                to={profileHref}
                className="block w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
              >
                <img
                  src={cv.userImage}
                  alt={cv.name}
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden">
                <img
                  src={cv.userImage}
                  alt={cv.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            {profileHref ? (
              <Link to={profileHref} className="hover:underline">
                <h3
                  className={`text-base sm:text-lg font-bold transition-colors ${isLightMode ? "text-gray-900 hover:text-purple-500" : "text-white hover:text-purple-400"}`}
                >
                  {cv.name}
                </h3>
              </Link>
            ) : (
              <h3
                className={`text-base sm:text-lg font-bold ${isLightMode ? "text-gray-900" : "text-white"}`}
              >
                {cv.name}
              </h3>
            )}
            {cv.title && (
              <p
                className={`text-xs sm:text-sm mt-0.5 ${isLightMode ? "text-purple-600" : "text-purple-400"}`}
              >
                {cv.title}
              </p>
            )}

            <div
              className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm mt-2 ${isLightMode ? "text-gray-500" : "text-gray-400"}`}
            >
              <span className="flex items-center gap-1">
                <i className="ri-file-text-line"></i>
                {cv.fileName}
              </span>
              {cv.uploadedAt && (
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  {cv.uploadedAt}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 flex-shrink-0 mt-2 sm:mt-0">
          <button
            type="button"
            onClick={() => onView(cv.id)}
            disabled={!hasValidCv}
            className={`px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap ${!hasValidCv ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {t("cvs.viewCV")}
          </button>

          <button
            type="button"
            onClick={() => onDownload(cv.id, cv.fileName)}
            disabled={!hasValidCv}
            className={`px-4 py-2 border text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${!hasValidCv ? "opacity-50 cursor-not-allowed" : ""} ${isLightMode ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-100" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
          >
            Download CV
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicCVs;