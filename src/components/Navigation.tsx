/**
 * Navigation - Dynamic navigation bar that shows room info when in a room
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavigationProps {
  roomInfo?: {
    roomCode: string;
    playerName?: string;
    playerCount: number;
    connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
  };
  onLeaveRoom?: () => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'connected': return 'green';
    case 'reconnecting': return 'orange';
    default: return 'red';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting...';
    case 'reconnecting': return 'Reconnecting...';
    default: return 'Disconnected';
  }
}

export default function Navigation({ roomInfo, onLeaveRoom }: NavigationProps) {
  const pathname = usePathname();
  const isInRoom = pathname?.startsWith('/room/');

  return (
    <nav className="teal">
      <div className="nav-wrapper">
        <div className="container">
          <Link href="/" className="brand-logo">
            Scrum Poker
          </Link>

          {isInRoom && roomInfo && (
            <ul className="right nav-room-info">
              <li className="nav-info-item valign-wrapper">
                <i className="material-icons tiny">meeting_room</i>
                <strong>{roomInfo.roomCode}</strong>
              </li>

              {roomInfo.playerName && (
                <li className="nav-info-item valign-wrapper hide-on-small-only">
                  <i className="material-icons tiny">person</i>
                  <span>{roomInfo.playerName}</span>
                </li>
              )}

              <li className="nav-info-item valign-wrapper">
                <i className="material-icons tiny">group</i>
                <span>{roomInfo.playerCount}</span>
              </li>

              {roomInfo.connectionStatus && (
                <li className="nav-info-item valign-wrapper hide-on-small-only">
                  <span className={`status-dot ${getStatusColor(roomInfo.connectionStatus)}`} />
                  <span className="hide-on-med-only">{getStatusText(roomInfo.connectionStatus)}</span>
                </li>
              )}

              {onLeaveRoom && (
                <li className="nav-info-item">
                  <a
                    href="#!"
                    onClick={(e) => { e.preventDefault(); onLeaveRoom(); }}
                    className="waves-effect waves-light red-text text-lighten-3 valign-wrapper"
                    title="Leave Room"
                  >
                    <i className="material-icons tiny">exit_to_app</i>
                    <span className="hide-on-small-only">Leave</span>
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
