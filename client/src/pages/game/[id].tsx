import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import io, { Socket } from 'socket.io-client';
import { isAuthenticated } from '../../utils/auth';
import Notification from '../../components/Notification';
import { API_URL, SOCKET_URL } from '../../config/api';

interface Message {
  id: number;
  character_name: string | null;
  message_type: 'chat' | 'action' | 'dm' | 'system' | 'roll';
  content: string;
  created_at: string;
}

interface Participant {
  id: number;
  character_id: number;
  character_name: string;
  class: string;
  race: string;
  level: number;
}

interface Room {
  id: number;
  name: string;
  code: string;
  participants: Participant[];
}

const GameBoard = () => {
  const router = useRouter();
  const { id: roomId } = router.query;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [messageType, setMessageType] = useState<'chat' | 'action'>('chat');
  const [loading, setLoading] = useState(true);
  const [dmThinking, setDmThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'danger' } | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [myCharacter, setMyCharacter] = useState<Participant | null>(null);
  const [dmResponse, setDmResponse] = useState<string>('"Greetings, adventurers! Describe your actions, and I shall weave your tale of glory and peril..."');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setIsChecking(false);

    if (roomId) {
      fetchRoom();
      connectSocket();
      fetchMessages();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/campaigns/${roomId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectSocket = () => {
    const newSocket = io(SOCKET_URL);
    
    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('new-message', (message: Message) => {
      // If it's a DM message, update the DM panel instead of chat
      if (message.message_type === 'dm') {
        setDmResponse(message.content);
        setDmThinking(false);
        return;
      }
      
      setMessages(prev => {
        // Prevent duplicates by checking if message ID already exists
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    newSocket.on('player-joined', (data: any) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        character_name: null,
        message_type: 'system',
        content: `${data.characterName} has joined the adventure!`,
        created_at: new Date().toISOString()
      }]);
    });

    newSocket.on('player-left', (data: any) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        character_name: null,
        message_type: 'system',
        content: `${data.characterName} has left the adventure.`,
        created_at: new Date().toISOString()
      }]);
    });

    setSocket(newSocket);
  };

  const fetchRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomId}`);
      if (!response.ok) {
        throw new Error('Room not found');
      }
      const data = await response.json();
      
      // Check if game has been started
      if (!data.is_started) {
        setNotification({ message: 'Game has not been started yet', type: 'warning' });
        setTimeout(() => router.push(`/rooms/${roomId}`), 2000);
        return;
      }
      
      setRoom(data);
      
      // Find the current user's character in the room
      const myCharsResponse = await fetch(`${API_URL}/api/characters`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (myCharsResponse.ok) {
        const myChars = await myCharsResponse.json();
        const myParticipant = data.participants?.find((p: Participant) => 
          myChars.some((c: any) => c.id === p.character_id)
        );
        
        if (!myParticipant) {
          setNotification({ message: 'You are not a participant in this game', type: 'danger' });
          setTimeout(() => router.push('/rooms'), 2000);
          return;
        }
        
        setMyCharacter(myParticipant);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      setNotification({ message: 'Room not found', type: 'danger' });
      setTimeout(() => router.push('/rooms'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !socket || !myCharacter) return;

    const messageContent = inputMessage;
    const message = {
      room_id: roomId,
      character_name: myCharacter.character_name,
      message_type: messageType,
      content: messageContent
    };

    socket.emit('send-message', message);
    setInputMessage('');

    // If it's an action, get AI DM response
    if (messageType === 'action') {
      setDmThinking(true);
      try {
        // Build comprehensive context from ALL messages (not just last 10)
        const contextHistory = messages
          .filter(m => m.message_type === 'action' || m.message_type === 'dm')
          .map(m => {
            if (m.message_type === 'dm') {
              return `DM: ${m.content}`;
            } else {
              return `${m.character_name}: ${m.content}`;
            }
          })
          .join('\n');

        const fullContext = contextHistory 
          ? `ADVENTURE HISTORY (maintain consistency with these events):\n${contextHistory}\n\n${myCharacter.character_name}'s new action:`
          : `${myCharacter.character_name}'s action:`;

        const response = await fetch(`${API_URL}/api/campaigns/dm-action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `${fullContext} ${messageContent}`,
            action: messageContent,
            context: contextHistory
          }),
        });

        if (response.ok) {
          const data = await response.json();
          socket.emit('send-message', {
            room_id: roomId,
            character_name: 'Dungeon Master',
            message_type: 'dm',
            content: data.response
          });
        }
      } catch (error) {
        console.error('Error getting DM response:', error);
      } finally {
        setDmThinking(false);
      }
    }
  };

  const handleRollDice = (dice: string) => {
    if (!socket || !myCharacter) return;
    
    const [count, sides] = dice.split('d').map(Number);
    let total = 0;
    const rolls: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }

    socket.emit('send-message', {
      room_id: roomId,
      character_name: myCharacter.character_name,
      message_type: 'roll',
      content: `🎲 Rolled ${dice}: [${rolls.join(', ')}] = ${total}`
    });
  };

  if (isChecking || !isAuthenticated()) {
    return null;
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container has-text-centered">
          <p className="title has-text-white">Loading game...</p>
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
      <section className="section" style={{ height: '100vh', padding: '10px' }}>
        <div style={{ height: '100%', maxWidth: '1800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Compact Header */}
        <div style={{ 
          backgroundColor: 'rgba(10, 10, 10, 0.8)', 
          border: '2px solid #d4af37', 
          borderRadius: '8px',
          padding: '8px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 className="title is-5 has-text-warning mb-0" style={{ fontFamily: 'Cinzel, serif' }}>
            🏰 {room?.name}
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {room?.participants.map(p => (
                <span key={p.id} className="tag is-small" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', color: 'white', border: '1px solid #d4af37' }}>
                  ⚔️ {p.character_name}
                </span>
              ))}
            </div>
            <button 
              className="button is-small is-outlined has-text-white"
              style={{ borderColor: '#d4af37' }}
              onClick={async () => {
                if (!confirm('Leave the game?')) return;
                if (!myCharacter) {
                  router.push('/rooms');
                  return;
                }
                try {
                  const response = await fetch(`${API_URL}/api/rooms/${roomId}/leave`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ character_id: myCharacter.character_id }),
                  });
                  if (response.ok) {
                    window.location.href = '/rooms';
                  } else {
                    alert('Failed to leave room');
                  }
                } catch (error) {
                  alert('Error leaving room');
                }
              }}
            >
              Leave
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: '10px', overflow: 'hidden' }}>
          {/* DM Panel - Left Side (Large) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
            <div style={{ 
              flex: 1,
              backgroundColor: 'rgba(10, 10, 10, 0.8)',
              border: '2px solid #d4af37',
              borderRadius: '8px',
              padding: '15px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 className="title is-5 has-text-warning mb-3">👹 Dungeon Master</h3>
              <p className="has-text-white-ter mb-4">
                Use <strong className="has-text-warning">⚔️ Action</strong> mode to interact with the AI Dungeon Master!
              </p>
              <div style={{ 
                backgroundColor: 'rgba(139, 0, 0, 0.3)', 
                border: '2px solid #8b0000', 
                borderRadius: '8px',
                padding: '20px',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {dmThinking ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <p className="has-text-danger is-italic" style={{ fontSize: '1.1rem' }}>
                      🎲 The Dungeon Master ponders your action...
                    </p>
                  </div>
                ) : (
                  <p className="has-text-white-ter is-italic" style={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                    {dmResponse}
                  </p>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div style={{ 
              backgroundColor: 'rgba(10, 10, 10, 0.8)',
              border: '2px solid #d4af37',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <button 
                className={`button is-small ${messageType === 'chat' ? 'fantasy-button has-text-white' : 'is-outlined has-text-white'}`}
                style={messageType !== 'chat' ? { borderColor: '#d4af37' } : {}}
                onClick={() => setMessageType('chat')}
              >
                💬
              </button>
              <button 
                className={`button is-small ${messageType === 'action' ? 'fantasy-button has-text-white' : 'is-outlined has-text-white'}`}
                style={messageType !== 'action' ? { borderColor: '#d4af37' } : {}}
                onClick={() => setMessageType('action')}
              >
                ⚔️
              </button>
              <input
                className="input"
                type="text"
                placeholder={messageType === 'action' ? "Describe your action..." : "Chat..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{ 
                  backgroundColor: 'rgba(10, 10, 10, 0.5)', 
                  color: 'white', 
                  border: '1px solid #d4af37',
                  flex: 1
                }}
              />
              <button 
                className="button fantasy-button has-text-white"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || dmThinking}
              >
                Send
              </button>
            </div>
          </div>

          {/* Right Sidebar - Chat & Dice */}
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Messages */}
            <div 
              style={{ 
                flex: 1,
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                border: '2px solid #d4af37',
                borderRadius: '8px',
                padding: '15px',
                overflowY: 'auto'
              }}
            >
              {messages.length === 0 ? (
                <div className="has-text-centered py-6">
                  <p className="title is-4 has-text-warning mb-3">🎲 Adventure Awaits!</p>
                  <p className="has-text-white-ter">The Dungeon Master will guide your journey. What do you do?</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    {msg.message_type === 'system' ? (
                      <div className="has-text-centered">
                        <p className="has-text-grey-light is-italic is-size-7">{msg.content}</p>
                        <hr style={{ backgroundColor: '#d4af37', opacity: 0.2, margin: '5px 0' }} />
                      </div>
                    ) : msg.message_type === 'dm' ? (
                      null
                    ) : msg.message_type === 'roll' ? (
                      <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d4af37' }}>
                        <p className="has-text-warning has-text-weight-bold is-size-7 mb-0">{msg.character_name || 'Player'}</p>
                        <p className="has-text-white-ter is-size-7 mb-0">{msg.content}</p>
                      </div>
                    ) : msg.message_type === 'action' ? (
                      <div style={{ backgroundColor: 'rgba(107, 45, 143, 0.2)', padding: '6px 8px', borderRadius: '6px', border: '1px solid #6b2d8f' }}>
                        <p className="has-text-info has-text-weight-bold is-size-7 mb-0">⚔️ {msg.character_name || 'Player'}</p>
                        <p className="has-text-white-ter is-size-7 mb-0">{msg.content}</p>
                      </div>
                    ) : (
                      <div style={{ padding: '4px 0' }}>
                        <p className="has-text-warning has-text-weight-bold is-size-7 mb-0">{msg.character_name || 'Player'}:</p>
                        <p className="has-text-white-ter is-size-7 mb-0">{msg.content}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Dice Roller */}
            <div style={{ 
              backgroundColor: 'rgba(10, 10, 10, 0.8)',
              border: '2px solid #d4af37',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <h3 className="title is-6 has-text-warning mb-3">🎲 Dice</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <button className="button is-small" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', color: 'white', border: '1px solid #d4af37' }} onClick={() => handleRollDice('1d4')}>
                  d4
                </button>
                <button className="button is-small" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', color: 'white', border: '1px solid #d4af37' }} onClick={() => handleRollDice('1d6')}>
                  d6
                </button>
                <button className="button is-small" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', color: 'white', border: '1px solid #d4af37' }} onClick={() => handleRollDice('1d8')}>
                  d8
                </button>
                <button className="button is-small" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', color: 'white', border: '1px solid #d4af37' }} onClick={() => handleRollDice('1d10')}>
                  d10
                </button>
                <button className="button is-small" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', color: 'white', border: '1px solid #d4af37' }} onClick={() => handleRollDice('1d12')}>
                  d12
                </button>
                <button className="button is-small fantasy-button has-text-white" onClick={() => handleRollDice('1d20')}>
                  <strong>d20</strong>
                </button>
              </div>
              <button className="button is-small is-fullwidth mt-2" style={{ backgroundColor: 'rgba(107, 45, 143, 0.5)', color: 'white', border: '1px solid #d4af37' }} onClick={() => handleRollDice('1d100')}>
                d100
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default GameBoard;
