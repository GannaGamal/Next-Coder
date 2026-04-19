import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { submitContactForm } from '../../services/form.service';
import type { ContactFormData } from '../../services/form.service';

const Contact = () => {
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContactForm(formData as ContactFormData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: 'ri-mail-line', title: t('contact.emailUs'), description: t('contact.emailDesc'), value: 'support@nextcoder.com' },
    { icon: 'ri-map-pin-line', title: t('contact.visitUs'), description: t('contact.visitDesc'), value: '123 Tech Street, San Francisco, CA 94102' },
    { icon: 'ri-phone-line', title: t('contact.callUs'), description: t('contact.callDesc'), value: '+1 (555) 123-4567' },
  ];

  const faqs = [
    { question: t('contact.faq1Q'), answer: t('contact.faq1A') },
    { question: t('contact.faq2Q'), answer: t('contact.faq2A') },
    { question: t('contact.faq3Q'), answer: t('contact.faq3A') },
    { question: t('contact.faq4Q'), answer: t('contact.faq4A') },
  ];

  const inputClass = isLightMode
    ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
    : 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-purple-500';
  const labelClass = isLightMode ? 'text-gray-700' : 'text-white/80';

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      <section className={`py-20 ${isLightMode ? 'bg-white' : 'bg-[#151929]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className={`rounded-2xl p-8 md:p-10 border ${isLightMode ? 'bg-gray-50 border-gray-100' : 'bg-white/5 backdrop-blur-sm border-white/10'}`}>
              <h2 className={`text-3xl font-bold mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('contact.sendMessage')}</h2>
              <p className={`mb-8 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('contact.formSubtitle')}</p>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-6">
                    <i className="ri-check-line text-4xl text-white"></i>
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{t('contact.messageSent')}</h3>
                  <p className={`mb-6 ${isLightMode ? 'text-gray-500' : 'text-white/60'}`}>{t('contact.thankYouMsg')}</p>
                  <button onClick={() => setIsSubmitted(false)} className={`px-6 py-3 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    isLightMode ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}>
                    {t('contact.sendAnother')}
                  </button>
                </div>
              ) : (
                <form id="contact-form" data-readdy-form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>{t('contact.yourName')}</label>
                      <div className="relative">
                        <i className={`ri-user-line absolute left-4 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-gray-400' : 'text-white/40'}`}></i>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder={t('contact.namePlaceholder')} className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none transition-colors text-sm ${inputClass}`} />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>{t('contact.emailAddress')}</label>
                      <div className="relative">
                        <i className={`ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-gray-400' : 'text-white/40'}`}></i>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder={t('contact.emailPlaceholder')} className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none transition-colors text-sm ${inputClass}`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${labelClass}`}>{t('contact.subject')}</label>
                    <div className="relative">
                      <i className={`ri-chat-1-line absolute left-4 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-gray-400' : 'text-white/40'}`}></i>
                      <select name="subject" value={formData.subject} onChange={handleChange} required className={`w-full pl-12 pr-10 py-3 border rounded-lg focus:outline-none transition-colors text-sm appearance-none cursor-pointer ${
                        isLightMode ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500' : 'bg-[#1a1f37] border-white/10 text-white focus:border-purple-500'
                      }`}>
                        <option value="" className={isLightMode ? 'bg-white text-gray-900' : 'bg-[#1a1f37]'}>{t('contact.subjectPlaceholder')}</option>
                        <option value="General Inquiry" className={isLightMode ? 'bg-white text-gray-900' : 'bg-[#1a1f37]'}>{t('contact.generalInquiry')}</option>
                        <option value="Technical Support" className={isLightMode ? 'bg-white text-gray-900' : 'bg-[#1a1f37]'}>{t('contact.technicalSupport')}</option>
                        <option value="Billing Question" className={isLightMode ? 'bg-white text-gray-900' : 'bg-[#1a1f37]'}>{t('contact.billingQuestion')}</option>
                        <option value="Partnership" className={isLightMode ? 'bg-white text-gray-900' : 'bg-[#1a1f37]'}>{t('contact.partnership')}</option>
                        <option value="Feedback" className={isLightMode ? 'bg-white text-gray-900' : 'bg-[#1a1f37]'}>{t('contact.feedback')}</option>
                      </select>
                      <i className={`ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isLightMode ? 'text-gray-400' : 'text-white/40'}`}></i>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${labelClass}`}>{t('contact.message')}</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required maxLength={500} rows={5} placeholder={t('contact.messagePlaceholder')} className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors text-sm resize-none ${inputClass}`}></textarea>
                    <p className={`text-xs mt-1 text-right ${isLightMode ? 'text-gray-400' : 'text-white/40'}`}>{formData.message.length}/500</p>
                  </div>

                  <button type="submit" disabled={isSubmitting} className={`w-full py-4 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap bg-gradient-to-r ${
                    isLightMode ? 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' : 'from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                  }`}>
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="ri-loader-4-line animate-spin"></i>
                        {t('contact.sending')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {t('contact.sendBtn')} <i className="ri-send-plane-line"></i>
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className={`rounded-2xl overflow-hidden border ${isLightMode ? 'border-gray-100' : 'bg-white/5 backdrop-blur-sm border-white/10'}`}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977904694045!2d-122.41941548468204!3d37.77492977975892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1635959481000!5m2!1sen!2sus"
                width="100%" height="100%" style={{ border: 0, minHeight: '500px' }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Next Coder Office Location"
              ></iframe>
            </div>
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
            <a href="https://discord.com" target="_blank" rel="nofollow noopener noreferrer" className={`px-8 py-4 bg-white font-bold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${isLightMode ? 'text-emerald-600' : 'text-purple-600'}`}>
              <i className="ri-discord-line text-xl"></i> {t('contact.joinDiscord')}
            </a>
            <a href="https://twitter.com" target="_blank" rel="nofollow noopener noreferrer" className="px-8 py-4 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2">
              <i className="ri-twitter-x-line text-xl"></i> {t('contact.followX')}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
