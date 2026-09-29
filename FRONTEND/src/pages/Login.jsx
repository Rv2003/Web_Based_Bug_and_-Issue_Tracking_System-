import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your work email and password to sign in.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await onLogin(email.trim(), password);
      if (!result.success) {
        setError(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <main className="login">
      <section className="login__brand" aria-hidden="true">
        <svg className="login__steps" viewBox="0 0 320 200">
          <rect x="10" y="130" width="52" height="60" fill="#dcebee" />
          <rect x="82" y="96" width="52" height="94" fill="#dcebee" />
          <rect x="154" y="62" width="52" height="128" fill="#dcebee" />
          <rect x="226" y="20" width="52" height="170" fill="#f2c94c" />
        </svg>
        <p className="login__tagline">Know where every release stands before standup starts.</p>
      </section>

      <section className="login__panel">
        <form className="login__form" onSubmit={submit} noValidate>
          <h1>Sign in to Pacemark</h1>
          <p>Track sprints, projects and milestones in one place.</p>

          <label className="field-l">
            <span>Work email</span>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoComplete="username" 
              placeholder="e.g. priya@example.com"
              required 
            />
          </label>
          <label className="field-l">
            <span>Password</span>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              autoComplete="current-password" 
              placeholder="Enter your password"
              required 
            />
          </label>

          {error && <p className="login__error" role="alert">{error}</p>}

          <button type="submit" className="btn btn--primary login__submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--rule)', borderRadius: 'var(--r-sm)', fontSize: '13px' }}>
            <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Quick Demo Logins (Password: password123):</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => autofillDemo('priya@example.com')}>Priya (PM)</button>
              <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => autofillDemo('kenji@example.com')}>Kenji (Frontend)</button>
              <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => autofillDemo('amara@example.com')}>Amara (Backend)</button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
