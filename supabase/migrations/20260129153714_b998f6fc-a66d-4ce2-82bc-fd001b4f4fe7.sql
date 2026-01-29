-- Enable realtime for bonus_hunts and slots tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bonus_hunts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.slots;