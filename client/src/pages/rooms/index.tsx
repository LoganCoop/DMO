import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { isAuthenticated, getAuthHeaders } from '../../utils/auth';
import Notification from '../../components/Notification';

const RoomLobby = () => {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'danger' } | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    checkForExistingRoom();
  }, []);

  const checkForExistingRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/characters', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const characters = await response.json();
        
        if (characters.length > 0) {
          // Check if any of the user's characters are in an active room
          for (const char of characters) {
            const roomCheck = await fetch(`http://localhost:3001/api/rooms/check/${char.id}`);
            if (roomCheck.ok) {
              const room = await roomCheck.json();
              
              if (room && room.id) {
                // Redirect to the room they're already in
                router.push(`/rooms/${room.id}`);
                return; // Don't setIsChecking(false) if redirecting
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking for existing room:', error);
    }
    // Only set isChecking to false if we're NOT redirecting
    setIsChecking(false);
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setNotification({ message: 'Please enter a room name', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // Get current user ID
      const token = localStorage.getItem('token');
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const userId = payload ? (payload.userId || payload.id) : null;
      
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: roomName, 
          max_players: maxPlayers,
          creator_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const room = await response.json();
      router.push(`/rooms/${room.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setNotification({ message: 'Failed to create room. Please try again.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setNotification({ message: 'Please enter a room code', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/code/${joinCode.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error('Room not found');
      }

      const room = await response.json();
      router.push(`/rooms/${room.id}`);
    } catch (error) {
      console.error('Error joining room:', error);
      setNotification({ message: 'Room not found. Please check the code and try again.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <section className="section">
        <div className="container has-text-centered">
          <div className="box fantasy-card">
            <p className="title is-4 has-text-warning">Checking for active room...</p>
          </div>
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
        <h1 className="title is-2 has-text-warning has-text-centered mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
          🏰 Game Rooms
        </h1>

        <div className="columns">
          {/* Create Room */}
          <div className="column is-6">
            <div className="box fantasy-card">
              <h2 className="title is-4 has-text-warning mb-4">
                <span className="icon">🎲</span>
                <span> Create a Room</span>
              </h2>
              
              <p className="has-text-white-ter mb-4">
                Start a new campaign and invite your friends to join!
              </p>

              <div className="field">
                <label className="label has-text-white">Room Name</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter room name (e.g., 'Epic Adventure')"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label has-text-white">Max Players</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    min="2"
                    max="10"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 6)}
                    style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)', color: 'white', border: '1px solid #d4af37' }}
                  />
                </div>
                <p className="help has-text-grey-light">Maximum number of players (2-10)</p>
              </div>

              <button
                className={`button is-large is-fullwidth fantasy-button has-text-white ${loading ? 'is-loading' : ''}`}
                onClick={handleCreateRoom}
                disabled={loading}
              >
                <span className="icon">⚔️</span>
                <span>Create Room</span>
              </button>
            </div>
          </div>

          {/* Join Room */}
          <div className="column is-6">
            <div className="box fantasy-card">
              <h2 className="title is-4 has-text-warning mb-4">
                <span className="icon">🚪</span>
                <span> Join a Room</span>
              </h2>
              
              <p className="has-text-white-ter mb-4">
                Enter a room code to join an existing campaign.
              </p>

              <div className="field">
                <label className="label has-text-white">Room Code</label>
                <div className="control">
                  <input
                    className="input is-large has-text-centered"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{ 
                      backgroundColor: 'rgba(10, 10, 10, 0.5)', 
                      color: 'white', 
                      border: '2px solid #d4af37',
                      fontSize: '2rem',
                      letterSpacing: '0.5rem',
                      fontWeight: 'bold'
                    }}
                  />
                </div>
                <p className="help has-text-grey-light">Ask the host for the 6-character room code</p>
              </div>

              <button
                className={`button is-large is-fullwidth fantasy-button has-text-white ${loading ? 'is-loading' : ''}`}
                onClick={handleJoinRoom}
                disabled={loading}
                style={{ marginTop: '60px' }}
              >
                <span className="icon">🎭</span>
                <span>Join Room</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="has-text-centered mt-5">
          <Link href="/" className="button is-outlined has-text-white" style={{ borderColor: '#d4af37' }}>
            <span className="icon">←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </section>
    </>
  );
};

export default RoomLobby;
