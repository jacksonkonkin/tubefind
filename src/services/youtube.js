const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Level 1 mood → search keyword prefixes
const moodKeywords = {
  learn: 'learn',
  entertain: '',
  inform: 'news analysis',
  inspire: 'motivational inspiring',
  chill: 'relaxing ambient',
  deep_dive: 'deep dive explained',
};

// Level 3 format → videoDuration + query modifier
const formatMapping = {
  short: { videoDuration: 'short', keyword: '' },
  long_form: { videoDuration: 'long', keyword: '' },
  podcast: { videoDuration: 'long', keyword: 'podcast' },
  visual: { videoDuration: 'medium', keyword: 'cinematic' },
  tutorial: { videoDuration: 'medium', keyword: 'tutorial' },
  commentary: { videoDuration: 'medium', keyword: 'commentary' },
  documentary: { videoDuration: 'long', keyword: 'documentary' },
};

// Level 4 tone → query modifier
const toneKeywords = {
  casual: 'funny casual',
  serious: 'educational academic',
  hype: 'hype exciting',
  calm: 'calm relaxing',
  raw: 'raw unfiltered',
  polished: 'professional high quality',
};

// Level 5 freshness → publishedAfter + order
function getFreshnessParams(freshness) {
  const now = new Date();
  switch (freshness) {
    case 'trending':
      return { order: 'viewCount', publishedAfter: daysAgo(now, 7) };
    case 'this_week':
      return { order: 'date', publishedAfter: daysAgo(now, 7) };
    case 'hidden_gems':
      return { order: 'relevance' }; // post-filter by view count
    case 'classics':
      return { order: 'viewCount' };
    case 'no_preference':
    default:
      return { order: 'relevance' };
  }
}

function daysAgo(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// Level 6 language mapping
const langMap = {
  en: 'en', es: 'es', fr: 'fr', de: 'de',
  ja: 'ja', ko: 'ko', pt: 'pt', hi: 'hi', zh: 'zh',
};

/**
 * Build the query string from filter selections.
 * If broad=true, only uses mood + categories (drops format/tone modifiers).
 */
function buildQuery(selections, { broad = false } = {}) {
  const parts = [];

  // Level 1: mood keywords
  const mood = moodKeywords[selections.level_1];
  if (mood) parts.push(mood);

  // Level 2: categories (up to 3)
  const categories = selections.level_2 || [];
  if (categories.length > 0) {
    parts.push(categories.join(' '));
  }

  if (!broad) {
    // Level 3: format keyword
    const format = formatMapping[selections.level_3];
    if (format?.keyword) parts.push(format.keyword);

    // Level 4: tone keyword (pick only the first word to avoid over-stuffing)
    const tone = toneKeywords[selections.level_4];
    if (tone) parts.push(tone.split(' ')[0]);
  }

  return parts.filter(Boolean).join(' ');
}

/**
 * Build YouTube Data API v3 search params from filter selections.
 */
function buildSearchParams(selections, { broad = false } = {}) {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: '12',
    key: API_KEY,
    q: buildQuery(selections, { broad }),
  });

  // Level 3: video duration
  const format = formatMapping[selections.level_3];
  if (format?.videoDuration) {
    params.set('videoDuration', format.videoDuration);
  }

  // Level 5: freshness / order
  const freshness = getFreshnessParams(selections.level_5);
  if (freshness.order) params.set('order', freshness.order);
  if (freshness.publishedAfter) params.set('publishedAfter', freshness.publishedAfter);

  // Level 6: language
  const lang = selections.level_6?.language;
  if (lang && lang !== 'any' && langMap[lang]) {
    params.set('relevanceLanguage', langMap[lang]);
  }

  return params;
}

/**
 * Fetch video statistics (viewCount, likeCount) for a list of video IDs.
 */
async function fetchVideoStats(videoIds) {
  if (videoIds.length === 0) return {};

  const params = new URLSearchParams({
    part: 'statistics',
    id: videoIds.join(','),
    key: API_KEY,
  });

  const res = await fetch(`${BASE_URL}/videos?${params}`);
  if (!res.ok) return {};

  const data = await res.json();
  const statsMap = {};
  for (const item of data.items || []) {
    statsMap[item.id] = item.statistics;
  }
  return statsMap;
}

/**
 * Fetch channel details (subscriberCount) for a list of channel IDs.
 */
