import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import FreelancerDashboard from './components/FreelancerDashboard';
import ClientDashboard from './components/ClientDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import ApplicantDashboard from './components/ApplicantDashboard';
import { normalizeUserRole } from '../../utils/dashboard';

const Dashboard = () => {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const [activeRole, setActiveRole] = useState('');
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const hasFreelancerRole = userRoles.includes('freelancer');
  const hasClientRole = userRoles.includes('client');
  const hasEmployerRole = userRoles.includes('employer');
  const hasApplicantRole = userRoles.includes('applicant');

  const availableRoles = [
    ...(hasFreelancerRole ? ['freelancer'] : []),
    ...(hasClientRole ? ['client'] : []),
    ...(hasEmployerRole ? ['employer'] : []),
    ...(hasApplicantRole ? ['applicant'] : []),
  ];

  const requestedRole = normalizeUserRole(searchParams.get('role')) ?? '';
  const requestedRoleIsValid = requestedRole ? availableRoles.includes(requestedRole) : false;

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !user) return;
    if (!availableRoles.length) return;

    if (requestedRoleIsValid && requestedRole !== activeRole) {
      setActiveRole(requestedRole);
      return;
    }

    if (!availableRoles.includes(activeRole)) {
      setActiveRole(availableRoles[0]);
    }
  }, [isAuthReady, isAuthenticated, user, availableRoles, activeRole, requestedRole, requestedRoleIsValid]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-white/70">
        Loading your session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasFreelancerRole && !hasClientRole && !hasEmployerRole && !hasApplicantRole) {
    return <Navigate to="/" replace />;
  }

  const hasMultipleRoles = availableRoles.length > 1;
  const effectiveRole = hasMultipleRoles
    ? (availableRoles.includes(activeRole) ? activeRole : availableRoles[0])
    : availableRoles[0];

  const roleConfig: Record<string, { label: string; icon: string; color: string }> = {
    freelancer: { label: t('dashboard.freelancer'), icon: 'ri-briefcase-line', color: 'bg-teal-500' },
    client: { label: t('dashboard.client'), icon: 'ri-user-star-line', color: 'bg-teal-500' },
    employer: { label: t('dashboard.employer'), icon: 'ri-building-4-line', color: 'bg-violet-500' },
    applicant: { label: t('dashboard.applicant'), icon: 'ri-file-user-line', color: 'bg-pink-500' },
  };

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('role', role);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{t('dashboard.title')}</h1>
            <p className="text-white/60 mb-6">{t('dashboard.subtitle')}</p>
            
            {hasMultipleRoles && (
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                {availableRoles.map(role => {
                  const cfg = roleConfig[role];
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        activeRole === role ? `${cfg.color} text-white` : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <i className={`${cfg.icon} mr-2`}></i>{cfg.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {effectiveRole === 'freelancer' && <FreelancerDashboard />}
          {effectiveRole === 'client' && <ClientDashboard />}
          {effectiveRole === 'employer' && <EmployerDashboard />}
          {effectiveRole === 'applicant' && <ApplicantDashboard />}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
