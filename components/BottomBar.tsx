import React from 'react';
import { motion } from 'framer-motion';
import { View } from '../types';
import { BellIcon, ScrollIcon, HandshakeIcon, ChatBubbleIcon, SettingsIcon, CameraIcon } from './icons';

interface BottomBarProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
    view: View;
    label: string;
    Icon: React.FC;
    activeView: View;
    onClick: (view: View) => void;
}> = ({ view, label, Icon, activeView, onClick }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => onClick(view)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
                isActive ? 'text-brand-sienna' : 'text-brand-charcoal/60 hover:text-brand-charcoal'
            }`}
        >
            <div className="relative">
                <Icon />
                {isActive && (
                    <motion.div
                        className="absolute -bottom-1 left-1/2 w-1 h-1 bg-brand-sienna rounded-full"
                        layoutId="active-dot"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                )}
            </div>
            <span className="text-xs mt-1">{label}</span>
        </button>
    );
};

const BottomBar: React.FC<BottomBarProps> = ({ activeView, setActiveView }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-brand-beige border-t border-brand-yellow/50 shadow-t-lg flex justify-around items-center z-20">
            <NavItem view="chat" label="Chat" Icon={ChatBubbleIcon} activeView={activeView} onClick={setActiveView} />
            <NavItem view="tip" label="Daily Tip" Icon={BellIcon} activeView={activeView} onClick={setActiveView} />
            <NavItem view="vision" label="Vision" Icon={CameraIcon} activeView={activeView} onClick={setActiveView} />
            <NavItem view="wisdom" label="Ayurveda" Icon={ScrollIcon} activeView={activeView} onClick={setActiveView} />
            <NavItem view="consult" label="Consult" Icon={HandshakeIcon} activeView={activeView} onClick={setActiveView} />
            <NavItem view="settings" label="Settings" Icon={SettingsIcon} activeView={activeView} onClick={setActiveView} />
        </nav>
    );
};

export default BottomBar;