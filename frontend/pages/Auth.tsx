import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { SPORTS } from '../constants';
import { User as UserIcon } from 'lucide-react';

const MAX_STEPS = 3;

// Calibration Levels based on the user's provided guide
const SKILL_LEVELS = [
  { level: 0.5, label: 'Newbie', elo: 600, desc: 'Learning to hold the racket. Mostly stationary.' },
  { level: 1, label: 'Beginner', elo: 800, desc: 'Can hit basic shots but footwork is stiff.' },
  { level: 2, label: 'Recreational', elo: 1000, desc: 'Clears reach baseline, but error rate is high.' },
  { level: 3, label: 'Intermediate', elo: 1200, desc: 'Stable serve, can smash/drop, moving better.' },
  { level: 4, label: 'Advanced', elo: 1500, desc: 'Strong net play, continuous attacks, good tactics.' },
  { level: 5, label: 'Expert', elo: 1800, desc: 'Proficient in all techniques, deceptive shots.' },
  { level: 6, label: 'Elite', elo: 2000, desc: 'Professional characteristics, high speed & power.' },
];

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode');

  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, isLoading, user } = useAuth();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');

  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>(['badminton']); // Default to badminton for now
  const [isSportsDropdownOpen, setIsSportsDropdownOpen] = useState(false);
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<typeof SKILL_LEVELS[0] | null>(null);

  const toggleMode = () => {
    const newMode = !isLogin ? 'login' : 'signup';
    setIsLogin(!isLogin);
    setCurrentStep(1);
    setError('');
    navigate(`/auth?mode=${newMode}`, { replace: true });
  }

  /* --------------------
     Login Logic
  -------------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  /* --------------------
     Signup Wizard Logic
  -------------------- */
  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!name || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (selectedSports.length === 0) {
        setError('Please select at least one sport');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!pledgeAccepted) {
        setError('You must accept the pledge to continue');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleFinalSignup = async () => {
    setError('');
    if (!selectedSkill) {
      setError('Please select your skill level');
      return;
    }

    try {
      await signup(
        {
          name,
          email,
          sports: selectedSports,
          elo: selectedSkill.elo,
          reliability_score: 100, // Initial perfect score
          calibration_games_remaining: 5, // High RD phase
          rating_deviation: 350, // Max uncertainty
        },
        password
      );
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 relative overflow-hidden py-10">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 transition-all duration-500">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic mb-2 uppercase tracking-tighter">
            {isLogin ? 'Welcome Back' : (
              currentStep === 1 ? 'Create Account' :
                currentStep === 2 ? 'Reliability Pledge' :
                  'Calibration'
            )}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Enter your details to access your account' : (
              currentStep === 1 ? 'Step 1: Identity' :
                currentStep === 2 ? 'Step 2: Commitment' :
                  'Step 3: Skill Verification'
            )}
          </p>

          {/* Progress Bar for Signup */}
          {!isLogin && (
            <div className="flex gap-2 mt-4 justify-center">
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`h-1 rounded-full transition-all duration-300 ${step <= currentStep ? 'w-8 bg-blue-500' : 'w-4 bg-zinc-700'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-blue-600 mt-6 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative bg-zinc-900 px-4 text-xs text-gray-500 uppercase tracking-widest">Or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              Continue with Google
            </button>
          </form>
        ) : (
          /* ================= SIGNUP WIZARD ================= */
          <div className="space-y-6">

            {/* STEP 1: IDENTITY */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-11 pr-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password (min 8 chars)"
                  className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Sports Selection (Custom Dropdown) */}
                <div className="space-y-2 relative">
                  <p className="text-xs text-gray-500 ml-1 uppercase tracking-wider font-bold">Your Sport</p>

                  <button
                    type="button"
                    onClick={() => setIsSportsDropdownOpen(!isSportsDropdownOpen)}
                    className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-left flex items-center justify-between hover:border-blue-500 transition-all group"
                  >
                    <span className={`font-bold uppercase tracking-wider ${selectedSports.length > 0 ? 'text-white' : 'text-gray-500'}`}>
                      {selectedSports.length > 0
                        ? SPORTS.find(s => s.id === selectedSports[0])?.name
                        : 'Select Sport'}
                    </span>
                    <span className={`text-gray-500 transition-transform duration-300 ${isSportsDropdownOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {isSportsDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 z-50 max-h-60 overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      {SPORTS.map((sport) => (
                        <button
                          key={sport.id}
                          type="button"
                          onClick={() => {
                            setSelectedSports([sport.id]);
                            setIsSportsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center justify-between transition-colors ${selectedSports.includes(sport.id)
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <span className="font-bold uppercase text-sm tracking-wider">
                            {sport.name}
                          </span>
                          {selectedSports.includes(sport.id) && (
                            <span className="text-blue-400 font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full bg-blue-600 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 transition-all hover:scale-[1.02] mt-4"
                >
                  Next Step
                </button>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-white/5 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  Use Google Instead
                </button>
              </div>
            )}

            {/* STEP 2: RELIABILITY PLEDGE */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl text-center">
                  <h3 className="text-yellow-500 font-bold uppercase tracking-wider mb-2">The Playo Paradox</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    "High-level players reject invites because they fear low-quality games. Low-level players get stranded."
                  </p>
                </div>

                <div className="text-center px-4">
                  <p className="text-white font-medium mb-4">
                    To fix this, we track <span className="text-blue-500 font-bold">Reliability</span>.
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    By checking this box, you pledge to show up to games you accept. Flaking will destroy your reliability score and hide you from the feed.
                  </p>

                  <label className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/50 transition-colors">
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${pledgeAccepted ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                      {pledgeAccepted && <span className="text-white text-sm font-bold">✓</span>}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={pledgeAccepted}
                      onChange={(e) => setPledgeAccepted(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-gray-200">
                      I pledge to be reliable.
                    </span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="w-1/3 bg-zinc-800 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!pledgeAccepted}
                    className="w-2/3 bg-blue-600 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
                  >
                    Commit
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SKILL CALIBRATION */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-4">
                  <div className="inline-block bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    Shadow μ Calibration
                  </div>
                  <p className="text-gray-400 text-xs">
                    Select your accurate level. Your rating will be provisional (high deviation) for the first 5 matches.
                  </p>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {SKILL_LEVELS.map((skill) => (
                    <button
                      key={skill.level}
                      onClick={() => setSelectedSkill(skill)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${selectedSkill?.level === skill.level
                        ? 'bg-blue-600 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-zinc-800/50 border-white/5 hover:bg-zinc-800 hover:border-white/20'
                        }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-black italic uppercase text-lg ${selectedSkill?.level === skill.level ? 'text-white' : 'text-gray-300'
                          }`}>
                          Level {skill.level}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedSkill?.level === skill.level ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-500'
                          }`}>
                          ~{skill.elo} ELO
                        </span>
                      </div>
                      <p className={`text-xs ${selectedSkill?.level === skill.level ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        {skill.desc}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-1/3 bg-zinc-800 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinalSignup}
                    disabled={isLoading || !selectedSkill}
                    className="w-2/3 bg-blue-600 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50 transition-all hover:scale-[1.02]"
                  >
                    {isLoading ? 'Calibrating...' : 'Finish'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? "Don't have an account?" : 'Already in the system?'}{' '}
            <button
              onClick={toggleMode}
              className="text-white font-bold hover:text-blue-400 ml-1 underline decoration-blue-500/30 underline-offset-4"
            >
              {isLogin ? 'Join Now' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
