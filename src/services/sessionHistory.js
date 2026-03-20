const STORAGE_KEY = 'tubefind_sessions';
const PRESETS_KEY = 'tubefind_presets';
const DECAY_HALF_LIFE_DAYS = 14;

// ── Session CRUD ──

export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // localStorage full — trim oldest sessions and retry
    if (sessions.length > 10) {
      sessions.splice(0, sessions.length - 10);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch {
        // Still full — give up silently
      }
    }
  }
}

/**
 * Save a completed funnel session. Returns the new session ID.
 */
export function saveSession(selections) {
  if (!selections.level_1 || !selections.level_2?.length) return null;

  const sessions = loadSessions();
  const id = crypto.randomUUID();
  sessions.push({
    id,
    timestamp: new Date().toISOString(),
    selections: structuredClone(selections),
    videos_viewed: [],
    feedback: {}, // { videoId: 'up' | 'down' }
    satisfaction: null,
  });
  writeSessions(sessions);
  return id;
}

/**
 * Get the most recent session ID.
 */
export function getLatestSessionId() {
  const sessions = loadSessions();
  return sessions.length > 0 ? sessions[sessions.length - 1].id : null;
}

// ── Engagement tracking ──

/**
 * Record that the user clicked/opened a video in a session.
 */
export function trackVideoClick(sessionId, videoId) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  if (!session.videos_viewed.includes(videoId)) {
    session.videos_viewed.push(videoId);
    writeSessions(sessions);
  }
}

/**
 * Record thumbs up/down feedback on a video.
 */
export function trackVideoFeedback(sessionId, videoId, rating) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  if (!session.feedback) session.feedback = {};
  session.feedback[videoId] = rating; // 'up' | 'down' | null
  writeSessions(sessions);
}

/**
 * Get feedback map for a session.
 */
export function getSessionFeedback(sessionId) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  return session?.feedback || {};
}

// ── Scoring ──

function recencyWeight(timestamp) {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const ageDays = ageMs / 86_400_000;
  return Math.pow(0.5, ageDays / DECAY_HALF_LIFE_DAYS);
}

/**
 * Engagement multiplier for a session.
 * Sessions where the user clicked videos or gave thumbs-up get boosted.
 * Sessions with only thumbs-down get penalized.
 */
function engagementWeight(session) {
  const clicks = (session.videos_viewed || []).length;
  const fb = session.feedback || {};
  const ups = Object.values(fb).filter((v) => v === 'up').length;
  const downs = Object.values(fb).filter((v) => v === 'down').length;

  // Base: 1.0 (no engagement data)
  // Each click adds 0.1, each up adds 0.3, each down subtracts 0.2
  let w = 1.0 + clicks * 0.1 + ups * 0.3 - downs * 0.2;
  return Math.max(0.1, w); // never fully zero out
}

/**
 * Get auto-fill suggestion for a given level based on session history.
 */
export function getSuggestion(level, currentSelections) {
  const sessions = loadSessions();
  if (sessions.length === 0) return null;

  const matching = sessions.filter((s) => {
    for (let l = 1; l < level; l++) {
      const key = `level_${l}`;
      const current = currentSelections[key];
      const stored = s.selections[key];

      if (current == null) continue;

      if (l === 2) {
        const curArr = Array.isArray(current) ? current : [];
        const storedArr = Array.isArray(stored) ? stored : [];
        if (curArr.length > 0 && storedArr.length > 0) {
          const overlap = curArr.some((c) => storedArr.includes(c));
          if (!overlap) return false;
        }
      } else if (l === 6) {
        continue;
      } else {
        if (current !== stored) return false;
      }
    }
    return true;
  });

  if (matching.length === 0) return null;

  const scores = {};
  for (const session of matching) {
    const value = session.selections[`level_${level}`];
    const weight = recencyWeight(session.timestamp) * engagementWeight(session);

    if (level === 2) {
      const arr = Array.isArray(value) ? value : [];
      for (const cat of arr) {
        scores[cat] = (scores[cat] || 0) + weight;
      }
    } else if (level === 6) {
      if (value && typeof value === 'object') {
        const sizeKey = `channel_size:${value.channel_size}`;
        const langKey = `language:${value.language}`;
        if (value.channel_size) scores[sizeKey] = (scores[sizeKey] || 0) + weight;
        if (value.language) scores[langKey] = (scores[langKey] || 0) + weight;
      }
    } else {
      if (value != null) {
        scores[value] = (scores[value] || 0) + weight;
      }
    }
  }

  if (Object.keys(scores).length === 0) return null;

  if (level === 2) {
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
    return sorted.length > 0 ? sorted : null;
  }

  if (level === 6) {
    const sizes = Object.entries(scores)
      .filter(([k]) => k.startsWith('channel_size:'))
      .sort((a, b) => b[1] - a[1]);
    const langs = Object.entries(scores)
      .filter(([k]) => k.startsWith('language:'))
      .sort((a, b) => b[1] - a[1]);

    const result = {};
    if (sizes.length > 0) result.channel_size = sizes[0][0].replace('channel_size:', '');
    if (langs.length > 0) result.language = langs[0][0].replace('language:', '');
    return Object.keys(result).length > 0 ? result : null;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

export function getSessionCount() {
  return loadSessions().length;
}

/**
 * Get the best "Quick Start" selections — the most common complete filter set,
 * weighted by recency and engagement.
 * Returns { selections, score } or null if no complete sessions exist.
 */
export function getQuickStart() {
  const sessions = loadSessions();
  // Only consider sessions with at least level_1 through level_5
  const complete = sessions.filter((s) => {
    const sel = s.selections;
    return sel.level_1 && sel.level_2?.length && sel.level_3 && sel.level_4 && sel.level_5;
  });
  if (complete.length === 0) return null;

  // Group by a fingerprint of levels 1-5
  const groups = {};
  for (const session of complete) {
    const sel = session.selections;
    const key = [
      sel.level_1,
      (sel.level_2 || []).slice().sort().join(','),
      sel.level_3,
      sel.level_4,
      sel.level_5,
    ].join('|');
    if (!groups[key]) groups[key] = { selections: sel, score: 0 };
    groups[key].score += recencyWeight(session.timestamp) * engagementWeight(session);
  }

  const best = Object.values(groups).sort((a, b) => b.score - a.score)[0];
  return best || null;
}

// ── Saved filter presets ──

export function loadPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePreset(name, selections) {
  const presets = loadPresets();
  presets.push({
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    selections: structuredClone(selections),
  });
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // localStorage full
  }
}

export function deletePreset(id) {
  const presets = loadPresets().filter((p) => p.id !== id);
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // localStorage full
  }
}
