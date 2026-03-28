import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

type FilterType = 'all' | 'unread' | Notification['type'];

const FILTER_KEYS: { key: FilterType; labelKey: string; icon: string }[] = [
  { key: 'all',     labelKey: 'notifications.filterAll',      icon: 'ri-list-check' },
  { key: 'unread',  labelKey: 'notifications.filterUnread',   icon: 'ri-circle-fill' },
  { key: 'message', labelKey: 'notifications.filterMessages', icon: 'ri-message-3-line' },
  { key: 'project', labelKey: 'notifications.filterProjects', icon: 'ri-folder-line' },
  { key: 'job',     labelKey: 'notifications.filterJobs',     icon: 'ri-briefcase-line' },
  { key: 'payment', labelKey: 'notifications.filterPayments', icon: 'ri-money-dollar-circle-line' },
  { key: 'rating',  labelKey: 'notifications.filterRatings',  icon: 'ri-star-line' },
  { key: 'course',  labelKey: 'notifications.filterCourses',  icon: 'ri-graduation-cap-line' },
  { key: 'system',  labelKey: 'notifications.filterSystem',   icon: 'ri-settings-3-line' },
];

const TYPE_META_KEYS: Record<
  Notification['type'],
  { icon: string; color: string; bg: string; labelKey: string }
> = {
  message: { icon: 'ri-message-3-line',           color: 'text-blue-400',    bg: 'bg-blue-500/20',    labelKey: 'notifications.typeMessage' },
  project: { icon: 'ri-folder-line',              color: 'text-emerald-400', bg: 'bg-emerald-500/20', labelKey: 'notifications.typeProject' },
  job:     { icon: 'ri-briefcase-line',           color: 'text-violet-400',  bg: 'bg-violet-500/20',  labelKey: 'notifications.typeJob' },
  rating:  { icon: 'ri-star-line',                color: 'text-yellow-400',  bg: 'bg-yellow-500/20',  labelKey: 'notifications.typeRating' },
  system:  { icon: 'ri-settings-3-line',          color: 'text-gray-400',    bg: 'bg-gray-500/20',    labelKey: 'notifications.typeSystem' },
  payment: { icon: 'ri-money-dollar-circle-line', color: 'text-green-400',   bg: 'bg-green-500/20',   labelKey: 'notifications.typePayment' },
  course:  { icon: 'ri-graduation-cap-line',      color: 'text-cyan-400',    bg: 'bg-cyan-500/20',    labelKey: 'notifications.typeCourse' },
};

const NotificationsPage = () => {
  const { isLightMode } = useTheme();
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return t('notifications.justNow');
    if (minutes < 60) return t('notifications.minutesAgo', { count: minutes });
    if (hours < 24) return t('notifications.hoursAgo', { count: hours });
    if (days < 7) return t('notifications.daysAgo', { count: days });
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    return n.type === activeFilter;
  });

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
  };

  const unreadLabel = unreadCount === 1
    ? t('notifications.unreadSingle', { count: unreadCount })
    : t('notifications.unreadPlural', { count: unreadCount });

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-50' : 'bg-[#1a1f37]'}`}>
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link to="/dashboard" className={`text-sm flex items-center gap-1 ${isLightMode ? 'text-gray-400 hover:text-gray-700' : 'text-gray-500 hover:text-gray-300'}`}>
                  <i className="ri-arrow-left-line"></i>{t('notifications.back')}
                </Link>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                {t('notifications.title')}
              </h1>
              <p className={`text-sm mt-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {unreadCount > 0 ? unreadLabel : t('notifications.allCaughtUp')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'}`}
                >
                  <i className="ri-check-double-line mr-1.5"></i>{t('notifications.markAllAsRead')}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${isLightMode ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'}`}
                >
                  <i className="ri-delete-bin-line mr-1.5"></i>{t('notifications.clearAll')}
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={`rounded-xl border p-2 mb-6 overflow-x-auto thin-scrollbar ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <div className="flex gap-1 min-w-max">
              {FILTER_KEYS.map(f => {
                const count = f.key === 'all'
                  ? notifications.length
                  : f.key === 'unread'
                  ? unreadCount
                  : notifications.filter(n => n.type === f.key).length;

                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activeFilter === f.key
                        ? 'bg-purple-500 text-white'
                        : isLightMode
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <i className={f.icon}></i>
                    {t(f.labelKey)}
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        activeFilter === f.key
                          ? 'bg-white/20 text-white'
                          : f.key === 'unread'
                          ? 'bg-red-500 text-white'
                          : isLightMode
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications List */}
          {filtered.length === 0 ? (
            <div className={`rounded-xl border p-16 text-center ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${isLightMode ? 'bg-gray-100' : 'bg-white/5'}`}>
                <i className={`ri-notification-off-line text-4xl ${isLightMode ? 'text-gray-300' : 'text-gray-600'}`}></i>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>{t('notifications.noNotifications')}</h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {activeFilter === 'unread' ? t('notifications.allCaughtUpMsg') : t('notifications.nothingHereYet')}
              </p>
            </div>
          ) : (
            <div className={`rounded-xl border overflow-hidden ${isLightMode ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
              {filtered.map((n, idx) => {
                const meta = TYPE_META_KEYS[n.type];
                const isLast = idx === filtered.length - 1;

                const cardContent = (
                  <div
                    onClick={() => handleClick(n)}
                    className={`flex gap-4 p-5 transition-colors cursor-pointer group ${!isLast ? (isLightMode ? 'border-b border-gray-100' : 'border-b border-white/5') : ''} ${
                      !n.read
                        ? isLightMode ? 'bg-purple-50/70 hover:bg-purple-50' : 'bg-purple-500/5 hover:bg-purple-500/8'
                        : isLightMode ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Avatar or Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {n.avatar ? (
                        <img src={n.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full ${meta.bg}`}>
                          <i className={`${meta.icon} text-xl ${meta.color}`}></i>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className={`text-sm font-semibold ${!n.read ? (isLightMode ? 'text-gray-900' : 'text-white') : (isLightMode ? 'text-gray-700' : 'text-white/70')}`}>
                              {n.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${meta.bg} ${meta.color}`}>
                              {t(meta.labelKey)}
                            </span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></span>}
                          </div>
                          <p className={`text-sm leading-relaxed ${!n.read ? (isLightMode ? 'text-gray-600' : 'text-white/70') : (isLightMode ? 'text-gray-500' : 'text-white/50')}`}>
                            {n.message}
                          </p>
                          <span className={`text-xs mt-1.5 block ${isLightMode ? 'text-gray-400' : 'text-white/40'}`}>
                            <i className="ri-time-line mr-1"></i>{formatTime(n.timestamp)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && (
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(n.id); }}
                              title={t('notifications.markAsRead')}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${isLightMode ? 'text-gray-400 hover:bg-gray-100 hover:text-purple-600' : 'text-white/40 hover:bg-white/10 hover:text-purple-400'}`}
                            >
                              <i className="ri-check-line"></i>
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeNotification(n.id); }}
                            title={t('notifications.remove')}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${isLightMode ? 'text-gray-400 hover:bg-red-50 hover:text-red-500' : 'text-white/40 hover:bg-red-500/10 hover:text-red-400'}`}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} to={n.link}>{cardContent}</Link>
                ) : (
                  <div key={n.id}>{cardContent}</div>
                );
              })}
            </div>
          )}

          {/* Summary Footer */}
          {filtered.length > 0 && (
            <p className={`text-center text-sm mt-6 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('notifications.showing')} {filtered.length} {t('notifications.of')} {notifications.length} {t('notifications.totalNotifications')}
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
