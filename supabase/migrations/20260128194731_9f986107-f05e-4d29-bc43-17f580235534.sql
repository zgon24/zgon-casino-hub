-- Create profiles table for streamer information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bonus_hunts table
CREATE TABLE public.bonus_hunts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Bonus Hunt',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  total_cost NUMERIC DEFAULT 0,
  total_result NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create slots table for bonus hunt entries
CREATE TABLE public.slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bonus_hunt_id UUID NOT NULL REFERENCES public.bonus_hunts(id) ON DELETE CASCADE,
  slot_name TEXT NOT NULL,
  bet_size NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  result NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'opened')),
  slot_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_hunts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

-- Helper function to check ownership
CREATE OR REPLACE FUNCTION public.is_bonus_hunt_owner(hunt_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bonus_hunts
    WHERE id = hunt_id AND user_id = auth.uid()
  );
$$;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid());

-- BONUS_HUNTS POLICIES
CREATE POLICY "Users can view their own bonus hunts"
ON public.bonus_hunts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Anyone can view active bonus hunts for widgets"
ON public.bonus_hunts FOR SELECT
USING (status = 'active');

CREATE POLICY "Users can insert their own bonus hunts"
ON public.bonus_hunts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bonus hunts"
ON public.bonus_hunts FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own bonus hunts"
ON public.bonus_hunts FOR DELETE
USING (user_id = auth.uid());

-- SLOTS POLICIES
CREATE POLICY "Users can view slots of their own bonus hunts"
ON public.slots FOR SELECT
USING (public.is_bonus_hunt_owner(bonus_hunt_id));

CREATE POLICY "Anyone can view slots of active bonus hunts for widgets"
ON public.slots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bonus_hunts
    WHERE id = slots.bonus_hunt_id AND status = 'active'
  )
);

CREATE POLICY "Users can insert slots to their own bonus hunts"
ON public.slots FOR INSERT
WITH CHECK (public.is_bonus_hunt_owner(bonus_hunt_id));

CREATE POLICY "Users can update slots of their own bonus hunts"
ON public.slots FOR UPDATE
USING (public.is_bonus_hunt_owner(bonus_hunt_id));

CREATE POLICY "Users can delete slots of their own bonus hunts"
ON public.slots FOR DELETE
USING (public.is_bonus_hunt_owner(bonus_hunt_id));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bonus_hunts_updated_at
BEFORE UPDATE ON public.bonus_hunts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create index for better performance on bonus_hunts queries
CREATE INDEX idx_bonus_hunts_user_id ON public.bonus_hunts(user_id);
CREATE INDEX idx_bonus_hunts_status ON public.bonus_hunts(status);
CREATE INDEX idx_slots_bonus_hunt_id ON public.slots(bonus_hunt_id);
CREATE INDEX idx_slots_order ON public.slots(bonus_hunt_id, slot_order);