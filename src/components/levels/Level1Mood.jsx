import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useFilter } from '../../context/FilterContext';
import { moodOptions } from '../../data/filterOptions';
import { getSuggestion, getSessionCount, getQuickStart } from '../../services/sessionHistory';
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
  const navigate = useNavigate();
  const selected = selections.level_1;
  const [dismissed, setDismissed] = useState(false);

  const suggestion = useMemo(() => getSuggestion(1, selections), []);
  const sessionCount = useMemo(() => getSessionCount(), []);
  const quickStart = useMemo(() => getQuickStart(), []);

  const handleQuickStart = () => {
    if (!quickStart) return;
    const s = quickStart.selections;
    if (s.level_1) setSelection(1, s.level_1);
    if (s.level_2) setSelection(2, s.level_2);
    if (s.level_3) setSelection(3, s.level_3);
    if (s.level_4) setSelection(4, s.level_4);
    if (s.level_5) setSelection(5, s.level_5);
    if (s.level_6) setSelection(6, s.level_6);
    navigate('/results');
  };
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
      {quickStart && !selected && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex justify-center"
        >
          <button
            onClick={handleQuickStart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold
              bg-primary/15 border border-primary/30 text-primary-light
              hover:bg-primary/25 hover:border-primary/50
              transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            Quick Start — rerun your top filters
          </button>
        </motion.div>
      )}

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
