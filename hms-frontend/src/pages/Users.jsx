import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCog, HiOutlineSearch } from 'react-icons/hi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState({ number: 0, totalPages: 0 });

  useEffect(() => { loadUsers(); }, [roleFilter]);

  const loadUsers = async (p = 0) => {
    setLoading(true);
    try {
      let res;
      if (roleFilter !== 'ALL') {
        res = await userAPI.getByRole(roleFilter, p);
      } else {
        res = await userAPI.getAll(p);
      }
      setUsers(res.data.data || []);
      if (res.data.page) setPage(res.data.page);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await userAPI.toggleStatus(id);
      toast.success('User status toggled');
      loadUsers(page.number);
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.delete(id);
      toast.success('User deleted');
      loadUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">User Management</h1>
      </div>

      <div className="page-container">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="filter-tabs">
              {['ALL', 'ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'].map(f => (
                <button key={f} className={`filter-tab ${roleFilter === f ? 'active' : ''}`}
                  onClick={() => setRoleFilter(f)}>{f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : users.length > 0 ? (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                      <td style={{ color: 'var(--primary-light)' }}>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td><span className="badge info">{u.role}</span></td>
                      <td>
                        <span className={`badge ${u.enabled ? 'active' : 'inactive'}`}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{u.createdAt?.split('T')[0]}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => toggleStatus(u.id)}>
                            {u.enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {page.totalPages > 1 && (
              <div className="pagination">
                <button disabled={page.number === 0} onClick={() => loadUsers(page.number - 1)}>Previous</button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page.number + 1} of {page.totalPages}</span>
                <button disabled={page.number >= page.totalPages - 1} onClick={() => loadUsers(page.number + 1)}>Next</button>
              </div>
            )}
          </div>
        ) : (
          <div className="card"><div className="empty-state"><HiOutlineCog /><h3>No users found</h3></div></div>
        )}
      </div>
    </>
  );
};

export default Users;
