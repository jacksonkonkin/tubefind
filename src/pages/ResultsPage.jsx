import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFilter } from '../context/FilterContext';
import { searchVideos } from '../services/youtube';
import {
  saveSession,
  trackVideoClick,
  trackVideoFeedback,
  getSessionFeedback,
} from '../services/sessionHistory';
import {
  ArrowLeft, ExternalLink, Eye, ThumbsUp, ThumbsDown,
  Loader2, SearchX, AlertTriangle, RotateCcw, RefreshCw,
  Bookmark, Check, BarChart3,
} from 'lucide-react';
import SavePresetDialog from '../components/SavePresetDialog';

function formatCount(num) {
  const n = parseInt(num, 10);
  if (isNaN(n)) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}yr ago`;
}

const videoCardVariants = {
  hidden: (i) => ({ opacity: 0, y: 16 }),
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

const VideoCard = memo(function VideoCard({ video, index, sessionId, feedback, onFeedback }) {
  const rating = feedback[video.id] || null;

  const handleClick = () => {
    if (sessionId) trackVideoClick(sessionId, video.id);
  };

  const handleFeedback = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle: clicking same rating removes it
    const newRating = rating === type ? null : type;
    onFeedback(video.id, newRating);
  };

  return (
    <motion.div
      className="glass-card rounded-lg overflow-hidden group"
      custom={index}
      variants={videoCardVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Thumbnail — links to YouTube */}
      <a
        href={`https://www.youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block"
      >
        <div className="relative aspect-video bg-surface-elevated overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
          </div>
        </div>
      </a>

      {/* Info + feedback */}
      <div className="p-3.5">
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block"
        >
          <h3 className="text-sm font-semibold text-text-bright line-clamp-2 leading-snug mb-1.5">
            {video.title}
          </h3>
          <p className="text-xs text-text-muted mb-2 truncate">
            {video.channelTitle}
          </p>
        </a>

        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-text-muted">
            {video.statistics?.viewCount && (
              <span className="flex items-center gap-1" aria-label={`${formatCount(video.statistics.viewCount)} views`}>
                <Eye className="w-3 h-3" aria-hidden="true" />
                {formatCount(video.statistics.viewCount)}
              </span>
            )}
            <span>{timeAgo(video.publishedAt)}</span>
          </div>

          {/* Feedback buttons */}
          <div className="flex items-center gap-1">
            <motion.button
              onClick={(e) => handleFeedback(e, 'up')}
              whileTap={{ scale: 1.3 }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                rating === 'up'
                  ? 'text-[#4ade80] bg-[#4ade80]/15'
                  : 'text-text-muted hover:text-[#4ade80] hover:bg-[#4ade80]/10'
              }`}
              aria-label={`Thumbs up${rating === 'up' ? ' (selected)' : ''}`}
              aria-pressed={rating === 'up'}
            >
              <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
            </motion.button>
            <motion.button
              onClick={(e) => handleFeedback(e, 'down')}
              whileTap={{ scale: 1.3 }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                rating === 'down'
                  ? 'text-[#ef4444] bg-[#ef4444]/15'
                  : 'text-text-muted hover:text-[#ef4444] hover:bg-[#ef4444]/10'
              }`}
              aria-label={`Thumbs down${rating === 'down' ? ' (selected)' : ''}`}
              aria-pressed={rating === 'down'}
            >
              <ThumbsDown className="w-3.5 h-3.5" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

