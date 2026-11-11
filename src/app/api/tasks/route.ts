import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    let query = supabase
      .from("tasks")
      .select(`
        id,
        ticket_code,
        title,
        description,
        priority,
        status,
        deadline_at,
        created_at,
        channel:channels(name),
        department:departments(name),
        assignee:users!tasks_assigned_to_fkey(nik, nama, role, position_title),
        reviewer:users!tasks_reviewer_id_fkey(nama, role)
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    const { data: tasks, error } = await query;

    if (error) {
      throw error;
    }

    // Hitung ringkasan statistik tasks secara live
    const total = tasks?.length || 0;
    const completed = tasks?.filter((t) => t.status === "done").length || 0;
    const inProgress = tasks?.filter((t) => t.status === "in_progress").length || 0;
    const pendingReview = tasks?.filter((t) => t.status === "review").length || 0;
    const urgentCount = tasks?.filter((t) => t.priority === "urgent" && t.status !== "done").length || 0;

    return NextResponse.json({
      success: true,
      message: "Data tugas berhasil diambil dari Supabase Database.",
      meta: {
        total_tasks: total,
        completed_tasks: completed,
        in_progress_tasks: inProgress,
        pending_review: pendingReview,
        urgent_active: urgentCount,
      },
      data: tasks || [],
    });
  } catch (error: any) {
    console.error("API Tasks Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred while retrieving tasks.",
      },
      { status: 500 }
    );
  }
}

