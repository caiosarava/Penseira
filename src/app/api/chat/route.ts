import { NextRequest, NextResponse } from 'next/server';

function sanitizeApiKey(key?: string | null): string {
  if (!key) return '';
  return key.trim().replace(/^["']|["']$/g, '');
}

function parseErrorMessage(status: number, rawText: string): string {
  try {
    const parsed = JSON.parse(rawText);
    const errObj = Array.isArray(parsed) ? parsed[0]?.error : parsed?.error;
    const innerMsg = errObj?.message || '';

    if (status === 401 || errObj?.status === 'UNAUTHENTICATED' || innerMsg.includes('401') || innerMsg.includes('invalid authentication credentials')) {
      return 'Chave GEMINI_API_KEY não autorizada ou inválida (Erro 401). Verifique se a chave de API foi copiada corretamente do Google AI Studio (https://aistudio.google.com/app/apikey).';
    }

    if (status === 429 || errObj?.status === 'RESOURCE_EXHAUSTED' || innerMsg.includes('quota') || innerMsg.includes('429')) {
      return 'Limite de requisições excedido para a chave da API Gemini (Erro 429). Aguarde alguns instantes e tente novamente.';
    }

    if (status === 400 || errObj?.status === 'INVALID_ARGUMENT' || innerMsg.includes('API key not valid')) {
      return 'A chave de API fornecida não é válida. Verifique se digitou/configurou uma chave válida do Google AI Studio.';
    }

    if (innerMsg) {
      return `Erro na API Gemini (${status}): ${innerMsg}`;
    }
  } catch {
    // Return raw text without escaped JSON quotes if parsing fails
  }

  return `Erro na API Gemini (${status}). Por favor, verifique a chave GEMINI_API_KEY no Vercel ou nas configurações.`;
}

export async function POST(req: NextRequest) {
  try {
    const userCustomKey = req.headers.get('x-user-api-key');
    const apiKey = sanitizeApiKey(userCustomKey) || sanitizeApiKey(process.env.GEMINI_API_KEY);

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'A chave GEMINI_API_KEY não foi configurada. Defina a variável de ambiente no Vercel ou insira sua chave nas configurações do app.',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { messages = [], userName, lastTopics = [], selectedMentalModel } = body;

    // Build context-aware system instruction
    let systemInstruction = `Você é o Penseira, um assistente parceiro de reflexão (co-thinker). Sua missão é colocar o "chapéu de pensar" junto com o usuário para ajudá-lo a compreender melhor problemas, tomar decisões e expandir visões de mundo.

REGRAS DE CONVERSAÇÃO:
1. Idioma obrigatório: Português do Brasil (pt-BR).
2. Estilo de atuação:
   - Atue como um co-thinker / parceiro de pensamento.
   - Não forneça respostas genéricas e apressadas. Em vez disso, faça perguntas abertas, estimulantes e estruturadas.
   - Ajude a analisar as raízes do problema e expandir a perspectiva.
`;

    if (userName && userName.trim()) {
      systemInstruction += `\n3. O usuário se chama "${userName.trim()}". Cumprimente-o pelo nome e mantenha o tom pessoal e acolhedor.`;
    } else {
      systemInstruction += `\n3. Se ainda não souber o nome do usuário, apresente-se como Penseira e pergunte o nome dele naturalmente.`;
    }

    if (lastTopics && Array.isArray(lastTopics) && lastTopics.length > 0) {
      systemInstruction += `\n4. Tópicos anteriores discutidos com o usuário: ${lastTopics.join(', ')}. Ao iniciar, ofereça a opção de retomar algum desses temas ou iniciar um problema novo.`;
    }

    if (selectedMentalModel) {
      systemInstruction += `\n5. O usuário escolheu o Modelo Mental: "${selectedMentalModel}". Use os conceitos e lentes desta abordagem para direcionar suas perguntas e reflexões.`;
    } else {
      systemInstruction += `\n5. Aplique espontaneamente modelos mentais úteis (como 5 Porquês, Princípios Fundamentais / First Principles, Inversão, Causa Raiz, Matriz de Decisão) para estruturar o raciocínio.`;
    }

    // Format messages for Gemini API
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const fallbackModels = [preferredModel, 'gemini-2.0-flash', 'gemini-1.5-flash'];
    // Deduplicate candidate models
    const candidateModels = Array.from(new Set(fallbackModels));

    let geminiResponse: Response | null = null;
    let lastErrorText = '';

    for (const modelName of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: formattedContents,
          generationConfig: {
            temperature: 0.7,
          },
        }),
      });

      if (res.ok) {
        geminiResponse = res;
        break;
      } else {
        lastErrorText = await res.text();
        // If error is authentication/key issue (401/400), don't try other models
        if (res.status === 401 || res.status === 400) {
          const friendlyError = parseErrorMessage(res.status, lastErrorText);
          return NextResponse.json({ error: friendlyError }, { status: res.status });
        }
      }
    }

    if (!geminiResponse || !geminiResponse.body) {
      const friendlyError = parseErrorMessage(500, lastErrorText);
      return NextResponse.json({ error: friendlyError }, { status: 500 });
    }

    // Process SSE / JSON Chunk stream from Gemini REST endpoint
    const reader = geminiResponse.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Extract candidate texts from JSON chunks in Gemini stream
            // Response comes as JSON array or objects containing candidates[0].content.parts[0].text
            const textMatches = buffer.match(/"text":\s*"((?:[^"\\]|\\.)*)"/g);
            if (textMatches) {
              for (const match of textMatches) {
                try {
                  const extracted = JSON.parse(`{${match}}`).text;
                  if (extracted) {
                    controller.enqueue(encoder.encode(extracted));
                  }
                } catch {
                  // ignore partial regex parse errors
                }
              }
              // Clear processed text parts from buffer
              buffer = '';
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: any) {
    console.error('API /api/chat error:', error);
    const message = parseErrorMessage(500, error?.message || '');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
