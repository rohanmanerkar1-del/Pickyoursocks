
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
