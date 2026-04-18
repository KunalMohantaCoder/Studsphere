import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const { theme, toggle } = useTheme();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', isFounder: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await signup(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <button onClick={toggle} style={{ position: 'fixed', top: 20, right: 20, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', cursor: 'pointer' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)', letterSpacing: -2 }}>StudSphere</h1>
          <p style={{ color: 'var(--text2)', marginTop: 8, fontSize: 15 }}>Where students build the future</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: 'var(--bg2)', borderRadius: 8, padding: 4 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, background: mode === m ? 'var(--card)' : 'transparent', color: mode === m ? 'var(--primary)' : 'var(--text2)', boxShadow: mode === m ? 'var(--shadow)' : 'none', transition: 'all 0.15s', cursor: 'pointer' }}>
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: 'var(--danger)', fontSize: 14, marginBottom: 16 }}>{error}</div>}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Username</label>
                <input className="input" name="username" value={form.username} onChange={handle} placeholder="your_username" required />
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Email</label>
              <input className="input" name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Password</label>
              <input className="input" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
            </div>
            {mode === 'signup' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', background: 'var(--bg2)', borderRadius: 8, fontSize: 14 }}>
                <input type="checkbox" name="isFounder" checked={form.isFounder} onChange={handle} />
                <div>
                  <div style={{ fontWeight: 600 }}>I'm a founder / builder 🚀</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>Get the Founder badge on your profile</div>
                </div>
              </label>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 4 }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, marginTop: 20 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
