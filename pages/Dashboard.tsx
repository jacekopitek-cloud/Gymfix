import React from 'react';
import { Icons } from '../components/ui/Icons';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { JobStatus, UserRole } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

const Dashboard = () => {
  const { parts, jobs, addStock } = useData();
  const { currentUser, hasPermission } = useAuth();
  const { navigate } = useNavigation();

  const lowStock = parts.filter(p => p.quantity <= p.minLevel);
  const pendingJobs = jobs.filter(j => j.status !== JobStatus.COMPLETED && j.status !== JobStatus.CANCELED);
  const myJobs = currentUser?.role === UserRole.TECHNICIAN ? pendingJobs : pendingJobs;
  const canManageInventory = hasPermission('MANAGE_INVENTORY');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Panel Główny</h2>
        <div className="hidden md:block text-sm text-slate-500 dark:text-slate-400">Witaj, <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.name}</span></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aktywne Zlecenia</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{myJobs.length}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Icons.Wrench className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Niski Stan</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{lowStock.length}</p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Icons.Alert className="w-6 h-6 text-orange-500 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Wartość Magazynu</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {canManageInventory 
                  ? parts.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 })
                  : '---'}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Icons.Package className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasPermission('VIEW_JOBS') && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Twoje Zadania</h3>
            {myJobs.slice(0, 3).map(job => (
              <div key={job.id} onClick={() => navigate('JOB_DETAIL', { id: job.id })} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer border-b border-slate-50 dark:border-slate-700 last:border-0">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{job.clientName}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">{job.status}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{job.machineModel}</p>
              </div>
            ))}
            {myJobs.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-sm italic">Brak przypisanych zadań.</p>}
          </div>
        )}

        {hasPermission('VIEW_INVENTORY') && (
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
             <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Braki w Magazynie</h3>
             {lowStock.slice(0, 3).map(p => (
               <div key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded border-b border-slate-50 dark:border-slate-700 last:border-0">
                 <div>
                   <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</p>
                   <p className="text-xs text-slate-400">Stan: {p.quantity} (Min: {p.minLevel})</p>
                 </div>
                 {canManageInventory && (
                  <button onClick={() => addStock(p.id, 5)} className="text-blue-600 dark:text-blue-400 text-xs hover:underline">+ Zamów</button>
                 )}
               </div>
             ))}
             {lowStock.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-sm italic">Stany magazynowe w normie.</p>}
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;