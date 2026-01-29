-- Add new columns to slots table for images and special bonuses
ALTER TABLE public.slots 
ADD COLUMN image_url TEXT,
ADD COLUMN is_super BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_extreme BOOLEAN NOT NULL DEFAULT false;

-- Add new columns to bonus_hunts for start amount and hunt phase
ALTER TABLE public.bonus_hunts
ADD COLUMN start_amount NUMERIC DEFAULT 0,
ADD COLUMN hunt_phase TEXT NOT NULL DEFAULT 'collecting';

-- hunt_phase can be: 'collecting' (adding bonuses) or 'opening' (opening bonuses)
-- 'collecting' = still adding slots to the hunt
-- 'opening' = hunt started, now opening each bonus one by one

COMMENT ON COLUMN public.bonus_hunts.hunt_phase IS 'collecting = adding bonuses, opening = hunt started and opening bonuses';
COMMENT ON COLUMN public.slots.is_super IS 'Whether this is a super win';
COMMENT ON COLUMN public.slots.is_extreme IS 'Whether this is an extreme win';