-- Update listings with working image URLs
-- Run this in Supabase SQL Editor

UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"]' WHERE title LIKE '%Bandra%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"]' WHERE title LIKE '%Villa%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"]' WHERE title LIKE '%Koregaon%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"]' WHERE title LIKE '%Penthouse%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop"]' WHERE title LIKE '%Plot%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"]' WHERE title LIKE '%OMR%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"]' WHERE title LIKE '%Andheri%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"]' WHERE title LIKE '%Duplex%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop"]' WHERE title LIKE '%Studio%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop"]' WHERE title LIKE '%House%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"]' WHERE title LIKE '%Farmhouse%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"]' WHERE title LIKE '%Indiranagar%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"]' WHERE title LIKE '%JVLR%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop"]' WHERE title LIKE '%Jubilee%';
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop"]' WHERE title LIKE '%Dwarka%';

-- Set default image for any listings without images
UPDATE public.listings SET image_urls = '["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"]' WHERE image_urls = '[]' OR image_urls IS NULL;

-- Verify
SELECT title, image_urls FROM public.listings;
