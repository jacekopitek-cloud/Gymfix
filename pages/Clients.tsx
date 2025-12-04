import React, { useState } from 'react';
import { Icons } from '../components/ui/Icons';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Client } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

const Clients = () => {
  const { clients, setClients } = useData();
  const { hasPermission } = useAuth();
  const { navigate } = useNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', address: '', person: '', phone: '' });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageClients = hasPermission('MANAGE_CLIENTS');

  const handleAddClient = () => {
    if(newClient.name) {
      const nc: Client = {
        id: `c${Date.now()}`,
        name: newClient.name,
        address: newClient.address,
        contactPerson: newClient.person,
        phone: newClient.phone,
        machines: []
      };
      setClients([...clients, nc]);
      setShowAddClient(false);
      setNewClient({ name: '', address: '', person: '', phone: '' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Baza Klientów (Siłownie)</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Szukaj klienta..." 
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-slate-800 dark:text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {canManageClients && (
            <button 
              onClick={() => setShowAddClient(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
            >
              <Icons.Plus className="w-4 h-4" />
              Dodaj
            </button>
          )}
        </div>
      </div>

      {showAddClient && (
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-blue-100 dark:border-slate-700 mb-4 animate-in fade-in">
           <h3 className="font-semibold mb-3 text-slate-700 dark:text-slate-200">Dodaj Nowego Klienta</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Nazwa Siłowni" className="p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
              <input placeholder="Adres" className="p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} />
              <input placeholder="Osoba kontaktowa" className="p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newClient.person} onChange={e => setNewClient({...newClient, person: e.target.value})} />
              <input placeholder="Telefon" className="p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
           </div>
           <div className="flex gap-2 mt-3">
              <button onClick={handleAddClient} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Zapisz</button>
              <button onClick={() => setShowAddClient(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-slate-500">Anuluj</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map(client => (
          <div key={client.id} onClick={() => navigate('CLIENT_DETAIL', { id: client.id })} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{client.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1 mt-1">
                  <Icons.Truck className="w-3 h-3" /> {client.address}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1 mt-1">
                  <Icons.Users className="w-3 h-3" /> {client.contactPerson} ({client.phone})
                </p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
                {client.machines.length} maszyn
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;