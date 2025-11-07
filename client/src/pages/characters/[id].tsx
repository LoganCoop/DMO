import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Notification from '../../components/Notification';
import { API_URL } from '../../config/api';

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
  experience_points: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

const CharacterDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedCharacter, setEditedCharacter] = useState<Character | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'danger' } | null>(null);

  const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'];
  const classes = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
  const backgrounds = ['Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier', 'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander', 'Sailor'];

  useEffect(() => {
    if (id) {
      fetchCharacter();
    }
  }, [id]);

  const fetchCharacter = async () => {
    try {
      const response = await fetch(`${API_URL}/api/characters/${id}`);
      if (!response.ok) {
        throw new Error('Character not found');
      }
      const data = await response.json();
      setCharacter(data);
      setEditedCharacter(data);
    } catch (err) {
      setNotification({ message: 'Failed to load character', type: 'danger' });
      setTimeout(() => router.push('/characters'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedCharacter) return;

    try {
      const response = await fetch(`${API_URL}/api/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedCharacter),
      });

      if (!response.ok) {
        throw new Error('Failed to update character');
      }

      const updated = await response.json();
      setCharacter(updated);
      setEditing(false);
      setNotification({ message: 'Character updated successfully!', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to update character', type: 'danger' });
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!character || !confirm(`Are you sure you want to delete ${character.name}? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/characters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      setNotification({ message: `${character.name} has been deleted`, type: 'success' });
      setTimeout(() => router.push('/characters'), 2000);
    } catch (err) {
      setNotification({ message: 'Failed to delete character', type: 'danger' });
      console.error(err);
    }
  };

  const calculateModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleStatChange = (field: keyof Character, value: any) => {
    if (!editedCharacter) return;
    setEditedCharacter({ ...editedCharacter, [field]: value });
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container has-text-centered">
          <p className="title has-text-white">Loading character...</p>
        </div>
      </section>
    );
  }

  if (!character || !editedCharacter) {
    return null;
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
        {/* Header */}
        <div className="level mb-6">
          <div className="level-left">
            <div className="level-item">
              <Link href="/characters" className="button is-outlined has-text-white" style={{ borderColor: '#d4af37' }}>
                <span className="icon">←</span>
                <span>Back to Characters</span>
              </Link>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              {!editing ? (
                <>
                  <button className="button fantasy-button has-text-white mr-2" onClick={() => setEditing(true)}>
                    <span className="icon">✏️</span>
                    <span>Edit</span>
                  </button>
                  <button className="button is-danger is-outlined" onClick={handleDelete}>
                    <span className="icon">🗑️</span>
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="button is-success mr-2" onClick={handleSave}>
                    <span className="icon">💾</span>
                    <span>Save Changes</span>
                  </button>
                  <button 
                    className="button is-outlined has-text-white" 
                    style={{ borderColor: '#d4af37' }}
                    onClick={() => {
                      setEditedCharacter(character);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Character Info */}
        <div className="columns">
          {/* Left Column - Basic Info */}
          <div className="column is-4">
            <div className="box fantasy-card">
              <h2 className="title is-4 has-text-warning mb-4">📜 Basic Information</h2>
              
              {editing ? (
                <>
                  <div className="field">
                    <label className="label has-text-white">Character Name</label>
                    <input
                      className="input"
                      type="text"
                      value={editedCharacter.name}
                      onChange={(e) => handleStatChange('name', e.target.value)}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                  </div>

                  <div className="field">
                    <label className="label has-text-white">Race</label>
                    <div className="select is-fullwidth">
                      <select
                        value={editedCharacter.race}
                        onChange={(e) => handleStatChange('race', e.target.value)}
                        style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                      >
                        {races.map(race => (
                          <option key={race} value={race}>{race}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label has-text-white">Class</label>
                    <div className="select is-fullwidth">
                      <select
                        value={editedCharacter.class}
                        onChange={(e) => handleStatChange('class', e.target.value)}
                        style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                      >
                        {classes.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label has-text-white">Background</label>
                    <div className="select is-fullwidth">
                      <select
                        value={editedCharacter.background || ''}
                        onChange={(e) => handleStatChange('background', e.target.value)}
                        style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                      >
                        <option value="">None</option>
                        {backgrounds.map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label has-text-white">Level</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      max="20"
                      value={editedCharacter.level}
                      onChange={(e) => handleStatChange('level', parseInt(e.target.value) || 1)}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                  </div>

                  <div className="field">
                    <label className="label has-text-white">Experience Points</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={editedCharacter.experience_points || 0}
                      onChange={(e) => handleStatChange('experience_points', parseInt(e.target.value) || 0)}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                  </div>
                </>
              ) : (
                <div className="content has-text-white-ter">
                  <p><strong className="has-text-warning">Name:</strong> {character.name}</p>
                  <p><strong className="has-text-warning">Race:</strong> {character.race}</p>
                  <p><strong className="has-text-warning">Class:</strong> {character.class}</p>
                  <p><strong className="has-text-warning">Level:</strong> {character.level}</p>
                  {character.background && <p><strong className="has-text-warning">Background:</strong> {character.background}</p>}
                  <p><strong className="has-text-warning">XP:</strong> {character.experience_points || 0}</p>
                </div>
              )}
            </div>

            {/* Combat Stats */}
            <div className="box fantasy-card mt-4">
              <h2 className="title is-4 has-text-warning mb-4">⚔️ Combat Stats</h2>
              
              {editing ? (
                <>
                  <div className="field">
                    <label className="label has-text-white">Current HP</label>
                    <input
                      className="input"
                      type="number"
                      value={editedCharacter.hit_points}
                      onChange={(e) => handleStatChange('hit_points', parseInt(e.target.value) || 0)}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                  </div>

                  <div className="field">
                    <label className="label has-text-white">Max HP</label>
                    <input
                      className="input"
                      type="number"
                      value={editedCharacter.max_hit_points}
                      onChange={(e) => handleStatChange('max_hit_points', parseInt(e.target.value) || 0)}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                  </div>

                  <div className="field">
                    <label className="label has-text-white">Armor Class</label>
                    <input
                      className="input"
                      type="number"
                      value={editedCharacter.armor_class}
                      onChange={(e) => handleStatChange('armor_class', parseInt(e.target.value) || 0)}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                  </div>
                </>
              ) : (
                <div className="content has-text-white-ter">
                  <p><strong className="has-text-danger">HP:</strong> {character.hit_points} / {character.max_hit_points}</p>
                  <p><strong className="has-text-info">AC:</strong> {character.armor_class}</p>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Ability Scores */}
          <div className="column is-4">
            <div className="box fantasy-card">
              <h2 className="title is-4 has-text-warning mb-4">💪 Ability Scores</h2>
              
              {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((stat) => (
                <div key={stat} className="field">
                  <label className="label has-text-white" style={{ textTransform: 'capitalize' }}>
                    {stat}
                  </label>
                  {editing ? (
                    <div className="field has-addons">
                      <div className="control is-expanded">
                        <input
                          className="input"
                          type="number"
                          min="1"
                          max="30"
                          value={editedCharacter[stat]}
                          onChange={(e) => handleStatChange(stat, parseInt(e.target.value) || 10)}
                          style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                        />
                      </div>
                      <div className="control">
                        <button className="button is-static has-text-white" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', border: '1px solid #d4af37' }}>
                          {calculateModifier(editedCharacter[stat])}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="field has-addons">
                      <div className="control is-expanded">
                        <button className="button is-static is-fullwidth has-text-white" style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', border: '1px solid #d4af37' }}>
                          {character[stat]}
                        </button>
                      </div>
                      <div className="control">
                        <button className="button is-static has-text-white" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', border: '1px solid #d4af37' }}>
                          {calculateModifier(character[stat])}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Notes */}
          <div className="column is-4">
            <div className="box fantasy-card" style={{ height: '100%' }}>
              <h2 className="title is-4 has-text-warning mb-4">📝 Notes</h2>
              
              {editing ? (
                <div className="field">
                  <div className="control">
                    <textarea
                      className="textarea"
                      placeholder="Character notes, backstory, equipment, etc..."
                      rows={15}
                      value={editedCharacter.notes || ''}
                      onChange={(e) => handleStatChange('notes', e.target.value)}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="content has-text-white-ter" style={{ whiteSpace: 'pre-wrap' }}>
                  {character.notes || <em className="has-text-grey">No notes yet</em>}
                </div>
              )}

              <hr style={{ backgroundColor: '#d4af37', opacity: 0.3 }} />
              
              <div className="content has-text-grey-light is-size-7">
                <p><strong>Created:</strong> {new Date(character.created_at).toLocaleString()}</p>
                <p><strong>Updated:</strong> {new Date(character.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default CharacterDetail;
