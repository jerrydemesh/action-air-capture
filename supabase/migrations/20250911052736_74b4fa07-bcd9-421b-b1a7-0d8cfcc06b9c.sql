-- Drop and recreate the trigger completely to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a completely new, simpler trigger function
CREATE OR REPLACE FUNCTION public.handle_marketplace_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create marketplace profile if it doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.marketplace_profiles WHERE user_id = NEW.id) THEN
    INSERT INTO public.marketplace_profiles (user_id, email, first_name, last_name, role, phone)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'surfer'),
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_marketplace_user_signup();