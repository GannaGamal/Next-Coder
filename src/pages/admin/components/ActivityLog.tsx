import { useState, useMemo } from 'react';

type ActivityType = 'all' | 'user' | 'project' | 'job' | 'payment' | 'role' | 'complaint' | 'content';

interface Activity {
  id: number;
  type: Exclude<ActivityType, 'all'>;
  message: string;
  detail?: string;
  actor?: string;
  time: string;
  timestamp: Date;
  icon: string;
  color: string;
}

const ALL_ACTIVITIES: Activity[] = [
  { id: 1, type: 'user', message: 'New user registered: John Smith', detail: 'Role: Job Seeker', actor: 'System', time: '5 minutes ago', timestamp: new Date(Date.now() - 5 * 60000), icon: 'ri-user-add-line', color: 'text-blue-400 bg-blue-400/10' },
  { id: 2, type: 'project', message: 'Project milestone approved: E-commerce Website', detail: 'Client: AlphaCorp', actor: 'Admin', time: '12 minutes ago', timestamp: new Date(Date.now() - 12 * 60000), icon: 'ri-checkbox-circle-line', color: 'text-green-400 bg-green-400/10' },
  { id: 3, type: 'job', message: 'New job posted: Senior React Developer', detail: 'Employer: TechVentures', actor: 'System', time: '25 minutes ago', timestamp: new Date(Date.now() - 25 * 60000), icon: 'ri-briefcase-line', color: 'text-teal-400 bg-teal-400/10' },
  { id: 4, type: 'payment', message: 'Payment processed: $2,500', detail: 'Project: Mobile App Redesign', actor: 'System', time: '1 hour ago', timestamp: new Date(Date.now() - 60 * 60000), icon: 'ri-money-dollar-circle-line', color: 'text-pink-400 bg-pink-400/10' },
  { id: 5, type: 'role', message: 'User role updated: Sarah Johnson → Freelancer', detail: 'Previous: Job Seeker', actor: 'Admin', time: '2 hours ago', timestamp: new Date(Date.now() - 2 * 3600000), icon: 'ri-shield-user-line', color: 'text-purple-400 bg-purple-400/10' },
  { id: 6, type: 'complaint', message: 'Complaint filed against user: Mike Torres', detail: 'Reason: Unprofessional conduct', actor: 'Emma Davis', time: '3 hours ago', timestamp: new Date(Date.now() - 3 * 3600000), icon: 'ri-feedback-line', color: 'text-orange-400 bg-orange-400/10' },
  { id: 7, type: 'content', message: 'Post removed: Spam content detected', detail: 'Reported by: 5 users', actor: 'Admin', time: '4 hours ago', timestamp: new Date(Date.now() - 4 * 3600000), icon: 'ri-delete-bin-line', color: 'text-red-400 bg-red-400/10' },
  { id: 8, type: 'user', message: 'New user registered: Lena Hughes', detail: 'Role: Client', actor: 'System', time: '5 hours ago', timestamp: new Date(Date.now() - 5 * 3600000), icon: 'ri-user-add-line', color: 'text-blue-400 bg-blue-400/10' },
  { id: 9, type: 'job', message: 'Job closed: UI/UX Designer — 43 job seekers', detail: 'Employer: DesignStudio', actor: 'System', time: '6 hours ago', timestamp: new Date(Date.now() - 6 * 3600000), icon: 'ri-briefcase-4-line', color: 'text-teal-400 bg-teal-400/10' },
  { id: 10, type: 'payment', message: 'Payout issued: $980 to freelancer Chris Nguyen', detail: 'Project: API Integration', actor: 'System', time: '7 hours ago', timestamp: new Date(Date.now() - 7 * 3600000), icon: 'ri-bank-card-line', color: 'text-pink-400 bg-pink-400/10' },
  { id: 11, type: 'project', message: 'New project created: Brand Identity Package', detail: 'Client: StartupX', actor: 'System', time: '8 hours ago', timestamp: new Date(Date.now() - 8 * 3600000), icon: 'ri-folder-add-line', color: 'text-green-400 bg-green-400/10' },
  { id: 12, type: 'role', message: 'Admin access granted: Rachel Kim', detail: 'Granted by: Super Admin', actor: 'Super Admin', time: '9 hours ago', timestamp: new Date(Date.now() - 9 * 3600000), icon: 'ri-admin-line', color: 'text-purple-400 bg-purple-400/10' },
  { id: 13, type: 'complaint', message: 'Complaint resolved: #1042 — Payment dispute', detail: 'Resolution: Refund issued', actor: 'Admin', time: '10 hours ago', timestamp: new Date(Date.now() - 10 * 3600000), icon: 'ri-check-double-line', color: 'text-orange-400 bg-orange-400/10' },
  { id: 14, type: 'content', message: 'Course published: Full-Stack Web Development', detail: 'Author: David Park', actor: 'System', time: '11 hours ago', timestamp: new Date(Date.now() - 11 * 3600000), icon: 'ri-book-open-line', color: 'text-red-400 bg-red-400/10' },
  { id: 15, type: 'user', message: 'Account suspended: user@example.com', detail: 'Reason: Violation of ToS', actor: 'Admin', time: '12 hours ago', timestamp: new Date(Date.now() - 12 * 3600000), icon: 'ri-user-unfollow-line', color: 'text-blue-400 bg-blue-400/10' },
  { id: 16, type: 'payment', message: 'Refund processed: $320 to client Zara Moore', detail: 'Project: Logo Design', actor: 'System', time: '14 hours ago', timestamp: new Date(Date.now() - 14 * 3600000), icon: 'ri-refund-2-line', color: 'text-pink-400 bg-pink-400/10' },
  { id: 17, type: 'job', message: 'Job flagged for review: Misleading description', detail: 'Reported by: 3 users', actor: 'System', time: '16 hours ago', timestamp: new Date(Date.now() - 16 * 3600000), icon: 'ri-flag-line', color: 'text-teal-400 bg-teal-400/10' },
  { id: 18, type: 'project', message: 'Project dispute opened: #P-2041', detail: 'Between: FreelancerA & ClientB', actor: 'System', time: '18 hours ago', timestamp: new Date(Date.now() - 18 * 3600000), icon: 'ri-error-warning-line', color: 'text-green-400 bg-green-400/10' },
  { id: 19, type: 'user', message: 'Password reset requested: alex.t@mail.com', detail: 'IP: 192.168.1.42', actor: 'System', time: '20 hours ago', timestamp: new Date(Date.now() - 20 * 3600000), icon: 'ri-lock-password-line', color: 'text-blue-400 bg-blue-400/10' },
  { id: 20, type: 'content', message: 'Portfolio removed: Duplicate submission detected', detail: 'User: Mark Sullivan', actor: 'Admin', time: '22 hours ago', timestamp: new Date(Date.now() - 22 * 3600000), icon: 'ri-file-reduce-line', color: 'text-red-400 bg-red-400/10' },
];

