import { NextRequest, NextResponse } from "next/server";
import {
  processChatMessage,
  processChatMessageStream,
  createConversation,
  saveMessage,
  getConversationHistory,
  extractSymbols,
  generateConversationTitle,
  getSuggestedQuestions,
  getQuickActions,
} from "@/lib/ai/assistant";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { applySessionCookies, resolveSessionFromRequest } from "@/lib/auth/session";

async function verifyConversationAccess(
  conversationId: string,
  authUserId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id, user_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  const ownerId =
    typeof (data as { user_id?: unknown }).user_id === "string"
      ? ((data as { user_id: string }).user_id || "")
      : "";

  return ownerId === authUserId;
}

function unauthorized() {
  return NextResponse.json({ error: "用户未登录" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "无权访问该会话" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const resolvedSession = await resolveSessionFromRequest(request);
    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }
    if (!resolvedSession.authUserId) {
      return unauthorized();
    }
    const authUserId = resolvedSession.authUserId;

    const body = await request.json();
    const { message, conversationId, symbol, stream } = body as {
      message?: string;
      conversationId?: string;
      symbol?: string;
      stream?: boolean;
    };
    const normalizedSymbol = typeof symbol === "string" && symbol.trim() ? symbol.trim() : undefined;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (conversationId) {
      const hasAccess = await verifyConversationAccess(conversationId, authUserId);
      if (!hasAccess) {
        return forbidden();
      }
    }

    if (stream) {
      const encoder = new TextEncoder();
      const streamResponse = new ReadableStream({
        async start(controller) {
          let currentConversationId = conversationId;

          try {
            if (!currentConversationId) {
              const title = generateConversationTitle(message);
              const mentionedSymbols = extractSymbols(message);
              const conversationSymbol = symbol || mentionedSymbols[0];

              currentConversationId = await createConversation(
                authUserId,
                undefined,
                conversationSymbol,
                title
              );

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "conversation", id: currentConversationId })}\n\n`
                )
              );
            }

            const history = await getConversationHistory(currentConversationId, 20);
            const conversationHistory = history.map((msg) => ({
              role: msg.role,
              content: msg.content,
            }));

            await saveMessage(currentConversationId, "user", message);

            await processChatMessageStream(message, normalizedSymbol, conversationHistory, {
              onSources: (sources) => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`)
                );
              },
              onContent: (content: string, isFinal: boolean) => {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "content", content, isFinal })}\n\n`
                  )
                );
              },
              onDone: async (fullContent: string, tokensUsed: number, processingTimeMs: number) => {
                await saveMessage(currentConversationId!, "assistant", fullContent, {
                  model: "deepseek-chat",
                  tokensUsed,
                  sources: [],
                  processingTimeMs,
                });

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "done", tokensUsed, processingTimeMs })}\n\n`
                  )
                );
                controller.close();
              },
              onError: (error: string) => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "error", error })}\n\n`)
                );
                controller.close();
              },
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`)
            );
            controller.close();
          }
        },
      });

      const response = new NextResponse(streamResponse, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });

      if (resolvedSession.refreshed && resolvedSession.session) {
        applySessionCookies(response, resolvedSession.session);
      }

      return response;
    }

    let currentConversationId = conversationId;
    let isNewConversation = false;

    if (!currentConversationId) {
      const title = generateConversationTitle(message);
      const mentionedSymbols = extractSymbols(message);
      const conversationSymbol = normalizedSymbol || mentionedSymbols[0];

      currentConversationId = await createConversation(
        authUserId,
        undefined,
        conversationSymbol,
        title
      );
      isNewConversation = true;
    }

    const history = await getConversationHistory(currentConversationId, 20);
    const conversationHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    await saveMessage(currentConversationId, "user", message);

    const aiResponse = await processChatMessage(message, normalizedSymbol, conversationHistory);

    await saveMessage(currentConversationId, "assistant", aiResponse.content, {
      model: "deepseek-chat",
      tokensUsed: aiResponse.tokensUsed,
      sources: aiResponse.sources,
      processingTimeMs: aiResponse.processingTimeMs,
    });

    const response = NextResponse.json({
      success: true,
      conversationId: currentConversationId,
      isNewConversation,
      response: {
        content: aiResponse.content,
        sources: aiResponse.sources,
        processingTimeMs: aiResponse.processingTimeMs,
      },
    });

    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }

    return response;
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process message", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const symbol = searchParams.get("symbol");
    const action = searchParams.get("action");

    if (action === "suggestions") {
      const suggestedQuestions = symbol ? getSuggestedQuestions(symbol) : getSuggestedQuestions("");
      const quickActions = getQuickActions(symbol || undefined);

      return NextResponse.json({
        success: true,
        suggestedQuestions,
        quickActions,
      });
    }

    const resolvedSession = await resolveSessionFromRequest(request);
    if (resolvedSession.error) {
      return NextResponse.json({ error: resolvedSession.error }, { status: 500 });
    }
    if (!resolvedSession.authUserId) {
      return unauthorized();
    }
    const authUserId = resolvedSession.authUserId;

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    const hasAccess = await verifyConversationAccess(conversationId, authUserId);
    if (!hasAccess) {
      return forbidden();
    }

    const history = await getConversationHistory(conversationId, 50);
    const response = NextResponse.json({
      success: true,
      messages: history.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        sources: msg.sources,
        createdAt: msg.createdAt,
      })),
    });

    if (resolvedSession.refreshed && resolvedSession.session) {
      applySessionCookies(response, resolvedSession.session);
    }

    return response;
  } catch (error) {
    console.error("Get history API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to get conversation history", details: errorMessage },
      { status: 500 }
    );
  }
}
