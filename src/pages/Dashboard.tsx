import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  PenLine, 
  TrendingUp, 
  Smile, 
  Trophy, 
  Flame, 
  Activity, 
  Lock,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AnalysisResult, AppSettings } from '../types';
import { EMOTION_COLORS } from '../constants';
import Button from '../components/Button';

interface DashboardProps {
  history: AnalysisResult[];
  settings: AppSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalEntries = history.length;
  
  const emotionCounts = history.reduce((acc, entry) => {
    acc[entry.primary_emotion] = (acc[entry.primary_emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotionKey = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const dominantEmotion = dominantEmotionKey ? t(`emotions.${dominantEmotionKey}`) : t("dashboard.no_data");

  const chartData = Object.keys(EMOTION_COLORS).map(emotion => ({
    name: t(`emotions.${emotion}`),
    count: emotionCounts[emotion] || 0,
    color: EMOTION_COLORS[emotion]
  }));

  const needsMoreData = history.length < 2;

  const streak = useMemo(() => {
    if (history.length === 0) return 0;
    const dates = new Set(history.map(h => new Date(h.created_at).toDateString()));
    const sortedDates = Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;
    
    let count = 0;
    let current = new Date();
    if (sortedDates[0] === yesterday) current.setDate(current.getDate() - 1);
    
    while (dates.has(current.toDateString())) {
      count++;
      current.setDate(current.getDate() - 1);
    }
    return count;
  }, [history]);

  const level = Math.floor(totalEntries / 5) + 1;
  const progress = (totalEntries % 5) / 5 * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-indigo-700 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white shadow-2xl shadow-indigo-500/25 group transition-all hover:shadow-indigo-500/40">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-white/10 rounded-full blur-[80px] md:blur-[100px] -mr-20 -mt-20 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-3 md:space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-bold tracking-wide shadow-sm">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="truncate text-white">{t("dashboard.engine_online")}</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight break-words text-white">
              {t("dashboard.welcome_back")}<br className="hidden md:block" />
              <span className="text-white">
                {user?.name.split(" ")[0]}
              </span>
            </h1>
            <p className="text-white text-sm md:text-lg font-bold leading-relaxed max-w-lg">
              {t("dashboard.ready_question")}
            </p>
          </div>
          <Button 
            onClick={() => navigate("/analysis")}
            variant="primary"
            className="w-full lg:w-auto bg-indigo-900 text-white hover:bg-indigo-950 border-0 shadow-2xl shadow-black/20 px-6 py-3 md:px-8 md:py-4 h-auto text-sm md:text-base rounded-2xl transition-all hover:scale-105 active:scale-95 font-bold whitespace-normal md:whitespace-nowrap"
          >
            <PenLine className="w-5 h-5 mr-2 shrink-0" />
            {t("dashboard.new_analysis")}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Entries Stat */}
            <div onClick={() => navigate("/journal")} className="glass p-6 rounded-[2rem] shadow-sm hover:shadow-lg cursor-pointer group border-white/40 dark:border-white/10 relative overflow-hidden transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${streak > 2 ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}>
                  {streak > 2 ? <Flame className="w-6 h-6 animate-pulse" /> : <Book className="w-6 h-6" />}
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/20 px-2 py-1 rounded-full uppercase">
                  {streak > 2 ? t("dashboard.streak") : t("dashboard.total")}
                </span>
              </div>
              <h3 className={`text-3xl font-black ${streak > 2 ? "text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-white"}`}>
                {streak > 2 ? `${streak} ${t("dashboard.days")}` : totalEntries}
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{streak > 2 ? t("dashboard.keep_it_up") : t("dashboard.total_entries")}</p>
            </div>

            {/* Mood Stat */}
            <div className="glass p-6 rounded-[2rem] shadow-sm hover:shadow-lg cursor-pointer group border-white/40 dark:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl">
                  <Smile className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/20 px-2 py-1 rounded-full uppercase">{t("dashboard.mood")}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize truncate">{dominantEmotion}</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("dashboard.dominant_mood")}</p>
            </div>

            {/* Level Stat */}
            <div onClick={() => navigate("/settings")} className="glass p-6 rounded-[2rem] shadow-sm hover:shadow-lg cursor-pointer group border-white/40 dark:border-white/10 relative overflow-hidden transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-2xl">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/20 px-2 py-1 rounded-full uppercase">{t("dashboard.level")}</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{level}</h3>
              <div className="w-full bg-slate-50/50 dark:bg-slate-800/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 flex justify-between">
                <span>{t("dashboard.level_label")} {level}</span>
                <span>{5 - (totalEntries % 5)} {t("dashboard.to_next")}</span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="glass p-6 md:p-8 rounded-[2rem] border-white/40 dark:border-white/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  {t("dashboard.distribution")}
                </h3>
              </div>
            </div>
            
            {needsMoreData ? (
              <div className="absolute inset-0 z-20 bg-white/20 dark:bg-slate-900/20 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
                <Lock className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-white">{t("dashboard.unlock_desc")}</p>
              </div>
            ) : null}

            <div className="h-64 w-full relative">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 8 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                  <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-[2rem] border-white/40 dark:border-white/10 h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              {t("dashboard.correlations")}
            </h3>
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 font-bold text-sm">
              {t("dashboard.correlations_desc")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
