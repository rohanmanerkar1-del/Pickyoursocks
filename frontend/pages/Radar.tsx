import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import StartMatchSidebar from '../components/StartMatchSidebar';
import { supabase } from '../lib/supabase';
import { Target, Users, Radio, Loader2, AlertCircle, Check, X, Trophy, Frown } from 'lucide-react';
import { useNotification } from '../components/NotificationContext';
import MatchResultModal from '../components/MatchResultModal';
import { SPORTS } from '../constants';

const Radar: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { showNotification } = useNotification();

    // Fallback sports if user has none
    const allSportIds = SPORTS.map(s => s.id);
    const displaySports = user?.sports && user.sports.length > 0 ? user.sports : allSportIds;

    const [selectedSport, setSelectedSport] = useState<string>('');
    const [players, setPlayers] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [acceptedMatches, setAcceptedMatches] = useState<any[]>([]); // NEW: Active matches
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [challenging, setChallenging] = useState<string | null>(null);
    const [isAccepting, setIsAccepting] = useState<string | null>(null);

    // Reporting state
    const [reportingMatch, setReportingMatch] = useState<any | null>(null);
    const [reportType, setReportType] = useState<'win' | 'loss' | null>(null);

    // 1. Handle Sport Selection Default
    useEffect(() => {
        if (!selectedSport && displaySports.length > 0) {
            setSelectedSport(displaySports[0]);
        }
    }, [user, selectedSport, displaySports]);

    // 2. Fetch Radar Data (RPC)
    const fetchRadar = async () => {
        if (!user || !selectedSport) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: rpcError } = await supabase.rpc(
                'get_radar_matches',
                {
                    _current_user_id: user.id,
                    _selected_sport: selectedSport
                }
            );

            if (rpcError) throw rpcError;
            setPlayers(data || []);
        } catch (err: any) {
            console.error('Radar Fetch Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. Fetch Incoming Challenges
    const fetchIncoming = async () => {
        if (!user) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('match_requests')
                .select(`
                    *,
                    challenger:profiles!match_requests_user_id_fkey (
                        id,
                        name,
                        profile_photo,
                        elo
                    )
                `)
                .eq('opponent_id', user.id)
                .eq('status', 'pending');

            if (fetchError) throw fetchError;
            setIncomingRequests(data || []);
        } catch (err) {
            console.error('Incoming fetch error:', err);
        }
    };

    // 4. Fetch Broadcasts
    const fetchBroadcasts = async () => {
        if (!user || !selectedSport) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('match_requests')
                .select(`
                    *,
                    challenger:profiles!match_requests_user_id_fkey (
                        id,
                        name,
                        profile_photo,
                        elo
                    )
                `)
                .eq('status', 'active')
                .eq('sport', selectedSport)
                .neq('user_id', user.id);

            if (fetchError) throw fetchError;
            setBroadcasts(data || []);
        } catch (err) {
            console.error('Broadcast fetch error:', err);
        }
    };

    // 4.5 Fetch Accepted Matches (Active)
    const fetchAcceptedMatches = async () => {
        if (!user) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('match_requests')
                .select(`
                    *,
                    challenger:profiles!match_requests_user_id_fkey (
                        id,
                        name,
                        profile_photo,
                        elo
                    ),
                    opponent:profiles!match_requests_opponent_id_fkey (
                        id,
                        name,
                        profile_photo,
                        elo
                    ),
                    acceptor:profiles!match_requests_accepted_by_fkey (
                        id,
                        name,
                        profile_photo,
                        elo
                    ),
                    result:match_results(
                        id,
                        winner_id,
                        is_verified,
                        player1_claim,
                        player2_claim,
                        score
                    )
                `)
                .eq('status', 'accepted')
                .or(`user_id.eq.${user.id},accepted_by.eq.${user.id},opponent_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setAcceptedMatches(data || []);
        } catch (err) {
            console.error('Accepted matches fetch error:', err);
        }
    };

    // 5. Trigger Fetch on Sport Change
    useEffect(() => {
        if (selectedSport && user) {
            fetchRadar();
            fetchIncoming();
            fetchBroadcasts();
            fetchAcceptedMatches();
        }
    }, [selectedSport, user?.id]);

    // 6. Realtime Listener
    useEffect(() => {
        if (!selectedSport || !user) return;

        const channel = supabase
            .channel('radar-refresh')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'match_requests' },
                () => {
                    fetchRadar();
                    fetchIncoming();
                    fetchBroadcasts();
                    fetchAcceptedMatches(); // This will re-fetch and get latest results
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'match_results' },
                () => {
                    fetchAcceptedMatches(); // Update results when claims come in
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedSport, user?.id]);

    // 7. Challenge Function
    const handleChallenge = async (opponentId: string) => {
        if (!user || !selectedSport) return;

        setChallenging(opponentId);

        try {
            const { error: insertError } = await supabase
                .from('match_requests')
                .insert({
                    user_id: user.id,
                    opponent_id: opponentId,
                    sport: selectedSport,
                    status: 'pending'
                });

            if (insertError) throw insertError;

            showNotification('Challenge sent! 📡', 'success');
            fetchRadar();
            fetchIncoming();
        } catch (err: any) {
            console.error('Challenge Error:', err);
            showNotification('Failed to send challenge: ' + err.message, 'error');
        } finally {
            setChallenging(null);
        }
    };

    // 8. Accept Challenge
    const handleAcceptChallenge = async (requestId: string) => {
        if (!user) return;

        setIsAccepting(requestId);

        try {
            const { error: updateError } = await supabase
                .from('match_requests')
                .update({
                    status: 'accepted',
                    accepted_by: user.id
                })
                .eq('id', requestId);

            if (updateError) throw updateError;

            showNotification('Challenge accepted! 🎾', 'success');
            fetchIncoming();
            fetchBroadcasts();
            fetchRadar();
        } catch (err: any) {
            console.error('Accept Error:', err);
            showNotification('Failed to accept: ' + err.message, 'error');
        } finally {
            setIsAccepting(null);
        }
    };

    // 9. Decline Challenge
    const handleDeclineChallenge = async (requestId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('match_requests')
                .update({ status: 'declined' })
                .eq('id', requestId);

            if (updateError) throw updateError;
            showNotification('Challenge declined.', 'info');
            fetchIncoming();
        } catch (err: any) {
            console.error('Decline Error:', err);
            showNotification('Failed to decline.', 'error');
        }
    };

    // 10. Handle Result Submission
    const handleResultSubmit = async (score: string) => {
        if (!reportingMatch || !reportType || !user) return;

        try {
            // Determine roles
            const isPlayer1 = user.id === reportingMatch.user_id;
            const partnerId = isPlayer1
                ? (reportingMatch.accepted_by || reportingMatch.opponent_id)
                : reportingMatch.user_id;

            const claimedWinnerId = reportType === 'win' ? user.id : partnerId;

            const claimPayload = {
                winner_id: claimedWinnerId,
                score: score
            };

            // Check if result already exists
            const { data: existingResult } = await supabase
                .from('match_results')
                .select('id')
                .eq('match_id', reportingMatch.id)
                .maybeSingle();

            if (existingResult) {
                const updateData = isPlayer1
                    ? { player1_claim: claimPayload }
                    : { player2_claim: claimPayload };

                const { error: updateError } = await supabase
                    .from('match_results')
                    .update(updateData)
                    .eq('match_id', reportingMatch.id);
                if (updateError) throw updateError;
            } else {
                const insertData = {
                    match_id: reportingMatch.id,
                    sport: reportingMatch.sport,
                    player1_id: reportingMatch.user_id,
                    player2_id: reportingMatch.accepted_by || reportingMatch.opponent_id,
                    [isPlayer1 ? 'player1_claim' : 'player2_claim']: claimPayload
                };
                const { error: insertError } = await supabase
                    .from('match_results')
                    .insert(insertData);
                if (insertError) throw insertError;
            }

            showNotification('Result reported successfully!', 'success');
            fetchAcceptedMatches();
        } catch (err: any) {
            console.error('Result reporting failed:', err);
            showNotification('Failed to report result: ' + err.message, 'error');
        } finally {
            setReportingMatch(null);
            setReportType(null);
        }
    };

    if (!user && authLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 mr-2" size={32} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Calibrating Radar...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT: Radar Feed */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Header & Sport Selector */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                    <Target className="text-blue-500" size={24} />
                                    The Radar
                                </h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                                    Live Scanning Local Sector
                                </p>
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] absolute -top-2 left-3 px-1 bg-zinc-900 z-10">
                                    Target Sport
                                </label>
                                <select
                                    value={selectedSport}
                                    onChange={e => setSelectedSport(e.target.value)}
                                    className="bg-black border-2 border-white/10 px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm focus:border-blue-600 text-white outline-none transition-all appearance-none pr-12 group-hover:border-white/20 min-w-[200px]"
                                >
                                    {displaySports.map((sportId: string) => (
                                        <option key={sportId} value={sportId}>
                                            {SPORTS.find(s => s.id === sportId)?.name || sportId}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Active Engagements (Accepted Matches) */}
                        {acceptedMatches.length > 0 && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-2 text-yellow-500 px-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] italic">Active Engagements</h4>
                                </div>
                                <div className="grid gap-4">
                                    {acceptedMatches.map((match) => {
                                        const isCreator = user.id === match.user_id;
                                        const partner = isCreator
                                            ? (match.acceptor || match.opponent)
                                            : match.challenger;

                                        const resultData = Array.isArray(match.result) ? match.result[0] : match.result;

                                        const myClaim = resultData ? (isCreator ? resultData.player1_claim : resultData.player2_claim) : null;
                                        const opponentClaim = resultData ? (isCreator ? resultData.player2_claim : resultData.player1_claim) : null;

                                        const isVerified = resultData?.is_verified;
                                        const amIWinner = isVerified && resultData.winner_id === user.id;

                                        return (
                                            <div
                                                key={match.id}
                                                className={`bg-zinc-900 border-2 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 group transition-all duration-300 relative overflow-hidden ${isVerified
                                                    ? (amIWinner ? 'border-green-500/50 hover:border-green-500' : 'border-red-500/50 hover:border-red-500')
                                                    : 'border-yellow-500/20 hover:border-yellow-500/40'
                                                    }`}
                                            >
                                                <div className={`absolute top-0 right-0 p-2 text-[8px] font-black uppercase tracking-widest rounded-bl-xl ${isVerified
                                                    ? (amIWinner ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')
                                                    : 'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    {isVerified ? 'Match Complete' : 'Match In Progress'}
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={partner?.profile_photo || '/avatar-placeholder.png'}
                                                        className={`w-14 h-14 rounded-2xl object-cover border-2 ${isVerified
                                                            ? (amIWinner ? 'border-green-500/20' : 'border-red-500/20')
                                                            : 'border-yellow-500/20'
                                                            }`}
                                                    />
                                                    <div>
                                                        <h5 className="font-black text-white uppercase text-base tracking-tight leading-none mb-1">
                                                            {partner?.name || 'Unknown Partner'}
                                                        </h5>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                                                                <Trophy size={10} className={isVerified ? (amIWinner ? 'text-green-500/50' : 'text-red-500/50') : 'text-yellow-500/50'} />
                                                                Level {Math.floor((partner?.elo || 800) / 400)}
                                                            </span>
                                                            <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest italic ${isVerified
                                                                ? (amIWinner ? 'text-green-500/70' : 'text-red-500/70')
                                                                : 'text-yellow-500/70'
                                                                }`}>
                                                                {match.sport}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {isVerified ? (
                                                        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${amIWinner
                                                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                                                            }`}>
                                                            {amIWinner ? <Trophy size={18} /> : <Frown size={18} />}
                                                            <span className="font-black uppercase tracking-widest text-xs">
                                                                {amIWinner ? 'Victory!' : 'Defeat'}
                                                            </span>
                                                            <span className="text-white font-bold text-sm ml-2">
                                                                {resultData.score}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {myClaim ? (
                                                                <div className="px-6 py-3 bg-zinc-800 rounded-2xl flex items-center gap-2 border border-white/5">
                                                                    <Loader2 size={14} className="animate-spin text-blue-500" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                                        Waiting for {partner?.name}...
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setReportingMatch(match);
                                                                            setReportType('win');
                                                                        }}
                                                                        className="flex-1 md:flex-none px-6 py-3 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg shadow-yellow-500/20"
                                                                    >
                                                                        REPORT WIN
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setReportingMatch(match);
                                                                            setReportType('loss');
                                                                        }}
                                                                        className="flex-1 md:flex-none px-6 py-3 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-700 transition-all hover:border-white/20 border border-white/5"
                                                                    >
                                                                        REPORT LOSS
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Incoming Signals (Challenges) */}
                        {incomingRequests.length > 0 && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-2 text-blue-500 px-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] italic">Incoming Signals</h4>
                                </div>
                                <div className="grid gap-4">
                                    {incomingRequests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-3xl flex items-center justify-between group hover:bg-blue-600/20 transition-all duration-300 backdrop-blur-md"
                                        >
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={req.challenger?.profile_photo || '/avatar-placeholder.png'}
                                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/20"
                                                />
                                                <div>
                                                    <h5 className="font-bold text-white uppercase text-sm tracking-tight">
                                                        {req.challenger?.name} <span className="text-blue-500 mx-1">•</span> Level {Math.floor((req.challenger?.elo || 800) / 400)}
                                                    </h5>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                                                        Sent a challenge for <span className="text-white italic">{req.sport}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDeclineChallenge(req.id)}
                                                    className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                                <button
                                                    disabled={isAccepting === req.id}
                                                    onClick={() => handleAcceptChallenge(req.id)}
                                                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all hover:scale-105 shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                                >
                                                    {isAccepting === req.id ? (
                                                        <Loader2 className="animate-spin" size={14} />
                                                    ) : (
                                                        <>
                                                            <Check size={14} />
                                                            Accept Signal
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Open Broadcasts */}
                        {broadcasts.length > 0 && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-2 text-green-500 px-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] italic">Open Frequency</h4>
                                </div>
                                <div className="grid gap-4">
                                    {broadcasts.map((b) => (
                                        <div
                                            key={b.id}
                                            className="bg-zinc-900 border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-green-500/30 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={b.challenger?.profile_photo || '/avatar-placeholder.png'}
                                                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10"
                                                    />
                                                    <div className="absolute -top-1 -right-1 bg-green-500 p-1 rounded-full border-2 border-zinc-900 animate-pulse">
                                                        <Radio size={10} className="text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-white uppercase tracking-tight">
                                                        {b.challenger?.name}'s <span className="text-green-500 italic">{b.sport}</span> Session
                                                    </h5>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                                            <Target size={10} /> Elo: {b.challenger?.elo}
                                                        </span>
                                                        {b.scheduled_time && (
                                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                                                                {new Date(b.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                disabled={isAccepting === b.id}
                                                onClick={() => handleAcceptChallenge(b.id)}
                                                className="px-8 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-500 hover:text-white transition-all hover:scale-105 shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {isAccepting === b.id ? (
                                                    <Loader2 className="animate-spin" size={14} />
                                                ) : (
                                                    <>Join Match</>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nearby Players Heading */}
                        {!loading && (players.length > 0 || broadcasts.length > 0 || incomingRequests.length > 0) && (
                            <div className="flex items-center gap-2 text-gray-400 px-2 pt-4">
                                <Users size={16} />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] italic">Available Targets</h4>
                            </div>
                        )}

                        {/* States */}
                        {loading && !players.length ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="animate-spin text-blue-500" size={48} />
                                <p className="text-gray-500 font-black italic uppercase tracking-widest">Scanning Waves...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-3xl text-center space-y-4">
                                <AlertCircle className="text-red-500 mx-auto" size={48} />
                                <h4 className="text-xl font-bold text-white">Interference Detected</h4>
                                <p className="text-gray-400 max-w-xs mx-auto text-sm">{error}</p>
                                <button
                                    onClick={fetchRadar}
                                    className="px-8 py-3 bg-red-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all"
                                >
                                    Retry Scan
                                </button>
                            </div>
                        ) : !players.length && !incomingRequests.length && !broadcasts.length ? (
                            <div className="bg-zinc-900/30 border-2 border-dashed border-white/5 rounded-[2rem] p-16 text-center space-y-6">
                                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                    <Radio className="text-gray-600" size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-gray-300">Sector Clear</h4>
                                    <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                                        No active signals in your current ELO range for <span className="text-white font-bold">{selectedSport}</span>.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Player Grid */
                            <div className="grid md:grid-cols-2 gap-4">
                                {players.map((player) => (
                                    <div
                                        key={player.id}
                                        className="group bg-zinc-900/80 border border-white/10 hover:border-blue-500/50 p-6 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden"
                                    >
                                        {/* Match Quality Badge */}
                                        <div className="absolute top-4 right-6 text-[10px] font-black bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                            {Math.round(player.match_quality * 100)}% Match
                                        </div>

                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="relative">
                                                <img
                                                    src={player.profile_photo || '/avatar-placeholder.png'}
                                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:border-blue-500/50 transition-colors duration-500 shadow-xl"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full shadow-lg"></div>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{player.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">ELO:</span>
                                                    <span className="text-sm font-black italic text-blue-500">{player.elo}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reliability</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500"
                                                            style={{ width: `${player.reliability_score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-white italic">{player.reliability_score}%</span>
                                                </div>
                                            </div>

                                            <button
                                                disabled={challenging === player.id}
                                                onClick={() => handleChallenge(player.id)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-600/20"
                                            >
                                                {challenging === player.id ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="animate-spin" size={14} />
                                                        Sending...
                                                    </span>
                                                ) : 'Challenge'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Sidebar */}
                    <div className="lg:col-span-4 space-y-8 sticky top-24">
                        <StartMatchSidebar />

                        {/* Radar Intelligence Tip */}
                        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-blue-500">
                                <Users size={20} />
                                <h4 className="text-sm font-black uppercase tracking-widest italic">Sector Intel</h4>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Our <span className="text-white font-bold">Shadow-Calibrated Radar</span> calculates match quality based on ELO proximity, reliability history, and play frequency.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <MatchResultModal
                isOpen={!!reportingMatch}
                onClose={() => {
                    setReportingMatch(null);
                    setReportType(null);
                }}
                onSubmit={handleResultSubmit}
                resultType={reportType}
                opponentName={
                    reportingMatch
                        ? (user.id === reportingMatch.user_id
                            ? (reportingMatch.acceptor || reportingMatch.opponent)?.name
                            : reportingMatch.challenger?.name) || 'Unknown'
                        : ''
                }
            />
        </div>
    );
};
export default Radar;
