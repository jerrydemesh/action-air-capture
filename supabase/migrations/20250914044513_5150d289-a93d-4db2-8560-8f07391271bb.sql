-- WARNING: Destructive reset of public schema tables and recreation of schema for clean auth/signup
-- 0) Remove auth trigger to avoid firing during reset
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 1) Drop dependent functions first
DROP FUNCTION IF EXISTS public.handle_new_marketplace_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_marketplace_user_signup() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role) CASCADE;

-- 2) Drop tables (CASCADE to remove dependent objects)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.photos CASCADE;
DROP TABLE IF EXISTS public.print_options CASCADE;
DROP TABLE IF EXISTS public.photographer_payouts CASCADE;
DROP TABLE IF EXISTS public.marketplace_profiles CASCADE;
DROP TABLE IF EXISTS public.charting CASCADE;
DROP TABLE IF EXISTS public.insurance_claims CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3) Drop enums
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.print_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 4) Recreate enums
CREATE TYPE public.user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'fulfilled', 'cancelled');
CREATE TYPE public.print_type AS ENUM ('digital', 'canvas', 'metal', 'paper');

-- 5) Recreate tables
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.user_role NOT NULL DEFAULT 'patient',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text
);

CREATE UNIQUE INDEX idx_profiles_user_id ON public.profiles(user_id);

CREATE TABLE public.marketplace_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_name text NOT NULL,
  role text NOT NULL DEFAULT 'surfer',
  phone text,
  bio text,
  profile_image_url text,
  location text,
  email text NOT NULL,
  first_name text NOT NULL
);

CREATE UNIQUE INDEX idx_marketplace_profiles_user_id ON public.marketplace_profiles(user_id);

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date_of_birth date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  gender text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_history text,
  current_medications text,
  allergies text,
  insurance_provider text,
  insurance_policy_number text,
  insurance_group_number text
);

CREATE UNIQUE INDEX idx_patients_user_id ON public.patients(user_id);

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'scheduled',
  chief_complaint text,
  notes text
);

CREATE TABLE public.charting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  vitals jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  subjective text,
  objective text,
  assessment text,
  plan text,
  treatment_performed text,
  acupuncture_points text
);

CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL,
  latitude numeric,
  longitude numeric,
  date_taken timestamptz NOT NULL,
  digital_price integer NOT NULL,
  tags jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  image_url text NOT NULL,
  thumbnail_url text,
  title text,
  description text,
  location text NOT NULL
);

CREATE TABLE public.print_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.print_type NOT NULL,
  width_inches integer NOT NULL,
  height_inches integer NOT NULL,
  price integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  description text,
  name text NOT NULL
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  total_amount integer NOT NULL,
  status public.order_status DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  stripe_payment_intent_id text
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  photo_id uuid NOT NULL,
  print_option_id uuid,
  price integer NOT NULL,
  quantity integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  item_type text NOT NULL
);

CREATE TABLE public.photographer_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL,
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  status text DEFAULT 'pending',
  stripe_transfer_id text
);

CREATE TABLE public.insurance_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  claim_amount numeric NOT NULL,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  claim_number text,
  icd10_codes text[] NOT NULL,
  cpt_codes text[] NOT NULL,
  diagnosis text NOT NULL,
  treatment_description text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
);

-- 6) Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

-- 7) Functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(user_uuid uuid, check_role public.user_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid AND role = check_role
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_role_value TEXT;
BEGIN
  user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');

  IF user_role_value IN ('patient', 'doctor', 'admin') THEN
    INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      user_role_value::public.user_role
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      role = EXCLUDED.role,
      updated_at = now();

    IF user_role_value = 'patient' THEN
      INSERT INTO public.patients (user_id)
      VALUES (NEW.id)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;

  INSERT INTO public.marketplace_profiles (user_id, email, first_name, last_name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE WHEN user_role_value IN ('photographer', 'surfer') THEN user_role_value ELSE 'surfer' END,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- 8) Policies (match prior config)
-- profiles
CREATE POLICY "Doctors can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'doctor'::public.user_role) OR public.has_role(auth.uid(), 'admin'::public.user_role));
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

-- marketplace_profiles
CREATE POLICY "Anyone can view photographer profiles" ON public.marketplace_profiles
FOR SELECT USING (role = 'photographer');
CREATE POLICY "Users can insert their own profile" ON public.marketplace_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.marketplace_profiles
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own profile" ON public.marketplace_profiles
FOR SELECT USING (auth.uid() = user_id);

-- patients
CREATE POLICY "Doctors can view all patient data" ON public.patients
FOR ALL USING (public.has_role(auth.uid(), 'doctor'::public.user_role) OR public.has_role(auth.uid(), 'admin'::public.user_role));
CREATE POLICY "Patients can insert their own data" ON public.patients
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Patients can update their own data" ON public.patients
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Patients can view their own data" ON public.patients
FOR SELECT USING (auth.uid() = user_id);

-- appointments
CREATE POLICY "Doctors can view all appointments" ON public.appointments
FOR ALL USING (public.has_role(auth.uid(), 'doctor'::public.user_role) OR public.has_role(auth.uid(), 'admin'::public.user_role));
CREATE POLICY "Patients can create appointments" ON public.appointments
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Patients can view their own appointments" ON public.appointments
FOR SELECT USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid()));

-- charting
CREATE POLICY "Doctors can manage all charting" ON public.charting
FOR ALL USING (public.has_role(auth.uid(), 'doctor'::public.user_role) OR public.has_role(auth.uid(), 'admin'::public.user_role));

-- photos
CREATE POLICY "Anyone can view active photos" ON public.photos
FOR SELECT USING (is_active = true);
CREATE POLICY "Photographers can manage their own photos" ON public.photos
FOR ALL USING (auth.uid() = photographer_id);

-- print_options
CREATE POLICY "Anyone can view active print options" ON public.print_options
FOR SELECT USING (is_active = true);

-- orders
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update their own orders" ON public.orders
FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid() = customer_id);

-- order_items
CREATE POLICY "Users can create order items for their orders" ON public.order_items
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));
CREATE POLICY "Users can view their own order items" ON public.order_items
FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));

-- photographer_payouts
CREATE POLICY "Photographers can view their own payouts" ON public.photographer_payouts
FOR SELECT USING (auth.uid() = photographer_id);

-- insurance_claims
CREATE POLICY "Doctors can manage insurance claims" ON public.insurance_claims
FOR ALL USING (public.has_role(auth.uid(), 'doctor'::public.user_role) OR public.has_role(auth.uid(), 'admin'::public.user_role));
CREATE POLICY "Patients can view their own claims" ON public.insurance_claims
FOR SELECT USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = insurance_claims.patient_id AND p.user_id = auth.uid()));

-- 9) updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_charting_updated_at BEFORE UPDATE ON public.charting FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON public.photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketplace_profiles_updated_at BEFORE UPDATE ON public.marketplace_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10) Recreate auth trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
