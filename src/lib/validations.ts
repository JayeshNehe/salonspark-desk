import { z } from 'zod';

// Authentication validation
export const authSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
});

// Customer validation
export const customerSchema = z.object({
  first_name: z.string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(100, { message: "First name must be less than 100 characters" }),
  last_name: z.string()
    .trim()
    .min(1, { message: "Last name is required" })
    .max(100, { message: "Last name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must be less than 15 digits" })
    .regex(/^[0-9+\-\s()]+$/, { message: "Invalid phone number format" }),
  address: z.string()
    .max(500, { message: "Address must be less than 500 characters" })
    .optional(),
  date_of_birth: z.string().optional(),
  notes: z.string()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional()
});

// Staff validation
export const staffSchema = z.object({
  first_name: z.string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(100, { message: "First name must be less than 100 characters" }),
  last_name: z.string()
    .trim()
    .min(1, { message: "Last name is required" })
    .max(100, { message: "Last name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must be less than 15 digits" })
    .regex(/^[0-9+\-\s()]+$/, { message: "Invalid phone number format" }),
  role: z.string()
    .min(1, { message: "Role is required" })
    .max(100, { message: "Role must be less than 100 characters" }),
  specialization: z.array(z.string()).optional(),
  hire_date: z.string().min(1, { message: "Hire date is required" }),
  salary: z.number()
    .min(0, { message: "Salary must be positive" })
    .optional(),
  commission_rate: z.number()
    .min(0, { message: "Commission rate must be positive" })
    .max(100, { message: "Commission rate must be less than or equal to 100" })
    .optional(),
  status: z.enum(['active', 'inactive', 'on_leave'])
});

// Service validation
export const serviceSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Service name is required" })
    .max(200, { message: "Service name must be less than 200 characters" }),
  description: z.string()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional(),
  category_id: z.string().uuid().optional(),
  duration_minutes: z.number()
    .min(1, { message: "Duration must be at least 1 minute" })
    .max(1440, { message: "Duration must be less than 24 hours" }),
  price: z.number()
    .min(0, { message: "Price must be positive" })
    .max(999999, { message: "Price is too large" }),
  status: z.enum(['active', 'inactive']).optional()
});

// Product validation
export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Product name is required" })
    .max(200, { message: "Product name must be less than 200 characters" }),
  description: z.string()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional(),
  brand: z.string()
    .max(100, { message: "Brand must be less than 100 characters" })
    .optional(),
  category: z.string()
    .max(100, { message: "Category must be less than 100 characters" })
    .optional(),
  barcode: z.string()
    .max(50, { message: "Barcode must be less than 50 characters" })
    .optional(),
  cost_price: z.number()
    .min(0, { message: "Cost price must be positive" })
    .max(999999, { message: "Cost price is too large" }),
  selling_price: z.number()
    .min(0, { message: "Selling price must be positive" })
    .max(999999, { message: "Selling price is too large" }),
  stock_quantity: z.number()
    .int({ message: "Stock quantity must be a whole number" })
    .min(0, { message: "Stock quantity must be positive" }),
  min_stock_level: z.number()
    .int({ message: "Minimum stock level must be a whole number" })
    .min(0, { message: "Minimum stock level must be positive" })
    .optional(),
  supplier: z.string()
    .max(200, { message: "Supplier must be less than 200 characters" })
    .optional(),
  supplier_mobile: z.string()
    .max(15, { message: "Supplier mobile must be less than 15 digits" })
    .regex(/^[0-9+\-\s()]*$/, { message: "Invalid phone number format" })
    .optional()
});

// Appointment validation
export const appointmentSchema = z.object({
  customer_id: z.string().uuid({ message: "Valid customer is required" }),
  staff_id: z.string().uuid({ message: "Valid staff member is required" }).optional(),
  service_id: z.string().uuid({ message: "Valid service is required" }),
  appointment_date: z.string().min(1, { message: "Appointment date is required" }),
  start_time: z.string().min(1, { message: "Start time is required" }),
  end_time: z.string().min(1, { message: "End time is required" }),
  notes: z.string()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional()
});

// Salon registration validation
export const salonRegistrationSchema = z.object({
  salon_name: z.string()
    .trim()
    .min(1, { message: "Salon name is required" })
    .max(200, { message: "Salon name must be less than 200 characters" }),
  owner_name: z.string()
    .trim()
    .min(1, { message: "Owner name is required" })
    .max(100, { message: "Owner name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must be less than 15 digits" })
    .regex(/^[0-9+\-\s()]+$/, { message: "Invalid phone number format" }),
  address: z.string()
    .trim()
    .min(1, { message: "Address is required" })
    .max(500, { message: "Address must be less than 500 characters" }),
  city: z.string()
    .trim()
    .min(1, { message: "City is required" })
    .max(100, { message: "City must be less than 100 characters" }),
  state: z.string()
    .trim()
    .min(1, { message: "State is required" })
    .max(100, { message: "State must be less than 100 characters" }),
  zip_code: z.string()
    .trim()
    .min(1, { message: "Zip code is required" })
    .max(20, { message: "Zip code must be less than 20 characters" }),
  country: z.string()
    .trim()
    .min(1, { message: "Country is required" })
    .max(100, { message: "Country must be less than 100 characters" })
});
