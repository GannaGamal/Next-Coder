import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { searchAppUsers, type AppUserSearchResult } from '../../services/app-user.service';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t } = useTranslation();
  
  const [users, setUsers] = useState<AppUserSearchResult[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const allRoles = ['freelancer', 'client', 'employer', 'applicant', 'learner'];

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setUsers([]);
      setIsLoading(false);
      setErrorMessage('');
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setErrorMessage('');

    const timeout = window.setTimeout(() => {
      searchAppUsers(normalizedQuery)
        .then((data) => {
          if (!isActive) return;
          setUsers(data);
        })
        .catch((err: unknown) => {
          if (!isActive) return;
          setErrorMessage(
            err instanceof Error
              ? err.message
              : 'We could not load search results right now.'
          );
          setUsers([]);
        })
        .finally(() => {
          if (!isActive) return;
          setIsLoading(false);
        });
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [query, refreshKey]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const clearFilters = () => {
    setSelectedRoles([]);
  };

  const filteredUsers = useMemo(() => {
    let results = users;

    if (selectedRoles.length > 0) {
      results = results.filter(user =>
        selectedRoles.some(role => user.roles.includes(role))
      );
    }

    return results;
  }, [users, selectedRoles]);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      freelancer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      client: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      employer: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      applicant: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      learner: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      freelancer: 'ri-briefcase-line',
      client: 'ri-user-star-line',
      employer: 'ri-building-line',
      applicant: 'ri-file-user-line',
      learner: 'ri-graduation-cap-line'
    };
    return icons[role] || 'ri-user-line';
  };

  const getRoleLabel = (role: string) => {
    return t(`roles.${role}`, { defaultValue: role.charAt(0).toUpperCase() + role.slice(1) });
  };

  return (
    <div className="min-h-screen bg-[#0f1225]">
      <Navbar />
      
      <main className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('search.title')} {query && <span className="text-purple-400">{t('search.for')} &ldquo;{query}&rdquo;</span>}
            </h1>
            <p className="text-gray-400">
              {t('search.found')} {filteredUsers.length} {filteredUsers.length !== 1 ? t('search.users') : t('search.user')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <i className="ri-filter-3-line"></i>
                    {t('search.filters')}
                  </span>
                  <i className={`ri-arrow-down-s-line transition-transform ${showFilters ? 'rotate-180' : ''}`}></i>
                </button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
                {/* Role Filter */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <i className="ri-user-settings-line text-purple-400"></i>
                    {t('search.userRole')}
                  </h3>
                  <div className="space-y-2">
                    {allRoles.map(role => (
                      <label key={role} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={() => toggleRole(role)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 cursor-pointer"
                        />
                        <i className={`${getRoleIcon(role)} text-gray-400`}></i>
                        <span className="text-gray-300 text-sm">{getRoleLabel(role)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedRoles.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-close-line mr-2"></i>
                    {t('search.clearAllFilters')}
                  </button>
                )}
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1">
              {selectedRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedRoles.map(role => (
                    <span key={role} className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm">
                      <span>{getRoleLabel(role)}</span>
                      <button onClick={() => toggleRole(role)} className="hover:text-white cursor-pointer">
                        <i className="ri-close-line"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-white/5 rounded-full">
                    <i className="ri-loader-4-line text-4xl text-purple-400 animate-spin"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('search.loading', { defaultValue: 'Loading results...' })}</h3>
                  <p className="text-gray-400">{t('search.loadingHint', { defaultValue: 'Searching users for you.' })}</p>
                </div>
              ) : errorMessage ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-red-500/10 rounded-full">
                    <i className="ri-error-warning-line text-4xl text-red-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('search.errorTitle', { defaultValue: 'Something went wrong' })}</h3>
                  <p className="text-gray-400 mb-6">{errorMessage}</p>
                  <button
                    onClick={() => setRefreshKey(prev => prev + 1)}
                    className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {t('search.tryAgain', { defaultValue: 'Try again' })}
                  </button>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-white/5 rounded-full">
                    <i className="ri-user-search-line text-4xl text-gray-500"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('search.noUsersFound')}</h3>
                  <p className="text-gray-400 mb-6">{t('search.tryAdjusting')}</p>
                  <button onClick={clearFilters} className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer whitespace-nowrap">
                    {t('search.clearFilters')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredUsers.map(user => {
                    const primaryRole = user.roles[0];
                    const profileLink = primaryRole
                      ? `/user/${user.id}?role=${primaryRole}`
                      : `/user/${user.id}`;
                    const showRating = typeof user.rating === 'number' && user.rating > 0;
                    const showProjects = typeof user.completedProjects === 'number';
                    const showHourlyRate = typeof user.hourlyRate === 'number';
                    const hasSkills = Array.isArray(user.skills) && user.skills.length > 0;

                    return (
                    <div key={user.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group">
                      <div className="flex items-start gap-4">
                        <Link to={profileLink} className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/10 flex items-center justify-center">
                              <i className="ri-user-line text-2xl text-white/70"></i>
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link to={profileLink} className="text-lg font-semibold text-white hover:text-purple-400 transition-colors cursor-pointer">
                                {user.name}
                              </Link>
                              {user.location && (
                                <p className="text-gray-400 text-sm flex items-center gap-1">
                                  <i className="ri-map-pin-line"></i>
                                  {user.location}
                                </p>
                              )}
                            </div>
                            {showRating && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                                <i className="ri-star-fill text-yellow-400 text-sm"></i>
                                <span className="text-yellow-400 font-semibold text-sm">{user.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Roles */}
                      {user.roles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {user.roles.map(role => (
                            <span key={role} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleColor(role)}`}>
                              <i className={getRoleIcon(role)}></i>
                              <span>{getRoleLabel(role)}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bio */}
                      {user.bio && (
                        <p className="text-gray-400 text-sm mt-4 line-clamp-2">{user.bio}</p>
                      )}

                      {/* Skills */}
                      {hasSkills && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {user.skills?.slice(0, 4).map(skill => (
                            <span key={skill} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-xs">{skill}</span>
                          ))}
                          {user.skills && user.skills.length > 4 && (
                            <span className="px-2.5 py-1 text-gray-500 text-xs">+{user.skills.length - 4} {t('search.moreSkills')}</span>
                          )}
                        </div>
                      )}

                      {/* Stats & Action */}
                      <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/10">
                        <div className="flex items-center gap-4 text-sm">
                          {showProjects && (
                            <span className="text-gray-400">
                              <i className="ri-checkbox-circle-line text-green-400 mr-1"></i>
                              {user.completedProjects} {t('search.completedProjects')}
                            </span>
                          )}
                          {showHourlyRate && (
                            <span className="text-gray-400">
                              <i className="ri-money-dollar-circle-line text-teal-400 mr-1"></i>
                              ${user.hourlyRate}/hr
                            </span>
                          )}
                        </div>
                        <Link to={profileLink} className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-colors cursor-pointer text-sm font-medium whitespace-nowrap">
                          {t('search.viewProfile')}
                        </Link>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
};

export default SearchResults;
