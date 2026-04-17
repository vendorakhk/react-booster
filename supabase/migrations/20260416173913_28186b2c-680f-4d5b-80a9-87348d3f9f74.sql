
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Create deposit_status enum
CREATE TYPE public.deposit_status AS ENUM ('pending', 'approved', 'rejected');

-- ==========================================
-- PROFILES TABLE
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USER ROLES TABLE
-- ==========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ORDERS TABLE
-- ==========================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_link TEXT NOT NULL,
  total_reactions INTEGER NOT NULL CHECK (total_reactions >= 10),
  reaction_config JSONB NOT NULL,
  cost NUMERIC(12,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  bot_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- DEPOSITS TABLE
-- ==========================================
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status deposit_status NOT NULL DEFAULT 'pending',
  transaction_hash TEXT,
  payment_provider TEXT DEFAULT 'manual',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PRICING TABLE
-- ==========================================
CREATE TABLE public.pricing (
  key TEXT PRIMARY KEY,
  value NUMERIC(12,4) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECKS
-- ==========================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ==========================================
-- RLS POLICIES: PROFILES
-- ==========================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- RLS POLICIES: USER ROLES
-- ==========================================
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can check own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: ORDERS
-- ==========================================
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- RLS POLICIES: DEPOSITS
-- ==========================================
CREATE POLICY "Users can view own deposits"
  ON public.deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deposits"
  ON public.deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposits"
  ON public.deposits FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all deposits"
  ON public.deposits FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- RLS POLICIES: PRICING
-- ==========================================
CREATE POLICY "Everyone can read pricing"
  ON public.pricing FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pricing"
  ON public.pricing FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- TRIGGER: Auto-create profile on signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- TRIGGER: Update timestamps
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at
  BEFORE UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- SEED: Default pricing
-- ==========================================
INSERT INTO public.pricing (key, value) VALUES ('price_per_reaction', 0.0100);
