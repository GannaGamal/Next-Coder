import { useState } from 'react';

interface DashboardOverviewProps {
  onViewAllActivities?: () => void;
}

const DashboardOverview = ({ onViewAllActivities }: DashboardOverviewProps) => {
  // Mock data - replace with real data from Supabase
  const stats = [
    {
      id: 1,
      label: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: 'ri-user-line',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 2,
      label: 'Active Freelancers',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: 'ri-briefcase-line',
      color: 'from-teal-500 to-teal-600',
    },
    {
      id: 3,
      label: 'Active Clients',
      value: '892',
      change: '+15.3%',
      trend: 'up',
      icon: 'ri-user-star-line',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 4,
      label: 'Posted Jobs',
      value: '456',
      change: '+5.7%',
      trend: 'up',
      icon: 'ri-file-list-3-line',
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 5,
      label: 'Active Projects',
      value: '328',
      change: '+10.1%',
      trend: 'up',
      icon: 'ri-folder-open-line',
      color: 'from-green-500 to-green-600',
    },
    {
      id: 6,
      label: 'Platform Revenue',
      value: '$45,892',
      change: '+18.9%',
      trend: 'up',
      icon: 'ri-money-dollar-circle-line',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user',
      message: 'New user registered: John Smith',
      time: '5 minutes ago',
      icon: 'ri-user-add-line',
      color: 'text-blue-400',
    },
    {
      id: 2,
      type: 'project',
      message: 'Project milestone approved: E-commerce Website',
      time: '12 minutes ago',
      icon: 'ri-checkbox-circle-line',
      color: 'text-green-400',
    },
    {
      id: 3,
      type: 'job',
      message: 'New job posted: Senior React Developer',
      time: '25 minutes ago',
      icon: 'ri-briefcase-line',
      color: 'text-teal-400',
    },
    {
      id: 4,
      type: 'payment',
      message: 'Payment processed: $2,500',
      time: '1 hour ago',
      icon: 'ri-money-dollar-circle-line',
      color: 'text-pink-400',
    },
    {
      id: 5,
      type: 'user',
      message: 'User role updated: Sarah Johnson → Freelancer',
      time: '2 hours ago',
      icon: 'ri-shield-user-line',
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <i className={`${stat.icon} text-2xl text-white`}></i>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  stat.trend === 'up'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-white/60 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Activities</h2>
          <button
            onClick={onViewAllActivities}
            className="text-teal-400 hover:text-teal-300 text-sm font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1 transition-colors"
          >
            View All
            <i className="ri-arrow-right-line text-sm"></i>
          </button>
        </div>

        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${activity.color}`}>
                <i className={activity.icon}></i>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">{activity.message}</p>
                <p className="text-white/40 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
    </div>
  );
};

export default DashboardOverview;
