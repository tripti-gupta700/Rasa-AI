import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, UserProfile, ConsultantProfile } from '../types';
import { updateUserProfile, updateConsultantProfile } from '../services/mockApi';
import { SettingsIcon, UserIcon, BriefcaseIcon, ChevronLeftIcon } from '../components/icons';

interface SettingsPageProps {
    user: User;
    onSwitchToConsultant?: () => void; // For user view
    onBack?: () => void; // For consultant view
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onSwitchToConsultant, onBack }) => {
    const [name, setName] = useState(user.name || '');
    const [userProfile, setUserProfile] = useState<UserProfile>(user.profile || {});
    const [consultantProfile, setConsultantProfile] = useState<ConsultantProfile>(
        user.consultantProfile || { qualifications: '', specialization: '', consultationFee: '' }
    );
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMessage('');
        const { name, value } = e.target;
        setUserProfile(prev => ({ ...prev, [name]: value }));
    };
    
    const handleConsultantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage('');
        const { name, value } = e.target;
        setConsultantProfile(prev => ({...prev, [name]: value}));
    }

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            await updateUserProfile(user.id, userProfile, name);
            setMessage('Profile updated successfully!');
            // Note: In a real app, you'd probably update the global user state here.
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };
    
    const handleConsultantSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            await updateConsultantProfile(user.id, consultantProfile, name);
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const isConsultant = user.role === 'consultant';

    return (
        <div className="h-full bg-cream p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                {onBack && (
                     <button onClick={onBack} className="mb-4 flex items-center text-sm font-semibold text-brand-sienna hover:underline">
                        <ChevronLeftIcon />
                        <span className="ml-1">Back to Dashboard</span>
                     </button>
                )}

                <div className="flex items-center text-brand-brown mb-6">
                    <SettingsIcon />
                    <h2 className="text-3xl font-bold ml-2">{isConsultant ? 'My Profile' : 'Settings'}</h2>
                </div>
                
                {user.role === 'user' ? (
                    // USER VIEW
                    <div className="bg-brand-beige p-6 rounded-2xl mb-6 shadow-md">
                        <h3 className="text-xl font-bold flex items-center mb-4"><UserIcon/> <span className="ml-2">My Health Profile</span></h3>
                        <form className="space-y-4" onSubmit={handleUserSubmit}>
                             <div>
                                <label htmlFor="name" className="text-sm font-bold text-brand-charcoal block">Full Name</label>
                                <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream"/>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="age" className="text-sm font-bold text-brand-charcoal block">Age</label>
                                    <input id="age" name="age" type="text" inputMode="numeric" value={userProfile.age || ''} onChange={handleUserChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream"/>
                                </div>
                                <div>
                                    <label htmlFor="height" className="text-sm font-bold text-brand-charcoal block">Height</label>
                                    <input id="height" name="height" type="text" value={userProfile.height || ''} onChange={handleUserChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., 175 cm"/>
                                </div>
                                <div>
                                    <label htmlFor="weight" className="text-sm font-bold text-brand-charcoal block">Weight</label>
                                    <input id="weight" name="weight" type="text" value={userProfile.weight || ''} onChange={handleUserChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., 70 kg"/>
                                </div>
                             </div>
                              <div>
                                <label htmlFor="bloodType" className="text-sm font-bold text-brand-charcoal block">Blood Type</label>
                                <input id="bloodType" name="bloodType" type="text" value={userProfile.bloodType || ''} onChange={handleUserChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream" placeholder="e.g., O+"/>
                            </div>
                            <div>
                                <label htmlFor="medicalHistory" className="text-sm font-bold text-brand-charcoal block">Medical Conditions</label>
                                <textarea id="medicalHistory" name="medicalHistory" value={userProfile.medicalHistory || ''} onChange={handleUserChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream min-h-[80px]"/>
                            </div>
                            <div>
                                <label htmlFor="foodAllergies" className="text-sm font-bold text-brand-charcoal block">Food Allergies</label>
                                <textarea id="foodAllergies" name="foodAllergies" value={userProfile.foodAllergies || ''} onChange={handleUserChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream min-h-[80px]"/>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <button type="submit" disabled={isLoading} className="py-2 px-5 bg-brand-sienna text-white font-semibold rounded-md hover:bg-opacity-90 disabled:bg-gray-400 transition-colors">
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                {message && <p className="text-sm text-brand-teal-dark font-semibold animate-pulse">{message}</p>}
                            </div>
                        </form>
                    </div>
                ) : (
                    // CONSULTANT VIEW
                    <div className="bg-brand-beige p-6 rounded-2xl mt-6 shadow-md">
                        <h3 className="text-xl font-bold flex items-center mb-4"><BriefcaseIcon/> <span className="ml-2">My Professional Info</span></h3>
                        <form className="space-y-4" onSubmit={handleConsultantSubmit}>
                            <div>
                                <label htmlFor="consultantName" className="text-sm font-bold text-brand-charcoal block">Full Name</label>
                                <input id="consultantName" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream"/>
                            </div>
                            <div>
                                <label htmlFor="qualifications" className="text-sm font-bold text-brand-charcoal block">Qualifications</label>
                                <input id="qualifications" name="qualifications" type="text" value={consultantProfile.qualifications} onChange={handleConsultantChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream"/>
                            </div>
                            <div>
                                <label htmlFor="specialization" className="text-sm font-bold text-brand-charcoal block">Specialization</label>
                                <input id="specialization" name="specialization" type="text" value={consultantProfile.specialization} onChange={handleConsultantChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream"/>
                            </div>
                            <div>
                                <label htmlFor="consultationFee" className="text-sm font-bold text-brand-charcoal block">Consultation Fee (USD)</label>
                                <input id="consultationFee" name="consultationFee" type="text" inputMode="numeric" value={consultantProfile.consultationFee} onChange={handleConsultantChange} className="w-full p-2 mt-1 border border-brand-yellow/50 rounded-md bg-cream"/>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <button type="submit" disabled={isLoading} className="py-2 px-5 bg-brand-sienna text-white font-semibold rounded-md hover:bg-opacity-90 disabled:bg-gray-400 transition-colors">
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                {message && <p className="text-sm text-brand-teal-dark font-semibold animate-pulse">{message}</p>}
                            </div>
                        </form>
                    </div>
                )}

                 {user.role === 'user' && onSwitchToConsultant && (
                     <div className="bg-brand-beige p-6 rounded-2xl mt-6 shadow-md">
                        <h3 className="text-xl font-bold mb-2">Account Actions</h3>
                         <button
                            onClick={onSwitchToConsultant}
                            className="text-sm text-brand-teal-dark hover:underline font-semibold"
                        >
                            Switch to Consultant Portal
                        </button>
                        <p className="text-xs text-brand-charcoal/70 mt-1">This will log you out of your current session.</p>
                    </div>
                 )}
            </motion.div>
        </div>
    );
};

export default SettingsPage;