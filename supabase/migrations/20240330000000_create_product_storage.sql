-- Create storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create policy to allow public read access
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- Create policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update their own uploads
CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  AND auth.uid() = owner
);

-- Create policy to allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  AND auth.uid() = owner
);