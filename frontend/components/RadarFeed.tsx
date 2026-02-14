import React, { useState } from 'react';
import { MapPin, Target, Users, Radio, Clock } from 'lucide-react';
import { MatchOpportunity } from '../constants';

import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import MatchResultModal from './MatchResultModal';
import { useNotification } from './NotificationContext';

interface RadarFeedProps {
    matches: MatchOpportunity[];
    user: any; // Using any for AuthUser for now to match context
}

const RadarFeed: React.FC<RadarFeedProps> = ({ matches, user }) => {
    const { showNotification } = useNotification();
    const [selectedMatch, setSelectedMatch] = useState<MatchOpportunity | null>(null);
    const [resultType, setResultType] = useState<'win' | 'loss' | null>(null);
    const [localClaimedIds, setLocalClaimedIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAccept = async (matchId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('match_requests')
                .update({
                    status: 'accepted',
                    accepted_by: user.id
                })
                .eq('id', matchId);

            if (error) throw error;
            showNotification('Match accepted!', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            console.error('Accept failed:', err);
            showNotification('Failed to accept match.', 'error');
        }
    };

    const initiateReport = (match: MatchOpportunity, type: 'win' | 'loss') => {
        setSelectedMatch(match);
        setResultType(type);
    };

    const handleSubmitResult = async (score: string) => {
        if (!selectedMatch || !resultType || !user) return;

        setIsSubmitting(true);
        try {
            // 1. Identify Roles
            const isPlayer1 = user.id === selectedMatch.user_id; // Creator
            const isPlayer2 = user.id === selectedMatch.accepted_by; // Acceptor

            if (!isPlayer1 && !isPlayer2) {
                showNotification("You are not part of this match!", "error");
                return;
            }

            // 2. Determine Claimed Winner
            let claimedWinnerId;
            if (resultType === 'win') {
                claimedWinnerId = user.id;
            } else {
                // If I lost, the other person won
                claimedWinnerId = isPlayer1 ? selectedMatch.accepted_by : selectedMatch.user_id;
            }

            const claimPayload = {
                winner_id: claimedWinnerId,
                score: score
            };

            // 3. Check for existing result row
            const { data: existingResult, error: fetchError } = await supabase
                .from('match_results')
                .select('id')
                .eq('match_id', selectedMatch.id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            let error;

            if (existingResult) {
                // UPDATE existing row
                const updateData = isPlayer1
                    ? { player1_claim: claimPayload }
                    : { player2_claim: claimPayload };

                const { error: updateError } = await supabase
                    .from('match_results')
                    .update(updateData)
                    .eq('match_id', selectedMatch.id);
                error = updateError;
            } else {
                // INSERT new row
                const insertData = {
                    match_id: selectedMatch.id,
                    sport: selectedMatch.sport,
                    player1_id: selectedMatch.user_id,
                    player2_id: selectedMatch.accepted_by,
                    [isPlayer1 ? 'player1_claim' : 'player2_claim']: claimPayload
                };
                const { error: insertError } = await supabase
                    .from('match_results')
                    .insert(insertData);
                error = insertError;
            }

            if (error) throw error;

            // Optimistic update
            setLocalClaimedIds(prev => [...prev, selectedMatch.id]);
            setSelectedMatch(null); // Close modal immediately

            showNotification("Result submitted! Waiting for opponent to verify.", "success");
            setTimeout(() => window.location.reload(), 2000);

        } catch (err: any) {
            console.error('Result submit failed:', err);
            showNotification('Failed to save result: ' + err.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <MatchResultModal
                isOpen={!!selectedMatch}
                onClose={() => { setSelectedMatch(null); setResultType(null); }}
                onSubmit={handleSubmitResult}
                resultType={resultType}
                opponentName={selectedMatch?.title.split(' - ')[0] || 'Opponent'}
            />

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <Target className="text-blue-500" />
                    The Radar
                </h3>
                <span className="text-xs font-bold uppercase tracking-widest text-green-500 animate-pulse">
                    Live Scanning...
                </span>
            </div>

            {matches.length > 0 ? (
                <div className="space-y-4">
                    {matches.map((match) => {
                        const isSkillMatch = user?.elo >= match.requiredEloRange[0] && user?.elo <= match.requiredEloRange[1];
                        const isOwnMatch = user && match.user_id === user.id;
                        const isParticipant = user && (match.user_id === user.id || match.accepted_by === user.id);
                        const isAccepted = match.status === 'accepted';

                        return (
                            <div
                                key={match.id}
                                className={`group relative bg-zinc-900/50 hover:bg-zinc-900 border ${isAccepted ? 'border-blue-500/30' : 'border-white/5'} hover:border-green-500/50 rounded-2xl p-6 transition-all duration-300`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">

                                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                <MapPin size={12} /> {match.distance}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                <Clock size={12} /> {match.time}
                                            </span>
                                        </div>

                                        <h4 className="text-xl font-bold text-white">{match.title}</h4>

                                        <p className={`text-sm font-medium ${isSkillMatch ? 'text-green-400' : 'text-gray-400'}`}>
                                            Looking for ELO {match.requiredEloRange[0]}-{match.requiredEloRange[1]}
                                            {isSkillMatch && !isAccepted && <span className="ml-2 py-0.5 px-2 bg-green-500/10 rounded text-xs">PERFECT MATCH</span>}
                                            {isAccepted && <span className="ml-2 py-0.5 px-2 bg-blue-500/10 text-blue-400 rounded text-xs">ACCEPTED</span>}
                                        </p>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                        {!isAccepted ? (
                                            <button
                                                onClick={() => handleAccept(match.id)}
                                                disabled={isOwnMatch}
                                                className={`px-8 py-3 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg ${isOwnMatch
                                                    ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                                                    : 'bg-white text-black hover:bg-blue-500 hover:text-white hover:scale-105 shadow-white/10 hover:shadow-blue-500/20'
                                                    }`}
                                            >
                                                {isOwnMatch ? 'WAITING...' : 'ACCEPT'}
                                            </button>
                                        ) : (
                                            isParticipant ? (
                                                <div className="flex flex-col gap-2">
                                                    {match.userClaimed || localClaimedIds.includes(match.id) ? (
                                                        <button disabled className="w-full py-3 bg-zinc-800 text-yellow-500 font-bold uppercase tracking-wider rounded-xl cursor-not-allowed border border-yellow-500/20 text-[10px] flex items-center justify-center gap-2">
                                                            <Clock size={14} className="animate-pulse" />
                                                            AWAITING VERIFICATION
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="flex-1 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg hover:bg-green-500 hover:text-white transition-all font-bold uppercase text-xs"
                                                                    onClick={() => initiateReport(match, 'win')}
                                                                >
                                                                    WIN
                                                                </button>
                                                                <button
                                                                    className="flex-1 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold uppercase text-xs"
                                                                    onClick={() => initiateReport(match, 'loss')}
                                                                >
                                                                    LOSS
                                                                </button>
                                                            </div>
                                                            <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">Report Result</p>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <button disabled className="px-8 py-3 bg-zinc-800 text-blue-400 font-bold uppercase tracking-wider rounded-xl cursor-default border border-blue-500/20">
                                                    ACCEPTED
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-zinc-900/30 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Radio className="text-gray-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-300 mb-2">Sector Clear</h4>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        No active signals in your range. Be the one to initiate contact.
                    </p>
                    <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-xl border border-white/5 transition-all">
                        Cast a Signal
                    </button>
                </div>
            )}
        </div>
    );
};

export default RadarFeed;
