
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-gray-300 p-8 md:p-24 selection:bg-blue-600 selection:text-white">
            <div className="max-w-3xl mx-auto animate-fade-in-up">
                <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest text-xs mb-12 hover:translate-x-[-4px] transition-transform">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-8">
                    Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Policy</span>
                </h1>

                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p>
                            Welcome to PickYourSocks. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website
                            (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
                        <p className="mb-4">
                            Currently, we only collect data that you voluntarily provide to us via our Waitlist form:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-400">
                            <li><strong>Email Address:</strong> Used to notify you when beta access opens.</li>
                            <li><strong>Usage Data:</strong> We may anonymously track interactions to improve website performance (e.g., button clicks).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
                        <p>
                            Your data is used solely for the purpose of communicating waitlist status, product updates, and early access invitations.
                            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Security</h2>
                        <p>
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
                            used, or accessed in an unauthorized way.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us at support@pickyoursocks.com.
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

export default PrivacyPolicy;
