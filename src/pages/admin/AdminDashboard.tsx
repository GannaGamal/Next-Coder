import { useState } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import DashboardOverview from './components/DashboardOverview';
import UserManagement from './components/UserManagement';
import ViewAsRole from './components/ViewAsRole';
import ComplaintsManagement from './components/ComplaintsManagement';
import PostedContentManagement from './components/PostedContentManagement';
import ActivityLog from './components/ActivityLog';
import TrackManagement from './components/TrackManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { id: 'users', label: 'User Management', icon: 'ri-user-settings-line' },
    { id: 'viewas', label: 'View As', icon: 'ri-eye-line' },
    { id: 'content', label: 'Posted Content', icon: 'ri-stack-line' },
    { id: 'tracks', label: 'Tracks', icon: 'ri-road-map-line' },
    { id: 'complaints', label: 'Complaints', icon: 'ri-feedback-line' },
    { id: 'activity', label: 'Activity Log', icon: 'ri-history-line' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f37] to-[#0f1219]">
      <Navbar />

      <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-white/60">
              Manage platform users, content, and settings
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 sm:mb-8 overflow-x-auto">
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit min-w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 sm:gap-2 ${
                    activeTab === tab.id
                      ? 'bg-teal-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className={`${tab.icon} text-sm sm:text-base`}></i>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && <DashboardOverview onViewAllActivities={() => setActiveTab('activity')} />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'viewas' && <ViewAsRole />}
            {activeTab === 'content' && <PostedContentManagement />}
            {activeTab === 'tracks' && <TrackManagement />}
            {activeTab === 'complaints' && <ComplaintsManagement />}
            {activeTab === 'activity' && <ActivityLog />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
