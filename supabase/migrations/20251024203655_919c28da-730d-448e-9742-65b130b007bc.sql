-- Create enum for product status
CREATE TYPE public.product_status AS ENUM ('manufactured', 'in_transit', 'at_distributor', 'delivered', 'verified');

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  manufacturer_address TEXT,
  current_owner_address TEXT NOT NULL,
  blockchain_token_id TEXT,
  authenticity_hash TEXT NOT NULL,
  status public.product_status NOT NULL DEFAULT 'manufactured',
  verified BOOLEAN DEFAULT false,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  carrier TEXT,
  tracking_number TEXT,
  status public.product_status NOT NULL,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ownership transfers table
CREATE TABLE public.ownership_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  transaction_hash TEXT,
  transfer_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create verification logs table
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES public.profiles(id),
  verification_method TEXT NOT NULL,
  confidence_score DECIMAL(5,2),
  result BOOLEAN NOT NULL,
  image_hash TEXT,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ownership_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Brands can view their own products"
  ON public.products FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can insert their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = brand_id);

-- RLS Policies for shipments
CREATE POLICY "Brands can view shipments for their products"
  ON public.shipments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = shipments.product_id
      AND products.brand_id = auth.uid()
    )
  );

CREATE POLICY "Brands can insert shipments for their products"
  ON public.shipments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = shipments.product_id
      AND products.brand_id = auth.uid()
    )
  );

-- RLS Policies for ownership transfers
CREATE POLICY "Brands can view transfers for their products"
  ON public.ownership_transfers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = ownership_transfers.product_id
      AND products.brand_id = auth.uid()
    )
  );

CREATE POLICY "Brands can insert transfers for their products"
  ON public.ownership_transfers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = ownership_transfers.product_id
      AND products.brand_id = auth.uid()
    )
  );

-- RLS Policies for verification logs
CREATE POLICY "Brands can view verification logs for their products"
  ON public.verification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = verification_logs.product_id
      AND products.brand_id = auth.uid()
    )
  );

CREATE POLICY "Brands can insert verification logs for their products"
  ON public.verification_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = verification_logs.product_id
      AND products.brand_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_shipments_product_id ON public.shipments(product_id);
CREATE INDEX idx_ownership_transfers_product_id ON public.ownership_transfers(product_id);
CREATE INDEX idx_verification_logs_product_id ON public.verification_logs(product_id);