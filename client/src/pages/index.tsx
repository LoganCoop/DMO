import Link from 'next/link';

const HomePage = () => {
  return (
    <section className="hero is-fullheight">
      <div className="hero-body">
        <div className="container">
          {/* Main Title */}
          <div className="has-text-centered mb-6">
            <h1 className="title is-1" style={{ fontFamily: 'Cinzel, serif', fontSize: '4rem', color: '#d4af37', textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
              ⚔️ Dungeon Master Online ⚔️
            </h1>
            <p className="subtitle is-3 has-text-white-ter mt-4">
              Your Epic D&D Adventure Awaits
            </p>
            <p className="is-size-5 has-text-grey-light mb-5">
              Play Dungeons & Dragons online with friends or solo, powered by AI
            </p>
          </div>

          {/* Feature Cards */}
          <div className="columns is-multiline is-centered mt-6">
            {/* AI Dungeon Master */}
            <div className="column is-4-desktop is-6-tablet">
              <div className="box fantasy-card has-text-centered p-5" style={{ height: '100%' }}>
                <span style={{ fontSize: '4rem' }}>🎲</span>
                <h3 className="title is-4 has-text-warning mt-3">AI Dungeon Master</h3>
                <p className="has-text-white-ter mb-4">
                  Experience dynamic storytelling with our AI-powered Dungeon Master using Gemini 2.0
                </p>
                <Link href="/ai-dm-test" className="button fantasy-button has-text-white">
                  <span className="icon">✨</span>
                  <span>Try AI DM</span>
                </Link>
              </div>
            </div>

            {/* Character Creator */}
            <div className="column is-4-desktop is-6-tablet">
              <div className="box fantasy-card has-text-centered p-5" style={{ height: '100%' }}>
                <span style={{ fontSize: '4rem' }}>📜</span>
                <h3 className="title is-4 has-text-warning mt-3">Character Creator</h3>
                <p className="has-text-white-ter mb-4">
                  Build your hero with our interactive character sheet builder
                </p>
                <button className="button fantasy-button has-text-white" disabled>
                  <span className="icon">🔨</span>
                  <span>Coming Soon</span>
                </button>
              </div>
            </div>

            {/* Join Game */}
            <div className="column is-4-desktop is-6-tablet">
              <div className="box fantasy-card has-text-centered p-5" style={{ height: '100%' }}>
                <span style={{ fontSize: '4rem' }}>🏰</span>
                <h3 className="title is-4 has-text-warning mt-3">Join Game</h3>
                <p className="has-text-white-ter mb-4">
                  Enter a room code to join your party's adventure
                </p>
                <button className="button fantasy-button has-text-white" disabled>
                  <span className="icon">🚪</span>
                  <span>Coming Soon</span>
                </button>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="box fantasy-card mt-6 p-5">
            <h2 className="title is-3 has-text-warning has-text-centered mb-5">
              🌟 Features
            </h2>
            <div className="columns">
              <div className="column">
                <div className="content has-text-white-ter">
                  <ul style={{ fontSize: '1.1rem' }}>
                    <li>🎭 AI-powered Dungeon Master</li>
                    <li>⚔️ Complete D&D 5e rules support</li>
                    <li>👥 Multiplayer rooms with unique codes</li>
                    <li>📊 Interactive character sheets</li>
                  </ul>
                </div>
              </div>
              <div className="column">
                <div className="content has-text-white-ter">
                  <ul style={{ fontSize: '1.1rem' }}>
                    <li>🎲 Built-in dice roller</li>
                    <li>💼 Inventory management</li>
                    <li>💾 Auto-save game progress</li>
                    <li>🌐 Play anywhere, anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="has-text-centered mt-6">
            <div className="buttons is-centered">
              <button className="button is-large fantasy-button has-text-white" disabled>
                <span className="icon">🎮</span>
                <span>Create Account</span>
              </button>
              <button className="button is-large is-outlined has-text-white" style={{ borderColor: '#d4af37' }} disabled>
                <span className="icon">🔑</span>
                <span>Sign In</span>
              </button>
            </div>
            <p className="has-text-grey-light mt-3">
              <small>Authentication coming soon</small>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
