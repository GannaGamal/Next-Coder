import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const { isLightMode } = useTheme();
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    const icons: Record<Notification['type'], { icon: string; color: string; bg: string }> = {
      message: { icon: 'ri-message-3-line',           color: 'text-blue-400',    bg: 'bg-blue-500/20'    },
      project: { icon: 'ri-folder-line',              color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
      job:     { icon: 'ri-briefcase-line',           color: 'text-violet-400',  bg: 'bg-violet-500/20'  },
      rating:  { icon: 'ri-star-line',                color: 'text-yellow-400',  bg: 'bg-yellow-500/20'  },
      system:  { icon: 'ri-settings-3-line',          color: 'text-gray-400',    bg: 'bg-gray-500/20'    },
      payment: { icon: 'ri-money-dollar-circle-line', color: 'text-green-400',   bg: 'bg-green-500/20'   },
      course:  { icon: 'ri-graduation-cap-line',      color: 'text-cyan-400',    bg: 'bg-cyan-500/20'    },
    };
    return icons[type] || icons.system;
  };

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
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) markAsRead(notification.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full border transition-all cursor-pointer ${
          isLightMode
            ? 'bg-gray-100 hover:bg-gray-200 border-gray-300'
            : 'bg-white/10 hover:bg-white/20 border-white/20'
        }`}
      >
        <i className={`ri-notification-3-line text-xl ${isLightMode ? 'text-gray-700' : 'text-white'}`}></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-96 border rounded-2xl shadow-2xl overflow-hidden z-50 ${
            isLightMode
              ? 'bg-white border-gray-200 shadow-gray-200/60'
              : 'bg-[#1e2442] border-white/10 shadow-black/40'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b ${isLightMode ? 'bg-purple-50 border-gray-200' : 'border-white/10 bg-gradient-to-br from-purple-500/10 to-violet-500/10'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  {t('notifications.title')}
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-white/50'}`}>
                  {unreadCount > 0
                    ? t('notifications.unreadShort', { count: unreadCount })
                    : t('notifications.allCaughtUp')}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-purple-500 hover:text-purple-400 font-medium cursor-pointer whitespace-nowrap"
                >
                  {t('notifications.markAllRead')}
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto thin-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className={`w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 ${isLightMode ? 'bg-gray-100' : 'bg-white/5'}`}>
                  <i className={`ri-notification-off-line text-3xl ${isLightMode ? 'text-gray-300' : 'text-white/30'}`}></i>
                </div>
                <p className={`text-sm ${isLightMode ? 'text-gray-400' : 'text-white/50'}`}>
                  {t('notifications.noNotificationsYet')}
                </p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => {
                const iconStyle = getNotificationIcon(notification.type);
                const content = (
                  <div
                    className={`p-4 border-b transition-colors cursor-pointer ${
                      isLightMode
                        ? `border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-purple-50/60' : ''}`
                        : `border-white/5 hover:bg-white/5 ${!notification.read ? 'bg-purple-500/5' : ''}`
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <img src={notification.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className={`w-10 h-10 flex items-center justify-center rounded-full ${iconStyle.bg}`}>
                            <i className={`${iconStyle.icon} ${iconStyle.color}`}></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${
                            !notification.read
                              ? isLightMode ? 'text-gray-900' : 'text-white'
                              : isLightMode ? 'text-gray-600' : 'text-white/70'
                          }`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            title={t('notifications.remove')}
                            className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                              isLightMode
                                ? 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'
                                : 'text-white/30 hover:bg-white/10 hover:text-white/70'
                            }`}
                          >
                            <i className="ri-close-line text-sm"></i>
                          </button>
                        </div>
                        <p className={`text-sm mt-0.5 line-clamp-2 ${
                          !notification.read
                            ? isLightMode ? 'text-gray-600' : 'text-white/70'
                            : isLightMode ? 'text-gray-400' : 'text-white/50'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs ${isLightMode ? 'text-gray-400' : 'text-white/40'}`}>
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return notification.link ? (
                  <Link key={notification.id} to={notification.link}>{content}</Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`p-3 border-t flex items-center justify-between ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <button
                onClick={clearAll}
                className="text-sm text-red-400 hover:text-red-500 font-medium cursor-pointer whitespace-nowrap"
              >
                {t('notifications.clearAll')}
              </button>
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-purple-500 hover:text-purple-400 font-medium cursor-pointer whitespace-nowrap"
              >
                {t('notifications.viewAll')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
