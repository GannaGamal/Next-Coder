import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import CustomSelect from '../../components/base/CustomSelect';

interface SearchUser {
  id: string;
  name: string;
  avatar: string;
  roles: string[];
  skills: string[];
  rating: number;
  completedProjects: number;
  location: string;
  hourlyRate?: number;
  bio: string;
}

const mockUsers: SearchUser[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20young%20woman%20headshot%20portrait%20smiling%20confident%20business%20casual%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user1&orientation=squarish',
    roles: ['freelancer'],
    skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design'],
    rating: 4.9,
    completedProjects: 47,
    location: 'San Francisco, USA',
    hourlyRate: 85,
    bio: 'Full-stack developer with 6+ years of experience building scalable web applications.'
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20asian%20man%20headshot%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user2&orientation=squarish',
    roles: ['freelancer', 'employer'],
    skills: ['Python', 'Machine Learning', 'Data Science', 'TensorFlow'],
    rating: 4.8,
    completedProjects: 32,
    location: 'New York, USA',
    hourlyRate: 120,
    bio: 'AI/ML specialist helping companies leverage data for business growth.'
  },
  {
    id: '3',
    name: 'Emma Williams',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20blonde%20woman%20headshot%20portrait%20friendly%20smile%20business%20professional%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user3&orientation=squarish',
    roles: ['client'],
    skills: ['Project Management', 'Agile', 'Scrum'],
    rating: 4.7,
    completedProjects: 15,
    location: 'London, UK',
    bio: 'Startup founder looking for talented developers to build innovative products.'
  },
  {
    id: '4',
    name: 'David Rodriguez',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20hispanic%20man%20headshot%20portrait%20confident%20smile%20casual%20business%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user4&orientation=squarish',
    roles: ['freelancer', 'learner'],
    skills: ['Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android'],
    rating: 4.6,
    completedProjects: 28,
    location: 'Austin, USA',
    hourlyRate: 75,
    bio: 'Mobile app developer passionate about creating seamless user experiences.'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20red%20hair%20headshot%20portrait%20warm%20smile%20creative%20professional%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user5&orientation=squarish',
    roles: ['employer'],
    skills: ['HR Management', 'Recruitment', 'Team Building'],
    rating: 4.9,
    completedProjects: 0,
    location: 'Toronto, Canada',
    bio: 'HR Director at TechCorp seeking top talent for our growing engineering team.'
  },
  {
    id: '6',
    name: 'James Wilson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20american%20man%20headshot%20portrait%20confident%20business%20suit%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user6&orientation=squarish',
    roles: ['applicant', 'learner'],
    skills: ['JavaScript', 'HTML', 'CSS', 'Vue.js'],
    rating: 4.2,
    completedProjects: 5,
    location: 'Chicago, USA',
    bio: 'Junior developer eager to learn and grow in the tech industry.'
  },
  {
    id: '7',
    name: 'Anna Kowalski',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20eastern%20european%20woman%20headshot%20portrait%20elegant%20smile%20business%20professional%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user7&orientation=squarish',
    roles: ['freelancer'],
    skills: ['Graphic Design', 'Branding', 'Adobe Creative Suite', 'Figma'],
    rating: 4.95,
    completedProjects: 89,
    location: 'Berlin, Germany',
    hourlyRate: 65,
    bio: 'Award-winning graphic designer specializing in brand identity and visual storytelling.'
  },
  {
    id: '8',
    name: 'Robert Kim',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20korean%20man%20headshot%20portrait%20friendly%20smile%20tech%20casual%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user8&orientation=squarish',
    roles: ['freelancer', 'client'],
    skills: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    rating: 4.85,
    completedProjects: 41,
    location: 'Seattle, USA',
    hourlyRate: 110,
    bio: 'DevOps engineer helping teams ship faster with modern infrastructure.'
  },
  {
    id: '9',
    name: 'Maria Garcia',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20latina%20woman%20headshot%20portrait%20confident%20smile%20business%20casual%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user9&orientation=squarish',
    roles: ['applicant'],
    skills: ['Marketing', 'SEO', 'Content Writing', 'Social Media'],
    rating: 4.5,
    completedProjects: 12,
    location: 'Miami, USA',
    bio: 'Digital marketing specialist with a passion for growth hacking.'
  },
  {
    id: '10',
    name: 'Thomas Anderson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20glasses%20headshot%20portrait%20intellectual%20smile%20business%20casual%20neutral%20background%20high%20quality%20photography&width=200&height=200&seq=user10&orientation=squarish',
    roles: ['freelancer', 'learner'],
    skills: ['Blockchain', 'Solidity', 'Web3', 'Smart Contracts'],
    rating: 4.7,
    completedProjects: 19,
    location: 'Amsterdam, Netherlands',
    hourlyRate: 150,
    bio: 'Blockchain developer building the decentralized future.'
  }
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t } = useTranslation();
  
  const [filteredUsers, setFilteredUsers] = useState<SearchUser[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const allRoles = ['freelancer', 'client', 'employer', 'applicant', 'learner'];
  const allSkills = [...new Set(mockUsers.flatMap(u => u.skills))].sort();

  useEffect(() => {
    let results = mockUsers;

    // Search by name or skills
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
        user.bio.toLowerCase().includes(lowerQuery) ||
        user.location.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by roles
    if (selectedRoles.length > 0) {
      results = results.filter(user =>
        selectedRoles.some(role => user.roles.includes(role))
      );
    }

    // Filter by skills
    if (selectedSkills.length > 0) {
      results = results.filter(user =>
        selectedSkills.some(skill => user.skills.includes(skill))
      );
    }

    // Filter by rating
    if (ratingFilter > 0) {
      results = results.filter(user => user.rating >= ratingFilter);
    }

    // Sort results
    switch (sortBy) {
      case 'rating':
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      case 'projects':
        results = [...results].sort((a, b) => b.completedProjects - a.completedProjects);
        break;
      case 'name':
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredUsers(results);
  }, [query, selectedRoles, selectedSkills, ratingFilter, sortBy]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const clearFilters = () => {
    setSelectedRoles([]);
    setSelectedSkills([]);
    setRatingFilter(0);
    setSortBy('relevance');
  };

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
                {/* Sort By */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <i className="ri-sort-desc text-purple-400"></i>
                    {t('search.sortBy')}
                  </h3>
                  <CustomSelect
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { value: 'relevance', label: t('search.relevance') },
                      { value: 'rating', label: t('search.highestRating') },
                      { value: 'projects', label: t('search.mostProjects') },
                      { value: 'name', label: t('search.nameAZ') }
                    ]}
                    placeholder={t('search.sortBy')}
                  />
                </div>

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

                {/* Rating Filter */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <i className="ri-star-line text-purple-400"></i>
                    {t('search.minimumRating')}
                  </h3>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0, 0].map(rating => (
                      <label key={rating} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="rating"
                          checked={ratingFilter === rating}
                          onChange={() => setRatingFilter(rating)}
                          className="w-4 h-4 border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="text-gray-300 text-sm">
                          {rating === 0 ? t('search.anyRating') : (
                            <span className="flex items-center gap-1">
                              {rating}+ <i className="ri-star-fill text-yellow-400 text-xs"></i>
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skills Filter */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <i className="ri-tools-line text-purple-400"></i>
                    {t('search.skills')}
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {allSkills.map(skill => (
                      <label key={skill} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="text-gray-300 text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {(selectedRoles.length > 0 || selectedSkills.length > 0 || ratingFilter > 0) && (
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
              {(selectedRoles.length > 0 || selectedSkills.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedRoles.map(role => (
                    <span key={role} className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm">
                      <span>{getRoleLabel(role)}</span>
                      <button onClick={() => toggleRole(role)} className="hover:text-white cursor-pointer">
                        <i className="ri-close-line"></i>
                      </button>
                    </span>
                  ))}
                  {selectedSkills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-400 text-sm">
                      {skill}
                      <button onClick={() => toggleSkill(skill)} className="hover:text-white cursor-pointer">
                        <i className="ri-close-line"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {filteredUsers.length === 0 ? (
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
                  {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group">
                      <div className="flex items-start gap-4">
                        <Link to={`/user/${user.id}?role=${user.roles[0]}`} className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all">
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link to={`/user/${user.id}?role=${user.roles[0]}`} className="text-lg font-semibold text-white hover:text-purple-400 transition-colors cursor-pointer">
                                {user.name}
                              </Link>
                              <p className="text-gray-400 text-sm flex items-center gap-1">
                                <i className="ri-map-pin-line"></i>
                                {user.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                              <i className="ri-star-fill text-yellow-400 text-sm"></i>
                              <span className="text-yellow-400 font-semibold text-sm">{user.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Roles */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {user.roles.map(role => (
                          <span key={role} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleColor(role)}`}>
                            <i className={getRoleIcon(role)}></i>
                            <span>{getRoleLabel(role)}</span>
                          </span>
                        ))}
                      </div>

                      {/* Bio */}
                      <p className="text-gray-400 text-sm mt-4 line-clamp-2">{user.bio}</p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {user.skills.slice(0, 4).map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-xs">{skill}</span>
                        ))}
                        {user.skills.length > 4 && (
                          <span className="px-2.5 py-1 text-gray-500 text-xs">+{user.skills.length - 4} {t('search.moreSkills')}</span>
                        )}
                      </div>

                      {/* Stats & Action */}
                      <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/10">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            <i className="ri-checkbox-circle-line text-green-400 mr-1"></i>
                            {user.completedProjects} {t('search.completedProjects')}
                          </span>
                          {user.hourlyRate && (
                            <span className="text-gray-400">
                              <i className="ri-money-dollar-circle-line text-teal-400 mr-1"></i>
                              ${user.hourlyRate}/hr
                            </span>
                          )}
                        </div>
                        <Link to={`/user/${user.id}?role=${user.roles[0]}`} className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-colors cursor-pointer text-sm font-medium whitespace-nowrap">
                          {t('search.viewProfile')}
                        </Link>
                      </div>
                    </div>
                  ))}
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
