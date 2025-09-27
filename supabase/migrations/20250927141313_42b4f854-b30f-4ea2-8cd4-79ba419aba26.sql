-- Add supplier mobile number column to products table
ALTER TABLE public.products 
ADD COLUMN supplier_mobile text;