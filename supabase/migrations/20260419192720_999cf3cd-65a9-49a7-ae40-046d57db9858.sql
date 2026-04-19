-- Clean up profiles where display_name was set to the email by handle_new_user trigger
-- For Twitch users, prefer the twitch_username as display_name when display_name looks like an email
UPDATE public.profiles
SET display_name = twitch_username
WHERE twitch_username IS NOT NULL
  AND display_name LIKE '%@%';