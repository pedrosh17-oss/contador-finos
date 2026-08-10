import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { tema } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave GEMINI_API_KEY não configurada no ficheiro .env.local' },
        { status: 500 }
      );
    }

    const temaFinal = tema && tema.trim() !== '' ? tema.trim() : 'Cultura Geral e Cerveja';

    const prompt = `Gera exatamente 3 perguntas cómicas e desafiantes de escolha múltipla em Português de Portugal sobre o tema: "${temaFinal}".
Cada pergunta deve ter rigorosamente 4 opções de resposta e o índice numérico (0 a 3) da resposta correta.
Responde APENAS no seguinte formato JSON sem qualquer texto adicional:
[
  {
    "pergunta": "Texto da pergunta?",
    "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correta": 0
  }
]`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await res.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('Sem resposta válida da API do Gemini');
    }

    const perguntas = JSON.parse(textResponse);
    return NextResponse.json({ perguntas });
  } catch (err: any) {
    console.error('Erro na API de Trivia:', err);
    return NextResponse.json(
      { error: 'Erro ao gerar perguntas com IA', detalhe: err.message },
      { status: 500 }
    );
  }
}