import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Waitlist: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sport, setSport] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sports = [
    "Running", "Football", "Basketball", "Gym",
    "Crossfit", "Tennis", "Boxing", "MMA",
    "Kickboxing", "Other"
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && sport) {
      setLoading(true);

      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxDh2XJKpCYfOQOluz3Nqa0_RpPKtpUKANuQPsd_wfVwMnMXd1gqrRTxBV4RmxuYlcA/exec";

      const formData = new FormData();
      formData.append('email', email);
      formData.append('sport', sport);
      formData.append('timestamp', new Date().toISOString());

      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      })
        .then(() => {
          setSubmitted(true);
          setEmail('');
          setSport('');
        })
        .catch((error) => {
          console.error("Error!", error);
          alert("Something went wrong. Please check your internet connection.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      alert("Please select a sport");
    }
  };

  return (
    <section id="waitlist" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6">
          Be the First to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 pr-12">Compete</span>
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join our exclusive waitlist and get priority access to our skill-rated matchmaking system and recruitment tools.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-full focus-within:ring-2 focus-within:ring-blue-600/50 transition-all shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-sm">
              <input
                type="email"
                placeholder="Enter your athletic email"
                required
                name="email"
                className="w-full bg-transparent px-8 py-4 text-white placeholder-gray-500 outline-none border-none focus:ring-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="relative flex-1 min-w-[200px]" ref={dropdownRef}>
              <div
                onClick={() => !loading && setIsOpen(!isOpen)}
                className={`w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-left flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors backdrop-blur-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${isOpen ? 'ring-2 ring-blue-600/50' : ''}`}
              >
                <span className={sport ? "text-white" : "text-gray-500"}>
                  {sport || "Select Sport"}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
              </div>

              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="py-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {sports.map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setSport(option);
                          setIsOpen(false);
                        }}
                        className="px-6 py-3 hover:bg-blue-600/20 hover:text-blue-400 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <span className={`font-medium ${sport === option ? 'text-blue-500' : 'text-gray-300 group-hover:text-white'}`}>
                          {option}
                        </span>
                        {sport === option && <Check className="w-4 h-4 text-blue-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest px-8 py-4 rounded-full transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Now'}
            </button>
          </form>
        ) : (
          <div className="p-8 bg-blue-600/20 border border-blue-600/30 rounded-3xl animate-fade-in">
            <h3 className="text-2xl font-bold mb-2">You're on the roster!</h3>
            <p className="text-blue-400 font-semibold">We've added your details to the database.</p>
          </div>
        )}

        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-gray-600">
          Limited slots remaining for beta season. No spam. Just performance.
        </p>
      </div>
    </section>
  );
};

export default Waitlist;
