import BurndownChart from '../components/BurndownChart';
import StatBlock from '../components/StatBlock';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import Avatar from '../components/Avatar';
import { sprint, projects, activity, getPerson, TODAY } from '../data/mockData';
import { formatDate, isOverdue } from '../utils/format';
import './Dashboard.css';

export default function Dashboard({ tasks, onNavigate }) {
  const today = sprint.actual.length - 1;
  const remaining = sprint.actual[today];
  const planNow = sprint.scope * (1 - today / sprint.totalDays);
  const behind = Math.round(remaining - planNow);
  const daysLeft = sprint.totalDays - today;
  const velocity = (sprint.scope - remaining) / today;
  const carryOver = Math.max(0, Math.round(remaining - velocity * daysLeft));

  const inProgress = tasks.filter((t) => t.status === 'progress').length;
  const inReview = tasks.filter((t) => t.status === 'review').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const attention = tasks.filter((t) => t.blocked || (t.status !== 'done' && isOverdue(t.due, TODAY)));

  const headline =
    behind > 0
      ? `${behind} points behind plan, ${daysLeft} working days left`
      : `On plan, ${daysLeft} working days left`;

  return (
    <div className="dash">
      <header className="dash__hero">
        <p className="dash__sprint">{sprint.name}, {sprint.range}</p>
        <h1>{headline}</h1>
        <p className="dash__sub">
          {carryOver > 0
            ? `At the current pace about ${carryOver} points will carry over to the next sprint.`
            : 'At the current pace the sprint finishes with everything shipped.'}
        </p>
      </header>

      <dl className="dash__stats">
        <StatBlock label="Points remaining" value={remaining} hint={`of ${sprint.scope} in scope`} />
        <StatBlock label="In progress" value={inProgress} hint={`${inReview} waiting for review`} />
        <StatBlock label="Done this sprint" value={done} hint="tasks" />
        <StatBlock label="Need attention" value={attention.length} hint="blocked or overdue" tone={attention.length ? 'alert' : undefined} />
      </dl>

      <section className="panel dash__chart" aria-labelledby="burndown-h">
        <div className="panel__head">
          <h2 id="burndown-h">Sprint burndown</h2>
          <p>Story points left, by day</p>
        </div>
        <BurndownChart sprint={sprint} />
      </section>

      <div className="dash__cols">
        <section className="panel" aria-labelledby="attention-h">
          <div className="panel__head">
            <h2 id="attention-h">Needs attention</h2>
            <button className="link-btn" onClick={() => onNavigate('board')}>Open board</button>
          </div>
          {attention.length === 0 ? (
            <p className="empty">Nothing is blocked or overdue. Keep going.</p>
          ) : (
            <ul className="attn">
              {attention.map((t) => (
                <li key={t.id} className="attn__row">
                  <div className="attn__text">
                    <span className="attn__title">{t.title}</span>
                    <span className="attn__why">
                      {t.id}: {t.blocked ? t.blocked : `Overdue since ${formatDate(t.due)}`}
                    </span>
                  </div>
                  <Avatar person={getPerson(t.assignee)} size={28} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="projects-h">
          <div className="panel__head">
            <h2 id="projects-h">Projects</h2>
            <button className="link-btn" onClick={() => onNavigate('projects')}>See all</button>
          </div>
          <ul className="mini">
            {projects.map((p) => (
              <li key={p.id} className="mini__row">
                <div className="mini__name">
                  <span>{p.name}</span>
                  <StatusBadge kind={p.status} />
                </div>
                <ProgressBar value={p.progress} tone={p.status} label={`${p.name} progress`} />
                <span className="mini__pct">{p.progress}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel dash__activity" aria-labelledby="activity-h">
        <div className="panel__head"><h2 id="activity-h">Recent activity</h2></div>
        <ul className="feed">
          {activity.map((a, i) => (
            <li key={i} className="feed__row">
              <Avatar person={getPerson(a.who)} size={26} />
              <span><strong>{getPerson(a.who).name}</strong> {a.text}</span>
              <time>{a.when}</time>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
