import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
    notifications: Notification[];
    removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 4000);
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ showNotification, notifications, removeNotification }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {notifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} onDismiss={() => removeNotification(n.id)} />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationItem: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
    const { message, type } = notification;

    const styles = {
        success: 'border-green-500/50 bg-green-500/10 text-green-400',
        error: 'border-red-500/50 bg-red-500/10 text-red-500',
        info: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    };

    const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Info;

    return (
        <div className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-full duration-300 ${styles[type]}`}>
            <Icon size={20} />
            <p className="text-sm font-bold tracking-tight">{message}</p>
            <button onClick={onDismiss} className="ml-2 hover:opacity-70 transition-opacity">
                <X size={16} />
            </button>
        </div>
    );
};
