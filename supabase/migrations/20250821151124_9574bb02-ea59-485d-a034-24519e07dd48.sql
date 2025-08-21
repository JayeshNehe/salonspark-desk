-- Create a comprehensive salon management system schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff', 'user');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'wallet');
CREATE TYPE staff_status AS ENUM ('active', 'inactive', 'on_leave');
CREATE TYPE service_status AS ENUM ('active', 'inactive');

-- Profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  date_of_birth DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(phone)
);

-- Staff table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  specialization TEXT[],
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2),
  commission_rate DECIMAL(5,2) DEFAULT 0,
  status staff_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email),
  UNIQUE(phone)
);

-- Service categories table
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.service_categories(id),
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status service_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table for inventory
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  category TEXT,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  supplier TEXT,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barcode)
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales/Billing table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items table (for detailed breakdown)
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id),
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock movements table
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  reference_type TEXT, -- 'sale', 'purchase', 'adjustment'
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Users can view all data" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to access all salon data (for salon management app)
CREATE POLICY "Authenticated users can access customers" ON public.customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access staff" ON public.staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access service_categories" ON public.service_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access services" ON public.services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access sales" ON public.sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access sale_items" ON public.sale_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access stock_movements" ON public.stock_movements FOR ALL USING (auth.role() = 'authenticated');

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    return NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.service_categories (name, description) VALUES 
('Hair Care', 'Hair cutting, styling, and treatment services'),
('Skin Care', 'Facial treatments and skin care services'),
('Body Care', 'Massage and body treatment services'),
('Nail Care', 'Manicure and pedicure services');

INSERT INTO public.services (name, description, category_id, duration_minutes, price) VALUES 
('Haircut & Style', 'Professional haircut with styling', (SELECT id FROM public.service_categories WHERE name = 'Hair Care'), 60, 800.00),
('Deep Cleansing Facial', 'Deep pore cleansing facial treatment', (SELECT id FROM public.service_categories WHERE name = 'Skin Care'), 90, 1500.00),
('Full Body Massage', 'Relaxing full body massage therapy', (SELECT id FROM public.service_categories WHERE name = 'Body Care'), 120, 2000.00),
('Manicure & Pedicure', 'Complete nail care service', (SELECT id FROM public.service_categories WHERE name = 'Nail Care'), 75, 600.00);

INSERT INTO public.products (name, brand, category, cost_price, selling_price, stock_quantity, min_stock_level) VALUES 
('Shampoo Premium', 'L''Oreal', 'Hair Care', 450.00, 650.00, 25, 10),
('Face Cream Moisturizer', 'Olay', 'Skin Care', 800.00, 1200.00, 15, 5),
('Massage Oil', 'Himalaya', 'Body Care', 250.00, 400.00, 30, 10),
('Nail Polish', 'Lakme', 'Nail Care', 150.00, 250.00, 50, 20);

INSERT INTO public.staff (first_name, last_name, email, phone, role, specialization, hire_date, salary) VALUES 
('Priya', 'Sharma', 'priya@salon.com', '9876543210', 'Senior Stylist', ARRAY['Hair Cutting', 'Hair Styling'], '2023-01-15', 25000.00),
('Rajesh', 'Kumar', 'rajesh@salon.com', '9876543211', 'Massage Therapist', ARRAY['Body Massage', 'Aromatherapy'], '2023-03-01', 22000.00),
('Anjali', 'Patel', 'anjali@salon.com', '9876543212', 'Beauty Expert', ARRAY['Facial', 'Skin Care'], '2023-02-10', 24000.00);

INSERT INTO public.customers (first_name, last_name, email, phone, address) VALUES 
('Ravi', 'Gupta', 'ravi@example.com', '9123456789', 'Delhi, India'),
('Sneha', 'Singh', 'sneha@example.com', '9123456790', 'Mumbai, India'),
('Amit', 'Verma', 'amit@example.com', '9123456791', 'Bangalore, India');