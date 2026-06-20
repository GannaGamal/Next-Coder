import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useTheme } from '../../contexts/ThemeContext';


const Contact = () => {
  const { isLightMode } = useTheme();
  const { t } = useTranslation();

  
  const contactInfo = [
    { icon: 'ri-mail-line', title: t('contact.emailUs'), description: t('contact.emailDesc'), value: 'nextcoder41@gmail.com' },
    { icon: 'ri-phone-line', title: t('contact.callUs'), description: t('contact.callDesc'), value: '+20 109 839 7978' },
  ];

  const faqs = [
    { question: t('contact.faq1Q'), answer: t('contact.faq1A') },
    { question: t('contact.faq2Q'), answer: t('contact.faq2A') },
    { question: t('contact.faq3Q'), answer: t('contact.faq3A') },
    { question: t('contact.faq4Q'), answer: t('contact.faq4A') },
  ];


  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-50' : 'bg-[#1a1f37]'}`}>
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-3xl ${isLightMode ? 'bg-emerald-200/40' : 'bg-purple-500/20'}`}></div>
          <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl ${isLightMode ? 'bg-teal-200/30' : 'bg-blue-500/10'}`}></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isLightMode ? 'from-emerald-500 to-teal-600' : 'from-purple-400 to-blue-400'}`}>
              {t('contact.heroTitle')}
            </span>
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto ${isLightMode ? 'text-gray-600' : 'text-white/70'}`}>
            {t('contact.heroSubtitle')}
          </p>
        </div>
      </section>

      <section className={`py-16 ${isLightMode ? 'bg-gray-50' : 'bg-[#1a1f37]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className={`rounded-2xl p-8 border transition-all text-center group ${
                isLightMode ? 'bg-white border-gray-100 hover:border-emerald-300 hover:shadow-sm' : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/50'
              }`}>
                <div className={`w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br mx-auto mb-6 group-hover:scale-110 transition-transform ${isLightMode ? 'from-emerald-400 to-teal-500' : 'from-purple-500 to-blue-500'}`}>
                  <i className={`${info.icon} text-3xl text-white`}></i>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{info.title}</h3>
                <p className={`text-sm mb-4 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{info.description}</p>
                <p className={`font-medium ${isLightMode ? 'text-emerald-600' : 'text-purple-400'}`}>{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className={`py-20 ${isLightMode ? 'bg-gray-50' : 'bg-[#1a1f37]'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('contact.faqTitle')}</h2>
            <p className={isLightMode ? 'text-gray-500' : 'text-white/60'}>{t('contact.faqSubtitle')}</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`rounded-xl p-6 border transition-all ${
                isLightMode ? 'bg-white border-gray-100 hover:border-emerald-200' : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30'
              }`}>
                <h3 className={`text-lg font-semibold mb-2 flex items-start gap-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  <i className={`ri-question-line mt-1 ${isLightMode ? 'text-emerald-500' : 'text-purple-400'}`}></i>
                  {faq.question}
                </h3>
                <p className={`pl-8 ${isLightMode ? 'text-gray-600' : 'text-white/60'}`}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`py-20 relative overflow-hidden ${isLightMode ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('contact.stillHaveQ')}</h2>
          <p className="text-xl text-white/90 mb-8">{t('contact.joinCommunity')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.instagram.com/nextcoder_?fbclid=IwY2xjawSjmcpleHRuA2FlbQIxMABicmlkETFvT0ZzZUhibFdKTjBiUzg1c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHlGoxfVTP9FM6a2AYMY0KELmaBt9imt9ZwqfL3RAFqTdgAxasV7IfduC5CJQ_aem_wgLmKDpGhhOsm8gbbGMdoA" target="_blank" rel="nofollow noopener noreferrer" className={`px-8 py-4 bg-white font-bold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${isLightMode ? 'text-emerald-600' : 'text-purple-600'}`}>
              <i className="ri-instagram-line text-xl"></i> Follow on instagram
            </a>
            <a href="https://www.facebook.com/profile.php?id=61590898854966" target="_blank" rel="nofollow noopener noreferrer" className="px-8 py-4 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2">
              <i className="ri-facebook-line text-xl"></i> Follow on facebook
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
