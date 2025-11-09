import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { isAuthenticated, getAuthHeaders } from '../../utils/auth';
import Notification from '../../components/Notification';
import { API_URL } from '../../config/api';

interface Character {
  id: number;
  name: string;
  class: string;
  race: string;
  level: number;
}

interface Participant {
  id: number;
  character_id: number;
  character_name: string;
  class: string;
  race: string;
  level: number;
  joined_at: string;
}

interface Room {
  id: number;
  code: string;
  name: string;
  max_players: number;
  is_active: boolean;
  is_started: boolean;
  creator_id: number | null;
  player_count: number;
  participants: Participant[];
}

const RoomPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState<Room | null>(null);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'danger' } | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setIsChecking(false);
    
    if (id && !isLeaving) {
      fetchRoom();
      fetchMyCharacters();
      // Poll for updates every 2 seconds
      const interval = setInterval(fetchRoom, 2000);
      return () => clearInterval(interval);
    }
  }, [id, isLeaving]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${id}`);
      if (!response.ok) {
        throw new Error('Room not found');
      }
      const data = await response.json();
      setRoom(data);
      
      // Check if current user is the creator
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId || payload.id;
        const amICreator = data.creator_id === userId;
        setIsCreator(amICreator);
      }
      
      // If game is started, redirect to game page
      if (data.is_started) {
        router.push(`/game/${id}`);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      setNotification({ message: 'Room not found', type: 'danger' });
      setTimeout(() => router.push('/rooms'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCharacters = async () => {
    try {
      const response = await fetch(`${API_URL}/api/characters`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setMyCharacters(data);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const handleJoinRoom = async () => {
    if (!selectedCharacter) {
      setNotification({ message: 'Please select a character', type: 'warning' });
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`${API_URL}/api/rooms/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ character_id: selectedCharacter }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join room');
      }

      fetchRoom();
      setNotification({ message: 'Joined room successfully!', type: 'success' });
    } catch (error: any) {
      setNotification({ message: error.message, type: 'danger' });
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveRoom = async (characterId: number) => {
    setIsLeaving(true); // Stop polling
    try {
      const response = await fetch(`${API_URL}/api/rooms/${id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ character_id: characterId }),
      });

      if (response.ok) {
        setNotification({ message: 'Left room successfully', type: 'success' });
        // Wait a bit to ensure the message is seen, then redirect
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/rooms');
      } else {
        const error = await response.json();
        setNotification({ message: error.error || 'Failed to leave room', type: 'danger' });
        setIsLeaving(false); // Resume polling if failed
      }
    } catch (error: any) {
      console.error('Error leaving room:', error);
      setNotification({ message: error.message || 'Failed to leave room', type: 'danger' });
      setIsLeaving(false); // Resume polling if failed
    }
  };

  const handleCloseRoom = async () => {
    if (!confirm('Are you sure you want to close this room? All players will be removed.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/rooms/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotification({ message: 'Room closed successfully', type: 'success' });
        setTimeout(() => router.push('/rooms'), 1500);
      }
    } catch (error) {
      console.error('Error closing room:', error);
      setNotification({ message: 'Failed to close room', type: 'danger' });
    }
  };

  const handleKickPlayer = async (characterId: number, characterName: string) => {
    if (!confirm(`Vote to kick ${characterName}? This requires majority vote.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/rooms/${id}/kick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          character_id: characterId,
          voter_character_id: myParticipant?.character_id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.kicked) {
          setNotification({ message: `${characterName} has been kicked from the room`, type: 'success' });
        } else {
          setNotification({ message: `Vote recorded: ${data.votes}/${data.needed} votes`, type: 'info' });
        }
        fetchRoom();
      }
    } catch (error) {
      console.error('Error kicking player:', error);
      setNotification({ message: 'Failed to process kick vote', type: 'danger' });
    }
  };

  const handleStartGame = async () => {
    if (!room || !isCreator) return;

    if (room.participants.length < 1) {
      setNotification({ message: 'Need at least 1 player to start', type: 'warning' });
      return;
    }

    setIsStarting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const userId = payload ? (payload.userId || payload.id) : null;

      const response = await fetch(`${API_URL}/api/rooms/${id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setNotification({ message: 'Starting game...', type: 'success' });
        setTimeout(() => router.push(`/game/${id}`), 1000);
      } else {
        const error = await response.json();
        setNotification({ message: error.error || 'Failed to start game', type: 'danger' });
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setNotification({ message: 'Failed to start game', type: 'danger' });
    } finally {
      setIsStarting(false);
    }
  };

  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      setNotification({ message: 'Room code copied to clipboard!', type: 'success' });
    }
  };

  if (isChecking || !isAuthenticated()) {
    return null;
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container has-text-centered">
          <p className="title has-text-white">Loading room...</p>
        </div>
      </section>
    );
  }

  if (!room) {
    return null;
  }

  const myParticipant = room.participants?.find(p => 
    myCharacters.some(c => c.id === p.character_id)
  );

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
        {/* Room Header */}
        <div className="box fantasy-card mb-5">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="title is-2 has-text-warning mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                    🏰 {room.name}
                  </h1>
                  <p className="subtitle is-6 has-text-white-ter">
                    {room.participants?.length || 0} / {room.max_players} Players
                  </p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <div className="has-text-centered">
                  <p className="has-text-grey-light is-size-7 mb-2">Room Code</p>
                  <button 
                    className="button is-large fantasy-button has-text-white"
                    onClick={copyRoomCode}
                    title="Click to copy"
                  >
                    <span style={{ fontSize: '2rem', letterSpacing: '0.3rem', fontWeight: 'bold' }}>
                      {room.code}
                    </span>
                  </button>
                  <p className="help has-text-grey-light mt-2">Click to copy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="columns">
          {/* Players List */}
          <div className="column is-8">
            <div className="box fantasy-card">
              <div className="level mb-4">
                <div className="level-left">
                  <div className="level-item">
                    <h2 className="title is-4 has-text-warning mb-0">👥 Players in Room</h2>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    {isCreator && (
                      <>
                        {myParticipant && room.participants && room.participants.length >= 1 && (
                          <button
                            className={`button is-success mr-2 ${isStarting ? 'is-loading' : ''}`}
                            onClick={handleStartGame}
                            disabled={isStarting}
                          >
                            <span className="icon">🎮</span>
                            <span>Start Game</span>
                          </button>
                        )}
                        <button
                          className="button is-danger"
                          onClick={handleCloseRoom}
                        >
                          <span className="icon">🗑️</span>
                          <span>Close Room</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {!room.participants || room.participants.length === 0 ? (
                <div className="has-text-centered py-6">
                  <p className="has-text-white-ter is-size-5 mb-3">No players yet</p>
                  <p className="has-text-grey-light">Waiting for adventurers to join...</p>
                </div>
              ) : (
                <div className="columns is-multiline">
                  {room.participants.map((participant) => (
                    <div key={participant.id} className="column is-6">
                      <div 
                        className="box" 
                        style={{ 
                          backgroundColor: 'rgba(107, 45, 143, 0.3)', 
                          border: '1px solid #d4af37',
                          position: 'relative'
                        }}
                      >
                        <div className="media">
                          <div className="media-left">
                            <span style={{ fontSize: '3rem' }}>⚔️</span>
                          </div>
                          <div className="media-content">
                            <p className="title is-5 has-text-warning">{participant.character_name}</p>
                            <p className="subtitle is-6 has-text-white-ter">
                              Level {participant.level} {participant.race} {participant.class}
                            </p>
                          </div>
                        </div>
                        {myCharacters.some(c => c.id === participant.character_id) ? (
                          <button 
                            className="button is-small is-danger is-outlined"
                            style={{ position: 'absolute', top: '10px', right: '10px' }}
                            onClick={() => handleLeaveRoom(participant.character_id)}
                          >
                            Leave
                          </button>
                        ) : myParticipant && (
                          <button 
                            className="button is-small is-warning is-outlined"
                            style={{ position: 'absolute', top: '10px', right: '10px' }}
                            onClick={() => handleKickPlayer(participant.character_id, participant.character_name)}
                          >
                            Vote Kick
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Join Panel */}
          <div className="column is-4">
            {!myParticipant ? (
              <div className="box fantasy-card">
                <h2 className="title is-4 has-text-warning mb-4">🎭 Join with Character</h2>
                
                {myCharacters.length === 0 ? (
                  <div>
                    <p className="has-text-white-ter mb-4">You need a character to join!</p>
                    <Link href="/characters/create" className="button is-fullwidth fantasy-button has-text-white">
                      Create Character
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="field">
                      <label className="label has-text-white">Select Character</label>
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select
                            value={selectedCharacter || ''}
                            onChange={(e) => setSelectedCharacter(parseInt(e.target.value))}
                            style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                          >
                            <option value="">Choose a character...</option>
                            {myCharacters.map(char => (
                              <option key={char.id} value={char.id}>
                                {char.name} (Lvl {char.level} {char.class})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      className={`button is-fullwidth is-large fantasy-button has-text-white ${joining ? 'is-loading' : ''}`}
                      onClick={handleJoinRoom}
                      disabled={!selectedCharacter || joining}
                    >
                      <span className="icon">🎲</span>
                      <span>Join Game</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="box fantasy-card">
                <h2 className="title is-4 has-text-success mb-4">✅ You're In!</h2>
                <p className="has-text-white-ter mb-4">
                  Playing as <strong className="has-text-warning">{myParticipant.character_name}</strong>
                </p>
                <p className="has-text-grey-light mb-4">
                  Waiting for the host to start the game...
                </p>
                
                {room.participants && room.participants.length >= 2 && (
                  <button
                    className="button is-fullwidth is-large is-success mb-3"
                    onClick={handleStartGame}
                  >
                    <span className="icon">🎮</span>
                    <span>Start Game</span>
                  </button>
                )}
                
                <button
                  className="button is-fullwidth is-outlined has-text-white"
                  style={{ borderColor: '#d4af37' }}
                  onClick={() => handleLeaveRoom(myParticipant.character_id)}
                >
                  Leave Room
                </button>
              </div>
            )}

            {/* Back Button */}
            <Link href="/rooms" className="button is-fullwidth is-outlined has-text-white mt-4" style={{ borderColor: '#d4af37' }}>
              <span className="icon">←</span>
              <span>Back to Lobby</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default RoomPage;
