-- Add vision_metadata column to store Google Vision API analysis results
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS vision_metadata JSONB;

-- Add index for better search performance on vision metadata
CREATE INDEX IF NOT EXISTS idx_products_vision_metadata ON products USING GIN (vision_metadata);

-- Add comment explaining the column
COMMENT ON COLUMN products.vision_metadata IS 'Stores Google Vision API analysis results including labels, objects, colors, and text detected in the product image';