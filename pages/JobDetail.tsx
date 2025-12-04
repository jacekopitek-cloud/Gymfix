import React, { useState } from 'react';
import { Icons } from '../components/ui/Icons';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { JobStatus } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

const JobDetail = () => {
  const { viewParams, navigate } = useNavigation();
  const id = viewParams.id;
  const { jobs, parts, updateJobStatus, usePartInJob, removePartFromJob, finishJob, addToPicklist, removeFromPicklist } = useData();
  const { hasPermission } = useAuth();

  const job = jobs.find(j => j.id === id);
  const [notes, setNotes] = useState(job?.technicianNotes || '');
  const [showPicklistModal, setShowPicklistModal] = useState(false);

  if (!job) return <div>Nie znaleziono zlecenia</div>;

  const canManageJobs = hasPermission('MANAGE_JOBS');
  const canManageInventory = hasPermission('MANAGE_INVENTORY');
  const isJobActive = job.status === JobStatus.IN_PROGRESS;
  const isJobPending = job.status === JobStatus.PENDING;

  const usedPartsList = job.usedParts.map(up => {
    const partDetails = parts.find(p => p.id === up.partId);
    return { ...up, details: partDetails };
  });

  const PicklistModal = () => {
    const picklistItems = job.picklist?.map(p => ({
      ...p,
      details: parts.find(part => part.id === p.partId)
    })) || [];

    const handlePrint = () => {
      window.print();
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col print:shadow-none print:w-full print:max-w-none print:max-h-none print:h-auto overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center print:border-black shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white print:text-black">Lista Kompletacyjna (Picklist)</h2>
              <p className="text-slate-500 dark:text-slate-400 print:text-black">Zlecenie #{job.id} • {job.clientName}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button onClick={() => setShowPicklistModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Zamknij</button>
              <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2">
                <Icons.Package className="w-4 h-4" /> Drukuj
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 print:overflow-visible">
            <div className="mb-6 print:mb-8">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Szczegóły Maszyny</div>
              <div className="text-lg font-bold print:text-xl dark:text-white">{job.machineModel}</div>
              <div className="text-slate-600 dark:text-slate-300">{job.description}</div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Pozycje do pobrania</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm print:text-base">
                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 uppercase text-xs print:bg-transparent print:text-black print:border-b-2 print:border-black">
                  <tr>
                    <th className="px-4 py-3 print:px-0">Lokalizacja</th>
                    <th className="px-4 py-3 print:px-0">SKU / Nazwa</th>
                    <th className="px-4 py-3 text-right print:px-0">Ilość</th>
                    <th className="px-4 py-3 text-center print:hidden">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 print:divide-black">
                  {picklistItems.map(item => (
                    <tr key={item.partId} className="print:h-12">
                      <td className="px-4 py-3 font-mono font-bold text-lg dark:text-white print:px-0">{item.details?.location}</td>
                      <td className="px-4 py-3 print:px-0">
                        <div className="font-bold dark:text-white">{item.details?.sku}</div>
                        <div className="text-slate-600 dark:text-slate-300 print:text-black">{item.details?.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lg dark:text-white print:px-0">{item.quantity}</td>
                      <td className="px-4 py-3 text-center print:hidden">
                        <button onClick={() => removeFromPicklist(job.id, item.partId)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded">
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {picklistItems.length === 0 && (
                     <tr><td colSpan={4} className="text-center py-8 text-slate-400">Brak pozycji na liście. Dodaj części poniżej.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 print:hidden">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Dodaj do listy</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {parts.map(part => (
                  <button 
                    key={part.id} 
                    onClick={() => addToPicklist(job.id, part.id)}
                    className="text-left p-3 border border-slate-200 dark:border-slate-600 rounded hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex justify-between">
                       <span className="font-medium text-sm dark:text-white">{part.name}</span>
                       <span className="text-xs bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">{part.quantity}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Loc: {part.location}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden print:flex justify-between mt-12 pt-8 border-t border-black text-sm">
              <div>Data wydruku: {new Date().toLocaleDateString()}</div>
              <div>Podpis magazyniera: _______________________</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #root { display: none; }
          .fixed.inset-0.z-50 { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white; z-index: 9999; display: block !important; }
          .fixed.inset-0.z-50 * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .print\\:text-black { color: black !important; }
        }
      `}</style>
      
      {showPicklistModal && <PicklistModal />}

      <button onClick={() => navigate('JOBS')} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-2">
        <Icons.ArrowRight className="w-4 h-4 rotate-180 mr-1" /> Wróć do listy
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-6">
           <div>
             <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{job.machineModel}</h1>
             <p className="text-lg text-slate-600 dark:text-slate-300">{job.clientName}</p>
             <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">Zgłoszenie: {job.description}</div>
           </div>
           <div className="flex flex-col items-end gap-2">
             <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium text-sm">{job.status}</span>
             {isJobPending && canManageJobs && (
               <button 
                onClick={() => updateJobStatus(job.id, JobStatus.IN_PROGRESS)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium w-full md:w-auto"
               >
                 Rozpocznij Naprawę
               </button>
             )}
             {canManageInventory && (
               <button 
                 onClick={() => setShowPicklistModal(true)}
                 className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium w-full md:w-auto flex items-center gap-2 justify-center"
               >
                 <Icons.Package className="w-4 h-4" /> Picklista (Magazyn)
               </button>
             )}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-2">Notatki Serwisanta</label>
              <textarea 
                disabled={job.status === JobStatus.COMPLETED || !canManageJobs}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:bg-slate-700 dark:text-white"
                placeholder="Opisz przebieg naprawy..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Icons.Wrench className="w-5 h-5 text-slate-500" />
              Zużyte Części
            </h3>
            
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              {usedPartsList.length > 0 ? (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {usedPartsList.map((up) => (
                    <li key={up.partId} className="p-3 flex justify-between items-center bg-white dark:bg-slate-800">
                      <div>
                        <span className="font-medium text-slate-800 dark:text-white">{up.details?.name || 'Nieznana część'}</span>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{up.details?.sku}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{up.quantity} szt.</span>
                        {isJobActive && canManageJobs && (
                          <button 
                            onClick={() => removePartFromJob(job.id, up.partId)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">Brak zużytych części.</div>
              )}
            </div>

            {isJobActive && canManageJobs && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Dodaj część z magazynu</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {parts.filter(p => p.quantity > 0).map(part => (
                    <button 
                      key={part.id}
                      onClick={() => usePartInJob(job.id, part.id)}
                      className="w-full flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded border border-transparent hover:border-slate-100 dark:hover:border-slate-600 text-left group"
                    >
                       <span className="text-sm text-slate-700 dark:text-slate-200 truncate max-w-[70%]">{part.name}</span>
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">{part.quantity} w mag.</span>
                         <Icons.Plus className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100" />
                       </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {isJobActive && canManageJobs && (
           <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
             <button 
              onClick={() => finishJob(job.id, notes)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-200 dark:shadow-none transition-all transform hover:-translate-y-1"
             >
               <Icons.Check className="w-5 h-5" />
               Zakończ Zlecenie (Pobierz części)
             </button>
           </div>
        )}
         {job.status === JobStatus.COMPLETED && (
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700 text-center text-green-700 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            Zlecenie zakończone {job.dateCreated}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;