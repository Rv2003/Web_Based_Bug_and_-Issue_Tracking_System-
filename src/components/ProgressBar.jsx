import './ProgressBar.css';

export default function ProgressBar({ value, tone = 'brand', label }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`progress progress--${tone}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
