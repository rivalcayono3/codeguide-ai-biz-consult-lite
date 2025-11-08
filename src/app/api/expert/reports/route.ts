import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Get current user role
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Check if user is expert or admin
    if (!['expert', 'admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "Access denied. Expert or admin role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query for reports that need expert review or have been reviewed
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
        ),
        user:users (
          full_name,
          email,
          subscription_status
        )
      `)
      .in('status', ['pending_expert_review', 'completed'])
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error("Error fetching expert reports:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      );
    }

    // Get statistics
    const { count: pendingCount } = await supabase
      .from('analysis_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_expert_review');

    const { count: completedCount } = await supabase
      .from('analysis_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .not('expert_analysis_content', 'is', null);

    return NextResponse.json({
      success: true,
      reports: reports || [],
      statistics: {
        pending_reviews: pendingCount || 0,
        completed_reviews: completedCount || 0,
        total_reports: (reports || []).length
      }
    });

  } catch (error) {
    console.error("Expert reports API error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while fetching reports",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}