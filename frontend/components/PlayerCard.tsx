import React from 'react';
import { TrendingUp, Award, Zap } from 'lucide-react';

interface PlayerCardProps {
    elo: number;
    rankGap: number;
    trend: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ elo, rankGap, trend }) => {
    return (
        <div className="sticky top-20 z-40 mb-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                {/* Holographic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-gradient-x" />

                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                <div className="relative p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-green-400 mb-1">
                            <TrendingUp size={16} />
                            <span className="text-sm font-bold tracking-wider">{trend}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-widest ml-2">UNPROVEN</span>
                        </div>

                        <div className="flex items-baseline gap-3">
                            <h2 className="text-5xl font-black italic tracking-tighter text-white">
                                {elo}
                            </h2>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Current ELO</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                            <Award size={16} className="text-yellow-500" />
                            <span>{rankGap} points to <span className="text-white font-bold">Bronze Rank</span></span>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mb-2">
                            <Zap className="text-blue-500" size={32} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Status: Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;
