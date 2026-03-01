import { NextResponse } from "next/server";
import {
  applySessionCookies,
  resolveSessionFromRequest,
} from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const resolved = await resolveSessionFromRequest(request);

    if (resolved.error) {
      return NextResponse.json({ error: resolved.error }, { status: 500 });
    }

    if (!resolved.appUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: resolved.appUser.id,
        email: resolved.appUser.email,
        name: resolved.appUser.name,
      },
    });

    if (resolved.refreshed && resolved.session) {
      applySessionCookies(response, resolved.session);
    }

    return response;
  } catch (error) {
    console.error("GET /api/auth/session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
