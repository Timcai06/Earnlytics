import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score, url, timestamp } = body;

    if (score === undefined || score < 0 || score > 10) {
      return NextResponse.json(
        { error: "Invalid NPS score" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("nps_surveys").insert({
      score,
      page_url: url,
      created_at: timestamp,
    });

    if (error) {
      console.error("Failed to save NPS:", error);
      return NextResponse.json(
        { error: "Failed to save NPS" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("NPS API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
