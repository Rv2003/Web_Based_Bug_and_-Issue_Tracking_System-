import Icon from './Icon';
import './Topbar.css';

export default function Topbar({ query, onQuery, onNewTask }) {
  return (
    <header className="topbar">
      <label className="topbar__search">
        <Icon name="search" size={18} />
        <input
          type="search"
          placeholder="Search tasks and projects"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          aria-label="Search tasks and projects"
        />
      </label>
      <div className="topbar__actions">
        <button className="topbar__bell" aria-label="Notifications">
          <Icon name="bell" />
          <span className="topbar__pip" aria-hidden="true" />
        </button>
        <button className="btn btn--primary" onClick={onNewTask}>
          <Icon name="plus" size={18} /> New task
        </button>
      </div>
    </header>
  );
}
