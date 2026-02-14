import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full h-screen">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/Pushups.jpeg"
            alt="Athlete doing pushups"
            className="w-full h-full object-cover opacity-90"
          />
          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-12 pointer-events-none z-10">
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-3xl translate-y-[5vh]">
              <p className="text-blue-400 font-bold uppercase tracking-[0.3em] mb-4 animate-fade-in opacity-0" style={{ animation: 'fadeIn 1s forwards' }}>
                Skill-Rated Matchmaking
              </p>
              <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8 text-white drop-shadow-2xl">
                Find Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 pr-4">Competition</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-xl leading-relaxed font-light drop-shadow-lg">
                The first skill-rated platform for amateur sports. Find worthy rivals, book courts instantly, and build your verified athletic career.
              </p>
              <div className="flex flex-wrap gap-6 pointer-events-auto">
                <a
                  href="#waitlist"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group relative px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 group-hover:text-blue-600 transition-colors">Join the Community</span>
                  <div className="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </a>

              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
