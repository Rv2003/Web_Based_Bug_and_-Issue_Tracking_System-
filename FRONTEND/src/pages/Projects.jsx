import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { projects, getPerson } from '../data/mockData';
import { formatDate } from '../utils/format';
import './Projects.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'on-track', label: 'On track' },
  { id: 'at-risk', label: 'At risk' },
  { id: 'delayed', label: 'Delayed' },
];

export default function Projects({ query }) {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState('billing');

  const q = query.trim().toLowerCase();
  const list = projects.filter(
    (p) => (filter === 'all' || p.status === filter) && (!q || p.name.toLowerCase().includes(q))
  );

  return (
    <div className="projects">
      <header className="page-head">
        <h1>Projects</h1>
        <p>Every project with its status, progress and the milestones between now and launch.</p>
      </header>

      <div className="projects__filters" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button key={f.id} className={`chip ${filter === f.id ? 'is-on' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
            <span className="chip__count">
              {f.id === 'all' ? projects.length : projects.filter((p) => p.status === f.id).length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="panel empty">No projects match. Clear the search or pick another status.</p>
      ) : (
        <ul className="panel plist">
          {list.map((p) => {
            const expanded = open === p.id;
            return (
              <li key={p.id} className="prow">
                <button className="prow__summary" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : p.id)}>
                  <span className={`prow__chev ${expanded ? 'is-open' : ''}`}><Icon name="chevron" size={18} /></span>
                  <span className="prow__name">{p.name}</span>
                  <StatusBadge kind={p.status} />
                  <span className="prow__bar">
                    <ProgressBar value={p.progress} tone={p.status} label={`${p.name} progress`} />
                    <b>{p.progress}%</b>
                  </span>
                  <span className="prow__lead"><Avatar person={getPerson(p.lead)} size={26} /></span>
                  <span className="prow__due">Due {formatDate(p.due)}</span>
                </button>

                {expanded && (
                  <div className="prow__detail">
                    <p className="prow__tasks">
                      {p.tasksDone} of {p.tasksTotal} tasks done. Led by {getPerson(p.lead).name}.
                    </p>
                    <ol className="track" aria-label={`${p.name} milestones`}>
                      {p.milestones.map((m) => (
                        <li key={m.name} className={`track__stop ${m.done ? 'is-done' : ''}`}>
                          <span className="track__dot" aria-hidden="true" />
                          <span className="track__name">{m.name}</span>
                          <span className="track__date">{m.done ? 'Done' : formatDate(m.due)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
