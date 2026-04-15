import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useViewAs } from "../../contexts/ViewAsContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { UserRole } from "../../types";
import NotificationDropdown from "./NotificationDropdown";
import LanguageSwitcher from "./LanguageSwitcher";
import rocketImage from "../../assets/space-rocket.png";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  file?: File;
}

interface CompanyItem {
  id: string;
  name: string;
  industry: string;
  documents: File[];
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showGuestPrefs, setShowGuestPrefs] = useState(false);
  const { user, logout, isAuthenticated, addRole, removeRole } = useAuth();
  const { viewingAs, isViewingAs, exitViewAs } = useViewAs();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const guestPrefsRef = useRef<HTMLDivElement>(null);
  const { isLightMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  // Role document states
  const [freelancerPortfolio, setFreelancerPortfolio] = useState<
    PortfolioItem[]
  >([]);
  const [freelancerDocs, setFreelancerDocs] = useState<File[]>([]);
  const [applicantCV, setApplicantCV] = useState<File | null>(null);
  const [employerCompanies, setEmployerCompanies] = useState<CompanyItem[]>([]);

  const availableRoles: {
    value: UserRole;
    name: string;
    icon: string;
    requiresDocuments: boolean;
  }[] = [
    {
      value: "freelancer",
      name: "Freelancer",
      icon: "ri-briefcase-line",
      requiresDocuments: true,
    },
    {
      value: "client",
      name: "Client",
      icon: "ri-user-star-line",
      requiresDocuments: false,
    },
    {
      value: "employer",
      name: "Employer",
      icon: "ri-building-line",
      requiresDocuments: true,
    },
    {
      value: "applicant",
      name: "Job Seeker",
      icon: "ri-file-user-line",
      requiresDocuments: true,
    },
    {
      value: "learner",
      name: "Learner",
      icon: "ri-graduation-cap-line",
      requiresDocuments: false,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
        setShowRoleManager(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        guestPrefsRef.current &&
        !guestPrefsRef.current.contains(e.target as Node)
      ) {
        setShowGuestPrefs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setUserMenuOpen(false);
    setShowDropdown(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchFocused(false);
      setSearchQuery("");
    }
  };

  const getProfileLink = (role: string) => {
    if (role === "applicant" || role === "job seeker" || role === "job-seeker")
      return "/profile/job-seeker";
    return `/profile/${role}`;
  };

  const getRoleIcon = (role: string) => {
    const roleInfo = availableRoles.find((r) => r.value === role);
    return roleInfo?.icon || "ri-user-line";
  };

  const handleAddRole = (role: UserRole) => {
    const roleInfo = availableRoles.find((r) => r.value === role);
    if (roleInfo?.requiresDocuments) {
      setPendingRole(role);
      setShowAddRoleModal(true);
      setShowRoleManager(false);
      setShowRoleModal(false);
    } else {
      addRole(role);
      setShowRoleManager(false);
      setShowRoleModal(false);
    }
  };

  const handleRemoveRole = (role: UserRole) => {
    if (user && user.roles.length > 1) {
      removeRole(role);
    }
  };

  const resetDocumentStates = () => {
    setFreelancerPortfolio([]);
    setFreelancerDocs([]);
    setApplicantCV(null);
    setEmployerCompanies([]);
  };

  const handleSubmitRoleDocuments = () => {
    if (!pendingRole) return;

    if (pendingRole === "freelancer" && freelancerPortfolio.length === 0) {
      alert("Please add at least one portfolio item");
      return;
    }
    if (pendingRole === "applicant" && !applicantCV) {
      alert("Please upload your CV");
      return;
    }
    if (pendingRole === "employer" && employerCompanies.length === 0) {
      alert("Please add at least one company");
      return;
    }

    addRole(pendingRole);
    setShowAddRoleModal(false);
    setPendingRole(null);
    resetDocumentStates();
  };

  const addPortfolioItem = () => {
    setFreelancerPortfolio([
      ...freelancerPortfolio,
      { id: Date.now().toString(), title: "", description: "" },
    ]);
  };

  const updatePortfolioItem = (
    id: string,
    field: string,
    value: string | File,
  ) => {
    setFreelancerPortfolio(
      freelancerPortfolio.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removePortfolioItem = (id: string) => {
    setFreelancerPortfolio(
      freelancerPortfolio.filter((item) => item.id !== id),
    );
  };

  const addCompanyItem = () => {
    setEmployerCompanies([
      ...employerCompanies,
      { id: Date.now().toString(), name: "", industry: "", documents: [] },
    ]);
  };

  const updateCompanyItem = (id: string, field: string, value: string) => {
    setEmployerCompanies(
      employerCompanies.map((company) =>
        company.id === id ? { ...company, [field]: value } : company,
      ),
    );
  };

  const addCompanyDocument = (id: string, file: File) => {
    setEmployerCompanies(
      employerCompanies.map((company) =>
        company.id === id
          ? { ...company, documents: [...company.documents, file] }
          : company,
      ),
    );
  };

  const removeCompanyDocument = (companyId: string, docIndex: number) => {
    setEmployerCompanies(
      employerCompanies.map((company) =>
        company.id === companyId
          ? {
              ...company,
              documents: company.documents.filter((_, i) => i !== docIndex),
            }
          : company,
      ),
    );
  };

  const removeCompanyItem = (id: string) => {
    setEmployerCompanies(
      employerCompanies.filter((company) => company.id !== id),
    );
  };

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];

  // When viewing as a role, use that role for navigation visibility
  const effectiveRoles = isViewingAs && viewingAs ? [viewingAs] : userRoles;
  const isAdmin = userRoles.includes("admin");

  const rolesNotAdded = availableRoles.filter(
    (role) => !userRoles.includes(role.value),
  );

  // Determine which links to show based on effective roles (viewing as or actual)
  const showRoadmaps = effectiveRoles.includes("learner");
  const showMarketplace =
    effectiveRoles.includes("freelancer") || effectiveRoles.includes("client");
  const showJobsAndCVs =
    effectiveRoles.includes("applicant") || effectiveRoles.includes("employer");
  const showAdmin = isAdmin && !isViewingAs;
  const showDashboard = isAdmin || effectiveRoles.some((r) => r !== "learner");

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: t("nav.home"), show: true },
    { path: "/roadmaps", label: t("nav.roadmaps"), show: showRoadmaps },
    { path: "/marketplace", label: t("nav.freelance"), show: showMarketplace },
    { path: "/portfolios", label: t("nav.portfolios"), show: showMarketplace },
    { path: "/jobs", label: t("nav.jobs"), show: showJobsAndCVs },
    { path: "/cvs", label: t("nav.cvs"), show: showJobsAndCVs },
    { path: "/admin", label: t("nav.admin"), show: showAdmin },
  ].filter((link) => link.show);

  const isRTL = i18n.language === "ar";

  return (
    <>
      {/* View As Banner */}
      {isViewingAs && viewingAs && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="ri-eye-line text-lg"></i>
              <span className="text-sm font-medium">
                {t("nav.viewingAs")}{" "}
                <span className="font-bold capitalize">{viewingAs}</span> -{" "}
                {t("nav.howTheySeePlatform", { role: viewingAs })}
              </span>
            </div>
            <button
              onClick={() => {
                exitViewAs();
                navigate("/admin");
              }}
              className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line"></i>
              {t("nav.exitViewMode")}
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      <nav
        className={`fixed ${isViewingAs ? "top-10" : "top-0"} left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-navy-900/95 backdrop-blur-md shadow-lg border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 group flex-shrink-0 mr-6"
            >
              <div className="w-7 h-7 flex items-center justify-center rounded-lg group-hover:scale-105 transition-transform">
                <img
                  src={rocketImage}
                  alt="logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white whitespace-nowrap">
                Next Coder
              </span>
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    location.pathname === link.path
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="hidden lg:block relative">
                <input
                  type="text"
                  placeholder={t("nav.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                  className="w-56 px-4 py-2 pl-10 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/50"></i>
              </div>

              {/* Notification Bell - Only show when authenticated */}
              {isAuthenticated && <NotificationDropdown />}

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <img
                      src={
                        user?.avatar ||
                        "https://readdy.ai/api/search-image?query=professional%20default%20user%20avatar%20icon%20simple%20clean%20minimal%20design%20on%20dark%20background&width=100&height=100&seq=avatar1&orientation=squarish"
                      }
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="hidden md:block text-sm font-medium text-white">
                      {user?.name}
                    </span>
                    <i
                      className={`ri-arrow-down-s-line text-white transition-transform flex-shrink-0 ${showDropdown ? "rotate-180" : ""}`}
                    ></i>
                  </button>

                  {showDropdown && (
                    <div
                      className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-80 bg-navy-800 border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[80vh] thin-scrollbar`}
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-white/10 bg-gradient-to-br from-purple-500/10 to-violet-500/10">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              user?.avatar ||
                              "https://readdy.ai/api/search-image?query=professional%20default%20user%20avatar%20icon%20simple%20clean%20minimal%20design%20on%20dark%20background&width=100&height=100&seq=avatar2&orientation=squarish"
                            }
                            alt={user?.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">
                              {user?.name}
                            </div>
                            <div className="text-sm text-white/60 truncate">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Links */}
                      {userRoles.filter((role) => role !== "admin").length >
                        0 && (
                        <div className="p-2 border-b border-white/10">
                          <div className="px-3 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                            {t("nav.yourProfiles")}
                          </div>
                          {userRoles
                            .filter((role) => role !== "admin")
                            .map((role) => (
                              <Link
                                key={role}
                                to={
                                  role === "applicant" ||
                                  role === "job seeker" ||
                                  role === "job-seeker"
                                    ? "/profile/job-seeker"
                                    : `/profile/${role}`
                                }
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                              >
                                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg group-hover:scale-105 transition-transform">
                                  <i
                                    className={`${getRoleIcon(role)} text-white text-sm`}
                                  ></i>
                                </div>
                                <span className="text-sm text-white/80 group-hover:text-white whitespace-nowrap capitalize">
                                  {role} {t("nav.profile")}
                                </span>
                              </Link>
                            ))}
                        </div>
                      )}

                      {/* Dashboard Link */}
                      {showDashboard && (
                        <div className="p-2 border-b border-white/10">
                          <Link
                            to={
                              userRoles.includes("admin")
                                ? "/admin"
                                : "/dashboard"
                            }
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <div
                              className={`w-8 h-8 flex items-center justify-center bg-gradient-to-br ${userRoles.includes("admin") ? "from-red-500 to-pink-500" : "from-indigo-500 to-purple-500"} rounded-lg group-hover:scale-105 transition-transform`}
                            >
                              <i
                                className={`${userRoles.includes("admin") ? "ri-admin-line" : "ri-dashboard-line"} text-white text-sm`}
                              ></i>
                            </div>
                            <span className="text-sm text-white/80 group-hover:text-white whitespace-nowrap">
                              {t("nav.dashboard")}
                            </span>
                          </Link>
                        </div>
                      )}

                      {/* Manage Roles */}
                      <div className="p-2 border-b border-white/10">
                        <button
                          onClick={() => {
                            setShowRoleModal(true);
                            setShowDropdown(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg group-hover:scale-105 transition-transform">
                            <i className="ri-user-settings-line text-white text-sm"></i>
                          </div>
                          <span className="text-sm text-white/80 group-hover:text-white whitespace-nowrap">
                            {t("nav.manageRoles")}
                          </span>
                        </button>
                      </div>

                      {/* Settings Link */}
                      <div className="p-2 border-b border-white/10">
                        <Link
                          to="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-slate-500 to-gray-500 rounded-lg group-hover:scale-105 transition-transform">
                            <i className="ri-settings-3-line text-white text-sm"></i>
                          </div>
                          <span className="text-sm text-white/80 group-hover:text-white whitespace-nowrap">
                            {t("nav.settings")}
                          </span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer group"
                        >
                          <div className="w-8 h-8 flex items-center justify-center bg-red-500/20 rounded-lg group-hover:scale-105 transition-transform">
                            <i className="ri-logout-box-line text-red-400 text-sm"></i>
                          </div>
                          <span className="text-sm text-red-400 group-hover:text-red-300 whitespace-nowrap">
                            {t("nav.logout")}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* Guest Preferences Dropdown */}
                  <div className="relative" ref={guestPrefsRef}>
                    <button
                      onClick={() => setShowGuestPrefs(!showGuestPrefs)}
                      title={t("nav.preferences")}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
                    >
                      <i className="ri-settings-3-line text-white text-base"></i>
                    </button>

                    {showGuestPrefs && (
                      <div
                        className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-64 bg-navy-800 border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[80vh] z-50 thin-scrollbar`}
                      >
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                            {t("nav.preferences")}
                          </div>
                          {/* Theme Toggle */}
                          <button
                            onClick={() => {
                              toggleTheme();
                              setShowGuestPrefs(false);
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg group-hover:scale-105 transition-transform">
                              <i
                                className={`${isLightMode ? "ri-moon-line" : "ri-sun-line"} text-white text-sm`}
                              ></i>
                            </div>
                            <span className="text-sm text-white/80 group-hover:text-white whitespace-nowrap">
                              {isLightMode
                                ? t("nav.switchToDark")
                                : t("nav.switchToLight")}
                            </span>
                          </button>
                          {/* Language Toggle */}
                          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
                            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg group-hover:scale-105 transition-transform">
                              <i className="ri-translate-2 text-white text-sm"></i>
                            </div>
                            <span className="text-sm text-white/80 whitespace-nowrap flex-1">
                              {t("nav.language")}
                            </span>
                            <LanguageSwitcher />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all whitespace-nowrap"
                  >
                    {t("nav.signup")}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <i
                  className={`${showMobileMenu ? "ri-close-line" : "ri-menu-line"} text-2xl`}
                ></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-navy-900/95 backdrop-blur-md"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className="absolute top-16 left-0 right-0 bg-navy-800 border-b border-white/10 shadow-2xl">
            <div className="p-4 space-y-2">
              {/* Search on Mobile */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder={t("nav.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                  className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/50"></i>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="pt-4 space-y-2 border-t border-white/10">
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 text-center text-sm font-medium text-white/80 hover:text-white bg-white/5 rounded-xl transition-all"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 text-center bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-semibold rounded-xl"
                  >
                    {t("nav.signup")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-navy-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="sticky top-0 bg-navy-800 border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {t("roles.manageTitle")}
                </h3>
                <p className="text-sm text-white/50">
                  {t("roles.manageSubtitle")}
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-white"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Roles */}
              {userRoles.filter((role) => role !== "admin").length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    {t("roles.currentRoles")}
                  </h4>
                  <div className="space-y-2">
                    {userRoles
                      .filter((role) => role !== "admin")
                      .map((role) => (
                        <div
                          key={role}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg">
                              <i
                                className={`${getRoleIcon(role)} text-white`}
                              ></i>
                            </div>
                            <span className="text-white font-medium capitalize">
                              {role}
                            </span>
                          </div>
                          {userRoles.length > 1 && (
                            <button
                              onClick={() => handleRemoveRole(role)}
                              className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer"
                            >
                              {t("roles.removeRole")}
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Available Roles */}
              {rolesNotAdded.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    {t("roles.addRole")}
                  </h4>
                  <div className="space-y-2">
                    {rolesNotAdded.map((role) => (
                      <div
                        key={role.value}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
                            <i className={`${role.icon} text-white/70`}></i>
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {role.name}
                            </div>
                            {role.requiresDocuments && (
                              <div className="text-xs text-white/50">
                                {t("roles.requiresDocs")}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddRole(role.value)}
                          className="px-3 py-1.5 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {t("roles.addRoleBtn")}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && pendingRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-navy-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
            <div className="sticky top-0 bg-navy-800 border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {pendingRole === "freelancer" && t("roles.uploadPortfolio")}
                  {pendingRole === "applicant" && t("roles.uploadCV")}
                  {pendingRole === "employer" && t("roles.addCompany")}
                </h3>
                <p className="text-sm text-white/50">
                  {pendingRole === "freelancer" &&
                    "Add your portfolio items and professional documents to become a freelancer"}
                  {pendingRole === "applicant" &&
                    "Upload your CV to apply for jobs"}
                  {pendingRole === "employer" &&
                    "Add companies you work with and their documentation"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddRoleModal(false);
                  setPendingRole(null);
                  resetDocumentStates();
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-white"></i>
              </button>
            </div>

            <div className="p-6">
              {/* Applicant CV Upload */}
              {pendingRole === "applicant" && (
                <div>
                  <input
                    type="file"
                    id="cv-upload-modal"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      setApplicantCV(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor="cv-upload-modal"
                    className="flex items-center justify-center w-full p-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all"
                  >
                    {applicantCV ? (
                      <div className="flex items-center text-white">
                        <div className="w-14 h-14 flex items-center justify-center bg-purple-500/20 rounded-xl mr-4">
                          <i className="ri-file-text-line text-2xl text-purple-400"></i>
                        </div>
                        <div>
                          <div className="font-semibold">
                            {applicantCV.name}
                          </div>
                          <div className="text-sm text-white/50">
                            {(applicantCV.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-2xl mx-auto mb-4">
                          <i className="ri-upload-cloud-line text-3xl text-white/50"></i>
                        </div>
                        <div className="text-white font-semibold mb-1">
                          Click to upload CV
                        </div>
                        <div className="text-sm text-white/50">
                          PDF, DOC, or DOCX format
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* Freelancer Portfolio Upload */}
              {pendingRole === "freelancer" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">
                        {t("roles.portfolioItems")}
                      </h4>
                      <button
                        type="button"
                        onClick={addPortfolioItem}
                        className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-all whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-add-line mr-1"></i>
                        {t("roles.addItem")}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {freelancerPortfolio.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/70">
                              Portfolio Item {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePortfolioItem(item.id)}
                              className="text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Project title"
                            value={item.title}
                            onChange={(e) =>
                              updatePortfolioItem(
                                item.id,
                                "title",
                                e.target.value,
                              )
                            }
                            className="w-full mb-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                          />

                          <textarea
                            placeholder="Project description"
                            value={item.description}
                            onChange={(e) =>
                              updatePortfolioItem(
                                item.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full mb-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none focus:outline-none"
                            rows={3}
                          />

                          <input
                            type="file"
                            id={`portfolio-modal-${item.id}`}
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                updatePortfolioItem(item.id, "file", file);
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor={`portfolio-modal-${item.id}`}
                            className="flex items-center justify-center w-full p-3 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all"
                          >
                            <div className="text-sm text-white/50">
                              <i className="ri-upload-line mr-1"></i>
                              {item.file ? item.file.name : "Upload file"}
                            </div>
                          </label>
                        </div>
                      ))}

                      {freelancerPortfolio.length === 0 && (
                        <div className="text-center py-8 text-white/40 text-sm">
                          No portfolio items added yet. Click &quot;
                          {t("roles.addItem")}&quot; to start.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      {t("roles.additionalDocs")}
                    </h4>
                    <input
                      type="file"
                      id="freelancer-docs-modal"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFreelancerDocs([...freelancerDocs, ...files]);
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="freelancer-docs-modal"
                      className="flex items-center justify-center w-full p-6 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all"
                    >
                      <div className="text-center">
                        <i className="ri-file-add-line text-3xl text-white/50 mb-2"></i>
                        <div className="text-sm text-white/50">
                          Upload certificates, licenses, etc.
                        </div>
                      </div>
                    </label>

                    {freelancerDocs.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {freelancerDocs.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex items-center text-white/70 text-sm">
                              <i className="ri-file-text-line mr-2 text-purple-400"></i>
                              {doc.name}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setFreelancerDocs(
                                  freelancerDocs.filter((_, i) => i !== index),
                                )
                              }
                              className="text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Employer Companies Upload */}
              {pendingRole === "employer" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">
                      {t("roles.companies")}
                    </h4>
                    <button
                      type="button"
                      onClick={addCompanyItem}
                      className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-all whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-add-line mr-1"></i>
                      {t("roles.addCompanyBtn")}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {employerCompanies.map((company, index) => (
                      <div
                        key={company.id}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-white/70">
                            Company {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCompanyItem(company.id)}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Company name"
                          value={company.name}
                          onChange={(e) =>
                            updateCompanyItem(
                              company.id,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full mb-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        />

                        <input
                          type="text"
                          placeholder="Industry"
                          value={company.industry}
                          onChange={(e) =>
                            updateCompanyItem(
                              company.id,
                              "industry",
                              e.target.value,
                            )
                          }
                          className="w-full mb-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        />

                        <input
                          type="file"
                          id={`company-docs-modal-${company.id}`}
                          multiple
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach((file) =>
                              addCompanyDocument(company.id, file),
                            );
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor={`company-docs-modal-${company.id}`}
                          className="flex items-center justify-center w-full p-3 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all"
                        >
                          <div className="text-sm text-white/50">
                            <i className="ri-upload-line mr-1"></i>Upload
                            company documents
                          </div>
                        </label>

                        {company.documents.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {company.documents.map((doc, docIndex) => (
                              <div
                                key={docIndex}
                                className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10"
                              >
                                <div className="flex items-center text-white/70 text-xs">
                                  <i className="ri-file-text-line mr-2 text-purple-400"></i>
                                  {doc.name}
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeCompanyDocument(company.id, docIndex)
                                  }
                                  className="text-red-400 hover:text-red-300 cursor-pointer"
                                >
                                  <i className="ri-close-line"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {employerCompanies.length === 0 && (
                      <div className="text-center py-8 text-white/40 text-sm">
                        No companies added yet. Click &quot;
                        {t("roles.addCompanyBtn")}&quot; to start.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-navy-800 border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowAddRoleModal(false);
                  setPendingRole(null);
                  resetDocumentStates();
                }}
                className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                {t("roles.cancel")}
              </button>
              <button
                onClick={handleSubmitRoleDocuments}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer"
              >
                {t("roles.completeAddRole")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const getRoleIcon = (role: string) => {
  const icons: Record<string, string> = {
    freelancer: "ri-briefcase-line",
    client: "ri-user-star-line",
    employer: "ri-building-line",
    applicant: "ri-file-user-line",
    learner: "ri-graduation-cap-line",
    admin: "ri-admin-line",
  };
  return icons[role] || "ri-user-line";
};

export default Navbar;
