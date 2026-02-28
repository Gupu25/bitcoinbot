'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function InfoTooltip({ content, children }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="text-slate-400 hover:text-orange-400 transition-colors p-1"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {children || <HelpCircle className="w-4 h-4" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 shadow-xl">
              {content}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
