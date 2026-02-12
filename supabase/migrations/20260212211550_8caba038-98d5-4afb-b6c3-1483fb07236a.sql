
-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create slot_catalog table for storing reusable slot metadata
CREATE TABLE public.slot_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Create unique index on name per user to avoid duplicates
CREATE UNIQUE INDEX idx_slot_catalog_name_user ON public.slot_catalog (LOWER(name), user_id);

-- Create index for search
CREATE INDEX idx_slot_catalog_name_search ON public.slot_catalog USING gin (name gin_trgm_ops);

-- Enable RLS
ALTER TABLE public.slot_catalog ENABLE ROW LEVEL SECURITY;

-- Users can view their own catalog
CREATE POLICY "Users can view their own slot catalog"
ON public.slot_catalog
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert to their own catalog
CREATE POLICY "Users can insert to their own slot catalog"
ON public.slot_catalog
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own catalog
CREATE POLICY "Users can update their own slot catalog"
ON public.slot_catalog
FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete from their own catalog
CREATE POLICY "Users can delete from their own slot catalog"
ON public.slot_catalog
FOR DELETE
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_slot_catalog_updated_at
BEFORE UPDATE ON public.slot_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
