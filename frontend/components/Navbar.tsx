
import React, { useState } from 'react';
import {
  Home,
  Radio,
  Trophy,
  User,
  PlusCircle,
  Search,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from './AuthContext';
import CreatePostModal from './CreatePostModal';

const Navbar: React.FC = () => {
  const [openPost, setOpenPost] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  /* ======================
     Bottom Nav Item
  ====================== */
  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-blue-500 scale-110' : 'text-gray-500 hover:text-gray-300'
          }`}
      >
        <Icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 2} />
        <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* ======================
          Mobile Bottom Nav
      ====================== */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-[60] flex justify-center pb-6 px-4 pointer-events-none">
        <div className="w-full max-w-[500px] pointer-events-auto">
          <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 py-3">
            <NavItem to="/feed" icon={Home} label="Home" />
            <NavItem to="/radar" icon={Radio} label="Radar" />

            {/* Action Button */}
            <button
              onClick={() => setOpenPost(true)}
              className="relative -top-6 bg-blue-600 p-4 rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.4)] text-white hover:bg-blue-500 hover:scale-110 transition-all active:scale-95 group"
            >
              <PlusCircle size={24} strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20 pointer-events-none" />
            </button>

            <NavItem to="/rankings" icon={Trophy} label="Elite" />
            <NavItem to="/profile" icon={User} label="Me" />
          </div>
        </div>
      </nav>

      {/* ======================
          Create Post Modal
      ====================== */}
      {openPost && <CreatePostModal onClose={() => setOpenPost(false)} />}
    </>
  );
};

export default Navbar;
