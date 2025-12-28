import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Consultation, Billing } from '../types';
import { getPatientsForConsultant, getConsultationHistory, getBillingHistory } from '../services/aiBackend';
import { BriefcaseIcon, UsersIcon, CalendarIcon, CurrencyDollarIcon } from '../components/icons';
import ConsultantHeader from '../components/ConsultantHeader';
import SettingsPage from './SettingsPage';

type ConsultantTab = 'patients' | 'consultations' | 'billing';
type DashboardView = 'dashboard' | 'settings';

// A small, reusable badge component for status indicators
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full";
    const statusClasses: { [key: string]: string } = {
        'Completed': 'bg-green-100 text-green-800',
        'Scheduled': 'bg-blue-100 text-blue-800',
        'Cancelled': 'bg-gray-200 text-gray-700',
        'Paid': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100'}`}>{status}</span>;
};

const TabButton: React.FC<{tab: ConsultantTab, label: string, Icon: React.FC, activeTab: ConsultantTab, onClick: (tab: ConsultantTab) => void}> = ({ tab, label, Icon, activeTab, onClick }) => (
     <button
        onClick={() => onClick(tab)}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            activeTab === tab 
            ? 'bg-brand-beige border-b-2 border-brand-sienna text-brand-sienna' 
            : 'text-brand-charcoal/70 hover:bg-brand-beige'
        }`}
    >
        <Icon />
        <span>{label}</span>
    </button>
);


const ConsultantDashboardPage: React.FC<{ user: User; onLogout: () => void; }> = ({ user, onLogout }) => {
    const [view, setView] = useState<DashboardView>('dashboard');
    const [activeTab, setActiveTab] = useState<ConsultantTab>('patients');
    
    const [patients, setPatients] = useState<User[]>([]);
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [billings, setBillings] = useState<Billing[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setIsFetchingData(true);
        Promise.all([
            getPatientsForConsultant(user.id),
            getConsultationHistory(user.id),
            getBillingHistory(user.id)
        ]).then(([patientData, consultationData, billingData]) => {
            setPatients(patientData);
            setConsultations(consultationData);
            setBillings(billingData);
        }).catch(err => {
            console.error("Failed to fetch consultant data:", err);
            setErrorMessage("Error fetching dashboard data.");
        }).finally(() => {
            setIsFetchingData(false);
        });
    }, [user.id]);
    
    const pageVariants = {
        initial: { opacity: 0, y: 10 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -10 },
    };

    const renderDashboardContent = () => {
        if (isFetchingData) {
            return (
                <div className="flex justify-center items-center h-48">
                    <div className="w-3 h-3 bg-brand-sienna rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-brand-sienna rounded-full animate-pulse [animation-delay:-0.15s] mx-2"></div>
                    <div className="w-3 h-3 bg-brand-sienna rounded-full animate-pulse"></div>
                </div>
            );
        }

        switch (activeTab) {
            case 'patients':
                 return (
                    <div className="space-y-4">
                        {patients.map(p => (
                            <div key={p.id} className="bg-cream/60 p-4 rounded-lg border border-brand-yellow/30">
                                <p className="font-bold text-brand-brown">{p.name} <span className="font-normal text-sm">({p.email})</span></p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm mt-2 text-brand-charcoal/90">
                                    <p><strong className="font-semibold">Age:</strong> {p.profile?.age || 'N/A'}</p>
                                    <p><strong className="font-semibold">Height:</strong> {p.profile?.height || 'N/A'}</p>
                                    <p><strong className="font-semibold">Weight:</strong> {p.profile?.weight || 'N/A'}</p>
                                    <p><strong className="font-semibold">Blood Type:</strong> {p.profile?.bloodType || 'N/A'}</p>
                                    <p className="col-span-2 md:col-span-4"><strong className="font-semibold">History:</strong> {p.profile?.medicalHistory || 'N/A'}</p>
                                    <p className="col-span-2 md:col-span-4"><strong className="font-semibold">Allergies:</strong> {p.profile?.foodAllergies || 'N/A'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'consultations':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-brand-yellow/50 text-brand-charcoal">
                                <tr>
                                    <th className="p-2">Patient</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consultations.map(c => (
                                    <tr key={c.id} className="border-b border-brand-yellow/20">
                                        <td className="p-2 font-medium">{c.patientName}</td>
                                        <td className="p-2">{new Date(c.date).toLocaleString()}</td>
                                        <td className="p-2"><StatusBadge status={c.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'billing':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-brand-yellow/50 text-brand-charcoal">
                                <tr>
                                    <th className="p-2">Patient</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Amount</th>
                                    <th className="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billings.map(b => (
                                    <tr key={b.id} className="border-b border-brand-yellow/20">
                                        <td className="p-2 font-medium">{b.patientName}</td>
                                        <td className="p-2">{new Date(b.date).toLocaleDateString()}</td>
                                        <td className="p-2">${b.amount.toFixed(2)}</td>
                                        <td className="p-2"><StatusBadge status={b.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default: return null;
        }
    };


    return (
        <div className="h-screen w-screen flex flex-col bg-cream text-brand-charcoal">
            <ConsultantHeader onGoToSettings={() => setView('settings')} onLogout={onLogout} />

            <main className="flex-grow overflow-y-auto">
                <AnimatePresence mode="wait">
                    {view === 'dashboard' ? (
                        <motion.div
                            key="dashboard"
                            initial="initial" animate="in" exit="out" variants={pageVariants}
                            className="max-w-6xl mx-auto w-full p-4 sm:p-6"
                        >
                            <h2 className="text-3xl font-bold ml-2 mb-6">Consultant Dashboard</h2>

                            <div className="bg-brand-beige p-6 rounded-2xl mb-6 shadow-md">
                                <h3 className="text-xl font-bold flex items-center mb-4"><BriefcaseIcon/> <span className="ml-2">My Consultant Profile</span></h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-brand-charcoal">
                                    <div><strong className="font-semibold">Name:</strong> {user.name}</div>
                                    <div><strong className="font-semibold">Email:</strong> {user.email}</div>
                                    <div><strong className="font-semibold">Qualifications:</strong> {user.consultantProfile?.qualifications}</div>
                                    <div><strong className="font-semibold">Specialization:</strong> {user.consultantProfile?.specialization}</div>
                                    <div><strong className="font-semibold">Fee:</strong> ${user.consultantProfile?.consultationFee} / session</div>
                                </div>
                            </div>
    
                            <div className="flex border-b border-brand-yellow/50 mb-4">
                               <TabButton tab="patients" label="My Patients" Icon={UsersIcon} activeTab={activeTab} onClick={setActiveTab} />
                               <TabButton tab="consultations" label="Consultations" Icon={CalendarIcon} activeTab={activeTab} onClick={setActiveTab} />
                               <TabButton tab="billing" label="Billing History" Icon={CurrencyDollarIcon} activeTab={activeTab} onClick={setActiveTab} />
                            </div>
    
                            <div className="bg-brand-beige p-4 sm:p-6 rounded-b-2xl rounded-r-2xl shadow-md min-h-[300px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {renderDashboardContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="settings"
                            initial="initial" animate="in" exit="out" variants={pageVariants}
                        >
                            <SettingsPage user={user} onBack={() => setView('dashboard')} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ConsultantDashboardPage;