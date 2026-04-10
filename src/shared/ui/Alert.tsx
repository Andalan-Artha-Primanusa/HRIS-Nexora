import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import './Alert.css';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  showIcon?: boolean;
  dismissible?: boolean;
}

const alertIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  showIcon = true,
  dismissible = false,
}) => {
  const Icon = alertIcons[type];

  return (
    <div className={`ui-alert ui-alert-${type}`}>
      {showIcon && <Icon size={20} className="ui-alert-icon" />}
      <span className="ui-alert-message">{message}</span>
      {dismissible && onClose && (
        <button className="ui-alert-close" onClick={onClose}>
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
