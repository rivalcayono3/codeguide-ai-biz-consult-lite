-- AI Business Consultation Platform Database Schema
-- This migration creates the core tables for the business consultation platform
-- following the technical specification

-- 1. Users Table - extends Clerk authentication with subscription and role management
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'expert', 'admin')),
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  credits_remaining INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Business Criteria Input Table - stores user business input data
CREATE TABLE IF NOT EXISTS public.business_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  budget NUMERIC NOT NULL CHECK (budget >= 0),
  location TEXT NOT NULL,
  other_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Analysis Reports Table - stores AI-generated and expert-reviewed analysis
CREATE TABLE IF NOT EXISTS public.analysis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_id UUID NOT NULL REFERENCES public.business_inputs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Content fields
  ai_content TEXT, -- JSON result from OpenAI (40+ sections)
  expert_analysis_content TEXT, -- Manual analysis by business experts

  -- Status tracking
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ai_completed', 'pending_expert_review', 'completed', 'failed')),

  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT now(),
  expert_reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Additional metadata
  business_viability_score INTEGER CHECK (business_viability_score >= 0 AND business_viability_score <= 100),
  processing_time_seconds INTEGER,
  error_message TEXT
);

-- 4. Coaching Sessions Table - for premium user coaching sessions
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  report_id UUID REFERENCES public.analysis_reports(id) ON DELETE SET NULL,

  session_time TIMESTAMPTZ NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),

  -- Session details
  duration_minutes INTEGER DEFAULT 60,
  meeting_link TEXT,
  notes TEXT,
  recording_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Subscription Plans Table - for managing subscription tiers
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly NUMERIC,
  price_yearly NUMERIC,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. User Subscriptions Table - tracks user subscription history
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,

  -- Subscription details
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,

  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one active subscription per user
  UNIQUE(user_id, status) WHERE status = 'active'
);

-- 7. Credit Transactions Table - for credit-based billing
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Transaction details
  amount INTEGER NOT NULL, -- Positive for purchases, negative for usage
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT,

  -- References
  report_id UUID REFERENCES public.analysis_reports(id) ON DELETE SET NULL,
  payment_intent_id TEXT, -- Stripe payment intent ID

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own profile and admins can read all
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.jwt() ->> 'sub' = id::text);

CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile (except role and subscription status)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.jwt() ->> 'sub' = id::text);

-- RLS Policies for business_inputs table
-- Users can only access their own business inputs
CREATE POLICY "Users can read own business inputs" ON public.business_inputs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own business inputs" ON public.business_inputs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own business inputs" ON public.business_inputs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own business inputs" ON public.business_inputs
  FOR DELETE USING (user_id = auth.uid());

-- Experts and admins can read business inputs for review
CREATE POLICY "Experts can read business inputs for review" ON public.business_inputs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('expert', 'admin')
    )
  );

-- RLS Policies for analysis_reports table
-- Users can read their own reports
CREATE POLICY "Users can read own reports" ON public.analysis_reports
  FOR SELECT USING (user_id = auth.uid());

-- Experts and admins can read reports they need to review
CREATE POLICY "Experts can read reports for review" ON public.analysis_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('expert', 'admin')
    )
  );

-- Experts can update reports (add expert analysis)
CREATE POLICY "Experts can update reports" ON public.analysis_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('expert', 'admin')
    )
  );

-- System can insert reports (via API)
CREATE POLICY "System can insert reports" ON public.analysis_reports
  FOR INSERT WITH CHECK (true);

-- RLS Policies for coaching_sessions table
-- Users can read their own coaching sessions
CREATE POLICY "Users can read own coaching sessions" ON public.coaching_sessions
  FOR SELECT USING (user_id = auth.uid());

-- Experts can read sessions where they are the expert
CREATE POLICY "Experts can read assigned sessions" ON public.coaching_sessions
  FOR SELECT USING (expert_id = auth.uid());

-- Admins can read all coaching sessions
CREATE POLICY "Admins can read all coaching sessions" ON public.coaching_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can create coaching sessions (premium feature)
CREATE POLICY "Users can create coaching sessions" ON public.coaching_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Experts can update assigned sessions
CREATE POLICY "Experts can update assigned sessions" ON public.coaching_sessions
  FOR UPDATE USING (expert_id = auth.uid());

-- RLS Policies for subscription_plans table
-- Everyone can read active plans
CREATE POLICY "Everyone can read active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_subscriptions table
-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Admins can read all subscriptions
CREATE POLICY "Admins can read all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can manage subscriptions
CREATE POLICY "System can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (true);

-- RLS Policies for credit_transactions table
-- Users can read their own credit transactions
CREATE POLICY "Users can read own credit transactions" ON public.credit_transactions
  FOR SELECT USING (user_id = auth.uid());

-- Admins can read all credit transactions
CREATE POLICY "Admins can read all credit transactions" ON public.credit_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can manage credit transactions
CREATE POLICY "System can manage credit transactions" ON public.credit_transactions
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);

CREATE INDEX IF NOT EXISTS idx_business_inputs_user_id ON public.business_inputs(user_id);
CREATE INDEX IF NOT EXISTS idx_business_inputs_business_type ON public.business_inputs(business_type);
CREATE INDEX IF NOT EXISTS idx_business_inputs_created_at ON public.business_inputs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_reports_user_id ON public.analysis_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_input_id ON public.analysis_reports(input_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_status ON public.analysis_reports(status);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_created_at ON public.analysis_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_business_viability_score ON public.analysis_reports(business_viability_score);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON public.coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_expert_id ON public.coaching_sessions(expert_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_session_time ON public.coaching_sessions(session_time);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_status ON public.coaching_sessions(status);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_inputs_updated_at
  BEFORE UPDATE ON public.business_inputs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coaching_sessions_updated_at
  BEFORE UPDATE ON public.coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to sync Clerk user data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.first_name || ' ' || NEW.last_name)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for syncing Clerk users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features) VALUES
(
  'Free',
  'Basic AI business analysis with limited features',
  0,
  0,
  '{
    "ai_reports_per_month": 3,
    "expert_review": false,
    "coaching_sessions": 0,
    "report_history": 30,
    "priority_support": false
  }'::jsonb
),
(
  'Premium',
  'Full access with expert reviews and coaching',
  4900, -- $49.00 in cents
  49000, -- $490.00 in cents
  '{
    "ai_reports_per_month": "unlimited",
    "expert_review": true,
    "coaching_sessions": 4,
    "report_history": "unlimited",
    "priority_support": true
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Create function to get user credit balance
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT credits_remaining
      FROM public.users
      WHERE id = p_user_id
    ),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to deduct credits for report generation
CREATE OR REPLACE FUNCTION public.deduct_credits_for_report(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits_remaining INTO current_credits
  FROM public.users
  WHERE id = p_user_id;

  -- Check if user has enough credits (or is premium)
  IF current_credits < 1 THEN
    RETURN FALSE;
  END IF;

  -- Deduct one credit
  UPDATE public.users
  SET credits_remaining = credits_remaining - 1
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, balance_after, transaction_type, description
  ) VALUES (
    p_user_id,
    -1,
    current_credits - 1,
    'usage',
    'Business analysis report generation'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;