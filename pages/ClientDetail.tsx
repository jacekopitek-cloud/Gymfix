import React, { useState } from 'react';
import { Icons } from '../components/ui/Icons';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ClientMachine } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

const ClientDetail = () => {
  const { viewParams, navigate } = useNavigation();
  const id = viewParams.id;
  const { clients, setClients } = useData();
  const { hasPermission } = useAuth();
  
  const client = clients.find(c => c.id === id);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [newMachine, setNewMachine] = useState<Partial<ClientMachine>>({});

  if (!client) return <div>Błąd: Nie znaleziono klienta</div>;
  const canManageClients = hasPermission('MANAGE_CLIENTS');

  const handleAddMachine = () => {
    if(newMachine.model && newMachine.serialNumber) {
      const machine: ClientMachine = {
        id: `m${Date.now()}`,
        model: newMachine.model,
        serialNumber: newMachine.serialNumber,
        installDate: newMachine.installDate || new Date().toISOString().split('T')[0],
        warrantyUntil: newMachine.warrantyUntil || ''
      };
      
      const updatedClients = clients.map(c => {
        if(c.id === client.id) {
          return { ...c, machines: [...c.machines, machine] };
        }
        return c;
      });
      setClients(updatedClients);
      setShowAddMachine(false);
      setNewMachine({});
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <button onClick={() => navigate('CLIENTS')} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-2">
        <Icons.ArrowRight className="w-4 h-4 rotate-180 mr-1" /> Wróć do listy klientów
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-700 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{client.name}</h1>
            <p className="text-slate-600 dark:text-slate-300">{client.address}</p>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Kontakt: <span className="font-medium text-slate-700 dark:text-slate-200">{client.contactPerson}</span> • Tel: <span className="font-medium text-slate-700 dark:text-slate-200">{client.phone}</span>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg hidden md:block">
             <Icons.Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Park Maszynowy</h3>
            {canManageClients && (
              <button onClick={() => setShowAddMachine(true)} className="text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 font-medium whitespace-nowrap">
                + Dodaj Maszynę
              </button>
            )}
          </div>

          {showAddMachine && (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-blue-100 dark:border-slate-700 mb-4">
              <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Rejestracja Nowego Sprzętu</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input placeholder="Model Maszyny" className="p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newMachine.model || ''} onChange={e => setNewMachine({...newMachine, model: e.target.value})} />
                <input placeholder="Numer Seryjny" className="p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newMachine.serialNumber || ''} onChange={e => setNewMachine({...newMachine, serialNumber: e.target.value})} />
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block">Data Instalacji</label>
                  <input type="date" className="p-2 border dark:border-slate-600 rounded w-full dark:bg-slate-700 dark:text-white" value={newMachine.installDate || ''} onChange={e => setNewMachine({...newMachine, installDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block">Gwarancja do</label>
                  <input type="date" className="p-2 border dark:border-slate-600 rounded w-full dark:bg-slate-700 dark:text-white" value={newMachine.warrantyUntil || ''} onChange={e => setNewMachine({...newMachine, warrantyUntil: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddMachine} className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Zapisz</button>
                <button onClick={() => setShowAddMachine(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-slate-500 text-sm">Anuluj</button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 min-w-[150px]">Model</th>
                    <th className="px-4 py-3 min-w-[120px]">Nr Seryjny</th>
                    <th className="px-4 py-3 min-w-[100px]">Instalacja</th>
                    <th className="px-4 py-3 min-w-[120px]">Gwarancja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {client.machines.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{m.model}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{m.serialNumber}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{m.installDate}</td>
                      <td className="px-4 py-3">
                        {new Date(m.warrantyUntil) > new Date() 
                          ? <span className="text-green-600 dark:text-green-400 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full whitespace-nowrap">Aktywna ({m.warrantyUntil})</span>
                          : <span className="text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">Wygasła ({m.warrantyUntil})</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {client.machines.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">Brak zarejestrowanych maszyn dla tego klienta.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;