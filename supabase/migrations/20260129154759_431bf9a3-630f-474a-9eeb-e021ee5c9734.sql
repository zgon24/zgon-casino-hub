-- Create storage bucket for slot images
INSERT INTO storage.buckets (id, name, public) VALUES ('slot-images', 'slot-images', true);

-- Allow anyone to view slot images (they're public for the widget)
CREATE POLICY "Anyone can view slot images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'slot-images');

-- Allow authenticated users to upload slot images
CREATE POLICY "Authenticated users can upload slot images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'slot-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their slot images
CREATE POLICY "Authenticated users can update slot images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'slot-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete slot images
CREATE POLICY "Authenticated users can delete slot images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'slot-images' AND auth.role() = 'authenticated');