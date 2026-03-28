
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'message' | 'project' | 'job' | 'rating' | 'system' | 'payment' | 'course';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  avatar?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    message: 'Sarah Johnson sent you a message about the web development project.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    link: '/dashboard',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20headshot%20modern%20office%20clean%20background%20confident%20smile&width=100&height=100&seq=notif1&orientation=squarish',
  },
  {
    id: '2',
    type: 'project',
    title: 'Project Update',
    message: 'Your proposal for "E-commerce Redesign" has been accepted!',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    link: '/marketplace',
  },
  {
    id: '3',
    type: 'rating',
    title: 'New Rating',
    message: 'TechStart Inc. gave you a 5-star rating for your recent work.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    avatar: 'https://readdy.ai/api/search-image?query=modern%20tech%20company%20logo%20minimal%20design%20blue%20gradient%20abstract&width=100&height=100&seq=notif2&orientation=squarish',
  },
  {
    id: '4',
    type: 'job',
    title: 'Job Application',
    message: 'Your application for "Senior React Developer" is under review.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    link: '/jobs',
  },
  {
    id: '5',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $2,500 for completing the Mobile App UI project.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    link: '/dashboard',
  },
  {
    id: '6',
    type: 'course',
    title: 'Course Completed',
    message: 'Congratulations! You completed "Advanced React Patterns" course.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    link: '/roadmaps',
  },
  {
    id: '7',
    type: 'system',
    title: 'Profile Verified',
    message: 'Your freelancer profile has been verified successfully.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load notifications from localStorage or use mock data
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed.map((n: Notification) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      })));
    } else {
      setNotifications(mockNotifications);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever notifications change
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
