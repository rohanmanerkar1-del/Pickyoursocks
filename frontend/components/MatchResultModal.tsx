import React, { useState } from 'react';
import { X, Trophy, Frown, Save } from 'lucide-react';

interface MatchResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (score: string) => Promise<void>;
    resultType: 'win' | 'loss' | null;
    opponentName: string;
}

const MatchResultModal: React.FC<MatchResultModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    resultType,
    opponentName
}) => {
    const [score, setScore] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !resultType) return null;

    const handleSubmit = async () => {
        if (!score.trim()) return;
        setIsSubmitting(true);
        await onSubmit(score);
        setIsSubmitting(false);
        onClose();
    };

    const isWin = resultType === 'win';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden relative shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className={`p-6 text-center ${isWin ? 'bg-gradient-to-b from-green-500/20 to-transparent' : 'bg-gradient-to-b from-red-500/20 to-transparent'}`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {isWin ? <Trophy size={32} /> : <Frown size={32} />}
                    </div>

                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                        {isWin ? 'Victory!' : 'Defeat'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Against <span className="text-white font-bold">{opponentName}</span>
                    </p>
                </div>

                {/* content */}
                <div className="p-6 pt-0 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Match Score
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 21-19, 21-15"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold placeholder:text-gray-600 focus:border-blue-500 outline-none transition-colors"
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!score.trim() || isSubmitting}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${isWin
                                ? 'bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/20'
                                : 'bg-red-500 hover:bg-red-400 text-black shadow-lg shadow-red-500/20'
                            } disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Saving...</span>
                        ) : (
                            <>
                                <Save size={18} /> Confirm Report
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default MatchResultModal;
