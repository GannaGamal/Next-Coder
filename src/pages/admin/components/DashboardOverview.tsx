import { useState, useEffect } from 'react';
import { getAdminDashboardSummary } from '../../../services/admin.service';
import type { AdminDashboardSummary } from '../../../services/admin.service';

interface DashboardOverviewProps {
  onViewAllActivities?: () => void;
}

const DashboardOverview = ({ onViewAllActivities }: DashboardOverviewProps) => {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAdminDashboardSummary();
        if (!active) return;
        setSummary(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load dashboard statistics.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSummary();
    return () => {
      active = false;
    };
  }, []);

  const stats = summary
    ? [
        { id: 1, label: 'Total Users', value: summary.totalUsers.toLocaleString(), icon: 'ri-user-line', color: 'from-blue-500 to-blue-600' },
        { id: 2, label: 'Active Freelancers', value: summary.activeFreelancers.toLocaleString(), icon: 'ri-briefcase-line', color: 'from-teal-500 to-teal-600' },
        { id: 3, label: 'Active Clients', value: summary.activeClients.toLocaleString(), icon: 'ri-user-star-line', color: 'from-purple-500 to-purple-600' },
        { id: 4, label: 'Posted Jobs', value: summary.postedJobs.toLocaleString(), icon: 'ri-file-list-3-line', color: 'from-orange-500 to-orange-600' },
        { id: 5, label: 'Active Projects', value: summary.activeProjects.toLocaleString(), icon: 'ri-folder-open-line', color: 'from-green-500 to-green-600' },
        { id: 6, label: 'Platform Revenue', value: `$${summary.platformRevenue.toLocaleString()}`, icon: 'ri-money-dollar-circle-line', color: 'from-pink-500 to-pink-600' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-white/50 text-sm mt-1">Platform statistics for admin operations</p>
        </div>

      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <i className={`${stat.icon} text-2xl text-white`}></i>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
