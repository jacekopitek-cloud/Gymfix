
import React, { useState, useEffect } from 'react';
import { Icons } from './components/ui/Icons';
import { Part, ServiceJob, JobStatus, PartCategory, ViewState, User, UserRole, Client, ClientMachine, Permission } from './types';

// --- CONSTANTS & DEFAULTS ---

const PERMISSION_LABELS: Record<Permission, string> = {
  MANAGE_USERS: 'Zarządzanie Użytkownikami',
  VIEW_INVENTORY: 'Podgląd Magazynu',
  MANAGE_INVENTORY: 'Edycja Magazynu (Dodawanie/Stany)',
  EDIT_PRICES: 'Edycja Cen',
  VIEW_JOBS: 'Podgląd Zleceń',
  MANAGE_JOBS: 'Obsługa Zleceń (Serwis)',
  VIEW_CLIENTS: 'Podgląd Klientów',
  MANAGE_CLIENTS: 'Edycja Klientów'
};

const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'MANAGE_USERS', 'VIEW_INVENTORY', 'MANAGE_INVENTORY', 'EDIT_PRICES', 
    'VIEW_JOBS', 'MANAGE_JOBS', 'VIEW_CLIENTS', 'MANAGE_CLIENTS'
  ],
  [UserRole.WAREHOUSE]: [
    'VIEW_INVENTORY', 'MANAGE_INVENTORY', 'VIEW_JOBS'
  ],
  [UserRole.TECHNICIAN]: [
    'VIEW_INVENTORY', 'VIEW_JOBS', 'MANAGE_JOBS', 'VIEW_CLIENTS'
  ]
};

// --- MOCK DATA ---
const INITIAL_PARTS: Part[] = [
  { id: 'p1', name: 'Linka stalowa 4mm', sku: 'CBL-004', category: PartCategory.CABLES, quantity: 50, minLevel: 10, price: 25.00, location: 'A-01' },
  { id: 'p2', name: 'Pas bieżni LifeFitness', sku: 'BLT-LF95', category: PartCategory.MECHANICAL, quantity: 3, minLevel: 2, price: 450.00, location: 'B-04' },
  { id: 'p3', name: 'Sterownik silnika Matrix', sku: 'PCB-MTX', category: PartCategory.ELECTRONICS, quantity: 1, minLevel: 2, price: 1200.00, location: 'S-10' },
  { id: 'p4', name: 'Smar silikonowy', sku: 'LUB-SIL', category: PartCategory.CONSUMABLES, quantity: 12, minLevel: 5, price: 45.00, location: 'C-02' },
  { id: 'p5', name: 'Tapicerka siedziska (Czarna)', sku: 'UPH-BK', category: PartCategory.UPHOLSTERY, quantity: 0, minLevel: 2, price: 150.00, location: 'D-05' },
  { id: 'p6', name: 'Łożysko 6004zz', sku: 'BRG-6004', category: PartCategory.WEARABLE, quantity: 20, minLevel: 8, price: 15.00, location: 'A-12' },
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'CityFit Centrum',
    address: 'ul. Marszałkowska 100, Warszawa',
    contactPerson: 'Anna Nowak',
    phone: '500-100-100',
    machines: [
      { id: 'm1', model: 'LifeFitness 95T', serialNumber: 'LF-2022-998', installDate: '2022-01-15', warrantyUntil: '2024-01-15' },
      { id: 'm2', model: 'Technogym Excite Run', serialNumber: 'TG-554-221', installDate: '2021-06-20', warrantyUntil: '2023-06-20' },
    ]
  },
  {
    id: 'c2',
    name: 'McFit Mokotów',
    address: 'ul. Wołoska 12, Warszawa',
    contactPerson: 'Piotr Kowalski',
    phone: '600-200-200',
    machines: [
      { id: 'm3', model: 'Technogym Selection Leg Press', serialNumber: 'TG-SLP-001', installDate: '2023-03-10', warrantyUntil: '2025-03-10' },
      { id: 'm4', model: 'Matrix Aura Multi-Press', serialNumber: 'MTX-AMP-88', installDate: '2022-11-05', warrantyUntil: '2024-11-05' },
    ]
  },
];

const INITIAL_JOBS: ServiceJob[] = [
  { 
    id: 'j1', 
    clientName: 'CityFit Centrum', 
    machineModel: 'LifeFitness 95T', 
    description: 'Bieżnia szarpie przy starcie, słychać piski.', 
    status: JobStatus.PENDING, 
    dateCreated: '2023-10-25',
    usedParts: [],
    picklist: []
  },
  { 
    id: 'j2', 
    clientName: 'McFit Mokotów', 
    machineModel: 'Technogym Selection Leg Press', 
    description: 'Zerwana linka wyciągu.', 
    status: JobStatus.IN_PROGRESS, 
    dateCreated: '2023-10-26',
    usedParts: [],
    picklist: []
  },
];