function SkeletonCard() {
  return (
    <div className="glass-card rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-video bg-white/5" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2 mt-1" />
        <div className="flex items-center gap-3 mt-2">
          <div className="h-3 bg-white/5 rounded w-16" />
          <div className="h-3 bg-white/5 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite">
      <div className="flex items-center gap-2 mb-4">
        <Loader2 className="w-4 h-4 text-primary animate-spin" aria-hidden="true" />
        <p className="text-text-muted text-sm">Searching YouTube...</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6" role="status" aria-live="polite">
      <SearchX className="w-12 h-12 text-text-muted" aria-hidden="true" />
      <h2 className="text-lg font-bold text-text-bright">No videos found</h2>
      <p className="text-text-muted text-sm max-w-md">
        Your filters might be too specific. Try broadening your selections.
      </p>
      <button
        onClick={onBack}
        className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold
          bg-primary text-white hover:bg-primary-light transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Adjust filters
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6" role="alert">
      <AlertTriangle className="w-12 h-12 text-accent-light" aria-hidden="true" />
      <h2 className="text-lg font-bold text-text-bright">Something went wrong</h2>
      <p className="text-text-muted text-sm max-w-md">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold
          bg-primary text-white hover:bg-primary-light transition-colors cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}

export default function ResultsPage() {
  const { selections, reset } = useFilter();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saved, setSaved] = useState(false);
  const sessionIdRef = useRef(null);
  const abortRef = useRef(null);

  const fetchResults = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const results = await searchVideos(selections, { signal: controller.signal });
      setVideos(results);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [selections]);

  useEffect(() => {
    // Guard: redirect home if no selections made
    if (!selections.level_1) {
      navigate('/', { replace: true });
      return;
    }

    const id = saveSession(selections);
    sessionIdRef.current = id;
    if (id) setFeedback(getSessionFeedback(id));
    fetchResults();

    return () => abortRef.current?.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFeedback = useCallback((videoId, rating) => {
    if (!sessionIdRef.current) return;
    trackVideoFeedback(sessionIdRef.current, videoId, rating);
    setFeedback((prev) => {
      const next = { ...prev };
      if (rating === null) {
        delete next[videoId];
      } else {
        next[videoId] = rating;
      }
      return next;
    });
  }, []);

  const handleRefresh = () => fetchResults();

  const handleBack = () => navigate('/');
  const handleStartOver = () => {
    reset();
    navigate('/');
  };

  const handleSaved = () => {
    setSaved(true);
    setShowSaveDialog(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="space-bg" />

      {/* Header */}
      <header className="w-full border-b border-border bg-surface-elevated/95 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-light
                transition-colors px-2 py-1.5 rounded-md hover:bg-card-hover cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Filters
            </button>
            <div className="w-px h-5 bg-border" />
            <span className="font-bold text-lg text-text-bright tracking-tight">Results</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Save preset */}
            <button
              onClick={() => setShowSaveDialog(true)}
              className={`flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-md cursor-pointer ${
                saved
                  ? 'text-[#4ade80] bg-[#4ade80]/10'
                  : 'text-text-muted hover:text-primary-light hover:bg-card-hover'
              }`}
            >
              {saved ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />}
              {saved ? 'Saved' : 'Save'}
            </button>
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-light
                transition-colors px-3 py-1.5 rounded-md hover:bg-card-hover cursor-pointer
                disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </button>
            {/* Analytics */}
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-light
                transition-colors px-3 py-1.5 rounded-md hover:bg-card-hover cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              Analytics
            </button>
            {/* Start over */}
            <button
              onClick={handleStartOver}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-light
                transition-colors px-3 py-1.5 rounded-md hover:bg-card-hover cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Start over
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-4 py-6">
        {loading && <LoadingState />}
        {error && !loading && <ErrorState message={error} onRetry={fetchResults} />}
        {!loading && !error && videos.length === 0 && <EmptyState onBack={handleBack} />}
        {!loading && !error && videos.length > 0 && (
          <>
            <p className="text-text-muted text-sm mb-4" aria-live="polite">
              {videos.length} video{videos.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video, i) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  index={i}
                  sessionId={sessionIdRef.current}
                  feedback={feedback}
                  onFeedback={handleFeedback}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Save preset dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <SavePresetDialog
            selections={selections}
            onSave={handleSaved}
            onClose={() => setShowSaveDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
