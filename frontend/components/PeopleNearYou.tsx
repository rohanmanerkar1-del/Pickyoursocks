import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { api } from '../services/api';
import { NearbyUser } from '../constants';
import ErrorState from '../components/ErrorState';

const PeopleNearYou: React.FC = () => {
    const [users, setUsers] = useState<NearbyUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getNearbyUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch nearby users:", error);
            setError("Failed to find athletes nearby.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8">
                People <br /> Near <span className="text-blue-600">You</span>
            </h2>

            {error ? (
                <ErrorState onRetry={fetchUsers} message="Could not scan for nearby athletes." />
            ) : isLoading ? (
                <div className="flex flex-col gap-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
                                <div className="h-5 bg-zinc-800 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : users.length > 0 ? (
                <>
                    <div className="flex flex-col gap-0">
                        {users.map((user) => (
                            <div key={user.id} className="group flex items-center gap-4 py-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer first:border-t">
                                {/* Rank Number Box */}
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl text-white font-black text-2xl flex items-center justify-center transform -rotate-3 transition-transform group-hover:rotate-0">
                                    <span>{user.rank}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-grow">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">
                                        {user.sport}
                                    </h4>
                                    <h3 className="text-lg font-black italic uppercase tracking-tight text-white group-hover:text-blue-500 transition-colors leading-none mb-1">
                                        {user.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                        <MapPin size={10} />
                                        {user.distance} AWAY
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-4 bg-zinc-800 rounded-2xl text-gray-300 font-bold uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all">
                        View All Athletes
                    </button>
                </>
            ) : (
                <div className="py-8 text-center">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="text-gray-600" size={20} />
                    </div>
                    <p className="text-gray-400 font-medium mb-4">No athletes detected nearby yet.</p>
                    <button className="text-blue-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                        + Invite Friends
                    </button>
                </div>
            )}
        </div>
    );
};

export default PeopleNearYou;
