import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Notification from '../../components/Notification';
import { API_URL } from '../../config/api';

const Register = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'danger' } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setNotification({ message: `Welcome to DMO, ${data.user.username}!`, type: 'success' });
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
                ⚔️ Create Account
              </h1>

              {error && (
                <div className="notification is-danger mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="field">
                  <label className="label has-text-white">Username</label>
                  <div className="control has-icons-left">
                    <input
                      className="input is-medium"
                      type="text"
                      placeholder="Choose a username"
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
                  <label className="label has-text-white">Email</label>
                  <div className="control has-icons-left">
                    <input
                      className="input is-medium"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                    <span className="icon is-left has-text-white">
                      📧
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label has-text-white">Password</label>
                  <div className="control has-icons-left">
                    <input
                      className="input is-medium"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                    <span className="icon is-left has-text-white">
                      🔒
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label has-text-white">Confirm Password</label>
                  <div className="control has-icons-left">
                    <input
                      className="input is-medium"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Create Account</span>
                </button>
              </form>

              <hr style={{ backgroundColor: '#d4af37', opacity: 0.3 }} />

              <div className="has-text-centered">
                <p className="has-text-white-ter">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="has-text-warning">
                    <strong>Login</strong>
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

export default Register;
