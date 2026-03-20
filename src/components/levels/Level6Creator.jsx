import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFilter } from '../../context/FilterContext';
import { channelSizeOptions, languageOptions } from '../../data/filterOptions';
import { getSuggestion, getSessionCount } from '../../services/sessionHistory';
import LevelShell from '../LevelShell';
import SuggestionBanner from '../SuggestionBanner';
import { ChevronRight, Users, Globe } from 'lucide-react';

const chipColors = [
  '#22d3ee', '#5b9cf5', '#a78bfa', '#e879f9', '#fb923c',
];

export default function Level6Creator() {
  const { selections, setSelection, nextLevel } = useFilter();
  const prefs = selections.level_6 || {};
  const [dismissed, setDismissed] = useState(false);

  const selectedSize = prefs.channel_size || null;
  const selectedLang = prefs.language || null;

  const suggestion = useMemo(
    () => getSuggestion(6, selections),
    [selections.level_1, selections.level_2, selections.level_3, selections.level_4, selections.level_5],
  );
  const sessionCount = useMemo(() => getSessionCount(), []);

  // Pre-select suggested preferences
  const [preSelected, setPreSelected] = useState(false);
  useEffect(() => {
    if (suggestion && !selectedSize && !selectedLang && !preSelected && !dismissed && sessionCount > 0) {
      const newPrefs = {};
      if (suggestion.channel_size) newPrefs.channel_size = suggestion.channel_size;
      if (suggestion.language) newPrefs.language = suggestion.language;
      if (Object.keys(newPrefs).length > 0) {
        setSelection(6, newPrefs);
        setPreSelected(true);
      }
    }
  }, [suggestion]); // eslint-disable-line react-hooks/exhaustive-deps

  const showSuggestion = suggestion && preSelected && !dismissed && sessionCount > 0;

  const updatePref = (key, value) => {
    setDismissed(true);
    setSelection(6, { ...prefs, [key]: value });
  };

  const canProceed = selectedSize && selectedLang;

  const suggestionLabel = showSuggestion
    ? [
        suggestion.channel_size && channelSizeOptions.find((o) => o.id === suggestion.channel_size)?.label,
        suggestion.language && languageOptions.find((o) => o.id === suggestion.language)?.label,
      ].filter(Boolean).join(' · ')
    : '';

  return (
    <LevelShell
      level={6}
      title="Channel preferences"
      subtitle="Any creator preferences?"
    >
      {showSuggestion && suggestionLabel && (
        <SuggestionBanner
          label={suggestionLabel}
          onAccept={() => { setDismissed(true); nextLevel(); }}
          onChange={() => setDismissed(true)}
          sessionCount={sessionCount}
        />
      )}
      {/* Channel size */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary-light" />
          <h3 className="text-sm font-semibold text-text-bright">Channel size</h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {channelSizeOptions.map((opt, i) => {
            const isSelected = selectedSize === opt.id;
            const color = chipColors[i % chipColors.length];
            return (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updatePref('channel_size', opt.id)}
                className="px-4 py-2.5 rounded-md text-sm font-medium cursor-pointer
                  transition-all duration-200 border"
                style={{
                  borderColor: isSelected ? color : 'rgba(255,255,255,0.1)',
                  backgroundColor: isSelected ? `${color}15` : 'rgba(255,255,255,0.04)',
                  color: isSelected ? color : 'var(--color-text)',
                  boxShadow: isSelected ? `0 0 12px ${color}30` : 'none',
                }}
              >
                <div>{opt.label}</div>
                <div className="text-[11px] mt-0.5 opacity-60">{opt.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-primary-light" />
          <h3 className="text-sm font-semibold text-text-bright">Language</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((opt, i) => {
            const isSelected = selectedLang === opt.id;
            const color = chipColors[i % chipColors.length];
            return (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updatePref('language', opt.id)}
                className="px-3.5 py-2 rounded-md text-sm font-medium cursor-pointer
                  transition-all duration-200 border"
                style={{
                  borderColor: isSelected ? color : 'rgba(255,255,255,0.1)',
                  backgroundColor: isSelected ? `${color}15` : 'rgba(255,255,255,0.04)',
                  color: isSelected ? color : 'var(--color-text)',
                  boxShadow: isSelected ? `0 0 12px ${color}30` : 'none',
                }}
              >
                {opt.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Continue button */}
      <motion.div
        className="flex justify-center"
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
          Review filters
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </LevelShell>
  );
}
