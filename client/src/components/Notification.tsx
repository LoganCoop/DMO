import { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const colorClass = {
    info: 'is-info',
    success: 'is-success',
    warning: 'is-warning',
    danger: 'is-danger'
  }[type];

  return (
    <div 
      className="modal is-active"
      style={{ zIndex: 9999 }}
    >
      <div className="modal-background" onClick={onClose} style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}></div>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className={`notification ${colorClass} fantasy-card`} style={{ 
          border: '2px solid #d4af37',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <button className="delete" onClick={onClose}></button>
          <div className="has-text-centered">
            <p className="title is-4 has-text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              {type === 'success' && '✅ '}
              {type === 'warning' && '⚠️ '}
              {type === 'danger' && '❌ '}
              {type === 'info' && 'ℹ️ '}
            </p>
            <p className="has-text-white is-size-5">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
