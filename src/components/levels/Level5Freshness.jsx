import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFilter } from '../../context/FilterContext';
import { freshnessOptions } from '../../data/filterOptions';
import { getSuggestion, getSessionCount } from '../../services/sessionHistory';
import LevelShell from '../LevelShell';
import SuggestionBanner from '../SuggestionBanner';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: 'easeOut' },
  }),
};

export default function Level5Freshness() {
  const { selections, setSelection, nextLevel } = useFilter();
  const selected = selections.level_5;
  const [dismissed, setDismissed] = useState(false);

  const suggestion = useMemo(
    () => getSuggestion(5, selections),
    [selections.level_1, selections.level_2, selections.level_3, selections.level_4],
  );
  const sessionCount = useMemo(() => getSessionCount(), []);
  const showSuggestion = suggestion && !selected && !dismissed && sessionCount > 0;

  const suggestedOption = showSuggestion
    ? freshnessOptions.find((o) => o.id === suggestion)
    : null;

  const handleSelect = (id) => {
    setSelection(5, id);
    setTimeout(() => nextLevel(), 350);
  };

  const handleAccept = () => {
    if (suggestion) handleSelect(suggestion);
  };

  return (
    <LevelShell
      level={5}
      title="New or proven?"
      subtitle="Filter by freshness and popularity"
    >
      {showSuggestion && suggestedOption && (
        <SuggestionBanner
          label={suggestedOption.label}
          onAccept={handleAccept}
          onChange={() => setDismissed(true)}
          sessionCount={sessionCount}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {freshnessOptions.map((option, i) => {
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
              className="glass-card relative flex flex-col items-center gap-3 p-5 rounded-lg
                text-center cursor-pointer"
              style={{
                borderColor: isSelected ? option.neonColor : `${option.neonColor}25`,
                boxShadow: isSelected
                  ? `0 0 18px ${option.neonColor}40, inset 0 0 18px ${option.neonColor}15`
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = `${option.neonColor}50`;
                  e.currentTarget.style.boxShadow = `0 0 10px ${option.neonColor}25`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = `${option.neonColor}25`;
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center"
                style={{
                  color: option.neonColor,
                  backgroundColor: `${option.neonColor}12`,
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-text-bright text-sm">{option.label}</div>
              <div className="text-text-muted text-xs">{option.description}</div>
            </motion.button>
          );
        })}
      </div>
    </LevelShell>
  );
}
