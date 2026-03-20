import { useFilter } from '../context/FilterContext';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ProgressBar() {
  const { currentLevel, levelCount, levelLabels, selections, goToLevel } = useFilter();

  const isLevelComplete = (level) => {
    const val = selections[`level_${level}`];
    if (val === null || val === undefined) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
  };

  const canNavigateTo = (level) => {
    if (level === 1) return true;
    for (let i = 1; i < level; i++) {
      if (!isLevelComplete(i)) return false;
    }
    return true;
  };

  return (
    <nav className="w-full px-4 py-6" aria-label="Filter progress">
      {/* Mobile: compact step indicator */}
      <div className="sm:hidden flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-muted" aria-live="polite">
          Step {Math.min(currentLevel, levelCount)} of {levelCount}
        </span>
        <span className="text-sm font-semibold text-primary-light">
          {currentLevel <= levelCount ? levelLabels[currentLevel - 1] : 'Review'}
        </span>
      </div>
      <div className="sm:hidden w-full bg-border rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
          initial={false}
          animate={{ width: `${(Math.min(currentLevel, levelCount) / levelCount) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Desktop: full step indicator */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-0 right-0 h-px bg-border" />
        <motion.div
          className="absolute top-4 left-0 h-px bg-gradient-to-r from-primary to-primary-light"
          style={{ boxShadow: '0 0 8px rgba(60, 110, 240, 0.5)' }}
          initial={false}
          animate={{
            width: `${((Math.min(currentLevel, levelCount) - 1) / (levelCount - 1)) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {Array.from({ length: levelCount }, (_, i) => {
          const level = i + 1;
          const complete = isLevelComplete(level);
          const active = currentLevel === level;
          const navigable = canNavigateTo(level);

          return (
            <button
              key={level}
              onClick={() => navigable && goToLevel(level)}
              disabled={!navigable}
              aria-label={`Step ${level}: ${levelLabels[i]}${complete ? ' (completed)' : active ? ' (current)' : ''}`}
              aria-current={active ? 'step' : undefined}
              className={`relative z-10 flex flex-col items-center gap-2 group
                ${navigable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  transition-all duration-200 border
                  ${complete
                    ? 'bg-primary border-primary text-white shadow-[0_0_12px_rgba(60,110,240,0.4)]'
                    : active
                      ? 'bg-primary/20 border-primary text-primary-light shadow-[0_0_12px_rgba(60,110,240,0.3)]'
                      : 'bg-surface-elevated border-border text-text-muted'
                  }
                  ${navigable && !active ? 'group-hover:border-primary/50' : ''}
                `}
                animate={active ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {complete ? <Check className="w-4 h-4" aria-hidden="true" /> : level}
              </motion.div>
              <span
                className={`text-[11px] font-medium max-w-[80px] text-center leading-tight
                  ${active ? 'text-primary-light' : complete ? 'text-text' : 'text-text-muted'}
                `}
              >
                {levelLabels[i]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
