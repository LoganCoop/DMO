import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { isAuthenticated } from '../utils/auth';

const AIDMTestPage = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    } else {
      setIsChecking(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/dm-action`, { prompt });
      setResponse(result.data.response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || !isAuthenticated()) {
    return null;
  }

  return (
    <section className="hero is-fullheight">
      <div className="hero-body">
        <div className="container">
          {/* Header */}
          <div className="has-text-centered mb-6">
            <h1 className="title is-1 has-text-white" style={{ fontFamily: 'Cinzel, serif', color: '#d4af37', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              <span className="icon-text">
                <span className="icon">⚔️</span>
                <span>Dungeon Master Online</span>
                <span className="icon">⚔️</span>
              </span>
            </h1>
            <p className="subtitle is-4 has-text-white-ter mb-2">
              Speak with the AI Dungeon Master
            </p>
            <p className="is-size-6 has-text-grey-light">
              Powered by Gemini 2.0 • Your adventure awaits
            </p>
          </div>

          {/* Main Card */}
          <div className="columns is-centered">
            <div className="column is-8-desktop is-10-tablet">
              <div className="box fantasy-card p-5">
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label className="label has-text-warning">
                      <span className="icon-text">
                        <span className="icon">🎲</span>
                        <span>Your Prompt</span>
                      </span>
                    </label>
                    <div className="control">
                      <textarea
                        className="textarea is-medium"
                        placeholder="Describe your action or ask the DM a question...&#10;&#10;Example: 'I approach the ancient door and examine it for traps.'"
                        rows={6}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <div className="control">
                      <button
                        type="submit"
                        className={`button is-large is-fullwidth fantasy-button has-text-white ${isLoading ? 'is-loading' : ''}`}
                        disabled={isLoading || !prompt.trim()}
                      >
                        <span className="icon">
                          <span>✨</span>
                        </span>
                        <span>{isLoading ? 'The DM is thinking...' : 'Send to Dungeon Master'}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Error Message */}
                {error && (
                  <article className="message is-danger mt-5">
                    <div className="message-header">
                      <p>
                        <span className="icon">⚠️</span> Error
                      </p>
                    </div>
                    <div className="message-body">
                      {error}
                    </div>
                  </article>
                )}

                {/* Response */}
                {response && (
                  <div className="box mt-5" style={{ backgroundColor: 'rgba(42, 25, 60, 0.7)', border: '2px solid #d4af37' }}>
                    <p className="title is-4 has-text-warning">
                      <span className="icon-text">
                        <span className="icon">📜</span>
                        <span>The Dungeon Master speaks:</span>
                      </span>
                    </p>
                    <div className="content has-text-white-ter is-size-5" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                      {response}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Tip */}
              <div className="notification is-info is-light mt-4" style={{ backgroundColor: 'rgba(42, 25, 60, 0.5)', border: '1px solid #d4af37' }}>
                <span className="icon-text has-text-warning">
                  <span className="icon">💡</span>
                  <span className="has-text-white-ter">
                    <strong>Tip:</strong> Be descriptive! The more detail you provide, the richer the DM's response will be.
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDMTestPage;
