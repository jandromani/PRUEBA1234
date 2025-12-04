import { randomUUID } from 'crypto';

interface LlmResponse<T> {
  content: T;
  raw: string;
}

export class LlmClient {
  private readonly endpoint: string;
  private readonly apiKey: string | undefined;

  constructor(endpoint = process.env.LLM_API_URL, apiKey = process.env.LLM_API_KEY) {
    this.endpoint = endpoint ?? '';
    this.apiKey = apiKey;
  }

  async generateStructuredJson<T>(prompt: string, fallback: T): Promise<LlmResponse<T>> {
    if (!this.endpoint || !this.apiKey) {
      return { content: fallback, raw: JSON.stringify(fallback, null, 2) };
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        id: randomUUID(),
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content:
              'You are a question generation model. Respond ONLY with JSON that matches the provided schema.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    const raw = await response.text();
    try {
      const parsed = JSON.parse(raw) as { choices?: { message?: { content?: string } }[] };
      const content = parsed.choices?.[0]?.message?.content;
      if (!content) {
        return { content: fallback, raw };
      }

      const jsonStart = content.indexOf('{');
      const jsonPayload = jsonStart >= 0 ? content.slice(jsonStart) : content;
      return { content: JSON.parse(jsonPayload) as T, raw };
    } catch (error) {
      console.warn('Failed to parse LLM response, using fallback', error);
      return { content: fallback, raw };
    }
  }
}
