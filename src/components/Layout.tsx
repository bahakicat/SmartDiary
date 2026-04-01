import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Book, 
  PenLine, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Smile
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, isDark, toggleTheme }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "nav.dashboard" },
    { to: "/journal", icon: Book, label: "nav.journal" },
    { to: "/analysis", icon: PenLine, label: "nav.analysis" },
    { to: "/settings", icon: Settings, label: "nav.settings" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Smile className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight hidden lg:block">SmartJournal</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <NavLink 
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-4 p-3 rounded-xl transition-all group
                ${isActive 
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}
              `}
            >
              <item.icon className="w-6 h-6" />
              <span className="font-bold hidden lg:block">{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            <span className="font-bold hidden lg:block">{isDark ? t("layout.light_mode") : t("layout.dark_mode")}</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-6 h-6" />
            <span className="font-bold hidden lg:block">{t("layout.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Bottom Nav - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 md:hidden flex justify-around p-4 z-50">
        {navItems.map(item => (
          <NavLink 
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              p-2 rounded-xl transition-all
              ${isActive 
                ? "text-indigo-600 dark:text-indigo-400 scale-110" 
                : "text-slate-400"}
            `}
          >
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
        <button onClick={onLogout} className="p-2 text-red-400">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="md:ml-20 lg:ml-64 p-4 md:p-8 lg:p-12 min-h-screen">
        <header className="flex md:hidden items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Smile className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">SmartJournal</span>
          </div>
          <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
