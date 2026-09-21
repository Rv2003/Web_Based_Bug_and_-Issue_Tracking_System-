import './BurndownChart.css';

const W = 760;
const H = 290;
const PAD = { l: 44, r: 24, t: 20, b: 34 };

export default function BurndownChart({ sprint }) {
  const { scope, totalDays, actual, dayLabels } = sprint;
  const today = actual.length - 1;
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const x = (d) => PAD.l + (d / totalDays) * iw;
  const y = (v) => PAD.t + ih - (v / scope) * ih;
  const ideal = (d) => scope * (1 - d / totalDays);

  const velocity = (scope - actual[today]) / today;
  const projectedEnd = Math.max(0, actual[today] - velocity * (totalDays - today));

  const line = (pts) => pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join(' ');
  const actualPts = actual.map((v, i) => [x(i), y(v)]);
  const idealPts = [[x(0), y(scope)], [x(totalDays), y(0)]];
  const projPts = [[x(today), y(actual[today])], [x(totalDays), y(projectedEnd)]];

  // shaded gap between plan and actual, up to today
  const gap = [
    ...Array.from({ length: today + 1 }, (_, i) => [x(i), y(ideal(i))]),
    ...actualPts.slice().reverse(),
  ];

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(scope * f));
  const summary = `Burndown. ${actual[today]} of ${scope} points remain after ${today} of ${totalDays} days. Plan is ${Math.round(ideal(today))}. At the current pace ${Math.round(projectedEnd)} points remain at the end.`;

  return (
    <figure className="burndown">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="burndown__svg">
        {yTicks.map((t) => (
          <g key={t}>
            <line className="bd__grid" x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
            <text className="bd__tick" x={PAD.l - 10} y={y(t) + 4} textAnchor="end">{t}</text>
          </g>
        ))}

        {dayLabels.map((label, i) => (
          <text key={i} className="bd__tick" x={x(i + 0.5)} y={H - 10} textAnchor="middle">{label}</text>
        ))}

        <polygon className="bd__gap" points={gap.map((p) => p.join(',')).join(' ')} />
        <path className="bd__ideal" d={line(idealPts)} />
        <path className="bd__proj" d={line(projPts)} />
        <path className="bd__actual" d={line(actualPts)} />

        <line className="bd__today" x1={x(today)} x2={x(today)} y1={PAD.t - 6} y2={PAD.t + ih} />
        <rect className="bd__today-tag" x={x(today) - 26} y={PAD.t - 20} width="52" height="18" rx="3" />
        <text className="bd__today-text" x={x(today)} y={PAD.t - 7} textAnchor="middle">Today</text>

        <circle className="bd__dot" cx={x(today)} cy={y(actual[today])} r="5" />
        <text className="bd__end" x={x(totalDays) - 8} y={y(projectedEnd) - 10} textAnchor="end">
          {Math.round(projectedEnd)} left at current pace
        </text>
      </svg>

      <figcaption className="burndown__legend">
        <span className="burndown__key burndown__key--ideal">Plan</span>
        <span className="burndown__key burndown__key--actual">Actual</span>
        <span className="burndown__key burndown__key--proj">Projected</span>
      </figcaption>
    </figure>
  );
}
