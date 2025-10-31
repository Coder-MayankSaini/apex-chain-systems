-- Fix cross-account product visibility for verification
-- Run this script in your Supabase SQL Editor

-- First, check if the policy already exists and drop it if it does
DROP POLICY IF EXISTS "Public can view products for verification" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view all products for verification" ON public.products;

-- Add policy to allow all authenticated users to view products for verification
-- This is essential for cross-account product verification
CREATE POLICY "Authenticated users can view all products for verification"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

-- Also ensure that the nft_certificates table can be accessed for verification
DROP POLICY IF EXISTS "Authenticated users can view all certificates" ON public.nft_certificates;

-- Allow authenticated users to view all NFT certificates
CREATE POLICY "Authenticated users can view all certificates"
  ON public.nft_certificates FOR SELECT
  USING (auth.role() = 'authenticated');

-- Ensure verification_logs can be created by authenticated users for any product
DROP POLICY IF EXISTS "Authenticated users can create verification logs for any product" ON public.verification_logs;

CREATE POLICY "Authenticated users can create verification logs for any product"
  ON public.verification_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to view all verification logs
DROP POLICY IF EXISTS "Authenticated users can view all verification logs" ON public.verification_logs;

CREATE POLICY "Authenticated users can view all verification logs"
  ON public.verification_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Verify the policies are correctly applied
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('products', 'nft_certificates', 'verification_logs')
ORDER BY tablename, policyname;