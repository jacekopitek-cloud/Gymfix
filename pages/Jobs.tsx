import React, { useState } from 'react';
import { Icons } from '../components/ui/Icons';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { JobStatus } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

const Jobs = () => {
  const { jobs, clients, createJob } = useData();
  const { hasPermission } = useAuth();
  const { navigate } = useNavigation();

  const [filterStatus, setFilterStatus] = useState<JobStatus | 'ALL'>('ALL');
  const [showNewJob, setShowNewJob] = useState(false);
  const [newJobData, setNewJobData] = useState({ clientId: '', machine: '', desc: '' });
  
  const selectedClientForJob = clients.find(c => c.id === newJobData.clientId);
  const canManageJobs = hasPermission('MANAGE_JOBS');
  const filteredJobs = jobs.filter(j => filterStatus === 'ALL' ? true : j.status === filterStatus);

  const handleCreateJob = () => {
    if(selectedClientForJob && newJobData.machine) {
      createJob(selectedClientForJob.name, newJobData.machine, newJobData.desc);
      setShowNewJob(false);
      setNewJobData({ clientId: '', machine: '', desc: '' });
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Zlecenia Serwisowe</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 flex-1 md:flex-initial"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as JobStatus | 'ALL')}
          >
            <option value="ALL">Wszystkie statusy</option>
            {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {canManageJobs && (
            <button 
              onClick={() => setShowNewJob(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Icons.Plus className="w-4 h-4" />
              Nowe Zlecenie
            </button>
          )}
        </div>
      </div>

      {showNewJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 border dark:border-slate-700">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800 dark:text-white">Rejestracja Usterki</h3>
               <button onClick={() => setShowNewJob(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                 <Icons.Minus className="w-5 h-5 rotate-45" />
               </button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Wybierz Klienta</label>
                 <select 
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500" 
                    value={newJobData.clientId} 
                    onChange={e => setNewJobData({...newJobData, clientId: e.target.value, machine: ''})}
                 >
                    <option value="">-- Wybierz siłownię --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Wybierz Urządzenie</label>
                 <select 
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:ring-2 focus:ring-blue-500"
                    value={newJobData.machine}
                    onChange={e => setNewJobData({...newJobData, machine: e.target.value})}
                    disabled={!newJobData.clientId}
                 >
                    <option value="">-- Wybierz maszynę --</option>
                    {selectedClientForJob?.machines.map(m => (
                      <option key={m.id} value={`${m.model} (SN: ${m.serialNumber})`}>
                        {m.model} (SN: {m.serialNumber})
                      </option>
                    ))}
                 </select>
                 {!newJobData.clientId && <p className="text-xs text-slate-400 mt-1">Najpierw wybierz klienta, aby zobaczyć listę maszyn.</p>}
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opis Problemu</label>
                 <textarea 
                   className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                   rows={3} 
                   value={newJobData.desc} 
                   onChange={e => setNewJobData({...newJobData, desc: e.target.value})} 
                   placeholder="Opisz usterkę..." 
                 />
               </div>
               <div className="flex justify-end gap-2 pt-2">
                 <button onClick={() => setShowNewJob(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Anuluj</button>
                 <button onClick={handleCreateJob} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md" disabled={!newJobData.clientId || !newJobData.machine}>Utwórz Zlecenie</button>
               </div>
             </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.map(job => (
          <div key={job.id} 
            onClick={() => navigate('JOB_DETAIL', { id: job.id })}
            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                    ${job.status === JobStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                    ${job.status === JobStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                    ${job.status === JobStatus.COMPLETED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                    ${job.status === JobStatus.CANCELED ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : ''}
                  `}>
                    {job.status}
                  </span>
                  <span className="text-xs text-slate-400">#{job.id} • {job.dateCreated}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.machineModel}</h3>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{job.clientName}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-1">{job.description}</p>
              </div>
              <Icons.ArrowRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;