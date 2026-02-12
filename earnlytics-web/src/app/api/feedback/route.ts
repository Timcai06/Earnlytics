import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback, rating, category, url, userAgent, timestamp } = body;

    if (!feedback?.trim() && rating === 0) {
      return NextResponse.json(
        { error: "Feedback or rating is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("feedback").insert({
      feedback,
      rating,
      category: category || "other",
      page_url: url,
      user_agent: userAgent,
      created_at: timestamp,
      status: "pending",
    });

    if (error) {
      console.error("Failed to save feedback:", error);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
