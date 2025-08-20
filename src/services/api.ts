// API Service Layer (will connect to Express backend)
import { 
  Client, 
  Staff, 
  Service, 
  Product, 
  Appointment, 
  Sale,
  DailyReport,
  MonthlyReport,
  AppointmentSuggestion,
  SuggestAppointmentRequest,
  CreateSaleRequest
} from '@/types';

// Base API configuration
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

// Generic API request function
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Client API
export const clientsApi = {
  search: (query: string) => apiRequest<Client[]>(`/clients?query=${encodeURIComponent(query)}`),
  getAll: () => apiRequest<Client[]>('/clients'),
  getById: (id: string) => apiRequest<Client>(`/clients/${id}`),
  create: (data: Partial<Client>) => apiRequest<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Client>) => apiRequest<Client>(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<void>(`/clients/${id}`, { method: 'DELETE' }),
};

// Staff API
export const staffApi = {
  getAll: () => apiRequest<Staff[]>('/staff'),
  getById: (id: string) => apiRequest<Staff>(`/staff/${id}`),
  create: (data: Partial<Staff>) => apiRequest<Staff>('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Staff>) => apiRequest<Staff>(`/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<void>(`/staff/${id}`, { method: 'DELETE' }),
};

// Services API
export const servicesApi = {
  getAll: (activeOnly = false) => apiRequest<Service[]>(`/services${activeOnly ? '?active=true' : ''}`),
  getById: (id: string) => apiRequest<Service>(`/services/${id}`),
  create: (data: Partial<Service>) => apiRequest<Service>('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Service>) => apiRequest<Service>(`/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<void>(`/services/${id}`, { method: 'DELETE' }),
};

// Products API
export const productsApi = {
  getAll: () => apiRequest<Product[]>('/products'),
  getLowStock: () => apiRequest<Product[]>('/products/lowstock'),
  getById: (id: string) => apiRequest<Product>(`/products/${id}`),
  create: (data: Partial<Product>) => apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Product>) => apiRequest<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<void>(`/products/${id}`, { method: 'DELETE' }),
};

// Appointments API
export const appointmentsApi = {
  getAll: (filters?: { from?: string; to?: string; staffId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.staffId) params.append('staffId', filters.staffId);
    return apiRequest<Appointment[]>(`/appointments?${params.toString()}`);
  },
  getById: (id: string) => apiRequest<Appointment>(`/appointments/${id}`),
  create: (data: Partial<Appointment>) => apiRequest<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStatus: (id: string, status: Appointment['status']) => 
    apiRequest<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  suggest: (data: SuggestAppointmentRequest) => 
    apiRequest<AppointmentSuggestion[]>('/appointments/suggest', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Sales API
export const salesApi = {
  create: (data: CreateSaleRequest) => apiRequest<Sale>('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getById: (id: string) => apiRequest<Sale>(`/sales/${id}`),
};

// Reports API
export const reportsApi = {
  daily: (date: string) => apiRequest<DailyReport>(`/reports/daily?date=${date}`),
  monthly: (month: string) => apiRequest<MonthlyReport>(`/reports/monthly?month=${month}`),
  topServices: (from: string, to: string) => 
    apiRequest<Array<{ name: string; count: number; revenue: number }>>(`/reports/top-services?from=${from}&to=${to}`),
  staffPerformance: (from: string, to: string) => 
    apiRequest<Array<{ staffName: string; appointments: number; revenue: number; commission: number }>>(`/reports/staff-performance?from=${from}&to=${to}`),
};

// Utilities API
export const utilsApi = {
  createBackup: () => apiRequest<{ path: string; size: number }>('/backup/create'),
};

// Mock data for development (replace with real API calls)
export const mockData = {
  clients: [
    {
      id: '1',
      name: 'Sarah Johnson',
      phone: '+1234567890',
      email: 'sarah.j@email.com',
      gender: 'female',
      allergies: 'None',
      notes: 'Prefers morning appointments',
      tags: ['VIP', 'Regular'],
      createdAt: new Date('2024-01-15'),
      appointments: [],
      sales: [],
    },
    {
      id: '2',
      name: 'Michael Chen',
      phone: '+1234567891',
      email: 'mike.chen@email.com',
      gender: 'male',
      allergies: 'Sensitive skin',
      notes: 'Prefers male stylists',
      tags: ['Regular'],
      createdAt: new Date('2024-02-01'),
      appointments: [],
      sales: [],
    },
  ] as Client[],

  staff: [
    {
      id: '1',
      name: 'Emma Wilson',
      role: 'stylist' as const,
      commissionPct: 15,
      active: true,
      appointments: [],
    },
    {
      id: '2',
      name: 'James Rodriguez',
      role: 'stylist' as const,
      commissionPct: 12,
      active: true,
      appointments: [],
    },
    {
      id: '3',
      name: 'Maria Garcia',
      role: 'beautician' as const,
      commissionPct: 10,
      active: true,
      appointments: [],
    },
  ] as Staff[],

  services: [
    {
      id: '1',
      name: 'Hair Styling',
      category: 'Hair',
      durationM: 90,
      price: 85,
      taxPct: 8,
      active: true,
      appointments: [],
    },
    {
      id: '2',
      name: 'Haircut & Beard Trim',
      category: 'Hair',
      durationM: 45,
      price: 35,
      taxPct: 8,
      active: true,
      appointments: [],
    },
    {
      id: '3',
      name: 'Facial Treatment',
      category: 'Skin',
      durationM: 60,
      price: 65,
      taxPct: 8,
      active: true,
      appointments: [],
    },
  ] as Service[],

  products: [
    {
      id: '1',
      name: 'Professional Shampoo',
      sku: 'SHA-001',
      category: 'Hair Care',
      price: 25,
      cost: 12,
      stockQty: 3,
      reorderAt: 5,
      expiryAt: new Date('2025-12-31'),
    },
    {
      id: '2',
      name: 'Moisturizing Cream',
      sku: 'MOI-001',
      category: 'Skin Care',
      price: 45,
      cost: 22,
      stockQty: 15,
      reorderAt: 10,
      expiryAt: new Date('2025-06-30'),
    },
  ] as Product[],
};