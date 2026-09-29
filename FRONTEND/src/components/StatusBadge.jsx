import './StatusBadge.css';

const LABELS = {
  todo: 'To do',
  progress: 'In progress',
  review: 'In review',
  done: 'Done',
  blocked: 'Blocked',
  'on-track': 'On track',
  'at-risk': 'At risk',
  delayed: 'Delayed',
};

export default function StatusBadge({ kind }) {
  return (
    <span className={`badge badge--${kind}`}>
      <span className="badge__dot" aria-hidden="true" />
      {LABELS[kind] ?? kind}
    </span>
  );
}
