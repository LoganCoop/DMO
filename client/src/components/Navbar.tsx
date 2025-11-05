import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation" style={{ backgroundColor: 'rgba(26, 15, 46, 0.95)', borderBottom: '2px solid #d4af37' }}>
      <div className="container">
        <div className="navbar-brand">
          <Link href="/" className="navbar-item" style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', color: '#d4af37', fontWeight: 'bold' }}>
            ⚔️ DMO
          </Link>
        </div>

        <div className="navbar-menu">
          <div className="navbar-start">
            <Link href="/" className={`navbar-item has-text-white ${router.pathname === '/' ? 'has-background-dark' : ''}`}>
              🏠 Home
            </Link>
            <Link href="/ai-dm-test" className={`navbar-item has-text-white ${router.pathname === '/ai-dm-test' ? 'has-background-dark' : ''}`}>
              🎲 AI Dungeon Master
            </Link>
            <Link href="/characters/create" className={`navbar-item has-text-white ${router.pathname === '/characters/create' ? 'has-background-dark' : ''}`}>
              ⚔️ Create Character
            </Link>
            <Link href="/characters" className={`navbar-item has-text-white ${router.pathname === '/characters' ? 'has-background-dark' : ''}`}>
              📜 My Characters
            </Link>
            <Link href="/rooms" className={`navbar-item has-text-white ${router.pathname.startsWith('/rooms') ? 'has-background-dark' : ''}`}>
              🏰 Rooms
            </Link>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              {user ? (
                <div className="buttons">
                  <span className="button is-small is-static has-text-warning" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', border: '1px solid #d4af37' }}>
                    👤 {user.username}
                  </span>
                  <button 
                    className="button is-small is-outlined has-text-white" 
                    style={{ borderColor: '#d4af37' }}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="buttons">
                  <Link href="/auth/register" className="button is-small fantasy-button has-text-white">
                    Sign Up
                  </Link>
                  <Link href="/auth/login" className="button is-small is-outlined has-text-white" style={{ borderColor: '#d4af37' }}>
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
