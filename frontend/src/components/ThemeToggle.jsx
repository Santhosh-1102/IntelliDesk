import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative p-2.5 rounded-2xl transition-all border ${
        isDark
          ? 'bg-slate-800/80 border-slate-700/80 text-amber-300 hover:text-amber-200 hover:bg-slate-800 shadow-sm shadow-amber-500/10'
          : 'bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm'
      } ${className}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        {isDark ? (
          <Sun className="w-4 h-4 fill-amber-300/20" />
        ) : (
          <Moon className="w-4 h-4 fill-slate-400/20" />
        )}
      </motion.div>
    </motion.button>
  );
}
