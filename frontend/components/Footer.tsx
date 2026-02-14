
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center font-black text-white italic">P</div>
            <span className="text-xl font-black tracking-tighter uppercase italic">PickYourSocks</span>
          </div>

          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-500">
            <Link to="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link>
            <a href="mailto:rohanmanerkar1@gmail.com" className="hover:text-blue-500 transition-colors">Contact</a>
          </div>

          <div className="flex gap-4">
            {['Twitter', 'Instagram', 'LinkedIn'].map((platform) => (
              <a
                key={platform}
                href="#"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
              >
                <span className="sr-only">{platform}</span>
                <div className="w-4 h-4 rounded-full bg-current" />
              </a>
            ))}
          </div>
        </div>

        <div className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-700">
          © 2024 PICKYOURSOCKS DIGITAL ECOSYSTEM. ALL PERFORMANCE GUARANTEED.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
