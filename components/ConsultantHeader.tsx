import React from 'react';
import { RasaLogo, SettingsIcon, LogoutIcon } from './icons';

interface ConsultantHeaderProps {
    onGoToSettings: () => void;
    onLogout: () => void;
}

const ConsultantHeader: React.FC<ConsultantHeaderProps> = ({ onGoToSettings, onLogout }) => {
    return (
        <header className="flex-shrink-0 flex items-center justify-between p-4 bg-cream border-b border-brand-beige shadow-sm">
            <RasaLogo className="h-10 w-auto" />
            <div className="flex items-center space-x-4">
                <button
                    onClick={onGoToSettings}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-brand-beige rounded-full text-brand-brown font-semibold hover:bg-opacity-80 transition-colors"
                    aria-label="Open profile settings"
                >
                    <SettingsIcon />
                    <span>Profile Settings</span>
                </button>
                <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-brand-sienna rounded-full text-white font-semibold hover:bg-opacity-90 transition-colors"
                    aria-label="Logout"
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default ConsultantHeader;