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
    <div className={`alert-banner alert-${type}`}>
      <i className="material-icons">{getIcon()}</i>
      <span className="alert-banner-message">{message}</span>
      {onClose && (
        <button onClick={onClose} className="alert-banner-close">
          <i className="material-icons">close</i>
        </button>
      )}
    </div>
  );
}
