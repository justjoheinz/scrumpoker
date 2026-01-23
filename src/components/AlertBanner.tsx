/**
 * AlertBanner - Display alerts and error messages
 */

'use client';

interface AlertBannerProps {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
}

export default function AlertBanner({ message, type, onClose }: AlertBannerProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      case 'success':
        return '#4caf50';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'check_circle';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '15px 20px',
        borderRadius: '4px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '300px',
        maxWidth: '600px',
      }}
    >
      <i className="material-icons">{getIcon()}</i>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          <i className="material-icons">close</i>
        </button>
      )}
    </div>
  );
}
