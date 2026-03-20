import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Play, Trash2 } from 'lucide-react';
import { useFilter } from '../context/FilterContext';
import { loadPresets, deletePreset } from '../services/sessionHistory';
import {
  moodOptions,
  formatOptions,
  toneOptions,
} from '../data/filterOptions';

function findLabel(options, id) {
  const found = options.find((o) => o.id === id);
  return found ? found.label : id;
}

export default function SavedPresets() {
  const [presets, setPresets] = useState(() => loadPresets());
  const { setSelection, goToLevel } = useFilter();
  const navigate = useNavigate();

  if (presets.length === 0) return null;

  const handleUse = (preset) => {
    const s = preset.selections;
    // Restore all selections
    if (s.level_1) setSelection(1, s.level_1);
    if (s.level_2) setSelection(2, s.level_2);
    if (s.level_3) setSelection(3, s.level_3);
    if (s.level_4) setSelection(4, s.level_4);
    if (s.level_5) setSelection(5, s.level_5);
    if (s.level_6) setSelection(6, s.level_6);
    // Go straight to results
    navigate('/results');
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deletePreset(id);
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Bookmark className="w-3.5 h-3.5 text-primary-light" aria-hidden="true" />
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Saved filter sets
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {presets.map((preset) => {
            const s = preset.selections;
            const summary = [
              findLabel(moodOptions, s.level_1),
              (s.level_2 || []).slice(0, 2).join(', '),
            ].filter(Boolean).join(' · ');

            return (
              <motion.button
                key={preset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleUse(preset)}
                aria-label={`Use preset: ${preset.name}`}
                className="group flex items-center gap-2 px-3.5 py-2.5 rounded-md text-left
                  border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40
                  transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 text-primary-light shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-bright truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-text-muted truncate max-w-[180px]">
                    {summary}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, preset.id)}
                  className="ml-1 p-1 rounded text-text-muted/0 group-hover:text-text-muted
                    hover:!text-[#ef4444] transition-colors cursor-pointer shrink-0"
                  aria-label={`Delete preset: ${preset.name}`}
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                </button>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
