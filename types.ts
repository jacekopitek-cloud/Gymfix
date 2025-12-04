
export enum PartCategory {
  CABLES = 'Linki',
  ELECTRONICS = 'Elektronika',
  UPHOLSTERY = 'Tapicerka',
  MECHANICAL = 'Mechaniczne',
  CONSUMABLES = 'Eksploatacyjne',
  WEARABLE = 'Części zużywalne',
  ASSEMBLY = 'Złożenie (Zestaw)'
}

export enum PartType {
  SINGLE = 'Pojedyncza',
  ASSEMBLY = 'Złożony (BOM)'
}

export interface BOMItem {
  partId: string;
  quantity: number;
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: PartCategory;
  type: PartType;
  quantity: number;
  minLevel: number;
  price: number;
  location: string;
  bom?: BOMItem[]; // Only for PartType.ASSEMBLY
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

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'INVENTORY' | 'JOBS' | 'JOB_DETAIL' | 'USERS' | 'SETTINGS' | 'CLIENTS' | 'CLIENT_DETAIL';

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
  phone?: string;
  position?: string;
  role: UserRole;
  permissions: Permission[];
  password?: string; // In real app, hash this
}
