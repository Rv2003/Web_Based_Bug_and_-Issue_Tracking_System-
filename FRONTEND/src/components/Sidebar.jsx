import Icon from './Icon';
import Avatar from './Avatar';
import './Sidebar.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'projects', label: 'Projects', icon: 'projects' },
  { id: 'board', label: 'Board', icon: 'board' },
  { id: 'team', label: 'Team', icon: 'team' },
];

export default function Sidebar({ page, onNavigate, user, onSignOut }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <rect x="2" y="15" width="5" height="9" fill="#dcebee" />
          <rect x="10" y="9" width="5" height="15" fill="#dcebee" />
          <rect x="18" y="2" width="5" height="22" fill="#f2c94c" />
        </svg>
        <span>Pacemark</span>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`sidebar__link ${page === item.id ? 'is-active' : ''}`}
            aria-current={page === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__user">
        <Avatar person={user} size={32} />
        <div className="sidebar__who">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
        </div>
        <button className="sidebar__signout" onClick={onSignOut} aria-label="Sign out" title="Sign out">
          <Icon name="logout" size={18} />
        </button>
      </div>
    </aside>
  );
}
