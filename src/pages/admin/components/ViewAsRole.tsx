
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useViewAs } from '../../../contexts/ViewAsContext';
import { UserRole } from '../../../types';

interface RoleOption {
  id: UserRole;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  defaultPage: string;
}

const ViewAsRole = () => {
  const navigate = useNavigate();
  const { setViewingAs, viewingAs } = useViewAs();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const roleOptions: RoleOption[] = [
    {
      id: 'learner',
      name: 'Learner',
      description:
        'Experience the platform as a learner accessing courses and roadmaps',
      icon: 'ri-graduation-cap-line',
      color: 'from-green-500 to-emerald-600',
      features: [
        'Access learning roadmaps',
        'View courses',
        'Track progress',
        'Get recommendations',
      ],
      defaultPage: '/roadmaps',
    },
    {
      id: 'employer',
      name: 'Employer',
      description:
        'View the system as an employer posting jobs and reviewing applicants',
      icon: 'ri-building-line',
      color: 'from-blue-500 to-indigo-600',
      features: [
        'Post job listings',
        'Review CVs',
        'Manage applications',
        'Company profile',
      ],
      defaultPage: '/jobs',
    },
    {
      id: 'freelancer',
      name: 'Freelancer',
      description:
        'Browse projects and showcase portfolio as a freelancer',
      icon: 'ri-briefcase-line',
      color: 'from-teal-500 to-cyan-600',
      features: [
        'Browse projects',
        'Submit proposals',
        'Manage portfolio',
        'Track earnings',
      ],
      defaultPage: '/marketplace',
    },
    {
      id: 'applicant',
      name: 'Job Seeker',
      description: 'Search and apply for jobs as a job seeker',
      icon: 'ri-file-user-line',
      color: 'from-orange-500 to-amber-600',
      features: [
        'Search jobs',
        'Submit applications',
        'Manage CV',
        'Track applications',
      ],
      defaultPage: '/jobs',
    },
    {
      id: 'client',
      name: 'Client',
      description:
        'Post projects and hire freelancers as a client',
      icon: 'ri-user-star-line',
      color: 'from-purple-500 to-violet-600',
      features: [
        'Post projects',
        'Hire freelancers',
        'Manage contracts',
        'Review work',
      ],
      defaultPage: '/marketplace',
    },
  ];

  const handleViewAs = (role: RoleOption) => {
    setSelectedRole(role);
    setShowConfirmModal(true);
  };

  const confirmViewAs = () => {
    if (selectedRole) {
      setViewingAs(selectedRole.id);
      setShowConfirmModal(false);
      navigate(selectedRole.defaultPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-purple-500/30 rounded-xl">
            <i className="ri-eye-line text-2xl text-purple-400"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              View As Different Roles
            </h2>
            <p className="text-white/60 text-sm">
              Experience the platform from different user perspectives. This
              allows you to see exactly what each type of user sees, helping you
              understand the user experience and identify potential improvements.
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {viewingAs && (
        <div className="bg-amber-500/20 rounded-xl p-4 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="ri-information-line text-xl text-amber-400"></i>
            <span className="text-amber-200">
              You are currently viewing as{' '}
              <span className="font-bold capitalize">{viewingAs}</span>
            </span>
          </div>
          <button
            onClick={() => setViewingAs(null)}
            className="px-4 py-2 bg-amber-500/30 text-amber-200 rounded-lg hover:bg-amber-500/40 transition-all cursor-pointer whitespace-nowrap"
          >
            Exit View Mode
          </button>
        </div>
      )}

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roleOptions.map((role) => (
          <div
            key={role.id}
            className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border transition-all hover:scale-[1.02] ${
              viewingAs === role.id
                ? 'border-teal-500 ring-2 ring-teal-500/30'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}
              >
                <i className={`${role.icon} text-2xl text-white`}></i>
              </div>
              {viewingAs === role.id && (
                <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-semibold whitespace-nowrap">
                  Currently Viewing
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{role.name}</h3>
            <p className="text-white/60 text-sm mb-4">{role.description}</p>

            <div className="mb-5">
              <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">
                Features Access:
              </p>
              <ul className="space-y-1.5">
                {role.features.map((feature, index) => (
                  <li
                    key={index}
                    className="text-white/60 text-sm flex items-start gap-2"
                  >
                    <i className="ri-checkbox-circle-fill text-teal-400 mt-0.5"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleViewAs(role)}
              disabled={viewingAs === role.id}
              className={`w-full py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                viewingAs === role.id
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : `bg-gradient-to-r ${role.color} text-white hover:shadow-lg`
              }`}
            >
              {viewingAs === role.id ? (
                <>
                  <i className="ri-eye-fill mr-2"></i>
                  Currently Viewing
                </>
              ) : (
                <>
                  <i className="ri-eye-line mr-2"></i>
                  View as {role.name}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <i className="ri-lightbulb-line text-yellow-400"></i>
          Tips for Using View As
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-teal-500/20 rounded-lg flex-shrink-0">
              <i className="ri-navigation-line text-teal-400"></i>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Navigate Freely</p>
              <p className="text-white/50 text-xs">
                Browse all pages accessible to the selected role
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-lg flex-shrink-0">
              <i className="ri-shield-check-line text-purple-400"></i>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Safe Mode</p>
              <p className="text-white/50 text-xs">
                Actions are simulated - no real changes are made
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-orange-500/20 rounded-lg flex-shrink-0">
              <i className="ri-logout-circle-line text-orange-400"></i>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Easy Exit</p>
              <p className="text-white/50 text-xs">
                Click the banner at the top to return to admin view
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-lg flex-shrink-0">
              <i className="ri-user-search-line text-blue-400"></i>
            </div>
            <div>
              <p className="text-white font-medium text-sm">User Experience</p>
              <p className="text-white/50 text-xs">
                See exactly what users see for better UX decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedRole && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedRole.color} flex items-center justify-center`}
                >
                  <i className={`${selectedRole.icon} text-2xl text-white`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    View as {selectedRole.name}
                  </h3>
                  <p className="text-white/50 text-sm">
                    Switch to {selectedRole.name.toLowerCase()} perspective
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-white/70 mb-4">
                You will be redirected to the{' '}
                <span className="text-white font-medium">
                  {selectedRole.defaultPage}
                </span>{' '}
                page and see the platform as a{' '}
                {selectedRole.name.toLowerCase()} would.
              </p>
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <p className="text-white/50 text-sm flex items-start gap-2">
                  <i className="ri-information-line text-teal-400 mt-0.5"></i>
                  A banner will appear at the top of the page. Click it anytime
                  to return to admin view.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={confirmViewAs}
                className={`flex-1 py-3 bg-gradient-to-r ${selectedRole.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer whitespace-nowrap`}
              >
                <i className="ri-eye-line mr-2"></i>
                Start Viewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAsRole;
