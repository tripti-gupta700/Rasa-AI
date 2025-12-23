import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe } from '../types';

interface RecipeAccordionProps {
    recipes: Recipe[];
}

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg 
        className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);


const RecipeAccordion: React.FC<RecipeAccordionProps> = ({ recipes }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleOpen = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-2">
            <h3 className="font-bold text-lg mb-2 text-brand-charcoal">Here are some recipes I found:</h3>
            {recipes.map((recipe, index) => (
                <div key={index} className="bg-cream/60 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleOpen(index)}
                        className="w-full flex justify-between items-center p-3 text-left font-semibold text-brand-brown"
                    >
                        <span>{recipe.name}</span>
                        <ChevronIcon isOpen={openIndex === index} />
                    </button>
                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 border-t border-brand-yellow/50 text-sm">
                                    <p className="italic mb-4 text-brand-charcoal/80">{recipe.description}</p>
                                    
                                    <h4 className="font-bold mb-2">Ingredients:</h4>
                                    <ul className="list-disc list-inside mb-4 space-y-1">
                                        {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                                    </ul>

                                    <h4 className="font-bold mb-2">Instructions:</h4>
                                    <ol className="list-decimal list-inside space-y-2">
                                        {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                                    </ol>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

export default RecipeAccordion;