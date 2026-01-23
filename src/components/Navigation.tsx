/**
 * Navigation - Dynamic navigation bar that shows room info when in a room
 */

'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavigationProps {
  roomInfo?: {
    roomCode: string;
    playerName?: string;
    playerCount: number;
    connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
  };
}

export default function Navigation({ roomInfo }: NavigationProps) {
  const pathname = usePathname();
  const isInRoom = pathname?.startsWith('/room/');

  return (
    <nav className="teal">
      <div className="nav-wrapper container">
        <a href="/" className="brand-logo">
          Scrum Poker
        </a>

        {isInRoom && roomInfo && (
          <ul className="right">
            <li style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '20px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="material-icons" style={{ fontSize: '1.2rem' }}>meeting_room</i>
                <strong>{roomInfo.roomCode}</strong>
              </span>

              {roomInfo.playerName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="material-icons" style={{ fontSize: '1.2rem' }}>person</i>
                  {roomInfo.playerName}
                </span>
              )}

              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="material-icons" style={{ fontSize: '1.2rem' }}>group</i>
                {roomInfo.playerCount}
              </span>

              {roomInfo.connectionStatus && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.9rem'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor:
                      roomInfo.connectionStatus === 'connected' ? '#4caf50' :
                      roomInfo.connectionStatus === 'reconnecting' ? '#ff9800' :
                      '#f44336',
                    animation: roomInfo.connectionStatus === 'connecting' || roomInfo.connectionStatus === 'reconnecting' ? 'pulse 1.5s ease-in-out infinite' : 'none'
                  }} />
                  {roomInfo.connectionStatus === 'connected' ? 'Connected' :
                   roomInfo.connectionStatus === 'connecting' ? 'Connecting...' :
                   roomInfo.connectionStatus === 'reconnecting' ? 'Reconnecting...' :
                   'Disconnected'}
                </span>
              )}
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
