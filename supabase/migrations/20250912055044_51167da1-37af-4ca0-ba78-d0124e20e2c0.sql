-- 1) Safely reset trigger to avoid inserts during table recreation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2) Drop and recreate marketplace_profiles with a clean schema
DROP TABLE IF EXISTS public.marketplace_profiles CASCADE;

CREATE TABLE public.marketplace_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  location text,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL DEFAULT 'surfer',
  phone text,
  bio text,
  profile_image_url text,
  CONSTRAINT marketplace_profiles_user_id_key UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.marketplace_profiles ENABLE ROW LEVEL SECURITY;

-- 3) Recreate RLS policies
-- Anyone can view photographer profiles
CREATE POLICY "Anyone can view photographer profiles"
ON public.marketplace_profiles
FOR SELECT
USING (role = 'photographer');

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.marketplace_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.marketplace_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.marketplace_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- 4) Maintain updated_at automatically
CREATE TRIGGER update_marketplace_profiles_updated_at
BEFORE UPDATE ON public.marketplace_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Recreate auth.users trigger to create marketplace profile on signup
-- Ensure the function exists (as per previous migration/context): public.handle_marketplace_user_signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_marketplace_user_signup();
