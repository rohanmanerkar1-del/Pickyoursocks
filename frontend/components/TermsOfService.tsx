
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-gray-300 p-8 md:p-24 selection:bg-blue-600 selection:text-white">
            <div className="max-w-3xl mx-auto animate-fade-in-up">
                <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest text-xs mb-12 hover:translate-x-[-4px] transition-transform">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-8">
                    Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Service</span>
                </h1>

                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using PickYourSocks (the "Service"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, you may not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Beta Service</h2>
                        <p>
                            You acknowledge that the Service is currently in "Beta" phase. This means it may contain bugs, errors, and other issues
                            that could affect system stability. We give no warranties regarding the reliability or availability of the Service during this phase.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
                        <p>
                            You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service.
                            Respectful competition is the core of our platform; abusive behavior toward other athletes will result in immediate termination.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
                        <p>
                            The Service and its original content, features, and functionality are and will remain the exclusive property of PickYourSocks
                            and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior
                            to any new terms taking effect.
                        </p>
                    </section>
                </div>

                <div className="mt-20 pt-8 border-t border-white/10 text-xs text-gray-500 uppercase tracking-widest">
                    Last Updated: January 2026
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
