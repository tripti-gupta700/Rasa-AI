import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RasaLogo } from '../components/icons';
import { login, signup } from '../services/mockApi';
import { User } from '../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
    onSwitchToConsultant: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToConsultant }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('user@example.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = isLoginView ? await login(email, password) : await signup(email, password, name);
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
                className="relative w-full max-w-sm p-8 space-y-6 bg-brand-beige rounded-2xl shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="text-center">
                    <RasaLogo className="h-16 mx-auto mb-4" />
                    <p className="text-brand-charcoal">Your Personal Ayurvedic Health Assistant</p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {!isLoginView && (
                        <div>
                            <label htmlFor="name" className="text-sm font-bold text-brand-charcoal block">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-cream"
                                placeholder="e.g., John Doe"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-brand-charcoal block">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-cream"
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-bold text-brand-charcoal block">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-cream"
                            placeholder="********"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-brand-sienna text-white font-semibold rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-sienna transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Please wait...' : (isLoginView ? 'Login' : 'Sign Up')}
                    </button>
                </form>
                <div className="text-center">
                    <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-brand-charcoal hover:underline">
                        {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                    </button>
                </div>
                 <div className="text-center pt-2 border-t border-brand-yellow/30">
                    <button onClick={onSwitchToConsultant} className="text-sm text-brand-teal-dark hover:underline font-semibold">
                        Are you a consultant? Login or Register here
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;