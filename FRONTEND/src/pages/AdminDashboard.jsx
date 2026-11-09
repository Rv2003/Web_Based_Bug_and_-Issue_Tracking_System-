import { useState, useMemo } from 'react';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { PERMISSIONS, ROLE_PRESETS } from '../data/mockData';
import './AdminDashboard.css';

export default function AdminDashboard({
  currentUser,
  users = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onToggleStatus
}) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'matrix' | 'audit'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    capacity: 14,
    systemRole: 'member',
    permissions: ROLE_PRESETS.member.permissions,
    status: 'active',
    password: ''
  });
  const [formError, setFormError] = useState('');

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Audit log entries (initial demo log + dynamic logs)
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'log-1',
      action: 'Role & Permissions initialized',
      actor: 'System',
      target: 'Default roles mapped',
      time: 'Just now'
    },
    {
      id: 'log-2',
      action: 'Superadmin granted',
      actor: 'Admin',
      target: 'Priya Nair (admin)',
      time: '1 hour ago'
    },
    {
      id: 'log-3',
      action: 'Manager assigned',
      actor: 'Admin',
      target: 'Amara Okafor (manager)',
      time: 'Yesterday'
    }
  ]);

  const addAuditLog = (action, target) => {
    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action,
        actor: currentUser?.name || 'Administrator',
        target,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase());

      const userSysRole = u.systemRole || 'member';
      const matchRole = roleFilter === 'all' || userSysRole === roleFilter;

      const userStatus = u.status || 'active';
      const matchStatus = statusFilter === 'all' || userStatus === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Stats calculation
  const totalUsers = users.length;
  const activeCount = users.filter(u => (u.status || 'active') === 'active').length;
  const adminManagerCount = users.filter(u => {
    const r = u.systemRole || 'member';
    return r === 'admin' || r === 'manager';
  }).length;
  const totalCapacity = users.reduce((sum, u) => sum + (Number(u.capacity) || 14), 0);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      role: 'Software engineer',
      capacity: 14,
      systemRole: 'member',
      permissions: [...ROLE_PRESETS.member.permissions],
      status: 'active',
      password: ''
    });
    setFormError('');
    setModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    const sysRole = user.systemRole || 'member';
    const perms = (user.permissions && user.permissions.length > 0)
      ? user.permissions
      : (ROLE_PRESETS[sysRole]?.permissions || ROLE_PRESETS.member.permissions);

    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email || '',
      role: user.role || 'Contributor',
      capacity: user.capacity || 14,
      systemRole: sysRole,
      permissions: [...perms],
      status: user.status || 'active',
      password: ''
    });
    setFormError('');
    setModalMode('edit');
  };

  // Change System Role Preset
  const handleSystemRoleChange = (roleKey) => {
    const preset = ROLE_PRESETS[roleKey];
    setFormData(prev => ({
      ...prev,
      systemRole: roleKey,
      permissions: preset ? [...preset.permissions] : prev.permissions
    }));
  };

  // Toggle Individual Permission Checkbox
  const handleTogglePermission = (permId) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permId);
      const updated = exists
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: updated };
    });
  };

  // Save Modal Form (Create or Edit)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter a full name');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Please enter an email address');
      return;
    }

    if (modalMode === 'create') {
      if (!formData.password || formData.password.length < 6) {
        setFormError('Password must be at least 6 characters long');
        return;
      }
      try {
        await onAddUser(formData);
        addAuditLog('Created new user account', `${formData.name} (${formData.systemRole})`);
        showToast(`User ${formData.name} created successfully.`);
        setModalMode(null);
      } catch (err) {
        setFormError(err.message || 'Failed to create user');
      }
    } else if (modalMode === 'edit' && selectedUser) {
      try {
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }
        await onUpdateUser(selectedUser.id || selectedUser._id, payload);
        addAuditLog(
          'Updated user permissions & profile',
          `${formData.name} (${formData.systemRole}, ${formData.permissions.length} perms)`
        );
        showToast(`User ${formData.name} updated successfully.`);
        setModalMode(null);
      } catch (err) {
        setFormError(err.message || 'Failed to update user');
      }
    }
  };

  // Toggle status quick action
  const handleQuickStatusToggle = async (user) => {
    const currentStatus = user.status || 'active';
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await onToggleStatus(user.id || user._id, nextStatus);
      addAuditLog(`Changed status to ${nextStatus}`, user.name);
      showToast(`User ${user.name} is now ${nextStatus}.`);
    } catch {
      showToast(`Failed to update status for ${user.name}`, 'error');
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await onDeleteUser(deleteCandidate.id || deleteCandidate._id);
      addAuditLog('Deleted user account', deleteCandidate.name);
      showToast(`User ${deleteCandidate.name} has been deleted.`);
      setDeleteCandidate(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="admin-dash">
      {/* Toast Notification */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <Icon name={toast.type === 'success' ? 'check' : 'alert'} size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="admin-dash__header">
        <div className="admin-dash__title-group">
          <h1>Admin & Access Control</h1>
          <p>
            Manage team members, assign role presets, fine-tune granular permissions, and govern account access.
          </p>
        </div>
        <div className="admin-dash__header-actions">
          <button className="btn btn--primary" onClick={handleOpenCreate}>
            <Icon name="plus" size={18} />
            <span>Add User</span>
          </button>
        </div>
      </header>

      {/* Overview Stat Cards */}
      <section className="admin-dash__stats">
        <div className="admin-stat">
          <span className="admin-stat__label">Total Members</span>
          <span className="admin-stat__value">{totalUsers}</span>
          <span className="admin-stat__sub">Accounts registered</span>
        </div>

        <div className="admin-stat">
          <span className="admin-stat__label">Active Accounts</span>
          <span className="admin-stat__value">{activeCount}</span>
          <span className="admin-stat__sub">
            {totalUsers > 0 ? `${Math.round((activeCount / totalUsers) * 100)}% available` : '100%'}
          </span>
        </div>

        <div className="admin-stat">
          <span className="admin-stat__label">Privileged Roles</span>
          <span className="admin-stat__value">{adminManagerCount}</span>
          <span className="admin-stat__sub">Admins & Managers</span>
        </div>

        <div className="admin-stat">
          <span className="admin-stat__label">Total Sprint Capacity</span>
          <span className="admin-stat__value">{totalCapacity} pts</span>
          <span className="admin-stat__sub">Allocated across team</span>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="admin-dash__tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Icon name="users" size={17} />
          <span>Users & Permissions ({filteredUsers.length})</span>
        </button>

        <button
          className={`admin-tab ${activeTab === 'matrix' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <Icon name="matrix" size={17} />
          <span>Role Permissions Matrix</span>
        </button>

        <button
          className={`admin-tab ${activeTab === 'audit' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <Icon name="activity" size={17} />
          <span>Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS & PERMISSIONS */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar: Search & Filters */}
          <div className="admin-dash__controls">
            <div className="admin-dash__search">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-dash__filters">
              <select
                className="admin-dash__filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filter by System Role"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>

              <select
                className="admin-dash__filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* User Table Panel */}
          <div className="admin-table-panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Job Title</th>
                  <th>System Role</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-soft)' }}>
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const sysRole = u.systemRole || 'member';
                    const isSelf = currentUser && (currentUser.email === u.email || currentUser.id === u.id);
                    const perms = (u.permissions && u.permissions.length > 0)
                      ? u.permissions
                      : (ROLE_PRESETS[sysRole]?.permissions || []);
                    const isActive = (u.status || 'active') === 'active';

                    return (
                      <tr key={u.id || u._id || u.email}>
                        {/* Member */}
                        <td>
                          <div className="admin-user-cell">
                            <Avatar person={u} size={36} />
                            <div className="admin-user-info">
                              <span className="admin-user-name">
                                {u.name}
                                {isSelf && <span className="admin-you-tag">You</span>}
                              </span>
                              <span className="admin-user-email">{u.email || `${u.id}@example.com`}</span>
                            </div>
                          </div>
                        </td>

                        {/* Job Title */}
                        <td style={{ color: 'var(--ink-soft)' }}>{u.role}</td>

                        {/* System Role Badge */}
                        <td>
                          <span className={`role-badge role-badge--${sysRole}`}>
                            <Icon name="shield" size={13} />
                            <span>{ROLE_PRESETS[sysRole]?.name || sysRole}</span>
                          </span>
                        </td>

                        {/* Permissions Summary */}
                        <td>
                          <div
                            className="admin-perms-summary"
                            title={perms.join(', ')}
                          >
                            <Icon name="check" size={13} />
                            <span>{perms.length} of {PERMISSIONS.length} granted</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`status-pill status-pill--${isActive ? 'active' : 'suspended'}`}>
                            <span className="status-pill__dot" />
                            <span>{isActive ? 'Active' : 'Suspended'}</span>
                          </span>
                        </td>

                        {/* Capacity */}
                        <td>
                          <strong style={{ color: 'var(--ink)' }}>{u.capacity || 14} pts</strong>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="admin-icon-btn"
                              title="Edit user & permissions"
                              onClick={() => handleOpenEdit(u)}
                            >
                              <Icon name="edit" size={15} />
                            </button>

                            <button
                              className={`admin-icon-btn ${isActive ? 'admin-icon-btn--suspend' : 'admin-icon-btn--activate'}`}
                              title={isActive ? 'Suspend account' : 'Reactivate account'}
                              onClick={() => handleQuickStatusToggle(u)}
                            >
                              <Icon name={isActive ? 'ban' : 'check'} size={15} />
                            </button>

                            <button
                              className="admin-icon-btn admin-icon-btn--danger"
                              title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                              disabled={isSelf}
                              style={isSelf ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                              onClick={() => setDeleteCandidate(u)}
                            >
                              <Icon name="trash" size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSIONS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="matrix-container">
          <div className="panel__head" style={{ padding: 0 }}>
            <div>
              <h2>Standard System Roles & Permission Matrix</h2>
              <p>Compare capabilities granted to each system role preset.</p>
            </div>
          </div>

          <div className="matrix-table-wrap">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Granular Permission</th>
                  <th>Admin</th>
                  <th>Manager</th>
                  <th>Member</th>
                  <th>Viewer</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm) => (
                  <tr key={perm.id}>
                    <td>
                      <div className="matrix-perm-desc">
                        <span className="matrix-perm-title">{perm.label}</span>
                        <span className="matrix-perm-sub">{perm.description}</span>
                      </div>
                    </td>
                    {['admin', 'manager', 'member', 'viewer'].map((roleKey) => {
                      const has = ROLE_PRESETS[roleKey].permissions.includes(perm.id);
                      return (
                        <td key={roleKey}>
                          {has ? (
                            <span className="matrix-check" title="Allowed">
                              <Icon name="check" size={18} />
                            </span>
                          ) : (
                            <span className="matrix-cross" title="Restricted">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role summary cards */}
          <div className="matrix-role-cards">
            {Object.values(ROLE_PRESETS).map((preset) => (
              <div key={preset.id} className="panel" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`role-badge role-badge--${preset.id}`}>
                    <Icon name="shield" size={14} />
                    <span>{preset.name}</span>
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                    ({preset.permissions.length} perms)
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{preset.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="audit-list">
          <div className="panel__head" style={{ padding: '0 0 8px 0' }}>
            <div>
              <h2>Administrative Activity & Security Audit</h2>
              <p>Chronological record of permissions modifications and governance actions.</p>
            </div>
          </div>

          {auditLogs.map((log) => (
            <div className="audit-card" key={log.id}>
              <div className="audit-card__main">
                <div className="audit-card__icon">
                  <Icon name="activity" size={18} />
                </div>
                <div className="audit-card__details">
                  <strong>{log.action}</strong>
                  <p>Target: {log.target} &bull; Initiated by: <b>{log.actor}</b></p>
                </div>
              </div>
              <span className="audit-card__time">{log.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {modalMode && (
        <div className="admin-modal-backdrop" onClick={() => setModalMode(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h2>{modalMode === 'create' ? 'Add New Team Member' : `Edit User: ${selectedUser?.name}`}</h2>
              <button
                className="admin-modal__close"
                onClick={() => setModalMode(null)}
                aria-label="Close modal"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="admin-modal__body">
                {formError && (
                  <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '13px' }}>
                    {formError}
                  </div>
                )}

                {/* Name & Email */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-label">Full Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Alex Rivers"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Email Address</label>
                    <input
                      type="email"
                      className="admin-input"
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Job Title & Capacity */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-label">Job Title / Designation</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Frontend Engineer"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Sprint Capacity (Story pts)</label>
                    <input
                      type="number"
                      className="admin-input"
                      min="1"
                      max="40"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="admin-form-group">
                  <label className="admin-label">
                    {modalMode === 'create' ? 'Initial Password' : 'Reset Password (leave empty to keep current)'}
                  </label>
                  <input
                    type="password"
                    className="admin-input"
                    placeholder={modalMode === 'create' ? 'At least 6 characters' : 'Enter new password to reset'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={modalMode === 'create' ? 6 : undefined}
                  />
                </div>

                {/* System Role Selection */}
                <div className="admin-form-group">
                  <label className="admin-label">System Role Preset</label>
                  <div className="admin-role-picker">
                    {['admin', 'manager', 'member', 'viewer'].map((rKey) => (
                      <button
                        type="button"
                        key={rKey}
                        className={`admin-role-option ${formData.systemRole === rKey ? 'is-selected' : ''}`}
                        onClick={() => handleSystemRoleChange(rKey)}
                      >
                        {ROLE_PRESETS[rKey].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granular Permissions Section */}
                <div className="admin-perms-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="admin-label">
                      Granular Permissions ({formData.permissions.length} selected)
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                      Preset applies defaults; customize as needed
                    </span>
                  </div>

                  <div className="admin-perms-grid">
                    {PERMISSIONS.map((perm) => {
                      const isChecked = formData.permissions.includes(perm.id);
                      return (
                        <label className="admin-perm-item" key={perm.id}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.id)}
                          />
                          <div className="admin-perm-item__text">
                            <strong>{perm.label}</strong>
                            <p>{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="admin-form-group">
                  <label className="admin-label">Account Status</label>
                  <div className="admin-status-picker">
                    <button
                      type="button"
                      className={`admin-status-option ${formData.status === 'active' ? 'is-active-choice' : ''}`}
                      onClick={() => setFormData({ ...formData, status: 'active' })}
                    >
                      <Icon name="check" size={15} />
                      <span>Active</span>
                    </button>
                    <button
                      type="button"
                      className={`admin-status-option ${formData.status === 'suspended' ? 'is-suspended-choice' : ''}`}
                      onClick={() => setFormData({ ...formData, status: 'suspended' })}
                    >
                      <Icon name="ban" size={15} />
                      <span>Suspended</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-modal__foot">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setModalMode(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                >
                  {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteCandidate(null)}>
          <div className="admin-modal admin-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h2>Confirm Deletion</h2>
              <button
                className="admin-modal__close"
                onClick={() => setDeleteCandidate(null)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'var(--ink)' }}>
                Are you sure you want to permanently delete <strong>{deleteCandidate.name}</strong> ({deleteCandidate.email})?
              </p>
              <p style={{ fontSize: '13px', color: 'var(--ink-faint)' }}>
                This action cannot be undone. Any tasks currently assigned to this user will remain in the database unassigned.
              </p>
            </div>
            <div className="admin-modal__foot">
              <button className="btn" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button
                className="btn btn--primary"
                style={{ background: '#b91c1c', borderColor: '#b91c1c' }}
                onClick={handleConfirmDelete}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
