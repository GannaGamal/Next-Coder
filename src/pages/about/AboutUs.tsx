import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const AboutUs = () => {
  const { t } = useTranslation();

  const values = [
    { icon: 'ri-lightbulb-line', title: t('about.innovation'), description: t('about.innovationDesc') },
    { icon: 'ri-team-line', title: t('about.community'), description: t('about.communityDesc') },
    { icon: 'ri-shield-check-line', title: t('about.trust'), description: t('about.trustDesc') },
    { icon: 'ri-rocket-line', title: t('about.growth'), description: t('about.growthDesc') },
  ];

  const team = [
    {
      name: 'Alex Thompson',
      role: 'CEO & Founder',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20CEO%20executive%20portrait%20confident%20smile%20in%20modern%20office%20wearing%20business%20suit%20clean%20white%20background%20leadership%20presence&width=400&height=400&seq=team1&orientation=squarish',
      bio: 'Former tech lead at major companies, passionate about connecting talent with opportunities.',
    },
    {
      name: 'Jessica Martinez',
      role: 'Head of Product',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20product%20manager%20portrait%20friendly%20smile%20in%20tech%20workspace%20wearing%20business%20casual%20clean%20white%20background%20innovative%20mindset&width=400&height=400&seq=team2&orientation=squarish',
      bio: 'Product strategist with 10+ years experience building platforms that users love.',
    },
    {
      name: 'David Kim',
      role: 'CTO',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20technology%20officer%20portrait%20confident%20in%20modern%20tech%20office%20wearing%20smart%20casual%20clean%20white%20background%20technical%20expertise&width=400&height=400&seq=team3&orientation=squarish',
      bio: 'Tech visionary focused on creating scalable, secure, and innovative solutions.',
    },
    {
      name: 'Sarah Williams',
      role: 'Head of Community',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20community%20manager%20portrait%20warm%20smile%20in%20collaborative%20workspace%20wearing%20modern%20attire%20clean%20white%20background%20approachable%20personality&width=400&height=400&seq=team4&orientation=squarish',
      bio: 'Community builder dedicated to fostering meaningful connections and support.',
    },
  ];

  const milestones = [
    { year: '2020', event: 'Next Coder Founded', description: 'Started with a vision to revolutionize the freelance and job market' },
    { year: '2021', event: '1,000 Users', description: 'Reached our first thousand active users across all platforms' },
    { year: '2022', event: 'AI Matching Launch', description: 'Introduced AI-powered CV and project matching technology' },
    { year: '2023', event: '10,000+ Projects', description: 'Facilitated over 10,000 successful project completions' },
    { year: '2024', event: 'Global Expansion', description: 'Expanded to serve users in over 50 countries worldwide' },
    { year: '2025', event: 'Career Roadmaps', description: 'Launched personalized learning paths and career development tools' },
  ];

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {t('about.heroTitle').split('Next Coder')[0]}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Next Coder
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t('about.heroSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://readdy.ai/api/search-image?query=modern%20collaborative%20workspace%20with%20diverse%20team%20working%20together%20on%20laptops%20in%20bright%20office%20environment%20with%20plants%20and%20natural%20light%20professional%20atmosphere%20teamwork%20innovation&width=800&height=600&seq=about1&orientation=landscape"
                alt="Next Coder Team"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('about.ourStory')}</h2>
              <p className="text-white/70 leading-relaxed mb-4">{t('about.storyP1')}</p>
              <p className="text-white/70 leading-relaxed mb-4">{t('about.storyP2')}</p>
              <p className="text-white/70 leading-relaxed">{t('about.storyP3')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.ourValues')}</h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">{t('about.valuesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-navy-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/5 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10">
                <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 mb-6">
                  <i className={`${value.icon} text-3xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-white/60 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.meetTeam')}</h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">{t('about.teamSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-navy-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all group">
                <div className="w-full h-64 overflow-hidden">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-purple-400 text-sm font-semibold mb-3">{member.role}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-navy-800/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.ourJourney')}</h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">{t('about.journeySubtitle')}</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative pl-20">
                  <div className="absolute left-0 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold shadow-lg">
                    {milestone.year}
                  </div>
                  <div className="bg-navy-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/5 hover:border-purple-500/50 transition-all">
                    <h3 className="text-xl font-bold text-white mb-2">{milestone.event}</h3>
                    <p className="text-white/60">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">5,000+</div>
              <div className="text-white/60 font-medium">{t('about.statActiveUsers')}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">50+</div>
              <div className="text-white/60 font-medium">{t('about.statCountries')}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">10,000+</div>
              <div className="text-white/60 font-medium">{t('about.statProjects')}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">98%</div>
              <div className="text-white/60 font-medium">{t('about.statSatisfaction')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('about.joinTitle')}</h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">{t('about.joinSubtitle')}</p>
          <Link to="/register" className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-bold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl whitespace-nowrap">
            {t('about.getStarted')}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
