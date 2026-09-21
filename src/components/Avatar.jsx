import { initials } from '../utils/format';
import './Avatar.css';

const TONES = ['#0f4c5c', '#5b3f9e', '#9a4a1f', '#1f6f4a', '#a13366', '#2f5aa8', '#6b5b1a', '#3f6472'];

export default function Avatar({ person, size = 28 }) {
  if (!person) return null;
  const tone = TONES[person.name.length % TONES.length];
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: tone, fontSize: size * 0.4 }}
      title={person.name}
      aria-label={person.name}
      role="img"
    >
      {initials(person.name)}
    </span>
  );
}
