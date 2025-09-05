-- Action Aerials Marketplace Database Schema

-- Create enums for user roles and order status
CREATE TYPE public.user_role AS ENUM ('photographer', 'surfer');
CREATE TYPE public.order_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
CREATE TYPE public.print_type AS ENUM ('matte_paper', 'canvas', 'metal', 'acrylic');

-- Create marketplace_profiles table (separate from existing profiles)
CREATE TABLE public.marketplace_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'surfer',
  phone TEXT,
  bio TEXT,
  profile_image_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photos table
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photographer_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  date_taken TIMESTAMP WITH TIME ZONE NOT NULL,
  digital_price INTEGER NOT NULL, -- Price in cents
  tags JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create print_options table
CREATE TABLE public.print_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type print_type NOT NULL,
  width_inches INTEGER NOT NULL,
  height_inches INTEGER NOT NULL,
  price INTEGER NOT NULL, -- Price in cents
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  total_amount INTEGER NOT NULL, -- Total in cents
  status order_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  photo_id UUID NOT NULL,
  item_type TEXT NOT NULL, -- 'digital' or 'print'
  print_option_id UUID, -- Only for print items
  price INTEGER NOT NULL, -- Price in cents
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photographer_payouts table
CREATE TABLE public.photographer_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photographer_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  status TEXT DEFAULT 'pending',
  stripe_transfer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_profiles
CREATE POLICY "Users can view their own profile" 
ON public.marketplace_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.marketplace_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.marketplace_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view photographer profiles" 
ON public.marketplace_profiles 
FOR SELECT 
USING (role = 'photographer');

-- RLS Policies for photos
CREATE POLICY "Anyone can view active photos" 
ON public.photos 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Photographers can manage their own photos" 
ON public.photos 
FOR ALL 
USING (auth.uid() = photographer_id);

-- RLS Policies for print_options
CREATE POLICY "Anyone can view active print options" 
ON public.print_options 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = customer_id);

-- RLS Policies for order_items
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE id = order_items.order_id 
  AND customer_id = auth.uid()
));

CREATE POLICY "Users can create order items for their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE id = order_items.order_id 
  AND customer_id = auth.uid()
));

-- RLS Policies for photographer_payouts
CREATE POLICY "Photographers can view their own payouts" 
ON public.photographer_payouts 
FOR SELECT 
USING (auth.uid() = photographer_id);

-- Add foreign key constraints
ALTER TABLE public.photos ADD CONSTRAINT fk_photos_photographer 
FOREIGN KEY (photographer_id) REFERENCES public.marketplace_profiles(user_id);

ALTER TABLE public.orders ADD CONSTRAINT fk_orders_customer 
FOREIGN KEY (customer_id) REFERENCES public.marketplace_profiles(user_id);

ALTER TABLE public.order_items ADD CONSTRAINT fk_order_items_order 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_items ADD CONSTRAINT fk_order_items_photo 
FOREIGN KEY (photo_id) REFERENCES public.photos(id);

ALTER TABLE public.order_items ADD CONSTRAINT fk_order_items_print_option 
FOREIGN KEY (print_option_id) REFERENCES public.print_options(id);

ALTER TABLE public.photographer_payouts ADD CONSTRAINT fk_payouts_photographer 
FOREIGN KEY (photographer_id) REFERENCES public.marketplace_profiles(user_id);

-- Create trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_marketplace_profiles_updated_at
  BEFORE UPDATE ON public.marketplace_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default print options
INSERT INTO public.print_options (name, type, width_inches, height_inches, price, description) VALUES
  ('8x10 Matte Print', 'matte_paper', 8, 10, 2500, 'Professional matte finish on premium paper'),
  ('11x14 Matte Print', 'matte_paper', 11, 14, 3500, 'Large format matte print'),
  ('16x20 Canvas Print', 'canvas', 16, 20, 7500, 'Gallery-wrapped canvas print ready to hang'),
  ('12x18 Metal Print', 'metal', 12, 18, 12500, 'Stunning metal print with vibrant colors'),
  ('16x24 Acrylic Print', 'acrylic', 16, 24, 15000, 'Premium acrylic print with incredible depth');