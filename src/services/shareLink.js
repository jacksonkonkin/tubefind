/**
 * Encode filter selections into URL search params.
 */
export function encodeSelections(selections) {
  const params = new URLSearchParams();

  if (selections.level_1) params.set('mood', selections.level_1);
  if (selections.level_2?.length) params.set('cats', selections.level_2.join(','));
  if (selections.level_3) params.set('format', selections.level_3);
  if (selections.level_4) params.set('tone', selections.level_4);
  if (selections.level_5) params.set('fresh', selections.level_5);

  const l6 = selections.level_6;
  if (l6?.channel_size) params.set('size', l6.channel_size);
  if (l6?.language) params.set('lang', l6.language);

  return params.toString();
}

/**
 * Decode URL search params back into filter selections.
 * Returns null if no valid params found.
 */
export function decodeSelections(searchString) {
  const params = new URLSearchParams(searchString);

  const mood = params.get('mood');
  if (!mood) return null;

  const selections = {
    level_1: mood,
    level_2: params.get('cats')?.split(',').filter(Boolean) || [],
    level_3: params.get('format') || null,
    level_4: params.get('tone') || null,
    level_5: params.get('fresh') || null,
    level_6: {},
  };

  const size = params.get('size');
  const lang = params.get('lang');
  if (size) selections.level_6.channel_size = size;
  if (lang) selections.level_6.language = lang;

  return selections;
}

/**
 * Build a full shareable URL for the current selections.
 */
export function buildShareUrl(selections) {
  const encoded = encodeSelections(selections);
  return `${window.location.origin}/results?${encoded}`;
}
