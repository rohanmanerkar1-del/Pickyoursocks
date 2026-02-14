
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack = false, rightAction }) => {
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-4">
            <div className="flex-1 flex items-center">
                {showBack && (
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-lg font-black italic uppercase tracking-tighter text-white truncate ml-1">
                    {title}
                </h1>
            </div>

            {rightAction && (
                <div className="flex items-center gap-2">
                    {rightAction}
                </div>
            )}
        </header>
    );
};

export default AppHeader;
