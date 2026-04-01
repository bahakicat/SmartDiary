import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Heart, 
  MoreVertical, 
  Trash2, 
  Share2, 
  Download,
  ChevronRight,
  Smile,
  Frown,
  Meh,
  Zap,
  Tag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AnalysisResult, Emotion } from '../types';
import { EMOTION_COLORS } from '../constants';
import Button from '../components/Button';

interface JournalProps {
  history: AnalysisResult[];
  onToggleFavorite: (id: string) => void;
}

const Journal: React.FC<JournalProps> = ({ history, onToggleFavorite }) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEmotion, setFilterEmotion] = useState<Emotion | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      const matchesSearch = entry.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesEmotion = filterEmotion === 'all' || entry.primary_emotion === filterEmotion;
      const matchesFavorite = !showFavoritesOnly || entry.is_favorite;
      return matchesSearch && matchesEmotion && matchesFavorite;
    });
  }, [history, searchQuery, filterEmotion, showFavoritesOnly]);

  const stats = useMemo(() => {
    const total = history.length;
    const favorites = history.filter(h => h.is_favorite).length;
    const emotions = history.reduce((acc, h) => {
      acc[h.primary_emotion] = (acc[h.primary_emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, favorites, emotions };
  }, [history]);

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t("journal.title")}</h2>
          <p className="text-slate-500 font-medium mt-1">{stats.total} {t("journal.entries_count")}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t("journal.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`p-2.5 rounded-xl border transition-all ${showFavoritesOnly ? "bg-pink-50 border-pink-200 text-pink-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"}`}
          >
            <Heart className={`w-5 h-5 ${showFavoritesOnly ? "fill-pink-500" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-[2rem] border border-white/40 dark:border-white/10">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> {t("journal.filter_by")}
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setFilterEmotion('all')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold text-sm ${filterEmotion === 'all' ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300" : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"}`}
              >
                <span>{t("journal.all_emotions")}</span>
                <span className="bg-white/40 dark:bg-slate-800/20 px-2 py-0.5 rounded-full text-[10px]">{stats.total}</span>
              </button>
              {Object.keys(EMOTION_COLORS).map(emotion => (
                <button 
                  key={emotion}
                  onClick={() => setFilterEmotion(emotion as Emotion)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold text-sm ${filterEmotion === emotion ? "bg-white/40 dark:bg-slate-800/20 text-slate-900 dark:text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EMOTION_COLORS[emotion] }} />
                    <span className="capitalize">{t(`emotions.${emotion}`)}</span>
                  </div>
                  <span className="bg-white/40 dark:bg-slate-800/20 px-2 py-0.5 rounded-full text-[10px]">{stats.emotions[emotion] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-20 glass rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t("journal.no_results")}</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{t("journal.no_results_desc")}</p>
            </div>
          ) : (
            filteredHistory.map(entry => (
              <div key={entry.id} className="group glass rounded-[2rem] p-6 border border-white/40 dark:border-white/10 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: EMOTION_COLORS[entry.primary_emotion] }}
                    >
                      {entry.primary_emotion === 'happy' ? <Smile /> : entry.primary_emotion === 'sad' ? <Frown /> : <Meh />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white capitalize">{t(`emotions.${entry.primary_emotion}`)}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(entry.created_at).toLocaleDateString(language, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onToggleFavorite(entry.id)}
                      className={`p-2 rounded-xl transition-all ${entry.is_favorite ? "text-pink-500 bg-pink-50 dark:bg-pink-900/20" : "text-slate-300 hover:text-pink-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    >
                      <Heart className={`w-5 h-5 ${entry.is_favorite ? "fill-pink-500" : ""}`} />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-bold mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">
                  {entry.text}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/40 dark:bg-slate-800/20 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {entry.intensity * 100}% {t("journal.intensity")}
                    </div>
                    <div className="flex items-center gap-1">
                      <ChevronRight className="w-4 h-4" />
                      {t("journal.details")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
