
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/ui/Icons';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { resetData, setUsers, users } = useData();
  const { currentUser, login } = useAuth();
  
  const [sslEnabled, setSslEnabled] = useState(true);
  const [certExpiry] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString());

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    phone: '',
    position: '',
    email: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        phone: currentUser.phone || '',
        position: currentUser.position || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSavingProfile(true);
    setProfileMessage('');

    // 1. Update global users list
    const updatedUsers = users.map(u => 
      u.id === currentUser.id 
        ? { ...u, phone: profileForm.phone, position: profileForm.position, email: profileForm.email }
        : u
    );
    setUsers(updatedUsers);

    // 2. Update current session user (AuthContext)
    const updatedUser = updatedUsers.find(u => u.id === currentUser.id);
    if (updatedUser) {
      login(updatedUser); // Re-login to update context state
    }

    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileMessage('Zapisano zmiany profilu.');
    }, 500);
  };

  const handleResetData = () => {
     if (confirm("Czy na pewno chcesz przywrócić dane fabryczne? Wszystkie zmiany zostaną utracone.")) {
        resetData();
     }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ustawienia Systemu</h2>

      {/* MY PROFILE SECTION */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Icons.Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Mój Profil
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Zaktualizuj swoje dane kontaktowe widoczne dla innych pracowników.</p>
        </div>
        <div className="p-6">
           <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imię i Nazwisko</label>
                <input 
                  disabled
                  value={currentUser?.name || ''}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stanowisko</label>
                <input 
                  type="text"
                  value={profileForm.position}
                  onChange={e => setProfileForm({...profileForm, position: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="np. Starszy Serwisant"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input 
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
                <input 
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="np. 500-100-200"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSavingProfile ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                </button>
                {profileMessage && (
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                    <Icons.Check className="w-4 h-4" /> {profileMessage}
                  </span>
                )}
              </div>
           </form>
        </div>
      </div>

      {/* SECURITY SECTION */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Icons.Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Bezpieczeństwo i Certyfikaty SSL
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Zarządzaj szyfrowaniem połączeń i certyfikatami domeny.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-slate-700 p-2 rounded-full shadow-sm">
                <Icons.Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-white">Certyfikat SSL Aktywny</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">Wystawca: Let's Encrypt Authority X3</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">WAŻNY DO</div>
              <div className="text-sm text-slate-800 dark:text-white">{certExpiry}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">Wymuś HTTPS</span>
                <button 
                  onClick={() => setSslEnabled(!sslEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sslEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${sslEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatycznie przekieruj wszystkie połączenia HTTP na szyfrowane połączenia HTTPS.
              </p>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
               <div className="font-medium text-slate-700 dark:text-slate-300 mb-2">Rotacja Certyfikatów</div>
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                 Automatyczne odnawianie darmowych certyfikatów Let's Encrypt jest włączone.
               </p>
               <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                 <Icons.Check className="w-4 h-4" />
                 Autoodnawianie aktywne (co 90 dni)
               </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Logi Bezpieczeństwa</h4>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 space-y-1">
              <p>[2023-10-27 08:00:01] SSL Certificate handshake successful.</p>
              <p>[2023-10-27 08:00:01] TLS 1.3 protocol enforced.</p>
              <p>[2023-10-27 09:15:22] HSTS Header set max-age=31536000.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
             <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Dane Aplikacji</h4>
             <button onClick={handleResetData} className="text-red-600 dark:text-red-400 text-sm hover:underline flex items-center gap-2">
               <Icons.Trash className="w-4 h-4" /> Resetuj bazę danych (LocalStorage)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
