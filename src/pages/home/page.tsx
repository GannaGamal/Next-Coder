import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const allFeatures = [
    {
      icon: 'ri-briefcase-line',
      title: t('home.freelanceTitle'),
      description: t('home.freelanceDesc'),
      link: '/marketplace',
      roles: ['freelancer', 'client'],
      color: 'from-purple-500 to-violet-500',
      delay: '0ms',
    },
    {
      icon: 'ri-gallery-line',
      title: t('home.portfoliosTitle'),
      description: t('home.portfoliosDesc'),
      link: '/portfolios',
      roles: ['freelancer'],
      color: 'from-pink-500 to-rose-500',
      delay: '80ms',
    },
    {
      icon: 'ri-briefcase-4-line',
      title: t('home.jobOffersTitle'),
      description: t('home.jobOffersDesc'),
      link: '/jobs',
      roles: ['applicant', 'employer'],
      color: 'from-teal-500 to-emerald-500',
      delay: '160ms',
    },
    {
      icon: 'ri-file-list-3-line',
      title: t('home.cvsTitle'),
      description: t('home.cvsDesc'),
      link: '/cvs',
      roles: ['applicant', 'employer'],
      color: 'from-orange-500 to-amber-500',
      delay: '240ms',
    },
    {
      icon: 'ri-road-map-line',
      title: t('home.roadmapsTitle'),
      description: t('home.roadmapsDesc'),
      link: '/roadmaps',
      roles: ['learner'],
      color: 'from-indigo-500 to-purple-500',
      delay: '320ms',
    },
  ];

  const stats = [
    { number: '5,000+', label: t('home.activeFreelancers') },
    { number: '2,500+', label: t('home.projectsCompleted') },
    { number: '1,200+', label: t('home.companiesHiring') },
    { number: '98%', label: t('home.successRate') },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20designer%20portrait%20smiling%20confident%20in%20creative%20workspace%20with%20clean%20bright%20background%20modern%20casual%20attire&width=200&height=200&seq=test1&orientation=squarish',
      rating: 5,
      text: 'Next Coder transformed my freelance career. The milestone system ensures I get paid fairly, and clients love the transparency.',
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20software%20engineer%20portrait%20friendly%20smile%20in%20tech%20office%20environment%20clean%20background%20business%20casual&width=200&height=200&seq=test2&orientation=squarish',
      rating: 5,
      text: 'Found my dream job through Next Coder. The CV matching feature helped me stand out, and I got multiple offers within weeks.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Manager',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20marketing%20manager%20portrait%20confident%20smile%20in%20modern%20office%20clean%20white%20background%20professional%20attire&width=200&height=200&seq=test3&orientation=squarish',
      rating: 5,
      text: 'As an employer, Next Coder makes hiring so much easier. The filtering system saves hours of CV screening time.',
    },
  ];

  const orbitIcons = [
    { icon: 'ri-briefcase-line',    color: 'bg-purple-500', top: '10%',  left: '12%',  anim: 'animate-float',      delay: '0s'    },
    { icon: 'ri-graduation-cap-line', color: 'bg-teal-500',  top: '65%',  left: '5%',   anim: 'animate-float-slow', delay: '0.5s'  },
    { icon: 'ri-file-user-line',    color: 'bg-pink-500',   top: '15%',  right: '8%',  anim: 'animate-float',      delay: '1s'    },
    { icon: 'ri-building-line',     color: 'bg-amber-500',  top: '70%',  right: '10%', anim: 'animate-float-slow', delay: '1.5s'  },
    { icon: 'ri-road-map-line',     color: 'bg-indigo-500', top: '40%',  left: '2%',   anim: 'animate-float-x',    delay: '0.8s'  },
    { icon: 'ri-star-line',         color: 'bg-rose-500',   top: '50%',  right: '3%',  anim: 'animate-float-x',    delay: '0.3s'  },
  ];

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.6) 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-6 animate-slide-right" style={{ animationDelay: '0ms' }}>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse inline-block"></span>
                <span className="text-xs font-medium text-purple-400">{t('home.newFeature')}</span>
                <span className="text-xs text-white/60">{t('home.aiPowered')}</span>
                <i className="ri-arrow-right-line text-white/60 text-xs"></i>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-right" style={{ animationDelay: '100ms' }}>
                {t('home.heroTitle').split(t('home.heroHighlight'))[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
                  {t('home.heroHighlight')}
                </span>
                {t('home.heroTitle').split(t('home.heroHighlight'))[1]}
              </h1>

              <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed animate-slide-right" style={{ animationDelay: '200ms' }}>
                {t('home.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-right" style={{ animationDelay: '300ms' }}>
                {!isAuthenticated && (
                  <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-base font-semibold rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all hover:scale-105 shadow-lg shadow-purple-500/25 whitespace-nowrap text-center">
                    {t('home.getStartedFree')} <i className="ri-arrow-right-line ml-2"></i>
                  </Link>
                )}
                <a href="#features" className="px-8 py-4 bg-transparent border-2 border-white/20 text-white text-base font-semibold rounded-xl hover:bg-white/5 hover:border-white/30 transition-all whitespace-nowrap text-center">
                  {t('home.exploreFeatures')} <i className="ri-compass-line ml-2"></i>
                </a>
              </div>

              <div className="flex items-center gap-5 mt-10 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="flex -space-x-2">
                  {['test1','test2','test3'].map((seq) => (
                    <img key={seq} src={`https://readdy.ai/api/search-image?query=professional%20person%20portrait%20clean%20background&width=60&height=60&seq=${seq}av&orientation=squarish`} alt="user" className="w-8 h-8 rounded-full border-2 border-navy-900 object-cover" />
                  ))}
                </div>
                <span className="text-sm text-white/50">{t('home.joinedBy')} <strong className="text-white/80">5,000+</strong> {t('home.professionals')}</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
              {orbitIcons.map((item, i) => (
                <div key={i} className={`absolute ${item.anim} z-20`} style={{ top: item.top, left: 'left' in item ? item.left : undefined, right: 'right' in item ? item.right : undefined, animationDelay: item.delay }}>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${item.color} shadow-lg`}>
                    <i className={`${item.icon} text-white text-lg`}></i>
                  </div>
                </div>
              ))}
              <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-purple-500/15 animate-spin-slow">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-400/60 shadow-md shadow-purple-400/40"></div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-violet-400/50"></div>
                </div>
                <div className="absolute inset-8 rounded-full border border-violet-400/20 animate-spin-reverse">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-pink-400/70"></div>
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-teal-400/60"></div>
                </div>
                <div className="absolute inset-16 rounded-full border border-white/10 animate-spin-slow" style={{ animationDuration: '10s' }}>
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400/70"></div>
                </div>
                <div className="absolute w-48 h-48 bg-purple-500/30 rounded-full blur-3xl animate-pulse-glow"></div>
                <div className="absolute w-32 h-32 bg-violet-500/40 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
                <div className="relative z-10 animate-float">
                  <div className="w-36 h-36 md:w-44 md:h-44 flex items-center justify-center rounded-3xl">
                    <i className="ri-rocket-2-line text-white" style={{ fontSize: '5rem' }}></i>
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg animate-bounce">
                    <i className="ri-sparkling-line text-white text-base"></i>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                    <div className="w-2 h-6 bg-gradient-to-b from-orange-400/80 to-transparent rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-4 bg-gradient-to-b from-amber-400/60 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-3 bg-gradient-to-b from-yellow-400/40 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
                <div className="absolute -right-8 top-8 bg-navy-800/90 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 shadow-lg animate-float-slow" style={{ animationDelay: '0.6s' }}>
                  <div className="text-xs text-white/50 mb-0.5">{t('home.successRate')}</div>
                  <div className="text-sm font-bold text-white">98% <span className="text-green-400">↑</span></div>
                </div>
                <div className="absolute -left-8 bottom-12 bg-navy-800/90 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 shadow-lg animate-float-slow" style={{ animationDelay: '1.2s' }}>
                  <div className="text-xs text-white/50 mb-0.5">{t('home.projectsCompleted')}</div>
                  <div className="text-sm font-bold text-white">2,500+ <span className="text-purple-400">✓</span></div>
                </div>
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
              <div key={index} className="text-center animate-rise" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-white/60 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-rise">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('home.exploreFeaturesTitle')}</h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">{t('home.featuresSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allFeatures.map((feature, index) => (
              <Link key={index} to={feature.link} className="group bg-navy-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/5 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer animate-rise hover:-translate-y-1" style={{ animationDelay: feature.delay }}>
                <div className={`w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <i className={`${feature.icon} text-3xl text-white`}></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                    {t('home.exploreLink')} <i className="ri-arrow-right-line ml-2"></i>
                  </div>
                  <div className="flex gap-1">
                    {feature.roles.map((role, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white/5 text-white/50 text-xs rounded-md capitalize">{role}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {!isAuthenticated && (
            <div className="mt-12 text-center animate-rise" style={{ animationDelay: '400ms' }}>
              <p className="text-white/60 mb-4">{t('home.readyToUnlock')}</p>
              <Link to="/register" className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all hover:scale-105 shadow-lg shadow-purple-500/25 whitespace-nowrap">
                {t('home.createFreeAccount')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-rise">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('home.howItWorks')}</h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">{t('home.howItWorksSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
            {[
              { n: 1, title: t('home.step1Title'), body: t('home.step1Body'), delay: '0ms' },
              { n: 2, title: t('home.step2Title'), body: t('home.step2Body'), delay: '120ms' },
              { n: 3, title: t('home.step3Title'), body: t('home.step3Body'), delay: '240ms' },
            ].map((step) => (
              <div key={step.n} className="text-center animate-rise" style={{ animationDelay: step.delay }}>
                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-500 text-white text-3xl font-bold rounded-full mx-auto mb-6 shadow-lg shadow-purple-500/30 hover:scale-110 transition-transform cursor-default">
                  {step.n}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('home.testimonialsTitle')}</h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">{t('home.testimonialsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-navy-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/5 hover:border-white/10 hover:-translate-y-1 transition-all animate-rise" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="ri-star-fill text-yellow-400 text-lg"></i>
                  ))}
                </div>
                <p className="text-white/70 leading-relaxed mb-6 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-purple-500/30" />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-white/60">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl top-0 left-0 animate-pulse-glow"></div>
          <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl bottom-0 right-0 animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-white/30 rounded-full animate-float-slow" style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.5}s` }}></div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-rise">
          <div className="w-20 h-20 flex items-center justify-center bg-white/15 rounded-2xl mx-auto mb-8 animate-float">
            <i className="ri-rocket-2-line text-white text-4xl"></i>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('home.ctaTitle')}</h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">{t('home.ctaSubtitle')}</p>
          <Link to="/register" className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-bold rounded-xl hover:bg-gray-50 transition-all hover:scale-105 shadow-2xl whitespace-nowrap">
            {t('home.createFreeAccount')} <i className="ri-arrow-right-line ml-2"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
