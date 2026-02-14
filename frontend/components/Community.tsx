import React from 'react';
import { ATHLETES } from '../constants';

const Community: React.FC = () => {
  return (
    <section id="community" className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-blue-500 font-bold uppercase tracking-widest mb-4">Precision Scouting</h2>
          <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Treating amateur <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white">talent</span> with <br />
            professional-grade <span className="text-blue-600">precision</span>.
          </h3>
        </div>



        <div className="mt-20 p-12 bg-zinc-900 border border-white/5 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div>
              <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Ready to Scout?</h4>
              <p className="text-gray-400">Join 500+ clubs hiring through PickYourSocks.</p>
            </div>
            <button
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest px-12 py-5 rounded-full transition-all shadow-xl shadow-blue-600/20 transform hover:-translate-y-1"
            >
              Hire Talent
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
