'use client';
import { useNotification } from '@/contexts/NotificationContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function NotificationToast() {
  const { notifications, removeNotification } = useNotification();

  // Only show toast notifications (not in the badge panel)
  const toastNotifications = notifications.slice(-3); // Show max 3 toasts

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toastNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${getToastBackground(
            notification.type
          )}`}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {notification.type === 'success' && (
              <CheckCircle size={20} className="text-green-600" />
            )}
            {notification.type === 'error' && (
              <AlertCircle size={20} className="text-red-600" />
            )}
            {notification.type === 'warning' && (
              <AlertTriangle size={20} className="text-amber-600" />
            )}
            {notification.type === 'info' && (
              <Info size={20} className="text-blue-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="font-medium text-sm">{notification.title}</p>
            {notification.message && (
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            )}
            {notification.action && (
              <button
                onClick={() => {
                  notification.action?.onClick();
                  removeNotification(notification.id);
                }}
                className="mt-2 text-xs font-medium underline hover:opacity-80"
              >
                {notification.action.label}
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

function getToastBackground(type: string): string {
  switch (type) {
    case 'success':
      return 'bg-green-50 text-green-900 border border-green-200';
    case 'error':
      return 'bg-red-50 text-red-900 border border-red-200';
    case 'warning':
      return 'bg-amber-50 text-amber-900 border border-amber-200';
    case 'info':
    default:
      return 'bg-blue-50 text-blue-900 border border-blue-200';
  }
}
