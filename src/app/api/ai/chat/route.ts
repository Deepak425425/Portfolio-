import { NextResponse } from 'next/server';
import { GrotonAIAdapter } from '@/lib/ai/adapter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate a brief network latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    // Internal developer note:
    console.log("[GROTON AI] Backend Status: NOT CONNECTED");
    
    // Route the request through the provider adapter abstraction
    const adapter = new GrotonAIAdapter();
    const response = await adapter.generateChatResponse({
       messages: body.messages,
       conversationId: body.conversationId
    });

    // If the adapter explicitly flags an error or offline state
    if (response.error) {
      return NextResponse.json(
        { message: response.message },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ message: response.message }, { status: 200 });
    
  } catch (error) {
    console.error("[GROTON AI API ERROR]", error);
    return NextResponse.json({ message: "An unknown server error occurred." }, { status: 500 });
  }
}
