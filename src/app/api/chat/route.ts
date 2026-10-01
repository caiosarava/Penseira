import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'A chave GEMINI_API_KEY não foi configurada no servidor. Configure a variável de ambiente GEMINI_API_KEY no Vercel.',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { messages = [], userName, lastTopics = [], selectedMentalModel } = body;

    const ai = new GoogleGenAI({ apiKey });

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
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }],
    }));

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
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
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao comunicar com o modelo de IA.' },
      { status: 500 }
    );
  }
}
