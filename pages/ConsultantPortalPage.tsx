import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RasaLogo } from '../components/icons';
import { login, consultantSignup } from '../services/mockApi';
import { User, ConsultantProfile } from '../types';

interface ConsultantPortalPageProps {
    onLogin: (user: User) => void;
    onSwitchToUser: () => void;
}

const ConsultantPortalPage: React.FC<ConsultantPortalPageProps> = ({ onLogin, onSwitchToUser }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('consultant@example.com');
    const [password, setPassword] = useState('password123');
    const [profile, setProfile] = useState<ConsultantProfile>({
        qualifications: '',
        specialization: '',
        consultationFee: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = isLoginView 
                ? await login(email, password) 
                : await consultantSignup(email, password, name, profile);
            
            if (user.role !== 'consultant') {
                 throw new Error("This account is not a consultant account.");
            }
            onLogin(user);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cream p-4">
            <motion.div
                className="relative w-full max-w-md p-8 space-y-6 bg-brand-beige rounded-2xl shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="text-center">
                    <RasaLogo className="h-14 mx-auto" />
                    <h1 className="mt-2 text-3xl font-bold text-brand-charcoal">Consultant Portal</h1>
                    <p className="text-brand-charcoal">Access your consultant dashboard.</p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                     {!isLoginView && (
                         <div>
                            <label className="text-sm font-bold text-brand-charcoal block">Full Name</label>
                            <input name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., Dr. Anjali Sharma" required />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-bold text-brand-charcoal block">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" required />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-brand-charcoal block">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" required />
                    </div>
                    
                    {!isLoginView && (
                        <>
                             <div>
                                <label className="text-sm font-bold text-brand-charcoal block">Qualifications</label>
                                <input name="qualifications" value={profile.qualifications} onChange={handleProfileChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., B.A.M.S." required />
                            </div>
                             <div>
                                <label className="text-sm font-bold text-brand-charcoal block">Specialization</label>
                                <input name="specialization" value={profile.specialization} onChange={handleProfileChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., Panchakarma" required />
                            </div>
                             <div>
                                <label className="text-sm font-bold text-brand-charcoal block">Consultation Fee (USD)</label>
                                <input name="consultationFee" type="text" inputMode="numeric" value={profile.consultationFee} onChange={handleProfileChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., 50" required />
                            </div>
                        </>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-brand-teal-dark text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">
                        {isLoading ? 'Please wait...' : (isLoginView ? 'Login' : 'Sign Up as Consultant')}
                    </button>
                </form>
                <div className="text-center">
                    <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-brand-charcoal hover:underline">
                        {isLoginView ? 'Need a consultant account? Sign Up' : 'Already have an account? Login'}
                    </button>
                </div>
                <div className="text-center pt-2 border-t border-brand-yellow/30">
                    <button onClick={onSwitchToUser} className="text-sm text-brand-sienna hover:underline font-semibold">
                        Not a consultant? Go to user login
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ConsultantPortalPage;