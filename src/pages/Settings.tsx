import React, { useState, useRef, useMemo } from 'react';
import { 
  User as UserIcon, 
  Globe, 
  Shield, 
  Database, 
  Trash2, 
  Download, 
  Upload, 
  Smartphone, 
  Trophy, 
  Flame, 
  Calendar,
  Plus,
  X,
  Check,
  Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AnalysisResult, AppSettings, CalendarEvent, User } from '../types';
import { PERSONAS } from '../constants';
import Button from '../components/Button';
import PinLock from '../components/PinLock';

interface SettingsProps {
  history: AnalysisResult[];
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ history, events, setEvents, settings, setSettings }) => {
  const { user, updateUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);

  const handleSaveProfile = async () => {
    if (user) {
      setIsSaving(true);
      try {
        updateUser({ ...user, name });
        setIsEditingProfile(false);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleClearData = () => {
    localStorage.removeItem('emotion_analyzer_history');
    window.location.reload();
  };

  const handleExport = () => {
    const data = {
      user,
      history,
      events,
      settings,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartjournal_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (user && event.target?.result) {
        updateUser({ ...user, avatar: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    if (user) {
      const { avatar, ...userWithoutAvatar } = user;
      updateUser(userWithoutAvatar as User);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.history) {
          localStorage.setItem('emotion_analyzer_history', JSON.stringify(data.history));
          window.location.reload();
        }
      } catch (err) {
        alert(t("settings.import_failed"));
      }
    };
    reader.readAsText(file);
  };

  const handleAddEvent = () => {
    if (newEventTitle && newEventDate) {
      setEvents([...events, {
        id: Date.now().toString(),
        title: newEventTitle,
        date: newEventDate,
        type: 'other'
      }]);
      setNewEventTitle("");
      setNewEventDate("");
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

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

  const achievements = [
    { id: 'pioneer', title: t("achievements.pioneer"), desc: t("achievements.pioneer_desc"), target: 1, current: history.length, unlocked: history.length >= 1, icon: Trophy, color: 'amber' },
    { id: 'streak_7', title: t("achievements.streak_7"), desc: t("achievements.streak_desc"), target: 7, current: streak, unlocked: streak >= 7, icon: Flame, color: 'orange' },
    { id: 'entry_30', title: t("achievements.entry_30"), desc: t("achievements.entry_30_desc"), target: 30, current: history.length, unlocked: history.length >= 30, icon: Trophy, color: 'indigo' },
    { id: 'entry_100', title: t("achievements.entry_100"), desc: t("achievements.entry_100_desc"), target: 100, current: history.length, unlocked: history.length >= 100, icon: Trophy, color: 'emerald' },
  ];

  const appIcons = [
    { id: 'default', color: 'bg-indigo-500' },
    { id: 'neon', color: 'bg-fuchsia-500' },
    { id: 'classic', color: 'bg-slate-800' },
    { id: 'nature', color: 'bg-emerald-500' },
    { id: 'ocean', color: 'bg-blue-500' },
    { id: 'sunset', color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-10 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">{t("settings.title")}</h2>
        <div className="flex p-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl overflow-x-auto custom-scrollbar border border-white/20 dark:border-white/5">
          {[
            { id: 'general', label: "settings.title", icon: UserIcon },
            { id: 'achievements', label: "achievements.title", icon: Trophy },
            { id: 'calendar', label: "calendar.title", icon: Calendar },
            { id: 'security', label: "settings.privacy", icon: Shield },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-700/30"}`}
            >
              <tab.icon className="w-4 h-4" />
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === "general" && (
          <div className="space-y-6">
            <section className="glass rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-white/40 dark:border-white/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  {t("settings.account_info")}
                </h3>
                {!isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline">{t("settings.edit")}</button>
                )}
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-slate-400" />
                      )}
                    </div>
                    {user?.avatar ? (
                      <button 
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-red-500 hover:text-red-600 transition-all"
                        title={t("settings.remove_avatar")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={handleAvatarClick}
                        className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={avatarInputRef} 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">{user?.name || t("settings.user_name")}</h4>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{user?.email || t("settings.no_email")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("settings.full_name")}</label>
                    {isEditingProfile ? (
                      <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 p-3 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 font-bold outline-none focus:border-indigo-500 transition-all"
                      />
                    ) : (
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{user?.name}</div>
                    )}
                  </div>
                  {isEditingProfile && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveProfile} isLoading={isSaving} className="px-6">{t("common.save")}</Button>
                      <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className="text-slate-500">{t("common.cancel")}</Button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="glass rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-white/40 dark:border-white/10 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">{t("settings.language")}</span>
                </div>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl font-black text-indigo-600 dark:text-indigo-400 outline-none border-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="kk">Қазақша</option>
                </select>
              </div>

              <div className="pt-8 border-t border-slate-200 dark:border-white/5">
                <h4 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Brain className="w-5 h-5" />
                  </div>
                  {t("settings.ai_persona")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PERSONAS.map(persona => (
                    <button 
                      key={persona.id}
                      onClick={() => updateSetting('persona', persona.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${settings?.persona === persona.id ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white/40 dark:bg-slate-900/40"}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-slate-900 dark:text-white">{t(`settings.persona_${persona.id}`)}</span>
                        {settings?.persona === persona.id && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t(`settings.persona_${persona.id}_desc`)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200 dark:border-white/5">
                <h4 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  {t("settings.app_icon")}
                </h4>
                <div className="flex gap-5 overflow-x-auto pb-10 pt-6 scrollbar-hide px-6 -mx-2">
                  {appIcons.map(icon => (
                    <button 
                      key={icon.id}
                      onClick={() => updateSetting('appIconId', icon.id)}
                      className={`w-12 h-12 min-w-[3rem] rounded-2xl ${icon.color} shadow-lg transition-all hover:scale-110 flex items-center justify-center relative group ${settings?.appIconId === icon.id ? "ring-2 ring-offset-4 ring-indigo-500 dark:ring-offset-slate-900 scale-105" : "opacity-80 hover:opacity-100"}`}
                    >
                      {settings?.appIconId === icon.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md z-10">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="w-full h-full rounded-2xl flex items-center justify-center bg-black/5 group-hover:bg-transparent transition-all">
                        <Smartphone className="w-5 h-5 text-white/80" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="glass rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-white/40 dark:border-white/10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                {t("settings.data_management")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={handleExport} className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white/40 dark:bg-slate-900/40 transition-all group shadow-sm hover:shadow-md">
                  <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Download className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-white">{t("settings.export_data")}</h4>
                  <p className="text-xs font-bold text-slate-400 text-center mt-2 max-w-[150px]">{t("settings.export_desc")}</p>
                </button>
                <button onClick={handleImportClick} className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white/40 dark:bg-slate-900/40 transition-all group shadow-sm hover:shadow-md">
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-white">{t("settings.import_data")}</h4>
                  <p className="text-xs font-bold text-slate-400 text-center mt-2 max-w-[150px]">{t("settings.import_desc")}</p>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".json" />
              </div>
            </section>

            <section className="bg-red-500/10 dark:bg-red-900/20 rounded-[2.5rem] p-6 md:p-8 border-2 border-red-500/20 shadow-lg">
              <h3 className="text-xl font-black text-red-600 dark:text-red-400 mb-2">{t("settings.danger_zone")}</h3>
              <p className="text-sm font-bold text-red-500/70 mb-6">{t("settings.danger_zone_desc")}</p>
              {showClearConfirm ? (
                <div className="flex gap-3">
                  <button 
                    onClick={handleClearData}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-sm shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
                  >
                    {t("settings.yes_delete")}
                  </button>
                  <button 
                    onClick={() => setShowClearConfirm(false)}
                    className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowClearConfirm(true)} 
                  className="flex items-center gap-2 px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-black text-sm hover:bg-red-200 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("settings.clear_data")}
                </button>
              )}
            </section>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 relative overflow-hidden p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h3 className="text-2xl font-black mb-2">{t("achievements.current_streak")}</h3>
                  <p className="text-sm font-bold opacity-80 max-w-[200px]">{t("achievements.streak_sub")}</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
                  <div className="text-6xl font-black flex items-center gap-3">
                    <Flame className={`w-12 h-12 ${streak > 0 ? "text-orange-400 fill-orange-400 animate-bounce" : "text-white/30"}`} />
                    {streak}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mt-2">{t("settings.days")}</p>
                </div>
              </div>
            </div>
            {achievements.map(ach => (
              <div key={ach.id} className={`glass p-6 rounded-[2.5rem] border-2 relative overflow-hidden transition-all hover:scale-[1.02] shadow-lg ${ach.unlocked ? "border-amber-400/30 bg-amber-50/10" : "border-white/20 dark:border-white/5 opacity-60 grayscale"}`}>
                {ach.unlocked && <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-10 -mt-10" />}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`p-4 rounded-2xl ${ach.unlocked ? (ach.color === 'orange' ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : ach.color === 'emerald' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400") : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                    <ach.icon className="w-7 h-7" />
                  </div>
                  {ach.unlocked ? (
                    <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-green-500/20">
                      <Check className="w-3 h-3" />
                      {t("achievements.unlocked")}
                    </div>
                  ) : (
                    <Shield className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                  )}
                </div>
                <h3 className="text-lg font-black mb-1 text-slate-900 dark:text-white">{ach.title}</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6">{ach.unlocked ? ach.desc : t("achievements.locked_desc")}</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                  <div className={`h-full transition-all duration-1000 ${ach.unlocked ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-slate-300 dark:bg-slate-700"}`} style={{ width: `${Math.min(ach.current / ach.target * 100, 100)}%` }} />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("settings.progress")}</span>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300">{ach.current} / {ach.target}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-xl">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                {t("calendar.add_new")}
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder={t("calendar.event_name")}
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="flex-1 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 font-bold outline-none focus:border-indigo-500 transition-all"
                />
                <input 
                  type="date" 
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 font-bold outline-none focus:border-indigo-500 transition-all"
                />
                <button 
                  onClick={handleAddEvent} 
                  disabled={!newEventTitle || !newEventDate}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/20"
                >
                  {t("common.save")}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-16 glass rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700">
                  <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-bold">{t("calendar.empty")}</p>
                </div>
              ) : (
                events.map(event => (
                  <div key={event.id} className="glass p-5 rounded-[2rem] flex justify-between items-center shadow-md border border-white/40 dark:border-white/10 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-pink-100 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400 rounded-2xl">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-lg">{event.title}</h4>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{new Date(event.date).toLocaleDateString(language, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)} 
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{t("settings.pin_code")}</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{settings?.pinCode ? t("settings.pin_active") : t("settings.pin_not_set")}</p>
                </div>
              </div>
              <button 
                onClick={() => settings?.pinCode ? updateSetting('pinCode', null) : setIsSettingPin(true)}
                className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${settings?.pinCode ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"}`}
              >
                {settings?.pinCode ? t("settings.remove_pin") : t("settings.set_pin")}
              </button>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-xl">
              <div className="flex items-center gap-5 mb-8">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{t("settings.reminder_time")}</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t("settings.reminder_desc")}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <input 
                  type="time" 
                  value={settings?.reminderTime || ""}
                  onChange={(e) => updateSetting('reminderTime', e.target.value)}
                  className="w-full sm:w-auto p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 font-black text-2xl text-indigo-600 dark:text-indigo-400 outline-none focus:border-indigo-500 transition-all"
                />
                {settings?.reminderTime && (
                  <button 
                    onClick={() => updateSetting('reminderTime', null)} 
                    className="px-6 py-3 text-red-500 font-black text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    {t("settings.disable_reminders")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isSettingPin && (
        <PinLock 
          correctPin="" 
          isSettingUp={true} 
          onSetPin={(pin) => {
            updateSetting('pinCode', pin);
            setIsSettingPin(false);
          }}
          onCancel={() => setIsSettingPin(false)}
        />
      )}
    </div>
  );
};

export default Settings;
