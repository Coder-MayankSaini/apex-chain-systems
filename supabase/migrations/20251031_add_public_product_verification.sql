-- Add policy to allow anyone to view products for verification purposes
-- This enables cross-account product verification
CREATE POLICY "Public can view products for verification"
  ON public.products FOR SELECT
  USING (true);

-- Optional: If you want to restrict to authenticated users only
-- CREATE POLICY "Authenticated users can view all products for verification"
--   ON public.products FOR SELECT
--   USING (auth.role() = 'authenticated');

-- Add policy to allow authenticated users to create verification logs for any product
CREATE POLICY "Authenticated users can verify any product"
  ON public.verification_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Add policy to allow authenticated users to view verification logs
CREATE POLICY "Authenticated users can view all verification logs"
  ON public.verification_logs FOR SELECT
  USING (auth.role() = 'authenticated');