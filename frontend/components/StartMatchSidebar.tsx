import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from './NotificationContext';
import { SPORTS } from '../constants';

const StartMatchSidebar: React.FC = () => {
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [selectedSport, setSelectedSport] = useState(user?.sports?.[0] || 'badminton');

    const handleBroadcast = async () => {
        if (!user) return;
        if (!date || !time) {
            showNotification('Please select a date and time.', 'error');
            return;
        }

        setIsBroadcasting(true);

        // Combine date and time into a single ISO string
        const scheduledTime = new Date(`${date}T${time}`).toISOString();

        try {
            const { error } = await supabase.from('match_requests').insert({
                user_id: user.id,
                sport: selectedSport,
                scheduled_time: scheduledTime,
                status: 'active'
            });

            if (error) throw error;

            showNotification('Challenge Broadcasted! 📡', 'success');
            // Reset form
            setDate('');
            setTime('');
        } catch (error: any) {
            console.error('Error broadcasting:', error);
            showNotification('Failed to broadcast: ' + error.message, 'error');
        } finally {
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24">
            <div className="text-center mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">
                    Start a Match
                </h3>
                <p className="text-gray-400 text-xs">
                    Broadcast your availability to players in your Elo range.
                </p>
            </div>

            {/* User Stats Card */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 p-4 rounded-xl mb-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Your Rating</p>
                <div className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {user?.elo ?? '---'}
                </div>
                <div className="text-xs font-bold text-blue-400 bg-blue-500/10 inline-block px-2 py-1 rounded mt-2 uppercase tracking-wider">
                    {user?.rating_deviation && user.rating_deviation > 100 ? 'Provisional' : 'Established'}
                </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-4 mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Schedule Match</p>

                <div className="space-y-3">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Calendar size={16} />
                        </div>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white text-sm font-bold uppercase tracking-wider focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Clock size={16} />
                        </div>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white text-sm font-bold uppercase tracking-wider focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={selectedSport}
                            onChange={(e) => setSelectedSport(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold uppercase tracking-wider focus:border-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            {user?.sports && user.sports.length > 0 ? (
                                user.sports.map(sid => {
                                    const s = SPORTS.find(x => x.id === sid);
                                    return <option key={sid} value={sid}>{s?.name || sid}</option>
                                })
                            ) : (
                                SPORTS.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))
                            )}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Broadcast Button */}
            <button
                onClick={handleBroadcast}
                disabled={isBroadcasting}
                className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 relative overflow-hidden"
            >
                {isBroadcasting ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20"></span>
                        Sending Challenge...
                    </span>
                ) : (
                    'Start a Challenge'
                )}
            </button>

            <p className="text-center text-gray-500 text-xs mt-4 leading-relaxed">
                This will notify players within <span className="text-white font-bold">5 miles</span> who match your skill level.
            </p>
        </div>
    );
};

export default StartMatchSidebar;
