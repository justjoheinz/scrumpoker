/**
 * Navigation - Dynamic navigation bar that shows room info when in a room
 */

'use client';

import { useState, useCallback } from 'react';
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
  const [copied, setCopied] = useState(false);

  const copyRoomLink = useCallback(async () => {
    if (!roomInfo?.roomCode) return;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const url = `${window.location.origin}${basePath}/room/${roomInfo.roomCode}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }, [roomInfo?.roomCode]);

  return (
    <header className="brand-header">
      <div className="container">
        <div className="brand-header-inner">
          <Link href="/" className="brand-logo-link">
            Scrum Poker
          </Link>

          {isInRoom && roomInfo && (
            <div className="nav-room-info">
              <div
                className="nav-info-item room-code-copy"
                onClick={copyRoomLink}
                title="Click to copy room link"
              >
                <i className="material-icons tiny">{copied ? 'check' : 'meeting_room'}</i>
                <strong>{copied ? 'Copied!' : roomInfo.roomCode}</strong>
              </div>

              {roomInfo.playerName && (
                <div className="nav-info-item hide-on-small-only">
                  <i className="material-icons tiny">person</i>
                  <span>{roomInfo.playerName}</span>
                </div>
              )}

              {roomInfo.connectionStatus && (
                <div className="nav-info-item hide-on-small-only">
                  <span className={`status-dot ${getStatusColor(roomInfo.connectionStatus)}`} />
                  <span className="hide-on-med-only">{getStatusText(roomInfo.connectionStatus)}</span>
                </div>
              )}

              {onLeaveRoom && (
                <div className="nav-info-item">
                  <a
                    href="#!"
                    onClick={(e) => { e.preventDefault(); onLeaveRoom(); }}
                    className="nav-leave"
                    title="Leave Room"
                  >
                    <i className="material-icons tiny">exit_to_app</i>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
