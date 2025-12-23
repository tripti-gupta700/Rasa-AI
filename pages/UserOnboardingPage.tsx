import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, UserProfile } from '../types';
import { updateUserProfile } from '../services/mockApi';
import { RasaLogo } from '../components/icons';

interface UserOnboardingPageProps {
    user: User;
    onComplete: (user: User) => void;
}

const UserOnboardingPage: React.FC<UserOnboardingPageProps> = ({ user, onComplete }) => {
    const [name, setName] = useState(user.name || '');
    const [profile, setProfile] = useState<UserProfile>({
        age: '',
        medicalHistory: '',
        foodAllergies: '',
        height: '',
        weight: '',
        bloodType: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.age || !profile.medicalHistory || !name) {
            setError('Please fill in all the required fields to continue.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const updatedUser = await updateUserProfile(user.id, profile, name);
            onComplete(updatedUser);
        } catch (err: any) {
            setError(err.message || 'Failed to save profile.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cream p-4">
            <motion.div
                className="w-full max-w-lg p-8 space-y-6 bg-brand-beige rounded-2xl shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-center">
                    <RasaLogo className="h-16 mx-auto" />
                    <h1 className="text-3xl font-bold text-brand-charcoal mt-4">Personalize Your Experience</h1>
                    <p className="mt-2 text-brand-charcoal">This helps us provide tailored advice.</p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                     <div>
                        <label htmlFor="name" className="text-sm font-bold text-brand-charcoal block">Full Name *</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-cream"
                            placeholder="e.g., John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="age" className="text-sm font-bold text-brand-charcoal block">Age *</label>
                        <input
                            id="age"
                            name="age"
                            type="text"
                            inputMode="numeric"
                            value={profile.age}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-cream"
                            placeholder="e.g., 34"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="medicalHistory" className="text-sm font-bold text-brand-charcoal block">Existing Medical Conditions *</label>
                         <textarea
                            id="medicalHistory"
                            name="medicalHistory"
                            value={profile.medicalHistory}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-cream min-h-[80px]"
                            placeholder="e.g., Asthma, High blood pressure, or None"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="foodAllergies" className="text-sm font-bold text-brand-charcoal block">Food Allergies or Dietary Restrictions</label>
                         <textarea
                            id="foodAllergies"
                            name="foodAllergies"
                            value={profile.foodAllergies}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-cream min-h-[80px]"
                            placeholder="e.g., Peanuts, Gluten-free, or None"
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="height" className="text-sm font-bold text-brand-charcoal block">Height</label>
                            <input id="height" name="height" type="text" value={profile.height || ''} onChange={handleChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., 175 cm"/>
                        </div>
                        <div>
                            <label htmlFor="weight" className="text-sm font-bold text-brand-charcoal block">Weight</label>
                            <input id="weight" name="weight" type="text" value={profile.weight || ''} onChange={handleChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., 70 kg"/>
                        </div>
                        <div>
                            <label htmlFor="bloodType" className="text-sm font-bold text-brand-charcoal block">Blood Type</label>
                            <input id="bloodType" name="bloodType" type="text" value={profile.bloodType || ''} onChange={handleChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., O+"/>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-brand-sienna text-white font-semibold rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-sienna transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? 'Saving...' : 'Continue to App'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default UserOnboardingPage;