
import { useState } from 'react';

interface RoleInfo {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  userCount: number;
  color: string;
  icon: string;
}

const RoleManagement = () => {
  // Initialise the roles array – it never changes, so we keep only the value part of useState
  const [roles] = useState<RoleInfo[]>([
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full platform access and management capabilities',
      requirements: ['Platform administrator privileges'],
      userCount: 3,
      color: 'from-red-500 to-red-600',
      icon: 'ri-admin-line',
    },
    {
      id: 'client',
      name: 'Client',
      description: 'Post projects and hire freelancers',
      requirements: ['Basic profile information', 'Contact details'],
      userCount: 892,
      color: 'from-purple-500 to-purple-600',
      icon: 'ri-user-star-line',
    },
    {
      id: 'freelancer',
      name: 'Freelancer',
      description: 'Apply for projects and showcase portfolio',
      requirements: ['Portfolio upload', 'Skills and experience', 'Hourly rate'],
      userCount: 1234,
      color: 'from-teal-500 to-teal-600',
      icon: 'ri-briefcase-line',
    },
    {
      id: 'employer',
      name: 'Employer',
      description: 'Post job openings and hire employees',
      requirements: ['Company information', 'Company logo', 'Business verification'],
      userCount: 156,
      color: 'from-blue-500 to-blue-600',
      icon: 'ri-building-line',
    },
    {
      id: 'applicant',
      name: 'Job Seeker',
      description: 'Apply for job positions',
      requirements: ['CV/Resume upload', 'Contact information'],
      userCount: 543,
      color: 'from-orange-500 to-orange-600',
      icon: 'ri-file-user-line',
    },
    {
      id: 'learner',
      name: 'Learner',
      description: 'Access learning roadmaps and courses',
      requirements: ['No additional requirements'],
      userCount: 678,
      color: 'from-green-500 to-green-600',
      icon: 'ri-graduation-cap-line',
    },
  ]);

  const [selectedRole, setSelectedRole] = useState<RoleInfo | null>(null);
  const [showRoleDetails, setShowRoleDetails] = useState(false);

  const viewRoleDetails = (role: RoleInfo) => {
    setSelectedRole(role);
    setShowRoleDetails(true);
  };

  // Helper to calculate total users only once – avoids repeated reduction inside the map
  const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);

  return (
    <div className="space-y-6">
      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                <i className={`${role.icon} text-2xl text-white`}></i>
              </div>
              <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm font-semibold whitespace-nowrap">
                {role.userCount} users
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{role.name}</h3>
            <p className="text-white/60 text-sm mb-4">{role.description}</p>

            <div className="mb-4">
              <p className="text-white/40 text-xs mb-2">Requirements:</p>
              <ul className="space-y-1">
                {role.requirements.map((req, index) => (
                  <li key={index} className="text-white/60 text-sm flex items-start gap-2">
                    <i className="ri-checkbox-circle-fill text-teal-400 mt-0.5"></i>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => viewRoleDetails(role)}
              className="w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-semibold cursor-pointer whitespace-nowrap"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Role Statistics */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Role Distribution</h2>

        <div className="space-y-4">
          {roles.map((role) => {
            const percentage = totalUsers ? ((role.userCount / totalUsers) * 100).toFixed(1) : '0.0';

            return (
              <div key={role.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                      <i className={`${role.icon} text-white`}></i>
                    </div>
                    <span className="text-white font-medium">{role.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{role.userCount}</span>
                    <span className="text-white/40 text-sm ml-2">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${role.color} transition-all`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Details Modal */}
      {showRoleDetails && selectedRole && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-2xl w-full border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedRole.color} flex items-center justify-center`}>
                  <i className={`${selectedRole.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="text-2xl font-bold text-white">{selectedRole.name} Role</h3>
              </div>
              <button
                onClick={() => setShowRoleDetails(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-white/60 text-sm mb-2">Description</p>
                <p className="text-white">{selectedRole.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-white">{selectedRole.userCount}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Role ID</p>
                  <p className="text-white font-mono">{selectedRole.id}</p>
                </div>
              </div>

              <div>
                <p className="text-white/60 text-sm mb-3">Requirements</p>
                <ul className="space-y-2">
                  {selectedRole.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <i className="ri-checkbox-circle-fill text-teal-400 mt-0.5"></i>
                      <span className="text-white">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
