import Avatar from './Avatar';
import Icon from './Icon';
import { getPerson, projects, TODAY, COLUMNS } from '../data/mockData';
import { formatDate, isOverdue } from '../utils/format';
import './TaskCard.css';

export default function TaskCard({ task, onMove }) {
  const project = projects.find((p) => p.id === task.project);
  const overdue = task.status !== 'done' && isOverdue(task.due, TODAY);

  const handleKey = (e) => {
    if (!e.shiftKey || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const i = COLUMNS.findIndex((c) => c.id === task.status);
    const next = COLUMNS[i + (e.key === 'ArrowRight' ? 1 : -1)];
    if (next) onMove(task.id, next.id);
  };

  return (
    <li
      className={`task task--${task.priority} ${task.blocked ? 'task--blocked' : ''}`}
      draggable
      tabIndex={0}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onKeyDown={handleKey}
      aria-label={`${task.id}, ${task.title}. Shift plus arrow keys move it between columns.`}
    >
      <div className="task__top">
        <span className="task__id">{task.id}</span>
        <span className={`task__priority task__priority--${task.priority}`}>{task.priority}</span>
      </div>
      <h3 className="task__title">{task.title}</h3>
      {task.blocked && (
        <p className="task__blocked">
          <Icon name="alert" size={15} /> {task.blocked}
        </p>
      )}
      <div className="task__bottom">
        <span className="task__project">{project?.name}</span>
        <span className="task__meta">
          <span className={overdue ? 'task__due task__due--late' : 'task__due'}>
            {overdue ? 'Overdue ' : ''}{formatDate(task.due)}
          </span>
          <span className="task__points" title="Story points">{task.points} pts</span>
          <Avatar person={getPerson(task.assignee)} size={24} />
        </span>
      </div>
    </li>
  );
}
