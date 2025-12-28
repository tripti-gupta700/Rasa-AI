import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES } from '../constants';
import { MenuIcon, LogoutIcon, NewChatIcon, RasaLogo } from './icons';

interface HeaderProps {
    selectedLanguageName: string;
    onLanguageChange: (code: string, name: string) => void;
    onLogout: () => void;
    onNewChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ selectedLanguageName, onLanguageChange, onLogout, onNewChat }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangModalOpen, setIsLangModalOpen] = useState(false);
    
    return (
        <>
            <header className="flex-shrink-0 flex items-center justify-between p-4 bg-cream border-b border-brand-beige shadow-sm">
                <div className="flex items-center">
                    <RasaLogo className="h-10 w-auto" />
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsLangModalOpen(true)}
                        className="px-3 py-1.5 text-sm bg-brand-beige rounded-full text-brand-brown font-semibold hover:bg-opacity-80"
                    >
                        {selectedLanguageName}
                    </button>
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-black/10">
                            <MenuIcon />
                        </button>
                        <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-30"
                            >
                                <button onClick={() => { onNewChat(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                    <NewChatIcon /> <span className="ml-2">New Chat</span>
                                </button>
                                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
                                    <LogoutIcon /> <span className="ml-2">Logout</span>
                                </button>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Language Modal */}
            <AnimatePresence>
                {isLangModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsLangModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-brand-beige rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold p-4 border-b border-brand-yellow/50">Select Language</h3>
                            <div className="overflow-y-auto p-2">
                                {LANGUAGES.map(lang => (
                                    <label key={lang.name} className="flex items-center p-3 rounded-lg hover:bg-black/5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="language"
                                            value={lang.code}
                                            checked={selectedLanguageName === lang.name}
                                            onChange={() => {
                                                onLanguageChange(lang.code, lang.name);
                                                setIsLangModalOpen(false);
                                            }}
                                            className="h-5 w-5 text-brand-sienna focus:ring-brand-sienna border-brand-charcoal"
                                        />
                                        <span className="ml-3">{lang.name} <span className="text-sm opacity-70">({lang.localName})</span></span>
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;