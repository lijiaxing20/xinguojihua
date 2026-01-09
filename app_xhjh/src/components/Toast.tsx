import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {createPortal(
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                pointer-events-auto min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 animate-slide-down
                ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : ''}
                ${toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
                ${toast.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
                ${toast.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : ''}
              `}
            >
              <div className="flex-shrink-0">
                {toast.type === 'success' && <i className="fas fa-check-circle text-green-500"></i>}
                {toast.type === 'error' && <i className="fas fa-times-circle text-red-500"></i>}
                {toast.type === 'info' && <i className="fas fa-info-circle text-blue-500"></i>}
                {toast.type === 'warning' && <i className="fas fa-exclamation-triangle text-yellow-500"></i>}
              </div>
              <div className="flex-1 text-sm font-medium">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
