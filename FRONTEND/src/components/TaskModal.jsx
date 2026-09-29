import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { people, projects, PRIORITIES, TODAY } from '../data/mockData';
import './TaskModal.css';

const blank = { title: '', project: projects[0].id, assignee: people[1].id, priority: 'medium', points: 3, due: TODAY };

export default function TaskModal({ open, onClose, onCreate }) {
  const [draft, setDraft] = useState(blank);
  const [error, setError] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setDraft(blank);
    setError('');
    titleRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError('Add a title so the team knows what this task is.');
      titleRef.current?.focus();
      return;
    }
    onCreate({ ...draft, title: draft.title.trim(), points: Number(draft.points) || 1 });
  };

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal__sheet" role="dialog" aria-modal="true" aria-labelledby="new-task-title" onSubmit={submit} noValidate>
        <header className="modal__head">
          <h2 id="new-task-title">New task</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </header>

        <label className="field">
          <span>Title</span>
          <input ref={titleRef} value={draft.title} onChange={set('title')} aria-invalid={!!error} aria-describedby={error ? 'title-error' : undefined} />
          {error && <span id="title-error" className="field__error">{error}</span>}
        </label>

        <div className="modal__row">
          <label className="field">
            <span>Project</span>
            <select value={draft.project} onChange={set('project')}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Assignee</span>
            <select value={draft.assignee} onChange={set('assignee')}>
              {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>

        <div className="modal__row modal__row--3">
          <label className="field">
            <span>Priority</span>
            <select value={draft.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Story points</span>
            <input type="number" min="1" max="21" value={draft.points} onChange={set('points')} />
          </label>
          <label className="field">
            <span>Due date</span>
            <input type="date" value={draft.due} onChange={set('due')} />
          </label>
        </div>

        <footer className="modal__foot">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">Create task</button>
        </footer>
      </form>
    </div>
  );
}
