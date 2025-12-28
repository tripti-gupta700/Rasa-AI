import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import UserOnboardingPage from './pages/UserOnboardingPage';
import ConsultantPortalPage from './pages/ConsultantPortalPage';
import ConsultantDashboardPage from './pages/ConsultantDashboardPage';
import { User } from './/types';
import { RasaIcon } from './components/icons';

const AUTH_KEY = 'rasa_ai_user';

type AppState = 'loading' | 'login' | 'onboarding' | 'main' | 'consultant_portal' | 'consultant_dashboard';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [appState, setAppState] = useState<AppState>('loading');

    useEffect(() => {
        const storedUser = sessionStorage.getItem(AUTH_KEY);
        if (storedUser) {
            try {
                const user: User = JSON.parse(storedUser);
                setCurrentUser(user);
                if (user.role === 'consultant') {
                    setAppState('consultant_dashboard');
                } else if (!user.profile?.age || !user.profile?.medicalHistory) {
                    setAppState('onboarding');
                } else {
                    setAppState('main');
                }
            } catch (error) {
                console.error("Failed to parse user from session storage", error);
                sessionStorage.removeItem(AUTH_KEY);
                setAppState('login');
            }
        } else {
            setAppState('login');
        }
    }, []);

    const handleLogin = (user: User) => {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
        setCurrentUser(user);
        if (user.role === 'consultant') {
            setAppState('consultant_dashboard');
        } else if (!user.profile?.age || !user.profile?.medicalHistory) {
            setAppState('onboarding');
        } else {
            setAppState('main');
        }
    };
    
    const handleOnboardingComplete = (user: User) => {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
        setCurrentUser(user);
        setAppState('main');
    };

    const handleLogout = () => {
        sessionStorage.removeItem(AUTH_KEY);
        setCurrentUser(null);
        setAppState('login');
    };
    
    const renderContent = () => {
        switch (appState) {
            case 'loading':
                return (
                    <div className="h-screen w-screen flex flex-col items-center justify-center bg-cream">
                        <RasaIcon className="h-24 w-24 animate-pulse text-brand-teal" />
                        <p className="mt-4 text-brand-charcoal">Loading Rasa AI...</p>
                    </div>
                );
            case 'login':
                return <LoginPage onLogin={handleLogin} onSwitchToConsultant={() => setAppState('consultant_portal')} />;
            case 'consultant_portal':
                return <ConsultantPortalPage onLogin={handleLogin} onSwitchToUser={() => setAppState('login')} />;
            case 'onboarding':
                return <UserOnboardingPage user={currentUser!} onComplete={handleOnboardingComplete} />;
            case 'main':
                return <MainPage user={currentUser!} onLogout={handleLogout} onSwitchToConsultant={() => { handleLogout(); setAppState('consultant_portal'); }} />;
            case 'consultant_dashboard':
                 return <ConsultantDashboardPage user={currentUser!} onLogout={handleLogout} />;
            default:
                return <LoginPage onLogin={handleLogin} onSwitchToConsultant={() => setAppState('consultant_portal')} />;
        }
    };
    
    return <>{renderContent()}</>;
};

export default App;