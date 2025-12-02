
export enum PartCategory {
  CABLES = 'Linki',
  ELECTRONICS = 'Elektronika',
  UPHOLSTERY = 'Tapicerka',
  MECHANICAL = 'Mechaniczne',
  CONSUMABLES = 'Eksploatacyjne',
  WEARABLE = 'Części zużywalne'
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: PartCategory;
  quantity: number;
  minLevel: number;
  price: number;
  location: string;
}

export enum JobStatus {
  PENDING = 'Oczekujące',
  IN_PROGRESS = 'W trakcie',
  COMPLETED = 'Zakończone',
  CANCELED = 'Anulowane'
}

export interface UsedPart {
  partId: string;
  quantity: number;
}

export interface ServiceJob {
  id: string;
  clientName: string;
  machineModel: string;
  description: string;
  status: JobStatus;
  dateCreated: string;
  technicianNotes?: string;
  usedParts: UsedPart[];
  picklist?: UsedPart[]; // Planned parts for warehouse pickup
  aiAnalysis?: string;
  assignedTechnicianId?: string;
}

export interface ClientMachine {
  id: string;
  model: string;
  serialNumber: string;
  installDate: string;
  warrantyUntil: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  machines: ClientMachine[];
}

export type ViewState = 'DASHBOARD' | 'INVENTORY' | 'JOBS' | 'JOB_DETAIL' | 'USERS' | 'SETTINGS' | 'CLIENTS' | 'CLIENT_DETAIL';

export enum UserRole {
  ADMIN = 'Administrator',
  WAREHOUSE = 'Magazynier',
  TECHNICIAN = 'Serwisant'
}

export type Permission = 
  | 'MANAGE_USERS' 
  | 'VIEW_INVENTORY' 
  | 'MANAGE_INVENTORY' 
  | 'EDIT_PRICES' 
  | 'VIEW_JOBS' 
  | 'MANAGE_JOBS' 
  | 'VIEW_CLIENTS' 
  | 'MANAGE_CLIENTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  password?: string; // In real app, hash this
}
