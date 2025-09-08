-- Create function to handle new user signup for marketplace profiles
CREATE OR REPLACE FUNCTION public.handle_new_marketplace_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.marketplace_profiles (user_id, email, first_name, last_name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'surfer'),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  
  RETURN new;
END;
$$;

-- Create trigger to automatically create marketplace profile on user signup
CREATE TRIGGER on_auth_user_created_marketplace
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_marketplace_user();