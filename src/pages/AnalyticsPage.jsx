import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BarChart3, Eye, ThumbsUp, ThumbsDown,
  Hash, Download, Trash2, AlertTriangle,
} from 'lucide-react';
import { computeAnalytics, exportData } from '../services/analytics';
import { loadSessions } from '../services/sessionHistory';

// ── Reusable bar chart (CSS-only) ──

function BarChart({ data, color = '#3c6ef0', maxBars = 8 }) {
  if (data.length === 0) return <EmptyChart />;
  const items = data.slice(0, maxBars);
  const max = Math.max(...items.map((d) => d.count));

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-text-muted w-28 truncate text-right shrink-0">
            {item.label}
          </span>
          <div className="flex-1 h-6 bg-white/5 rounded overflow-hidden">
            <motion.div
              className="h-full rounded"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-semibold text-text-bright w-8 text-right">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="text-center py-6 text-text-muted text-xs">
      No data yet
    </div>
  );
}

// ── Feedback trend mini-chart (last 14 days) ──

function FeedbackTrend({ data }) {
  const hasData = data.some((d) => d.up > 0 || d.down > 0);
  if (!hasData) return <EmptyChart />;

  const max = Math.max(...data.map((d) => d.up + d.down), 1);

  return (
    <div className="flex items-end gap-1 h-28">
      {data.map((day) => {
        const total = day.up + day.down;
        const upPct = total > 0 ? (day.up / max) * 100 : 0;
        const downPct = total > 0 ? (day.down / max) * 100 : 0;
        const dateLabel = day.date.slice(5); // MM-DD

        return (
          <div
            key={day.date}
            className="flex-1 flex flex-col items-center gap-0.5 group"
            title={`${dateLabel}: ${day.up} up, ${day.down} down`}
          >
            <div className="w-full flex flex-col justify-end h-20">
              {upPct > 0 && (
                <motion.div
                  className="w-full rounded-t-sm bg-[#4ade80]"
                  initial={{ height: 0 }}
                  animate={{ height: `${upPct}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              )}
              {downPct > 0 && (
                <motion.div
                  className="w-full rounded-b-sm bg-[#ef4444]"
                  initial={{ height: 0 }}
                  animate={{ height: `${downPct}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              )}
              {total === 0 && (
                <div className="w-full h-px bg-white/10 mt-auto" />
              )}
            </div>
            <span className="text-[8px] text-text-muted/50 group-hover:text-text-muted transition-colors">
              {dateLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Stat card ──

function StatCard({ icon: Icon, label, value, sub, color = '#3c6ef0' }) {
  return (
    <motion.div
      className="glass-card rounded-lg p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} aria-hidden="true" />
        <span className="text-xs text-text-muted font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-text-bright">{value}</div>
      {sub && <div className="text-xs text-text-muted mt-1">{sub}</div>}
    </motion.div>
  );
}

// ── Section wrapper ──

function Section({ title, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <h2 className="text-sm font-bold text-text-bright mb-3">{title}</h2>
      <div className="glass-card rounded-lg p-4">
        {children}
      </div>
    </motion.section>
  );
}

// ── Confirm dialog ──

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Confirm clear history">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} aria-hidden="true" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-surface-elevated p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-[#ef4444]" aria-hidden="true" />
          <h2 className="text-sm font-bold text-text-bright">Clear all history?</h2>
        </div>
        <p className="text-xs text-text-muted mb-4">
          This will permanently delete all session history, feedback, and analytics data. Saved presets will not be affected.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-xs font-medium text-text-muted
              hover:text-text-bright border border-border hover:border-white/20
              transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-xs font-bold
              bg-[#ef4444] text-white hover:bg-[#dc2626]
              transition-colors cursor-pointer"
          >
            Clear history
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ──

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  const analytics = useMemo(() => computeAnalytics(), [cleared]);
  const { overview, preferences, feedbackTrend } = analytics;

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tubefind-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    localStorage.removeItem('tubefind_sessions');
    setShowConfirm(false);
    setCleared((c) => !c);
  };

  const isEmpty = overview.totalSessions === 0;

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="space-bg" />

      {/* Header */}
      <header className="w-full border-b border-border bg-surface-elevated/95 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              aria-label="Back to filters"
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-light
                transition-colors px-2 py-1.5 rounded-md hover:bg-card-hover cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </button>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-light" aria-hidden="true" />
              <span className="font-bold text-lg text-text-bright tracking-tight">Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={isEmpty}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-light
                transition-colors px-3 py-1.5 rounded-md hover:bg-card-hover cursor-pointer
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Export
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isEmpty}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-[#ef4444]
                transition-colors px-3 py-1.5 rounded-md hover:bg-card-hover cursor-pointer
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 relative z-10 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        {isEmpty ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BarChart3 className="w-12 h-12 text-text-muted" />
            <h2 className="text-lg font-bold text-text-bright">No data yet</h2>
            <p className="text-text-muted text-sm max-w-md">
              Complete a search to start seeing your analytics. Your usage patterns, preferences, and feedback will show up here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold
                bg-primary text-white hover:bg-primary-light transition-colors cursor-pointer"
            >
              Start searching
            </button>
          </motion.div>
        ) : (
          <>
            {/* Overview stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={Hash}
                label="Sessions"
                value={overview.totalSessions}
                color="#3c6ef0"
              />
              <StatCard
                icon={Eye}
                label="Videos viewed"
                value={overview.totalVideosViewed}
                color="#a78bfa"
              />
              <StatCard
                icon={ThumbsUp}
                label="Thumbs up"
                value={overview.totalThumbsUp}
                sub={overview.totalFeedback > 0 ? `${overview.thumbsUpRate}% positive` : undefined}
                color="#4ade80"
              />
              <StatCard
                icon={ThumbsDown}
                label="Thumbs down"
                value={overview.totalThumbsDown}
                color="#ef4444"
              />
            </div>

            {/* Filter preferences */}
            <Section title="Most used moods" delay={0.1}>
              <BarChart data={preferences.moods} color="#5b9cf5" />
            </Section>

            <Section title="Top categories" delay={0.15}>
              <BarChart data={preferences.categories} color="#e879f9" />
            </Section>

            <Section title="Preferred formats" delay={0.2}>
              <BarChart data={preferences.formats} color="#fb923c" />
            </Section>

            <Section title="Tone preferences" delay={0.25}>
              <BarChart data={preferences.tones} color="#a78bfa" />
            </Section>

            {/* Feedback trend */}
            <Section title="Feedback trend (last 14 days)" delay={0.3}>
              <FeedbackTrend data={feedbackTrend} />
              <div className="flex items-center gap-4 mt-3 text-[10px] text-text-muted">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-[#4ade80]" /> Thumbs up
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-[#ef4444]" /> Thumbs down
                </span>
              </div>
            </Section>
          </>
        )}
      </main>

      {/* Confirm clear dialog */}
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleClear}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
