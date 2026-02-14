import React from 'react';
import { TrendingUp, Flame, Eye, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';

interface UserProfileSidebarProps {
    elo: number;
    trend: string;
    streak: number;
    scoutViewCount: number;
    gamesPlayed?: number; // New: For provisional logic
    reliability?: number; // New: Percentage (0-100)
}

const UserProfileSidebar: React.FC<UserProfileSidebarProps> = ({
    elo,
    trend,
    streak,
    scoutViewCount,
    gamesPlayed = 12, // Default to established for now
    reliability = 98
}) => {
    const isProvisional = gamesPlayed < 5;
    const isRiskOfDecay = true; // Mocked logic: User hasn't played in >10 days

    return (
        <div className="space-y-6 sticky top-24">
            {/* 1. Digital Trading Card */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl group transition-all duration-300 hover:border-blue-500/30">

                {/* Holographic BG */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-black to-purple-900/10 opacity-50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                <div className="relative p-6 text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full p-1 mb-4 shadow-lg shadow-blue-500/20">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                            <img src="https://i.pravatar.cc/300" alt="User" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Rank Display: Provisional or ELO */}
                    {isProvisional ? (
                        <div className="mb-2">
                            <h2 className="text-3xl font-black italic tracking-tighter text-gray-300">
                                PROVISIONAL
                            </h2>
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
                                {5 - gamesPlayed} games to calibrate
                            </p>
                        </div>
                    ) : (
                        <div className="relative inline-block">
                            <h2 className="text-5xl font-black italic tracking-tighter text-white mb-1">
                                {elo}
                            </h2>
                            {isRiskOfDecay && (
                                <div className="absolute -top-2 -right-6 group/decay">
                                    <AlertTriangle className="text-yellow-500 animate-pulse" size={16} />
                                    <div className="absolute left-full top-0 ml-2 w-32 bg-zinc-800 text-[10px] text-gray-300 p-2 rounded opacity-0 group-hover/decay:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10">
                                        Rank decay in 2 days. Play a match!
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isProvisional && (
                        <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
                            <TrendingUp size={16} />
                            <span className="text-sm font-bold tracking-wide">{trend}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <div className="flex items-center justify-center gap-1.5 text-orange-500 mb-1">
                                <Flame size={18} className="fill-orange-500/20" />
                            </div>
                            <div className="text-xl font-bold text-white">{streak}</div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500">Day Streak</div>
                        </div>
                        {/* Reliability Score */}
                        <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <div className="flex items-center justify-center gap-1.5 text-blue-500 mb-1">
                                <ShieldCheck size={18} className="fill-blue-500/20" />
                            </div>
                            <div className={`text-xl font-bold ${reliability > 90 ? 'text-white' : 'text-red-400'}`}>
                                {reliability}%
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500">Reliability</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Scout Notification (Monetization Nudge) */}
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 p-1 group cursor-pointer hover:border-yellow-500/50 transition-colors">
                <div className="p-4 flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/10">
                            <Eye size={24} className="text-gray-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-black">
                            {scoutViewCount}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">Scouts viewing you</h4>
                        <p className="text-xs text-gray-400 mt-0.5">2 verified scouts visited your profile.</p>
                    </div>
                    <div className="ml-auto">
                        <Lock size={16} className="text-yellow-500" />
                    </div>
                </div>

                {/* Blurred overlay hint */}
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 opacity-50 blur-[2px] select-none my-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                        <div className="h-2 w-20 bg-gray-600 rounded"></div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold uppercase text-xs tracking-wider rounded-lg hover:brightness-110 transition-all shadow-lg shadow-yellow-500/10">
                        Unlock Scout Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileSidebar;
