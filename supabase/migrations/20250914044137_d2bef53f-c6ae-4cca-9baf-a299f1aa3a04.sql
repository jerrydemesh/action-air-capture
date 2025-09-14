-- SAFETY FIX for signup errors: add unique indexes required by ON CONFLICT in triggers, and install missing triggers
-- 1) Ensure unique index on marketplace_profiles.user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_profiles_user_id ON public.marketplace_profiles(user_id);

-- 2) Ensure unique index on profiles.user_id (used in handle_new_user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 3) Ensure unique index on patients.user_id (used in handle_new_user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- 4) Create/refresh trigger to auto-create profiles on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5) Keep updated_at in sync for marketplace_profiles
DROP TRIGGER IF EXISTS update_marketplace_profiles_updated_at ON public.marketplace_profiles;
CREATE TRIGGER update_marketplace_profiles_updated_at
  BEFORE UPDATE ON public.marketplace_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
