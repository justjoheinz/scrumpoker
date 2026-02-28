'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customAlphabet } from 'nanoid';
import Navigation from '@/components/Navigation';

const generateRoomCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = () => {
    setIsCreating(true);
    const code = generateRoomCode();
    router.push(`/room/${code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    const codePattern = /^[A-Za-z0-9]{3,10}$/;
    if (!codePattern.test(roomCode.trim())) {
      setError('Room code must be 3–10 alphanumeric characters');
      return;
    }

    router.push(`/room/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <>
      <Navigation />
      <main>
        <div className="container">
          <div className="row">
            <div className="col s12">

              <div className="card">
                <div className="card-content">
                  <span className="section-label">New Room</span>
                  <button
                    id="btn-create-room"
                    className="btn btn-accent"
                    style={{ width: '100%' }}
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'New'}
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <span className="section-label">Join Room</span>
                  <form onSubmit={handleJoinRoom}>
                    <div className="input-field">
                      <input
                        id="room-code"
                        type="text"
                        value={roomCode}
                        onChange={(e) => {
                          setRoomCode(e.target.value);
                          setError('');
                        }}
                        placeholder="ABC123"
                        maxLength={10}
                        autoComplete="off"
                      />
                      <label htmlFor="room-code" className="active">
                        Room Code
                      </label>
                      {error && (
                        <span className="helper-text red-text">{error}</span>
                      )}
                    </div>
                    <button
                      id="btn-join-room"
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                      Join
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
