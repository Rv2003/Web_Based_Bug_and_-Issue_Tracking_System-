import Avatar from '../components/Avatar';
import ProgressBar from '../components/ProgressBar';
import { people } from '../data/mockData';
import './Team.css';

export default function Team({ tasks }) {
  const rows = people.map((person) => {
    const mine = tasks.filter((t) => t.assignee === person.id);
    const open = mine.filter((t) => t.status !== 'done');
    const load = open.reduce((s, t) => s + t.points, 0);
    const shipped = mine.filter((t) => t.status === 'done').reduce((s, t) => s + t.points, 0);
    return { person, openCount: open.length, load, shipped, pct: Math.round((load / person.capacity) * 100) };
  });

  const over = rows.filter((r) => r.pct > 100);

  return (
    <div className="team">
      <header className="page-head">
        <h1>Team workload</h1>
        <p>
          Open points against each person's capacity for this sprint.{' '}
          {over.length > 0
            ? `${over.map((r) => r.person.name).join(' and ')} ${over.length > 1 ? 'are' : 'is'} over capacity.`
            : 'Nobody is over capacity.'}
        </p>
      </header>

      <div className="panel team__table" role="table" aria-label="Team workload">
        <div className="trow trow--head" role="row">
          <span role="columnheader">Person</span>
          <span role="columnheader">Open tasks</span>
          <span role="columnheader">Load</span>
          <span role="columnheader" className="trow__num">Shipped</span>
        </div>
        {rows.map(({ person, openCount, load, shipped, pct }) => (
          <div className="trow" role="row" key={person.id}>
            <span className="trow__who" role="cell">
              <Avatar person={person} size={36} />
              <span>
                <strong>{person.name}</strong>
                <small>{person.role}</small>
              </span>
            </span>
            <span role="cell">{openCount}</span>
            <span className="trow__load" role="cell">
              <ProgressBar value={pct} tone={pct > 100 ? 'over' : 'brand'} label={`${person.name} load`} />
              <b className={pct > 100 ? 'is-over' : ''}>{load} of {person.capacity} pts</b>
            </span>
            <span className="trow__num" role="cell">{shipped} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
