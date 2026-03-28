import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-navy-900 text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg">
                <i className="ri-rocket-2-line text-white text-xl"></i>
              </div>
              <span className="text-2xl font-bold">Next Coder</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-purple-500 rounded-lg transition-colors cursor-pointer" aria-label="Facebook">
                <i className="ri-facebook-fill text-lg"></i>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-purple-500 rounded-lg transition-colors cursor-pointer" aria-label="Twitter">
                <i className="ri-twitter-x-fill text-lg"></i>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-purple-500 rounded-lg transition-colors cursor-pointer" aria-label="Instagram">
                <i className="ri-instagram-fill text-lg"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.platform')}</h4>
            <ul className="space-y-3">
              <li><Link to="/freelance" className="text-white/60 hover:text-purple-400 text-sm transition-colors">{t('footer.freelanceMarketplace')}</Link></li>
              <li><Link to="/jobs" className="text-white/60 hover:text-purple-400 text-sm transition-colors">{t('footer.jobOpportunities')}</Link></li>
              <li><Link to="/roadmap" className="text-white/60 hover:text-purple-400 text-sm transition-colors">{t('footer.careerRoadmap')}</Link></li>
              <li><Link to="/portfolios" className="text-white/60 hover:text-purple-400 text-sm transition-colors">{t('footer.freelancerPortfolios')}</Link></li>
              <li><Link to="/cvs" className="text-white/60 hover:text-purple-400 text-sm transition-colors">{t('footer.publicCVs')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.company')}</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-white/60 hover:text-purple-400 text-sm transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-purple-400 text-sm transition-colors">{t('footer.contact')}</Link></li>
              <li>
                <Link to="/rate-us" className="text-white/60 hover:text-purple-400 text-sm transition-colors">
                  <i className="ri-star-line mr-1"></i>{t('footer.rateUs')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">{t('footer.copyright')}</p>
          <a href="https://readdy.ai/?origin=logo" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-purple-400 text-sm transition-colors mt-4 md:mt-0">
            {t('footer.poweredBy')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
