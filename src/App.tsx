import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Journal from './pages/Journal';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PinLock from './components/PinLock';
import { User, AnalysisResult, AppSettings, CalendarEvent } from './types';
import { MOCK_HISTORY_KEY, SETTINGS_KEY, EVENTS_KEY, EMOTION_COLORS } from './constants';
import { AuthContext } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { supabase } from './lib/supabase';
import { dbService } from './services/dbService';

const AUTH_USER_KEY = 'emotion_analyzer_auth_user';
const AUTH_TOKEN_KEY = 'emotion_analyzer_auth_token';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : { reminderTime: null, pinCode: null, useBiometrics: false, appIconId: 'default', persona: 'default' };
  });

  const [isDark, setIsDark] = useState<boolean>(() => settings.theme === 'dark');
  const [isLocked, setIsLocked] = useState<boolean>(!!settings.pinCode);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsAuthReady(true);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        });
      }
      setIsAuthReady(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem(MOCK_HISTORY_KEY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedEvents = localStorage.getItem(EVENTS_KEY);
    if (savedEvents) setEvents(JSON.parse(savedEvents));
  }, []);

  // Sync from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      setIsDataLoaded(true);
      return;
    }
    
    setIsDataLoaded(false);
    const fetchUserData = async () => {
      try {
        if (!supabase) return;

        const fetchKey = async (key: string) => {
          const { data, error } = await supabase!
            .from('app_data')
            .select('data_value')
            .eq('user_id', user.id)
            .eq('data_key', key)
            .maybeSingle();
          
          if (error) throw error;
          return data?.data_value;
        };

        const historyData = await dbService.loadHistory(user.id);
        if (historyData && historyData.length > 0) {
          setHistory(historyData);
        } else {
          // Fallback to app_data if no new history
          const oldHistory = await fetchKey(MOCK_HISTORY_KEY);
          if (oldHistory && oldHistory.length > 0) {
            // Migrate old history to new tables
            console.log("Migrating old history to new tables...");
            const migratedHistory = [];
            for (const item of oldHistory) {
              const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
              const newItem = { ...item, id: isUUID ? item.id : crypto.randomUUID() };
              await dbService.saveAnalysisResult(user.id, newItem);
              migratedHistory.push(newItem);
            }
            setHistory(migratedHistory);
          } else {
            setHistory([]);
          }
        }
        
        const eventsData = await fetchKey(EVENTS_KEY);
        if (eventsData) setEvents(eventsData);
        
        const settingsData = await dbService.loadSettings(user.id);
        if (settingsData) {
          setSettings(settingsData);
        } else {
          const oldSettings = await fetchKey(SETTINGS_KEY);
          if (oldSettings) {
            setSettings(oldSettings);
            dbService.saveSettings(user.id, oldSettings);
          }
        }
        
      } catch (e) {
        console.warn('Could not load from Supabase, using local storage', e);
      } finally {
        setIsDataLoaded(true);
      }
    };
    
    fetchUserData();
  }, [user]);

  const saveToSupabase = async (key: string, value: any) => {
    if (!user || !supabase) {
      console.log('Skipping Supabase save: User or Supabase client is missing.', { user: !!user, supabase: !!supabase });
      return;
    }
    try {
      console.log(`Attempting to save ${key} to Supabase for user ${user.id}...`);
      const { data, error } = await supabase
        .from('app_data')
        .upsert({ 
          user_id: user.id, 
          data_key: key, 
          data_value: value 
        }, { 
          onConflict: 'user_id, data_key' 
        });
        
      if (error) {
        console.error(`Supabase error saving ${key}:`, error);
      } else {
        console.log(`Successfully saved ${key} to Supabase.`, data);
      }
    } catch (e) {
      console.error(`Exception while saving ${key} to Supabase:`, e);
    }
  };

  useEffect(() => { 
    if (!isDataLoaded) return;
    localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(history)); 
    // We no longer save the entire history array to app_data here.
    // It's saved individually in handleAnalysisComplete and handleToggleFavorite.
  }, [history, isDataLoaded]);

  useEffect(() => { 
    if (!isDataLoaded) return;
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); 
    saveToSupabase(EVENTS_KEY, events);
  }, [events, user, isDataLoaded]);

  useEffect(() => { 
    if (!isDataLoaded) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (!settings.pinCode) setIsLocked(false);
    if (user) {
      dbService.saveSettings(user.id, settings);
    }
  }, [settings, user, isDataLoaded]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    
    if (history.length > 0) {
       const color = EMOTION_COLORS[history[0].primary_emotion] || '#6366f1';
       root.style.setProperty('--emotion-accent', color);
    }
  }, [isDark, history]);

  const handleLogin = (newUser: User, newToken: string) => {
    // This is kept for compatibility with AuthContext, but actual login is handled by Supabase
    setUser(newUser);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    if (supabase) {
      await supabase.auth.updateUser({
        data: { name: updatedUser.name }
      });
    }
  };

  const handleAnalysisComplete = async (result: AnalysisResult) => {
    setHistory(prev => [result, ...prev]);
    if (user) {
      await dbService.saveAnalysisResult(user.id, result);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    setHistory(prev => {
      const newHistory = prev.map(item => item.id === id ? { ...item, is_favorite: !item.is_favorite } : item);
      const item = newHistory.find(i => i.id === id);
      if (user && item) {
        dbService.updateFavoriteStatus(user.id, id, item.is_favorite);
      }
      return newHistory;
    });
  };
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };
  const handleUnlock = () => setIsLocked(false);

  if (!isAuthReady || (user && !isDataLoaded)) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (isLocked && settings.pinCode) {
    return (
      <LanguageProvider>
        <PinLock correctPin={settings.pinCode} onUnlock={handleUnlock} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <AuthContext.Provider value={{ isAuthenticated: !!user, user, login: handleLogin, logout: handleLogout, updateUser: handleUpdateUser }}>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <Route element={<Layout onLogout={handleLogout} isDark={isDark} toggleTheme={toggleTheme} />}>
              <Route path="/" element={<Dashboard history={history} settings={settings} />} />
              <Route path="/journal" element={<Journal history={history} onToggleFavorite={handleToggleFavorite} />} />
              <Route path="/analysis" element={<Analysis onAnalysisComplete={handleAnalysisComplete} settings={settings} />} />
              <Route path="/settings" element={<Settings history={history} events={events} setEvents={setEvents} settings={settings} setSettings={setSettings} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </AuthContext.Provider>
    </LanguageProvider>
  );
};

export default App;
