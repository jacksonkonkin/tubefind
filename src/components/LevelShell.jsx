import { motion, AnimatePresence } from 'framer-motion';
import { useFilter } from '../context/FilterContext';
import { ChevronLeft } from 'lucide-react';

const levelVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function LevelShell({ level, title, subtitle, children }) {
  const { currentLevel, prevLevel, levelCount } = useFilter();
  const direction = currentLevel >= level ? 1 : -1;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={level}
        custom={direction}
        variants={levelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full max-w-3xl mx-auto px-6"
        role="region"
        aria-label={`Step ${level} of ${levelCount}: ${title}`}
      >
        {level > 1 && (
          <button
            onClick={prevLevel}
            aria-label="Go back to previous step"
            className="flex items-center gap-1 text-text-muted hover:text-primary-light
              transition-colors mb-4 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </button>
        )}

        <div className="text-center mb-8">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-text-bright mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="text-text-muted text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {children}
      </motion.div>
    </AnimatePresence>
  );
}
