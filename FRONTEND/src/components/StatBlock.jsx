import './StatBlock.css';

export default function StatBlock({ label, value, hint, tone }) {
  return (
    <div className={`stat ${tone ? `stat--${tone}` : ''}`}>
      <dt className="stat__label">{label}</dt>
      <dd className="stat__value">{value}</dd>
      {hint && <dd className="stat__hint">{hint}</dd>}
    </div>
  );
}
