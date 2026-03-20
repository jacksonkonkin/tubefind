import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Bookmark } from 'lucide-react';
import { savePreset } from '../services/sessionHistory';

export default function SavePresetDialog({ selections, onSave, onClose }) {
  const [name, setName] = useState('');
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, input, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    savePreset(trimmed, selections);
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Save filter set"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      {/* Dialog */}
      <motion.form
        ref={dialogRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-lg border border-border
          bg-surface-elevated p-5 z-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 text-text-muted hover:text-text-bright
            transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-4 h-4 text-primary-light" aria-hidden="true" />
          <h2 className="text-sm font-bold text-text-bright">Save filter set</h2>
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tech tutorials, Chill vibes..."
            maxLength={40}
            aria-label="Filter set name"
            className="w-full px-3 py-2.5 rounded-md text-sm bg-card border border-border
              text-text-bright placeholder:text-text-muted/50
              focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30
              transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted/50" aria-hidden="true">
            {name.length}/40
          </span>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-medium text-text-muted
              hover:text-text-bright border border-border hover:border-white/20
              transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 rounded-md text-xs font-bold
              bg-primary text-white hover:bg-primary-light
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
