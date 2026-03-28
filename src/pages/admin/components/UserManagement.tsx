import React, { useState } from 'react';
import CustomSelect from '../../../components/base/CustomSelect';

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive';
  joinedDate: string;
  avatar: string;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      roles: ['freelancer', 'client'],
      status: 'active',
      joinedDate: '2024-01-15',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20confident%20young%20man%20with%20short%20dark%20hair%20wearing%20navy%20blue%20suit%20and%20white%20shirt%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=user1&orientation=squarish',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      roles: ['employer'],
      status: 'active',
      joinedDate: '2024-02-20',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20confident%20woman%20with%20long%20brown%20hair%20wearing%20elegant%20black%20blazer%20and%20white%20blouse%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=user2&orientation=squarish',
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      roles: ['applicant', 'learner'],
      status: 'active',
      joinedDate: '2024-03-10',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20young%20asian%20man%20with%20black%20hair%20wearing%20gray%20suit%20and%20light%20blue%20shirt%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=user3&orientation=squarish',
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      roles: ['freelancer'],
      status: 'inactive',
      joinedDate: '2024-01-05',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20young%20woman%20with%20blonde%20hair%20in%20bun%20wearing%20burgundy%20blazer%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=user4&orientation=squarish',
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.w@example.com',
      roles: ['client'],
      status: 'active',
      joinedDate: '2024-02-28',
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20mature%20man%20with%20gray%20hair%20wearing%20charcoal%20suit%20and%20striped%20tie%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=user5&orientation=squarish',
    },
  ]);

  const allRoles = [
    'admin',
    'client',
    'freelancer',
    'employer',
    'applicant',
    'learner',
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  /** 
   * Toggle a role for the currently selected user.
   * Includes defensive checks and error handling to avoid
   * state inconsistencies when the selected user disappears.
   */
  const toggleRole = (role: string) => {
    if (!selectedUser) {
      console.warn('Attempted to toggle a role with no user selected');
      return;
    }

    const updatedRoles = selectedUser.roles.includes(role)
      ? selectedUser.roles.filter((r) => r !== role)
      : [...selectedUser.roles, role];

    // Update the users list
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, roles: updatedRoles } : u
      )
    );

    // Keep the modal in sync
    setSelectedUser({ ...selectedUser, roles: updatedRoles });
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
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: 'All Roles' },
                ...allRoles.map((role) => ({
                  value: role,
                  label: role === 'applicant' ? 'Job Seeker' : role.charAt(0).toUpperCase() + role.slice(1),
                })),
              ]}
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
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              placeholder="All Status"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  Roles
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-semibold whitespace-nowrap"
                        >
                          {role === 'applicant' ? 'Job Seeker' : role.charAt(0).toUpperCase() + role.slice(1)}
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
                  <td className="px-6 py-4 text-white/60 text-sm">{user.joinedDate}</td>
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
                        onClick={() => toggleUserStatus(user.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                          user.status === 'active'
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <i
                          className={
                            user.status === 'active'
                              ? 'ri-close-circle-line'
                              : 'ri-check-line'
                          }
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-user-search-line text-5xl text-white/20 mb-4 block" />
            <p className="text-white/40">No users found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {selectedUser.name}
                  </h4>
                  <p className="text-white/60">{selectedUser.email}</p>
                </div>
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
                  <p className="text-white font-semibold">{selectedUser.joinedDate}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-3">Assigned Roles</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.map((role) => (
                    <span
                      key={role}
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

      {/* Role Management Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                <span className="text-white font-semibold">{selectedUser.name}</span>
              </p>

              {allRoles.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUser.roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-white font-medium">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                </label>
              ))}

              <button
                onClick={() => setShowRoleModal(false)}
                className="w-full py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
