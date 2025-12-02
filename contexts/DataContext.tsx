import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Part, ServiceJob, JobStatus, PartCategory, User, UserRole, Client, ClientMachine, Permission } from '../types';

// --- INITIAL MOCK DATA ---
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
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

// --- HELPERS ---
const loadFromStorage = <T,>(key: string, initial: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return initial;
  }
};

interface DataContextType {
  users: User[];
  parts: Part[];
  jobs: ServiceJob[];
  clients: Client[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setParts: React.Dispatch<React.SetStateAction<Part[]>>;
  setJobs: React.Dispatch<React.SetStateAction<ServiceJob[]>>;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  
  // Actions
  addStock: (partId: string, amount: number) => void;
  createJob: (client: string, machine: string, desc: string) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  usePartInJob: (jobId: string, partId: string) => void;
  removePartFromJob: (jobId: string, partId: string) => void;
  addToPicklist: (jobId: string, partId: string) => void;
  removeFromPicklist: (jobId: string, partId: string) => void;
  finishJob: (jobId: string, notes: string) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('gymfix_users', INITIAL_USERS));
  const [parts, setParts] = useState<Part[]>(() => loadFromStorage('gymfix_parts', INITIAL_PARTS));
  const [jobs, setJobs] = useState<ServiceJob[]>(() => loadFromStorage('gymfix_jobs', INITIAL_JOBS));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('gymfix_clients', INITIAL_CLIENTS));

  // Persistence
  useEffect(() => { localStorage.setItem('gymfix_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('gymfix_parts', JSON.stringify(parts)); }, [parts]);
  useEffect(() => { localStorage.setItem('gymfix_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('gymfix_clients', JSON.stringify(clients)); }, [clients]);

  // Actions
  const addStock = (partId: string, amount: number) => {
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
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const usePartInJob = (jobId: string, partId: string) => {
    const part = parts.find(p => p.id === partId);
    if (!part || part.quantity <= 0) {
      alert("Brak części w magazynie!");
      return;
    }
    // Decrement stock
    setParts(prev => prev.map(p => p.id === partId ? { ...p, quantity: p.quantity - 1 } : p));
    // Add to job
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const existing = job.usedParts.find(up => up.partId === partId);
      const newUsedParts = existing 
        ? job.usedParts.map(up => up.partId === partId ? { ...up, quantity: up.quantity + 1 } : up)
        : [...job.usedParts, { partId, quantity: 1 }];
      return { ...job, usedParts: newUsedParts };
    }));
  };

  const removePartFromJob = (jobId: string, partId: string) => {
    // Return stock
    setParts(prev => prev.map(p => p.id === partId ? { ...p, quantity: p.quantity + 1 } : p));
    // Remove from job
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const existing = job.usedParts.find(up => up.partId === partId);
      if (!existing) return job;
      const newUsedParts = existing.quantity > 1
        ? job.usedParts.map(up => up.partId === partId ? { ...up, quantity: up.quantity - 1 } : up)
        : job.usedParts.filter(up => up.partId !== partId);
      return { ...job, usedParts: newUsedParts };
    }));
  };

  const addToPicklist = (jobId: string, partId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const currentList = job.picklist || [];
      const existing = currentList.find(p => p.partId === partId);
      const newList = existing 
        ? currentList.map(p => p.partId === partId ? {...p, quantity: p.quantity + 1} : p)
        : [...currentList, { partId, quantity: 1 }];
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

  const finishJob = (jobId: string, notes: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: JobStatus.COMPLETED, technicianNotes: notes } : j));
  };

  const resetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <DataContext.Provider value={{ 
      users, parts, jobs, clients, 
      setUsers, setParts, setJobs, setClients,
      addStock, createJob, updateJobStatus, usePartInJob, removePartFromJob, 
      addToPicklist, removeFromPicklist, finishJob, resetData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};