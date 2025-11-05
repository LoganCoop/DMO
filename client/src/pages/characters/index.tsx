import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAuthHeaders, isAuthenticated } from '../../utils/auth';
import Notification from '../../components/Notification';

interface Character {
  id: number;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hit_points: number;
  max_hit_points: number;
  armor_class: number;
  created_at: string;
}

const MyCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'danger' } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/characters', {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      const data = await response.json();
      setCharacters(data);
    } catch (err) {
      setError('Failed to load characters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/characters/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      setNotification({ message: `${name} has been deleted`, type: 'success' });
      fetchCharacters(); // Refresh the list
    } catch (err) {
      setNotification({ message: 'Failed to delete character', type: 'danger' });
      console.error(err);
    }
  };

  const calculateModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container has-text-centered">
          <p className="title has-text-white">Loading characters...</p>
        </div>
      </section>
    );
  }

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
        <div className="level mb-6">
          <div className="level-left">
            <div className="level-item">
              <h1 className="title is-2 has-text-warning" style={{ fontFamily: 'Cinzel, serif' }}>
                📜 My Characters
              </h1>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <Link href="/characters/create" className="button fantasy-button has-text-white">
                <span className="icon">⚔️</span>
                <span>Create New Character</span>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="notification is-danger">
            {error}
          </div>
        )}

        {characters.length === 0 ? (
          <div className="box fantasy-card has-text-centered">
            <p className="title is-4 has-text-white-ter mb-4">No characters yet!</p>
            <p className="has-text-white-ter mb-5">Create your first character to begin your adventure.</p>
            <Link href="/characters/create" className="button is-large fantasy-button has-text-white">
              <span className="icon">⚔️</span>
              <span>Create Character</span>
            </Link>
          </div>
        ) : (
          <div className="columns is-multiline">
            {characters.map((character) => (
              <div key={character.id} className="column is-4">
                <div className="box fantasy-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Character Header */}
                  <div className="has-text-centered mb-4">
                    <h2 className="title is-3 has-text-warning mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      {character.name}
                    </h2>
                    <p className="subtitle is-6 has-text-white-ter">
                      Level {character.level} {character.race} {character.class}
                    </p>
                    {character.background && (
                      <p className="has-text-grey-light is-size-7">{character.background}</p>
                    )}
                  </div>

                  {/* Combat Stats */}
                  <div className="columns is-mobile mb-3">
                    <div className="column has-text-centered">
                      <div style={{ backgroundColor: 'rgba(220, 53, 69, 0.2)', padding: '10px', borderRadius: '8px', border: '1px solid #dc3545' }}>
                        <p className="has-text-danger has-text-weight-bold is-size-7">HP</p>
                        <p className="has-text-white is-size-4">{character.hit_points}</p>
                      </div>
                    </div>
                    <div className="column has-text-centered">
                      <div style={{ backgroundColor: 'rgba(23, 162, 184, 0.2)', padding: '10px', borderRadius: '8px', border: '1px solid #17a2b8' }}>
                        <p className="has-text-info has-text-weight-bold is-size-7">AC</p>
                        <p className="has-text-white is-size-4">{character.armor_class}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ability Scores */}
                  <div className="content">
                    <p className="has-text-warning has-text-weight-bold mb-2">Ability Scores</p>
                    <div className="columns is-mobile is-multiline" style={{ fontSize: '0.85rem' }}>
                      <div className="column is-4 has-text-centered py-2">
                        <span className="has-text-grey-light">STR</span>
                        <span className="has-text-white ml-2">{character.strength} ({calculateModifier(character.strength)})</span>
                      </div>
                      <div className="column is-4 has-text-centered py-2">
                        <span className="has-text-grey-light">DEX</span>
                        <span className="has-text-white ml-2">{character.dexterity} ({calculateModifier(character.dexterity)})</span>
                      </div>
                      <div className="column is-4 has-text-centered py-2">
                        <span className="has-text-grey-light">CON</span>
                        <span className="has-text-white ml-2">{character.constitution} ({calculateModifier(character.constitution)})</span>
                      </div>
                      <div className="column is-4 has-text-centered py-2">
                        <span className="has-text-grey-light">INT</span>
                        <span className="has-text-white ml-2">{character.intelligence} ({calculateModifier(character.intelligence)})</span>
                      </div>
                      <div className="column is-4 has-text-centered py-2">
                        <span className="has-text-grey-light">WIS</span>
                        <span className="has-text-white ml-2">{character.wisdom} ({calculateModifier(character.wisdom)})</span>
                      </div>
                      <div className="column is-4 has-text-centered py-2">
                        <span className="has-text-grey-light">CHA</span>
                        <span className="has-text-white ml-2">{character.charisma} ({calculateModifier(character.charisma)})</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="buttons mt-auto">
                    <button 
                      className="button is-fullwidth is-outlined has-text-white"
                      style={{ borderColor: '#d4af37' }}
                      onClick={() => router.push(`/characters/${character.id}`)}
                    >
                      <span className="icon">👁️</span>
                      <span>View Details</span>
                    </button>
                    <button 
                      className="button is-danger is-outlined"
                      onClick={() => handleDelete(character.id, character.name)}
                    >
                      <span className="icon">🗑️</span>
                    </button>
                  </div>

                  {/* Created date */}
                  <p className="has-text-grey-light is-size-7 has-text-centered mt-2">
                    Created: {new Date(character.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
    </>
  );
};

export default MyCharacters;
