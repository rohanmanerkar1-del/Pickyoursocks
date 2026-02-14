
import React from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-black flex justify-center">
            {/* Mobile-centric container */}
            <div className="w-full max-w-[500px] bg-black border-x border-white/5 min-h-screen relative flex flex-col shadow-[0_0_100px_rgba(37,99,235,0.1)] overflow-x-hidden">
                {children}
            </div>
        </div>
    );
};

export default AppLayout;
