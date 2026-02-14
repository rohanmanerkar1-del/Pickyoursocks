import React from 'react';
import Navbar from '../components/Navbar';
import SportsGrid from '../components/SportsGrid';
import Footer from '../components/Footer';

const AllSports: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white">
            <Navbar />

            <main className="pt-20">
                <SportsGrid />
            </main>

            <Footer />

            {/* Background static / noise overlay for cinematic feel */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay">
                <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>
        </div>
    );
};

export default AllSports;
