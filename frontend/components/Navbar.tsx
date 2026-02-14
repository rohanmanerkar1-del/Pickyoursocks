import React, { useState, useEffect } from 'react';
import {
  Search,
  Home,
  Radio,
  Trophy,
  User,
  ChevronDown,
  PlusSquare,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from './AuthContext';
import CreatePostModal from './CreatePostModal';
import { supabase } from '../lib/supabase';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openPost, setOpenPost] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, name, username, profile_photo')
      .ilike('username', `%${query}%`)
      .limit(5);

    setSearchResults(data || []);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  /* ======================
     Reusable Nav Item
  ====================== */
  const NavItem = ({
    title,
    to,
    children,
  }: {
    title: string;
    to?: string;
    children?: React.ReactNode;
  }) => (
    <div className="group relative h-full flex items-center">
      <Link
        to={to || '#'}
        className="text-[13px] font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors flex items-center gap-1 py-4 px-3"
      >
        {title}
        {children && (
          <ChevronDown
            size={10}
            className="text-gray-500 group-hover:text-white transition-colors"
          />
        )}
      </Link>

      {children && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 -translate-y-5 pointer-events-none transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
          <div
            className={`w-48 rounded-xl border border-white/10 overflow-hidden shadow-2xl ${scrolled ? 'bg-black/95' : 'bg-blue-600'
              }`}
          >
            <div className="py-2 flex flex-col">{children}</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ======================
          Desktop Top Navigation
      ====================== */}
      <nav
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-[max-width,background-color,border-radius,padding] duration-500 linear hidden lg:flex items-center justify-between w-full ${scrolled
          ? 'max-w-full px-6 lg:px-12 py-4 bg-black/95 backdrop-blur-md border-b border-white/10 rounded-none shadow-lg'
          : 'max-w-[76.25rem] px-8 py-4 bg-blue-600 rounded-b-3xl shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)]'
          }`}
      >
        {/* LEFT SECTION */}
        <div className="flex items-center gap-8">
          <Link to={user ? '/feed' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white text-blue-600 rounded-sm flex items-center justify-center font-black italic shadow-lg group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic text-white group-hover:opacity-90 transition-opacity">
              Pickyoursocks
            </span>
          </Link>

          <div className="flex items-center gap-1 border-l border-white/10 pl-8 h-8">
            <NavItem title="Feed" to="/feed" />
            <NavItem title="Radar" to="/radar" />
            <NavItem title="Ranking" to="/rankings" />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-6">

          {/* SEARCH COMPONENT */}
          <div className="relative group">
            <div className={`flex items-center rounded-full transition-all duration-300 ease-out ${isSearchOpen ? 'w-64 px-3 py-2 bg-zinc-900 border border-white/10 shadow-lg' : 'w-8 h-8 justify-center cursor-pointer bg-transparent hover:bg-white/5'
              }`}>
              <Search
                size={isSearchOpen ? 16 : 18}
                className={`transition-colors duration-300 ${isSearchOpen ? 'text-blue-500' : 'text-white/40 group-hover:text-white'}`}
                onClick={() => {
                  if (!isSearchOpen) setIsSearchOpen(true);
                }}
              />
              {isSearchOpen && (
                <input
                  autoFocus
                  className="bg-transparent border-none outline-none text-sm text-white ml-3 w-full placeholder-gray-600 font-medium"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onBlur={() => {
                    // Delay hiding to allow clicking results
                    setTimeout(() => {
                      setIsSearchOpen(false);
                      setSearchResults([]);
                      setSearchQuery('');
                    }, 200);
                  }}
                />
              )}
            </div>

            {/* Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                {searchResults.map((result: any) => (
                  <div
                    key={result.id}
                    onClick={() => {
                      navigate(`/profile/${result.id}`);
                      setIsSearchOpen(false);
                      setSearchResults([]);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {result.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{result.name}</p>
                      <p className="text-xs text-gray-500">@{result.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={() => setOpenPost(true)}
              className="flex items-center gap-2 bg-white text-blue-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <PlusSquare size={14} />
              Post
            </button>
          )}

          {user ? (
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20"
            >
              {(user.name || 'U')[0].toUpperCase()}
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/auth?mode=login"
                className="text-xs font-bold uppercase tracking-widest text-white hover:text-blue-200 transition"
              >
                Login
              </Link>
              <Link
                to="/auth?mode=signup"
                className="bg-white text-blue-600 text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ======================
          Mobile Top Bar
      ====================== */}
      <div className="lg:hidden fixed top-0 w-full z-40 bg-black/95 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="w-8 h-8 bg-white text-blue-600 rounded flex items-center justify-center font-black italic"
        >
          P
        </Link>
        <span className="text-white font-black italic uppercase tracking-tighter">
          Pickyoursocks
        </span>
        {user ? (
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white"
          >
            {(user.name || 'U')[0].toUpperCase()}
          </Link>
        ) : (
          <Link
            to="/auth?mode=login"
            className="text-xs font-bold uppercase text-white"
          >
            Login
          </Link>
        )}
      </div>

      {/* ======================
          Mobile Bottom Nav
      ====================== */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center justify-around px-6 py-4">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <Home size={20} />
            {isActive('/') && (
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            )}
          </Link>

          <Link
            to="/feed"
            className={`flex flex-col items-center gap-1 ${isActive('/feed') ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <Radio size={20} />
            {isActive('/feed') && (
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            )}
          </Link>

          {user && (
            <button
              onClick={() => setOpenPost(true)}
              className="flex flex-col items-center gap-1 text-blue-500"
            >
              <PlusSquare size={22} />
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            </button>
          )}

          <Link
            to="/rankings"
            className={`flex flex-col items-center gap-1 ${isActive('/rankings') ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <Trophy size={20} />
            {isActive('/rankings') && (
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            )}
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <User size={20} />
            {isActive('/profile') && (
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            )}
          </Link>
        </div>
      </div>

      {/* ======================
          Create Post Modal
      ====================== */}
      {openPost && <CreatePostModal onClose={() => setOpenPost(false)} />}
    </>
  );
};

export default Navbar;
