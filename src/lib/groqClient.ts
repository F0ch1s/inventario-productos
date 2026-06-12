const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Stream a chat completion from GROQ API using GPT-OSS-120B.
 * Uses Server-Sent Events (SSE) for real-time streaming.
 */
export async function streamChat(
  messages: GroqMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
): Promise<void> {
  const apiKey = import.meta.env.PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    onError('API key de GROQ no configurada. Agrega PUBLIC_GROQ_API_KEY en .env.local');
    return;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      onError(`Error de GROQ (${response.status}): ${errorData}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No se pudo iniciar el streaming');
      return;
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6); // Remove 'data: ' prefix
        if (data === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }

    onDone();
  } catch (error) {
    onError(`Error de conexión: ${error instanceof Error ? error.message : 'desconocido'}`);
  }
}
