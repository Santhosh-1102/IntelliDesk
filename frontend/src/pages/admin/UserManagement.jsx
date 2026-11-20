import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { 
  Users, 
  Search, 
  Shield, 
  Headset, 
  User as UserIcon, 
  CheckCircle, 
  XCircle, 
  Loader2
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.roles?.includes('ROLE_ADMIN')).length;
  const engineerCount = users.filter((u) => u.roles?.includes('ROLE_SUPPORT_ENGINEER')).length;
  const employeeCount = users.filter((u) => u.roles?.includes('ROLE_EMPLOYEE') && !u.roles?.includes('ROLE_ADMIN') && !u.roles?.includes('ROLE_SUPPORT_ENGINEER')).length;

  const getRoleBadge = (roles) => {
    if (roles?.includes('ROLE_ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 shadow-sm shadow-purple-500/10">
          <Shield className="w-3.5 h-3.5 text-purple-500" /> Admin
        </span>
      );
    }
    if (roles?.includes('ROLE_SUPPORT_ENGINEER')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 shadow-sm shadow-cyan-500/10">
          <Headset className="w-3.5 h-3.5 text-cyan-500" /> Support Engineer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/10">
        <UserIcon className="w-3.5 h-3.5 text-emerald-500" /> Employee
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  User Directory & Role Governance
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                  RBAC
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Manage organizational accounts, assign IT Support Engineer privileges, and control system access
              </p>
            </div>

            <button
              onClick={loadUsers}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-all"
            >
              ↻ Refresh Directory
            </button>
          </motion.div>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4"
          >
            <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalUsers}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Support Engineers</p>
                <p className="text-2xl font-black text-cyan-500 mt-0.5">{engineerCount}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black">
                <Headset className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Administrators</p>
                <p className="text-2xl font-black text-violet-500 mt-0.5">{adminCount}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-black">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Standard Employees</p>
                <p className="text-2xl font-black text-emerald-500 mt-0.5">{employeeCount}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <UserIcon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          {/* Directory Table */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#0d1322] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
          >
            {/* Search */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, department, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs w-full font-medium"
                />
              </div>

              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                Showing {filteredUsers.length} of {users.length} accounts
              </span>
            </div>

            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                <span className="text-xs font-semibold">Loading user directory...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching accounts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/75 dark:bg-slate-900/60 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Current Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Role Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-300/70 dark:border-slate-600/70 flex items-center justify-center text-slate-700 dark:text-slate-200 font-black text-xs shadow-sm">
                              {u.firstName?.[0] || 'U'}{u.lastName?.[0] || ''}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{u.firstName} {u.lastName}</div>
                              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                          {u.department || 'General'}
                        </td>

                        <td className="px-6 py-4">
                          {getRoleBadge(u.roles)}
                        </td>

                        <td className="px-6 py-4">
                          {u.active ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500">
                              <span className="w-2 h-2 rounded-full bg-rose-500" /> Disabled
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5 flex-wrap sm:flex-nowrap">
                            <select
                              disabled={updatingId === u.id}
                              value={u.roles?.[0] || 'ROLE_EMPLOYEE'}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer shadow-sm disabled:opacity-50 min-w-[160px]"
                            >
                              <option value="ROLE_EMPLOYEE">Role: Employee</option>
                              <option value="ROLE_SUPPORT_ENGINEER">Role: Support Engineer</option>
                              <option value="ROLE_ADMIN">Role: Admin</option>
                            </select>

                            <button
                              disabled={updatingId === u.id}
                              onClick={() => handleToggleStatus(u.id)}
                              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-50 min-w-[70px] ${
                                u.active
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-500/30'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-500/30'
                              }`}
                            >
                              {u.active ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
