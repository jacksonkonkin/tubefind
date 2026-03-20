import {
  BookOpen,
  Gamepad2,
  Newspaper,
  Sparkles,
  Coffee,
  Search,
  Clock,
  Film,
  Mic,
  Eye,
  GraduationCap,
  MessageSquare,
  Clapperboard,
  Laugh,
  Library,
  Zap,
  Leaf,
  Shield,
  Gem,
  TrendingUp,
  CalendarDays,
  EyeOff,
  Crown,
  Heart,
  CircleDashed,
  Globe,
  Users,
  Radio,
} from 'lucide-react';

// ── Level 1: Mood / Intent ──
export const moodOptions = [
  {
    id: 'learn',
    label: 'Learn something new',
    description: 'Tutorials, explainers, how-tos',
    icon: BookOpen,
    neonColor: '#5b9cf5',
    glowColor: 'rgba(91, 156, 245, 0.3)',
  },
  {
    id: 'entertain',
    label: 'Be entertained',
    description: 'Comedy, gaming, stories, fun',
    icon: Gamepad2,
    neonColor: '#e879f9',
    glowColor: 'rgba(232, 121, 249, 0.3)',
  },
  {
    id: 'inform',
    label: 'Stay informed',
    description: 'News, analysis, current events',
    icon: Newspaper,
    neonColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.3)',
  },
  {
    id: 'inspire',
    label: 'Get inspired',
    description: 'Motivation, creativity, ideas',
    icon: Sparkles,
    neonColor: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.3)',
  },
  {
    id: 'chill',
    label: 'Background noise / chill',
    description: 'Ambient, music, lo-fi, ASMR',
    icon: Coffee,
    neonColor: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.3)',
  },
  {
    id: 'deep_dive',
    label: 'Deep dive into a topic',
    description: 'Long-form, comprehensive, detailed',
    icon: Search,
    neonColor: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.3)',
  },
];

// ── Level 2: Category / Domain ──
// Suggestions ranked by mood; user picks 1–3
export const categoryOptions = {
  learn: [
    'Technology', 'Science', 'History', 'Cooking', 'Finance',
    'Languages', 'Mathematics', 'Philosophy', 'Health', 'DIY & Crafts',
    'Music Theory', 'Photography',
  ],
  entertain: [
    'Gaming', 'Comedy', 'Movies & TV', 'Animation', 'Sports',
    'Music', 'Drama', 'Reality', 'Pranks', 'Variety',
    'True Crime', 'Pop Culture',
  ],
  inform: [
    'World News', 'Politics', 'Business', 'Technology', 'Science',
    'Economy', 'Climate', 'Health', 'Culture', 'Investigative',
    'Local News', 'Geopolitics',
  ],
  inspire: [
    'Entrepreneurship', 'Self-Improvement', 'Art & Design', 'Travel',
    'Fitness', 'Storytelling', 'Innovation', 'Nature', 'Leadership',
    'Creativity', 'Philanthropy', 'Mindfulness',
  ],
  chill: [
    'Lo-fi Music', 'Nature Sounds', 'ASMR', 'Ambient', 'Jazz',
    'Acoustic', 'Rain & Thunder', 'Meditation', 'Fireplace',
    'Ocean Waves', 'Study Beats', 'Café Vibes',
  ],
  deep_dive: [
    'Technology', 'Science', 'History', 'Philosophy', 'True Crime',
    'Economics', 'Psychology', 'Space', 'Biology', 'Geopolitics',
    'Architecture', 'Linguistics',
  ],
};

// ── Level 3: Format / Style ──
export const formatOptions = [
  { id: 'short', label: 'Short-form', description: 'Under 10 minutes', icon: Clock, neonColor: '#5b9cf5' },
  { id: 'long_form', label: 'Long-form deep dive', description: '30+ minutes', icon: Film, neonColor: '#e879f9' },
  { id: 'podcast', label: 'Podcast / conversation', description: 'Interview & chat style', icon: Mic, neonColor: '#fb923c' },
  { id: 'visual', label: 'Visual / cinematic', description: 'Beautiful cinematography', icon: Eye, neonColor: '#a78bfa' },
  { id: 'tutorial', label: 'Tutorial / step-by-step', description: 'Follow along & learn', icon: GraduationCap, neonColor: '#4ade80' },
  { id: 'commentary', label: 'Commentary / reaction', description: 'Opinions & analysis', icon: MessageSquare, neonColor: '#22d3ee' },
  { id: 'documentary', label: 'Documentary style', description: 'In-depth storytelling', icon: Clapperboard, neonColor: '#f472b6' },
];

// ── Level 4: Tone & Energy ──
export const toneOptions = [
  { id: 'casual', label: 'Casual / funny', description: 'Light-hearted and fun', icon: Laugh, neonColor: '#fbbf24' },
  { id: 'serious', label: 'Serious / academic', description: 'Rigorous and informative', icon: Library, neonColor: '#5b9cf5' },
  { id: 'hype', label: 'Hype / high-energy', description: 'Exciting and intense', icon: Zap, neonColor: '#f97316' },
  { id: 'calm', label: 'Calm / meditative', description: 'Peaceful and relaxed', icon: Leaf, neonColor: '#4ade80' },
  { id: 'raw', label: 'Raw / unfiltered', description: 'Authentic and unpolished', icon: Shield, neonColor: '#ef4444' },
  { id: 'polished', label: 'Polished / professional', description: 'High production value', icon: Gem, neonColor: '#a78bfa' },
];

// ── Level 5: Freshness & Popularity ──
export const freshnessOptions = [
  { id: 'trending', label: 'Trending right now', description: 'What everyone is watching', icon: TrendingUp, neonColor: '#f97316' },
  { id: 'this_week', label: 'Published this week', description: 'Fresh uploads only', icon: CalendarDays, neonColor: '#5b9cf5' },
  { id: 'hidden_gems', label: 'Hidden gems', description: 'Under 10K views', icon: EyeOff, neonColor: '#a78bfa' },
  { id: 'classics', label: 'All-time classics', description: 'High views, proven quality', icon: Crown, neonColor: '#fbbf24' },
  { id: 'liked_channels', label: 'From channels I\'ve liked', description: 'Based on your history', icon: Heart, neonColor: '#f472b6' },
  { id: 'no_preference', label: 'No preference', description: 'Show me everything', icon: CircleDashed, neonColor: '#6575ab' },
];

// ── Level 6: Creator Preferences ──
export const channelSizeOptions = [
  { id: 'indie', label: 'Indie creators', description: 'Under 100K subs' },
  { id: 'mid', label: 'Mid-size channels', description: '100K–1M subs' },
  { id: 'large', label: 'Large creators', description: '1M–10M subs' },
  { id: 'mega', label: 'Mega channels', description: '10M+ subs' },
  { id: 'any_size', label: 'Any size', description: 'No preference' },
];

export const languageOptions = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'hi', label: 'Hindi' },
  { id: 'zh', label: 'Chinese' },
  { id: 'any', label: 'Any language' },
];
