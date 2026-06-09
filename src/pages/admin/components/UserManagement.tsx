import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomSelect from '../../../components/base/CustomSelect';
import {
  getAdminUsersList,
  toggleAdminUserStatus,
  updateAdminUserRoles,
} from '../../../services/admin.service';
import type {
  AdminUserItem,
  role as ApiUserRole,
  userStatus,
} from '../../../services/admin.service';

type RoleFilterOption = 'all' | ApiUserRole;

const PAGE_SIZE = 10;

const allRoles: Array<{ value: RoleFilterOption; label: string }> = [
  { value: 'all', label: 'All Roles' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Client', label: 'Client' },
  { value: 'Freelancer', label: 'Freelancer' },
  { value: 'Employer', label: 'Employer' },
  { value: 'Learner', label: 'Learner' },
  { value: 'Job Seeker', label: 'Job Seeker' },
];

export const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterOption>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | userStatus>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [statusUpdatingIds, setStatusUpdatingIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [editedRoles, setEditedRoles] = useState<ApiUserRole[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [savingRoles, setSavingRoles] = useState(false);
  const prevFilterRef = useRef({ search: '', role: 'all' as RoleFilterOption, status: 'all' as 'all' | userStatus });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let active = true;
    const prev = prevFilterRef.current;
    const filtersChanged =
      prev.search !== debouncedSearch || prev.role !== roleFilter || prev.status !== statusFilter;
    const effectivePage = filtersChanged ? 1 : pageNumber;

    if (filtersChanged) {
      prevFilterRef.current = { search: debouncedSearch, role: roleFilter, status: statusFilter };
      if (pageNumber !== 1) {
        setPageNumber(1);
        return;
      }
    }

    setListLoading(true);
    setListError(null);

    getAdminUsersList({
      SearchTerm: debouncedSearch || undefined,
      Role: roleFilter !== 'all' ? roleFilter : undefined,
      Status: statusFilter !== 'all' ? statusFilter : undefined,
      Page: effectivePage,
      PageSize: PAGE_SIZE,
    })
      .then((data) => {
        if (!active) return;
        setUsers(data.items);
        setTotalPages(data.meta.totalPages);
        setTotalCount(data.meta.totalCount);
      })
      .catch((err) => {
        if (!active) return;
        setListError(err instanceof Error ? err.message : 'Failed to load users.');
      })
      .finally(() => {
        if (active) setListLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, roleFilter, statusFilter, pageNumber]);

  const toggleUserStatus = async (user: AdminUserItem) => {
    setStatusUpdatingIds((prev) => [...prev, user.appUserId]);

    try {
      await toggleAdminUserStatus(user.appUserId);
      setUsers((prev) =>
        prev.map((item) =>
          item.appUserId === user.appUserId
            ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
            : item
        )
      );
      if (selectedUser?.appUserId === user.appUserId) {
        setSelectedUser({
          ...selectedUser,
          status: selectedUser.status === 'active' ? 'inactive' : 'active',
        });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user status.');
    } finally {
      setStatusUpdatingIds((prev) => prev.filter((id) => id !== user.appUserId));
    }
  };

  const openRoleModal = (user: AdminUserItem) => {
    setSelectedUser(user);
    setEditedRoles(user.roles);
    setShowRoleModal(true);
  };

  const viewUserDetails = (user: AdminUserItem) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const toggleRole = (role: ApiUserRole) => {
    setEditedRoles((prev) =>
      prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]
    );
  };

  const saveRoleChanges = async () => {
    if (!selectedUser) return;

    setSavingRoles(true);
    try {
      await updateAdminUserRoles({ appUserId: selectedUser.appUserId, roles: editedRoles });
      setUsers((prev) =>
        prev.map((item) =>
          item.appUserId === selectedUser.appUserId ? { ...item, roles: editedRoles } : item
        )
      );
      setSelectedUser({ ...selectedUser, roles: editedRoles });
      setShowRoleModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update roles.');
    } finally {
      setSavingRoles(false);
    }
  };

  const visiblePageButtons = () =>
    Array.from({ length: totalPages }, (_, index) => index + 1)
      .filter((page) => page === 1 || page === totalPages || Math.abs(page - pageNumber) <= 1)
      .reduce<(number | '...')[]>((acc, page, index, arr) => {
        if (index > 0 && typeof arr[index - 1] === 'number' && page - (arr[index - 1] as number) > 1) {
          acc.push('...');
        }
        acc.push(page);
        return acc;
      }, []);

    const IMG_BASE = 'https://nextcoder.runasp.net/';
    const buildImageUrl = (path: string | undefined | null, name: string) => {
      if (!path) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=128`;
      }
      const trimmed = path.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//') || trimmed.startsWith('data:')) {
        return trimmed;
      }
      // ensure no leading slash duplication
      return IMG_BASE.replace(/\/$/, '') + '/' + trimmed.replace(/^\//, '');
    };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-white/60 text-sm mb-2">
              Search Users
            </label>
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setDebouncedSearch(searchTerm);
                }}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Role filter */}
          <div>
            <label className="block text-white/60 text-sm mb-2">
              Filter by Role
            </label>
            <CustomSelect
              value={roleFilter}
              onChange={(value) => {
                setRoleFilter(value as RoleFilterOption);
                setPageNumber(1);
              }}
              options={allRoles}
              placeholder="All Roles"
            />
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-white/60 text-sm mb-2">
              Filter by Status
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as 'all' | userStatus);
                setPageNumber(1);
              }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              placeholder="All Status"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4 md:hidden">
          {listLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`mobile-loading-${index}`}
                className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse"
              >
                <div className="h-20 rounded-xl bg-white/10" />
              </div>
            ))
          ) : listError ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-red-400 text-sm">
              {listError}
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-white/40">
              <i className="ri-user-search-line text-5xl text-white/20 mb-4 block" />
              No users found
            </div>
          ) : (
            users.map((user) => {
              const isUpdating = statusUpdatingIds.includes(user.appUserId);
              return (
                <div
                  key={user.appUserId}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <Link
                      to={`/user/${encodeURIComponent(user.appUserId)}`}
                      className="flex items-center gap-3 no-underline"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                        <img
                          src={buildImageUrl(user.profileImageUrl, user.fullName)}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user.fullName}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-white/60">
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-1">Status</p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          user.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-1">Joined</p>
                      <p className="text-white font-medium text-sm">{formatDate(user.joinedDate)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <span
                        key={`${user.appUserId}-${role}`}
                        className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-semibold whitespace-nowrap"
                      >
                        {role}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => viewUserDetails(user)}
                      className="flex-1 min-w-[120px] py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all font-semibold"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => openRoleModal(user)}
                      className="flex-1 min-w-[120px] py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all font-semibold"
                    >
                      Roles
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user)}
                      disabled={isUpdating}
                      className={`flex-1 min-w-[120px] py-2 rounded-lg transition-all font-semibold ${
                        user.status === 'active'
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      } ${isUpdating ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Roles</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {listLoading
                ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <tr key={`loading-${index}`} className="border-b border-white/5">
                      <td colSpan={6} className="px-6 py-5">
                        <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
                      </td>
                    </tr>
                  ))
                : listError
                ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-red-400 text-sm">
                        {listError}
                      </td>
                    </tr>
                  )
                : users.length === 0
                ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <i className="ri-user-search-line text-5xl text-white/20 mb-4 block" />
                        <p className="text-white/40">No users found</p>
                      </td>
                    </tr>
                  )
                : users.map((user) => {
                    const isUpdating = statusUpdatingIds.includes(user.appUserId);
                    return (
                      <tr key={user.appUserId} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Link to={`/user/${encodeURIComponent(user.appUserId)}`} className="flex items-center gap-3 no-underline">
                              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white/5">
                                <img
                                  src={buildImageUrl(user.profileImageUrl, user.fullName)}
                                  alt={user.fullName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-white font-medium">{user.fullName}</span>
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/60 text-sm">{user.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {user.roles.map((role) => (
                              <span
                                key={`${user.appUserId}-${role}`}
                                className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-semibold whitespace-nowrap"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              user.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/60 text-sm">{formatDate(user.joinedDate)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewUserDetails(user)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all cursor-pointer"
                              title="View Details"
                            >
                              <i className="ri-eye-line" />
                            </button>
                            <button
                              onClick={() => openRoleModal(user)}
                              className="w-8 h-8 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all cursor-pointer"
                              title="Manage Roles"
                            >
                              <i className="ri-shield-user-line" />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user)}
                              disabled={isUpdating}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                                user.status === 'active'
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              } ${isUpdating ? 'opacity-40 cursor-not-allowed' : ''}`}
                              title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {isUpdating ? (
                                <i className="ri-loader-4-line text-base animate-spin" />
                              ) : user.status === 'active' ? (
                                <i className="ri-close-circle-line" />
                              ) : (
                                <i className="ri-check-line" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {!listLoading && !listError && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-4">
            <p className="text-white/40 text-xs sm:text-sm">{totalCount.toLocaleString()} users</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageNumber(1)}
                disabled={pageNumber === 1}
                className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
                title="First page"
              >
                <i className="ri-skip-left-line" />
              </button>
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="ri-arrow-left-s-line" />
              </button>
              <div className="flex items-center gap-1 px-1">
                {visiblePageButtons().map((page, index) =>
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-white/40 text-sm">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setPageNumber(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        pageNumber === page
                          ? 'bg-teal-500 text-white'
                          : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="ri-arrow-right-s-line" />
              </button>
              <button
                onClick={() => setPageNumber(totalPages)}
                disabled={pageNumber === totalPages}
                className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
                title="Last page"
              >
                <i className="ri-skip-right-line" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Link to={`/user/${encodeURIComponent(selectedUser.appUserId)}`} className="flex items-center gap-4 no-underline">
                  <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-white/5">
                    <img
                      src={buildImageUrl(selectedUser.profileImageUrl, selectedUser.fullName)}
                      alt={selectedUser.fullName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">{selectedUser.fullName}</h4>
                    <p className="text-white/60">{selectedUser.email}</p>
                  </div>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      selectedUser.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Joined Date</p>
                  <p className="text-white font-semibold">{formatDate(selectedUser.joinedDate)}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-3">Assigned Roles</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.map((role) => (
                    <span
                      key={`${selectedUser.appUserId}-${role}`}
                      className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg text-sm font-semibold whitespace-nowrap"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Manage Roles</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-white/60 text-sm mb-4">
                Select roles for{' '}
                <span className="text-white font-semibold">{selectedUser.fullName}</span>
              </p>

              {allRoles
                .filter((option) => option.value !== 'all')
                .map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={editedRoles.includes(option.value as ApiUserRole)}
                      onChange={() => toggleRole(option.value as ApiUserRole)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-white font-medium">{option.label}</span>
                  </label>
                ))}

              <button
                onClick={saveRoleChanges}
                disabled={savingRoles}
                className="w-full py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingRoles ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
