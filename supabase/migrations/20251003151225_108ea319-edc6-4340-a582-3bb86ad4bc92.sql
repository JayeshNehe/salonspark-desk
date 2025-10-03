-- Phase 1 & 2: Critical Security Fixes - Multi-Tenant Isolation and RBAC

-- Step 1: Create app_role enum for proper role management
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff', 'user');

-- Step 2: Create user_roles table (separate from profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    salon_id uuid REFERENCES public.salon_profiles(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, salon_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Add salon_id to all data tables for tenant isolation
ALTER TABLE public.customers ADD COLUMN salon_id uuid REFERENCES public.salon_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.staff ADD COLUMN salon_id uuid REFERENCES public.salon_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN salon_id uuid REFERENCES public.salon_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN salon_id uuid REFERENCES public.salon_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN salon_id uuid REFERENCES public.salon_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.sales ADD COLUMN salon_id uuid REFERENCES public.salon_profiles(id) ON DELETE CASCADE;

-- Step 4: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role, _salon_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role = _role
    AND salon_id = _salon_id
  )
$$;

-- Step 5: Create helper function to get user's salon_id
CREATE OR REPLACE FUNCTION public.get_user_salon_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.salon_profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Step 6: Drop ALL existing overly-permissive RLS policies
DROP POLICY IF EXISTS "Authenticated users can access customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can access staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated users can access services" ON public.services;
DROP POLICY IF EXISTS "Authenticated users can access products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can access appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can access sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can access sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can access stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Authenticated users can access service_categories" ON public.service_categories;

-- Step 7: Create tenant-scoped RLS policies for CUSTOMERS
CREATE POLICY "Users can view their salon's customers"
ON public.customers FOR SELECT
USING (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Users can create customers for their salon"
ON public.customers FOR INSERT
WITH CHECK (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Users can update their salon's customers"
ON public.customers FOR UPDATE
USING (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Admins can delete customers"
ON public.customers FOR DELETE
USING (public.has_role(auth.uid(), 'admin', salon_id));

-- Step 8: Create tenant-scoped RLS policies for STAFF
CREATE POLICY "Users can view their salon's staff"
ON public.staff FOR SELECT
USING (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Managers can create staff"
ON public.staff FOR INSERT
WITH CHECK (
  salon_id = public.get_user_salon_id(auth.uid()) AND
  (public.has_role(auth.uid(), 'admin', salon_id) OR public.has_role(auth.uid(), 'manager', salon_id))
);

CREATE POLICY "Managers can update staff"
ON public.staff FOR UPDATE
USING (
  salon_id = public.get_user_salon_id(auth.uid()) AND
  (public.has_role(auth.uid(), 'admin', salon_id) OR public.has_role(auth.uid(), 'manager', salon_id))
);

CREATE POLICY "Admins can delete staff"
ON public.staff FOR DELETE
USING (public.has_role(auth.uid(), 'admin', salon_id));

-- Step 9: Create tenant-scoped RLS policies for SERVICES
CREATE POLICY "Users can view their salon's services"
ON public.services FOR SELECT
USING (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Managers can manage services"
ON public.services FOR ALL
USING (
  salon_id = public.get_user_salon_id(auth.uid()) AND
  (public.has_role(auth.uid(), 'admin', salon_id) OR public.has_role(auth.uid(), 'manager', salon_id))
);

-- Step 10: Create tenant-scoped RLS policies for PRODUCTS
CREATE POLICY "Users can view their salon's products"
ON public.products FOR SELECT
USING (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Managers can manage products"
ON public.products FOR ALL
USING (
  salon_id = public.get_user_salon_id(auth.uid()) AND
  (public.has_role(auth.uid(), 'admin', salon_id) OR public.has_role(auth.uid(), 'manager', salon_id))
);

-- Step 11: Create tenant-scoped RLS policies for APPOINTMENTS
CREATE POLICY "Users can view their salon's appointments"
ON public.appointments FOR SELECT
USING (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Users can create appointments for their salon"
ON public.appointments FOR INSERT
WITH CHECK (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Users can update their salon's appointments"
ON public.appointments FOR UPDATE
USING (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Managers can delete appointments"
ON public.appointments FOR DELETE
USING (
  salon_id = public.get_user_salon_id(auth.uid()) AND
  (public.has_role(auth.uid(), 'admin', salon_id) OR public.has_role(auth.uid(), 'manager', salon_id))
);

-- Step 12: Create tenant-scoped RLS policies for SALES
CREATE POLICY "Users can view their salon's sales"
ON public.sales FOR SELECT
USING (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Users can create sales for their salon"
ON public.sales FOR INSERT
WITH CHECK (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Managers can update sales"
ON public.sales FOR UPDATE
USING (
  salon_id = public.get_user_salon_id(auth.uid()) AND
  (public.has_role(auth.uid(), 'admin', salon_id) OR public.has_role(auth.uid(), 'manager', salon_id))
);

CREATE POLICY "Admins can delete sales"
ON public.sales FOR DELETE
USING (public.has_role(auth.uid(), 'admin', salon_id));

-- Step 13: Create RLS policies for SALE_ITEMS (linked to sales)
CREATE POLICY "Users can view sale items for their salon's sales"
ON public.sale_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sales 
    WHERE sales.id = sale_items.sale_id 
    AND sales.salon_id = public.get_user_salon_id(auth.uid())
  )
);

CREATE POLICY "Users can create sale items for their salon"
ON public.sale_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sales 
    WHERE sales.id = sale_items.sale_id 
    AND sales.salon_id = public.get_user_salon_id(auth.uid())
  )
);

-- Step 14: Create RLS policies for STOCK_MOVEMENTS (linked to products)
CREATE POLICY "Users can view stock movements for their salon"
ON public.stock_movements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = stock_movements.product_id 
    AND products.salon_id = public.get_user_salon_id(auth.uid())
  )
);

CREATE POLICY "Users can create stock movements for their salon"
ON public.stock_movements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = stock_movements.product_id 
    AND products.salon_id = public.get_user_salon_id(auth.uid())
  )
);

-- Step 15: Create RLS policies for SERVICE_CATEGORIES
CREATE POLICY "Users can view service categories"
ON public.service_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage service categories"
ON public.service_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 16: Create RLS policies for USER_ROLES
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles in their salon"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin', salon_id));

-- Step 17: Remove role column from profiles (roles now in separate table)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Step 18: Create salon_settings table for secure settings storage
CREATE TABLE public.salon_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES public.salon_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_settings jsonb DEFAULT '{}'::jsonb,
  operational_settings jsonb DEFAULT '{}'::jsonb,
  notification_settings jsonb DEFAULT '{}'::jsonb,
  security_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.salon_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their salon's settings"
ON public.salon_settings FOR SELECT
USING (salon_id = public.get_user_salon_id(auth.uid()));

CREATE POLICY "Admins can manage salon settings"
ON public.salon_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin', salon_id));

-- Step 19: Create trigger for salon_settings updated_at
CREATE TRIGGER update_salon_settings_updated_at
BEFORE UPDATE ON public.salon_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();