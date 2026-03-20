import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFilter } from '../context/FilterContext';
import {
  moodOptions,
  formatOptions,
  toneOptions,
  freshnessOptions,
  channelSizeOptions,
  languageOptions,
} from '../data/filterOptions';
import { Pencil, Rocket } from 'lucide-react';

function findLabel(options, id) {
  const found = options.find((o) => o.id === id);
  return found ? found.label : id;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3 },
  }),
};

const levelColors = [
  '#5b9cf5', '#e879f9', '#fb923c', '#a78bfa', '#4ade80', '#22d3ee',
];

export default function FilterSummary() {
  const { selections, goToLevel } = useFilter();
  const navigate = useNavigate();

  const summaryItems = [
    {
      level: 1,
      label: 'Mood',
      value: findLabel(moodOptions, selections.level_1),
    },
    {
      level: 2,
      label: 'Categories',
      value: (selections.level_2 || []).join(', ') || 'None selected',
    },
    {
      level: 3,
      label: 'Format',
      value: findLabel(formatOptions, selections.level_3),
    },
    {
      level: 4,
      label: 'Tone',
      value: findLabel(toneOptions, selections.level_4),
    },
    {
      level: 5,
      label: 'Freshness',
      value: findLabel(freshnessOptions, selections.level_5),
    },
    {
      level: 6,
      label: 'Creator',
      value: (() => {
        const prefs = selections.level_6 || {};
        const parts = [];
        if (prefs.channel_size) parts.push(findLabel(channelSizeOptions, prefs.channel_size));
        if (prefs.language) parts.push(findLabel(languageOptions, prefs.language));
        return parts.join(' · ') || 'None selected';
      })(),
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-text-bright mb-2">
          Your filter set
        </h1>
        <p className="text-text-muted text-sm sm:text-base">
          Review your selections — tap any to adjust
        </p>
      </motion.div>

      <div className="space-y-3 mb-8">
        {summaryItems.map((item, i) => {
          const color = levelColors[i];
          return (
            <motion.button
              key={item.level}
              custom={i}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.01 }}
              onClick={() => goToLevel(item.level)}
              className="glass-card w-full flex items-center justify-between p-4 rounded-lg
                cursor-pointer text-left group"
              style={{
                borderColor: `${color}30`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}60`;
                e.currentTarget.style.boxShadow = `0 0 10px ${color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${color}30`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {item.level}
                </span>
                <div className="min-w-0">
                  <div className="text-xs text-text-muted font-medium">{item.label}</div>
                  <div className="text-sm text-text-bright font-semibold truncate">
                    {item.value}
                  </div>
                </div>
              </div>
              <Pencil
                className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100
                  transition-opacity shrink-0"
              />
            </motion.button>
          );
        })}
      </div>

      {/* Find videos button */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <button
          onClick={() => navigate('/results')}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-md font-bold text-sm
            bg-primary text-white hover:bg-primary-light
            transition-all duration-200 cursor-pointer
            shadow-[0_0_24px_rgba(60,110,240,0.4)]"
        >
          <Rocket className="w-4 h-4" />
          Find videos
        </button>
      </motion.div>
    </div>
  );
}
