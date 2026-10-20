import { useState } from 'react';
import './Register.css';

const DEFAULT_ROLES = [
  'Frontend engineer',
  'Backend engineer',
  'Full-stack engineer',
  'Product manager',
  'Product designer',
  'QA engineer',
  'Platform engineer',
  'Data engineer',
  'Other'
];

export default function Register({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [capacity, setCapacity] = useState('14');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your work email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid work email address.');
      return;
    }

    const roleToUse = selectedRole === 'Other' ? customRole.trim() : selectedRole;
    if (!roleToUse) {
      setError('Please specify your role.');
      return;
    }

    if (!password) {
      setError('Please create a password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const capNum = Number(capacity);
    if (isNaN(capNum) || capNum < 1) {
      setError('Sprint capacity must be at least 1 point.');
      return;
    }

    setLoading(true);

    try {
      const result = await onRegister({
        name: name.trim(),
        email: email.trim(),
        password,
        role: roleToUse,
        capacity: capNum
      });

      if (!result.success) {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register">
      <section className="register__brand" aria-hidden="true">
        <svg className="register__steps" viewBox="0 0 320 200">
          <rect x="10" y="130" width="52" height="60" fill="#dcebee" />
          <rect x="82" y="96" width="52" height="94" fill="#dcebee" />
          <rect x="154" y="62" width="52" height="128" fill="#dcebee" />
          <rect x="226" y="20" width="52" height="170" fill="#f2c94c" />
        </svg>
        <p className="register__tagline">Build better products together, sprint by sprint.</p>
      </section>

      <section className="register__panel">
        <form className="register__form" onSubmit={submit} noValidate>
          <h1>Create your account</h1>
          <p>Join your team on Pacemark and start tracking tasks.</p>

          <label className="field-l">
            <span>Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
              autoFocus
            />
          </label>

          <label className="field-l">
            <span>Work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@example.com"
              autoComplete="username"
              required
            />
          </label>

          <div className="register__row">
            <label className="field-l">
              <span>Role</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="select-l"
              >
                {DEFAULT_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-l">
              <span>Capacity (pts)</span>
              <input
                type="number"
                min="1"
                max="40"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                title="Story points capacity per sprint"
                required
              />
            </label>
          </div>

          {selectedRole === 'Other' && (
            <label className="field-l">
              <span>Specify role</span>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Security Specialist"
                required
              />
            </label>
          )}

          <div className="register__row">
            <label className="field-l">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Min 6 characters"
                required
              />
            </label>

            <label className="field-l">
              <span>Confirm</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Repeat password"
                required
              />
            </label>
          </div>

          {error && <p className="register__error" role="alert">{error}</p>}

          <button type="submit" className="btn btn--primary register__submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" className="auth-switch__btn" onClick={onSwitchToLogin}>
              Sign in
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
