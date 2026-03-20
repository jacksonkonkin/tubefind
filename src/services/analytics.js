import { loadSessions } from './sessionHistory';
import { moodOptions, formatOptions, toneOptions, freshnessOptions } from '../data/filterOptions';

function findLabel(options, id) {
  const found = options.find((o) => o.id === id);
  return found ? found.label : id;
}

/**
 * Compute all analytics from session history.
 */
export function computeAnalytics() {
  const sessions = loadSessions();

  // ── Overview stats ──
  const totalSessions = sessions.length;
  const totalVideosViewed = sessions.reduce(
    (sum, s) => sum + (s.videos_viewed?.length || 0), 0
  );

  const allFeedback = sessions.flatMap((s) =>
    Object.entries(s.feedback || {}).map(([videoId, rating]) => ({
      videoId,
      rating,
      timestamp: s.timestamp,
    }))
  );
  const totalThumbsUp = allFeedback.filter((f) => f.rating === 'up').length;
  const totalThumbsDown = allFeedback.filter((f) => f.rating === 'down').length;
  const totalFeedback = totalThumbsUp + totalThumbsDown;

  // ── Filter preference breakdowns ──
  const moodCounts = {};
  const categoryCounts = {};
  const formatCounts = {};
  const toneCounts = {};
  const freshnessCounts = {};

  for (const session of sessions) {
    const s = session.selections;

    if (s.level_1) {
      const label = findLabel(moodOptions, s.level_1);
      moodCounts[label] = (moodCounts[label] || 0) + 1;
    }

    if (Array.isArray(s.level_2)) {
      for (const cat of s.level_2) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    }

    if (s.level_3) {
      const label = findLabel(formatOptions, s.level_3);
      formatCounts[label] = (formatCounts[label] || 0) + 1;
    }

    if (s.level_4) {
      const label = findLabel(toneOptions, s.level_4);
      toneCounts[label] = (toneCounts[label] || 0) + 1;
    }

    if (s.level_5) {
      const label = findLabel(freshnessOptions, s.level_5);
      freshnessCounts[label] = (freshnessCounts[label] || 0) + 1;
    }
  }

  // ── Feedback trend by day (last 14 days) ──
  const now = new Date();
  const dayBuckets = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayBuckets.push({ date: key, up: 0, down: 0 });
  }

  const bucketMap = Object.fromEntries(dayBuckets.map((b) => [b.date, b]));
  for (const fb of allFeedback) {
    const day = fb.timestamp?.slice(0, 10);
    if (day && bucketMap[day]) {
      if (fb.rating === 'up') bucketMap[day].up++;
      else if (fb.rating === 'down') bucketMap[day].down++;
    }
  }

  // ── Session activity by day (last 14 days) ──
  for (const session of sessions) {
    const day = session.timestamp?.slice(0, 10);
    if (day && bucketMap[day]) {
      bucketMap[day].sessions = (bucketMap[day].sessions || 0) + 1;
    }
  }

  return {
    overview: {
      totalSessions,
      totalVideosViewed,
      totalFeedback,
      totalThumbsUp,
      totalThumbsDown,
      thumbsUpRate: totalFeedback > 0 ? Math.round((totalThumbsUp / totalFeedback) * 100) : 0,
    },
    preferences: {
      moods: toSorted(moodCounts),
      categories: toSorted(categoryCounts),
      formats: toSorted(formatCounts),
      tones: toSorted(toneCounts),
      freshness: toSorted(freshnessCounts),
    },
    feedbackTrend: dayBuckets,
  };
}

/** Convert { label: count } to sorted array of { label, count } */
function toSorted(counts) {
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Export all session data as a JSON string.
 */
export function exportData() {
  const sessions = loadSessions();
  return JSON.stringify(sessions, null, 2);
}
