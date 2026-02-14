# PickYourSocks - Project Brief

## Overview
PickYourSocks is a premium, cinematic digital ecosystem connecting amateur athletes with professional recruitment opportunities. The platform uses an ELO matchmaking system and digital resumes to bridge the gap between casual play and professional sports.

## Tech Stack
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS (via CDN and local customization)
- **Language**: TypeScript

## Key Features
1.  **Cinematic Hero Section**: Features a static "Pushup" background image with a premium dark mode overlay and "Join Waitlist" call-to-action.
2.  **Sports Arena Grid**: Displays 4 core sports (MMA, Running, Football, Gym) with custom imagery and hover effects (grayscale to color).
3.  **Community Section**: "Precision Scouting" tagline with a "Hire Talent" CTA.
4.  **Waitlist**: Functional email capture form with validation and feedback state.
5.  **Navigation**: Smooth scrolling links connecting all sections.

## Core Codebase

### 1. App.tsx (Main Layout)
```tsx
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SportsGrid from './components/SportsGrid';
import Community from './components/Community';
import Waitlist from './components/Waitlist';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Hero />
      <Features />
      <SportsGrid />
      <Community />
      <Waitlist />
      <Footer />
      
      {/* Noise Overlay for Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </div>
  );
}

export default App;
```

### 2. constants.tsx (Data Source)
```tsx
import { Feature, SportCategory, AthleteProfile } from './types';

export const FEATURES: Feature[] = [
  {
    id: 'elo',
    title: 'ELO Matchmaking',
    description: 'Dynamic skill models ensure fair games and prevent mismatches. Play against opponents who actually match your level.',
    icon: 'target'
  },
  {
    id: 'recruit',
    title: 'Digital Resumes',
    description: 'Build comprehensive athletic profiles with highlight videos and physical metrics. Get discovered by scouts.',
    icon: 'user-check'
  },
  {
    id: 'venue',
    title: 'Elite Access',
    description: 'Eliminate logistical excuses. Secure high-quality courts and find instant replacements so your training never stops.',
    icon: 'map-pin'
  }
];

export const SPORTS: SportCategory[] = [
  {
    id: 'mma',
    name: 'MMA',
    image: '/conor_mcgregor.jpeg',
    description: 'Find sparring partners and local gyms.'
  },
  {
    id: 'tennis',
    name: 'Tennis',
    image: '/Tennis.jpg',
    description: 'Find local courts and players at your skill level.'
  },
  {
    id: 'football',
    name: 'Football',
    image: '/cristiano_ronaldo.png',
    description: 'Organize 5-a-side matches with ELO ratings.'
  },
  {
    id: 'fitness',
    name: 'Gym & Fitness',
    image: '/Crossfit.JPG',
    description: 'Connect with training partners for maximum gains.'
  }
];

export const ATHLETES: AthleteProfile[] = [
  {
    id: '1',
    name: 'User_7721',
    sport: 'Boxing',
    rating: 2450,
    image: '/avatar-1.png',
    bio: 'Heavyweight metrics: Top 5% punch velocity in region.'
  },
  {
    id: '2',
    name: 'User_9904',
    sport: 'Sprinting',
    rating: 2100,
    image: '/avatar-2.png',
    bio: 'Track split times verified. 98th percentile acceleration.'
  }
];
```

### 3. Hero.tsx (Background Image & Main CTA)
```tsx
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
                Train Better. Connect Faster.
              </p>
              <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8 text-white drop-shadow-2xl">
                Pick Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Socks</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-xl leading-relaxed font-light drop-shadow-lg">
                Turn Potential Into Performance.
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
```

### 4. Features.tsx (Value Proposition)
```tsx
import React from 'react';
import { FEATURES } from '../constants';
import * as Icons from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transition-transform duration-500 md:hidden flex flex-col items-center justify-center gap-8 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black italic uppercase tracking-tighter hover:text-blue-500 transition-colors">How It Works</a>
        <a href="#sports" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black italic uppercase tracking-tighter hover:text-blue-500 transition-colors">Sports</a>
        <a href="#community" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black italic uppercase tracking-tighter hover:text-blue-500 transition-colors">Community</a>
      </div>
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-blue-500 font-bold uppercase tracking-widest mb-4">The New Standard</h2>
            <h3 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight mb-8">
              Bridges the Gap Between <br />
              <span className="text-white/20">Playing</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 pr-12">Competing</span>
            </h3>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed font-light drop-shadow-lg">
              Less planning. More playing. Build your digital sports profile while connecting with athletes like you.
            </p>
          </div>

          <div className="lg:w-1/2 grid grid-cols-1 gap-6">
            {FEATURES.map((feature, idx) => (
              <div key={feature.id} className="group relative p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-blue-900/20">

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />

                <div className="flex items-start gap-6 relative z-10">
                  <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-2xl group-hover:border-blue-500/50 Group-hover:bg-blue-600/20 transition-all duration-500 overflow-hidden group-hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] shrink-0">
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600 hover:opacity-100 transition-all duration-500" />
                    
                    {/* Icon */}
                    <div className="relative z-10 text-blue-400 group-hover:text-white transition-colors duration-300">
                      {feature.icon === 'target' && <Icons.Target size={28} strokeWidth={1.5} />}
                      {feature.icon === 'user-check' && <Icons.UserCheck size={28} strokeWidth={1.5} />}
                      {feature.icon === 'map-pin' && <Icons.MapPin size={28} strokeWidth={1.5} />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black uppercase italic mb-3 text-gray-100 group-hover:text-white transition-colors">{feature.title}</h4>
                    <p className="text-gray-400 leading-relaxed font-light group-hover:text-gray-300 transition-colors">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
```

### 5. SportsGrid.tsx (Interactive Grid)
```tsx
import React from 'react';
import { SPORTS } from '../constants';

const SportsGrid: React.FC = () => {
  return (
    <section id="sports" className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              Pick Your <span className="text-blue-600">Arena</span>
            </h2>
          </div>
          <button 
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-bold uppercase tracking-widest text-blue-500 hover:text-white transition-colors"
          >
            View All Sports →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPORTS.map((sport) => (
            <div
              key={sport.id}
              className="group relative h-[450px] overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 cursor-pointer"
            >
              <img
                src={sport.image}
                alt={sport.name}
                className="absolute inset-0 w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 group-hover:text-blue-500 transition-colors">
                  {sport.name}
                </h3>
                <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {sport.description}
                </p>
                <div className="mt-4 w-12 h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportsGrid;
```
