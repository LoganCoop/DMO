import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Notification from '../../components/Notification';

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'danger' } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setNotification({ message: `Welcome back, ${data.user.username}!`, type: 'success' });
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <section className="section">
        <div className="container">
        <div className="columns is-centered">
          <div className="column is-5">
            <div className="box fantasy-card">
              <h1 className="title is-2 has-text-warning has-text-centered mb-5" style={{ fontFamily: 'Cinzel, serif' }}>
                ⚔️ Login
              </h1>

              {error && (
                <div className="notification is-danger mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="field">
                  <label className="label has-text-white">Username or Email</label>
                  <div className="control has-icons-left">
                    <input
                      className="input is-medium"
                      type="text"
                      placeholder="Enter your username or email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                    <span className="icon is-left has-text-white">
                      👤
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label has-text-white">Password</label>
                  <div className="control has-icons-left">
                    <input
                      className="input is-medium"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                    <span className="icon is-left has-text-white">
                      🔒
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`button is-large is-fullwidth fantasy-button has-text-white mt-4 ${loading ? 'is-loading' : ''}`}
                  disabled={loading}
                >
                  <span className="icon">🎭</span>
                  <span>Login</span>
                </button>
              </form>

              <hr style={{ backgroundColor: '#d4af37', opacity: 0.3 }} />

              <div className="has-text-centered">
                <p className="has-text-white-ter">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="has-text-warning">
                    <strong>Sign Up</strong>
                  </Link>
                </p>
              </div>
            </div>

            <div className="has-text-centered mt-4">
              <Link href="/" className="button is-outlined has-text-white" style={{ borderColor: '#d4af37' }}>
                <span className="icon">←</span>
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Login;
