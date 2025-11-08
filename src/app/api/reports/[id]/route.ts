import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const reportId = params.id;
    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Fetch the report with related data
    const { data: report, error } = await supabase
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
          subscription_status
        )
      `)
      .eq('id', reportId)
      .single();

    if (error || !report) {
      console.error("Error fetching report:", error);
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this report
    // Users can view their own reports, experts can view reports assigned to them, admins can view all reports
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasPermission =
      report.user_id === userId || // Own report
      currentUser.role === 'admin' || // Admin can view all
      currentUser.role === 'expert'; // Experts can view (for review purposes)

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to view this report" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        ai_content: report.ai_content, // Include the AI-generated content
        expert_analysis_content: report.expert_analysis_content // Include expert analysis if available
      }
    });

  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while fetching the report",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const reportId = params.id;
    const body = await request.json();

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Get current user role
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Only experts and admins can update reports
    if (!['expert', 'admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "You don't have permission to update this report" },
        { status: 403 }
      );
    }

    // Validate update data
    const allowedFields = ['expert_analysis_content', 'status', 'expert_reviewed_at'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If adding expert analysis, set the review timestamp and status
    if (updateData.expert_analysis_content) {
      updateData.expert_reviewed_at = new Date().toISOString();
      if (updateData.status === 'pending_expert_review') {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }
    }

    // Update the report
    const { data: report, error } = await supabase
      .from('analysis_reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (error || !report) {
      console.error("Error updating report:", error);
      return NextResponse.json(
        { error: "Failed to update report" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
      message: "Report updated successfully"
    });

  } catch (error) {
    console.error("Report update error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while updating the report",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}