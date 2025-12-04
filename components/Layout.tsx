
import React, { useState } from 'react';
import { Icons } from './ui/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useTheme } from '../contexts/ThemeContext';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout, hasPermission } = useAuth();
  const { currentView, navigate } = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (view: ViewState) => currentView === view;

  const handleLogout = () => {
    logout();
    navigate('LOGIN');
  };

  const MobileMenuOverlay = () => {
    if (!isMobileMenuOpen) return null;
    return (
      <div className="md:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}>
        <div 
          className="absolute bottom-20 right-4 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-10 border border-slate-100 dark:border-slate-700"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {currentUser?.name.substring(0,2)}
            </div>
            <div>
               <p className="font-bold text-slate-800 dark:text-white text-sm">{currentUser?.name}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.role}</p>
            </div>
          </div>

          <div className="space-y-1">
             <button onClick={() => { navigate('USERS'); setIsMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm flex items-center gap-3">
               <Icons.Users className="w-4 h-4" /> Zespół / Kontakty
             </button>
             <button onClick={() => { navigate('SETTINGS'); setIsMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm flex items-center gap-3">
               <Icons.Settings className="w-4 h-4" /> Ustawienia
             </button>
             <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
             <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm flex items-center gap-3">
               <Icons.LogOut className="w-4 h-4" /> Wyloguj
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white print:bg-white transition-colors duration-300">
      {/* SIDEBAR */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 dark:bg-black dark:border-r dark:border-slate-800 text-white h-screen fixed left-0 top-0 p-4 print:hidden z-20 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Icons.Wrench className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">GymFix WMS</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => navigate('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('DASHBOARD') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'}`}>
            <Icons.Dashboard className="w-5 h-5" /> Dashboard
          </button>
          {hasPermission('VIEW_JOBS') && (
            <button onClick={() => navigate('JOBS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('JOBS') || isActive('JOB_DETAIL') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'}`}>
              <Icons.Wrench className="w-5 h-5" /> Zlecenia
            </button>
          )}
          {hasPermission('VIEW_CLIENTS') && (
            <button onClick={() => navigate('CLIENTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('CLIENTS') || isActive('CLIENT_DETAIL') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'}`}>
              <Icons.Building className="w-5 h-5" /> Klienci
            </button>
          )}
          {hasPermission('VIEW_INVENTORY') && (
            <button onClick={() => navigate('INVENTORY')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('INVENTORY') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'}`}>
              <Icons.Package className="w-5 h-5" /> Magazyn
            </button>
          )}
          
          <button onClick={() => navigate('USERS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('USERS') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'}`}>
            <Icons.Users className="w-5 h-5" /> Zespół
          </button>
          
          <button onClick={() => navigate('SETTINGS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('SETTINGS') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'}`}>
            <Icons.Settings className="w-5 h-5" /> Ustawienia
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold uppercase">
              {currentUser?.name.substring(0,2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-slate-400 hover:text-white text-sm px-2">
            <Icons.LogOut className="w-4 h-4" /> Wyloguj
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      <MobileMenuOverlay />
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800 p-2 flex justify-around items-center z-40 pb-safe print:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300">
        <button onClick={() => navigate('DASHBOARD')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${isActive('DASHBOARD') ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`}>
          <Icons.Dashboard className="w-6 h-6" /> <span className="text-[10px] font-medium">Start</span>
        </button>
        {hasPermission('VIEW_JOBS') && (
          <button onClick={() => navigate('JOBS')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${isActive('JOBS') || isActive('JOB_DETAIL') ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`}>
            <Icons.Wrench className="w-6 h-6" /> <span className="text-[10px] font-medium">Zlecenia</span>
          </button>
        )}
        {hasPermission('VIEW_INVENTORY') && (
          <button onClick={() => navigate('INVENTORY')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${isActive('INVENTORY') ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`}>
            <Icons.Package className="w-6 h-6" /> <span className="text-[10px] font-medium">Magazyn</span>
          </button>
        )}
        {hasPermission('VIEW_CLIENTS') && (
          <button onClick={() => navigate('CLIENTS')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${isActive('CLIENTS') || isActive('CLIENT_DETAIL') ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`}>
            <Icons.Building className="w-6 h-6" /> <span className="text-[10px] font-medium">Klienci</span>
          </button>
        )}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${isMobileMenuOpen ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`}>
          <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
            <span className="w-5 h-0.5 bg-current rounded-full" />
            <span className="w-5 h-0.5 bg-current rounded-full" />
            <span className="w-5 h-0.5 bg-current rounded-full" />
          </div>
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>

      {/* THEME TOGGLE (Absolute Top Right) - SLIDER STYLE */}
      {/* Positioned absolute. Main content has right padding to prevent overlap. */}
      <div className="absolute top-4 right-6 z-50 print:hidden">
        <div 
          onClick={toggleTheme}
          className={`
            relative w-16 h-8 flex items-center cursor-pointer rounded-full p-1 transition-colors duration-300 shadow-md border border-slate-200 dark:border-slate-600
            ${theme === 'dark' ? 'bg-slate-800' : 'bg-blue-100'}
          `}
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label="Toggle Dark Mode"
        >
          {/* Slider Knob */}
          <div 
            className={`
              bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 flex items-center justify-center
              ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}
            `}
          >
            {theme === 'dark' ? (
              <Icons.Moon className="w-3.5 h-3.5 text-slate-800" />
            ) : (
              <Icons.Sun className="w-3.5 h-3.5 text-orange-500" />
            )}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      {/* Added md:pr-28 to create a safe zone for the Theme Toggle on the right */}
      <main className="md:ml-64 p-4 md:pl-8 md:py-8 md:pr-28 min-h-screen pb-24 md:pb-8 print:m-0 print:p-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;