async function fetchChannelDetails(channelIds) {
  if (channelIds.length === 0) return {};

  const unique = [...new Set(channelIds)];
  const params = new URLSearchParams({
    part: 'statistics',
    id: unique.join(','),
    key: API_KEY,
  });

  const res = await fetch(`${BASE_URL}/channels?${params}`);
  if (!res.ok) return {};

  const data = await res.json();
  const channelMap = {};
  for (const item of data.items || []) {
    channelMap[item.id] = {
      subscriberCount: parseInt(item.statistics.subscriberCount || '0', 10),
    };
  }
  return channelMap;
}

// Channel size filter ranges
const channelSizeRanges = {
  indie: [0, 100_000],
  mid: [100_000, 1_000_000],
  large: [1_000_000, 10_000_000],
  mega: [10_000_000, Infinity],
  any_size: [0, Infinity],
};

/**
 * Post-filter results by channel size and hidden gems view count.
 */
function applyPostFilters(videos, selections) {
  let filtered = [...videos];

  // Hidden gems: filter to under 10K views
  if (selections.level_5 === 'hidden_gems') {
    filtered = filtered.filter((v) => {
      const views = parseInt(v.statistics?.viewCount || '0', 10);
      return views < 10_000;
    });
  }

  // Channel size filter
  const size = selections.level_6?.channel_size;
  if (size && size !== 'any_size') {
    const [min, max] = channelSizeRanges[size] || [0, Infinity];
    filtered = filtered.filter((v) => {
      const subs = v.channel?.subscriberCount || 0;
      return subs >= min && subs < max;
    });
  }

  return filtered;
}

/**
 * Execute a single YouTube search API call.
 * When broad=true, uses a simpler query and drops date/duration filters.
 * Accepts an optional AbortSignal for cancellation.
 */
async function executeSearch(selections, { broad = false, signal } = {}) {
  const params = buildSearchParams(selections, { broad });

  // In broad mode, drop restrictive filters that can cause 0 results
  if (broad) {
    params.delete('videoDuration');
    params.delete('publishedAfter');
    params.set('order', 'relevance');
  }

  if (broad) console.log('[TubeFind] Broadened query:', params.get('q'));
  const res = await fetch(`${BASE_URL}/search?${params}`, { signal });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || `YouTube API error (${res.status})`);
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Main search function — called from the UI.
 * Returns an array of video objects with snippet, statistics, and channel info.
 * Accepts an optional AbortSignal for cancellation.
 */
export async function searchVideos(selections, { signal } = {}) {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || API_KEY === 'undefined') {
    throw new Error('YouTube API key not configured. Add your key to .env as VITE_YOUTUBE_API_KEY.');
  }

  let items = await executeSearch(selections, { broad: false, signal });

  // If no results, retry with a broader query (drop format/tone keywords + date filters)
  if (items.length === 0) {
    console.log('[TubeFind] No results — retrying with broader query');
    items = await executeSearch(selections, { broad: true, signal });
  }

  if (items.length === 0) return [];

  // Extract IDs for enrichment
  const videoIds = items.map((item) => item.id.videoId);
  const channelIds = items.map((item) => item.snippet.channelId);

  // Fetch stats and channel info in parallel
  const [statsMap, channelMap] = await Promise.all([
    fetchVideoStats(videoIds),
    fetchChannelDetails(channelIds),
  ]);

  // Decode HTML entities from YouTube API responses
  const txt = typeof document !== 'undefined' ? document.createElement('textarea') : null;
  const decode = (html) => {
    if (!txt) return html;
    txt.innerHTML = html;
    return txt.value;
  };

  // Merge everything into enriched video objects
  const videos = items.map((item) => ({
    id: item.id.videoId,
    title: decode(item.snippet.title),
    description: decode(item.snippet.description),
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
    statistics: statsMap[item.id.videoId] || {},
    channel: channelMap[item.snippet.channelId] || {},
  }));

  // Apply post-filters (hidden gems, channel size)
  // If post-filtering removes everything, fall back to unfiltered results
  const filtered = applyPostFilters(videos, selections);
  if (filtered.length < videos.length) {
    console.log(`[TubeFind] Post-filters: ${videos.length} → ${filtered.length}, showing all`);
  }
  return filtered.length > 0 ? filtered : videos;
}
