import { motion } from 'framer-motion';
import { Sparkles, Check, Pencil } from 'lucide-react';

/**
 * Banner shown when the auto-fill system has a suggestion for the current level.
 * Props:
 *   label — human-readable description of the suggestion (e.g. "Long-form deep dive")
 *   onAccept — called when user accepts the suggestion
 *   onChange — called when user wants to pick manually (just hides the banner)
 *   sessionCount — number of past sessions informing the suggestion
 */
export default function SuggestionBanner({ label, onAccept, onChange, sessionCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-6 mx-auto max-w-md"
    >
      <div
        className="rounded-lg border px-4 py-3"
        style={{
          borderColor: 'rgba(74, 222, 128, 0.3)',
          background: 'rgba(74, 222, 128, 0.06)',
        }}
        role="status"
        aria-live="polite"
        aria-label={`Suggestion: ${label}`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#4ade80]" aria-hidden="true" />
          <span className="text-xs font-medium text-[#4ade80]">
            Based on your last {sessionCount} session{sessionCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Suggestion */}
        <p className="text-sm font-semibold text-text-bright mb-3 leading-snug">
          {label}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAccept}
            aria-label={`Accept suggestion: ${label}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold
              bg-[#4ade80] text-[#0b0e1a] hover:bg-[#22c55e]
              transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            Accept
          </button>
          <button
            onClick={onChange}
            aria-label="Dismiss suggestion and choose manually"
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium
              text-text-muted hover:text-text-bright border border-border hover:border-white/20
              transition-colors cursor-pointer"
          >
            <Pencil className="w-3 h-3" aria-hidden="true" />
            Change
          </button>
        </div>
      </div>
    </motion.div>
  );
}