const INITIAL_USERS: User[] = [
  { 
    id: 'u1', name: 'Admin Systemu', email: 'admin@gymfix.pl', role: UserRole.ADMIN, password: 'password',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.ADMIN]
  },
  { 
    id: 'u2', name: 'Jan Magazynier', email: 'magazyn@gymfix.pl', role: UserRole.WAREHOUSE, password: 'password',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.WAREHOUSE]
  },
  { 
    id: 'u3', name: 'Piotr Serwisant', email: 'serwis@gymfix.pl', role: UserRole.TECHNICIAN, password: 'password',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.TECHNICIAN]
  },
];

// --- STORAGE HELPERS ---
const loadFromStorage = <T,>(key: string, initial: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return initial;
  }
};

// --- MAIN COMPONENT ---

const GymFixApp: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // App State - Loaded from LocalStorage
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('gymfix_users', INITIAL_USERS));
  const [parts, setParts] = useState<Part[]>(() => loadFromStorage('gymfix_parts', INITIAL_PARTS));
  const [jobs, setJobs] = useState<ServiceJob[]>(() => loadFromStorage('gymfix_jobs', INITIAL_JOBS));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('gymfix_clients', INITIAL_CLIENTS));
  
  const [view, setView] = useState<ViewState>('DASHBOARD');
  
  // Selection State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin@gymfix.pl');
  const [loginPass, setLoginPass] = useState('password');
  const [loginError, setLoginError] = useState('');

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('gymfix_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('gymfix_parts', JSON.stringify(parts)); }, [parts]);
  useEffect(() => { localStorage.setItem('gymfix_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('gymfix_clients', JSON.stringify(clients)); }, [clients]);

  // --- PERMISSIONS HELPERS ---
  const hasPermission = (permission: Permission) => {
    return currentUser?.permissions.includes(permission) || false;
  };

  const canManageInventory = hasPermission('MANAGE_INVENTORY');
  const canEditPrices = hasPermission('EDIT_PRICES');
  const canManageJobs = hasPermission('MANAGE_JOBS');
  const canManageUsers = hasPermission('MANAGE_USERS');
  const canManageClients = hasPermission('MANAGE_CLIENTS');

  // --- ACTIONS ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginEmail && u.password === loginPass);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      setView('DASHBOARD');
    } else {
      setLoginError('Nieprawidłowy email lub hasło');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('DASHBOARD');
    setLoginEmail('');
    setLoginPass('');
    setIsMobileMenuOpen(false);
  };

  const addStock = (partId: string, amount: number) => {
    if (!canManageInventory) return;
    setParts(prev => prev.map(p => p.id === partId ? { ...p, quantity: p.quantity + amount } : p));
  };

  const createJob = (client: string, machine: string, desc: string) => {
    const newJob: ServiceJob = {
      id: `j${Date.now()}`,
      clientName: client,
      machineModel: machine,
      description: desc,
      status: JobStatus.PENDING,
      dateCreated: new Date().toISOString().split('T')[0],
      usedParts: [],
      picklist: []
    };
    setJobs([newJob, ...jobs]);
    setView('JOBS');
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    if (!canManageJobs) return;
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const usePartInJob = (jobId: string, partId: string) => {
    if (!canManageJobs) {
      alert("Tylko serwisanci mogą pobierać części do naprawy.");
      return;
    }

    const part = parts.find(p => p.id === partId);
    if (!part || part.quantity <= 0) {
      alert("Brak części w magazynie!");
      return;
    }

    // Decrement stock immediately (reservation logic)
    setParts(prev => prev.map(p => p.id === partId ? { ...p, quantity: p.quantity - 1 } : p));

    // Add to job
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      
      const existing = job.usedParts.find(up => up.partId === partId);
      let newUsedParts;
      if (existing) {
        newUsedParts = job.usedParts.map(up => up.partId === partId ? { ...up, quantity: up.quantity + 1 } : up);
      } else {
        newUsedParts = [...job.usedParts, { partId, quantity: 1 }];
      }
      return { ...job, usedParts: newUsedParts };
    }));
  };

  const removePartFromJob = (jobId: string, partId: string) => {
    if (!canManageJobs) return;
    // Return stock
    setParts(prev => prev.map(p => p.id === partId ? { ...p, quantity: p.quantity + 1 } : p));

    // Remove from job
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const existing = job.usedParts.find(up => up.partId === partId);
      if (!existing) return job;

      let newUsedParts;
      if (existing.quantity > 1) {
        newUsedParts = job.usedParts.map(up => up.partId === partId ? { ...up, quantity: up.quantity - 1 } : up);
      } else {
        newUsedParts = job.usedParts.filter(up => up.partId !== partId);
      }
      return { ...job, usedParts: newUsedParts };
    }));
  };

  // --- PICKLIST ACTIONS ---
  const addToPicklist = (jobId: string, partId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const currentList = job.picklist || [];
      const existing = currentList.find(p => p.partId === partId);
      let newList;
      if (existing) {
        newList = currentList.map(p => p.partId === partId ? {...p, quantity: p.quantity + 1} : p);
      } else {
        newList = [...currentList, { partId, quantity: 1 }];
      }
      return { ...job, picklist: newList };
    }));
  };

  const removeFromPicklist = (jobId: string, partId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const currentList = job.picklist || [];
      const newList = currentList.filter(p => p.partId !== partId);
      return { ...job, picklist: newList };
    }));
  };

  const handleFinishJob = (jobId: string, notes: string) => {
    if (!canManageJobs) return;
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: JobStatus.COMPLETED, technicianNotes: notes } : j));
    setView('JOBS');
  };

  // --- SUB-COMPONENTS ---

  const LoginView = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
            <Icons.Wrench className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">GymFix WMS</h2>
        <p className="text-center text-slate-500 mb-8">Zaloguj się do systemu serwisowego</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hasło</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
            />
          </div>
          
          {loginError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <Icons.Alert className="w-4 h-4" />
              {loginError}
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md shadow-blue-200">
            Zaloguj się
          </button>
        </form>

        <div className="mt-6 flex justify-center items-center gap-2 text-xs text-green-600 font-medium bg-green-50 py-2 rounded-lg">
          <Icons.Lock className="w-3 h-3" />
          Połączenie szyfrowane (SSL 256-bit)
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400">Dostępne konta demo:</p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <button onClick={() => {setLoginEmail('admin@gymfix.pl'); setLoginPass('password')}} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 hover:bg-slate-200">Admin</button>
            <button onClick={() => {setLoginEmail('magazyn@gymfix.pl'); setLoginPass('password')}} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 hover:bg-slate-200">Magazyn</button>
            <button onClick={() => {setLoginEmail('serwis@gymfix.pl'); setLoginPass('password')}} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 hover:bg-slate-200">Serwis</button>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsView = () => {
    const [sslEnabled, setSslEnabled] = useState(true);
    const [certExpiry] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString());
    
    // Reset Data action for demo purposes
    const handleResetData = () => {
       if (confirm("Czy na pewno chcesz przywrócić dane fabryczne? Wszystkie zmiany zostaną utracone.")) {
          localStorage.clear();
          window.location.reload();
       }
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Ustawienia Systemu</h2>

        {/* Security Section */}
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

  const ClientsView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddClient, setShowAddClient] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', address: '', person: '', phone: '' });

    const filteredClients = clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
          <h2 className="text-2xl font-bold text-slate-800">Baza Klientów (Siłownie)</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Szukaj klienta..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
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
          <div className="bg-slate-50 p-4 rounded-xl border border-blue-100 mb-4 animate-in fade-in">
             <h3 className="font-semibold mb-3 text-slate-700">Dodaj Nowego Klienta</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Nazwa Siłowni" className="p-2 border rounded" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
                <input placeholder="Adres" className="p-2 border rounded" value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} />
                <input placeholder="Osoba kontaktowa" className="p-2 border rounded" value={newClient.person} onChange={e => setNewClient({...newClient, person: e.target.value})} />
                <input placeholder="Telefon" className="p-2 border rounded" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
             </div>
             <div className="flex gap-2 mt-3">
                <button onClick={handleAddClient} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Zapisz</button>
                <button onClick={() => setShowAddClient(false)} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">Anuluj</button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map(client => (
            <div key={client.id} onClick={() => { setSelectedClientId(client.id); setView('CLIENT_DETAIL'); }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{client.name}</h3>
                  <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                    <Icons.Truck className="w-3 h-3" /> {client.address}
                  </p>
                  <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                    <Icons.Users className="w-3 h-3" /> {client.contactPerson} ({client.phone})
                  </p>
                </div>
                <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
                  {client.machines.length} maszyn
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ClientDetailView = () => {
    const client = clients.find(c => c.id === selectedClientId);
    const [showAddMachine, setShowAddMachine] = useState(false);
    const [newMachine, setNewMachine] = useState<Partial<ClientMachine>>({});

    if (!client) return <div>Błąd: Nie znaleziono klienta</div>;

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
        <button onClick={() => setView('CLIENTS')} className="flex items-center text-slate-500 hover:text-slate-800 mb-2">
          <Icons.ArrowRight className="w-4 h-4 rotate-180 mr-1" /> Wróć do listy klientów
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{client.name}</h1>
              <p className="text-slate-600">{client.address}</p>
              <div className="mt-2 text-sm text-slate-500">
                Kontakt: <span className="font-medium text-slate-700">{client.contactPerson}</span> • Tel: <span className="font-medium text-slate-700">{client.phone}</span>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg hidden md:block">
               <Icons.Building className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-700">Park Maszynowy</h3>
              {canManageClients && (
                <button onClick={() => setShowAddMachine(true)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-medium whitespace-nowrap">
                  + Dodaj Maszynę
                </button>
              )}
            </div>

            {showAddMachine && (
              <div className="bg-slate-50 p-4 rounded-lg border border-blue-100 mb-4">
                <h4 className="font-medium text-slate-700 mb-2">Rejestracja Nowego Sprzętu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input placeholder="Model Maszyny" className="p-2 border rounded" value={newMachine.model || ''} onChange={e => setNewMachine({...newMachine, model: e.target.value})} />
                  <input placeholder="Numer Seryjny" className="p-2 border rounded" value={newMachine.serialNumber || ''} onChange={e => setNewMachine({...newMachine, serialNumber: e.target.value})} />
                  <div>
                    <label className="text-xs text-slate-500 block">Data Instalacji</label>
                    <input type="date" className="p-2 border rounded w-full" value={newMachine.installDate || ''} onChange={e => setNewMachine({...newMachine, installDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block">Gwarancja do</label>
                    <input type="date" className="p-2 border rounded w-full" value={newMachine.warrantyUntil || ''} onChange={e => setNewMachine({...newMachine, warrantyUntil: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddMachine} className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Zapisz</button>
                  <button onClick={() => setShowAddMachine(false)} className="px-3 py-1.5 bg-slate-200 rounded hover:bg-slate-300 text-sm">Anuluj</button>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 min-w-[150px]">Model</th>
                      <th className="px-4 py-3 min-w-[120px]">Nr Seryjny</th>
                      <th className="px-4 py-3 min-w-[100px]">Instalacja</th>
                      <th className="px-4 py-3 min-w-[120px]">Gwarancja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {client.machines.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{m.model}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{m.serialNumber}</td>
                        <td className="px-4 py-3 text-slate-600">{m.installDate}</td>
                        <td className="px-4 py-3">
                          {new Date(m.warrantyUntil) > new Date() 
                            ? <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">Aktywna ({m.warrantyUntil})</span>
                            : <span className="text-slate-400 text-xs whitespace-nowrap">Wygasła ({m.warrantyUntil})</span>
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

  const UsersView = () => {
    // We store selected permissions locally for the form
    const [newUser, setNewUser] = useState<Partial<User>>({ 
      role: UserRole.TECHNICIAN,
      permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.TECHNICIAN] 
    });
    const [showAddUser, setShowAddUser] = useState(false);

    const handleRoleChange = (role: UserRole) => {
      setNewUser({
        ...newUser,
        role,
        permissions: ROLE_DEFAULT_PERMISSIONS[role] // Reset permissions to default for that role
      });
    };

    const togglePermission = (perm: Permission) => {
      if (!newUser.permissions) return;
      
      const has = newUser.permissions.includes(perm);
      if (has) {
        setNewUser({ ...newUser, permissions: newUser.permissions.filter(p => p !== perm) });
      } else {
        setNewUser({ ...newUser, permissions: [...newUser.permissions, perm] });
      }
    };

    const handleCreateUser = () => {
      if (newUser.name && newUser.email && newUser.password && newUser.permissions) {
        const u: User = {
          id: `u${Date.now()}`,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role!,
          permissions: newUser.permissions,
          password: newUser.password
        };
        setUsers([...users, u]);
        setShowAddUser(false);
        // Reset form
        setNewUser({ role: UserRole.TECHNICIAN, permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.TECHNICIAN] });
      }
    };

    const handleDeleteUser = (id: string) => {
      if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
        setUsers(users.filter(u => u.id !== id));
      }
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Zarządzanie Użytkownikami</h2>
          <button 
            onClick={() => setShowAddUser(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Icons.Plus className="w-4 h-4" />
            <span className="hidden md:inline">Dodaj Użytkownika</span>
            <span className="md:hidden">Dodaj</span>
          </button>
        </div>

        {showAddUser && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 mb-6">
            <h3 className="font-semibold text-lg mb-4">Nowy Pracownik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Imię i Nazwisko" className="p-2 border rounded" value={newUser.name || ''} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <input placeholder="Email" className="p-2 border rounded" value={newUser.email || ''} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <input type="password" placeholder="Hasło" className="p-2 border rounded" value={newUser.password || ''} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              <select className="p-2 border rounded" value={newUser.role} onChange={e => handleRoleChange(e.target.value as UserRole)}>
                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-slate-700 mb-2">Uprawnienia szczegółowe:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                {(Object.keys(PERMISSION_LABELS) as Permission[]).map(perm => (
                  <label key={perm} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={newUser.permissions?.includes(perm) || false} 
                      onChange={() => togglePermission(perm)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    {PERMISSION_LABELS[perm]}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAddUser(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Anuluj</button>
              <button onClick={handleCreateUser} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Utwórz Konto</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 min-w-[150px]">Pracownik</th>
                  <th className="px-6 py-3 min-w-[120px]">Rola</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3 hidden md:table-cell">Uprawnienia</th>
                  <th className="px-6 py-3 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                        ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : ''}
                        ${u.role === UserRole.WAREHOUSE ? 'bg-orange-100 text-orange-700' : ''}
                        ${u.role === UserRole.TECHNICIAN ? 'bg-blue-100 text-blue-700' : ''}
                      `}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 hidden md:table-cell">
                      <span title={u.permissions.join(', ')}>
                        {u.permissions.length} aktywnych
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const lowStock = parts.filter(p => p.quantity <= p.minLevel);
    const pendingJobs = jobs.filter(j => j.status !== JobStatus.COMPLETED && j.status !== JobStatus.CANCELED);
    const myJobs = currentUser?.role === UserRole.TECHNICIAN 
      ? pendingJobs // In a real app filter by assignee
      : pendingJobs;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Panel Główny</h2>
          <div className="hidden md:block text-sm text-slate-500">Witaj, <span className="font-semibold text-slate-800">{currentUser?.name}</span></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Aktywne Zlecenia</p>
                <p className="text-3xl font-bold text-blue-600">{myJobs.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Icons.Wrench className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Niski Stan</p>
                <p className="text-3xl font-bold text-orange-600">{lowStock.length}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Icons.Alert className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Wartość Magazynu</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {canManageInventory 
                    ? parts.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 })
                    : '---'}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Icons.Package className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts based on Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hasPermission('VIEW_JOBS') && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <h3 className="font-semibold text-slate-700 mb-3">Twoje Zadania</h3>
              {myJobs.slice(0, 3).map(job => (
                <div key={job.id} onClick={() => {setSelectedJobId(job.id); setView('JOB_DETAIL')}} className="p-3 hover:bg-slate-50 rounded cursor-pointer border-b border-slate-50 last:border-0">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-800">{job.clientName}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{job.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{job.machineModel}</p>
                </div>
              ))}
              {myJobs.length === 0 && <p className="text-slate-400 text-sm italic">Brak przypisanych zadań.</p>}
            </div>
          )}

          {hasPermission('VIEW_INVENTORY') && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
               <h3 className="font-semibold text-slate-700 mb-3">Braki w Magazynie</h3>
               {lowStock.slice(0, 3).map(p => (
                 <div key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded border-b border-slate-50 last:border-0">
                   <div>
                     <p className="text-sm font-medium text-slate-800">{p.name}</p>
                     <p className="text-xs text-slate-400">Stan: {p.quantity} (Min: {p.minLevel})</p>
                   </div>
                   {canManageInventory && (
                    <button onClick={() => addStock(p.id, 5)} className="text-blue-600 text-xs hover:underline">+ Zamów</button>
                   )}
                 </div>
               ))}
               {lowStock.length === 0 && <p className="text-slate-400 text-sm italic">Stany magazynowe w normie.</p>}
             </div>
          )}
        </div>
      </div>
    );
  };

  const InventoryView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    // New part form state
    const [newPart, setNewPart] = useState<Partial<Part>>({ category: PartCategory.MECHANICAL, quantity: 0, minLevel: 0, price: 0 });

    const filteredParts = parts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreatePart = () => {
      if(!newPart.name || !newPart.sku) return;
      const p: Part = {
        id: `p${Date.now()}`,
        name: newPart.name,
        sku: newPart.sku,
        category: newPart.category as PartCategory,
        quantity: Number(newPart.quantity),
        minLevel: Number(newPart.minLevel),
        price: Number(newPart.price),
        location: newPart.location || 'Magazyn'
      };
      setParts([...parts, p]);
      setShowAddForm(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Magazyn Części</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Szukaj po nazwie lub SKU..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {canManageInventory && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Icons.Plus className="w-4 h-4" />
                <span className="hidden md:inline">Dodaj Nową</span>
                <span className="md:hidden">Dodaj</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Part Modal / Inline Form */}
        {showAddForm && canManageInventory && (
          <div className="bg-slate-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
             <h3 className="font-semibold mb-3 text-slate-700">Dodawanie nowej części</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input placeholder="Nazwa" className="p-2 border rounded" value={newPart.name || ''} onChange={e => setNewPart({...newPart, name: e.target.value})} />
                <input placeholder="SKU" className="p-2 border rounded" value={newPart.sku || ''} onChange={e => setNewPart({...newPart, sku: e.target.value})} />
                <select className="p-2 border rounded" value={newPart.category} onChange={e => setNewPart({...newPart, category: e.target.value as PartCategory})}>
                  {Object.values(PartCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="Lokalizacja (np. A-01)" className="p-2 border rounded" value={newPart.location || ''} onChange={e => setNewPart({...newPart, location: e.target.value})} />
                <input type="number" placeholder="Ilość" className="p-2 border rounded" value={newPart.quantity} onChange={e => setNewPart({...newPart, quantity: Number(e.target.value)})} />
                <input type="number" placeholder="Min. stan" className="p-2 border rounded" value={newPart.minLevel} onChange={e => setNewPart({...newPart, minLevel: Number(e.target.value)})} />
                <input 
                  type="number" 
                  placeholder="Cena PLN" 
                  className={`p-2 border rounded ${!canEditPrices ? 'bg-slate-100 text-slate-400' : ''}`}
                  value={newPart.price} 
                  onChange={e => setNewPart({...newPart, price: Number(e.target.value)})} 
                  disabled={!canEditPrices}
                />
                <div className="flex gap-2 col-span-2 md:col-span-1">
                  <button onClick={handleCreatePart} className="flex-1 bg-green-600 text-white rounded hover:bg-green-700">Zapisz</button>
                  <button onClick={() => setShowAddForm(false)} className="px-3 bg-slate-200 rounded hover:bg-slate-300">Anuluj</button>
                </div>
             </div>
             {!canEditPrices && <p className="text-xs text-orange-600 mt-2">Brak uprawnień do edycji cen (użyta zostanie cena 0.00 PLN)</p>}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">Nazwa</th>
                  <th className="px-4 py-3 hidden md:table-cell">Kategoria</th>
                  <th className="px-4 py-3 text-center">Dostępne</th>
                  <th className="px-4 py-3 text-center">Lokalizacja</th>
                  <th className="px-4 py-3 text-right">Cena</th>
                  {canManageInventory && <th className="px-4 py-3 text-center">Przyjęcie</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParts.map(part => (
                  <tr key={part.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{part.name}</div>
                      <div className="text-xs text-slate-400">{part.sku}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                        {part.category}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${part.quantity <= part.minLevel ? 'text-red-600' : 'text-slate-700'}`}>
                      {part.quantity}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 whitespace-nowrap">{part.location}</td>
                    <td className="px-4 py-3 text-right text-slate-600 whitespace-nowrap">{part.price.toFixed(2)} zł</td>
                    {canManageInventory && (
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => addStock(part.id, 1)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Icons.Plus className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const JobsView = () => {
    const [filterStatus, setFilterStatus] = useState<JobStatus | 'ALL'>('ALL');
    const [showNewJob, setShowNewJob] = useState(false);
    const [newJobData, setNewJobData] = useState({ clientId: '', machine: '', desc: '' });
    
    // Derived state for the form
    const selectedClientForJob = clients.find(c => c.id === newJobData.clientId);

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
          <h2 className="text-2xl font-bold text-slate-800">Zlecenia Serwisowe</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 flex-1 md:flex-initial"
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
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800">Rejestracja Usterki</h3>
                 <button onClick={() => setShowNewJob(false)} className="text-slate-400 hover:text-slate-600">
                   <Icons.Minus className="w-5 h-5 rotate-45" />
                 </button>
               </div>
               <div className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Wybierz Klienta</label>
                   <select 
                      className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500" 
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
                   <label className="block text-sm font-medium text-slate-700 mb-1">Wybierz Urządzenie</label>
                   <select 
                      className="w-full p-2.5 border rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-400 focus:ring-2 focus:ring-blue-500"
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
                   <label className="block text-sm font-medium text-slate-700 mb-1">Opis Problemu</label>
                   <textarea 
                     className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                     rows={3} 
                     value={newJobData.desc} 
                     onChange={e => setNewJobData({...newJobData, desc: e.target.value})} 
                     placeholder="Opisz usterkę..." 
                   />
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                   <button onClick={() => setShowNewJob(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Anuluj</button>
                   <button onClick={handleCreateJob} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md" disabled={!newJobData.clientId || !newJobData.machine}>Utwórz Zlecenie</button>
                 </div>
               </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map(job => (
            <div key={job.id} 
              onClick={() => { setSelectedJobId(job.id); setView('JOB_DETAIL'); }}
              className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                      ${job.status === JobStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${job.status === JobStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : ''}
                      ${job.status === JobStatus.COMPLETED ? 'bg-green-100 text-green-800' : ''}
                      ${job.status === JobStatus.CANCELED ? 'bg-gray-100 text-gray-600' : ''}
                    `}>
                      {job.status}
                    </span>
                    <span className="text-xs text-slate-400">#{job.id} • {job.dateCreated}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{job.machineModel}</h3>
                  <p className="text-slate-600 font-medium">{job.clientName}</p>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-1">{job.description}</p>
                </div>
                <Icons.ArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const JobDetailView = () => {
    const job = jobs.find(j => j.id === selectedJobId);
    const [notes, setNotes] = useState(job?.technicianNotes || '');
    
    // Picklist Mode state
    const [showPicklistModal, setShowPicklistModal] = useState(false);

    if (!job) return <div>Błąd: Nie znaleziono zlecenia</div>;

    const usedPartsList = job.usedParts.map(up => {
      const partDetails = parts.find(p => p.id === up.partId);
      return { ...up, details: partDetails };
    });

    const isJobActive = job.status === JobStatus.IN_PROGRESS;
    const isJobPending = job.status === JobStatus.PENDING;

    // --- PICKLIST MODAL ---
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col print:shadow-none print:w-full print:max-w-none print:max-h-none print:h-auto overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center print:border-black shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 print:text-black">Lista Kompletacyjna (Picklist)</h2>
                <p className="text-slate-500 print:text-black">Zlecenie #{job.id} • {job.clientName}</p>
              </div>
              <div className="flex gap-2 print:hidden">
                <button onClick={() => setShowPicklistModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Zamknij</button>
                <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Icons.Package className="w-4 h-4" /> Drukuj
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 print:overflow-visible">
              <div className="mb-6 print:mb-8">
                <div className="text-sm font-semibold text-slate-500 uppercase mb-2">Szczegóły Maszyny</div>
                <div className="text-lg font-bold print:text-xl">{job.machineModel}</div>
                <div className="text-slate-600">{job.description}</div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Pozycje do pobrania</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm print:text-base">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs print:bg-transparent print:text-black print:border-b-2 print:border-black">
                    <tr>
                      <th className="px-4 py-3 print:px-0">Lokalizacja</th>
                      <th className="px-4 py-3 print:px-0">SKU / Nazwa</th>
                      <th className="px-4 py-3 text-right print:px-0">Ilość</th>
                      <th className="px-4 py-3 text-center print:hidden">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-black">
                    {picklistItems.map(item => (
                      <tr key={item.partId} className="print:h-12">
                        <td className="px-4 py-3 font-mono font-bold text-lg print:px-0">{item.details?.location}</td>
                        <td className="px-4 py-3 print:px-0">
                          <div className="font-bold">{item.details?.sku}</div>
                          <div className="text-slate-600 print:text-black">{item.details?.name}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-lg print:px-0">{item.quantity}</td>
                        <td className="px-4 py-3 text-center print:hidden">
                          <button onClick={() => removeFromPicklist(job.id, item.partId)} className="text-red-500 hover:bg-red-50 p-2 rounded">
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

              {/* Add items (Hidden when printing) */}
              <div className="mt-8 pt-6 border-t border-slate-100 print:hidden">
                <h4 className="font-semibold text-slate-700 mb-4">Dodaj do listy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {parts.map(part => (
                    <button 
                      key={part.id} 
                      onClick={() => addToPicklist(job.id, part.id)}
                      className="text-left p-3 border border-slate-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between">
                         <span className="font-medium text-sm">{part.name}</span>
                         <span className="text-xs bg-slate-100 px-1 rounded">{part.quantity}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Loc: {part.location}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Print Footer */}
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
            body * {
              visibility: hidden;
            }
            #root {
              display: none;
            }
            .fixed.inset-0.z-50 {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background: white;
              z-index: 9999;
              display: block !important;
            }
            .fixed.inset-0.z-50 * {
              visibility: visible;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:text-black {
              color: black !important;
            }
          }
        `}</style>
        
        {showPicklistModal && <PicklistModal />}

        <button onClick={() => setView('JOBS')} className="flex items-center text-slate-500 hover:text-slate-800 mb-2">
          <Icons.ArrowRight className="w-4 h-4 rotate-180 mr-1" /> Wróć do listy
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 border-b border-slate-100 pb-6">
             <div>
               <h1 className="text-2xl font-bold text-slate-800">{job.machineModel}</h1>
               <p className="text-lg text-slate-600">{job.clientName}</p>
               <div className="mt-2 text-sm text-slate-500">Zgłoszenie: {job.description}</div>
             </div>
             <div className="flex flex-col items-end gap-2">
               <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium text-sm">{job.status}</span>
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
            
            {/* Left Column: Diagnostics (Technician Notes) */}
            <div className="space-y-6">
              {/* Technician Notes */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">Notatki Serwisanta</label>
                <textarea 
                  disabled={job.status === JobStatus.COMPLETED || !canManageJobs}
                  className="w-full border border-slate-200 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Opisz przebieg naprawy..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Parts Management */}
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Icons.Wrench className="w-5 h-5 text-slate-500" />
                Zużyte Części
              </h3>
              
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                {usedPartsList.length > 0 ? (
                  <ul className="divide-y divide-slate-200">
                    {usedPartsList.map((up) => (
                      <li key={up.partId} className="p-3 flex justify-between items-center bg-white">
                        <div>
                          <span className="font-medium text-slate-800">{up.details?.name || 'Nieznana część'}</span>
                          <div className="text-xs text-slate-500">{up.details?.sku}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700">{up.quantity} szt.</span>
                          {isJobActive && canManageJobs && (
                            <button 
                              onClick={() => removePartFromJob(job.id, up.partId)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
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
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Dodaj część z magazynu</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {parts.filter(p => p.quantity > 0).map(part => (
                      <button 
                        key={part.id}
                        onClick={() => usePartInJob(job.id, part.id)}
                        className="w-full flex justify-between items-center p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 text-left group"
                      >
                         <span className="text-sm text-slate-700 truncate max-w-[70%]">{part.name}</span>
                         <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{part.quantity} w mag.</span>
                           <Icons.Plus className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100" />
                         </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          {isJobActive && canManageJobs && (
             <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
               <button 
                onClick={() => handleFinishJob(job.id, notes)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1"
               >
                 <Icons.Check className="w-5 h-5" />
                 Zakończ Zlecenie (Pobierz części)
               </button>
             </div>
          )}
           {job.status === JobStatus.COMPLETED && (
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-green-700 font-medium bg-green-50 p-3 rounded-lg">
              Zlecenie zakończone {job.dateCreated}
            </div>
          )}
        </div>
      </div>
    );
  };

  const Sidebar = () => (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-4 print:hidden z-20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Icons.Wrench className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">GymFix WMS</span>
      </div>

      <nav className="space-y-2 flex-1">
        <button 
          onClick={() => setView('DASHBOARD')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Icons.Dashboard className="w-5 h-5" />
          Dashboard
        </button>
        {hasPermission('VIEW_JOBS') && (
          <button 
            onClick={() => setView('JOBS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'JOBS' || view === 'JOB_DETAIL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Icons.Wrench className="w-5 h-5" />
            Zlecenia
          </button>
        )}
        {hasPermission('VIEW_CLIENTS') && (
          <button 
            onClick={() => setView('CLIENTS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'CLIENTS' || view === 'CLIENT_DETAIL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Icons.Building className="w-5 h-5" />
            Klienci
          </button>
        )}
        {hasPermission('VIEW_INVENTORY') && (
          <button 
            onClick={() => setView('INVENTORY')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'INVENTORY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Icons.Package className="w-5 h-5" />
            Magazyn
          </button>
        )}
        {canManageUsers && (
          <button 
            onClick={() => setView('USERS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'USERS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Icons.Users className="w-5 h-5" />
            Użytkownicy
          </button>
        )}
        {canManageUsers && (
          <button 
            onClick={() => setView('SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'SETTINGS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Icons.Settings className="w-5 h-5" />
            Ustawienia
          </button>
        )}
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
  );

  const MobileMenuOverlay = () => {
    if (!isMobileMenuOpen) return null;
    return (
      <div className="md:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}>
        <div 
          className="absolute bottom-20 right-4 w-64 bg-white rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-10"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {currentUser?.name.substring(0,2)}
            </div>
            <div>
               <p className="font-bold text-slate-800 text-sm">{currentUser?.name}</p>
               <p className="text-xs text-slate-500">{currentUser?.role}</p>
            </div>
          </div>

          <div className="space-y-1">
             {canManageUsers && (
              <button onClick={() => { setView('USERS'); setIsMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-700 text-sm flex items-center gap-3">
                <Icons.Users className="w-4 h-4" /> Użytkownicy
              </button>
             )}
             <button onClick={() => { setView('SETTINGS'); setIsMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-700 text-sm flex items-center gap-3">
               <Icons.Settings className="w-4 h-4" /> Ustawienia
             </button>
             <div className="h-px bg-slate-100 my-2"></div>
             <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-red-600 text-sm flex items-center gap-3">
               <Icons.LogOut className="w-4 h-4" /> Wyloguj
             </button>
          </div>
        </div>
      </div>
    );
  };

  const MobileNav = () => (
    <>
      <MobileMenuOverlay />
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around items-center z-40 pb-safe print:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => setView('DASHBOARD')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${view === 'DASHBOARD' ? 'text-blue-600' : 'text-slate-400'}`}>
          <Icons.Dashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Start</span>
        </button>
        {hasPermission('VIEW_JOBS') && (
          <button onClick={() => setView('JOBS')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${view === 'JOBS' || view === 'JOB_DETAIL' ? 'text-blue-600' : 'text-slate-400'}`}>
            <Icons.Wrench className="w-6 h-6" />
            <span className="text-[10px] font-medium">Zlecenia</span>
          </button>
        )}
        {hasPermission('VIEW_INVENTORY') && (
          <button onClick={() => setView('INVENTORY')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${view === 'INVENTORY' ? 'text-blue-600' : 'text-slate-400'}`}>
            <Icons.Package className="w-6 h-6" />
            <span className="text-[10px] font-medium">Magazyn</span>
          </button>
        )}
        {hasPermission('VIEW_CLIENTS') && (
          <button onClick={() => setView('CLIENTS')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${view === 'CLIENTS' ? 'text-blue-600' : 'text-slate-400'}`}>
            <Icons.Building className="w-6 h-6" />
            <span className="text-[10px] font-medium">Klienci</span>
          </button>
        )}
        
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${isMobileMenuOpen ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
          </div>
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </>
  );

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 print:bg-white">
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 min-h-screen pb-24 md:pb-8 print:m-0 print:p-0 transition-all duration-300">
        {view === 'DASHBOARD' && <Dashboard />}
        {view === 'INVENTORY' && <InventoryView />}
        {view === 'JOBS' && <JobsView />}
        {view === 'JOB_DETAIL' && <JobDetailView />}
        {view === 'CLIENTS' && <ClientsView />}
        {view === 'CLIENT_DETAIL' && <ClientDetailView />}
        {view === 'USERS' && <UsersView />}
        {view === 'SETTINGS' && <SettingsView />}
      </main>
      <MobileNav />
    </div>
  );
};

export default GymFixApp;
