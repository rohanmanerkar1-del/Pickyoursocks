import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
    title = "Connection Interrupted",
    message = "We couldn't retrieve the latest data. Please check your connection and try again.",
    onRetry
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900/30 border border-red-500/10 rounded-3xl animate-enter">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                <AlertTriangle className="text-red-500" size={32} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 max-w-sm mb-6 text-sm leading-relaxed">
                {message}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-gray-200 transition-colors"
                >
                    <RefreshCw size={14} />
                    Retry Connection
                </button>
            )}
        </div>
    );
};

export default ErrorState;
