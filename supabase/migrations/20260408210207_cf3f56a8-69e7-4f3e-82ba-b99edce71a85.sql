
-- Add twitch_username to profiles
ALTER TABLE public.profiles ADD COLUMN twitch_username text;
CREATE UNIQUE INDEX idx_profiles_twitch_username ON public.profiles (twitch_username) WHERE twitch_username IS NOT NULL;

-- User points balance
CREATE TABLE public.user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points" ON public.user_points FOR SELECT USING (user_id = auth.uid());
-- No direct insert/update/delete by users - only via edge functions with service role

CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON public.user_points
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Point transactions log
CREATE TABLE public.point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.point_transactions FOR SELECT USING (user_id = auth.uid());

-- Shop items
CREATE TABLE public.shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  point_cost integer NOT NULL DEFAULT 0,
  stock integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shop items" ON public.shop_items FOR SELECT USING (is_active = true);

CREATE TRIGGER update_shop_items_updated_at BEFORE UPDATE ON public.shop_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Redemptions
CREATE TABLE public.redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  shop_item_id uuid NOT NULL REFERENCES public.shop_items(id),
  points_spent integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own redemptions" ON public.redemptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own redemptions" ON public.redemptions FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_redemptions_updated_at BEFORE UPDATE ON public.redemptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to atomically redeem points
CREATE OR REPLACE FUNCTION public.redeem_item(p_user_id uuid, p_item_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost integer;
  v_balance integer;
  v_stock integer;
  v_item_name text;
BEGIN
  -- Get item info
  SELECT point_cost, stock, name INTO v_cost, v_stock, v_item_name
  FROM shop_items WHERE id = p_item_id AND is_active = true;
  
  IF v_cost IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Item não encontrado');
  END IF;

  IF v_stock IS NOT NULL AND v_stock <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Item esgotado');
  END IF;

  -- Get user balance
  SELECT balance INTO v_balance FROM user_points WHERE user_id = p_user_id FOR UPDATE;
  
  IF v_balance IS NULL OR v_balance < v_cost THEN
    RETURN json_build_object('success', false, 'error', 'Pontos insuficientes');
  END IF;

  -- Deduct points
  UPDATE user_points SET balance = balance - v_cost WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO point_transactions (user_id, amount, reason, source)
  VALUES (p_user_id, -v_cost, 'Resgate: ' || v_item_name, 'redemption');
  
  -- Create redemption
  INSERT INTO redemptions (user_id, shop_item_id, points_spent)
  VALUES (p_user_id, p_item_id, v_cost);
  
  -- Decrease stock if applicable
  IF v_stock IS NOT NULL THEN
    UPDATE shop_items SET stock = stock - 1 WHERE id = p_item_id;
  END IF;

  RETURN json_build_object('success', true);
END;
$$;
