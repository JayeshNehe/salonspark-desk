// Database Types (matching Prisma schema)

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  allergies?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  appointments: Appointment[];
  sales: Sale[];
}

export interface Staff {
  id: string;
  name: string;
  role: 'stylist' | 'beautician' | 'receptionist' | 'admin';
  commissionPct: number;
  active: boolean;
  appointments: Appointment[];
}

export interface Service {
  id: string;
  name: string;
  category: string;
  durationM: number;
  price: number;
  taxPct: number;
  active: boolean;
  appointments: Appointment[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stockQty: number;
  reorderAt: number;
  expiryAt?: Date;
}

export interface Appointment {
  id: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  start: Date;
  end: Date;
  status: 'booked' | 'checked_in' | 'served' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: Date;
  Client: Client;
  Staff: Staff;
  Service: Service;
}

export interface Sale {
  id: string;
  at: Date;
  clientId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'wallet' | 'split';
  splitJson?: any;
  Client?: Client;
}

export interface SaleItem {
  id: string;
  saleId: string;
  kind: 'service' | 'product';
  refId: string;
  qty: number;
  price: number;
  taxPct: number;
  Sale: Sale;
}

export interface ChangeLog {
  id: string;
  table: string;
  rowId: string;
  op: 'insert' | 'update' | 'delete';
  at: Date;
  payload: any;
}

// API Response Types
export interface DailyReport {
  date: string;
  revenue: number;
  appointments: number;
  customers: number;
  services: Array<{ name: string; count: number; revenue: number }>;
}

export interface MonthlyReport {
  month: string;
  revenue: number;
  appointments: number;
  newCustomers: number;
  topServices: Array<{ name: string; count: number; revenue: number }>;
}

export interface AppointmentSuggestion {
  start: Date;
  end: Date;
  staffId: string;
  score: number;
}

export interface SuggestAppointmentRequest {
  serviceId: string;
  staffId?: string;
  date: string;
}

export interface CreateSaleRequest {
  clientId?: string;
  items: Array<{ kind: 'service' | 'product'; refId: string; qty: number }>;
  discount: number;
  payments: Array<{ mode: string; amount: number }>;
}