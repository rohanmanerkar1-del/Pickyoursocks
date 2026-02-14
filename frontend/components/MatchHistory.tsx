import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Frown, Users } from 'lucide-react';

interface MatchHistoryProps {
    userId: string;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ userId }) => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, [userId]);

    const fetchMatches = async () => {
        try {
            const { data, error } = await supabase
                .from('match_requests')
                .select(`
                    *,
                    challenger:profiles!match_requests_user_id_fkey (id, name, profile_photo, elo),
                    opponent:profiles!match_requests_opponent_id_fkey (id, name, profile_photo, elo),
                    acceptor:profiles!match_requests_accepted_by_fkey (id, name, profile_photo, elo),
                    result:match_results(
                        winner_id,
                        score,
                        is_verified
                    )
                `)
                .eq('status', 'completed')
                .or(`user_id.eq.${userId},accepted_by.eq.${userId},opponent_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMatches(data || []);
        } catch (error) {
            console.error('Error fetching match history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-gray-500 text-sm">Loading history...</div>;
    if (matches.length === 0) return <div className="text-gray-500 italic mb-8">No completed matches yet.</div>;

    return (
        <div className="grid gap-4 mb-12">
            {matches.map((match) => {
                const isCreator = userId === match.user_id;
                const partner = isCreator ? (match.acceptor || match.opponent) : match.challenger;

                // Handle result being potentially an array or object
                const resultData = Array.isArray(match.result) ? match.result[0] : match.result;
                const isVerified = resultData?.is_verified;
                const amIWinner = isVerified && resultData.winner_id === userId;

                return (
                    <div key={match.id} className={`bg-zinc-900 border-2 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 ${amIWinner ? 'border-green-500/20' : 'border-red-500/20'
                        }`}>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img
                                    src={partner?.profile_photo || '/avatar-placeholder.png'}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${amIWinner ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                                    }`}>
                                    {amIWinner ? <Trophy size={10} /> : <Frown size={10} />}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{match.sport} vs {partner?.name}</h4>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">{new Date(match.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className={`text-xl font-black italic ${amIWinner ? 'text-green-500' : 'text-red-500'}`}>
                                {amIWinner ? 'VICTORY' : 'DEFEAT'}
                            </span>
                            <span className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                                {resultData?.score || 'N/A'}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MatchHistory;
