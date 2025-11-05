import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuthHeaders, isAuthenticated } from '../../utils/auth';
import Notification from '../../components/Notification';

interface Character {
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
  hitPoints: number;
  armorClass: number;
}

const CharacterCreator = () => {
  const router = useRouter();
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'danger' } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, []);

  const [character, setCharacter] = useState<Character>({
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    hitPoints: 10,
    armorClass: 10,
  });

  const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'];
  const classes = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
  const backgrounds = ['Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier', 'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander', 'Sailor'];

  const calculateModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const handleStatChange = (stat: keyof Character, value: number) => {
    setCharacter({ ...character, [stat]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/characters', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(character),
      });

      if (!response.ok) {
        throw new Error('Failed to save character');
      }

      const savedCharacter = await response.json();
      console.log('Character saved:', savedCharacter);
      setNotification({ message: `${character.name} has been saved successfully!`, type: 'success' });
      
      // Optional: Redirect to characters list or clear form
      setTimeout(() => router.push('/characters'), 2000);
    } catch (error) {
      console.error('Error saving character:', error);
      setNotification({ message: 'Failed to save character. Please try again.', type: 'danger' });
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
        <h1 className="title is-2 has-text-warning has-text-centered mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
          ⚔️ Character Creator ⚔️
        </h1>

        <div className="columns">
          {/* Left Column - Basic Info */}
          <div className="column is-4">
            <div className="box fantasy-card">
              <h2 className="title is-4 has-text-warning">📜 Basic Information</h2>
              
              <div className="field">
                <label className="label has-text-white">Character Name</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter name"
                    value={character.name}
                    onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                    style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label has-text-white">Race</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={character.race}
                      onChange={(e) => setCharacter({ ...character, race: e.target.value })}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    >
                      <option value="">Select a race</option>
                      {races.map(race => (
                        <option key={race} value={race}>{race}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label has-text-white">Class</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={character.class}
                      onChange={(e) => setCharacter({ ...character, class: e.target.value })}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    >
                      <option value="">Select a class</option>
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label has-text-white">Background</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={character.background}
                      onChange={(e) => setCharacter({ ...character, background: e.target.value })}
                      style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                    >
                      <option value="">Select a background</option>
                      {backgrounds.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label has-text-white">Level</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="20"
                    value={character.level}
                    onChange={(e) => handleStatChange('level', parseInt(e.target.value) || 1)}
                    style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Ability Scores */}
          <div className="column is-4">
            <div className="box fantasy-card">
              <h2 className="title is-4 has-text-warning">💪 Ability Scores</h2>
              
              {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((stat) => (
                <div key={stat} className="field">
                  <label className="label has-text-white" style={{ textTransform: 'capitalize' }}>
                    {stat}
                  </label>
                  <div className="field has-addons">
                    <div className="control is-expanded">
                      <input
                        className="input"
                        type="number"
                        min="1"
                        max="20"
                        value={character[stat]}
                        onChange={(e) => handleStatChange(stat, parseInt(e.target.value) || 10)}
                        style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                      />
                    </div>
                    <div className="control">
                      <button className="button is-static has-text-white" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', border: '1px solid #d4af37' }}>
                        {calculateModifier(character[stat]) >= 0 ? '+' : ''}{calculateModifier(character[stat])}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Combat Stats */}
          <div className="column is-4">
            <div className="box fantasy-card mb-4">
              <h2 className="title is-4 has-text-warning">⚔️ Combat Stats</h2>
              
              <div className="field">
                <label className="label has-text-white">Hit Points</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={character.hitPoints}
                    onChange={(e) => handleStatChange('hitPoints', parseInt(e.target.value) || 10)}
                    style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label has-text-white">Armor Class</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={character.armorClass}
                    onChange={(e) => handleStatChange('armorClass', parseInt(e.target.value) || 10)}
                    style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                  />
                </div>
              </div>
            </div>

            {/* Character Preview */}
            <div className="box fantasy-card">
              <h2 className="title is-4 has-text-warning">👤 Preview</h2>
              <div className="content has-text-white-ter">
                <p><strong className="has-text-warning">Name:</strong> {character.name || 'Unnamed'}</p>
                <p><strong className="has-text-warning">Race:</strong> {character.race || 'Not selected'}</p>
                <p><strong className="has-text-warning">Class:</strong> {character.class || 'Not selected'}</p>
                <p><strong className="has-text-warning">Level:</strong> {character.level}</p>
                <p><strong className="has-text-warning">Background:</strong> {character.background || 'Not selected'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="has-text-centered mt-5">
          <button
            className="button is-large fantasy-button has-text-white"
            onClick={handleSave}
            disabled={!character.name || !character.race || !character.class}
          >
            <span className="icon">💾</span>
            <span>Save Character</span>
          </button>
        </div>
      </div>
    </section>
    </>
  );
};

export default CharacterCreator;
