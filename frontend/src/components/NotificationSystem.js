import React, { createContext, useContext, useState, useEffect } from 'react';

// Notification context
const NotificationContext = createContext();

/**
 * Notification provider component
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Add a new notification
   */
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  /**
   * Remove a notification by ID
   */
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  /**
   * Clear all notifications
   */
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  /**
   * Success notification
   */
  const success = (message, duration) => {
    return addNotification(message, 'success', duration);
  };

  /**
   * Error notification
   */
  const error = (message, duration) => {
    return addNotification(message, 'error', duration);
  };

  /**
   * Warning notification
   */
  const warning = (message, duration) => {
    return addNotification(message, 'warning', duration);
  };

  /**
   * Info notification
   */
  const info = (message, duration) => {
    return addNotification(message, 'info', duration);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notifications
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Notification container component
 */
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

/**
 * Individual notification item
 */
const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div className={`notification notification-${notification.type} ${isVisible ? 'visible' : ''}`}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon()}</span>
        <span className="notification-message">{notification.message}</span>
        <button 
          className="notification-close"
          onClick={handleRemove}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      <div className="notification-progress">
        <div 
          className="notification-progress-bar"
          style={{
            animationDuration: `${notification.duration}ms`
          }}
        ></div>
      </div>
    </div>
  );
};

/**
 * Higher-order component to add notification methods to components
 */
export const withNotifications = (Component) => {
  return (props) => {
    const notificationMethods = useNotifications();
    return <Component {...props} {...notificationMethods} />;
  };
};

export default NotificationSystem; 