import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8faff',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px',
        width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 12,
            background: '#4f6ef7', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24, margin: '0 auto 12px',
          }}>⊛</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1f36' }}>TaskFlow</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2', color: '#dc2626', padding: '10px 14px',
            borderRadius: 10, fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1f36', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder=""
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
               
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1f36', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder=""
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
                
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: '#4f6ef7',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#64748b' }}>
          Demo: admin@taskflow.com / admin123
        </div>
      </div>
    </div>
  );
}