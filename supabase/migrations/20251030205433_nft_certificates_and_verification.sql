-- Drop existing tables if they exist to ensure clean setup
DROP TABLE IF EXISTS public.product_authenticity_history CASCADE;
DROP TABLE IF EXISTS public.verification_logs CASCADE;
DROP TABLE IF EXISTS public.nft_certificates CASCADE;
DROP VIEW IF EXISTS public.nft_analytics CASCADE;

-- Create nft_certificates table for storing NFT certificate data
CREATE TABLE public.nft_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT NOT NULL UNIQUE,
    token_id BIGINT UNIQUE,
    contract_address TEXT NOT NULL,
    owner_address TEXT NOT NULL,
    metadata_uri TEXT,
    authenticity_score INTEGER CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
    qr_code TEXT NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    is_recalled BOOLEAN DEFAULT false,
    minted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create verification_logs table for tracking verification attempts
CREATE TABLE public.verification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT NOT NULL,
    nft_certificate_id UUID REFERENCES public.nft_certificates(id) ON DELETE CASCADE,
    verification_method TEXT NOT NULL CHECK (verification_method IN ('qr_scan', 'manual_search', 'api', 'nfc')),
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    vision_api_response JSONB,
    image_urls TEXT[] DEFAULT '{}',
    user_ip TEXT,
    user_agent TEXT,
    location JSONB,
    is_authentic BOOLEAN,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('success', 'failed', 'pending')),
    failure_reason TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create product_authenticity_history table for tracking score changes
CREATE TABLE public.product_authenticity_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nft_certificate_id UUID REFERENCES public.nft_certificates(id) ON DELETE CASCADE,
    old_score INTEGER,
    new_score INTEGER CHECK (new_score >= 0 AND new_score <= 100),
    changed_by TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_nft_certificates_product_id ON public.nft_certificates(product_id);
CREATE INDEX idx_nft_certificates_token_id ON public.nft_certificates(token_id);
CREATE INDEX idx_nft_certificates_owner_address ON public.nft_certificates(owner_address);
CREATE INDEX idx_nft_certificates_minted_at ON public.nft_certificates(minted_at DESC);
CREATE INDEX idx_nft_certificates_is_recalled ON public.nft_certificates(is_recalled);

CREATE INDEX idx_verification_logs_product_id ON public.verification_logs(product_id);
CREATE INDEX idx_verification_logs_nft_certificate_id ON public.verification_logs(nft_certificate_id);
CREATE INDEX idx_verification_logs_verified_at ON public.verification_logs(verified_at DESC);
CREATE INDEX idx_verification_logs_verification_status ON public.verification_logs(verification_status);

CREATE INDEX idx_authenticity_history_certificate_id ON public.product_authenticity_history(nft_certificate_id);
CREATE INDEX idx_authenticity_history_created_at ON public.product_authenticity_history(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.nft_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_authenticity_history ENABLE ROW LEVEL SECURITY;

-- Public read access for NFT certificates (anyone can verify)
CREATE POLICY "Public read access for NFT certificates" ON public.nft_certificates
    FOR SELECT
    USING (true);

-- Only authenticated users can insert NFT certificates
CREATE POLICY "Authenticated users can insert NFT certificates" ON public.nft_certificates
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update NFT certificates
CREATE POLICY "Authenticated users can update NFT certificates" ON public.nft_certificates
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Public can create verification logs (for tracking verifications)
CREATE POLICY "Public can create verification logs" ON public.verification_logs
    FOR INSERT
    WITH CHECK (true);

-- Public read access for verification logs
CREATE POLICY "Public read access for verification logs" ON public.verification_logs
    FOR SELECT
    USING (true);

-- Only authenticated users can view authenticity history
CREATE POLICY "Authenticated users can view authenticity history" ON public.product_authenticity_history
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only authenticated users can insert authenticity history
CREATE POLICY "Authenticated users can insert authenticity history" ON public.product_authenticity_history
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_nft_certificates_updated_at 
    BEFORE UPDATE ON public.nft_certificates 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create a view for analytics dashboard
CREATE OR REPLACE VIEW public.nft_analytics AS
SELECT 
    COUNT(DISTINCT nc.id) as total_certificates,
    COUNT(DISTINCT CASE WHEN nc.is_recalled THEN nc.id END) as recalled_products,
    AVG(nc.authenticity_score) as avg_authenticity_score,
    COUNT(DISTINCT vl.id) as total_verifications,
    COUNT(DISTINCT CASE WHEN vl.verification_status = 'success' THEN vl.id END) as successful_verifications,
    COUNT(DISTINCT CASE WHEN vl.verification_status = 'failed' THEN vl.id END) as failed_verifications
FROM public.nft_certificates nc
LEFT JOIN public.verification_logs vl ON nc.id = vl.nft_certificate_id;

-- Grant permissions for the analytics view
GRANT SELECT ON public.nft_analytics TO anon, authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.nft_certificates IS 'Stores NFT certificate data for F1 merchandise products';
COMMENT ON TABLE public.verification_logs IS 'Tracks all product verification attempts with AI scoring';
COMMENT ON TABLE public.product_authenticity_history IS 'Historical record of authenticity score changes';
COMMENT ON VIEW public.nft_analytics IS 'Analytics dashboard view for NFT certificates and verifications';
