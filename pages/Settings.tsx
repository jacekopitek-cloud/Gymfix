import React, { useState } from 'react';
import { Icons } from '../components/ui/Icons';
import { useData } from '../contexts/DataContext';

const Settings = () => {
  const { resetData } = useData();
  const [sslEnabled, setSslEnabled] = useState(true);
  const [certExpiry] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString());

  const handleResetData = () => {
     if (confirm("Czy na pewno chcesz przywrócić dane fabryczne? Wszystkie zmiany zostaną utracone.")) {
        resetData();
     }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Ustawienia Systemu</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Icons.Shield className="w-5 h-5 text-blue-600" />
            Bezpieczeństwo i Certyfikaty SSL
          </h3>
          <p className="text-sm text-slate-500 mt-1">Zarządzaj szyfrowaniem połączeń i certyfikatami domeny.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Icons.Lock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Certyfikat SSL Aktywny</div>
                <div className="text-xs text-slate-600">Wystawca: Let's Encrypt Authority X3</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">WAŻNY DO</div>
              <div className="text-sm text-slate-800">{certExpiry}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-700">Wymuś HTTPS</span>
                <button 
                  onClick={() => setSslEnabled(!sslEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sslEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${sslEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Automatycznie przekieruj wszystkie połączenia HTTP na szyfrowane połączenia HTTPS.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
               <div className="font-medium text-slate-700 mb-2">Rotacja Certyfikatów</div>
               <p className="text-xs text-slate-500 mb-3">
                 Automatyczne odnawianie darmowych certyfikatów Let's Encrypt jest włączone.
               </p>
               <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                 <Icons.Check className="w-4 h-4" />
                 Autoodnawianie aktywne (co 90 dni)
               </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Logi Bezpieczeństwa</h4>
            <div className="text-xs font-mono text-slate-500 space-y-1">
              <p>[2023-10-27 08:00:01] SSL Certificate handshake successful.</p>
              <p>[2023-10-27 08:00:01] TLS 1.3 protocol enforced.</p>
              <p>[2023-10-27 09:15:22] HSTS Header set max-age=31536000.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
             <h4 className="text-sm font-semibold text-slate-700 mb-2">Dane Aplikacji</h4>
             <button onClick={handleResetData} className="text-red-600 text-sm hover:underline flex items-center gap-2">
               <Icons.Trash className="w-4 h-4" /> Resetuj bazę danych (LocalStorage)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;