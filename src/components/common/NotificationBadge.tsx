'use client';
import { useNotification } from '@/contexts/NotificationContext';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export function NotificationBadge() {
  const { notifications, unreadCount, removeNotification, clearNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Badge Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationBorderColor(
                    notification.type
                  )}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                      <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                      {notification.action && (
                        <button
                          onClick={() => {
                            notification.action?.onClick();
                            removeNotification(notification.id);
                          }}
                          className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          {notification.action.label}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      aria-label="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Close panel when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

function getNotificationBorderColor(type: string): string {
  switch (type) {
    case 'success':
      return 'border-green-500';
    case 'error':
      return 'border-red-500';
    case 'warning':
      return 'border-amber-500';
    case 'info':
    default:
      return 'border-blue-500';
  }
}
