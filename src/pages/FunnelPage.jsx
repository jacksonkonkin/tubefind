import { useFilter } from '../context/FilterContext';
import ProgressBar from '../components/ProgressBar';
import Level1Mood from '../components/levels/Level1Mood';
import Level2Category from '../components/levels/Level2Category';
import Level3Format from '../components/levels/Level3Format';
import Level4Tone from '../components/levels/Level4Tone';
import Level5Freshness from '../components/levels/Level5Freshness';
import Level6Creator from '../components/levels/Level6Creator';
import FilterSummary from '../components/FilterSummary';
import SavedPresets from '../components/SavedPresets';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { RotateCcw, BarChart3, Sun, Moon } from 'lucide-react';

function CurrentLevel() {
  const { currentLevel } = useFilter();

  switch (currentLevel) {
    case 1:
      return <Level1Mood />;
    case 2:
      return <Level2Category />;
    case 3:
      return <Level3Format />;
    case 4:
      return <Level4Tone />;
    case 5:
      return <Level5Freshness />;
    case 6:
      return <Level6Creator />;
    default:
      return <FilterSummary />;
  }
}

export default function FunnelPage() {
  const { reset, currentLevel } = useFilter();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Space background */}
      <div className="space-bg" />

      {/* Header */}
      <header className="w-full border-b border-border bg-surface-elevated/95 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-light" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-text-bright tracking-tight">TubeFind</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-1.5 rounded-md text-text-muted hover:text-primary-light
                transition-colors hover:bg-card-hover cursor-pointer"
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4" aria-hidden="true" />
                : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-light
                transition-colors px-3 py-1.5 rounded-md hover:bg-card-hover cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              Analytics
            </button>
            {currentLevel > 1 && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-light
                  transition-colors px-3 py-1.5 rounded-md hover:bg-card-hover cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Start over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress — hide on summary page */}
      {currentLevel <= 6 && (
        <div className="max-w-5xl mx-auto w-full relative z-10">
          <ProgressBar />
        </div>
      )}

      {/* Saved presets — show on Level 1 */}
      {currentLevel === 1 && <SavedPresets />}

      {/* Level content */}
      <main className="flex-1 flex items-start justify-center pb-12 pt-2 relative z-10">
        <CurrentLevel />
      </main>
    </div>
  );
}
