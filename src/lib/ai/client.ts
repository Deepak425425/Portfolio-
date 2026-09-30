import { Message } from './types';

export interface ChatRequest {
  messages: Message[];
  signal?: AbortSignal;
}

export interface ChatResponse {
  message: string;
  error?: boolean;
}

/**
 * Sends a chat message to the GROTON AI API endpoint.
 * This function handles network request, parsing, and aborting.
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: request.messages }),
      signal: request.signal,
    });

    if (!response.ok) {
      if (response.status === 503) {
         const data = await response.json();
         return { message: data.message || "Service unavailable", error: true };
      }
      return { message: "A network error occurred while connecting to GROTON AI.", error: true };
    }

    const data = await response.json();
    return { message: data.message, error: false };
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { message: "Request cancelled.", error: true };
    }
    return { message: "GROTON AI is currently unreachable. Please check your connection.", error: true };
  }
}
