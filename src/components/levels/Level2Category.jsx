import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFilter } from '../../context/FilterContext';
import { categoryOptions } from '../../data/filterOptions';
import { getSuggestion, getSessionCount } from '../../services/sessionHistory';
import LevelShell from '../LevelShell';
import SuggestionBanner from '../SuggestionBanner';
import { ChevronRight } from 'lucide-react';

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.03, duration: 0.25, ease: 'easeOut' },
  }),
};

// Rotating neon colors for chips
const chipColors = [
  '#5b9cf5', '#e879f9', '#fb923c', '#a78bfa', '#4ade80', '#22d3ee',
  '#f472b6', '#fbbf24', '#ef4444', '#38bdf8', '#818cf8', '#34d399',
];

export default function Level2Category() {
  const { selections, setSelection, nextLevel } = useFilter();
  const selected = selections.level_2 || [];
  const mood = selections.level_1;
  const [dismissed, setDismissed] = useState(false);

  const categories = categoryOptions[mood] || categoryOptions.learn;

  const suggestion = useMemo(() => getSuggestion(2, selections), [selections.level_1]);
  const sessionCount = useMemo(() => getSessionCount(), []);

  // Pre-select suggested categories if user hasn't made any selections yet
  const [preSelected, setPreSelected] = useState(false);
  useEffect(() => {
    if (suggestion && selected.length === 0 && !preSelected && !dismissed && sessionCount > 0) {
      // Only pre-select categories that exist in the current mood's list
      const valid = suggestion.filter((cat) => categories.includes(cat));
      if (valid.length > 0) {
        setSelection(2, valid);
        setPreSelected(true);
      }
    }
  }, [suggestion, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const showSuggestion = suggestion && preSelected && !dismissed && sessionCount > 0;

  const toggleCategory = (cat) => {
    setDismissed(true);
    const updated = selected.includes(cat)
      ? selected.filter((c) => c !== cat)
      : selected.length < 3
        ? [...selected, cat]
        : selected;
    setSelection(2, updated);
  };

  const canProceed = selected.length > 0;

  return (
    <LevelShell
      level={2}
      title="Pick your categories"
      subtitle={`Choose 1–3 topics${selected.length > 0 ? ` (${selected.length} selected)` : ''}`}
    >
      {showSuggestion && (
        <SuggestionBanner
          label={selected.join(', ')}
          onAccept={() => { setDismissed(true); nextLevel(); }}
          onChange={() => { setDismissed(true); }}
          sessionCount={sessionCount}
        />
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat, i) => {
          const isSelected = selected.includes(cat);
          const color = chipColors[i % chipColors.length];

          return (
            <motion.button
              key={cat}
              custom={i}
              variants={chipVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleCategory(cat)}
              className="px-4 py-2.5 rounded-md text-sm font-medium cursor-pointer
                transition-all duration-200 border"
              style={{
                borderColor: isSelected ? color : 'rgba(255,255,255,0.1)',
                backgroundColor: isSelected ? `${color}15` : 'rgba(255,255,255,0.04)',
                color: isSelected ? color : 'var(--color-text)',
                boxShadow: isSelected ? `0 0 12px ${color}30` : 'none',
              }}
            >
              {cat}
            </motion.button>
          );
        })}
      </div>

      {/* Continue button */}
      <motion.div
        className="flex justify-center mt-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: canProceed ? 1 : 0.3, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => canProceed && nextLevel()}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm
            transition-all duration-200 cursor-pointer
            bg-primary text-white hover:bg-primary-light
            disabled:opacity-40 disabled:cursor-not-allowed
            shadow-[0_0_16px_rgba(60,110,240,0.3)]"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </LevelShell>
  );
}
