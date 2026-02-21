import React, { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import { MapPin, TrendingUp, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { NearbyUser, SPORTS } from '../constants';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../components/AuthContext';

// Mock rank data removed


const Rankings: React.FC = () => {
    const [users, setUsers] = useState<NearbyUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSport, setSelectedSport] = useState<string>('squash');
    const [viewMode, setViewMode] = useState<'local' | 'global'>('local');
    const { signup, user } = useAuth();


    // Default to Mumbai if user has no region set, as requested
    const [currentRegion, setCurrentRegion] = useState(user?.region || 'Mumbai');

    // Update region if user profile loads/changes (optional, but good for UX)
    useEffect(() => {
        if (user?.region) {
            setCurrentRegion(user.region);
        }
    }, [user]);

    const fetchRankings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getNearbyUsers(selectedSport === 'All' ? undefined : selectedSport, currentRegion);
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch rankings:", error);
            setError("Failed to load leaderboard.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, [selectedSport, currentRegion]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30 pb-24">
            <AppHeader title="Standings" />

            <main className="pt-20 px-4 w-full">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                            {currentRegion}
                        </h1>
                    </div>
                    <div className="text-3xl font-black italic uppercase tracking-tighter text-white/20">
                        / Leaderboard
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-white/5 p-8 md:p-12 mb-8 shadow-2xl">
                    <div className="relative grid grid-cols-1 gap-8">
                        {/* Next Milestone */}
                        <div className="space-y-4 text-center">
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Next Milestone</div>
                            <div className="flex flex-col items-center justify-center gap-1 overflow-visible">
                                <div className="relative inline-block group/counter cursor-default pr-6 overflow-visible">
                                    <div className="flex items-center gap-2 text-[#4ade80]">
                                        <TrendingUp size={24} />
                                        <span className="text-6xl font-black italic pb-1">
                                            +{user?.elo ? (Math.ceil(user.elo / 100) * 100) - user.elo : 100}
                                        </span>
                                    </div>
                                    <span className="absolute -top-1 -right-2 text-lg font-black italic text-[#4ade80] rotate-12 opacity-80 animate-pulse">pts</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">
                                to reach <span className="text-white font-bold">Next Tier</span> <ArrowRight size={12} className="inline ml-1" />
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Leaderboard Table */}
                <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* View Toggle */}
                        <div className="flex justify-center">
                            <div className="bg-zinc-900/50 p-1 rounded-xl flex items-center w-full max-w-[280px]">
                                <button
                                    onClick={() => setViewMode('local')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'local' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Local
                                </button>
                                <button
                                    onClick={() => setViewMode('global')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'global' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Global
                                </button>
                            </div>
                        </div>

                        {/* Sport Selector */}
                        <div className="flex justify-center">
                            <div className="relative w-full max-w-[200px]">
                                <select
                                    value={selectedSport}
                                    onChange={(e) => setSelectedSport(e.target.value)}
                                    className="w-full bg-zinc-900/30 border border-white/5 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-white px-4 py-3 appearance-none text-center outline-none focus:border-blue-500/50 transition-colors"
                                >
                                    {SPORTS.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 text-[10px]">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="p-6">
                            <ErrorState onRetry={fetchRankings} message="Failed to load leaderboard." />
                        </div>
                    ) : isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="flex items-center justify-between animate-pulse">
                                    <div className="flex items-center gap-4 w-1/2">
                                        <div className="w-8 h-8 bg-zinc-900 rounded-lg"></div>
                                        <div className="w-10 h-10 bg-zinc-900 rounded-full"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-zinc-900 rounded w-3/4"></div>
                                            <div className="h-3 bg-zinc-900 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="w-20 h-6 bg-zinc-900 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">Athlete</th>
                                        <th className="px-6 py-4">Tier</th>
                                        <th className="px-6 py-4 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((rankedUser, index) => (
                                        <tr
                                            key={rankedUser.id}
                                            className={`transition-colors group ${rankedUser.id === user?.id
                                                ? 'bg-blue-900/20 border-l-4 border-blue-500'
                                                : 'hover:bg-white/5 border-l-4 border-transparent'
                                                }`}
                                        >
                                            <td className={`px-6 py-6 font-black italic text-xl ${rankedUser.id === user?.id ? 'text-blue-500' : 'text-white'
                                                }`}>
                                                #{rankedUser.rank}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {rankedUser.id === user?.id ? (
                                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">ME</div>
                                                    ) : (
                                                        <img src={rankedUser.image} alt={rankedUser.name} className="w-10 h-10 rounded-full object-cover bg-zinc-800" />
                                                    )}
                                                    <div>
                                                        <div className={`font-bold ${rankedUser.id === user?.id ? 'text-white' : 'text-white group-hover:text-blue-500 transition-colors'
                                                            }`}>
                                                            {rankedUser.id === user?.id ? 'You' : rankedUser.name}
                                                        </div>
                                                        <div className={`text-xs font-bold uppercase tracking-wider ${rankedUser.id === user?.id ? 'text-blue-400' : 'text-gray-500'
                                                            }`}>
                                                            {rankedUser.sport}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-medium ${rankedUser.id === user?.id ? 'text-gray-300' : 'text-gray-400'
                                                }`}>
                                                {index === 0 ? 'Elite' : index < 3 ? 'Advanced' : 'Intermediate'}
                                            </td>
                                            <td className="px-6 py-6 text-right font-black italic text-white text-2xl tracking-tighter">
                                                {rankedUser.rating ?? 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <Trophy className="mx-auto h-16 w-16 text-zinc-800 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Season Requires Players</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mb-6">
                                The leaderboard is currently empty. Be the first to claim the top spot in {currentRegion}!
                            </p>
                        </div>
                    )}
                </div>

            </main >
        </div >
    );
};

export default Rankings;
