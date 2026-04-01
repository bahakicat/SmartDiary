export const MOCK_HISTORY_KEY = 'emotion_analyzer_history';
export const THEME_KEY = 'emotion_analyzer_theme';
export const SETTINGS_KEY = 'emotion_analyzer_settings';
export const EVENTS_KEY = 'emotion_analyzer_events';

export const EMOTIONS = [
  { id: 'happy', label: 'Happy', color: '#FCD34D', icon: '😊' },
  { id: 'sad', label: 'Sad', color: '#60A5FA', icon: '😢' },
  { id: 'angry', label: 'Angry', color: '#F87171', icon: '😠' },
  { id: 'anxious', label: 'Anxious', color: '#A78BFA', icon: '😰' },
  { id: 'neutral', label: 'Neutral', color: '#94A3B8', icon: '😐' },
  { id: 'excited', label: 'Excited', color: '#F472B6', icon: '🤩' },
  { id: 'calm', label: 'Calm', color: '#34D399', icon: '😌' },
  { id: 'frustrated', label: 'Frustrated', color: '#FB923C', icon: '😤' },
];

export const EMOTION_COLORS: Record<string, string> = {
  happy: '#FCD34D',
  sad: '#60A5FA',
  angry: '#F87171',
  anxious: '#A78BFA',
  neutral: '#94A3B8',
  excited: '#F472B6',
  calm: '#34D399',
  frustrated: '#FB923C'
};

export const EMOTION_PLAYLISTS: Record<string, { title: string, url: string, image: string }[]> = {
  happy: [
    { title: "Upbeat Morning", url: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVf0193pI", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop" },
    { title: "Feel Good Indie", url: "https://open.spotify.com/playlist/37i9dQZF1DX2sUQPhEcWLS", image: "https://images.unsplash.com/photo-1514525253361-bee8718a340b?w=400&h=400&fit=crop" }
  ],
  sad: [
    { title: "Life Sucks", url: "https://open.spotify.com/playlist/37i9dQZF1DX3YSRY7vYv0n", image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=400&fit=crop" },
    { title: "Sad Songs", url: "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma59G6s", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop" }
  ],
  angry: [
    { title: "Rage Quit", url: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVf0193pI", image: "https://images.unsplash.com/photo-1516715667182-c515c11bb131?w=400&h=400&fit=crop" },
    { title: "Heavy Metal", url: "https://open.spotify.com/playlist/37i9dQZF1DX9q9o9o9o9o9", image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&h=400&fit=crop" }
  ],
  neutral: [
    { title: "Focus Flow", url: "https://open.spotify.com/playlist/37i9dQZF1DX8UebIWAUENT", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=400&fit=crop" }
  ],
  excited: [
    { title: "Party Hits", url: "https://open.spotify.com/playlist/37i9dQZF1DX8UebIWAUENT", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop" }
  ],
  anxious: [
    { title: "Calm Vibes", url: "https://open.spotify.com/playlist/37i9dQZF1DX8UebIWAUENT", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop" }
  ],
  calm: [
    { title: "Peaceful Piano", url: "https://open.spotify.com/playlist/37i9dQZF1DX4sW36Cj2m7T", image: "https://images.unsplash.com/photo-1520962922320-2038eebab146?w=400&h=400&fit=crop" }
  ],
  frustrated: [
    { title: "Release", url: "https://open.spotify.com/playlist/37i9dQZF1DX8UebIWAUENT", image: "https://images.unsplash.com/photo-1516715667182-c515c11bb131?w=400&h=400&fit=crop" }
  ]
};

export const PERSONAS = [
  { id: 'default', name: 'Standard', desc: 'Balanced and helpful' },
  { id: 'stoic', name: 'Stoic', desc: 'Calm and rational perspective' },
  { id: 'empathetic', name: 'Empathetic', desc: 'Warm and supportive' },
  { id: 'analytical', name: 'Analytical', desc: 'Data-driven and objective' },
];
