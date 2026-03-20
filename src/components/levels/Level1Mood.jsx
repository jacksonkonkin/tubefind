import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFilter } from '../../context/FilterContext';
import { moodOptions } from '../../data/filterOptions';
import { getSuggestion, getSessionCount } from '../../services/sessionHistory';
import LevelShell from '../LevelShell';
import SuggestionBanner from '../SuggestionBanner';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' },
  }),
};

export default function Level1Mood() {
  const { selections, setSelection, nextLevel } = useFilter();
  const selected = selections.level_1;
  const [dismissed, setDismissed] = useState(false);

  const suggestion = useMemo(() => getSuggestion(1, selections), []);
  const sessionCount = useMemo(() => getSessionCount(), []);
  const showSuggestion = suggestion && !selected && !dismissed && sessionCount > 0;

  const suggestedOption = showSuggestion
    ? moodOptions.find((o) => o.id === suggestion)
    : null;

  const handleSelect = (id) => {
    setSelection(1, id);
    setTimeout(() => nextLevel(), 350);
  };

  const handleAccept = () => {
    if (suggestion) handleSelect(suggestion);
  };

  return (
    <LevelShell
      level={1}
      title="What are you in the mood for?"
      subtitle="Pick the vibe and we'll find the perfect videos"
    >
      {showSuggestion && suggestedOption && (
        <SuggestionBanner
          label={suggestedOption.label}
          onAccept={handleAccept}
          onChange={() => setDismissed(true)}
          sessionCount={sessionCount}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="radiogroup" aria-label="Select your mood">
        {moodOptions.map((option, i) => {
          const Icon = option.icon;
          const isSelected = selected === option.id;

          return (
            <motion.button
              key={option.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(option.id)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${option.label}: ${option.description}`}
              className="glass-card relative flex flex-col items-center gap-3 p-6 rounded-lg
                text-center cursor-pointer"
              style={{
                borderColor: isSelected ? option.neonColor : `${option.neonColor}30`,
                boxShadow: isSelected
                  ? `0 0 20px ${option.glowColor}, inset 0 0 20px ${option.glowColor}`
                  : `0 0 1px ${option.neonColor}20`,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = `${option.neonColor}66`;
                  e.currentTarget.style.boxShadow = `0 0 12px ${option.glowColor}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.boxShadow = '';
                }
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  color: option.neonColor,
                  backgroundColor: `${option.neonColor}15`,
                }}
              >
                <Icon className="w-6 h-6" aria-hidden="true" />
              </div>

              {/* Label */}
              <div className="font-semibold text-text-bright text-sm leading-tight">
                {option.label}
              </div>

              {/* Description */}
              <div className="text-text-muted text-xs leading-snug">
                {option.description}
              </div>

              {/* Selection glow ring */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    boxShadow: `0 0 24px ${option.glowColor}, inset 0 0 24px ${option.glowColor}`,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </LevelShell>
  );
}
