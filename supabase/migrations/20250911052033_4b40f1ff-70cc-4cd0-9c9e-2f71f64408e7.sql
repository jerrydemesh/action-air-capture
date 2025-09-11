-- Fix the trigger function to handle marketplace roles properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_role_value TEXT;
BEGIN
  -- Get the role from metadata
  user_role_value := COALESCE(new.raw_user_meta_data->>'role', 'patient');
  
  -- Only create regular profiles for medical system users (patient, doctor, admin)
  -- For marketplace users (photographer, surfer), skip the profiles table
  IF user_role_value IN ('patient', 'doctor', 'admin') THEN
    INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'first_name', ''),
      COALESCE(new.raw_user_meta_data->>'last_name', ''),
      user_role_value::user_role
    );
    
    -- If the user is a patient, also create a patient record
    IF user_role_value = 'patient' THEN
      INSERT INTO public.patients (user_id)
      VALUES (new.id);
    END IF;
  END IF;
  
  -- Always create marketplace profile for all users
  INSERT INTO public.marketplace_profiles (user_id, email, first_name, last_name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN user_role_value IN ('photographer', 'surfer') THEN user_role_value
      ELSE 'surfer'  -- Default marketplace role for medical users
    END,
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  
  RETURN new;
END;
$$;