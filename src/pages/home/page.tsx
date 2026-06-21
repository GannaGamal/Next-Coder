import { Link } from "react-router-dom";
import Navbar from "../../components/feature/Navbar";
import Footer from "../../components/feature/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import pairProgrammingIllustration from "../../assets/pair-programming.svg";
import { useEffect, useState } from "react";
import { type HomeData, getHomeData, type Review, getReviews } from "../../services/Home.service";


const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getHomeData().then(setHomeData).catch(console.error);
    getReviews()
      .then((data) => {
        const top3 = [...data]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        setReviews(top3);
      })
      .catch(console.error);
  }, []);

  const allFeatures = [
    {
      icon: "ri-briefcase-line",
      title: t("home.freelanceTitle"),
      description: t("home.freelanceDesc"),
      link: "/marketplace",
      roles: ["freelancer", "client"],
      color: "from-purple-500 to-violet-500",
      delay: "0ms",
    },
    {
      icon: "ri-gallery-line",
      title: t("home.portfoliosTitle"),
      description: t("home.portfoliosDesc"),
      link: "/portfolios",
      roles: ["freelancer"],
      color: "from-pink-500 to-rose-500",
      delay: "80ms",
    },
    {
      icon: "ri-briefcase-4-line",
      title: t("home.jobOffersTitle"),
      description: t("home.jobOffersDesc"),
      link: "/jobs",
      roles: ["Job Seeker", "employer"],
      color: "from-teal-500 to-emerald-500",
      delay: "160ms",
    },
    {
      icon: "ri-file-list-3-line",
      title: t("home.cvsTitle"),
      description: t("home.cvsDesc"),
      link: "/cvs",
      roles: ["Job Seeker", "employer"],
      color: "from-orange-500 to-amber-500",
      delay: "240ms",
    },
    {
      icon: "ri-road-map-line",
      title: t("home.roadmapsTitle"),
      description: t("home.roadmapsDesc"),
      link: "/roadmaps",
      roles: ["learner"],
      color: "from-indigo-500 to-purple-500",
      delay: "320ms",
    },
  ];

  const stats = [
    {
      number: homeData ? `${homeData.totalUsers.toLocaleString()}+` : "—",
      label: 'Total Users',
    },
    {
      number: homeData ? `${homeData.activeFreelancers.toLocaleString()}+` : "—",
      label: 'Active Freelancers',
    },
    {
      number: homeData ? `${homeData.postedJobs.toLocaleString()}+` : "—",
      label: 'Posted Jobs',
    },
    {
      number: homeData ? `${homeData.activeProjects.toLocaleString()}+` : "—",
      label: 'Active Projects',
    },
  ];

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-3xl animate-pulse-glow"></div>
          <div
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl"></div>
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(139,92,246,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div
                className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-6 animate-slide-right"
                style={{ animationDelay: "0ms" }}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse inline-block"></span>
                <span className="text-xs font-medium text-purple-400">
                  {t("home.newFeature")}
                </span>
                <span className="text-xs text-white/60">
                  {t("home.aiPowered")}
                </span>
                <i className="ri-arrow-right-line text-white/60 text-xs"></i>
              </div>

              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-right"
                style={{ animationDelay: "100ms" }}
              >
                {t("home.heroTitle").split(t("home.heroHighlight"))[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
                  {t("home.heroHighlight")}
                </span>
                {t("home.heroTitle").split(t("home.heroHighlight"))[1]}
              </h1>

              <p
                className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed animate-slide-right"
                style={{ animationDelay: "200ms" }}
              >
                {t("home.heroSubtitle")}
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 animate-slide-right"
                style={{ animationDelay: "300ms" }}
              >
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-base font-semibold rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all hover:scale-105 shadow-lg shadow-purple-500/25 whitespace-nowrap text-center"
                  >
                    {t("home.getStartedFree")}{" "}
                    <i className="ri-arrow-right-line ml-2"></i>
                  </Link>
                )}
                <a
                  href="#features"
                  className="px-8 py-4 bg-transparent border-2 border-white/20 text-white text-base font-semibold rounded-xl hover:bg-white/5 hover:border-white/30 transition-all whitespace-nowrap text-center"
                >
                  {t("home.exploreFeatures")}{" "}
                  <i className="ri-compass-line ml-2"></i>
                </a>
              </div>

              <div
                className="flex items-center gap-5 mt-10 animate-fade-in"
                style={{ animationDelay: "500ms" }}
              >
                <div className="flex -space-x-2">
                  {reviews.map((rev) => (
                    <img
                      src={'https://nextcoder.runasp.net/'+rev.userImage}
                      alt={rev.userName}
                      className="w-8 h-8 rounded-full border-2 border-navy-900 object-cover"
                    />
                  ))}
                </div>
                <span className="text-sm text-white/50">
                  {t("home.joinedBy")}{" "}
                  <strong className="text-white/80">
                    {homeData ? `${homeData.totalUsers.toLocaleString()}+` : "…"}
                  </strong>{" "}
                  {t("home.professionals")}
                </span>
              </div>
            </div>

            <div
              className="relative flex flex-col items-center justify-center animate-fade-in w-full"
              style={{ animationDelay: "200ms" }}
            >
              <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl">
                <object
                  type="image/svg+xml"
                  data={pairProgrammingIllustration}
                  className="w-full h-auto drop-shadow-2xl"
                  aria-label="Pair programming illustration"
                  style={{ minHeight: "320px" }}
                >
                  <img
                    src={pairProgrammingIllustration}
                    alt="Pair programming illustration"
                    className="w-full h-auto"
                  />
                </object>
              </div>
              <div className="mt-3 text-center">
                <a
                  href="https://storyset.com/work"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-white/30 hover:text-white/50 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-navy-800/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-rise"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-white/60 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-rise">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("home.exploreFeaturesTitle")}
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {t("home.featuresSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group bg-navy-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/5 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer animate-rise hover:-translate-y-1"
                style={{ animationDelay: feature.delay }}
              >
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <i className={`${feature.icon} text-3xl text-white`}></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/60 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                    {t("home.exploreLink")}{" "}
                    <i className="ri-arrow-right-line ml-2"></i>
                  </div>
                  <div className="flex gap-1">
                    {feature.roles.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white/5 text-white/50 text-xs rounded-md capitalize"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {!isAuthenticated && (
            <div
              className="mt-12 text-center animate-rise"
              style={{ animationDelay: "400ms" }}
            >
              <p className="text-white/60 mb-4">{t("home.readyToUnlock")}</p>
              <Link
                to="/register"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all hover:scale-105 shadow-lg shadow-purple-500/25 whitespace-nowrap"
              >
                {t("home.createFreeAccount")}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-rise">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("home.howItWorks")}
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {t("home.howItWorksSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
            {[
              {
                n: 1,
                title: t("home.step1Title"),
                body: t("home.step1Body"),
                delay: "0ms",
              },
              {
                n: 2,
                title: t("home.step2Title"),
                body: t("home.step2Body"),
                delay: "120ms",
              },
              {
                n: 3,
                title: t("home.step3Title"),
                body: t("home.step3Body"),
                delay: "240ms",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="text-center animate-rise"
                style={{ animationDelay: step.delay }}
              >
                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-500 text-white text-3xl font-bold rounded-full mx-auto mb-6 shadow-lg shadow-purple-500/30 hover:scale-110 transition-transform cursor-default">
                  {step.n}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/60 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-rise">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("home.testimonialsTitle")}
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {t("home.testimonialsSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.length > 0 ? reviews.map((review, index) => {
              const ASSET_BASE = "https://nextcoder.runasp.net/";
              const avatarSrc = review.userImage
                ? /^https?:\/\//i.test(review.userImage)
                  ? review.userImage
                  : `${ASSET_BASE}${review.userImage.replace(/^\//, "")}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=7c3aed&color=fff&size=128`;
              return (
                <div
                  key={index}
                  className="bg-navy-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/5 hover:border-white/10 hover:-translate-y-1 transition-all animate-rise"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(Math.min(review.rating, 5))].map((_, i) => (
                      <i key={i} className="ri-star-fill text-yellow-400 text-lg"></i>
                    ))}
                    {[...Array(Math.max(0, 5 - review.rating))].map((_, i) => (
                      <i key={`empty-${i}`} className="ri-star-line text-yellow-400/30 text-lg"></i>
                    ))}
                  </div>
                  <p className="text-white/70 leading-relaxed mb-6 italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <div className="flex items-center">
                    <img
                      src={avatarSrc}
                      alt={review.userName}
                      className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-purple-500/30"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=7c3aed&color=fff&size=128`;
                      }}
                    />
                    <div>
                      <div className="font-semibold text-white">{review.userName}</div>
                      <div className="text-sm text-white/60">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              // Skeleton placeholders while loading
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-navy-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/5 animate-pulse"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-5 h-5 rounded bg-white/10"></div>
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-white/10 rounded w-full"></div>
                    <div className="h-3 bg-white/10 rounded w-5/6"></div>
                    <div className="h-3 bg-white/10 rounded w-4/6"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded w-24"></div>
                      <div className="h-3 bg-white/10 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl top-0 left-0 animate-pulse-glow"></div>
          <div
            className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl bottom-0 right-0 animate-pulse-glow"
            style={{ animationDelay: "1.5s" }}
          ></div>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float-slow"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            ></div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-rise">
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            {t("home.ctaSubtitle")}
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-bold rounded-xl hover:bg-gray-50 transition-all hover:scale-105 shadow-2xl whitespace-nowrap"
          >
            {t("home.createFreeAccount")}{" "}
            <i className="ri-arrow-right-line ml-2"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;