'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { customAlphabet } from 'nanoid';

const generateRoomCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
import Navigation from '@/components/Navigation';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Debug: Log detected color scheme
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const computedBgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-page').trim();

    console.log('[Theme Debug] prefersDark:', darkModeQuery.matches);
    console.log('[Theme Debug] theme:', darkModeQuery.matches ? 'DARK' : 'LIGHT');
    console.log('[Theme Debug] --color-bg-page:', computedBgColor);

    const handleChange = (e: MediaQueryListEvent) => {
      console.log('[Theme Debug] Theme changed to:', e.matches ? 'DARK' : 'LIGHT');
    };
    darkModeQuery.addEventListener('change', handleChange);

    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  const handleCreateRoom = () => {
    setIsCreating(true);
    const code = generateRoomCode();
    router.push(`/room/${code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate room code
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    // Validate format (alphanumeric, 3-10 chars)
    const codePattern = /^[A-Za-z0-9]{3,10}$/;
    if (!codePattern.test(roomCode.trim())) {
      setError('Room code must be 3-10 alphanumeric characters');
      return;
    }

    // Navigate to room
    router.push(`/room/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <>
      <Navigation />
      <main>
        <div className="container">
          <div className="row">
            <div className="col s12 m8 offset-m2 l6 offset-l3">
              <div className="card">
                <div className="card-content">
                  <span className="card-title">Welcome to Scrum Poker</span>
                  <p>Real-time estimation tool for agile teams</p>
                </div>
              </div>

          {/* Create Room Card */}
          <div className="card">
            <div className="card-content">
              <span className="card-title">Create New Room</span>
              <p>Start a new estimation session</p>
            </div>
            <div className="card-action">
              <button
                className="btn waves-effect waves-light teal"
                onClick={handleCreateRoom}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Room'}
                <i className="material-icons right">add</i>
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="card">
            <div className="card-content">
              <span className="card-title">Join Existing Room</span>
              <p>Enter a room code to join</p>
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
                    placeholder="e.g., ABC123"
                    maxLength={10}
                  />
                  <label htmlFor="room-code" className="active">
                    Room Code
                  </label>
                  {error && <span className="helper-text red-text">{error}</span>}
                </div>
              </form>
            </div>
            <div className="card-action">
              <button
                className="btn waves-effect waves-light teal"
                onClick={handleJoinRoom}
              >
                Join Room
                <i className="material-icons right">arrow_forward</i>
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
      </main>
    </>
  );
}
