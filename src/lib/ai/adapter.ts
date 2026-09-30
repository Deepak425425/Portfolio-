import { Message } from './types';

export interface AIProviderConfig {
  apiUrl?: string;
  apiKey?: string;
}

export interface ChatAdapterRequest {
  messages: Message[];
  conversationId?: string;
  stream?: boolean;
}

export interface ChatAdapterResponse {
  message: string;
  error?: boolean;
  status?: number;
}

/**
 * GrotonAIAdapter abstracts the connection to the future self-hosted GPU server.
 * 
 * Environment configuration required:
 * - GROTON_AI_API_URL
 * - GROTON_AI_API_KEY (optional, depending on internal security)
 */
export class GrotonAIAdapter {
  private config: AIProviderConfig;

  constructor(config?: AIProviderConfig) {
    this.config = {
      apiUrl: config?.apiUrl || process.env.GROTON_AI_API_URL,
      apiKey: config?.apiKey || process.env.GROTON_AI_API_KEY,
    };
  }

  public async generateChatResponse(request: ChatAdapterRequest): Promise<ChatAdapterResponse> {
    // AI Backend Status: NOT CONNECTED
    // If we have no API URL configured, return the clean offline state.
    if (!this.config.apiUrl) {
      return {
        error: true,
        status: 503,
        message: "GROTON AI is currently offline.\n\nAI inference will be available once the GROTON AI server is connected."
      };
    }

    try {
      /* 
      // FUTURE IMPLEMENTATION CONTRACT 
      // This forwards the structured request to the open-source LLM server.
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const res = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: request.messages,
          stream: request.stream || false,
          conversationId: request.conversationId
        })
      });

      if (!res.ok) {
        return { error: true, status: res.status, message: "AI Backend reported an error." };
      }

      const data = await res.json();
      return { message: data.choices[0].message.content, error: false };
      */
      
      // Fallback if URL is defined but we're simulating offline
      return {
        error: true,
        status: 503,
        message: "GROTON AI is currently offline.\n\nAI inference will be available once the GROTON AI server is connected."
      };
    } catch (e) {
      console.error("[GROTON AI ADAPTER] Error:", e);
      return {
        error: true,
        status: 500,
        message: "GROTON AI encountered an internal connection error."
      };
    }
  }
}
