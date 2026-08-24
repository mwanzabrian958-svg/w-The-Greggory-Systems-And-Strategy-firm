import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Bell } from 'lucide-react';

/**
 * Alert Component
 * Reusable alert/notification component for displaying messages
 */
export function Alert({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  closable = true,
  autoClose = false,
  autoCloseDelay = 5000,
  className = '',
  icon: CustomIcon 
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const alertStyles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      iconBg: 'bg-green-100',
      title: 'text-green-900',
      message: 'text-green-700'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      title: 'text-red-900',
      message: 'text-red-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      title: 'text-yellow-900',
      message: 'text-yellow-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'text-blue-900',
      message: 'text-blue-700'
    }
  };

  const defaultIcons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const style = alertStyles[type] || alertStyles.info;
  const DefaultIcon = CustomIcon || defaultIcons[type] || Info;

  return (
    <div className={`relative border rounded-xl p-4 ${style.container} ${className}`}>
      <div className="flex items-start">
        {/* Icon */}
        <div className={`flex-shrink-0 ${style.iconBg} rounded-lg p-2`}>
          <DefaultIcon className={`w-5 h-5 ${style.icon}`} />
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`font-semibold ${style.title}`}>{title}</h3>
          )}
          {message && (
            <p className={`mt-1 text-sm ${style.message}`}>{message}</p>
          )}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            onClick={handleClose}
            className={`ml-3 flex-shrink-0 ${style.icon} hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Success Alert
 */
export function SuccessAlert(props) {
  return <Alert type="success" {...props} />;
}

/**
 * Error Alert
 */
export function ErrorAlert(props) {
  return <Alert type="error" {...props} />;
}

/**
 * Warning Alert
 */
export function WarningAlert(props) {
  return <Alert type="warning" {...props} />;
}

/**
 * Info Alert
 */
export function InfoAlert(props) {
  return <Alert type="info" {...props} />;
}

/**
 * Notification Toast Component
 */
export function NotificationToast({ 
  notifications, 
  onRemove,
  position = 'top-right' 
}) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-3 max-w-sm w-full`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white border rounded-xl shadow-lg p-4 animate-in slide-in-from-top duration-300 ${
            notification.type === 'success' ? 'border-green-200' :
            notification.type === 'error' ? 'border-red-200' :
            notification.type === 'warning' ? 'border-yellow-200' :
            'border-blue-200'
          }`}
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 rounded-lg p-2 ${
              notification.type === 'success' ? 'bg-green-100' :
              notification.type === 'error' ? 'bg-red-100' :
              notification.type === 'warning' ? 'bg-yellow-100' :
              'bg-blue-100'
            }`}>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
              {notification.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            
            <div className="ml-3 flex-1">
              {notification.title && (
                <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
              )}
              {notification.message && (
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              )}
            </div>

            <button
              onClick={() => onRemove(notification.id)}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Notification Bell with Badge
 */
export function NotificationBell({ 
  count, 
  onClick, 
  notifications = [],
  position = 'bottom-right'
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && notifications.length > 0 && (
        <div className={`absolute ${position === 'bottom-right' ? 'right-0' : 'left-0'} mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50`}>
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-500">{notifications.length} new notifications</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 rounded-full p-2 ${
                    notification.type === 'success' ? 'bg-green-100' :
                    notification.type === 'error' ? 'bg-red-100' :
                    notification.type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {notification.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                    {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                    {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                    <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Inline Alert Banner
 */
export function AlertBanner({ type = 'info', title, message, onClose }) {
  const bannerStyles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-500',
    info: 'bg-blue-600'
  };

  return (
    <div className={`${bannerStyles[type]} text-white px-4 py-3`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {type === 'success' && <CheckCircle className="w-5 h-5" />}
          {type === 'error' && <XCircle className="w-5 h-5" />}
          {type === 'warning' && <AlertTriangle className="w-5 h-5" />}
          {type === 'info' && <Info className="w-5 h-5" />}
          <div>
            {title && <p className="font-semibold">{title}</p>}
            {message && <p className="text-sm opacity-90">{message}</p>}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Loading Alert
 */
export function LoadingAlert({ message = 'Loading...' }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        <p className="text-blue-700 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Empty State Alert
 */
export function EmptyState({ 
  icon: Icon = Info, 
  title = 'No data found', 
  message = 'There is no data to display at this time.',
  action = null
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
      {action}
    </div>
  );
}

export default Alert;