-- Create sale_items table
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy for sale_items
CREATE POLICY "Users can manage their salon sale items"
  ON public.sale_items FOR ALL
  TO authenticated
  USING (sale_id IN (
    SELECT id FROM public.sales WHERE salon_id = public.get_user_salon_id(auth.uid())
  ))
  WITH CHECK (sale_id IN (
    SELECT id FROM public.sales WHERE salon_id = public.get_user_salon_id(auth.uid())
  ));