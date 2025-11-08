import { openai } from "@ai-sdk/openai";
import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { businessInputSchema } from "@/lib/schemas";
import { generateAnalysisPrompt } from "@/lib/analysis-prompts";
import { AIAnalysisContent } from "@/lib/database.types";

// Comprehensive JSON schema for AI business analysis
const businessAnalysisSchema = {
  type: "object",
  properties: {
    business_viability_score: {
      type: "number",
      minimum: 0,
      maximum: 100,
      description: "Overall viability score from 0-100"
    },
    executive_summary: {
      type: "object",
      properties: {
        overall_assessment: { type: "string" },
        key_strengths: { type: "array", items: { type: "string" } },
        main_challenges: { type: "array", items: { type: "string" } },
        success_probability: { type: "string" }
      },
      required: ["overall_assessment", "key_strengths", "main_challenges", "success_probability"]
    },
    market_overview: {
      type: "object",
      properties: {
        market_size: { type: "string" },
        market_growth_rate: { type: "string" },
        current_trends: { type: "array", items: { type: "string" } },
        market_opportunities: { type: "array", items: { type: "string" } },
        target_market_segment: { type: "string" }
      },
      required: ["market_size", "market_growth_rate", "current_trends", "market_opportunities", "target_market_segment"]
    },
    competitor_analysis: {
      type: "object",
      properties: {
        competitive_landscape: { type: "string" },
        top_competitors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              market_position: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              estimated_revenue: { type: "string" }
            },
            required: ["name", "market_position", "strengths", "weaknesses", "estimated_revenue"]
          }
        },
        competitive_advantages: { type: "array", items: { type: "string" } },
        market_differentiation: { type: "string" }
      },
      required: ["competitive_landscape", "top_competitors", "competitive_advantages", "market_differentiation"]
    },
    monetization_strategy: {
      type: "object",
      properties: {
        primary_revenue_streams: { type: "array", items: { type: "string" } },
        pricing_strategy: { type: "string" },
        revenue_model: { type: "string" },
        financial_projections: {
          type: "object",
          properties: {
            year1_revenue: { type: "number" },
            year3_revenue: { type: "number" },
            year5_revenue: { type: "number" },
            profit_margins: { type: "string" },
            break_even_timeline: { type: "string" }
          },
          required: ["year1_revenue", "year3_revenue", "year5_revenue", "profit_margins", "break_even_timeline"]
        }
      },
      required: ["primary_revenue_streams", "pricing_strategy", "revenue_model", "financial_projections"]
    },
    mvp_roadmap: {
      type: "object",
      properties: {
        phase1_mvp: {
          type: "object",
          properties: {
            timeline: { type: "string" },
            features: { type: "array", items: { type: "string" } },
            budget_required: { type: "number" },
            key_milestones: { type: "array", items: { type: "string" } }
          },
          required: ["timeline", "features", "budget_required", "key_milestones"]
        },
        phase2_growth: {
          type: "object",
          properties: {
            timeline: { type: "string" },
            features: { type: "array", items: { type: "string" } },
            budget_required: { type: "number" },
            key_milestones: { type: "array", items: { type: "string" } }
          },
          required: ["timeline", "features", "budget_required", "key_milestones"]
        },
        phase3_scale: {
          type: "object",
          properties: {
            timeline: { type: "string" },
            features: { type: "array", items: { type: "string" } },
            budget_required: { type: "number" },
            key_milestones: { type: "array", items: { type: "string" } }
          },
          required: ["timeline", "features", "budget_required", "key_milestones"]
        }
      },
      required: ["phase1_mvp", "phase2_growth", "phase3_scale"]
    },
    potential_risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          risk_category: { type: "string" },
          risk_description: { type: "string" },
          probability_level: { type: "string", enum: ["low", "medium", "high"] },
          impact_level: { type: "string", enum: ["low", "medium", "high"] },
          mitigation_strategies: { type: "array", items: { type: "string" } }
        },
        required: ["risk_category", "risk_description", "probability_level", "impact_level", "mitigation_strategies"]
      }
    },
    regulatory_compliance: {
      type: "object",
      properties: {
        required_licenses: { type: "array", items: { type: "string" } },
        legal_considerations: { type: "array", items: { type: "string" } },
        compliance_costs: { type: "string" },
        regulatory_risks: { type: "array", items: { type: "string" } }
      },
      required: ["required_licenses", "legal_considerations", "compliance_costs", "regulatory_risks"]
    },
    marketing_strategy: {
      type: "object",
      properties: {
        target_audience: { type: "array", items: { type: "string" } },
        value_proposition: { type: "string" },
        marketing_channels: { type: "array", items: { type: "string" } },
        customer_acquisition_strategy: { type: "string" },
        marketing_budget_allocation: {
          type: "object",
          properties: {
            digital_marketing: { type: "number" },
            content_marketing: { type: "number" },
            traditional_marketing: { type: "number" },
            events_promotions: { type: "number" }
          },
          required: ["digital_marketing", "content_marketing", "traditional_marketing", "events_promotions"]
        }
      },
      required: ["target_audience", "value_proposition", "marketing_channels", "customer_acquisition_strategy", "marketing_budget_allocation"]
    },
    operational_requirements: {
      type: "object",
      properties: {
        team_structure: {
          type: "object",
          properties: {
            initial_team_size: { type: "number" },
            key_roles_needed: { type: "array", items: { type: "string" } },
            hiring_timeline: { type: "string" }
          },
          required: ["initial_team_size", "key_roles_needed", "hiring_timeline"]
        },
        technology_requirements: { type: "array", items: { type: "string" } },
        physical_infrastructure: { type: "array", items: { type: "string" } },
        operational_processes: { type: "array", items: { type: "string" } }
      },
      required: ["team_structure", "technology_requirements", "physical_infrastructure", "operational_processes"]
    },
    financial_requirements: {
      type: "object",
      properties: {
        startup_costs: {
          type: "object",
          properties: {
            equipment: { type: "number" },
            technology: { type: "number" },
            marketing: { type: "number" },
            legal: { type: "number" },
            operations: { type: "number" },
            contingency: { type: "number" }
          },
          required: ["equipment", "technology", "marketing", "legal", "operations", "contingency"]
        },
        monthly_operational_costs: {
          type: "object",
          properties: {
            salaries: { type: "number" },
            rent: { type: "number" },
            utilities: { type: "number" },
            marketing: { type: "number" },
            software: { type: "number" },
            other_expenses: { type: "number" }
          },
          required: ["salaries", "rent", "utilities", "marketing", "software", "other_expenses"]
        },
        funding_requirements: { type: "string" },
        break_even_analysis: { type: "string" }
      },
      required: ["startup_costs", "monthly_operational_costs", "funding_requirements", "break_even_analysis"]
    },
    success_metrics: {
      type: "object",
      properties: {
        key_performance_indicators: { type: "array", items: { type: "string" } },
        success_timeline: { type: "string" },
        measurement_methods: { type: "array", items: { type: "string" } }
      },
      required: ["key_performance_indicators", "success_timeline", "measurement_methods"]
    },
    recommendations: {
      type: "object",
      properties: {
        immediate_actions: { type: "array", items: { type: "string" } },
        short_term_priorities: { type: "array", items: { type: "string" } },
        long_term_strategies: { type: "array", items: { type: "string" } },
        critical_success_factors: { type: "array", items: { type: "string" } }
      },
      required: ["immediate_actions", "short_term_priorities", "long_term_strategies", "critical_success_factors"]
    }
  },
  required: [
    "business_viability_score",
    "executive_summary",
    "market_overview",
    "competitor_analysis",
    "monetization_strategy",
    "mvp_roadmap",
    "potential_risks",
    "regulatory_compliance",
    "marketing_strategy",
    "operational_requirements",
    "financial_requirements",
    "success_metrics",
    "recommendations"
  ]
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to access this feature" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = businessInputSchema.parse(body);

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Get user details and check subscription
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_status, credits_remaining')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User profile not found. Please complete your profile first." },
        { status: 404 }
      );
    }

    // Check credits for free users
    if (userData.subscription_status === 'free' && userData.credits_remaining < 1) {
      return NextResponse.json(
        {
          error: "Insufficient credits. Upgrade to premium or purchase more credits to continue.",
          code: "INSUFFICIENT_CREDITS"
        },
        { status: 402 }
      );
    }

    // Start database transaction
    const { data: businessInput, error: inputError } = await supabase
      .from('business_inputs')
      .insert({
        user_id: userId,
        business_name: validatedData.business_name,
        business_type: validatedData.business_type,
        budget: validatedData.budget,
        location: validatedData.location,
        other_criteria: validatedData.other_criteria || {}
      })
      .select()
      .single();

    if (inputError || !businessInput) {
      console.error("Error creating business input:", inputError);
      return NextResponse.json(
        { error: "Failed to save business input data" },
        { status: 500 }
      );
    }

    // Create initial analysis report record
    const { data: report, error: reportError } = await supabase
      .from('analysis_reports')
      .insert({
        input_id: businessInput.id,
        user_id: userId,
        status: 'processing'
      })
      .select()
      .single();

    if (reportError || !report) {
      console.error("Error creating analysis report:", reportError);
      return NextResponse.json(
        { error: "Failed to initialize analysis report" },
        { status: 500 }
      );
    }

    // Generate the comprehensive analysis prompt
    const analysisPrompt = generateAnalysisPrompt(validatedData);

    // Call OpenAI API with structured JSON output
    let aiContent: AIAnalysisContent;
    try {
      const response = await openai("gpt-4o").doGenerate({
        prompt: analysisPrompt,
        temperature: 0.3,
        maxTokens: 4000,
        responseFormat: {
          type: "json_schema",
          jsonSchema: {
            name: "business_analysis",
            schema: businessAnalysisSchema
          }
        }
      });

      const content = response.text;
      aiContent = JSON.parse(content);

      // Validate the response structure
      if (!aiContent.business_viability_score || !aiContent.executive_summary) {
        throw new Error("Invalid AI response structure");
      }

    } catch (aiError) {
      console.error("OpenAI API error:", aiError);

      // Update report with error status
      await supabase
        .from('analysis_reports')
        .update({
          status: 'failed',
          error_message: aiError instanceof Error ? aiError.message : 'Unknown AI processing error',
          completed_at: new Date().toISOString()
        })
        .eq('id', report.id);

      return NextResponse.json(
        {
          error: "AI analysis failed. Please try again later.",
          details: aiError instanceof Error ? aiError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    // Update report with AI-generated content
    const newStatus = userData.subscription_status === 'premium' ? 'pending_expert_review' : 'ai_completed';

    const { error: updateError } = await supabase
      .from('analysis_reports')
      .update({
        ai_content: JSON.stringify(aiContent),
        business_viability_score: aiContent.business_viability_score,
        status: newStatus,
        processing_time_seconds: processingTime,
        generated_at: new Date().toISOString(),
        completed_at: newStatus === 'ai_completed' ? new Date().toISOString() : null
      })
      .eq('id', report.id);

    if (updateError) {
      console.error("Error updating analysis report:", updateError);
      return NextResponse.json(
        { error: "Failed to save analysis results" },
        { status: 500 }
      );
    }

    // Deduct credits for free users
    if (userData.subscription_status === 'free') {
      const { error: creditError } = await supabase.rpc('deduct_credits_for_report', {
        p_user_id: userId
      });

      if (creditError) {
        console.error("Error deducting credits:", creditError);
        // Don't fail the request, but log the error
      }
    }

    return NextResponse.json({
      success: true,
      report_id: report.id,
      status: newStatus,
      business_viability_score: aiContent.business_viability_score,
      message: userData.subscription_status === 'premium'
        ? "Your AI business analysis is complete and is now pending expert review."
        : "Your AI business analysis is complete!",
      processing_time_seconds: processingTime,
      next_steps: userData.subscription_status === 'premium'
        ? "You will receive a notification when expert review is complete."
        : "You can view your detailed analysis report now."
    });

  } catch (error) {
    console.error("Business analysis API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing your business analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query = supabase
      .from('analysis_reports')
      .select(`
        *,
        business_input:business_inputs (
          business_name,
          business_type,
          budget,
          location,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error("Error fetching reports:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reports: reports || []
    });

  } catch (error) {
    console.error("GET reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}