const FILTER_TABS: { id: ActivityType; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'ri-list-check-2' },
  { id: 'user', label: 'Users', icon: 'ri-user-line' },
  { id: 'project', label: 'Projects', icon: 'ri-folder-line' },
  { id: 'job', label: 'Jobs', icon: 'ri-briefcase-line' },
  { id: 'payment', label: 'Payments', icon: 'ri-money-dollar-circle-line' },
  { id: 'role', label: 'Roles', icon: 'ri-shield-user-line' },
  { id: 'complaint', label: 'Complaints', icon: 'ri-feedback-line' },
  { id: 'content', label: 'Content', icon: 'ri-stack-line' },
];

const PAGE_SIZE = 8;

const ActivityLog = () => {
  const [activeFilter, setActiveFilter] = useState<ActivityType>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return ALL_ACTIVITIES.filter((a) => {
      const matchType = activeFilter === 'all' || a.type === activeFilter;
      const matchSearch =
        !search ||
        a.message.toLowerCase().includes(search.toLowerCase()) ||
        (a.detail ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (a.actor ?? '').toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [activeFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f: ActivityType) => {
    setActiveFilter(f);
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Activity Log</h2>
          <p className="text-white/50 text-sm mt-1">{filtered.length} events found</p>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search activities..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500/60 transition-colors"
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto thin-scrollbar pb-1">
        {FILTER_TABS.map((tab) => {
          const count = tab.id === 'all' ? ALL_ACTIVITIES.length : ALL_ACTIVITIES.filter((a) => a.type === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                activeFilter === tab.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Activity List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <i className="ri-inbox-line text-4xl mb-3"></i>
            <p className="text-sm">No activities match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {paginated.map((activity, idx) => (
              <div
                key={activity.id}
                className={`flex items-start gap-4 px-6 py-4 hover:bg-white/5 transition-all ${idx % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                  <i className={`${activity.icon} text-sm`}></i>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-snug">{activity.message}</p>
                  {activity.detail && (
                    <p className="text-white/40 text-xs mt-0.5">{activity.detail}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                  {activity.actor && (
                    <span className="text-xs text-white/30 font-medium">{activity.actor}</span>
                  )}
                  <span className="text-xs text-white/40 whitespace-nowrap">{activity.time}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${activity.color}`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <i className="ri-arrow-left-s-line text-sm"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                  n === page
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <i className="ri-arrow-right-s-line text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
