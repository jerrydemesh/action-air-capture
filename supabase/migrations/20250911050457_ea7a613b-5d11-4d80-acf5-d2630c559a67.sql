-- Update the existing handle_new_user function to also create marketplace profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Create regular profile (existing functionality)
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  
  -- Create marketplace profile (new functionality)
  INSERT INTO public.marketplace_profiles (user_id, email, first_name, last_name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'surfer'),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  
  -- If the user is a patient, also create a patient record (existing functionality)
  IF COALESCE((new.raw_user_meta_data->>'role')::user_role, 'patient') = 'patient' THEN
    INSERT INTO public.patients (user_id)
    VALUES (new.id);
  END IF;
  
  RETURN new;
END;
$$;