// Database types for the AI Business Consultation Platform
// These types correspond to the tables created in the migration

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'client' | 'expert' | 'admin';
  subscription_status: 'free' | 'premium';
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessInput {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  budget: number;
  location: string;
  other_criteria: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AnalysisReport {
  id: string;
  input_id: string;
  user_id: string;
  ai_content: string | null;
  expert_analysis_content: string | null;
  status: 'processing' | 'ai_completed' | 'pending_expert_review' | 'completed' | 'failed';
  generated_at: string;
  expert_reviewed_at: string | null;
  completed_at: string | null;
  business_viability_score: number | null;
  processing_time_seconds: number | null;
  error_message: string | null;
}

export interface CoachingSession {
  id: string;
  user_id: string;
  expert_id: string | null;
  report_id: string | null;
  session_time: string;
  topic: string;
  description: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  duration_minutes: number;
  meeting_link: string | null;
  notes: string | null;
  recording_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus';
  description: string | null;
  report_id: string | null;
  payment_intent_id: string | null;
  created_at: string;
}

// Extended types with relationships
export interface BusinessInputWithUser extends BusinessInput {
  user: Pick<User, 'id' | 'email' | 'full_name'>;
}

export interface AnalysisReportWithDetails extends AnalysisReport {
  business_input: BusinessInput;
  user: Pick<User, 'id' | 'email' | 'full_name' | 'subscription_status'>;
}

export interface CoachingSessionWithDetails extends CoachingSession {
  user: Pick<User, 'id' | 'email' | 'full_name'>;
  expert: Pick<User, 'id' | 'email' | 'full_name'> | null;
  report: Pick<AnalysisReport, 'id' | 'ai_content'> | null;
}

// AI Report Content Types (based on the JSON structure from OpenAI)
export interface AIAnalysisContent {
  business_viability_score: number;
  market_overview: {
    market_size: string;
    growth_rate: string;
    trends: string[];
    opportunities: string[];
  };
  competitor_analysis: {
    top_competitors: Array<{
      name: string;
      strengths: string[];
      weaknesses: string[];
      market_share: string;
    }>;
    competitive_advantage: string[];
  };
  monetization_strategy: {
    revenue_streams: string[];
    pricing_strategy: string;
    financial_projections: {
      year1: number;
      year3: number;
      year5: number;
    };
  };
  mvp_roadmap: {
    phase1: string[];
    phase2: string[];
    phase3: string[];
  };
  potential_risks: Array<{
    risk: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
  regulatory_compliance: string[];
  marketing_strategy: {
    target_audience: string[];
    channels: string[];
    budget_allocation: Record<string, number>;
  };
  operational_requirements: {
    team_size: number;
    key_roles: string[];
    technology_stack: string[];
    physical_infrastructure: string[];
  };
  financial_requirements: {
    startup_costs: Record<string, number>;
    monthly_operational_costs: Record<string, number>;
    break_even_point: string;
  };
  [key: string]: any; // Allow for additional sections
}

// API Request/Response Types
export interface BusinessAnalysisRequest {
  business_name: string;
  business_type: string;
  budget: number;
  location: string;
  other_criteria?: Record<string, any>;
}

export interface BusinessAnalysisResponse {
  id: string;
  status: string;
  message: string;
  estimated_time?: number;
}

export interface ReportViewResponse {
  report: AnalysisReportWithDetails;
  ai_content: AIAnalysisContent | null;
}