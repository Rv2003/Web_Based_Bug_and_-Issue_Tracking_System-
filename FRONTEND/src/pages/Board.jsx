import { useState } from 'react';
import TaskCard from '../components/TaskCard';
import { COLUMNS, projects, getPerson, people } from '../data/mockData';
import './Board.css';

export default function Board({ tasks, onMove, query, onNewTask }) {
  const [project, setProject] = useState('all');
  const [assignee, setAssignee] = useState('all');
  const [over, setOver] = useState(null);

  const q = query.trim().toLowerCase();
  const visible = tasks.filter(
    (t) =>
      (project === 'all' || t.project === project) &&
      (assignee === 'all' || t.assignee === assignee) &&
      (!q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
  );

  const drop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) onMove(id, status);
    setOver(null);
  };

  return (
    <div className="board">
      <header className="page-head board__head">
        <div>
          <h1>Board</h1>
          <p>Drag a task to a new column, or focus it and press Shift with an arrow key.</p>
        </div>
        <div className="board__filters">
          <label>
            <span>Project</span>
            <select value={project} onChange={(e) => setProject(e.target.value)}>
              <option value="all">All projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>
            <span>Assignee</span>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="all">Everyone</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>
      </header>

      <div className="board__cols">
        {COLUMNS.map((col) => {
          const items = visible.filter((t) => t.status === col.id);
          const points = items.reduce((sum, t) => sum + t.points, 0);
          return (
            <section
              key={col.id}
              className={`col col--${col.id} ${over === col.id ? 'is-over' : ''}`}
              aria-label={col.label}
              onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null); }}
              onDrop={(e) => drop(e, col.id)}
            >
              <header className="col__head">
                <h2>{col.label}</h2>
                <span>{items.length} tasks, {points} pts</span>
              </header>
              {items.length === 0 ? (
                <p className="col__empty">
                  {col.id === 'todo' ? (
                    <>Nothing queued. <button className="link-btn" onClick={onNewTask}>Create a task</button></>
                  ) : (
                    'Drag a task here to change its status.'
                  )}
                </p>
              ) : (
                <ul className="col__list">
                  {items.map((t) => <TaskCard key={t.id} task={t} onMove={onMove} />)}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
