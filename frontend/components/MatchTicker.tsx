import React, { useRef, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { MatchResult } from '../constants';

interface MatchTickerProps {
    results: MatchResult[];
}

const MatchTicker: React.FC<MatchTickerProps> = ({ results }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!results || results.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/10 py-3 z-50">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 overflow-hidden relative">
                <div className="bg-blue-600 px-2 py-1 text-xs font-black uppercase tracking-tighter text-white whitespace-nowrap rounded">
                    Live Results
                </div>

                {/* Mask fades */}
                <div className="absolute left-[100px] top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

                <div className="flex gap-12 animate-marquee whitespace-nowrap pl-4">
                    {[...results, ...results, ...results].map((result, index) => (
                        <div key={`${result.id}-${index}`} className="flex items-center gap-4 text-sm font-medium text-gray-400">
                            <span className="text-white font-bold">
                                {result.winner} <span className="text-xs text-gray-500">({result.winnerElo})</span>
                            </span>
                            <span className="text-xs uppercase tracking-wider text-green-500 font-bold">def.</span>
                            <span className="text-gray-300">
                                {result.loser} <span className="text-xs text-gray-500">({result.loserElo})</span>
                            </span>
                            <span className="text-green-400 text-xs font-mono">+{result.eloChange} ELO</span>
                            <span className="text-xs text-gray-600">| {result.score}</span>

                            <button className="p-1 hover:text-white transition-colors hover:bg-white/10 rounded-full">
                                <ThumbsUp size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
};

export default MatchTicker;
