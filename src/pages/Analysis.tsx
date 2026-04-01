import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Brain, 
  Music, 
  MessageSquare, 
  Lightbulb, 
  CheckCircle2,
  AlertCircle,
  Keyboard,
  ExternalLink,
  Wind,
  X,
  Activity,
  PlayCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { AnalysisResult, Emotion, VocalMetrics, AppSettings } from '../types';
import { EMOTION_COLORS, EMOTION_PLAYLISTS } from '../constants';
import { analyzeEntry } from '../services/geminiService';
import Button from '../components/Button';

interface AnalysisProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  settings: AppSettings;
}

const Analysis: React.FC<AnalysisProps> = ({ onAnalysisComplete, settings }) => {
  const { t, language } = useLanguage();
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setText(prev => prev + (prev ? " " : "") + event.results[i][0].transcript);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error !== 'aborted') {
          setError(`${t("analysis.error_voice")}: ${event.error}`);
          stopRecording();
        }
      };
    }
  }, [language]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setError("");
      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      setError(t("analysis.error_mic"));
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError(t("analysis.error_no_text"));
      return;
    }

    setIsAnalyzing(true);
    setError("");
    try {
      const analysisResult = await analyzeEntry(text, undefined, language, settings.persona);
      setResult(analysisResult);
      onAnalysisComplete(analysisResult);
    } catch (err) {
      setError(t("analysis.error_failed"));
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartData = result ? Object.entries(result.emotion_scores).map(([key, value]) => ({
    name: t(`emotions.${key}`),
    value: value * 100,
    color: EMOTION_COLORS[key] || '#94A3B8'
  })).sort((a, b) => b.value - a.value) : [];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:min-h-[calc(100vh-140px)] pb-24 lg:pb-0">
      {/* Input Section */}
      <div className="flex flex-col h-[60vh] lg:h-full gap-4">
        <div className="glass rounded-[2.5rem] flex-1 flex flex-col relative overflow-hidden border border-white/60 dark:border-white/10 shadow-xl transition-all">
          <div className="flex items-center justify-between px-6 py-4 bg-white/10 dark:bg-black/5 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="h-4 w-px bg-slate-200 mx-2" />
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Keyboard className="w-4 h-4" />
                {t("analysis.input_source")}
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("analysis.placeholder")}
              className="w-full h-full p-6 lg:p-10 bg-transparent text-lg lg:text-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none font-bold leading-relaxed"
            />
          </div>

          <div className="p-4 bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-b-[2.5rem] border-t border-white/20 flex flex-col sm:flex-row gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                isRecording 
                  ? "bg-red-500 text-white shadow-xl shadow-red-500/20" 
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-50"
              }`}
            >
              {isRecording ? (
                <>
                  <Activity className="w-5 h-5 animate-pulse" />
                  {t("analysis.stop_recording")}
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  {t("analysis.voice_input")}
                </>
              )}
            </button>
            <Button
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t("analysis.button")}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="flex flex-col h-full overflow-y-auto pr-1 pb-4 custom-scrollbar">
        {result ? (
          <div className="space-y-6 animate-fade-in">
            <div 
              className="p-10 rounded-[2.5rem] text-center text-white shadow-2xl relative overflow-hidden"
              style={{ backgroundColor: EMOTION_COLORS[result.primary_emotion] || '#6366f1' }}
            >
              <div className="absolute inset-0 bg-black/10" />
              <p className="relative z-10 text-xs font-bold uppercase tracking-widest opacity-80 mb-2">{t("analysis.detected_emotion")}</p>
              <h2 className="relative z-10 text-6xl font-black mb-6 capitalize">{t(`emotions.${result.primary_emotion}`)}</h2>
              <div className="relative z-10 inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full backdrop-blur-md border border-white/30 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                {(result.confidence * 100).toFixed(1)}% {t("analysis.confidence")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-lg flex flex-col">
                <div className="h-[400px] w-full relative">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                      <PieChart margin={{ top: 20, bottom: 20 }}>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="40%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '20px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '12px 16px'
                          }} 
                        />
                        <Legend 
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          layout="horizontal"
                          wrapperStyle={{ 
                            paddingTop: '40px',
                            bottom: 0
                          }}
                          formatter={(value) => <span className="text-slate-700 dark:text-slate-200 font-black text-[10px] uppercase tracking-wider">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass p-6 rounded-[2rem] flex items-center justify-between border border-white/40 dark:border-white/10 shadow-lg">
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("analysis.sentiment")}</span>
                    <span className={`block text-3xl font-black capitalize ${result.sentiment === 'positive' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t(`sentiment.${result.sentiment}`)}
                    </span>
                  </div>
                  <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <Activity className="w-8 h-8" />
                  </div>
                </div>
                
                {/* Spotify Playlist Widget */}
                {EMOTION_PLAYLISTS[result.primary_emotion] && (
                  <div className="glass p-5 rounded-[2rem] border border-white/40 dark:border-white/10 overflow-hidden relative group shadow-lg">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-black text-sm uppercase tracking-wide mb-3">
                      <Music className="w-4 h-4 text-green-500" />
                      <span>{t("analysis.recommended_music")}</span>
                    </div>
                    <div className="space-y-3">
                      {EMOTION_PLAYLISTS[result.primary_emotion].map((pl, idx) => (
                        <a 
                          key={idx} 
                          href={pl.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-800/40 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-slate-100 dark:border-white/5 group/item shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg group-hover/item:scale-110 transition-transform shrink-0 border-2 border-white/20">
                              <img 
                                src={pl.image} 
                                alt={pl.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <span className="block font-black text-sm text-slate-900 dark:text-white leading-tight">{pl.title}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spotify Playlist</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <span>Listen</span>
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border-l-8 border-indigo-500 shadow-xl border-white/40 dark:border-white/10">
              <div className="flex gap-5">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2 text-slate-900 dark:text-white">{t("analysis.advice_title")}</h4>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-bold italic">"{result.advice}"</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" onClick={() => setResult(null)} className="w-full text-slate-400">
              {t("analysis.start_new")}
            </Button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 glass rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700 group">
            <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Brain className="w-16 h-16 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">{t("analysis.ready_title")}</h3>
            <p className="text-slate-700 dark:text-slate-300 max-w-xs font-medium">{t("analysis.ready_desc")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
