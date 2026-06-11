import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            className="glass-card rounded-2xl border border-accent/10 overflow-hidden hover:border-secondary/25 transition-all duration-300"
          >
            {/* Header / Toggle Trigger */}
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-5 text-left font-display font-semibold text-white sm:text-lg hover:text-secondary focus-visible:outline-none focus-visible:bg-primary/10 transition-colors cursor-pointer"
              aria-expanded={isOpen}
              aria-controls={`faq-content-${item.id}`}
              id={`faq-btn-${item.id}`}
            >
              <span>{item.question}</span>
              <span className={`p-1.5 rounded-lg bg-primary/10 border border-accent/10 transition-transform duration-300 ${isOpen ? 'rotate-180 text-secondary' : 'text-accent'}`}>
                <ChevronDown className="w-5 h-5" />
              </span>
            </button>

            {/* Answer Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-content-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: 'auto', 
                    opacity: 1,
                    transition: { height: { duration: 0.3, ease: 'easeOut' }, opacity: { duration: 0.25, delay: 0.05 } }
                  }}
                  exit={{ 
                    height: 0, 
                    opacity: 0,
                    transition: { height: { duration: 0.25, ease: 'easeIn' }, opacity: { duration: 0.15 } }
                  }}
                >
                  <div className="p-5 pt-0 text-sm sm:text-base text-light/75 leading-relaxed border-t border-accent/5 bg-primary/5">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
